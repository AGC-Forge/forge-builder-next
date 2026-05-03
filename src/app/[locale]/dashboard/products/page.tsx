import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getProducts } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/dashboard/products/products-table";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const search = params.search;
  const category = params.category;
  const isActive =
    params.status === "active"
      ? true
      : params.status === "inactive"
        ? false
        : undefined;

  const result = await getProducts({ page, search, category, isActive });
  const paginatedData = result.success ? result.data : null;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage your affiliate product catalog.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="size-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <ProductsTable
        data={paginatedData?.data ?? []}
        total={paginatedData?.count ?? 0}
        page={page}
        pageSize={20}
        pageCount={paginatedData?.pageCount ?? 1}
      />
    </div>
  );
}
