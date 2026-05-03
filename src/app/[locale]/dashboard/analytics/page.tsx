import type { Metadata } from "next";
import { getDashboardStats } from "@/actions/users";
import { getAnalyticsSummary } from "@/actions/settings";
import { AnalyticsOverview } from "@/components/dashboard/analytics/analytics-overview";
import { AnalyticsCharts } from "@/components/dashboard/analytics/analytics-charts";
import { TopPagesTable } from "@/components/dashboard/analytics/top-pages-table";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const [statsRes, analyticsRes] = await Promise.all([
    getDashboardStats(),
    getAnalyticsSummary(30),
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const analytics = analyticsRes.success ? analyticsRes.data : null;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Track performance across all your landing pages (last 30 days).
        </p>
      </div>
      <AnalyticsOverview stats={stats ?? null} />
      <AnalyticsCharts
        views={analytics?.views ?? []}
        clicks={analytics?.clicks ?? []}
      />
      <TopPagesTable pages={analytics?.topPages ?? []} />
    </div>
  );
}
