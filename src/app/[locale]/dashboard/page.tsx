import type { Metadata } from "next";
import { getDashboardStats } from "@/actions/users";
import { getAnalyticsSummary } from "@/actions/settings";
import { getProducts } from "@/actions/products";
import { MetricCards } from "@/components/dashboard/home/metric-cards";
import { PerformanceOverview } from "@/components/dashboard/home/performance-overview";
import { ProductOverviewCard } from "@/components/dashboard/home/product-overview";
import type { DashboardStats } from "@/types/database";

export const metadata: Metadata = { title: "Dashboard" };

const EMPTY_STATS: DashboardStats = {
  total_products: 0,
  active_products: 0,
  total_landing_pages: 0,
  published_landing_pages: 0,
  total_views: 0,
  total_clicks: 0,
  total_users: 0,
  views_last_7d: 0,
  clicks_last_7d: 0,
};

export default async function AdminDashboardPage() {
  const [statsRes, analyticsRes, productsRes] = await Promise.all([
    getDashboardStats(),
    getAnalyticsSummary(30),
    getProducts({ page: 1, pageSize: 10 }),
  ]);

  const stats = statsRes.success && statsRes.data ? statsRes.data : EMPTY_STATS;
  const views = analyticsRes.success && analyticsRes.data ? analyticsRes.data.views : [];
  const clicks = analyticsRes.success && analyticsRes.data ? analyticsRes.data.clicks : [];
  const products = productsRes.success && productsRes.data ? productsRes.data.data : [];

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <MetricCards stats={stats} />
      <PerformanceOverview views={views} clicks={clicks} days={30} />
      <ProductOverviewCard products={products} />
    </div>
  );
}
