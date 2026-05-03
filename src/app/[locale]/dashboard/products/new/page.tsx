import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/dashboard/products/product-form";

export const metadata: Metadata = { title: "Add Product" };

export default function NewProductPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/products">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Add Product</h1>
          <p className="text-muted-foreground text-sm">
            Add manually or let AI analyze from image / URL.
          </p>
        </div>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
