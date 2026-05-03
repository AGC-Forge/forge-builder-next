import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getLandingPage } from "@/actions/landing-pages";
import { getActiveProducts } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { LandingPageBuilder } from "@/components/dashboard/landing-pages/builder/lp-builder";

export const metadata: Metadata = { title: "Page Builder" };

export default async function BuilderPage({
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

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col gap-0 overflow-hidden">
      {/* Builder top bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href={`/dashboard/landing-page/${id}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <span className="font-medium text-sm">{lpRes.data.title}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs">
            /{lpRes.data.slug}
          </span>
        </div>
      </div>

      <LandingPageBuilder
        landingPage={lpRes.data}
        availableProducts={productsRes.data ?? []}
      />
    </div>
  );
}
