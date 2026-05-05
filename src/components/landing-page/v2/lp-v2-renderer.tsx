"use client";

/**
 * LP V2 Renderer
 * Path: src/components/landing-page/v2/lp-v2-renderer.tsx
 *
 * Renders a landing page built with Builder V2 (BlockV2 format).
 * Applies global page styles (font, bg color) and renders each block.
 */

import type { LandingPageWithProducts } from "@/types/database";
import type { BlockV2 } from "@/types/builder";
import { BlockRenderer, type RenderContext } from "./block-renderer";

interface Props {
  landingPage: LandingPageWithProducts;
}

export function LandingPageV2Renderer({ landingPage }: Props) {
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
  };

  const visibleBlocks = blocks.filter((b) => b.visible);

  // Page-level styles
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
      {/* Inject Google Font if non-system font */}
      {ctx.fontFamily !== "Inter" && ctx.fontFamily !== "System" && (
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=${ctx.fontFamily.replace(/ /g, "+")}:wght@400;500;600;700;800;900&display=swap');`}
        </style>
      )}

      {/* Render each visible block */}
      {visibleBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} ctx={ctx} />
      ))}

      {/* Powered by SnapLand (if no footer block) */}
      {!visibleBlocks.some((b) => b.type === "block-footer") && (
        <div className="text-center py-6 text-xs text-muted-foreground/40">
          Powered by SnapLand
        </div>
      )}
    </div>
  );
}
