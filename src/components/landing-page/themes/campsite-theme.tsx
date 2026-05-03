"use client";

import { useEffect, useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import type {
  LandingPageWithProducts,
  ThemeConfig,
  LandingBlock,
} from "@/types/database";
import { VideoBlock } from "@/components/landing-page/video-block";

interface Props {
  landingPage: LandingPageWithProducts;
}

type Product = NonNullable<
  LandingPageWithProducts["landing_page_products"]
>[0]["product"];

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
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
};
const SHADOW_MAP: Record<string, string> = {
  none: "none",
  sm: "0 1px 4px rgba(0,0,0,.07)",
  md: "0 3px 10px rgba(0,0,0,.09)",
  lg: "0 6px 20px rgba(0,0,0,.12)",
};

export function CampsiteTheme({ landingPage }: Props) {
  const cfg = landingPage.theme_config;

  const tc: ThemeConfig = {
    primaryColor: cfg.primaryColor ?? "#111827",
    secondaryColor: cfg.secondaryColor ?? "#374151",
    backgroundColor: cfg.backgroundColor ?? "#ffffff",
    textColor: cfg.textColor ?? "#111827",
    fontFamily: cfg.fontFamily ?? "Inter",
    borderRadius: cfg.borderRadius ?? "md",
    buttonStyle: cfg.buttonStyle ?? "outlined",
    backgroundType: cfg.backgroundType ?? "solid",
    backgroundGradient: cfg.backgroundGradient,
    backgroundImageUrl: cfg.backgroundImageUrl,
    profileImageUrl: cfg.profileImageUrl,
    coverImageUrl: cfg.coverImageUrl,
    linkStyle: cfg.linkStyle ?? "minimal",
    shadow: cfg.shadow ?? "sm",
  };

  const products = (landingPage.landing_page_products ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lpp) => lpp.product)
    .filter(Boolean) as NonNullable<Product>[];

  const radius = RADIUS_MAP[tc.borderRadius] ?? "8px";
  const shadow = SHADOW_MAP[tc.shadow ?? "sm"] ?? "none";
  const onLight = isLight(tc.backgroundColor ?? "#ffffff");
  const borderColor = onLight ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.12)";

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
          maxWidth: "600px",
          margin: "0 auto",
          padding: "3rem 1.5rem 5rem",
        }}
      >
        {/* Cover image */}
        {tc.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tc.coverImageUrl}
            alt="cover"
            style={{
              width: "100%",
              height: "180px",
              objectFit: "cover",
              borderRadius: radius,
              marginBottom: "1.5rem",
              display: "block",
            }}
          />
        )}

        {/* Profile avatar */}
        {tc.profileImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tc.profileImageUrl}
            alt={landingPage.title}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "1rem",
              display: "block",
              border: `2px solid ${borderColor}`,
            }}
          />
        )}

        {/* Title — left-aligned, big */}
        <h1
          style={{
            fontWeight: 700,
            fontSize: "1.8rem",
            margin: "0 0 0.4rem",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          {landingPage.title}
        </h1>
        {landingPage.description && (
          <p
            style={{
              fontSize: "0.95rem",
              opacity: 0.55,
              margin: "0 0 2.5rem",
              lineHeight: 1.6,
              maxWidth: "480px",
            }}
          >
            {landingPage.description}
          </p>
        )}

        {/* Thin divider */}
        <hr
          style={{
            border: "none",
            borderTop: `1px solid ${borderColor}`,
            margin: "0 0 2rem",
          }}
        />

        {/* Content */}
        {visibleBlocks.length > 0
          ? visibleBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                tc={tc}
                radius={radius}
                shadow={shadow}
                borderColor={borderColor}
                onLight={onLight}
                products={products}
              />
            ))
          : products.length > 0 &&
            products.map(
              (p) =>
                p && (
                  <CampsiteProductRow
                    key={p.id}
                    product={p}
                    tc={tc}
                    radius={radius}
                    borderColor={borderColor}
                  />
                ),
            )}

        <p
          style={{
            marginTop: "4rem",
            fontSize: "0.72rem",
            opacity: 0.3,
            textAlign: "left",
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
  borderColor,
  onLight,
  products,
}: {
  block: Partial<LandingBlock>;
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  borderColor: string;
  onLight: boolean;
  products: NonNullable<Product>[];
}) {
  const { type, content } = block;

  if (type === "hero") {
    return (
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            margin: "0 0 0.4rem",
            letterSpacing: "-0.02em",
          }}
        >
          {(content?.headline as string) ?? ""}
        </h2>
        {content?.subheadline && (
          <p style={{ opacity: 0.6, margin: "0 0 1rem", lineHeight: 1.6 }}>
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
              padding: "0.6rem 1.4rem",
              border: `1.5px solid ${tc.primaryColor}`,
              color: tc.primaryColor,
              fontWeight: 600,
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
          marginBottom: "1.25rem",
          lineHeight: 1.75,
          fontSize: "0.93rem",
          opacity: 0.8,
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
          borderTop: `1px solid ${borderColor}`,
          margin: "1.5rem 0",
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
          display: "inline-block",
          padding: "0.65rem 1.5rem",
          marginBottom: "1rem",
          border: `1.5px solid ${tc.primaryColor}`,
          color: tc.primaryColor,
          fontWeight: 600,
          borderRadius: radius,
          textDecoration: "none",
          fontSize: "0.9rem",
        }}
      >
        {(content.text as string) ?? "Learn More"}
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
          marginBottom: "1.25rem",
          display: "block",
          boxShadow: shadow,
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
      <CampsiteProductRow
        product={product}
        tc={tc}
        radius={radius}
        borderColor={borderColor}
      />
    );
  }

  if (
    (type === "product-grid" || type === "product-list") &&
    Array.isArray(content?.productIds)
  ) {
    const selected = (content.productIds as string[])
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as NonNullable<Product>[];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {selected.map((p) => (
          <CampsiteProductRow
            key={p.id}
            product={p}
            tc={tc}
            radius={radius}
            borderColor={borderColor}
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
          gap: "1rem",
          marginBottom: "1.5rem",
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
                fontSize: "0.85rem",
                color: tc.primaryColor,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
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
      <div style={{ marginBottom: "1.5rem" }}>
        {(
          content.items as { name: string; text: string; rating: number }[]
        ).map((item, i) => (
          <div
            key={i}
            style={{
              paddingLeft: "1rem",
              borderLeft: `2px solid ${tc.primaryColor}`,
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                margin: "0 0 0.25rem",
                fontStyle: "italic",
                fontSize: "0.9rem",
                lineHeight: 1.6,
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
                opacity: 0.55,
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
      <div style={{ marginBottom: "1.5rem" }}>
        {(content.items as { question: string; answer: string }[]).map(
          (item, i) => (
            <details
              key={i}
              style={{
                borderBottom: `1px solid ${borderColor}`,
                padding: "0.85rem 0",
                cursor: "pointer",
              }}
            >
              <summary
                style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  listStyle: "none",
                }}
              >
                {item.question}
              </summary>
              <p
                style={{
                  margin: "0.5rem 0 0",
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
      </div>
    );
  }

  if (type === "countdown" && content?.targetDate) {
    return (
      <CountdownBlock
        targetDate={content.targetDate as string}
        label={(content.label as string) ?? "Offer ends in:"}
      />
    );
  }

  if (type === "custom-html" && content?.html) {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: user HTML
    return (
      <div
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

function CampsiteProductRow({
  product,
  tc,
  radius,
  borderColor,
}: {
  product: NonNullable<Product>;
  tc: ThemeConfig;
  radius: string;
  borderColor: string;
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
        gap: "16px",
        padding: "1rem 0",
        borderBottom: `1px solid ${borderColor}`,
        textDecoration: "none",
        color: tc.textColor,
      }}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={product.title}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: radius,
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
            fontSize: "0.9rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.title}
        </p>
        {product.subtitle && (
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "0.8rem",
              opacity: 0.55,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.subtitle}
          </p>
        )}
        {product.price != null && (
          <p
            style={{
              margin: "4px 0 0",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: tc.primaryColor,
            }}
          >
            {formatCurrency(product.price, { currency: product.currency })}
          </p>
        )}
      </div>
      <span style={{ fontSize: "1rem", opacity: 0.3, flexShrink: 0 }}>→</span>
    </a>
  );
}
function CountdownBlock({
  targetDate,
  label = "Offer ends in:",
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
    <div style={{ marginBottom: "1.5rem" }}>
      <p
        style={{
          fontWeight: 600,
          fontSize: "0.85rem",
          margin: "0 0 0.5rem",
          opacity: 0.7,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontWeight: 800,
          fontSize: "2rem",
          letterSpacing: "-0.02em",
          margin: 0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {pad(diff / 86400000)}d {pad((diff % 86400000) / 3600000)}h{" "}
        {pad((diff % 3600000) / 60000)}m {pad((diff % 60000) / 1000)}s
      </p>
    </div>
  );
}
