import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { getProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { ProductDetail } from "@/components/dashboard/products/product-detail";

export const metadata: Metadata = { title: "Product Detail" };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProduct(id);
  if (!result.success || !result.data) notFound();

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/products">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Product Detail</h1>
            <p className="text-muted-foreground text-sm">{result.data.title}</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/products/${id}/edit`}>
            <Pencil className="size-4" />
            Edit
          </Link>
        </Button>
      </div>
      <ProductDetail product={result.data} />
    </div>
  );
}
