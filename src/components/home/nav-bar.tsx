"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function Navbar({ profile }: { profile?: Profile }) {
  const t = useTranslations("HomeSectionNav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/") || "/");
  };

  const navLinks = [
    { href: "#features", label: t("features") },
    { href: "#themes", label: t("themes") },
    { href: "#analytics", label: t("analytics") },
    { href: "#pricing", label: t("pricing") },
    { href: "#integrations", label: t("integrations") },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-bg/90 backdrop-blur-xl border-b border-white/8"
          : "bg-transparent",
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          locale={locale}
          className="font-body-dm-sans text-xl font-extrabold tracking-tight bg-linear-to-r from-violet-500 to-cyan-600 bg-clip-text text-transparent"
        >
          SnapLand
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeSwitcher />
          <LanguageSwitcher />
          {profile ? (
            <>
              <Button size="sm" asChild>
                <Link href={`/dashboard`} locale={locale}>
                  {t("dashboard")}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/login`} locale={locale}>
                  {t("login")}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/signup`} locale={locale}>
                  {t("getStarted")}
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden font-medium text-neutral-800 dark:text-neutral-100 hover:text-black dark:hover:text-white transition-colors duration-200"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-bg-2/95 backdrop-blur-xl border-b border-white/8 px-6 py-5 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2 border-t dark:border-white/8 border-white/40">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t dark:border-white/8 border-white/40">
            {profile ? (
              <>
                <Button size="sm" asChild>
                  <Link href={`/dashboard`} locale={locale}>
                    {t("dashboard")}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/login`} locale={locale}>
                    {t("login")}
                  </Link>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/signup`} locale={locale}>
                    {t("getStarted")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
