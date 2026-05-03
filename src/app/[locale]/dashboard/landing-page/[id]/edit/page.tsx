import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getLandingPage } from "@/actions/landing-pages";
import { getActiveProducts } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { LandingPageForm } from "@/components/dashboard/landing-pages/landing-page-form";

export const metadata: Metadata = { title: "Edit Landing Page" };

export default async function EditLandingPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lpRes, productsRes] = await Promise.all([
    getLandingPage(id),
    getActiveProducts(),
  ]);

  if (!lpRes.success || !lpRes.data) notFound();

  const assignedProductIds = (
    lpRes.data.landing_page_products ?? []
  ).map((lpp) => lpp.product_id);

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/landing-page/${id}`}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Edit Landing Page</h1>
          <p className="text-muted-foreground text-sm">{lpRes.data.title}</p>
        </div>
      </div>

      <LandingPageForm
        mode="edit"
        landingPage={lpRes.data}
        availableProducts={productsRes.data ?? []}
        assignedProductIds={assignedProductIds}
      />
    </div>
  );
}
