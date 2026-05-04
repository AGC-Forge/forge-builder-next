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

export function LnkbioTheme({ landingPage }: Props) {
  const cfg = landingPage.theme_config;

  const tc: ThemeConfig = {
    primaryColor: cfg.primaryColor ?? "#f59e0b",
    secondaryColor: cfg.secondaryColor ?? "#fbbf24",
    backgroundColor: cfg.backgroundColor ?? "#18181b",
    textColor: cfg.textColor ?? "#fafafa",
    fontFamily: cfg.fontFamily ?? "Inter",
    borderRadius: cfg.borderRadius ?? "lg",
    buttonStyle: cfg.buttonStyle ?? "filled",
    backgroundType: cfg.backgroundType ?? "solid",
    backgroundGradient: cfg.backgroundGradient,
    backgroundImageUrl: cfg.backgroundImageUrl,
    profileImageUrl: cfg.profileImageUrl,
    coverImageUrl: cfg.coverImageUrl,
    linkStyle: cfg.linkStyle ?? "card",
    shadow: cfg.shadow ?? "sm",
  };

  const products = (landingPage.landing_page_products ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lpp) => lpp.product)
    .filter(Boolean) as NonNullable<Product>[];

  const radius = RADIUS_MAP[tc.borderRadius] ?? "16px";
  const shadow = SHADOW_MAP[tc.shadow ?? "sm"] ?? "none";
  const onLight = isLight(tc.backgroundColor ?? "#18181b");
  const btnTextColor = isLight(tc.primaryColor) ? "#18181b" : "#ffffff";

  const bgStyle = buildBgStyle(tc);
  const { cardBg, cardBorder } = getCardColors(tc.backgroundColor ?? "#0f172a");
  const visibleBlocks = (landingPage.blocks ?? []).filter((b) => b.visible);

  return (
    <div style={{ ...getContainerStyle(bgStyle, tc.fontFamily, tc.textColor) }}>
      <div style={{ ...getInnerStyle("440px", "2rem 1rem 4rem") }}>
        {/* Avatar + identity compact */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "1.5rem",
            width: "100%",
          }}
        >
          {tc.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tc.profileImageUrl}
              alt={landingPage.title}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
                border: `2px solid ${tc.primaryColor}`,
              }}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: tc.primaryColor,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.3rem",
                color: btnTextColor,
              }}
            >
              {landingPage.title.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {landingPage.title}
            </h1>
            {landingPage.description && (
              <p
                style={{
                  fontSize: "0.78rem",
                  opacity: 0.55,
                  margin: "2px 0 0",
                  lineHeight: 1.4,
                }}
              >
                {landingPage.description}
              </p>
            )}
          </div>
        </div>

        {/* Thin accent line */}
        <div
          style={{
            height: "2px",
            background: `linear-gradient(90deg, ${tc.primaryColor}, transparent)`,
            marginBottom: "1.25rem",
            borderRadius: "1px",
          }}
        />

        {/* Blocks */}
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
          <div style={{ width: "100%" }}>
            {products.map((p) =>
              p ? (
                <LnkbioLink
                  key={p.id}
                  product={p}
                  tc={tc}
                  radius={radius}
                  shadow={shadow}
                  cardBg={cardBg}
                  cardBorder={cardBorder}
                  btnTextColor={btnTextColor}
                />
              ) : null,
            )}
          </div>
        ) : null}

        <p
          style={{
            textAlign: "center",
            marginTop: "2.5rem",
            fontSize: "0.7rem",
            opacity: 0.25,
          }}
        >
          Powered by SnapLand
        </p>
      </div>
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
      <div
        style={{
          padding: "1.25rem",
          marginBottom: "12px",
          borderRadius: radius,
          background: content?.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url(${content.backgroundImageUrl as string}) center/cover`
            : `linear-gradient(135deg, ${tc.primaryColor}, ${tc.secondaryColor ?? tc.primaryColor})`,
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h2
          style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.3rem" }}
        >
          {(content?.headline as string) ?? ""}
        </h2>
        {content?.subheadline && (
          <p
            style={{
              opacity: 0.85,
              margin: "0 0 0.8rem",
              fontSize: "0.82rem",
              lineHeight: 1.5,
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
              padding: "0.45rem 1.2rem",
              background: "rgba(255,255,255,.2)",
              border: "1.5px solid rgba(255,255,255,.6)",
              color: "#fff",
              fontWeight: 700,
              borderRadius: radius,
              textDecoration: "none",
              fontSize: "0.82rem",
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
          marginBottom: "0.75rem",
          lineHeight: 1.65,
          fontSize: "0.85rem",
          opacity: 0.75,
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
          borderTop: `1px solid ${cardBorder}`,
          margin: "0.75rem 0",
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
      <a
        href={content.ctaUrl as string}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.8rem 1rem",
          marginBottom: "10px",
          borderRadius: radius,
          background: tc.primaryColor,
          color: btnTextColor,
          fontWeight: 700,
          textDecoration: "none",
          fontSize: "0.88rem",
          boxShadow: shadow,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <span>{(content.text as string) ?? "Click Here"}</span>
        <span style={{ opacity: 0.7 }}>→</span>
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
          ...getImageStyle({
            borderRadius: radius,
            marginBottom: "10px",
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
        <LnkbioLink
          product={product}
          tc={tc}
          radius={radius}
          shadow={shadow}
          cardBg={cardBg}
          cardBorder={cardBorder}
          btnTextColor={btnTextColor}
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
          marginBottom: "10px",
        }}
      >
        {selected.map((p) => (
          <LnkbioLink
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
    );
  }

  if (type === "social-links" && Array.isArray(content?.links)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "12px",
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
                padding: "0.35rem 0.9rem",
                borderRadius: "9999px",
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                fontSize: "0.75rem",
                color: tc.textColor,
                textDecoration: "none",
                fontWeight: 600,
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
          marginBottom: "12px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {(
          content.items as { name: string; text: string; rating: number }[]
        ).map((item, i) => (
          <div
            key={i}
            style={{
              padding: "0.75rem 1rem",
              marginBottom: "8px",
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: radius,
            }}
          >
            <p
              style={{
                margin: "0 0 0.25rem",
                fontStyle: "italic",
                fontSize: "0.82rem",
                lineHeight: 1.55,
                opacity: 0.85,
              }}
            >
              &quot;{item.text}&quot;
            </p>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: "0.72rem",
                opacity: 0.5,
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
          marginBottom: "12px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {(content.items as { question: string; answer: string }[]).map(
          (item, i) => (
            <details
              key={i}
              style={{
                padding: "0.65rem 0.9rem",
                marginBottom: "6px",
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: radius,
                cursor: "pointer",
              }}
            >
              <summary style={{ fontWeight: 600, fontSize: "0.83rem" }}>
                {item.question}
              </summary>
              <p
                style={{
                  margin: "0.4rem 0 0",
                  fontSize: "0.8rem",
                  opacity: 0.7,
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
        label={content.label as string}
        cardBg={cardBg}
        cardBorder={cardBorder}
        radius={radius}
        primaryColor={tc.primaryColor}
      />
    );
  }

  if (type === "custom-html" && content?.html) {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: user HTML
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content.html as string }}
        style={{
          marginBottom: "10px",
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

function LnkbioLink({
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

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "0.7rem 0.85rem",
        marginBottom: "8px",
        borderRadius: radius,
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        textDecoration: "none",
        color: tc.textColor,
        boxShadow: shadow,
      }}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={product.title}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "8px",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: "0.85rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.title}
        </p>
        {product.price != null && (
          <p
            style={{
              margin: "1px 0 0",
              fontSize: "0.75rem",
              color: tc.primaryColor,
              fontWeight: 700,
            }}
          >
            {formatCurrency(product.price, { currency: product.currency })}
          </p>
        )}
      </div>
      <span
        style={{
          flexShrink: 0,
          padding: "0.25rem 0.65rem",
          borderRadius: "9999px",
          background: tc.primaryColor,
          color: btnTextColor,
          fontSize: "0.7rem",
          fontWeight: 700,
        }}
      >
        Beli
      </span>
    </a>
  );
}

function CountdownBlock({
  targetDate,
  label = "Offer ends in:",
  cardBg,
  cardBorder,
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
        padding: "0.85rem 1rem",
        marginBottom: "12px",
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: radius,
        textAlign: "center",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          margin: "0 0 0.35rem",
          fontSize: "0.75rem",
          opacity: 0.6,
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "1.5rem",
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          color: primaryColor,
        }}
      >
        {pad(diff / 86400000)}:{pad((diff % 86400000) / 3600000)}:
        {pad((diff % 3600000) / 60000)}:{pad((diff % 60000) / 1000)}
      </p>
    </div>
  );
}
