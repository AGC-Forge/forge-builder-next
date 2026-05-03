import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

import { routing } from "@/i18n/routing";

const PUBLIC_PATHS = [
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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const { locale: detectedLocale, pathname: unlocalizedPathname } =
    stripLocaleFromPathname(pathname);
  const locale = detectedLocale ?? routing.defaultLocale;
  const isPublicPath = PUBLIC_PATHS.some((p) => unlocalizedPathname.startsWith(p));
  const isApiRoute = unlocalizedPathname.startsWith("/api");

  if (!user && !isPublicPath) {
    if (isApiRoute) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = withLocale(locale, "/");
    if (pathname !== "/") {
      homeUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    }
    return NextResponse.redirect(homeUrl);
  }

  if (user && isPublicPath && unlocalizedPathname !== "/auth/callback") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = withLocale(locale, "/dashboard");
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  const isAdminRoute = ADMIN_ONLY_PATHS.some((p) =>
    unlocalizedPathname.startsWith(p),
  );

  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_active || profile.role !== "admin") {
      const unauthorizedUrl = request.nextUrl.clone();
      unauthorizedUrl.pathname = withLocale(locale, "/dashboard/unauthorized");
      unauthorizedUrl.search = "";
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return supabaseResponse;
}
