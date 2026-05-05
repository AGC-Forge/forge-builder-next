export async function register() {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_RUNTIME === 'nodejs') {
    // ✅ Dynamic import so it doesn't block startup
    import('./lib/cron/scheduler').then(({ startCronJobs }) => {
      console.log('[Cron] Starting cron jobs in background...');
      startCronJobs();
    }).catch((error) => {
      console.error('[Cron] Error starting cron jobs:', error);
    });
  } else {
    console.log('[Cron] Not running cron jobs in development environment.');
  }
}
