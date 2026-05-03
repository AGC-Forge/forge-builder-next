"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type {
  LandingPageWithProducts,
  ThemeConfig,
  LandingBlock,
} from "@/types/database";

interface Props {
  landingPage: LandingPageWithProducts;
}

type Product = NonNullable<
  LandingPageWithProducts["landing_page_products"]
>[0]["product"];

// ── helpers ──────────────────────────────────────────────────
function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 155;
}

const RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "6px",
  md: "12px",
  lg: "16px",
  full: "9999px",
};
const SHADOW_MAP: Record<string, string> = {
  none: "none",
  sm: "0 2px 6px rgba(0,0,0,.1)",
  md: "0 4px 14px rgba(0,0,0,.12)",
  lg: "0 8px 24px rgba(0,0,0,.16)",
};

export function TaplinkTheme({ landingPage }: Props) {
  const cfg = landingPage.theme_config;

  const tc: ThemeConfig = {
    primaryColor: cfg.primaryColor ?? "#7c3aed",
    secondaryColor: cfg.secondaryColor ?? "#a78bfa",
    backgroundColor: cfg.backgroundColor ?? "#faf5ff",
    textColor: cfg.textColor ?? "#1e1b4b",
    fontFamily: cfg.fontFamily ?? "Inter",
    borderRadius: cfg.borderRadius ?? "lg",
    buttonStyle: cfg.buttonStyle ?? "filled",
    backgroundType: cfg.backgroundType ?? "solid",
    backgroundGradient: cfg.backgroundGradient,
    backgroundImageUrl: cfg.backgroundImageUrl,
    profileImageUrl: cfg.profileImageUrl,
    coverImageUrl: cfg.coverImageUrl,
    linkStyle: cfg.linkStyle ?? "button",
    shadow: cfg.shadow ?? "md",
  };

  const products = (landingPage.landing_page_products ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lpp) => lpp.product)
    .filter(Boolean) as NonNullable<Product>[];

  const radius = RADIUS_MAP[tc.borderRadius] ?? "16px";
  const shadow = SHADOW_MAP[tc.shadow ?? "md"] ?? "none";
  const onLight = isLight(tc.backgroundColor ?? "#faf5ff");
  const btnTextColor = isLight(tc.primaryColor) ? "#1a1a1a" : "#ffffff";

  const bgStyle: React.CSSProperties =
    tc.backgroundType === "gradient" && tc.backgroundGradient
      ? { background: tc.backgroundGradient }
      : tc.backgroundType === "image" && tc.backgroundImageUrl
        ? {
            backgroundImage: `url(${tc.backgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { backgroundColor: tc.backgroundColor };

  const visibleBlocks = landingPage.blocks.filter((b) => b.visible);

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: tc.fontFamily,
        color: tc.textColor,
        ...bgStyle,
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          padding: "2.5rem 1rem 4rem",
        }}
      >
        {/* Profile */}
        {tc.profileImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tc.profileImageUrl}
            alt={landingPage.title}
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto 1rem",
              display: "block",
              border: `3px solid ${tc.primaryColor}`,
              boxShadow: `0 0 0 4px ${tc.primaryColor}33`,
            }}
          />
        )}
        <h1
          style={{
            textAlign: "center",
            fontWeight: 800,
            fontSize: "1.5rem",
            margin: "0 0 0.35rem",
            letterSpacing: "-0.02em",
          }}
        >
          {landingPage.title}
        </h1>
        {landingPage.description && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.88rem",
              opacity: 0.65,
              margin: "0 0 2rem",
              lineHeight: 1.6,
            }}
          >
            {landingPage.description}
          </p>
        )}

        {/* Blocks or product grid */}
        {visibleBlocks.length > 0
          ? visibleBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                tc={tc}
                radius={radius}
                shadow={shadow}
                btnTextColor={btnTextColor}
                onLight={onLight}
                products={products}
              />
            ))
          : products.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                {products.map(
                  (p) =>
                    p && (
                      <TaplinkProductBtn
                        key={p.id}
                        product={p}
                        tc={tc}
                        radius={radius}
                        shadow={shadow}
                        btnTextColor={btnTextColor}
                      />
                    ),
                )}
              </div>
            )}

        <p
          style={{
            textAlign: "center",
            marginTop: "3rem",
            fontSize: "0.72rem",
            opacity: 0.35,
          }}
        >
          Powered by SnapLand
        </p>
      </div>
    </div>
  );
}

// ── Block Renderer ───────────────────────────────────────────
function BlockRenderer({
  block,
  tc,
  radius,
  shadow,
  btnTextColor,
  onLight,
  products,
}: {
  block: Partial<LandingBlock>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  btnTextColor: string;
  onLight: boolean;
  products: NonNullable<Product>[];
}) {
  const { type, content } = block;

  if (type === "hero") {
    return (
      <div
        style={{
          borderRadius: radius,
          padding: "2rem 1.5rem",
          marginBottom: "1.5rem",
          textAlign: "center",
          background: content?.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url(${content.backgroundImageUrl as string}) center/cover`
            : `linear-gradient(135deg, ${tc.primaryColor}, ${tc.secondaryColor ?? tc.primaryColor})`,
          color: "#fff",
          boxShadow: shadow,
        }}
      >
        <h2
          style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 0.5rem" }}
        >
          {(content?.headline as string) ?? ""}
        </h2>
        {content?.subheadline && (
          <p
            style={{ opacity: 0.85, margin: "0 0 1.25rem", fontSize: "0.9rem" }}
          >
            {content.subheadline as string}
          </p>
        )}
        {content?.ctaText && content?.ctaUrl && (
          <a
            href={content.ctaUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.6rem 1.6rem",
              background: "#fff",
              color: tc.primaryColor,
              fontWeight: 700,
              borderRadius: radius,
              textDecoration: "none",
              fontSize: "0.88rem",
            }}
          >
            {content.ctaText as string}
          </a>
        )}
      </div>
    );
  }

  if (type === "text") {
    return (
      <p
        style={{
          marginBottom: "1rem",
          lineHeight: 1.7,
          fontSize: "0.9rem",
          opacity: 0.85,
        }}
      >
        {(content?.text as string) ?? ""}
      </p>
    );
  }

  if (type === "divider") {
    return (
      <hr
        style={{
          border: "none",
          borderTop: `1px solid ${onLight ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.12)"}`,
          margin: "1.25rem 0",
        }}
      />
    );
  }

  if (type === "spacer") {
    return <div style={{ height: `${(content?.height as number) ?? 24}px` }} />;
  }

  if (type === "cta-button" && content?.ctaUrl) {
    return (
      <a
        href={content.ctaUrl as string}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          textAlign: "center",
          padding: "0.9rem",
          marginBottom: "10px",
          borderRadius: radius,
          background: tc.primaryColor,
          color: btnTextColor,
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: shadow,
          fontSize: "0.95rem",
        }}
      >
        {(content.text as string) ?? "Click Here"}
      </a>
    );
  }

  if (type === "image" && content?.url) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={content.url as string}
        alt={(content.alt as string) ?? ""}
        style={{
          width: "100%",
          borderRadius: radius,
          marginBottom: "1rem",
          display: "block",
        }}
      />
    );
    return content.link ? (
      <a
        href={content.link as string}
        target="_blank"
        rel="noopener noreferrer"
      >
        {img}
      </a>
    ) : (
      img
    );
  }

  if (type === "product-single" && content?.productId) {
    const product = products.find((p) => p.id === content.productId);
    if (!product) return null;
    return (
      <div style={{ marginBottom: "1rem" }}>
        <TaplinkProductBtn
          product={product}
          tc={tc}
          radius={radius}
          shadow={shadow}
          btnTextColor={btnTextColor}
          wide
        />
      </div>
    );
  }

  if (
    (type === "product-grid" || type === "product-list") &&
    Array.isArray(content?.productIds)
  ) {
    const cols = type === "product-list" ? 1 : 2;
    const selected = (content.productIds as string[])
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as NonNullable<Product>[];
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "10px",
          marginBottom: "1rem",
        }}
      >
        {selected.map((p) => (
          <TaplinkProductBtn
            key={p.id}
            product={p}
            tc={tc}
            radius={radius}
            shadow={shadow}
            btnTextColor={btnTextColor}
            wide={cols === 1}
          />
        ))}
      </div>
    );
  }

  if (type === "social-links" && Array.isArray(content?.links)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {(content.links as { platform: string; url: string; label: string }[])
          .filter((l) => l.url)
          .map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "0.45rem 1rem",
                borderRadius: radius,
                background: tc.primaryColor,
                color: btnTextColor,
                fontWeight: 600,
                fontSize: "0.8rem",
                textDecoration: "none",
              }}
            >
              {link.label}
            </a>
          ))}
      </div>
    );
  }

  if (type === "testimonials" && Array.isArray(content?.items)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "1.25rem",
        }}
      >
        {(
          content.items as { name: string; text: string; rating: number }[]
        ).map((item, i) => (
          <div
            key={i}
            style={{
              padding: "1rem",
              borderRadius: radius,
              background: onLight ? "rgba(0,0,0,.04)" : "rgba(255,255,255,.07)",
              fontSize: "0.85rem",
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: "0 0 0.5rem", fontStyle: "italic" }}>
              &quot;{item.text}&quot;
            </p>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: "0.8rem",
                opacity: 0.75,
              }}
            >
              — {item.name}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "faq" && Array.isArray(content?.items)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginBottom: "1.25rem",
        }}
      >
        {(content.items as { question: string; answer: string }[]).map(
          (item, i) => (
            <details
              key={i}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: radius,
                background: onLight
                  ? "rgba(0,0,0,.04)"
                  : "rgba(255,255,255,.07)",
                cursor: "pointer",
              }}
            >
              <summary style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                {item.question}
              </summary>
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "0.85rem",
                  opacity: 0.8,
                  lineHeight: 1.6,
                }}
              >
                {item.answer}
              </p>
            </details>
          ),
        )}
      </div>
    );
  }

  if (type === "countdown" && content?.targetDate) {
    return (
      <CountdownBlock
        targetDate={content.targetDate as string}
        label={(content.label as string) ?? "Offer ends in:"}
        tc={tc}
        radius={radius}
        onLight={onLight}
      />
    );
  }

  if (type === "custom-html" && content?.html) {
    return (
      // biome-ignore lint/security/noDangerouslySetInnerHtml: user HTML
      <div
        dangerouslySetInnerHTML={{ __html: content.html as string }}
        style={{ marginBottom: "1rem" }}
      />
    );
  }

  return null;
}

