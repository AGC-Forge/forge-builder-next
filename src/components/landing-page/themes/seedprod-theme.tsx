"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type {
  LandingPageWithProducts,
  ThemeConfig,
  LandingBlock,
} from "@/types/database";
import { VideoBlock } from "@/components/landing-page/video-block";
import {
  SHADOW_MAP,
  RADIUS_MAP,
  isLight,
  getCardColors,
  getContainerStyle,
  getInnerStyle,
  getImageStyle,
  getProductGridStyle,
  buildBgStyle,
} from "@/components/landing-page/theme-utils";

interface Props {
  landingPage: LandingPageWithProducts;
}

type Product = NonNullable<
  LandingPageWithProducts["landing_page_products"]
>[0]["product"];

export function SeedprodTheme({ landingPage }: Props) {
  const cfg = landingPage.theme_config;

  const tc: ThemeConfig = {
    primaryColor: cfg.primaryColor ?? "#dc2626",
    secondaryColor: cfg.secondaryColor ?? "#ef4444",
    backgroundColor: cfg.backgroundColor ?? "#ffffff",
    textColor: cfg.textColor ?? "#111827",
    fontFamily: cfg.fontFamily ?? "Inter",
    borderRadius: cfg.borderRadius ?? "sm",
    buttonStyle: cfg.buttonStyle ?? "filled",
    backgroundType: cfg.backgroundType ?? "solid",
    backgroundGradient: cfg.backgroundGradient,
    backgroundImageUrl: cfg.backgroundImageUrl,
    profileImageUrl: cfg.profileImageUrl,
    coverImageUrl: cfg.coverImageUrl,
    shadow: cfg.shadow ?? "md",
  };

  const products = (landingPage.landing_page_products ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lpp) => lpp.product)
    .filter(Boolean) as NonNullable<Product>[];

  const radius = RADIUS_MAP[tc.borderRadius] ?? "4px";
  const shadow = SHADOW_MAP[tc.shadow ?? "md"] ?? "none";
  const onLight = isLight(tc.backgroundColor ?? "#ffffff");
  const btnTextColor = isLight(tc.primaryColor) ? "#111827" : "#ffffff";

  const bgStyle = buildBgStyle(tc);
  const { cardBg, cardBorder } = getCardColors(tc.backgroundColor ?? "#0f172a");
  const visibleBlocks = (landingPage.blocks ?? []).filter((b) => b.visible);

  return (
    <div style={{ ...getContainerStyle(bgStyle, tc.fontFamily, tc.textColor) }}>
      {/* ── Top urgency bar ── */}
      <div
        style={{
          background: tc.primaryColor,
          color: btnTextColor,
          textAlign: "center",
          padding: "0.6rem 1rem",
          fontSize: "0.82rem",
          fontWeight: 600,
        }}
      >
        🔥 Limited Time Offer — Order Now Before Stock Runs Out!
      </div>

      {/* ── Hero ── */}
      <header
        style={{
          textAlign: "center",
          padding: "3rem 1.5rem 2rem",
          borderBottom: `3px solid ${tc.primaryColor}`,
        }}
      >
        {tc.profileImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tc.profileImageUrl}
            alt={landingPage.title}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto 1rem",
              display: "block",
            }}
          />
        )}
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
            fontWeight: 900,
            margin: "0 0 0.75rem",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
          }}
        >
          {landingPage.title}
        </h1>
        {landingPage.description && (
          <p
            style={{
              fontSize: "1.05rem",
              opacity: 0.7,
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            {landingPage.description}
          </p>
        )}
      </header>

      {/* ── Content ── */}
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "2rem 1.5rem 5rem",
        }}
      >
        {visibleBlocks.length > 0 ? (
          <div style={{ width: "100%" }}>
            {visibleBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                tc={tc}
                radius={radius}
                shadow={shadow}
                btnTextColor={btnTextColor}
                accentBg={cardBg}
                cardBorder={cardBorder}
                cardBg={cardBg}
                onLight={onLight}
                products={products}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div style={{ width: "100%" }}>
            {products.map((p) =>
              p ? (
                <SeedprodProductCard
                  key={p.id}
                  product={p}
                  tc={tc}
                  radius={radius}
                  shadow={shadow}
                  btnTextColor={btnTextColor}
                  cardBg={cardBg}
                  cardBorder={cardBorder}
                />
              ) : null,
            )}
          </div>
        ) : null}
      </div>

      <footer
        style={{
          textAlign: "center",
          padding: "1.5rem",
          fontSize: "0.72rem",
          opacity: 0.4,
          borderTop: `1px solid ${cardBorder}`,
        }}
      >
        Powered by SnapLand
      </footer>
    </div>
  );
}

