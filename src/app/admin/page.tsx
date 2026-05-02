import type { Metadata } from "next";
// import { MetricCards } from "@/components/admin/metric-cards";
// import { PerformanceOverview } from "@/components/admin/performance-overview";
// import { SubscriberOverview } from "@/components/admin/subscriber-overview";

export const metadata: Metadata = { title: "Admin Dashboard" };
export default function AdminDashboardPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* <MetricCards />
      <PerformanceOverview />
      <SubscriberOverview /> */}
    </div>
  );
}
