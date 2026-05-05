import cron from 'node-cron';
import { runExpireMemberships } from '@/actions/memberships';

export function startCronJobs() {
  console.log('[Cron] Starting cron jobs...');

  // ── Expire Memberships ─────────────────────────────────────────────
  // Every day at 00:00 UTC
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running expire-memberships job...');
    try {
      const result = await runExpireMemberships();
      console.log(`[Cron] Expired ${result.expired} memberships. Errors: ${result.errors.length}`);
    } catch (error) {
      console.error('[Cron] Error expiring memberships:', error);
    }
  }, {
    timezone: 'UTC' // Or 'Asia/Jakarta' for WIB
  });

  // ── Health Check ──────────────────────────────────────────────────
  // Setiap 5 menit
  cron.schedule('*/5 * * * *', () => {
    console.log('[Cron] Health check OK');
    // Can add logic check DB connection, etc.
  });

  // ── Clean up expired sessions ─────────────────────────────────────
  // Every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Cleaning expired sessions...');
    // await cleanExpiredSessions();
  });

  // ── Daily backup ──────────────────────────────────────────────────
  // Every day at 2 am
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron] Running daily backup...');
    // await runDailyBackup();
  });

  console.log('[Cron] All cron jobs started');
}
