import type { LandingPageWithProducts } from "@/types/database";
import { LinktreeTheme } from "./themes/linktree-theme";
import { EcommerceTheme } from "./themes/ecommerce-theme";
import { BeaconsTheme } from "./themes/beacons-theme";
import { TrackingScripts } from "./tracking-scripts";

interface Props {
  landingPage: LandingPageWithProducts;
}

export function LandingPageRenderer({ landingPage }: Props) {
  const ThemeComponent = getThemeComponent(landingPage.theme_type);

  return (
    <>
      <TrackingScripts tracking={landingPage.tracking} />
      <ThemeComponent landingPage={landingPage} />
    </>
  );
}

function getThemeComponent(themeType: string) {
  switch (themeType) {
    case "ecommerce":
      return EcommerceTheme;
    case "beacons":
      return BeaconsTheme;
    // taplink, campsite, carrd, seedprod, lnkbio all use linktree style for now
    default:
      return LinktreeTheme;
  }
}
