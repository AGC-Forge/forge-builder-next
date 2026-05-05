import type { Metadata } from "next";
import { getApplications } from "@/actions/applications";
import { ApplicationsTable } from "@/components/dashboard/applications/applications-table";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage() {
  const result = await getApplications();
  const apps = result.success ? (result.data ?? []) : [];

  return (
    <div className="@container/main">
      <ApplicationsTable initialData={apps} />
    </div>
  );
}
