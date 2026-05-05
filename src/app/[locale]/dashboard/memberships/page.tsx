import type { Metadata } from "next";
import { getAllMemberships } from "@/actions/memberships";
import type { PlanType } from "@/lib/memberships/plans";
import { MembershipsTable } from "@/components/dashboard/memberships/memberships-table";

export const metadata: Metadata = { title: "Memberships" };

export default async function MembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; plan?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const planType = params.plan as PlanType | undefined;

  const result = await getAllMemberships({ page, planType });
  const data = result.success ? result.data : null;

  // Compute stats from data
  const allData = data?.data ?? [];
  const stats = {
    free: allData.filter((m) => m.plan_type === "free").length,
    starter: allData.filter((m) => m.plan_type === "starter").length,
    pro: allData.filter((m) => m.plan_type === "pro").length,
    enterprise: allData.filter((m) => m.plan_type === "enterprise").length,
  };

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Memberships</h1>
        <p className="text-muted-foreground text-sm">
          Manage user subscription plans and billing.
        </p>
      </div>
      <MembershipsTable data={allData} count={data?.count ?? 0} stats={stats} />
    </div>
  );
}
