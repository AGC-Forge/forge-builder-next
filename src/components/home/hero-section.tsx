import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const t = useTranslations("HomeSectionHero");
  const locale = useLocale();

  const sidebarItems = [
    {
      icon: "🧩",
      label: t("components.hero"),
      active: true,
      color: "bg-accent/15",
    },
    { icon: "🔗", label: t("components.link"), color: "bg-blue-300/10" },
    { icon: "🖼", label: t("components.image"), color: "bg-blue-400/20" },
    { icon: "🛒", label: t("components.product"), color: "bg-green-400/10" },
    { icon: "📊", label: t("components.stats"), color: "bg-cyan-400/10" },
  ];

  const settingsItems = [
    { icon: "🎨", label: t("components.theme"), color: "bg-white/5" },
    { icon: "🌐", label: t("components.slug"), color: "bg-white/5" },
    { icon: "🤖", label: t("components.ai"), color: "bg-white/5" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden">
      {/* Glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-55%] w-175 h-175 rounded-full bg-[radial-gradient(circle,rgba(108,92,231,0.15)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute top-[30%] right-[10%] w-100 h-100 rounded-full bg-[radial-gradient(circle,rgba(0,206,201,0.08)_0%,transparent_70%)]" />

      {/* Badge */}
      <Badge className="mb-7 animate-fade-up bg-linear-to-r from-sky-400 via-blue-500 to-indigo-600 text-white">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        {t("badge")}
      </Badge>

      {/* Headline */}
      <h1
        className="font-heading bg-linear-to-r font-extrabold leading-[1.05] tracking-[-0.04em] mb-6 animate-fade-up bg-clip-text text-transparent from-emerald-200 to-fuchsia-200"
        style={{ fontSize: "clamp(42px, 6vw, 76px)", animationDelay: "0.1s" }}
      >
        {t("title1")}
        <br />
        <span className="bg-linear-to-r from-violet-500 via-cyan-600 to-amber-400 bg-clip-text text-transparent">
          {t("title2")}
        </span>
        <br />
        {t("title3")}
      </h1>

      {/* Subtitle */}
      <p
        className="text-lg text-neutral-700 dark:text-neutral-300 max-w-145 mb-10 font-light leading-relaxed animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        {t("subtitle")}
      </p>

      {/* CTAs */}
      <div
        className="flex flex-wrap items-center justify-center gap-3 mb-16 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        <Button size="lg" asChild>
          <Link href="/register" locale={locale}>
            {t("cta1")}
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/demos" locale={locale}>
            {t("cta2")}
          </Link>
        </Button>
      </div>

      {/* Browser Mockup */}
      <div
        className="w-full max-w-225 bg-bg-2 border border-neutral-300 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] animate-fade-up"
        style={{ animationDelay: "0.4s" }}
      >
        {/* Browser Bar */}
        <div className="flex items-center gap-2 px-5 py-3.5 bg-bg-3 border-b border-neutral-300 dark:border-neutral-700">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28CA40]" />
          <div className="flex-1 flex justify-center">
            <div className="bg-muted border border-neutral-300 dark:border-neutral-600 rounded-md px-3 py-1 text-xs text-muted-foreground text-center w-full max-w-xs">
              {t("previewUrl")}
            </div>
          </div>
        </div>

        {/* Builder Preview */}
        <div className="grid grid-cols-[220px_1fr] min-h-70">
          {/* Sidebar */}
          <div className="bg-sidebar border-r border-border p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2.5">
              {t("previewComponents")}
            </p>
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md mb-1 text-xs cursor-pointer transition-colors ${
                  item.active
                    ? "bg-muted text-neutral-800 dark:text-neutral-100 font-semibold"
                    : "text-muted-foreground hover:text-neutral-600 dark:hover:text-neutral-300 hover:font-medium"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0 ${item.color}`}
                >
                  {item.icon}
                </span>
                {item.label}
              </div>
            ))}

            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2.5">
                {t("previewSettings")}
              </p>
              {settingsItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-md mb-1 text-xs text-muted-foreground hover:text-neutral-600 dark:hover:text-neutral-300 hover:font-medium cursor-pointer transition-colors"
                >
                  <span
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0 ${item.color}`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="p-5 flex flex-col gap-2.5">
            <div className="h-17.5 rounded-lg border-[1.5px] border-dashed border-neutral-300 dark:border-neutral-700 bg-muted flex items-center justify-center text-xs font-medium text-blue-500 dark:text-blue-600">
              {t("heroBlock")}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12.5 rounded-lg border-[1.5px] border-dashed border-neutral-300 dark:border-neutral-700 bg-muted/50 flex items-center justify-center text-xs text-muted-foreground"
                >
                  {t("feature")}
                </div>
              ))}
            </div>
            <div className="h-9 rounded-lg border-[1.5px] border-dashed border-blue-400 dark:border-blue-500 bg-blue-400/20 dark:bg-blue-600/20 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-200">
              {t("ctaBlock")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
