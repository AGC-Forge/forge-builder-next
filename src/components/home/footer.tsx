import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

export function Footer() {
  const t = useTranslations("HomeSectionFooter");
  const locale = useLocale();

  const productLinks = [
    { label: t("links.features"), href: "#features" },
    { label: t("links.themes"), href: "#themes" },
    { label: t("links.pricing"), href: "#pricing" },
    { label: t("links.changelog"), href: "/changelog" },
  ];

  const resourceLinks = [
    { label: t("links.docs"), href: "/docs" },
    { label: t("links.blog"), href: "/blog" },
    { label: t("links.templates"), href: "/templates" },
    { label: t("links.api"), href: "/api-docs" },
  ];

  const companyLinks = [
    { label: t("links.about"), href: "/about" },
    { label: t("links.privacy"), href: "/privacy" },
    { label: t("links.terms"), href: "/terms" },
    { label: t("links.contact"), href: "/contact" },
  ];

  return (
    <footer className="border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-10 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <span className="font-body-dm-sans text-xl font-extrabold bg-linear-to-r from-teal-500 via-amber-300 to-violet-500 bg-clip-text text-transparent block mb-3">
            PageForge
          </span>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-65">
            {t("tagline")}
          </p>
        </div>

        {/* Links */}
        {[
          { title: t("product"), links: productLinks },
          { title: t("resources"), links: resourceLinks },
          { title: t("company"), links: companyLinks },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4 tracking-wide">
              {col.title}
            </h4>
            <ul className="flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    locale={locale}
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors hover:font-semibold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {t("copyright")}
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              locale={locale}
              className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors hover:font-semibold"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href="/terms"
              locale={locale}
              className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors hover:font-semibold"
            >
              {t("links.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
