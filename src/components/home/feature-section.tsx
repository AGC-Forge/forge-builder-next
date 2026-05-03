import { useTranslations } from "next-intl";

const featureIcons: Record<string, { icon: string; bg: string }> = {
  dragdrop: { icon: "🧩", bg: "bg-accent/15" },
  slug: { icon: "🔗", bg: "bg-accent-3/10" },
  product: { icon: "🛒", bg: "bg-brand-amber/10" },
  i18n: { icon: "🌐", bg: "bg-brand-green/10" },
  ai: { icon: "🤖", bg: "bg-accent/12" },
  analytics: { icon: "📊", bg: "bg-brand-coral/10" },
  dashboard: { icon: "📈", bg: "bg-accent-3/10" },
  theme: { icon: "🎨", bg: "bg-brand-amber/12" },
};

const featureKeys = [
  "dragdrop",
  "slug",
  "product",
  "i18n",
  "ai",
  "analytics",
  "dashboard",
  "theme",
] as const;

type FeatureKey = (typeof featureKeys)[number];

export function FeaturesSection() {
  const t = useTranslations("HomeSectionFeatures");

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <p className="text-xs font-semibold text-accent-3 uppercase tracking-widest mb-3">
          {t("tag")}
        </p>
        <h2
          className="font-display-syne font-bold leading-tight tracking-tight mb-16"
          style={{ fontSize: "clamp(32px,4vw,48px)" }}
        >
          {t("title1")}
          <br />
          {t("title2")}
        </h2>

        {/* Bento grid layout */}
        <div className="border border-black/15 dark:border-white/8 rounded-2xl overflow-hidden divide-y divide-black/15 dark:divide-white/8">
          {/* Row 1: dragdrop (wide) + slug */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/15 dark:divide-white/8">
            <FeatureCell
              featureKey="dragdrop"
              t={t}
              span="md:col-span-2"
              accent
            />
            <FeatureCell featureKey="slug" t={t} />
          </div>

          {/* Row 2: product + i18n + ai */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/15 dark:divide-white/8">
            <FeatureCell featureKey="product" t={t} />
            <FeatureCell featureKey="i18n" t={t} />
            <FeatureCell featureKey="ai" t={t} />
          </div>

          {/* Row 3: analytics + dashboard (wide) */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/15 dark:divide-white/8">
            <FeatureCell featureKey="analytics" t={t} />
            <FeatureCell
              featureKey="dashboard"
              t={t}
              span="md:col-span-2"
              accentTeal
            />
          </div>

          {/* Row 4: theme (full) */}
          <div className="grid grid-cols-1">
            <FeatureCell featureKey="theme" t={t} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCell({
  featureKey,
  t,
  span = "",
  accent = false,
  accentTeal = false,
}: {
  featureKey: FeatureKey;
  t: any;
  span?: string;
  accent?: boolean;
  accentTeal?: boolean;
}) {
  const { icon, bg } = featureIcons[featureKey];

  return (
    <div
      className={`
        group p-8 bg-bg-2 hover:bg-bg-3 transition-colors duration-200 ${span}
        ${accent ? "bg-linear-to-br from-accent/6 to-bg-2" : ""}
        ${accentTeal ? "bg-linear-to-br from-accent-3/[0.04] to-bg-2" : ""}
      `}
    >
      <div
        className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center text-xl mb-5`}
      >
        {icon}
      </div>
      <h3 className="font-display-syne text-lg font-semibold tracking-tight mb-2.5">
        {t(`items.${featureKey}.title`)}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        {t(`items.${featureKey}.desc`)}
      </p>
    </div>
  );
}
