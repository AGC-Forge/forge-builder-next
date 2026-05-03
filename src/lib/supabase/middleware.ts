import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

import { routing } from "@/i18n/routing";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
];
const ADMIN_ONLY_PATHS = [
  "/dashboard/users",
  "/dashboard/settings/web",
];
function stripLocaleFromPathname(pathname: string) {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) {
      return { locale, pathname: "/" };
    }
    if (pathname.startsWith(`/${locale}/`)) {
      return { locale, pathname: pathname.slice(locale.length + 1) };
    }
  }

  return { locale: undefined as (typeof routing.locales)[number] | undefined, pathname };
}

function withLocale(locale: string | undefined, pathname: string) {
  if (!locale) return pathname;
  if (locale === routing.defaultLocale) return pathname;
  if (pathname === "/") return `/${locale}`;
  return `/${locale}${pathname}`;
}

function buildRedirectUrl(request: NextRequest, pathname: string): URL {
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const url = new URL(pathname, `${proto}://${host}`);
  return url;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[updateSession] missing Supabase env");
    return supabaseResponse;
  }

  let supabase: ReturnType<typeof createServerClient<Database>>;
  try {
    supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });
  } catch (error) {
    console.error("[updateSession] createServerClient failed", String(error));
    return supabaseResponse;
  }

  let user: Database["public"]["Tables"]["profiles"]["Row"]["id"] | null;
  try {
    const res = await supabase.auth.getUser();
    user = res.data.user?.id ?? null;
  } catch (error) {
    console.error("[updateSession] getUser failed", String(error));
    user = null;
  }

  const { pathname, search } = request.nextUrl;
  const { locale: detectedLocale, pathname: unlocalizedPathname } =
    stripLocaleFromPathname(pathname);
  const locale = detectedLocale ?? routing.defaultLocale;
  const isPublicPath = PUBLIC_PATHS.some((p) =>
    p === "/" ? unlocalizedPathname === "/" : unlocalizedPathname.startsWith(p),
  );
  const isApiRoute = unlocalizedPathname.startsWith("/api");

  if (!user && !isPublicPath) {
    if (isApiRoute) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const homeUrl = buildRedirectUrl(request, withLocale(locale, "/login"));
    homeUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(homeUrl);
  }

  if (user && isPublicPath && unlocalizedPathname !== "/auth/callback") {
    const dashboardUrl = buildRedirectUrl(request, withLocale(locale, "/dashboard"));
    return NextResponse.redirect(dashboardUrl);
  }

  const isAdminRoute = ADMIN_ONLY_PATHS.some((p) =>
    unlocalizedPathname.startsWith(p),
  );

  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user)
      .maybeSingle();

    if (!profile || !profile.is_active || profile.role !== "admin") {
      const unauthorizedUrl = buildRedirectUrl(request, withLocale(locale, "/dashboard/unauthorized"));
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return supabaseResponse;
}