// ── TapLink Product Button ───────────────────────────────────
function TaplinkProductBtn({
  product,
  tc,
  radius,
  shadow,
  btnTextColor,
  wide = false,
}: {
  product: NonNullable<Product>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  btnTextColor: string;
  wide?: boolean;
}) {
  const thumb =
    product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url;
  const href = product.affiliate_url ?? product.marketplace_url ?? "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: wide ? "row" : "column",
        alignItems: wide ? "center" : "stretch",
        gap: wide ? "12px" : "0",
        borderRadius: radius,
        overflow: "hidden",
        background: tc.primaryColor,
        color: btnTextColor,
        textDecoration: "none",
        boxShadow: shadow,
        transition: "transform 0.15s, opacity 0.15s",
      }}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={product.title}
          style={{
            width: wide ? "64px" : "100%",
            height: wide ? "64px" : "100px",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      )}
      <div
        style={{
          padding: wide ? "0.75rem 0.75rem 0.75rem 0" : "0.75rem",
          flex: 1,
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "0.85rem",
            lineHeight: 1.3,
          }}
        >
          {product.title}
        </p>
        {product.price != null && (
          <p
            style={{
              margin: "0.25rem 0 0",
              fontWeight: 600,
              fontSize: "0.8rem",
              opacity: 0.85,
            }}
          >
            {formatCurrency(product.price, { currency: product.currency })}
          </p>
        )}
      </div>
    </a>
  );
}

