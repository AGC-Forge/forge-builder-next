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
  const url = stripInternalPort(new URL(value));
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function getConfiguredPublicBaseUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return null;

  try {
    const normalized = normalizePublicBaseUrl(appUrl);
    if (
      process.env.NODE_ENV === "production" &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)
    ) {
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}

export function getPublicBaseUrlFromHeaders(headers: HeaderLike) {
  const configured = getConfiguredPublicBaseUrl();
  if (configured) return configured;

  const proto = headers.get("x-forwarded-proto") ?? "https";
  const host =
    headers.get("x-forwarded-host") ??
    headers.get("host") ??
    "localhost:3000";

  return normalizePublicBaseUrl(`${proto}://${host}`);
}

export function getPublicUrl(path: string, headers?: HeaderLike) {
  const base = headers
    ? getPublicBaseUrlFromHeaders(headers)
    : (getConfiguredPublicBaseUrl() ?? "http://localhost:3000");
  return new URL(path, base);
}
