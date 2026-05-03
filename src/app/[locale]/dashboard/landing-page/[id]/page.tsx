import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, Paintbrush, Pencil } from "lucide-react";
import { getLandingPage } from "@/actions/landing-pages";
import { Button } from "@/components/ui/button";
import { LandingPageDetail } from "@/components/dashboard/landing-pages/landing-page-detail";

export const metadata: Metadata = { title: "Landing Page Detail" };

export default async function LandingPageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getLandingPage(id);
  if (!result.success || !result.data) notFound();

  const page = result.data;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/landing-page">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{page.title}</h1>
            <p className="text-muted-foreground text-sm">/{page.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {page.is_published && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`${siteUrl}/${page.slug}`} target="_blank">
                <ExternalLink className="size-4" />
                Preview
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/landing-page/${id}/edit`}>
              <Pencil className="size-4" />
              Settings
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/landing-page/${id}/builder`}>
              <Paintbrush className="size-4" />
              Open Builder
            </Link>
          </Button>
        </div>
      </div>

      <LandingPageDetail landingPage={page} />
    </div>
  );
}
