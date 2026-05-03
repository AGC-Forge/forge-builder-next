import type { LandingPageWithProducts } from "@/types/database";
import { LinktreeTheme } from "./themes/linktree-theme";
import { EcommerceTheme } from "./themes/ecommerce-theme";
import { BeaconsTheme } from "./themes/beacons-theme";
import { TaplinkTheme } from "./themes/taplink-theme";
import { CampsiteTheme } from "./themes/campsite-theme";
import { CarrdTheme } from "./themes/carrd-theme";
import { SeedprodTheme } from "./themes/seedprod-theme";
import { LnkbioTheme } from "./themes/lnkbio-theme";
import { TrackingScripts } from "./tracking-scripts";

interface Props {
  landingPage: LandingPageWithProducts;
}

export function LandingPageRenderer({ landingPage }: Props) {
  return (
    <>
      <TrackingScripts tracking={landingPage.tracking} />
      {renderTheme(landingPage)}
    </>
  );
}

function renderTheme(landingPage: LandingPageWithProducts) {
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
