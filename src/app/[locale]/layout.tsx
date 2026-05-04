import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { fontVars } from "@/lib/fonts/registry";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import {
  PREFERENCE_DEFAULTS,
  PREFERENCE_PERSISTENCE,
} from "@/lib/preferences/preferences-config";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { getCurrentProfile } from "@/actions/users";
import { getPublicSettings } from "@/actions/settings";
import {
  CurrentUserProvider,
  type CurrentUser,
} from "@/components/current-user-provider";
import type { Profile } from "@/types/database";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "SnapLand",
    template: "%s - SnapLand",
  },
  description:
    "Build professional, high-converting landing pages with Landoo.ai. No coding required. Use our AI-powered builder to grow your business and boost conversions instantly.",
  keywords: [
    "social media management",
    "social media link in bio",
    "linktree alternative",
    "affiliate program",
    "e-commerce",
    "landing page builder",
    "AI website builder",
    "no-code landing page",
    "conversion rate optimization",
    "Landoo AI",
    "custom landing pages",
    "marketing tools 2026",
  ],
  icons: [
    {
      url: "/favicon.ico",
      sizes: "16x16 32x32 48x48 128x128",
      type: "image/x-icon",
    },
  ],
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({
  children,
  params,
}: Readonly<Props>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const {
    theme_mode,
    theme_preset,
    content_layout,
    navbar_style,
    sidebar_variant,
    sidebar_collapsible,
    font,
  } = PREFERENCE_DEFAULTS;

  const persistence = JSON.stringify({
    theme_mode: PREFERENCE_PERSISTENCE.theme_mode,
    theme_preset: PREFERENCE_PERSISTENCE.theme_preset,
    font: PREFERENCE_PERSISTENCE.font,
    content_layout: PREFERENCE_PERSISTENCE.content_layout,
    navbar_style: PREFERENCE_PERSISTENCE.navbar_style,
    sidebar_variant: PREFERENCE_PERSISTENCE.sidebar_variant,
    sidebar_collapsible: PREFERENCE_PERSISTENCE.sidebar_collapsible,
  });

  const defaults = JSON.stringify({
    theme_mode: PREFERENCE_DEFAULTS.theme_mode,
    theme_preset: PREFERENCE_DEFAULTS.theme_preset,
    font: PREFERENCE_DEFAULTS.font,
    content_layout: PREFERENCE_DEFAULTS.content_layout,
    navbar_style: PREFERENCE_DEFAULTS.navbar_style,
    sidebar_variant: PREFERENCE_DEFAULTS.sidebar_variant,
    sidebar_collapsible: PREFERENCE_DEFAULTS.sidebar_collapsible,
  });

  let currentUser: CurrentUser = null;
  let currentProfile: Profile | null = null;
  let publicSettings: Record<string, string | null> = {};

  const [profileResult, settingsResult] = await Promise.all([
    getCurrentProfile().catch(() => null),
    getPublicSettings().catch(() => null),
  ]);

  if (profileResult?.success && profileResult.data) {
    const p = profileResult.data;
    currentUser = { id: p.id, email: p.email ?? null };
    currentProfile = p;
  }

  if (settingsResult?.success && settingsResult.data) {
    publicSettings = settingsResult.data;
  }

  return (
    <html
      data-theme-mode={theme_mode}
      data-theme-preset={theme_preset}
      data-content-layout={content_layout}
      data-navbar-style={navbar_style}
      data-sidebar-variant={sidebar_variant}
      data-sidebar-collapsible={sidebar_collapsible}
      data-font={font}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn("font-sans", inter.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var root = document.documentElement;
                  var PERSISTENCE = ${persistence};
                  var DEFAULTS = ${defaults};

                  function readCookie(name) {
                    var match = document.cookie.split("; ").find(function(c) {
                      return c.startsWith(name + "=");
                    });
                    return match ? decodeURIComponent(match.split("=")[1]) : null;
                  }

                  function readLocal(name) {
                    try {
                      return window.localStorage.getItem(name);
                    } catch (e) {
                      return null;
                    }
                  }

                  function readPreference(key, fallback) {
                    var mode = PERSISTENCE[key];
                    var value = null;

                    if (mode === "localStorage") {
                      value = readLocal(key);
                    }

                    if (!value && (mode === "client-cookie" || mode === "server-cookie")) {
                      value = readCookie(key);
                    }

                    if (!value || typeof value !== "string") {
                      return fallback;
                    }

                    return value;
                  }

                  var rawMode = readPreference("theme_mode", DEFAULTS.theme_mode);
                  var rawPreset = readPreference("theme_preset", DEFAULTS.theme_preset);
                  var rawFont = readPreference("font", DEFAULTS.font);
                  var rawContentLayout = readPreference("content_layout", DEFAULTS.content_layout);
                  var rawNavbarStyle = readPreference("navbar_style", DEFAULTS.navbar_style);
                  var rawSidebarVariant = readPreference("sidebar_variant", DEFAULTS.sidebar_variant);
                  var rawSidebarCollapsible = readPreference("sidebar_collapsible", DEFAULTS.sidebar_collapsible);

                  var isValidMode = rawMode === "dark" || rawMode === "light" || rawMode === "system";
                  var mode = isValidMode ? rawMode : DEFAULTS.theme_mode;
                  var resolvedMode =
                    mode === "system" && window.matchMedia
                      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
                      : mode;
                  var preset = rawPreset || DEFAULTS.theme_preset;
                  var font = rawFont || DEFAULTS.font;
                  var contentLayout = rawContentLayout || DEFAULTS.content_layout;
                  var navbarStyle = rawNavbarStyle || DEFAULTS.navbar_style;
                  var sidebarVariant = rawSidebarVariant || DEFAULTS.sidebar_variant;
                  var sidebarCollapsible = rawSidebarCollapsible || DEFAULTS.sidebar_collapsible;

                  root.classList.toggle("dark", resolvedMode === "dark");
                  root.setAttribute("data-theme-mode", mode);
                  root.setAttribute("data-theme-preset", preset);
                  root.setAttribute("data-font", font);
                  root.setAttribute("data-content-layout", contentLayout);
                  root.setAttribute("data-navbar-style", navbarStyle);
                  root.setAttribute("data-sidebar-variant", sidebarVariant);
                  root.setAttribute("data-sidebar-collapsible", sidebarCollapsible);

                  root.style.colorScheme = resolvedMode === "dark" ? "dark" : "light";

                } catch (e) {
                  console.warn("ThemeBootScript error:", e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${fontVars} min-h-screen antialiased`}>
        <NextIntlClientProvider>
          <TooltipProvider>
            <PreferencesStoreProvider
              themeMode={theme_mode}
              themePreset={theme_preset}
              contentLayout={content_layout}
              navbarStyle={navbar_style}
              font={font}
            >
              <CurrentUserProvider
                user={currentUser}
                profile={currentProfile}
                publicSettings={publicSettings}
              >
                {children}
                <Toaster />
              </CurrentUserProvider>
            </PreferencesStoreProvider>
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
