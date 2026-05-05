import type { LandingPageWithProducts } from "@/types/database";
import { TrackingScripts } from "./tracking-scripts";

// V1 themes (legacy)
import { LinktreeTheme } from "./themes/linktree-theme";
import { EcommerceTheme } from "./themes/ecommerce-theme";
import { BeaconsTheme } from "./themes/beacons-theme";
import { TaplinkTheme } from "./themes/taplink-theme";
import { CampsiteTheme } from "./themes/campsite-theme";
import { CarrdTheme } from "./themes/carrd-theme";
import { SeedprodTheme } from "./themes/seedprod-theme";
import { LnkbioTheme } from "./themes/lnkbio-theme";

// V2 renderer
import LandingPageV2Renderer from "./v2/lp-v2-renderer";

interface Props {
  landingPage: LandingPageWithProducts;
}

/**
 * Determines if a page uses V2 blocks format.
 * V2 blocks have `props` and `layout` fields instead of `content` and `settings`.
 */
function isV2Page(landingPage: LandingPageWithProducts): boolean {
  const blocks = landingPage.blocks ?? [];
  if (blocks.length === 0) return false;
  const firstBlock = blocks[0] as Record<string, any>;
  return "props" in firstBlock && "layout" in firstBlock;
}

export function LandingPageRenderer({ landingPage }: Props) {
  const useV2 = isV2Page(landingPage);

  return (
    <>
      <TrackingScripts tracking={landingPage.tracking} />
      {useV2 ? (
        <LandingPageV2Renderer landingPage={landingPage} />
      ) : (
        <LegacyThemeRenderer landingPage={landingPage} />
      )}
    </>
  );
}

/**
 * Renders a legacy theme (V1) for a landing page.
 */
function LegacyThemeRenderer({ landingPage }: Props) {
  switch (landingPage.theme_type) {
    case "ecommerce":
      return <EcommerceTheme landingPage={landingPage} />;
    case "beacons":
      return <BeaconsTheme landingPage={landingPage} />;
    case "taplink":
      return <TaplinkTheme landingPage={landingPage} />;
    case "campsite":
      return <CampsiteTheme landingPage={landingPage} />;
    case "carrd":
      return <CarrdTheme landingPage={landingPage} />;
    case "seedprod":
      return <SeedprodTheme landingPage={landingPage} />;
    case "lnkbio":
      return <LnkbioTheme landingPage={landingPage} />;
    case "linktree":
    default:
      return <LinktreeTheme landingPage={landingPage} />;
  }
}
