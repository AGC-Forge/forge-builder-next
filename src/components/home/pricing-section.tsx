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
        <p className="text-white/50 font-light max-w-xl mb-14">
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
                    ? "border-accent bg-accent/6 shadow-[0_0_40px_rgba(108,92,231,0.15)]"
                    : "border-white/8 bg-bg-2 hover:border-white/18",
                )}
              >
                {isPro && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-semibold px-4 py-1 rounded-full whitespace-nowrap">
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
                  <span className="font-display-syne text-4xl font-extrabold tracking-tight">
                    {t(`plans.${key}.price`)}
                  </span>
                  <span className="text-white/40 text-sm">{t("mo")}</span>
                </div>

                <p className="text-sm text-white/40 mb-6 leading-relaxed">
                  {t(`plans.${key}.desc`)}
                </p>

                <ul className="flex flex-col gap-3 mb-8">
                  {features.map((f: string) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span className="text-brand-green mt-0.5 shrink-0">
                        ✓
                      </span>
                      <span className="text-white/70">{f}</span>
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
                      key === "business"
                        ? `/${locale}/contact`
                        : `/${locale}/signup?plan=${key}`
                    }
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
