import type { Metadata } from "next";
import { getActivityLogs } from "@/actions/activity-logs";
import { ActivityLogTable } from "@/components/dashboard/activity/activity-log-table";

export const metadata: Metadata = { title: "Activity Log" };

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; userId?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const result = await getActivityLogs({
    page,
    pageSize: 25,
    action: params.action,
    userId: params.userId,
  });

  const paginatedData = result.success ? result.data : null;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Activity Log</h1>
        <p className="text-muted-foreground text-sm">
          Track all user actions across the platform.
        </p>
      </div>

      <ActivityLogTable
        data={paginatedData?.data ?? []}
        count={paginatedData?.count ?? 0}
        page={page}
        pageCount={paginatedData?.pageCount ?? 1}
      />
    </div>
  );
}
