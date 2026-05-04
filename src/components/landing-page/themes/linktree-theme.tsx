"use client";

import { useState, useEffect } from "react";
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
  getBtnTextColor,
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
type ProductItem = NonNullable<
  LandingPageWithProducts["landing_page_products"]
>[0]["product"];

export function LinktreeTheme({ landingPage }: Props) {
  const cfg = landingPage.theme_config;
  const tc: ThemeConfig = {
    primaryColor: cfg.primaryColor ?? "#6366f1",
    secondaryColor: cfg.secondaryColor ?? "#8b5cf6",
    backgroundColor: cfg.backgroundColor ?? "#f8fafc",
    textColor: cfg.textColor ?? "#1e293b",
    fontFamily: cfg.fontFamily ?? "Inter",
    borderRadius: cfg.borderRadius ?? "lg",
    buttonStyle: cfg.buttonStyle ?? "filled",
    backgroundType: cfg.backgroundType ?? "solid",
    backgroundGradient: cfg.backgroundGradient,
    backgroundImageUrl: cfg.backgroundImageUrl,
    profileImageUrl: cfg.profileImageUrl,
    coverImageUrl: cfg.coverImageUrl,
    linkStyle: cfg.linkStyle ?? "card",
    shadow: cfg.shadow ?? "md",
  };

  const products = (landingPage.landing_page_products ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lpp) => lpp.product)
    .filter(Boolean) as NonNullable<ProductItem>[];

  const radius = RADIUS_MAP[tc.borderRadius] ?? "14px";
  const shadow = SHADOW_MAP[tc.shadow ?? "md"] ?? "none";
  const onLight = isLight(tc.backgroundColor ?? "#f8fafc");
  const btnTextColor = isLight(tc.primaryColor) ? "#1a1a1a" : "#ffffff";

  const bgStyle = buildBgStyle(tc);
  const { cardBg, cardBorder } = getCardColors(tc.backgroundColor ?? "#0f172a");
  const visibleBlocks = (landingPage.blocks ?? []).filter((b) => b.visible);

  return (
    <div style={{ ...getContainerStyle(bgStyle, tc.fontFamily, tc.textColor) }}>
      <div style={{ ...getInnerStyle("480px", "2.5rem 1rem 4rem") }}>
        {/* Profile */}
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
              border: `3px solid ${tc.primaryColor}`,
            }}
          />
        )}
        <h1
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.4rem",
            margin: "0 0 0.3rem",
            letterSpacing: "-0.01em",
          }}
        >
          {landingPage.title}
        </h1>
        {landingPage.description && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.88rem",
              opacity: 0.6,
              margin: "0 0 2rem",
              lineHeight: 1.6,
            }}
          >
            {landingPage.description}
          </p>
        )}

        {/* ── BLOCKS (if any) — renders ALL block types ── */}
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
                onLight={onLight}
                products={products}
                cardBg={cardBg}
                cardBorder={cardBorder}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          /* Fallback: render products as link cards when no blocks */
          <div style={{ width: "100%" }}>
            {products.map(
              (p) =>
                p && (
                  <LinktreeProductCard
                    key={p.id}
                    product={p}
                    radius={radius}
                    shadow={shadow}
                    btnTextColor={btnTextColor}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                  />
                ),
            )}
          </div>
        ) : null}

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
function BlockRenderer({
  block,
  tc,
  radius,
  shadow,
  btnTextColor,
  onLight,
  products,
  cardBg,
  cardBorder,
}: {
  block: Partial<LandingBlock>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  btnTextColor: string;
  onLight: boolean;
  products: NonNullable<ProductItem>[];
  cardBg: string;
  cardBorder: string;
}) {
  const { type, content } = block;

  if (type === "hero") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem 1rem",
          marginBottom: "1rem",
          borderRadius: radius,
          boxSizing: "border-box",
          width: "100%",
          background: content?.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url(${content.backgroundImageUrl as string}) center/cover`
            : tc.primaryColor,
          color: "#fff",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.3rem,4vw,1.8rem)",
            fontWeight: 800,
            margin: "0 0 0.5rem",
          }}
        >
          {(content?.headline as string) ?? ""}
        </h2>
        {content?.subheadline && (
          <p
            style={{
              opacity: 0.85,
              margin: "0 0 1.25rem",
              fontSize: "0.95rem",
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
              padding: "0.6rem 1.8rem",
              background: "#fff",
              color: tc.primaryColor,
              fontWeight: 700,
              borderRadius: radius,
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            {content.ctaText as string}
          </a>
        )}
      </div>
    );
  }

  if (type === "text")
    return (
      <p
        style={{
          marginBottom: "1rem",
          lineHeight: 1.7,
          fontSize: "0.9rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {(content?.text as string) ?? ""}
      </p>
    );

  if (type === "divider")
    return (
      <hr
        style={{
          border: "none",
          borderTop: `1px solid ${onLight ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.15)"}`,
          margin: "1.25rem 0",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    );

  if (type === "spacer")
    return (
      <div
        style={{
          height: `${(content?.height as number) ?? 24}px`,
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    );

  if (type === "image" && content?.url) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={content.url as string}
        alt={(content.alt as string) ?? ""}
        style={{
          ...getImageStyle({
            borderRadius: radius,
            marginBottom: "1rem",
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

  if (type === "video" && content?.videoId) {
    const embedUrl =
      content.platform === "tiktok"
        ? `https://www.tiktok.com/embed/v2/${content.videoId}`
        : `https://www.youtube.com/embed/${content.videoId}?rel=0`;
    return (
      <div
        style={{
          position: "relative",
          paddingBottom: content.platform === "tiktok" ? "177.78%" : "56.25%",
          height: 0,
          overflow: "hidden",
          borderRadius: radius,
          marginBottom: "1rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <iframe
          src={embedUrl}
          title="video"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allowFullScreen
        />
      </div>
    );
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
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {(content.text as string) ?? "Click Here"}
      </a>
    );
  }

  if (type === "social-links" && Array.isArray(content?.links)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "1rem",
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
                padding: "0.45rem 1rem",
                borderRadius: radius,
                background: tc.primaryColor,
                color: btnTextColor,
                fontWeight: 600,
                fontSize: "0.82rem",
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
          marginBottom: "1.25rem",
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
              padding: "1rem",
              marginBottom: "8px",
              borderRadius: radius,
              background: onLight ? "rgba(0,0,0,.04)" : "rgba(255,255,255,.07)",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <p
              style={{
                margin: "0 0 0.4rem",
                fontStyle: "italic",
                fontSize: "0.88rem",
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
          marginBottom: "1.25rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {(content.items as { question: string; answer: string }[]).map(
          (item, i) => (
            <details
              key={i}
              style={{
                padding: "0.75rem 1rem",
                marginBottom: "6px",
                borderRadius: radius,
                background: onLight
                  ? "rgba(0,0,0,.04)"
                  : "rgba(255,255,255,.07)",
                cursor: "pointer",
                boxSizing: "border-box",
                width: "100%",
              }}
            >
              <summary style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {item.question}
              </summary>
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "0.85rem",
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
        label={(content.label as string) ?? "Offer ends in:"}
        borderRadius={radius}
        background={onLight ? "rgba(0,0,0,.04)" : "rgba(255,255,255,.07)"}
        primaryColor={tc.primaryColor}
      />
    );
  }

  if (type === "product-single" && content?.productId) {
    const product = products.find((p) => p.id === content.productId);
    if (!product) return null;
    return (
      <div
        style={{
          marginBottom: "1rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <LinktreeProductCard
          product={product}
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
    const selected = (content.productIds as string[])
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as NonNullable<ProductItem>[];
    return (
      <div
        style={{
          display: "flex",
          flexDirection: type === "product-list" ? "column" : "row",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "1rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {selected.map((p) => (
          <div
            key={p.id}
            style={{
              flex:
                type === "product-list" ? "1 1 100%" : "1 1 calc(50% - 5px)",
              minWidth: 0,
            }}
          >
            <LinktreeProductCard
              product={p}
              radius={radius}
              shadow={shadow}
              btnTextColor={btnTextColor}
              cardBg={cardBg}
              cardBorder={cardBorder}
            />
          </div>
        ))}
      </div>
    );
  }

  if (type === "custom-html" && content?.html) {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: user HTML
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content.html as string }}
        style={{ marginBottom: "1rem", width: "100%", boxSizing: "border-box" }}
      />
    );
  }

  return null;
}
function BlockRendererOld({
  block,
  tc,
  radius,
  shadow,
  products,
}: {
  block: Partial<LandingBlock>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  products: NonNullable<
    LandingPageWithProducts["landing_page_products"]
  >[0]["product"][];
}) {
  const { type, content } = block;

  if (type === "hero") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem 1rem",
          marginBottom: "1.5rem",
          borderRadius: radius,
          background: content?.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.4)), url(${content.backgroundImageUrl}) center/cover`
            : tc.primaryColor,
          color: "#ffffff",
        }}
      >
        <h2
          style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 0.5rem" }}
        >
          {(content?.headline as string) ?? ""}
        </h2>
        {content?.subheadline && (
          <p style={{ fontSize: "1rem", opacity: 0.85, margin: "0 0 1.5rem" }}>
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
              padding: "0.6rem 1.8rem",
              background: "#ffffff",
              color: tc.primaryColor,
              fontWeight: 700,
              borderRadius: radius,
              textDecoration: "none",
              fontSize: "0.9rem",
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
      <div style={{ marginBottom: "1rem", lineHeight: 1.6 }}>
        {(content?.text as string) ?? ""}
      </div>
    );
  }

  if (type === "divider") {
    return (
      <hr
        style={{
          border: "none",
          borderTop: `1px solid ${(content?.color as string) ?? "#e2e8f0"}`,
          margin: "1.5rem 0",
        }}
      />
    );
  }

  if (type === "spacer") {
    return <div style={{ height: `${(content?.height as number) ?? 32}px` }} />;
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
          padding: "0.8rem",
          marginBottom: "12px",
          borderRadius: radius,
          background: tc.primaryColor,
          color: "#ffffff",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: shadow,
        }}
      >
        {(content.text as string) ?? "Click Here"}
      </a>
    );
  }

  if (type === "image" && content?.url) {
    const el = (
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
        {el}
      </a>
    ) : (
      el
    );
  }

  if (type === "product-single" && content?.productId) {
    const product = products.find((p) => p?.id === content.productId);
    if (!product) return null;
    return (
      <ProductCard product={product} tc={tc} radius={radius} shadow={shadow} />
    );
  }

  if (
    (type === "product-grid" || type === "product-list") &&
    Array.isArray(content?.productIds)
  ) {
    const selectedProducts = (content?.productIds as string[])
      .map((id) => products.find((p) => p?.id === id))
      .filter(Boolean);
    const cols = (content.columns as number) ?? 2;
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            type === "product-list"
              ? "1fr"
              : `repeat(${Math.min(cols, 2)}, 1fr)`,
          gap: "12px",
          marginBottom: "1.5rem",
        }}
      >
        {selectedProducts.map(
          (product) =>
            product && (
              <ProductCard
                key={product.id}
                product={product}
                tc={tc}
                radius={radius}
                shadow={shadow}
              />
            ),
        )}
      </div>
    );
  }

  if (type === "custom-html" && content?.html) {
    return (
      <div
        // biome-ignore lint/security/noDangerouslySetInnerHtml: user-provided custom HTML block
        dangerouslySetInnerHTML={{ __html: content.html as string }}
        style={{ marginBottom: "1rem" }}
      />
    );
  }
  if (type === "video" && content?.videoId) {
    return <VideoBlock content={content} radius={radius} />;
  }

  return null;
}
function ProductCard({
  product,
  tc,
  radius,
  shadow,
}: {
  product: NonNullable<
    LandingPageWithProducts["landing_page_products"]
  >[0]["product"];
  tc: ThemeConfig;
  radius: string;
  shadow: string;
}) {
  if (!product) return null;
  const thumb =
    product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url;
  const href = product.affiliate_url ?? product.marketplace_url ?? "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        borderRadius: radius,
        overflow: "hidden",
        boxShadow: shadow,
        backgroundColor: "#ffffff",
        textDecoration: "none",
        color: tc.textColor,
        border: "1px solid rgba(0,0,0,.06)",
      }}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={product.title}
          style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }}
        />
      )}
      <div style={{ padding: "10px 12px 12px" }}>
        {product.badges.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              flexWrap: "wrap",
              marginBottom: "4px",
            }}
          >
            {product.badges.map((b, i) => (
              <span
                key={i}
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  color: b.color ?? "#fff",
                  backgroundColor: b.bgColor ?? tc.primaryColor,
                  fontWeight: 600,
                }}
              >
                {b.text}
              </span>
            ))}
          </div>
        )}
        <p
          style={{
            fontWeight: 600,
            fontSize: "0.85rem",
            margin: "0 0 4px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.title}
        </p>
        {product.product_rating != null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "11px",
              marginBottom: "4px",
            }}
          >
            <span style={{ color: "#f59e0b" }}>★</span>
            <span>{product.product_rating.toFixed(1)}</span>
            {product.review_count > 0 && (
              <span style={{ opacity: 0.6 }}>
                ({product.review_count.toLocaleString()})
              </span>
            )}
          </div>
        )}
        {product.price != null && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: tc.primaryColor,
              }}
            >
              {formatCurrency(product.price, { currency: product.currency })}
            </span>
            {product.original_price &&
              product.original_price > product.price && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.5,
                    textDecoration: "line-through",
                  }}
                >
                  {formatCurrency(product.original_price, {
                    currency: product.currency,
                  })}
                </span>
              )}
          </div>
        )}
        <div
          style={{
            marginTop: "8px",
            padding: "6px",
            textAlign: "center",
            borderRadius: radius,
            backgroundColor: tc.primaryColor,
            color: "#ffffff",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          Buy Now
        </div>
      </div>
    </a>
  );
}
function LinktreeProductCard({
  product,
  radius,
  shadow,
  btnTextColor,
  cardBg,
  cardBorder,
}: {
  product: NonNullable<ProductItem>;
  radius: string;
  shadow: string;
  btnTextColor: string;
  cardBg: string;
  cardBorder: string;
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
        padding: "0.85rem 1rem",
        marginBottom: "10px",
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: radius,
        color: btnTextColor,
        textDecoration: "none",
        boxShadow: shadow,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={product.title}
          style={{
            width: "48px",
            height: "48px",
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
            fontWeight: 700,
            fontSize: "0.9rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.title}
        </p>
        {product.price != null && (
          <p style={{ margin: "2px 0 0", fontSize: "0.8rem", opacity: 0.8 }}>
            {formatCurrency(product.price, { currency: product.currency })}
          </p>
        )}
      </div>
      <span style={{ opacity: 0.6, flexShrink: 0 }}>→</span>
    </a>
  );
}
function CountdownBlock({
  targetDate,
  label = "Offer ends in:",
  borderRadius,
  background,
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
        padding: "1rem",
        marginBottom: "1rem",
        borderRadius: borderRadius,
        background: background ?? "rgba(255,255,255,.07)",
        textAlign: "center",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: "0.82rem" }}>
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "1.75rem",
          fontWeight: 800,
          color: primaryColor ?? "#ffffff",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {pad(diff / 86400000)}:{pad((diff % 86400000) / 3600000)}:
        {pad((diff % 3600000) / 60000)}:{pad((diff % 60000) / 1000)}
      </p>
    </div>
  );
}
