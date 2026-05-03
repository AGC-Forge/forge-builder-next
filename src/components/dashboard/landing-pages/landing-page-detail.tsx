"use client";

import { useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Globe, Eye, MousePointerClick, Paintbrush } from "lucide-react";
import { toast } from "sonner";
import { setLandingPagePublished } from "@/actions/landing-pages";
import type { LandingPageWithProducts } from "@/types/database";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function LandingPageDetail({
  landingPage,
}: {
  landingPage: LandingPageWithProducts;
}) {
  const [isPending, startTransition] = useTransition();

  function handleTogglePublish() {
    startTransition(async () => {
      const result = await setLandingPagePublished(
        landingPage.id,
        !landingPage.is_published,
      );
      if (result.success) toast.success(result.message);
      else toast.error(result.error ?? "Failed.");
    });
  }

  const products = (landingPage.landing_page_products ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lpp) => lpp.product)
    .filter(Boolean);

  const THEME_LABELS: Record<string, string> = {
    linktree: "Linktree",
    beacons: "Beacons",
    taplink: "TapLink",
    campsite: "Campsite",
    carrd: "Carrd",
    seedprod: "SeedProd",
    lnkbio: "Lnk.bio",
    ecommerce: "E-Commerce",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Total Views",
              value: landingPage.view_count.toLocaleString(),
              icon: Eye,
            },
            {
              label: "Total Clicks",
              value: landingPage.click_count.toLocaleString(),
              icon: MousePointerClick,
            },
            {
              label: "CTR",
              value:
                landingPage.view_count > 0
                  ? `${((landingPage.click_count / landingPage.view_count) * 100).toFixed(1)}%`
                  : "—",
              icon: Globe,
            },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-9 items-center justify-center rounded-lg border bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-xl">{value}</p>
                  <p className="text-muted-foreground text-xs">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Products */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Assigned Products ({products.length})</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/landing-page/${landingPage.id}/edit`}>
                Manage
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">
                No products assigned yet.
              </p>
            ) : (
              <div className="space-y-2">
                {products.map((product) => {
                  if (!product) return null;
                  const thumb =
                    product.images.find((i) => i.is_primary)?.url ??
                    product.images[0]?.url;
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 rounded-lg border p-2"
                    >
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          className="size-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-md bg-muted" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.title}</p>
                        {product.price != null && (
                          <p className="text-muted-foreground text-xs">
                            {product.currency} {product.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={product.is_active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {product.is_active ? "Active" : "Off"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blocks */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              Builder Blocks ({landingPage.blocks.length})
            </CardTitle>
            <Button asChild size="sm">
              <Link
                href={`/dashboard/landing-page/${landingPage.id}/builder`}
              >
                <Paintbrush className="size-4" />
                Open Builder
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {landingPage.blocks.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">
                No blocks added yet. Open the builder to start designing.
              </p>
            ) : (
              <div className="space-y-1">
                {landingPage.blocks.map((block, i) => (
                  <div
                    key={block.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-muted-foreground text-xs">
                      {i + 1}.
                    </span>
                    <span className="capitalize">
                      {block.type.replace(/-/g, " ")}
                    </span>
                    {!block.visible && (
                      <Badge variant="outline" className="text-xs">
                        Hidden
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Config */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Page Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <div className="mt-1 flex items-center justify-between">
                <Badge
                  variant={
                    landingPage.is_published ? "default" : "secondary"
                  }
                >
                  {landingPage.is_published ? "Published" : "Draft"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTogglePublish}
                  disabled={isPending}
                >
                  {landingPage.is_published ? "Unpublish" : "Publish"}
                </Button>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-muted-foreground text-xs">URL</p>
              <p className="font-mono text-xs">/{landingPage.slug}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Theme</p>
              <p>{THEME_LABELS[landingPage.theme_type]}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Created</p>
              <p>
                {format(new Date(landingPage.created_at), "dd MMM yyyy")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Last Updated</p>
              <p>
                {format(new Date(landingPage.updated_at), "dd MMM yyyy")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tracking info */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              {
                label: "GTM",
                value: landingPage.tracking?.gtm_id,
              },
              { label: "GA4", value: landingPage.tracking?.ga_id },
              {
                label: "FB Pixel",
                value: landingPage.tracking?.fb_pixel_id,
              },
              {
                label: "Histats",
                value: landingPage.tracking?.histats_id,
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">{label}</span>
                {value ? (
                  <Badge variant="outline" className="font-mono text-xs">
                    {value}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
