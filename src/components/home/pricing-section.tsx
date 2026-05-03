import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const planKeys = ["free", "pro", "business"] as const;
type PlanKey = (typeof planKeys)[number];

export function PricingSection() {
  const t = useTranslations("HomeSectionPricing");
  const locale = useLocale();

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <p className="text-xs font-semibold text-accent-3 uppercase tracking-widest mb-3">
          {t("tag")}
        </p>
        <h2
          className="font-display-syne font-bold leading-tight tracking-tight mb-4"
          style={{ fontSize: "clamp(32px,4vw,48px)" }}
        >
          {t("title1")}
          <br />
          {t("title2")}
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 font-light max-w-xl mb-14">
          {t("subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {planKeys.map((key) => {
            const isPro = key === "pro";
            const features = t.raw(`plans.${key}.features`) as string[];

            return (
              <div
                key={key}
                className={cn(
                  "relative border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1",
                  isPro
                    ? "border-black/30 dark:border-white/20 bg-muted/20 shadow-[0_0_40px_rgba(108,92,231,0.15)]"
                    : "border-black/10 dark:border-white/8 bg-bg-2 hover:border-black/20 dark:hover:border-white/18",
                )}
              >
                {isPro && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-neutral-900 dark:text-neutral-50 text-[11px] font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                    {t("popular")}
                  </span>
                )}

                <div
                  className={cn(
                    "font-display-syne text-lg font-bold mb-2",
                    isPro && "text-accent-2",
                  )}
                >
                  {t(`plans.${key}.name`)}
                </div>

                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-body-dm-sans text-4xl font-extrabold tracking-tight">
                    {t(`plans.${key}.price`)}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-200 text-sm">
                    {t("mo")}
                  </span>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
                  {t(`plans.${key}.desc`)}
                </p>

                <ul className="flex flex-col gap-3 mb-8">
                  {features.map((f: string) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span className="text-brand-green mt-0.5 shrink-0">
                        ✓
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isPro ? "default" : "outline"}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link
                    href={
                      key === "business" ? `/contact` : `/register?plan=${key}`
                    }
                    locale={locale}
                  >
                    {t(`plans.${key}.cta`)}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
