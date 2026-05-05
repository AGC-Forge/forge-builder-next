import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getActiveProducts } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { LandingPageForm } from "@/components/dashboard/landing-pages/landing-page-form";

export const metadata: Metadata = { title: "New Landing Page" };

export default async function NewLandingPagePage() {
  const productsRes = await getActiveProducts();
  const availableProducts = productsRes.success ? (productsRes.data ?? []) : [];

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/landing-page">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">New Landing Page</h1>
          <p className="text-muted-foreground text-sm">
            Configure your page, then customize it in the visual builder.
          </p>
        </div>
      </div>

      <LandingPageForm
        mode="create"
        availableProducts={availableProducts}
        assignedProductIds={[]}
      />
    </div>
  );
}
