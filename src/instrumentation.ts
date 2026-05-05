/**
 * Next.js Instrumentation Hook
 * Path: src/instrumentation.ts
 *
 * Runs once when the Next.js server starts.
 * Used to initialize background services:
 * - Cron jobs (expire memberships, cleanup, etc.)
 * - WebSocket server (if custom ws setup needed)
 *
 * IMPORTANT for PM2 cluster mode:
 * PM2 spawns multiple instances (workers). Without a guard,
 * cron jobs would run N times (once per worker).
 * We use PM2_INSTANCE_ID=0 to run cron only on the first worker.
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Only run on Node.js runtime (not Edge runtime)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // ── PM2 cluster mode guard ──────────────────────────────────
  // PM2 sets PM2_INSTANCE_ID for each worker (0, 1, 2, ...)
  // Only run cron on instance 0 (or in non-PM2 environments)
  const instanceId = process.env.PM2_INSTANCE_ID;
  const isMasterInstance = !instanceId || instanceId === "0";

  if (!isMasterInstance) {
    console.log(
      `[Instrumentation] Worker ${instanceId} — skipping cron (only runs on instance 0)`,
    );
    return;
  }

  // ── Only in production ──────────────────────────────────────
  // Skip in development to avoid issues with hot reload
  if (process.env.NODE_ENV === "production") {
    console.log("[Instrumentation] Production — starting background services...");

    const { telegram } = await import('@/lib/telegram/client');
    const isConnected = await telegram.testConnection();

    if (isConnected) {
      console.log('[Telegram] Bot connected successfully');
      await telegram.sendToCron('🚀 <b>Snapland server started</b>')
        .catch(err => console.error('Startup notification failed:', err));
    }

    // Start cron jobs
    import("./lib/cron/scheduler")
      .then(({ startCronJobs }) => {
        console.log("[Instrumentation] Starting cron scheduler...");
        startCronJobs();
      })
      .catch((error) => {
        console.error("[Instrumentation] Failed to start cron jobs:", error);
      });

  } else {
    console.log("[Instrumentation] Development — background services skipped.");
    console.log("[Instrumentation] Cron jobs will run in production only.");
  }
}

/**
 * Called when the instrumentation module is first loaded.
 * Use this for one-time setup that should happen before any requests.
 */
export const onRequestError = async (
  error: Error,
  request: { path: string; method: string },
  context: { routeType: string },
) => {
  // Optional: Send errors to monitoring service (Sentry, etc.)
  if (process.env.NODE_ENV === "production") {
    await Sentry.captureException(error, { extra: { request, context } });
  }
  console.error("[onRequestError]", {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
    error: error.message,
  });
};
