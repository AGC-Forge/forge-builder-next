import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getLandingPages } from "@/actions/landing-pages";
import { Button } from "@/components/ui/button";
import { LandingPagesTable } from "@/components/dashboard/landing-pages/landing-pages-table";

export const metadata: Metadata = { title: "Landing Pages" };

export default async function LandingPagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    theme?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const search = params.search;
  const themeType = params.theme;
  const isPublished =
    params.status === "published"
      ? true
      : params.status === "draft"
        ? false
        : undefined;

  const result = await getLandingPages({ page, search, themeType, isPublished });
  const paginatedData = result.success ? result.data : null;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Landing Pages</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage your product landing pages.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/landing-page/new">
            <Plus className="size-4" />
            New Page
          </Link>
        </Button>
      </div>

      <LandingPagesTable
        data={paginatedData?.data ?? []}
        total={paginatedData?.count ?? 0}
        page={page}
        pageSize={20}
        pageCount={paginatedData?.pageCount ?? 1}
      />
    </div>
  );
}
