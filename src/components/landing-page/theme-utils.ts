import type { ThemeConfig } from "@/types/database";

export function getContainerStyle(
  bgStyle: React.CSSProperties,
  fontFamily: string,
  textColor: string,
): React.CSSProperties {
  return {
    minHeight: "100vh",
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
    boxSizing: "border-box",
    fontFamily,
    color: textColor,
    ...bgStyle,
  };
}
export function getInnerStyle(
  maxWidth: string = "520px",
  padding: string = "2.5rem 1rem 4rem",
): React.CSSProperties {
  return {
    width: "100%",
    maxWidth,
    margin: "0 auto",
    padding,
    boxSizing: "border-box",
  };
}
export function getImageStyle(
  overrides: React.CSSProperties = {},
): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    boxSizing: "border-box",
    ...overrides,
  };
}
export function getProductGridStyle(cols = 2): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${Math.min(cols, 2)}, minmax(0, 1fr))`,
    gap: "12px",
    width: "100%",
    boxSizing: "border-box",
  };
}
export function getBtnTextColor(bgColor: string): string {
  return isLight(bgColor) ? "#111827" : "#ffffff";
}
export function getCardColors(backgroundColor: string): {
  cardBg: string;
  cardBorder: string;
} {
  if (isLight(backgroundColor)) {
    return {
      cardBg: "rgba(0,0,0,.05)",
      cardBorder: "rgba(0,0,0,.1)",
    };
  }
  return {
    cardBg: "rgba(255,255,255,.08)",
    cardBorder: "rgba(255,255,255,.12)",
  };
}
export function buildBgStyle(tc: ThemeConfig): React.CSSProperties {
  if (tc.backgroundType === "gradient" && tc.backgroundGradient) {
    return { background: tc.backgroundGradient };
  }
  if (tc.backgroundType === "image" && tc.backgroundImageUrl) {
    return {
      backgroundImage: `url(${tc.backgroundImageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "local",
    };
  }
  return { backgroundColor: tc.backgroundColor ?? "#ffffff" };
}

export function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 155;
}

export const RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "14px",
  full: "9999px",
};

export const SHADOW_MAP: Record<string, string> = {
  none: "none",
  sm: "0 1px 4px rgba(0,0,0,.08)",
  md: "0 4px 14px rgba(0,0,0,.12)",
  lg: "0 8px 28px rgba(0,0,0,.18)",
};

export const THEME_GLOBAL_CSS = `
  *, *::before, *::after {
    box-sizing: border-box;
  }
  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
    -webkit-text-size-adjust: 100%;
  }
  img, video, iframe {
    max-width: 100%;
    height: auto;
  }
  a {
    color: inherit;
  }
`;