import { useTranslations } from "next-intl";

const integrations = [
  { name: "Google Tag Manager", color: "#4285F4" },
  { name: "Facebook Pixel", color: "#1877F2" },
  { name: "Histats", color: "#F57C00" },
  { name: "Shopee", color: "#EE4D2D" },
  { name: "Amazon", color: "#FF9900" },
  { name: "eBay", color: "#0064D2" },
  { name: "OpenAI / Claude AI", color: "#6C5CE7" },
  { name: "WhatsApp", color: "#25D366" },
  { name: "YouTube", color: "#FF0000" },
  { name: "Instagram", color: "#E1306C" },
  { name: "Google Analytics", color: "#4285F4" },
  { name: "Stripe Payments", color: "#00B894" },
  { name: "PayPal", color: "#003087" },
  { name: "Midtrans", color: "#002D62" },
  { name: "TikTok Shop", color: "#F5A623" },
  { name: "Twitter / X", color: "#1DA1F2" },
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "Discord", color: "#5865F2" },
  { name: "Snap Pixel", color: "#FFFC00" },
  { name: "Reddit", color: "#FF4500" },
];

export function IntegrationsSection() {
  const t = useTranslations("HomeSectionIntegrations");

  // Split into two rows
  const row1 = integrations.slice(0, 10);
  const row2 = integrations.slice(10);

  return (
    <section id="integrations" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
        <p className="text-xs font-semibold text-accent-3 uppercase tracking-widest mb-3">
          {t("tag")}
        </p>
        <h2
          className="font-display-syne font-bold leading-tight tracking-tight"
          style={{ fontSize: "clamp(32px,4vw,48px)" }}
        >
          {t("title1")}
          <br />
          {t("title2")}
        </h2>
      </div>

      {/* Ticker Row 1 */}
      <div
        className="flex gap-3 mb-3"
        style={{
          WebkitMask:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          mask: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex gap-3 animate-scroll-left shrink-0">
          {[...row1, ...row1].map((item, i) => (
            <IntegPill key={i} {...item} />
          ))}
        </div>
        <div className="flex gap-3 animate-scroll-left shrink-0" aria-hidden>
          {[...row1, ...row1].map((item, i) => (
            <IntegPill key={i} {...item} />
          ))}
        </div>
      </div>

      {/* Ticker Row 2 */}
      <div
        className="flex gap-3"
        style={{
          WebkitMask:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          mask: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex gap-3 animate-scroll-left-delay shrink-0">
          {[...row2, ...row2].map((item, i) => (
            <IntegPill key={i} {...item} />
          ))}
        </div>
        <div
          className="flex gap-3 animate-scroll-left-delay shrink-0"
          aria-hidden
        >
          {[...row2, ...row2].map((item, i) => (
            <IntegPill key={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegPill({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-2 border border-white/8 rounded-full text-sm text-white/50 whitespace-nowrap font-medium shrink-0 hover:border-white/18 hover:text-white/80 transition-colors">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      {name}
    </div>
  );
}
