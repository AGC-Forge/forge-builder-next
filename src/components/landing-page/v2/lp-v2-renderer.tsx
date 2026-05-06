"use client";

import { useEffect } from "react";
import type { LandingPageWithProducts } from "@/types/database";
import type { BlockV2 } from "@/types/builder";
import { BlockRenderer, type RenderContext } from "./block-renderer";

interface Props {
  landingPage: LandingPageWithProducts;
}

async function trackView(landingPageId: string) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view", landingPageId }),
      keepalive: true, // don't cancel on page unload
    });
  } catch {
    // silent — analytics failure never breaks the page
  }
}
export async function trackProductClick(
  productId: string,
  landingPageId: string | null,
  clickType: "affiliate" | "marketplace" | "detail" = "affiliate",
) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "click",
        productId,
        landingPageId,
        clickType,
      }),
      keepalive: true,
    });
  } catch {
    // silent
  }
}

export default function LandingPageV2Renderer({ landingPage }: Props) {
  const blocks = (landingPage.blocks ?? []) as unknown as BlockV2[];
  const cfg = landingPage.theme_config;

  const ctx: RenderContext = {
    products: (landingPage.landing_page_products ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((lpp) => lpp.product)
      .filter(Boolean),
    primaryColor: cfg.primaryColor ?? "#6366f1",
    textColor: cfg.textColor ?? "#111827",
    fontFamily: cfg.fontFamily ?? "Inter",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
    landingPageId: landingPage.id, // pass LP id to ctx for click tracking
    onProductClick: (productId, clickType) =>
      trackProductClick(productId, landingPage.id, clickType),
  };

  useEffect(() => {
    trackView(landingPage.id);
  }, [landingPage.id]);

  const visibleBlocks = blocks.filter((b) => b.visible);

  const pageStyle: React.CSSProperties = {
    fontFamily: ctx.fontFamily,
    color: ctx.textColor,
    backgroundColor: cfg.backgroundColor ?? "#ffffff",
    minHeight: "100vh",
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  };

  return (
    <div style={pageStyle}>
      {ctx.fontFamily !== "Inter" && ctx.fontFamily !== "System" && (
        <style>{`@import url('https://fonts.googleapis.com/css2?family=${ctx.fontFamily.replace(/ /g, "+")}:wght@400;500;600;700;800;900&display=swap');`}</style>
      )}
      {visibleBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} ctx={ctx} />
      ))}
      {!visibleBlocks.some((b) => b.type === "block-footer") && (
        <div className="text-center py-6 text-xs text-muted-foreground/40">
          Powered by SnapLand
        </div>
      )}
    </div>
  );
}
