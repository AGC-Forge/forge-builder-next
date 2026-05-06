import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { getPublicBaseUrlFromHeaders } from "@/lib/url/public-url";

const intlMiddleware = createIntlMiddleware(routing);

// Rewrite internal https://localhost/127.0.0.1 URLs to http:// so Next.js
// doesn't try to open an SSL connection to the plain-HTTP app server.
function fixInternalRewrite(value: string): string {
  return value.replace(
    /^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?/,
    "http://$1$2",
  );
}

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  let authResponse: NextResponse;
  try {
    authResponse = await updateSession(request);
  } catch (error) {
    console.error("[proxy] updateSession failed", String(error));
    authResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (authResponse.headers.has("location")) return authResponse;

  let intlResponse: NextResponse;
  try {
    intlResponse = intlMiddleware(request);
  } catch (error) {
    console.error("[proxy] intl middleware failed", String(error));

    return authResponse;
  }

  const location = intlResponse.headers.get("location");
  if (location) {
    const publicBase = getPublicBaseUrlFromHeaders(request.headers);
    const response = NextResponse.redirect(new URL(location, publicBase), {
      status: intlResponse.status,
    });
    authResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  }

  intlResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    // Skip x-middleware-rewrite: in Next.js 16 proxy.ts mode this triggers an
    // actual HTTP proxy request to localhost which causes a redirect loop.
    // With localePrefix:'always' the App Router resolves locale from the URL
    // segment directly — no rewrite header needed.
    if (key.toLowerCase() === "x-middleware-rewrite") return;
    authResponse.headers.set(key, value);
  });

  const finalResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  authResponse.headers.forEach((value, key) => {
    finalResponse.headers.set(key, value);
  });

  return finalResponse;
}

export const config = {
  matcher: ["/((?!api|monitoring|trpc|_next|_vercel|.*\\..*).*)"],
};