function BlockRenderer({
  block,
  tc,
  radius,
  shadow,
  btnTextColor,
  accentBg,
  cardBg,
  cardBorder,
  onLight,
  products,
}: {
  block: Partial<LandingBlock>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  btnTextColor: string;
  accentBg: string;
  cardBg: string;
  cardBorder: string;
  onLight: boolean;
  products: NonNullable<Product>[];
}) {
  const { type, content } = block;

  if (type === "hero") {
    return (
      <div
        style={{
          marginBottom: "2.5rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {content?.backgroundImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.backgroundImageUrl as string}
            alt=""
            style={{
              width: "100%",
              borderRadius: radius,
              marginBottom: "1.5rem",
              maxHeight: "280px",
              objectFit: "cover",
            }}
          />
        )}
        <h2
          style={{
            fontSize: "1.9rem",
            fontWeight: 800,
            margin: "0 0 0.75rem",
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          {(content?.headline as string) ?? ""}
        </h2>
        {content?.subheadline && (
          <p
            style={{
              opacity: 0.7,
              margin: "0 0 1.5rem",
              lineHeight: 1.65,
              fontSize: "1rem",
            }}
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
              padding: "1rem 2.5rem",
              background: tc.primaryColor,
              color: btnTextColor,
              fontWeight: 800,
              borderRadius: radius,
              textDecoration: "none",
              fontSize: "1.05rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              boxShadow: `0 4px 20px ${tc.primaryColor}55`,
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
          marginBottom: "1.5rem",
          lineHeight: 1.8,
          opacity: 0.85,
          fontSize: "0.97rem",
          width: "100%",
          boxSizing: "border-box",
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
          borderTop: `2px solid ${tc.primaryColor}`,
          margin: "2rem 0",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    );
  }

  if (type === "spacer") {
    return (
      <div
        style={{
          height: `${(content?.height as number) ?? 32}px`,
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    );
  }

  if (type === "cta-button" && content?.ctaUrl) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "1rem 0 2rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <a
          href={content.ctaUrl as string}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "1.1rem 3rem",
            background: tc.primaryColor,
            color: btnTextColor,
            fontWeight: 800,
            borderRadius: radius,
            textDecoration: "none",
            fontSize: "1.1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            boxShadow: `0 6px 24px ${tc.primaryColor}55`,
          }}
        >
          {(content.text as string) ?? "Order Now →"}
        </a>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", opacity: 0.4 }}>
          ✓ Secure Checkout &nbsp; ✓ Fast Delivery &nbsp; ✓ Money-Back Guarantee
        </p>
      </div>
    );
  }

  if (type === "image" && content?.url) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={content.url as string}
        alt={(content.alt as string) ?? ""}
        style={{
          ...getImageStyle({
            borderRadius: radius,
            marginBottom: "1.5rem",
            boxShadow: shadow,
          }),
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
      <div
        style={{
          marginBottom: "1.25rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <SeedprodProductCard
          product={product}
          tc={tc}
          radius={radius}
          shadow={shadow}
          btnTextColor={btnTextColor}
          cardBg={cardBg}
          cardBorder={cardBorder}
        />
      </div>
    );
  }

  if (
    (type === "product-grid" || type === "product-list") &&
    Array.isArray(content?.productIds)
  ) {
    const cols =
      type === "product-list" ? 1 : ((content?.columns as number) ?? 2);
    const selected = (content.productIds as string[])
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as NonNullable<Product>[];
    return (
      <div
        style={{
          ...getProductGridStyle(Math.min(cols, 2)),
          flexDirection: "column",
          marginBottom: "2rem",
        }}
      >
        {selected.map((p) => (
          <SeedprodProductCard
            key={p.id}
            product={p}
            tc={tc}
            radius={radius}
            shadow={shadow}
            btnTextColor={btnTextColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
          />
        ))}
      </div>
    );
  }

  if (type === "testimonials" && Array.isArray(content?.items)) {
    return (
      <div
        style={{ marginBottom: "2rem", width: "100%", boxSizing: "border-box" }}
      >
        <h3
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 1rem",
            opacity: 0.6,
          }}
        >
          What Customers Say
        </h3>
        {(
          content.items as { name: string; text: string; rating: number }[]
        ).map((item, i) => (
          <div
            key={i}
            style={{
              padding: "1rem 1.25rem",
              marginBottom: "10px",
              background: accentBg,
              borderLeft: `3px solid ${tc.primaryColor}`,
              borderRadius: `0 ${radius} ${radius} 0`,
            }}
          >
            <p
              style={{
                margin: "0 0 0.35rem",
                fontStyle: "italic",
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              &quot;{item.text}&quot;
            </p>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: "0.78rem",
                opacity: 0.6,
              }}
            >
              — {item.name} {"⭐".repeat(Math.min(item.rating ?? 5, 5))}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "faq" && Array.isArray(content?.items)) {
    return (
      <div
        style={{ marginBottom: "2rem", width: "100%", boxSizing: "border-box" }}
      >
        <h3
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 1rem",
            opacity: 0.6,
          }}
        >
          FAQ
        </h3>
        {(content.items as { question: string; answer: string }[]).map(
          (item, i) => (
            <details
              key={i}
              style={{
                padding: "0.85rem 1rem",
                marginBottom: "8px",
                border: `1px solid ${cardBorder}`,
                borderRadius: radius,
                cursor: "pointer",
              }}
            >
              <summary style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {item.question}
              </summary>
              <p
                style={{
                  margin: "0.6rem 0 0",
                  fontSize: "0.87rem",
                  opacity: 0.75,
                  lineHeight: 1.65,
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
        btnTextColor={btnTextColor}
        label={content.label as string}
        radius={radius}
        primaryColor={tc.primaryColor}
      />
    );
  }

  if (type === "social-links" && Array.isArray(content?.links)) {
    return (
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          boxSizing: "border-box",
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
                border: `1px solid ${cardBorder}`,
                borderRadius: radius,
                fontSize: "0.82rem",
                color: tc.textColor,
                textDecoration: "none",
              }}
            >
              {link.label}
            </a>
          ))}
      </div>
    );
  }

  if (type === "custom-html" && content?.html) {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: user HTML
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content.html as string }}
        style={{
          marginBottom: "1.5rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    );
  }
  if (type === "video" && content?.videoId) {
    return <VideoBlock content={content} radius={radius} />;
  }

  return null;
}

function SeedprodProductCard({
  product,
  tc,
  radius,
  shadow,
  btnTextColor,
  cardBg,
  cardBorder,
}: {
  product: NonNullable<Product>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  btnTextColor: string;
  cardBg: string;
  cardBorder: string;
}) {
  const thumb =
    product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url;
  const href = product.affiliate_url ?? product.marketplace_url ?? "#";
  const hasDiscount =
    product.original_price != null &&
    product.original_price > (product.price ?? 0);
  const discountPct = hasDiscount
    ? Math.round(
        ((product.original_price! - (product.price ?? 0)) /
          product.original_price!) *
          100,
      )
    : null;

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        border: `2px solid ${cardBorder}`,
        borderRadius: radius,
        overflow: "hidden",
        boxShadow: shadow,
        alignItems: "flex-start",
        backgroundColor: cardBg,
      }}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={product.title}
          style={{
            width: "140px",
            flexShrink: 0,
            objectFit: "cover",
            alignSelf: "stretch",
          }}
        />
      )}
      <div style={{ flex: 1, padding: "1rem 1rem 1rem 0" }}>
        {product.badges.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              flexWrap: "wrap",
              marginBottom: "6px",
            }}
          >
            {product.badges.map((b, i) => (
              <span
                key={i}
                style={{
                  fontSize: "0.7rem",
                  padding: "2px 7px",
                  borderRadius: "3px",
                  color: b.color ?? "#fff",
                  background: b.bgColor ?? tc.primaryColor,
                  fontWeight: 600,
                }}
              >
                {b.text}
              </span>
            ))}
            {discountPct && (
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "2px 7px",
                  borderRadius: "3px",
                  color: "#fff",
                  background: "#dc2626",
                  fontWeight: 600,
                }}
              >
                DISKON {discountPct}%
              </span>
            )}
          </div>
        )}
        <p
          style={{
            margin: "0 0 0.35rem",
            fontWeight: 700,
            fontSize: "0.95rem",
            lineHeight: 1.3,
          }}
        >
          {product.title}
        </p>
        {product.shop_name && (
          <p
            style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", opacity: 0.5 }}
          >
            by {product.shop_name}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "0 0 0.75rem",
          }}
        >
          {product.price != null && (
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                color: tc.primaryColor,
              }}
            >
              {formatCurrency(product.price, { currency: product.currency })}
            </span>
          )}
          {hasDiscount && (
            <span
              style={{
                fontSize: "0.8rem",
                opacity: 0.4,
                textDecoration: "line-through",
              }}
            >
              {formatCurrency(product.original_price!, {
                currency: product.currency,
              })}
            </span>
          )}
        </div>
        {product.sold_count > 0 && (
          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.75rem",
              opacity: 0.55,
            }}
          >
            ✓ {product.sold_count.toLocaleString()} terjual
          </p>
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "0.6rem 1.5rem",
            background: tc.primaryColor,
            color: btnTextColor,
            fontWeight: 700,
            borderRadius: radius,
            textDecoration: "none",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.03em",
          }}
        >
          Beli Sekarang →
        </a>
      </div>
    </div>
  );
}

