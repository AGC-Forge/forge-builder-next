import { useTranslations } from "next-intl";

const themes = [
  {
    id: "linktree",
    bg: "linear-gradient(135deg, #0D0D0D, #1a1a2e)",
    preview: (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-8 h-8 rounded-full bg-white" />
        <div className="w-20 h-1.5 rounded bg-white/70" />
        <div className="w-24 h-5 rounded-full bg-white/90" />
        <div className="w-24 h-5 rounded-full bg-white/20" />
      </div>
    ),
  },
  {
    id: "beacons",
    bg: "linear-gradient(135deg, #FF6B6B, #FFE66D)",
    preview: (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-7 h-7 rounded-full bg-white/90" />
        <div className="w-16 h-1.5 rounded bg-white/80" />
        <div className="w-22 h-5 rounded-md bg-black/30" />
        <div className="w-22 h-5 rounded-md bg-black/20" />
      </div>
    ),
  },
  {
    id: "taplink",
    bg: "linear-gradient(135deg, #2D1B69, #11998e)",
    preview: (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-7 h-7 rounded-lg bg-white/85" />
        <div className="w-20 h-1.5 rounded bg-white/70" />
        <div className="grid grid-cols-2 gap-1 w-22">
          <div className="h-7 rounded-lg bg-white/25" />
          <div className="h-7 rounded-lg bg-white/25" />
        </div>
      </div>
    ),
  },
  {
    id: "campsite",
    bg: "linear-gradient(135deg, #fff8f0, #ffd8b3)",
    preview: (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-8 h-8 rounded-full bg-[#ff6b35] flex items-center justify-center text-sm">
          🌿
        </div>
        <div className="w-20 h-1.5 rounded bg-black/30" />
        <div className="w-22.5 h-5 rounded bg-black/12" />
      </div>
    ),
  },
  {
    id: "carrd",
    bg: "linear-gradient(135deg, #f5f5f5, #e8e8e8)",
    preview: (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-22.5 h-7 bg-[#222] rounded-sm flex items-center justify-center">
          <span className="text-[9px] text-white font-bold tracking-widest">
            CARRD.CO
          </span>
        </div>
        <div className="w-20 h-1.5 rounded bg-[#999]" />
        <div className="w-22 h-5 rounded bg-black/10" />
      </div>
    ),
  },
  {
    id: "seedprod",
    bg: "linear-gradient(135deg, #0066FF, #00C8FF)",
    preview: (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-21.25 h-5 rounded bg-white/25" />
        <div className="grid grid-cols-3 gap-1 w-22">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 rounded bg-white/30" />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "lnkbio",
    bg: "linear-gradient(135deg, #FF9500, #FF3B30)",
    preview: (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-7 h-7 rounded-full bg-white/90" />
        <div className="w-16 h-1 rounded bg-white/80" />
        <div className="w-22 h-4 rounded-full bg-white/30" />
        <div className="w-22 h-4 rounded-full bg-white/30" />
      </div>
    ),
  },
  {
    id: "amazon",
    bg: "#131921",
    preview: (
      <div className="flex flex-col gap-1.5 px-2 w-full">
        <span
          className="text-lg font-bold text-[#FF9900]"
          style={{ fontFamily: "serif" }}
        >
          amazon
        </span>
        <div className="grid grid-cols-2 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 rounded bg-[#1F3A5C]" />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "shopee",
    bg: "#EE4D2D",
    preview: (
      <div className="flex flex-col items-center gap-1.5 w-full px-1">
        <span className="text-base font-bold text-white tracking-tight">
          shopee
        </span>
        <div className="grid grid-cols-3 gap-1 w-22">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 rounded bg-white/30" />
          ))}
        </div>
        <div className="w-22 h-3.5 rounded bg-white/50" />
      </div>
    ),
  },
  {
    id: "ai",
    bg: "linear-gradient(135deg,#6C5CE7,#A29BFE)",
    isNew: true,
    preview: (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">
          🤖
        </div>
        <div className="w-16 h-1.5 rounded bg-white/60" />
        <div className="w-22.5 h-5 rounded-lg bg-white/25" />
      </div>
    ),
  },
];

export function ThemesSection() {
  const t = useTranslations("HomeSectionThemes");

  return (
    <section id="themes" className="py-24">
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
        <p className="text-neutral-600 dark:text-neutral-300 font-light max-w-xl">
          {t("subtitle")}
        </p>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="group relative rounded-xl border border-black/15 dark:border-white/8 overflow-hidden cursor-pointer transition-all duration-300 hover:border-black/40 dark:hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-bg-2"
            >
              {theme.isNew && (
                <span className="absolute top-2 right-2 z-10 text-[9px] font-bold px-2 py-0.5 rounded bg-accent text-neutral-900 dark:text-neutral-50 tracking-wide">
                  {t("new")}
                </span>
              )}
              <div
                className="h-25 flex items-center justify-center"
                style={{ background: theme.bg }}
              >
                {theme.preview}
              </div>
              <div className="px-3 py-2.5 border-t border-white/8">
                <p
                  className={`text-xs font-medium ${
                    theme.id === "ai"
                      ? "text-accent-2"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {t(`items.${theme.id}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
