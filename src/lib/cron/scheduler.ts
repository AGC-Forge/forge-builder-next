/**
 * Cron Job Scheduler
 * Path: src/lib/cron/scheduler.ts
 *
 * Standalone cron runner for Ubuntu + Nginx + PM2 deployment.
 * This file is imported by src/instrumentation.ts on server startup.
 *
 * Each job is isolated — one failing job won't crash others.
 *
 * To add a new job: add a new cron.schedule() call in startCronJobs()
 * and export a helper function for the job logic.
 */

import type { ScheduledTask } from "node-cron";
import cron from "node-cron";
import { runExpireMemberships } from "@/actions/memberships";
import type { CronReport } from '@/types/telegram';
import { notifyCronJob } from '@/lib/telegram/notification';

const scheduledJobs: ScheduledTask[] = [];

export function startCronJobs(): void {
  console.log("[Cron] ════════════════════════════════");
  console.log("[Cron] Starting all scheduled jobs...");
  console.log("[Cron] ════════════════════════════════");

  // ── 1. Expire memberships ─────────────────────────────────
  // Daily at 00:00 WIB (17:00 UTC prev day) — adjust timezone as needed
  const expireJob = cron.schedule(
    "0 17 * * *",                 // 17:00 UTC = 00:00 WIB (UTC+7)
    async () => {
      const label = "[Cron] expire-memberships";
      console.log(`${label} Starting...`);

      const startTime = Date.now();
      const report: CronReport = {
        jobName: 'expire-memberships',
        status: 'success',
        result: {},
        errors: [],
        duration: 0,
        timestamp: new Date().toISOString(),
      };

      try {
        const result = await runExpireMemberships();
        console.log(
          `${label} Done — expired: ${result.expired}, errors: ${result.errors.length}`,
        );

        report.result = {
          expired: result.expired,
          errors: result.errors.length,
        };
        report.errors = result.errors;

        if (result.errors.length > 0) {
          console.error(`${label} Errors:`, result.errors);
          report.status = result.expired > 0 ? 'partial' : 'failed';
        }
      } catch (error) {
        report.status = 'failed';
        report.errors.push(error instanceof Error ? error.message : String(error));
        console.error(`${label} Uncaught error:`, error);
        // Do NOT rethrow — isolate this job's failure
      }
      report.duration = Date.now() - startTime;
      await notifyCronJob(report);
    },
    { timezone: "UTC" },
  );
  scheduledJobs.push(expireJob);
  console.log("[Cron] ✓ expire-memberships — daily at 00:00 WIB");

  // ── 2. Health check ping ──────────────────────────────────
  // Every 10 minutes — useful for uptime monitoring
  const healthJob = cron.schedule("*/10 * * * *", async () => {
    console.log(`[Cron] health-check — OK @ ${new Date().toISOString()}`);

    const startTime = Date.now();
    const report: CronReport = {
      jobName: 'health-check',
      status: 'success',
      result: {},
      errors: [],
      duration: 0,
      timestamp: new Date().toISOString(),
    };
    try {
      // Check database connection
      // const dbOk = await checkDatabase();

      report.result = {
        server: 'online',
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        uptime: `${Math.floor(process.uptime() / 3600)}h`,
      };
    } catch (error) {
      report.status = 'failed';
      report.errors.push(String(error));
    }

    report.duration = Date.now() - startTime;
    await notifyCronJob(report);


  }, {
    timezone: "UTC"
  });

  scheduledJobs.push(healthJob);
  console.log("[Cron] ✓ health-check — every 10 minutes");

  // ── 3. Clean expired page_analytics ──────────────────────
  // Weekly Sunday 03:00 UTC — remove analytics older than 90 days
  // to keep DB size manageable
  const cleanAnalyticsJob = cron.schedule(
    "0 3 * * 0",
    async () => {
      const label = "[Cron] clean-old-analytics";
      console.log(`${label} Starting...`);
      try {
        await cleanOldAnalytics();
        console.log(`${label} Done`);

      } catch (error) {
        console.error(`${label} Error:`, error);
      }
    },
    { timezone: "UTC" },
  );
  scheduledJobs.push(cleanAnalyticsJob);
  console.log("[Cron] ✓ clean-old-analytics — weekly Sunday 03:00 UTC");

  // ── Future jobs — add here ────────────────────────────────
  // Example:
  //
  // const dailyReportJob = cron.schedule("0 8 * * *", async () => {
  //   await sendDailyReport();
  // }, { timezone: "Asia/Jakarta" });
  // scheduledJobs.push(dailyReportJob);

  console.log("[Cron] ════════════════════════════════");
  console.log(`[Cron] All ${scheduledJobs.length} jobs started`);
  console.log("[Cron] ════════════════════════════════");

  // ── Graceful shutdown ─────────────────────────────────────
  // Stop all jobs when PM2 sends SIGTERM / SIGINT
  process.once("SIGTERM", async () => await stopCronJobs("SIGTERM"));
  process.once("SIGINT", async () => await stopCronJobs("SIGINT"));
}

export async function stopCronJobs(reason = "manual"): Promise<void> {
  console.log(`[Cron] Stopping all jobs (reason: ${reason})...`);
  for (const job of scheduledJobs) {
    try {
      job.stop();
    } catch { }
  }
  scheduledJobs.length = 0;

  const startTime = Date.now();
  const report: CronReport = {
    jobName: 'stop-all-jobs',
    status: 'success',
    result: {},
    errors: [],
    duration: 0,
    timestamp: new Date().toISOString(),
  };

  report.duration = Date.now() - startTime;
  await notifyCronJob(report);

  console.log("[Cron] All jobs stopped.");
}

// ── Job implementations ───────────────────────────────────────

async function cleanOldAnalytics(): Promise<void> {
  // Dynamic import to avoid circular deps at module load
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90); // 90 days ago

  const startTime = Date.now();
  const report: CronReport = {
    jobName: 'clean-old-analytics',
    status: 'success',
    result: {},
    errors: [],
    duration: 0,
    timestamp: new Date().toISOString(),
  };

  const { error, count } = await supabase
    .from("page_analytics")
    .delete({ count: "exact" })
    .lt("created_at", cutoff.toISOString());

  if (error) {
    report.result = {
      error: error instanceof Error ? error.message : String(error),
    };
    report.status = 'failed';
    report.errors.push(error instanceof Error ? error.message : String(error));

    report.duration = Date.now() - startTime;
    await notifyCronJob(report);

    throw error;
  }

  report.result = {
    count: count ?? 0,
  };
  report.status = 'success';
  report.duration = Date.now() - startTime;

  await notifyCronJob(report);

  console.log(`[Cron] clean-old-analytics — removed ${count ?? 0} rows`);
}