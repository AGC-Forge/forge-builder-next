import { type NextRequest, NextResponse } from "next/server";
import { runExpireMemberships } from "@/actions/memberships";

/**
 * Cron Job: Expire memberships
 * Schedule: Daily at 00:00 UTC
 *
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/expire-memberships",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 *
 * Set CRON_SECRET env var in Vercel dashboard.
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Cron] Running expire-memberships job...");

  const result = await runExpireMemberships();

  console.log(`[Cron] Expired ${result.expired} memberships. Errors: ${result.errors.length}`);

  return NextResponse.json({
    success: true,
    expired: result.expired,
    errors: result.errors,
    timestamp: new Date().toISOString(),
  });
}

/**
 * @description Test cron job manually
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runExpireMemberships();
  return NextResponse.json({ success: true, ...result });
}
