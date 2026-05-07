"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink, ShoppingCart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type {
  LandingPageWithProducts,
  ThemeConfig,
  LandingBlock,
} from "@/types/database";
import {
  SHADOW_MAP,
  RADIUS_MAP,
  isLight,
  getCardColors,
  getImageStyle,
  buildBgStyle,
} from "@/components/landing-page/theme-utils";

interface Props {
  landingPage: LandingPageWithProducts;
}
type ProductItem = NonNullable<
  LandingPageWithProducts["landing_page_products"]
>[0]["product"];

export function EcommerceTheme({ landingPage }: Props) {
  const cfg = landingPage.theme_config;
  const tc: ThemeConfig = {
    primaryColor: cfg.primaryColor ?? "#f97316",
    secondaryColor: cfg.secondaryColor ?? "#fb923c",
    backgroundColor: cfg.backgroundColor ?? "#f9fafb",
    textColor: cfg.textColor ?? "#111827",
    fontFamily: cfg.fontFamily ?? "Inter",
    borderRadius: cfg.borderRadius ?? "md",
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
    .filter(Boolean) as NonNullable<ProductItem>[];

  const radius = RADIUS_MAP[tc.borderRadius] ?? "8px";
  const shadow = SHADOW_MAP[tc.shadow ?? "md"] ?? "none";
  const onLight = isLight(tc.backgroundColor ?? "#f9fafb");
  const btnTextColor = isLight(tc.primaryColor) ? "#111827" : "#ffffff";

  const bgStyle = buildBgStyle(tc);
  const { cardBg, cardBorder } = getCardColors(tc.backgroundColor ?? "#0f172a");
  const visibleBlocks = (landingPage.blocks ?? []).filter((b) => b.visible);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        fontFamily: tc.fontFamily,
        color: tc.textColor,
        ...bgStyle,
      }}
    >
      {/* Sticky header */}
      <header
        style={{
          backgroundColor: tc.primaryColor,
          color: "#fff",
          padding: "0.75rem 1rem",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,.15)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {tc.profileImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tc.profileImageUrl}
              alt={landingPage.title}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          )}
          <h1
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 700,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {landingPage.title}
          </h1>
          <ShoppingCart
            style={{
              width: "20px",
              height: "20px",
              flexShrink: 0,
              opacity: 0.8,
            }}
          />
        </div>
      </header>

      <main
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "1.5rem 1rem 4rem",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        {/* Description */}
        {landingPage.description && (
          <p
            style={{
              fontSize: "0.95rem",
              opacity: 0.65,
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            {landingPage.description}
          </p>
        )}

        {/* ── Blocks or product grid fallback ── */}
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(220px, 100%), 1fr))",
              gap: "16px",
              width: "100%",
            }}
          >
            {products.map(
              (product) =>
                product && (
                  <ProductCard
                    key={product.id}
                    product={product}
                    tc={tc}
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
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "2rem 1rem",
          fontSize: "0.75rem",
          opacity: 0.4,
          borderTop: "1px solid rgba(0,0,0,.08)",
          marginTop: "2rem",
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
          borderRadius: radius,
          overflow: "hidden",
          marginBottom: "1.5rem",
          width: "100%",
          boxSizing: "border-box",
          background: content?.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(${content.backgroundImageUrl as string}) center/cover`
            : `linear-gradient(135deg, ${tc.primaryColor}, ${tc.secondaryColor ?? tc.primaryColor})`,
          color: "#fff",
          padding: "clamp(2rem,6vw,3rem) 1.5rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.5rem,4vw,2.2rem)",
            fontWeight: 800,
            margin: "0 0 0.75rem",
          }}
        >
          {(content?.headline as string) ?? ""}
        </h2>
        {content?.subheadline && (
          <p
            style={{
              fontSize: "clamp(0.9rem,2.5vw,1.1rem)",
              opacity: 0.9,
              margin: "0 0 1.5rem",
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
              padding: "0.75rem 2.5rem",
              background: "#fff",
              color: tc.primaryColor,
              fontWeight: 700,
              borderRadius: radius,
              textDecoration: "none",
              fontSize: "1rem",
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
          marginBottom: "1.5rem",
          lineHeight: 1.7,
          fontSize: "0.95rem",
          width: "100%",
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
          borderTop: `1px solid ${onLight ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.12)"}`,
          margin: "1.5rem 0",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    );
  if (type === "spacer")
    return (
      <div
        style={{
          height: `${(content?.height as number) ?? 32}px`,
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    );

  if (type === "image" && content?.url) {
    const img = (
      <Image
        src={content.url as string}
        alt={(content.alt as string) ?? ""}
        width={0}
        height={0}
        sizes="100vw"
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
          marginBottom: "1.5rem",
          width: "100%",
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
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <a
          href={content.ctaUrl as string}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "0.85rem 2.5rem",
            background: tc.primaryColor,
            color: btnTextColor,
            fontWeight: 700,
            borderRadius: radius,
            textDecoration: "none",
            fontSize: "1rem",
            boxShadow: shadow,
          }}
        >
          {(content.text as string) ?? "Shop Now"}
        </a>
      </div>
    );
  }

  if (type === "social-links" && Array.isArray(content?.links)) {
    return (
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "1.5rem",
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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(220px,100%),1fr))",
          gap: "12px",
          marginBottom: "1.5rem",
          width: "100%",
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
              boxSizing: "border-box",
            }}
          >
            <p
              style={{
                margin: "0 0 0.35rem",
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
      <div style={{ marginBottom: "1.5rem", width: "100%" }}>
        {(content.items as { question: string; answer: string }[]).map(
          (item, i) => (
            <details
              key={i}
              style={{
                padding: "0.85rem 1rem",
                marginBottom: "8px",
                borderRadius: radius,
                border: `1px solid ${onLight ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.12)"}`,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <summary style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {item.question}
              </summary>
              <p
                style={{
                  margin: "0.5rem 0 0",
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
        targetDate={content?.targetDate as string}
        label={(content?.label as string) ?? "⏱️ Offer ends in"}
        radius={radius}
        background={tc.primaryColor}
        btnTextColor={btnTextColor}
      />
    );
  }

  if (type === "product-single" && content?.productId) {
    const product = products.find((p) => p.id === content.productId);
    if (!product) return null;
    return (
      <ProductCard
        product={product}
        tc={tc}
        radius={radius}
        shadow={shadow}
        btnTextColor={btnTextColor}
        cardBg={cardBg}
        cardBorder={cardBorder}
      />
    );
  }

  if (
    (type === "product-grid" || type === "product-list") &&
    Array.isArray(content?.productIds)
  ) {
    const cols =
      type === "product-list"
        ? 1
        : Math.min((content?.columns as number) ?? 2, 2);
    const selected = (content.productIds as string[])
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as NonNullable<ProductItem>[];
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
          gap: "16px",
          marginBottom: "1.5rem",
          width: "100%",
        }}
      >
        {selected.map((p) => (
          <ProductCard
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

  return null;
}

function ProductCard({
  product,
  tc,
  radius,
  shadow,
  btnTextColor,
  cardBg,
  cardBorder,
}: {
  product: NonNullable<ProductItem>;
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

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: radius,
        overflow: "hidden",
        boxShadow: shadow,
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
      }}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={product.title}
          style={{
            width: "100%",
            aspectRatio: "4/3",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
      <div style={{ padding: "0.85rem" }}>
        {product.badges.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              flexWrap: "wrap",
              marginBottom: "6px",
            }}
          >
            {product.badges.slice(0, 2).map((b, i) => (
              <span
                key={i}
                style={{
                  fontSize: "0.68rem",
                  padding: "1px 6px",
                  borderRadius: "3px",
                  color: b.color ?? "#fff",
                  background: b.bgColor ?? tc.primaryColor,
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
            margin: "0 0 0.25rem",
            fontWeight: 700,
            fontSize: "0.88rem",
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.title}
        </p>
        {product.shop_name && (
          <p
            style={{ margin: "0 0 0.5rem", fontSize: "0.72rem", opacity: 0.45 }}
          >
            by {product.shop_name}
          </p>
        )}
        {product.product_rating && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "0.5rem",
            }}
          >
            <Star
              style={{
                width: "11px",
                height: "11px",
                fill: "#f59e0b",
                color: "#f59e0b",
              }}
            />
            <span style={{ fontSize: "0.75rem", opacity: 0.65 }}>
              {product.product_rating.toFixed(1)}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          {product.price != null && (
            <span
              style={{
                fontWeight: 700,
                fontSize: "1rem",
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
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            width: "100%",
            padding: "0.55rem",
            background: tc.primaryColor,
            color: btnTextColor,
            fontWeight: 600,
            borderRadius: radius,
            textDecoration: "none",
            fontSize: "0.85rem",
            boxSizing: "border-box",
          }}
        >
          <ExternalLink
            style={{ width: "14px", height: "14px", flexShrink: 0 }}
          />
          Buy Now
        </a>
      </div>
    </div>
  );
}

function CountdownBlock({
  targetDate,
  label = "Offer ends in:",
  radius,
  background,
  btnTextColor,
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
        padding: "1.5rem 1rem",
        marginBottom: "1.5rem",
        borderRadius: radius,
        background: background,
        color: btnTextColor,
        textAlign: "center",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          margin: "0 0 0.5rem",
          fontWeight: 600,
          fontSize: "0.85rem",
          opacity: 0.85,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "clamp(1.5rem,5vw,2.2rem)",
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.05em",
        }}
      >
        {pad(diff / 86400000)}:{pad((diff % 86400000) / 3600000)}:
        {pad((diff % 3600000) / 60000)}:{pad((diff % 60000) / 1000)}
      </p>
    </div>
  );
}
