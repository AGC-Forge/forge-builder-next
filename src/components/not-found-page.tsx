import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function NotFoundPage() {
  const locale = useLocale();
  const t = useTranslations("NotFoundPage");
  return (
    <div className="flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl animate-bounce">
            {t("title")}
          </h1>
          <p className="text-neutral-500">{t("description")}</p>
        </div>
        <Link
          href="/"
          locale={locale}
          className="inline-flex h-10 items-center rounded-md bg-neutral-900 px-8 text-sm font-medium text-neutral-50 shadow transition-colors hover:bg-neutral-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90 dark:focus-visible:ring-neutral-300"
          prefetch={false}
        >
          {t("link")}
        </Link>
      </div>
    </div>
  );
}
