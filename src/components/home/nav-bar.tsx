"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function Navbar() {
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
          className="font-display-syne text-xl font-extrabold tracking-tight bg-linear-to-r from-accent-2 to-accent-3 bg-clip-text text-transparent"
        >
          PageForge
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-white/50 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center bg-bg-3 border border-white/8 rounded-md overflow-hidden">
            {["en", "id"].map((lang) => (
              <button
                key={lang}
                onClick={() => switchLocale(lang)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-all duration-200 uppercase tracking-wide",
                  locale === lang
                    ? "bg-accent text-white"
                    : "text-white/40 hover:text-white/70",
                )}
              >
                {lang}
              </button>
            ))}
          </div>

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
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-white/70 hover:text-white transition-colors"
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
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2 border-t border-white/8">
            <div className="flex items-center bg-bg-3 border border-white/8 rounded-md overflow-hidden">
              {["en", "id"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => switchLocale(lang)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-all duration-200 uppercase",
                    locale === lang
                      ? "bg-accent text-white"
                      : "text-white/40 hover:text-white/70",
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
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
          </div>
        </div>
      )}
    </header>
  );
}
