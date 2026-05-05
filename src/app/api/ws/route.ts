// https://mintlify.wiki/k0d13/next-ws/quickstart
import { type WebSocket as WSClient, type WebSocketServer } from 'ws';
import Redis from 'ioredis';

const pubClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
});

const subClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
});

const cacheClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
});

const localClients = new Map<string, WSClient>();

// Subscribe to the AI ​​responses channel
subClient.subscribe('ai:response', 'support:broadcast');

// Subscribe to the AI ​​responses channel
subClient.on('message', (channel, message) => {
  const data = JSON.parse(message);

  switch (channel) {
    case 'ai:response':
      // Send AI responses to specific users
      const targetClient = localClients.get(data.userId);
      if (targetClient?.readyState === targetClient?.OPEN) {
        targetClient?.send(JSON.stringify({
          type: 'ai_message',
          content: data.content,
          timestamp: data.timestamp,
        }));
      }
      break;

    case 'support:broadcast':
      // Broadcast to all online users in this instance
      localClients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({
            type: 'broadcast',
            content: data.content,
          }));
        }
      });
      break;
  }
});


export function GET() {
  const headers = new Headers();
  headers.set('Connection', 'Upgrade');
  headers.set('Upgrade', 'websocket');
  return new Response('Upgrade Required', { status: 426, headers });
}

export function UPGRADE(
  client: import('ws').WebSocket,
  server: import('ws').WebSocketServer
) {
  let userId: string | null = null;
  let sessionId: string | null = null;

  console.log(`[${new Date().toISOString()}] Client connected. Total local: ${server.clients.size}`);

  // Handle authentication on connection
  client.once('message', async (rawMessage) => {
    try {
      const authData = JSON.parse(rawMessage.toString());

      if (authData.type === 'auth' && authData.userId && authData.sessionId) {
        userId = authData.userId as string;
        sessionId = authData.sessionId as string;

        // Local client register
        localClients.set(userId, client);

        // Save the session to Redis cache
        await cacheClient.setex(
          `session:${sessionId}`,
          3600, // 1 hour TTL
          JSON.stringify({
            userId,
            instanceId: process.env.INSTANCE_ID || 'default',
            connectedAt: new Date().toISOString(),
          })
        );

        // Retrieve chat history from Redis
        const history = await cacheClient.lrange(
          `chat:history:${sessionId}`,
          0,
          49 // Last 50 messages
        );

        // Send confirmation + history to client
        client.send(JSON.stringify({
          type: 'auth_success',
          sessionId,
          history: history.map(h => JSON.parse(h)),
        }));

        // Broadcast online status
        pubClient.publish('support:broadcast', JSON.stringify({
          type: 'user_online',
          userId,
          timestamp: new Date().toISOString(),
        }));

        console.log(`[${new Date().toISOString()}] User ${userId} authenticated`);
      }
    } catch (error) {
      console.error('Auth error:', error);
      client.send(JSON.stringify({
        type: 'auth_error',
        message: 'Authentication failed',
      }));
    }
  });

  // Handle messages from users
  client.on('message', async (rawMessage) => {
    if (!userId || !sessionId) return;

    try {
      const message = JSON.parse(rawMessage.toString());

      // Save the message to history
      await cacheClient.rpush(
        `chat:history:${sessionId}`,
        JSON.stringify({
          ...message,
          userId,
          timestamp: new Date().toISOString(),
        })
      );

      // Trim history (keep last 100 messages)
      await cacheClient.ltrim(`chat:history:${sessionId}`, -100, -1);

      switch (message.type) {
        case 'user_message':
          // Save to queue for AI processing
          await cacheClient.rpush('ai:queue', JSON.stringify({
            userId,
            sessionId,
            content: message.content,
            timestamp: new Date().toISOString(),
          }));

          // Send acknowledgment
          client.send(JSON.stringify({
            type: 'message_ack',
            messageId: message.id || Date.now().toString(),
          }));
          break;

        case 'typing':
          // Broadcast typing indicator to agent (optional)
          pubClient.publish('support:typing', JSON.stringify({
            userId,
            sessionId,
          }));
          break;

        case 'ping':
          client.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  });

  // Cleanup when disconnected
  client.once('close', async () => {
    console.log(`[${new Date().toISOString()}] User ${userId || 'unknown'} disconnected`);

    if (userId) {
      localClients.delete(userId);

      // Delete session from cache
      if (sessionId) {
        await cacheClient.del(`session:${sessionId}`);
      }

      // Broadcast offline status
      pubClient.publish('support:broadcast', JSON.stringify({
        type: 'user_offline',
        userId,
        timestamp: new Date().toISOString(),
      }));
    }
  });
}
