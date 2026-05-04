import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import type {
  LandingPageWithProducts,
  ThemeConfig,
  LandingBlock,
} from "@/types/database";
import { VideoBlock } from "@/components/landing-page/video-block";
import {
  getBtnTextColor,
  getCardColors,
  getContainerStyle,
  getInnerStyle,
  getImageStyle,
  getProductGridStyle,
  buildBgStyle,
  RADIUS_MAP,
  SHADOW_MAP,
} from "@/components/landing-page/theme-utils";

interface Props {
  landingPage: LandingPageWithProducts;
}
type ProductItem = NonNullable<
  LandingPageWithProducts["landing_page_products"]
>[0]["product"];

export function BeaconsTheme({ landingPage }: Props) {
  const cfg = landingPage.theme_config;

  const tc: ThemeConfig = {
    primaryColor: cfg.primaryColor ?? "#0ea5e9",
    secondaryColor: cfg.secondaryColor ?? "#38bdf8",
    backgroundColor: cfg.backgroundColor ?? "#0f172a",
    textColor: cfg.textColor ?? "#f1f5f9",
    fontFamily: cfg.fontFamily ?? "Inter",
    borderRadius: cfg.borderRadius ?? "lg",
    buttonStyle: cfg.buttonStyle ?? "filled",
    backgroundType: cfg.backgroundType ?? "solid",
    backgroundGradient: cfg.backgroundGradient,
    backgroundImageUrl: cfg.backgroundImageUrl,
    profileImageUrl: cfg.profileImageUrl,
    coverImageUrl: cfg.coverImageUrl,
    linkStyle: cfg.linkStyle ?? "card",
    shadow: cfg.shadow ?? "lg",
  };

  const products = (landingPage.landing_page_products ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lpp) => lpp.product)
    .filter(Boolean) as NonNullable<ProductItem>[];

  const radius = RADIUS_MAP[tc.borderRadius] ?? "14px";
  const shadow = SHADOW_MAP[tc.shadow ?? "lg"] ?? "none";
  const bgStyle = buildBgStyle(tc);
  const { cardBg, cardBorder } = getCardColors(tc.backgroundColor ?? "#0f172a");
  const visibleBlocks = (landingPage.blocks ?? []).filter((b) => b.visible);

  return (
    <div style={{ ...getContainerStyle(bgStyle, tc.fontFamily, tc.textColor) }}>
      <div style={{ ...getInnerStyle("520px", "3rem 1.25rem 4rem") }}>
        {/* Avatar */}
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
              margin: "0 auto 1.25rem",
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
            margin: "0 0 0.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          {landingPage.title}
        </h1>

        {landingPage.description && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              opacity: 0.65,
              margin: "0 0 2.5rem",
              lineHeight: 1.6,
            }}
          >
            {landingPage.description}
          </p>
        )}

        {visibleBlocks.length > 0 ? (
          <div style={{ width: "100%" }}>
            {visibleBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block as LandingBlock}
                tc={tc}
                radius={radius}
                shadow={shadow}
                cardBg={cardBg}
                cardBorder={cardBorder}
                products={products}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div style={{ width: "100%" }}>
            {products.map((p) =>
              p ? (
                <BeaconsProductCard
                  key={p.id}
                  product={p}
                  tc={tc}
                  radius={radius}
                  shadow={shadow}
                  cardBg={cardBg}
                  cardBorder={cardBorder}
                />
              ) : null,
            )}
          </div>
        ) : null}

        <p
          style={{
            textAlign: "center",
            marginTop: "3rem",
            fontSize: "0.7rem",
            opacity: 0.3,
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
  products,
}: {
  block: Partial<LandingBlock>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  cardBg: string;
  cardBorder: string;
  products: NonNullable<ProductItem>[];
}) {
  const { type, content } = block;

  if (type === "hero") {
    return (
      <div
        style={{
          borderRadius: radius,
          overflow: "hidden",
          marginBottom: "1.5rem",
          width: "100%",
          boxSizing: "border-box",
          background: content?.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url(${content.backgroundImageUrl as string}) center/cover`
            : `linear-gradient(135deg,${tc.primaryColor}cc,${tc.secondaryColor ?? tc.primaryColor}cc)`,
          padding: "2.5rem 1.5rem",
          textAlign: "center",
          boxShadow: shadow,
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.4rem,4vw,1.8rem)",
            fontWeight: 800,
            margin: "0 0 0.5rem",
            color: "#fff",
          }}
        >
          {(content?.headline as string) ?? ""}
        </h2>
        {content?.subheadline && (
          <p
            style={{
              fontSize: "1rem",
              opacity: 0.88,
              margin: "0 0 1.5rem",
              color: "#fff",
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
              padding: "0.65rem 2rem",
              background: "#ffffff",
              color: tc.primaryColor,
              fontWeight: 700,
              borderRadius: radius,
              textDecoration: "none",
              fontSize: "0.95rem",
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
      <a
        href={content.ctaUrl as string}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          textAlign: "center",
          padding: "0.9rem",
          marginBottom: "12px",
          borderRadius: radius,
          width: "100%",
          boxSizing: "border-box",
          background: `linear-gradient(135deg,${tc.primaryColor},${tc.secondaryColor ?? tc.primaryColor})`,
          color: "#ffffff",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: `0 4px 16px ${tc.primaryColor}66`,
          fontSize: "0.95rem",
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
          ...getImageStyle({
            borderRadius: radius,
            marginBottom: "1.25rem",
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
        {el}
      </a>
    ) : (
      el
    );
  }

  if (type === "video" && content?.videoId) {
    return <VideoBlock content={content} radius={radius} />;
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
                color: getBtnTextColor(tc.primaryColor),
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
      <div style={{ marginBottom: "1.25rem", width: "100%" }}>
        {(
          content.items as { name: string; text: string; rating: number }[]
        ).map((item, i) => (
          <div
            key={i}
            style={{
              padding: "1rem",
              marginBottom: "8px",
              borderRadius: radius,
              background: cardBg,
              border: `1px solid ${cardBorder}`,
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
              — {item.name} {"⭐".repeat(Math.min(item.rating ?? 5, 5))}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "faq" && Array.isArray(content?.items)) {
    return (
      <div style={{ marginBottom: "1.25rem", width: "100%" }}>
        {(content.items as { question: string; answer: string }[]).map(
          (item, i) => (
            <details
              key={i}
              style={{
                padding: "0.75rem 1rem",
                marginBottom: "6px",
                borderRadius: radius,
                background: cardBg,
                border: `1px solid ${cardBorder}`,
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
        borderRadius={radius}
        background={cardBg}
        cardBorder={cardBorder}
        primaryColor={tc.primaryColor}
      />
    );
  }

  if (type === "product-single" && content?.productId) {
    const product = products.find((p) => p?.id === content.productId);
    if (!product) return null;
    return (
      <div
        style={{
          marginBottom: "1.25rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <BeaconsProductCard
          product={product}
          tc={tc}
          radius={radius}
          shadow={shadow}
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
      .map((id) => products.find((p) => p?.id === id))
      .filter(Boolean) as NonNullable<ProductItem>[];
    return (
      <div
        style={{
          ...getProductGridStyle(Math.min(cols, 2)),
          marginBottom: "1.5rem",
        }}
      >
        {selected.map((product) => (
          <BeaconsProductCard
            key={product.id}
            product={product}
            tc={tc}
            radius={radius}
            shadow={shadow}
            cardBg={cardBg}
            cardBorder={cardBorder}
          />
        ))}
      </div>
    );
  }

  if (type === "custom-html" && content?.html) {
    return (
      <div
        // biome-ignore lint/security/noDangerouslySetInnerHtml: user-provided HTML
        dangerouslySetInnerHTML={{ __html: content.html as string }}
        style={{ marginBottom: "1rem", width: "100%", boxSizing: "border-box" }}
      />
    );
  }

  return null;
}

function BeaconsProductCard({
  product,
  tc,
  radius,
  shadow,
  cardBg,
  cardBorder,
}: {
  product: NonNullable<ProductItem>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
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
        display: "block",
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        textDecoration: "none",
        color: tc.textColor,
        boxShadow: shadow,
        marginBottom: "1rem",
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
            width: "100%",
            aspectRatio: "16/9",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
      <div style={{ padding: "10px 12px 14px" }}>
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
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
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
            fontSize: "0.88rem",
            margin: "0 0 6px",
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
              marginBottom: "6px",
            }}
          >
            <span style={{ color: "#f59e0b" }}>★</span>
            <span>{product.product_rating.toFixed(1)}</span>
            {product.review_count > 0 && (
              <span style={{ opacity: 0.5 }}>
                ({product.review_count.toLocaleString()})
              </span>
            )}
          </div>
        )}
        {product.price != null && (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "6px",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                color: tc.primaryColor,
              }}
            >
              {/* ── FIX: formatCurrency correct object signature ── */}
              {formatCurrency(product.price, { currency: product.currency })}
            </span>
            {product.original_price != null &&
              product.original_price > product.price && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.45,
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
            padding: "7px",
            textAlign: "center",
            borderRadius: radius,
            background: `linear-gradient(135deg,${tc.primaryColor},${tc.secondaryColor ?? tc.primaryColor})`,
            color: getBtnTextColor(tc.primaryColor),
            fontSize: "0.82rem",
            fontWeight: 700,
            boxShadow: `0 4px 12px ${tc.primaryColor}55`,
          }}
        >
          Get It
        </div>
      </div>
    </a>
  );
}
function CountdownBlock({
  targetDate,
  label = "Offer ends in:",
  borderRadius,
  background,
  cardBorder,
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
        background: background,
        border: `1px solid ${cardBorder}`,
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
          color: primaryColor,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {pad(diff / 86400000)}:{pad((diff % 86400000) / 3600000)}:
        {pad((diff % 3600000) / 60000)}:{pad((diff % 60000) / 1000)}
      </p>
    </div>
  );
}
