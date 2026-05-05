import type {
  TelegramConfig,
  TelegramMessage,
  TelegramResponse
} from '@/types/telegram';


class TelegramClient {
  private static instance: TelegramClient;
  private config: TelegramConfig;
  private baseUrl: string;

  private constructor() {
    this.config = {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      chatIds: {
        cron: process.env.TELEGRAM_CHAT_ID_CRON || '',
        admin: process.env.TELEGRAM_CHAT_ID_ADMIN || '',
        alerts: process.env.TELEGRAM_CHAT_ID_ALERTS || '',
        reports: process.env.TELEGRAM_CHAT_ID_REPORTS || '',
      },
    };

    if (!this.config.botToken) {
      console.warn('[Telegram] Bot token not configured');
    }

    this.baseUrl = `https://api.telegram.org/bot${this.config.botToken}`;
  }

  static getInstance(): TelegramClient {
    if (!TelegramClient.instance) {
      TelegramClient.instance = new TelegramClient();
    }
    return TelegramClient.instance;
  }

  private async sendRequest(
    method: string,
    body: Record<string, any>
  ): Promise<TelegramResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json() as TelegramResponse;

      if (!data.ok) {
        console.error(`[Telegram] API Error (${method}):`, data.description);
      }

      return data;
    } catch (error) {
      console.error(`[Telegram] Network Error (${method}):`, error);
      return { ok: false, description: String(error) };
    }
  }

  /**
   * Send message to Telegram
   */
  async sendMessage({
    chatId,
    text,
    parseMode = 'HTML',
    disableNotification = false,
    replyMarkup,
  }: TelegramMessage): Promise<TelegramResponse> {
    // Limit message length (Telegram max: 4096 chars)
    const truncatedText = text.length > 4000
      ? text.substring(0, 4000) + '...\n\n<i>(Message truncated)</i>'
      : text;

    return this.sendRequest('sendMessage', {
      chat_id: chatId,
      text: truncatedText,
      parse_mode: parseMode,
      disable_notification: disableNotification,
      reply_markup: replyMarkup,
    });
  }

  /**
   * Send message to specific chat
   */
  async sendToCron(text: string, options?: Partial<TelegramMessage>) {
    if (!this.config.chatIds.cron) return;
    return this.sendMessage({
      chatId: this.config.chatIds.cron,
      text,
      ...options,
    });
  }

  async sendToAdmin(text: string, options?: Partial<TelegramMessage>) {
    if (!this.config.chatIds.admin) return;
    return this.sendMessage({
      chatId: this.config.chatIds.admin,
      text,
      ...options,
    });
  }

  async sendAlert(text: string, options?: Partial<TelegramMessage>) {
    if (!this.config.chatIds.alerts) return;
    return this.sendMessage({
      chatId: this.config.chatIds.alerts,
      text,
      disableNotification: false, // Alerts always notify
      ...options,
    });
  }

  /**
   * Test bot connection
   */
  async testConnection(): Promise<boolean> {
    const response = await this.sendRequest('getMe', {});
    if (response.ok) {
      console.log('[Telegram] Connected as:', response.result?.username);
      return true;
    }
    return false;
  }
}

export const telegram = TelegramClient.getInstance();