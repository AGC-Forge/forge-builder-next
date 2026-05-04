"use client";

import { useState, useEffect, useMemo } from "react";
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

export function CarrdTheme({ landingPage }: Props) {
  const cfg = landingPage.theme_config;

  const tc: ThemeConfig = {
    primaryColor: cfg.primaryColor ?? "#0f766e",
    secondaryColor: cfg.secondaryColor ?? "#14b8a6",
    backgroundColor: cfg.backgroundColor ?? "#0d1117",
    textColor: cfg.textColor ?? "#e2e8f0",
    fontFamily: cfg.fontFamily ?? "Inter",
    borderRadius: cfg.borderRadius ?? "md",
    buttonStyle: cfg.buttonStyle ?? "filled",
    backgroundType: cfg.backgroundType ?? "gradient",
    backgroundGradient:
      cfg.backgroundGradient ??
      "linear-gradient(160deg, #0d1117 0%, #0f2027 50%, #1a1a2e 100%)",
    backgroundImageUrl: cfg.backgroundImageUrl,
    profileImageUrl: cfg.profileImageUrl,
    coverImageUrl: cfg.coverImageUrl,
    shadow: cfg.shadow ?? "md",
  };

  const products = (landingPage.landing_page_products ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lpp) => lpp.product)
    .filter(Boolean) as NonNullable<Product>[];

  const radius = RADIUS_MAP[tc.borderRadius] ?? "8px";
  const shadow = SHADOW_MAP[tc.shadow ?? "md"] ?? "none";
  const onLight = isLight(tc.backgroundColor ?? "#0d1117");
  const btnTextColor = isLight(tc.primaryColor) ? "#0d1117" : "#ffffff";
  const bgStyle = buildBgStyle(tc);
  const { cardBg, cardBorder } = getCardColors(tc.backgroundColor ?? "#0f172a");
  const visibleBlocks = landingPage.blocks.filter((b) => b.visible);

  return (
    <div style={{ ...getContainerStyle(bgStyle, tc.fontFamily, tc.textColor) }}>
      {/* ── Hero Header Section ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 2rem",
          textAlign: "center",
          position: "relative",
        }}
      >
        {tc.profileImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tc.profileImageUrl}
            alt={landingPage.title}
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "1.5rem",
              border: `2px solid ${tc.primaryColor}`,
            }}
          />
        )}
        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 900,
            margin: "0 0 1rem",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            background: `linear-gradient(135deg, ${tc.primaryColor}, ${tc.secondaryColor ?? tc.primaryColor})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {landingPage.title}
        </h1>
        {landingPage.description && (
          <p
            style={{
              fontSize: "1.1rem",
              opacity: 0.6,
              maxWidth: "520px",
              lineHeight: 1.7,
              margin: "0 auto 2rem",
            }}
          >
            {landingPage.description}
          </p>
        )}
        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.4,
            fontSize: "1.2rem",
          }}
        >
          ↓
        </div>
      </section>

      {/* ── Content Sections ── */}
      <div
        style={{
          maxWidth: "780px",
          margin: "0 auto",
          padding: "0 1.5rem 6rem",
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
                cardBg={cardBg}
                cardBorder={cardBorder}
                btnTextColor={btnTextColor}
                onLight={onLight}
                products={products}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <section style={{ padding: "3rem 0" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                margin: "0 0 1.5rem",
                opacity: 0.9,
              }}
            >
              Products
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              {products.map(
                (p) =>
                  p && (
                    <CarrdProductCard
                      key={p.id}
                      product={p}
                      tc={tc}
                      radius={radius}
                      shadow={shadow}
                      cardBg={cardBg}
                      cardBorder={cardBorder}
                      btnTextColor={btnTextColor}
                    />
                  ),
              )}
            </div>
          </section>
        ) : null}
      </div>

      <footer
        style={{
          textAlign: "center",
          padding: "2rem",
          fontSize: "0.72rem",
          opacity: 0.25,
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
  cardBg,
  cardBorder,
  btnTextColor,
  onLight,
  products,
}: {
  block: Partial<LandingBlock>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  cardBg: string;
  cardBorder: string;
  btnTextColor: string;
  onLight: boolean;
  products: NonNullable<Product>[];
}) {
  const { type, content } = block;

  if (type === "hero") {
    return (
      <section
        style={{
          padding: "4rem 0",
          textAlign: "center",
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
              marginBottom: "2rem",
              maxHeight: "300px",
              objectFit: "cover",
            }}
          />
        )}
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            margin: "0 0 0.75rem",
            letterSpacing: "-0.03em",
          }}
        >
          {(content?.headline as string) ?? ""}
        </h2>
        {content?.subheadline && (
          <p
            style={{
              opacity: 0.6,
              margin: "0 auto 1.5rem",
              lineHeight: 1.7,
              maxWidth: "480px",
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
              padding: "0.75rem 2rem",
              background: `linear-gradient(135deg, ${tc.primaryColor}, ${tc.secondaryColor ?? tc.primaryColor})`,
              color: btnTextColor,
              fontWeight: 700,
              borderRadius: radius,
              textDecoration: "none",
              fontSize: "0.95rem",
              boxShadow: `0 4px 20px ${tc.primaryColor}55`,
            }}
          >
            {content.ctaText as string}
          </a>
        )}
      </section>
    );
  }

  if (type === "text") {
    return (
      <section
        style={{
          padding: "2rem 0",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <p style={{ lineHeight: 1.8, opacity: 0.75, fontSize: "0.97rem" }}>
          {(content?.text as string) ?? ""}
        </p>
      </section>
    );
  }

  if (type === "divider") {
    return (
      <hr
        style={{
          border: "none",
          borderTop: `1px solid ${cardBorder}`,
          margin: "1.5rem 0",
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
      <section
        style={{
          padding: "1rem 0",
          textAlign: "center",
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
            padding: "0.85rem 2.5rem",
            background: `linear-gradient(135deg, ${tc.primaryColor}, ${tc.secondaryColor ?? tc.primaryColor})`,
            color: btnTextColor,
            fontWeight: 700,
            borderRadius: radius,
            textDecoration: "none",
            fontSize: "1rem",
            boxShadow: `0 4px 20px ${tc.primaryColor}44`,
          }}
        >
          {(content.text as string) ?? "Get Started"}
        </a>
      </section>
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
            marginBottom: "1.25rem",
            boxShadow: shadow,
          }),
        }}
      />
    );
    return (
      <section style={{ padding: "1rem 0" }}>
        {content.link ? (
          <a
            href={content.link as string}
            target="_blank"
            rel="noopener noreferrer"
          >
            {img}
          </a>
        ) : (
          img
        )}
      </section>
    );
  }

  if (type === "product-single" && content?.productId) {
    const product = products.find((p) => p.id === content.productId);
    if (!product) return null;
    return (
      <section
        style={{
          padding: "2rem 0",
          width: "100%",
          boxSizing: "border-box",
          marginBottom: "1.25rem",
        }}
      >
        <CarrdProductCard
          product={product}
          tc={tc}
          radius={radius}
          shadow={shadow}
          cardBg={cardBg}
          cardBorder={cardBorder}
          btnTextColor={btnTextColor}
        />
      </section>
    );
  }

  if (
    (type === "product-grid" || type === "product-list") &&
    Array.isArray(content?.productIds)
  ) {
    const cols =
      type === "product-list" ? 1 : ((content?.columns as number) ?? 3);
    const selected = (content.productIds as string[])
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as NonNullable<Product>[];
    return (
      <section
        style={{
          padding: "2rem 0",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            ...getProductGridStyle(Math.min(cols, 3)),
            marginBottom: "1.5rem",
          }}
        >
          {selected.map((p) => (
            <CarrdProductCard
              key={p.id}
              product={p}
              tc={tc}
              radius={radius}
              shadow={shadow}
              cardBg={cardBg}
              cardBorder={cardBorder}
              btnTextColor={btnTextColor}
            />
          ))}
        </div>
      </section>
    );
  }

  if (type === "social-links" && Array.isArray(content?.links)) {
    return (
      <section
        style={{
          padding: "1rem 0",
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
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
                padding: "0.5rem 1.2rem",
                border: `1px solid ${cardBorder}`,
                borderRadius: radius,
                fontSize: "0.85rem",
                color: tc.textColor,
                textDecoration: "none",
                background: cardBg,
              }}
            >
              {link.label}
            </a>
          ))}
      </section>
    );
  }

  if (type === "testimonials" && Array.isArray(content?.items)) {
    return (
      <section
        style={{
          padding: "2rem 0",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {(
            content.items as { name: string; text: string; rating: number }[]
          ).map((item, i) => (
            <div
              key={i}
              style={{
                padding: "1.5rem",
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: radius,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <p
                style={{
                  margin: "0 0 0.75rem",
                  fontStyle: "italic",
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                  opacity: 0.85,
                }}
              >
                &quot;{item.text}&quot;
              </p>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  opacity: 0.5,
                }}
              >
                — {item.name}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (type === "faq" && Array.isArray(content?.items)) {
    return (
      <section
        style={{
          padding: "2rem 0",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {(content.items as { question: string; answer: string }[]).map(
          (item, i) => (
            <details
              key={i}
              style={{
                padding: "1rem 1.25rem",
                marginBottom: "8px",
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: radius,
                cursor: "pointer",
              }}
            >
              <summary style={{ fontWeight: 600, fontSize: "0.92rem" }}>
                {item.question}
              </summary>
              <p
                style={{
                  margin: "0.75rem 0 0",
                  fontSize: "0.88rem",
                  opacity: 0.7,
                  lineHeight: 1.65,
                }}
              >
                {item.answer}
              </p>
            </details>
          ),
        )}
      </section>
    );
  }

  if (type === "countdown" && content?.targetDate) {
    return (
      <CountdownBlock
        targetDate={content.targetDate as string}
        label={content.label as string | undefined}
        cardBg={cardBg}
        cardBorder={cardBorder}
        borderRadius={radius}
        textColor={tc.textColor}
      />
    );
  }

  if (type === "custom-html" && content?.html) {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: user HTML
    return (
      <section
        style={{
          padding: "1rem 0",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: content.html as string }} />
      </section>
    );
  }
  if (type === "video" && content?.videoId) {
    return <VideoBlock content={content} radius={radius} />;
  }

  return null;
}

function CarrdProductCard({
  product,
  tc,
  radius,
  shadow,
  cardBg,
  cardBorder,
  btnTextColor,
}: {
  product: NonNullable<Product>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  cardBg: string;
  cardBorder: string;
  btnTextColor: string;
}) {
  const thumb =
    product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url;
  const href = product.affiliate_url ?? product.marketplace_url ?? "#";
  const hasDiscount =
    product.original_price != null &&
    product.original_price > (product.price ?? 0);

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: radius,
        overflow: "hidden",
        boxShadow: shadow,
      }}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={product.title}
          style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
        />
      )}
      <div style={{ padding: "1rem" }}>
        <p
          style={{
            margin: "0 0 0.25rem",
            fontWeight: 700,
            fontSize: "0.9rem",
            lineHeight: 1.3,
          }}
        >
          {product.title}
        </p>
        {product.subtitle && (
          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.78rem",
              opacity: 0.55,
            }}
          >
            {product.subtitle}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "0.75rem",
          }}
        >
          {product.price != null && (
            <span
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: tc.primaryColor,
              }}
            >
              {formatCurrency(product.price, { currency: product.currency })}
            </span>
          )}
          {hasDiscount && (
            <span
              style={{
                fontSize: "0.75rem",
                opacity: 0.45,
                textDecoration: "line-through",
              }}
            >
              {formatCurrency(product.original_price!, {
                currency: product.currency,
              })}
            </span>
          )}
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            padding: "0.55rem",
            background: tc.primaryColor,
            color: btnTextColor,
            fontWeight: 600,
            borderRadius: radius,
            textDecoration: "none",
            fontSize: "0.83rem",
          }}
        >
          Shop Now
        </a>
      </div>
    </div>
  );
}
export function CountdownBlock({
  targetDate,
  label = "Offer ends in",
  cardBg,
  cardBorder,
  borderRadius,
  textColor,
}: CountdownBlockProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const parts = useMemo<CountdownPart[]>(() => {
    const diff = Math.max(0, new Date(targetDate).getTime() - now);

    return [
      { value: Math.floor(diff / 86400000), unit: "Days" },
      { value: Math.floor((diff % 86400000) / 3600000), unit: "Hours" },
      { value: Math.floor((diff % 3600000) / 60000), unit: "Min" },
      { value: Math.floor((diff % 60000) / 1000), unit: "Sec" },
    ];
  }, [targetDate, now]);

  return (
    <section
      style={{
        padding: "2rem 0",
        textAlign: "center",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          fontWeight: 600,
          fontSize: "0.85rem",
          margin: "0 0 1rem",
          opacity: 0.6,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: textColor,
        }}
      >
        {label}
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        {parts.map(({ value, unit }) => (
          <div
            key={unit}
            style={{
              padding: "1rem 1.25rem",
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: borderRadius,
              minWidth: "72px",
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(value).padStart(2, "0")}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                opacity: 0.5,
                marginTop: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {unit}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
