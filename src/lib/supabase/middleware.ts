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
  "/auth/signout",
];

const ADMIN_ONLY_PATHS = [
  "/dashboard/users",
  "/dashboard/settings/web",
  "/dashboard/activity",
];
const SYSTEM_PREFIXES = [
  "/dashboard",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/api",
  "/_next",
  "/unauthorized",
];

function stripLocaleFromPathname(pathname: string) {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) {
      return { locale, pathname: "/" };
    }
    if (pathname.startsWith(`/${locale}/`)) {
      return {
        locale,
        pathname: pathname.slice(locale.length + 1),
      };
    }
  }
  return {
    locale: undefined as (typeof routing.locales)[number] | undefined,
    pathname,
  };
}

function withLocale(locale: string | undefined, path: string) {
  if (!locale || locale === routing.defaultLocale) return path;
  return `/${locale}${path}`;
}

function buildRedirectUrl(request: NextRequest, path: string): URL {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const base = appUrl ?? request.nextUrl.origin;
  return new URL(path, base);
}
/**
 * Detect if an unlocalized pathname looks like a landing page slug.
 * A slug path is a single-segment path like /my-product-page that doesn't
 * match any known system prefix.
 * Pattern: /[a-z0-9][a-z0-9-]{1,}[a-z0-9]  (single segment, no sub-paths)
 */
function isLandingPageSlugPath(unlocalizedPathname: string): boolean {
  // Must be a single path segment (no nested slashes after the first /)
  const segments = unlocalizedPathname.split("/").filter(Boolean);
  if (segments.length !== 1) return false;

  const slug = segments[0];

  // Check slug format
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && !/^[a-z0-9]{2,}$/.test(slug)) {
    return false;
  }

  // Not a system path
  const isSystem = SYSTEM_PREFIXES.some((prefix) =>
    unlocalizedPathname.startsWith(prefix),
  );
  if (isSystem) return false;

  return true;
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
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
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
    p === "/"
      ? unlocalizedPathname === "/"
      : unlocalizedPathname.startsWith(p),
  );
  const isApiRoute = unlocalizedPathname.startsWith("/api");

  const isSlugPath = isLandingPageSlugPath(unlocalizedPathname);

  if (!user && !isPublicPath && !isSlugPath) {
    if (isApiRoute) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const loginUrl = buildRedirectUrl(
      request,
      withLocale(locale, "/login"),
    );
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (
    user &&
    isPublicPath &&
    !isSlugPath &&
    unlocalizedPathname !== "/auth/callback" &&
    unlocalizedPathname !== "/auth/signout" &&
    unlocalizedPathname !== "/"
  ) {
    const dashboardUrl = buildRedirectUrl(
      request,
      withLocale(locale, "/dashboard"),
    );
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
      const unauthorizedUrl = buildRedirectUrl(
        request,
        withLocale(locale, "/dashboard/unauthorized"),
      );
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return supabaseResponse;
}
