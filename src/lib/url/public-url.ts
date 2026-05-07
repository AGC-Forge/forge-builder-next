type HeaderLike = {
  get(name: string): string | null;
};

function stripInternalPort(url: URL) {
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (!isLocalhost) {
    url.port = "";
  }
  return url;
}

export function normalizePublicBaseUrl(value: string) {
  try {
    const url = stripInternalPort(new URL(value));
    url.pathname = "";
    url.search = "";
    url.hash = "";
    let result = url.toString().replace(/\/$/, "");

    if (process.env.NODE_ENV === "production" && result.startsWith("http://")) {
      result = result.replace("http://", "https://");
    }

    return result;
  } catch {
    return value;
  }
}
export function getConfiguredPublicBaseUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      const normalized = normalizePublicBaseUrl(appUrl);
      return normalized;
    } catch {
      // Fallback ke method lain
    }
  }

  if (process.env.NODE_ENV === "production") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.VERCEL_URL;
    if (siteUrl) {
      return normalizePublicBaseUrl(siteUrl);
    }

    throw new Error("NEXT_PUBLIC_APP_URL must be set in production");
  }

  return null;
}

export function getPublicBaseUrlFromHeaders(headers: HeaderLike) {
  try {
    const configured = getConfiguredPublicBaseUrl();
    if (configured) return configured;

    const proto = headers.get("x-forwarded-proto") ??
      headers.get("x-forwarded-protocol") ??
      "http";
    const host = headers.get("x-forwarded-host") ??
      headers.get("host") ??
      "localhost:3000";

    let cleanHost = host;
    if (process.env.NODE_ENV === "production") {
      cleanHost = host.split(":")[0];
    }

    return normalizePublicBaseUrl(`${proto}://${cleanHost}`);
  } catch (error) {
    console.error("Error getting public base URL from headers:", error);
    return "https://snapland.agcforge.com"; // Fallback hardcoded
  }
}

export function getPublicUrl(path: string, headers?: HeaderLike) {
  let base: string;

  try {
    base = headers
      ? getPublicBaseUrlFromHeaders(headers)
      : (getConfiguredPublicBaseUrl() ?? "http://localhost:3000");
  } catch (error) {
    // Fallback for production
    base = "https://snapland.agcforge.com";
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, base);

  return url;
}
