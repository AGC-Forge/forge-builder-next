import type { Metadata } from "next";
import { getDashboardStats } from "@/actions/users";
import { getAnalyticsSummary } from "@/actions/analytics";
import { AnalyticsOverview } from "@/components/dashboard/analytics/analytics-overview";
import { AnalyticsCharts } from "@/components/dashboard/analytics/analytics-charts";
import { TopPagesTable } from "@/components/dashboard/analytics/top-pages-table";
import { TopProductsTable } from "@/components/dashboard/analytics/top-products-table";
import { AnalyticsHeader } from "@/components/dashboard/analytics/analytics-header";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = Math.min(Math.max(Number(params.days ?? 30), 7), 90);

  const [statsRes, analyticsRes] = await Promise.all([
    getDashboardStats(),
    getAnalyticsSummary(days),
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const analytics = analyticsRes.success ? analyticsRes.data : null;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <AnalyticsHeader days={days} />
      <AnalyticsOverview stats={stats ?? null} />
      <AnalyticsCharts
        views={analytics?.views ?? []}
        clicks={analytics?.clicks ?? []}
        days={days}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopPagesTable pages={analytics?.topPages ?? []} />
        <TopProductsTable products={analytics?.topProducts ?? []} />
      </div>
    </div>
  );
}
