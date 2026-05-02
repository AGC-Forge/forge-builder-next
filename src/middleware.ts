import { type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  const authResponse = await updateSession(request);

  const authIsRedirect = authResponse.headers.has("location");
  if (authIsRedirect) {
    return authResponse;
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