function CountdownBlock({
  targetDate,
  btnTextColor,
  label,
  radius,
  primaryColor,
}: CountdownBlockProps) {
  const [diff, setDiff] = useState(() =>
    Math.max(0, new Date(targetDate).getTime() - Date.now()),
  );

  useEffect(() => {
    const calculateDiff = () => {
      setDiff(Math.max(0, new Date(targetDate).getTime() - Date.now()));
    };

    calculateDiff();

    const timer = setInterval(calculateDiff, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

  return (
    <div
      style={{
        background: primaryColor,
        color: btnTextColor,
        padding: "1.5rem",
        borderRadius: radius,
        textAlign: "center",
        marginBottom: "2rem",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          fontWeight: 700,
          fontSize: "0.85rem",
          margin: "0 0 0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label ?? "⚠️ Offer Expires In"}
      </p>
      <p
        style={{
          fontSize: "2.5rem",
          fontWeight: 900,
          margin: 0,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.05em",
        }}
      >
        {pad(diff / 86400000)}:{pad((diff % 86400000) / 3600000)}:
        {pad((diff % 3600000) / 60000)}:{pad((diff % 60000) / 1000)}
      </p>
      <p style={{ fontSize: "0.72rem", margin: "0.25rem 0 0", opacity: 0.7 }}>
        days : hours : minutes : seconds
      </p>
    </div>
  );
}