// ── Countdown Block ──────────────────────────────────────────
function CountdownBlock({
  targetDate,
  label,
  tc,
  radius,
  onLight,
}: {
  targetDate: string;
  label: string;
  tc: ThemeConfig;
  radius: string;
  onLight: boolean;
}) {
  const target = new Date(targetDate).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const unit = (n: number, u: string) => (
    <div style={{ textAlign: "center", minWidth: "52px" }}>
      <div style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1 }}>
        {String(n).padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: "0.65rem",
          opacity: 0.6,
          marginTop: "2px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {u}
      </div>
    </div>
  );

  return (
    <div
      style={{
        padding: "1.25rem",
        borderRadius: radius,
        background: onLight ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.08)",
        marginBottom: "1.25rem",
        textAlign: "center",
      }}
    >
      <p
        style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "0.85rem" }}
      >
        {label}
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        {unit(days, "days")}
        <span
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            alignSelf: "flex-start",
            marginTop: "2px",
            opacity: 0.5,
          }}
        >
          :
        </span>
        {unit(hours, "hrs")}
        <span
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            alignSelf: "flex-start",
            marginTop: "2px",
            opacity: 0.5,
          }}
        >
          :
        </span>
        {unit(mins, "min")}
        <span
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            alignSelf: "flex-start",
            marginTop: "2px",
            opacity: 0.5,
          }}
        >
          :
        </span>
        {unit(secs, "sec")}
      </div>
    </div>
  );
}
