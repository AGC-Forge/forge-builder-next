import { useTranslations } from "next-intl";

export function StatsSection() {
  const t = useTranslations("HomeSectionStats");

  const stats = [
    { value: "50K+", label: t("pages") },
    { value: "10+", label: t("themes") },
    { value: "99.9%", label: t("uptime") },
    { value: "2×", label: t("conversion") },
  ];

  return (
    <section className="py-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x dark:divide-white/8 divide-black/15 border dark:border-white/8 border-black/15 rounded-2xl overflow-hidden">
          {stats.map((stat, i) => (
            <div key={i} className="bg-bg-2 py-10 px-8 text-center">
              <div className="font-body-dm-sans text-4xl md:text-5xl font-extrabold tracking-[-0.04em] bg-linear-to-b from-neutral-600 to-neutral-400 dark:from-white dark:to-white/40 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
