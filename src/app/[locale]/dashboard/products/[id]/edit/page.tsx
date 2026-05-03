import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/dashboard/products/product-form";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProduct(id);
  if (!result.success || !result.data) notFound();

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/products/${id}`}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Edit Product</h1>
          <p className="text-muted-foreground text-sm">{result.data.title}</p>
        </div>
      </div>
      <ProductForm mode="edit" product={result.data} />
    </div>
  );
}
