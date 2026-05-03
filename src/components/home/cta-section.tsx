import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const t = useTranslations("HomeSectionCTA");
  const locale = useLocale();

  return (
    <section className="relative py-32 text-center overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-150 h-100 rounded-full bg-[radial-gradient(ellipse,rgba(108,92,231,0.15)_0%,transparent_70%)]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6">
        <h2
          className="font-heading font-extrabold leading-tight tracking-tight mb-5 text-xl"
          style={{ fontSize: "clamp(36px,5vw,62px)" }}
        >
          {t("title1")}
          <br />
          <span className="bg-linear-to-r from-cyan-500 via-amber-400 to-violet-500 bg-clip-text text-transparent">
            {t("title2")}
          </span>
        </h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 font-light mb-10">
          {t("subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register" locale={locale}>
              {t("btn1")}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demos" locale={locale}>
              {t("btn2")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
