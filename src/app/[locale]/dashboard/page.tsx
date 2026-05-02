import type { Metadata } from "next";
import { MetricCards } from "@/components/dashboard/home/metric-cards";
import { PerformanceOverview } from "@/components/dashboard/home/performance-overview";
import { ProductOverviewCard } from "@/components/dashboard/home/product-overview";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <MetricCards />
      <PerformanceOverview />
      <ProductOverviewCard />
    </div>
  );
}
