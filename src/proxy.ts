import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  let authResponse: NextResponse;
  try {
    authResponse = await updateSession(request);
  } catch (error) {
    console.error("[proxy] updateSession failed", String(error));
    authResponse = NextResponse.next({ request });
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
    const response = NextResponse.redirect(new URL(location, request.url), {
      status: intlResponse.status,
    });
    authResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  }

  intlResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    authResponse.headers.set(key, value);
  });

  return authResponse;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
