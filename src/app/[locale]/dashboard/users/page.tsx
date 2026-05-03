import type { Metadata } from "next";
import { getUsers } from "@/actions/users";
import { UsersTable } from "@/components/dashboard/users/users-table";
import { InviteUserDialog } from "@/components/dashboard/users/invite-user-dialog";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const search = params.search;
  const role = params.role;
  const isActive =
    params.status === "active"
      ? true
      : params.status === "inactive"
        ? false
        : undefined;

  const result = await getUsers({ page, search, role, isActive });
  const paginatedData = result.success ? result.data : null;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground text-sm">
            Manage member accounts and access.
          </p>
        </div>
        <InviteUserDialog />
      </div>

      <UsersTable
        data={paginatedData?.data ?? []}
        total={paginatedData?.count ?? 0}
        page={page}
        pageSize={20}
        pageCount={paginatedData?.pageCount ?? 1}
      />
    </div>
  );
}
