import { ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type {
  LandingPageWithProducts,
  ThemeConfig,
  LandingBlock,
} from "@/types/database";

interface Props {
  landingPage: LandingPageWithProducts;
}

export function BeaconsTheme({ landingPage }: Props) {
  const tc: ThemeConfig = {
    primaryColor: "#0ea5e9",
    secondaryColor: "#38bdf8",
    backgroundColor: "#0f172a",
    textColor: "#f1f5f9",
    fontFamily: "Inter",
    borderRadius: "lg",
    buttonStyle: "filled",
    backgroundType: "solid",
    linkStyle: "card",
    shadow: "lg",
    accentColor: landingPage.theme_config.primaryColor,
    backgroundGradient: landingPage.theme_config.backgroundGradient,
    backgroundImageUrl: landingPage.theme_config.backgroundImageUrl,
    profileImageUrl: landingPage.theme_config.profileImageUrl,
    coverImageUrl: landingPage.theme_config.coverImageUrl,
  };

  const products = (landingPage.landing_page_products ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((lpp) => lpp.product)
    .filter(Boolean);

  const radiusMap: Record<string, string> = {
    none: "0px",
    sm: "6px",
    md: "10px",
    lg: "16px",
    full: "9999px",
  };
  const shadowMap: Record<string, string> = {
    none: "none",
    sm: "0 1px 4px rgba(0,0,0,.3)",
    md: "0 4px 16px rgba(0,0,0,.3)",
    lg: "0 8px 32px rgba(0,0,0,.4)",
  };
  const radius = radiusMap[tc.borderRadius] ?? "16px";
  const shadow = shadowMap[tc.shadow ?? "lg"] ?? "none";

  const bgStyle =
    tc.backgroundType === "gradient" && tc.backgroundGradient
      ? { background: tc.backgroundGradient }
      : tc.backgroundType === "image" && tc.backgroundImageUrl
        ? {
            backgroundImage: `url(${tc.backgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { backgroundColor: tc.backgroundColor };

  const cardBg = isLight(tc.backgroundColor ?? "#0f172a")
    ? "rgba(0,0,0,.06)"
    : "rgba(255,255,255,.08)";
  const cardBorder = isLight(tc.backgroundColor ?? "#0f172a")
    ? "rgba(0,0,0,.1)"
    : "rgba(255,255,255,.12)";

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
          padding: "3rem 1.25rem 4rem",
        }}
      >
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
            marginBottom: "0.5rem",
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
              marginBottom: "2.5rem",
              lineHeight: 1.6,
            }}
          >
            {landingPage.description}
          </p>
        )}

        {/* Blocks */}
        {visibleBlocks.length > 0 &&
          visibleBlocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block as LandingBlock}
              tc={tc}
              radius={radius}
              shadow={shadow}
              cardBg={cardBg}
              cardBorder={cardBorder}
              products={
                products.filter(Boolean) as NonNullable<(typeof products)[0]>[]
              }
            />
          ))}

        {/* Product fallback */}
        {products.length > 0 && visibleBlocks.length === 0 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {products.map((product) => {
              if (!product) return null;
              const thumb =
                product.images.find((i) => i.is_primary)?.url ??
                product.images[0]?.url;
              const href =
                product.affiliate_url ?? product.marketplace_url ?? "#";
              return (
                <a
                  key={product.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px",
                    borderRadius: radius,
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    textDecoration: "none",
                    color: tc.textColor,
                    backdropFilter: "blur(8px)",
                    boxShadow: shadow,
                  }}
                >
                  {thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={product.title}
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <p
                      style={{ fontWeight: 600, fontSize: "0.9rem", margin: 0 }}
                    >
                      {product.title}
                    </p>
                    {product.price != null && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: tc.primaryColor,
                          margin: "2px 0 0",
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(product.price, {
                          currency: product.currency,
                        })}
                      </p>
                    )}
                  </div>
                  <ExternalLink
                    style={{
                      width: 16,
                      height: 16,
                      opacity: 0.5,
                      flexShrink: 0,
                    }}
                  />
                </a>
              );
            })}
          </div>
        )}

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

function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
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
  products: NonNullable<
    LandingPageWithProducts["landing_page_products"]
  >[0]["product"][];
}) {
  const { type, content } = block;

  if (type === "hero") {
    return (
      <div
        style={{
          borderRadius: radius,
          overflow: "hidden",
          marginBottom: "1.5rem",
          background: content?.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url(${content.backgroundImageUrl}) center/cover`
            : `linear-gradient(135deg, ${tc.primaryColor}cc, ${tc.secondaryColor ?? tc.primaryColor}cc)`,
          padding: "2.5rem 1.5rem",
          textAlign: "center",
          backdropFilter: "blur(4px)",
          boxShadow: shadow,
        }}
      >
        <h2
          style={{
            fontSize: "1.8rem",
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
            {content?.subheadline as string}
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
          padding: "0.9rem",
          marginBottom: "12px",
          borderRadius: radius,
          background: `linear-gradient(135deg, ${tc.primaryColor}, ${tc.secondaryColor ?? tc.primaryColor})`,
          color: "#ffffff",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: `0 4px 16px ${tc.primaryColor}66`,
          fontSize: "0.95rem",
          letterSpacing: "0.01em",
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
      <div style={{ marginBottom: "1.25rem" }}>
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
    const cols = (content?.columns as number) ?? 2;
    const selectedProducts = (content.productIds as string[])
      .map((id) => products.find((p) => p?.id === id))
      .filter(Boolean);
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
              <BeaconsProductCard
                key={product.id}
                product={product}
                tc={tc}
                radius={radius}
                shadow={shadow}
                cardBg={cardBg}
                cardBorder={cardBorder}
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
  product: NonNullable<
    LandingPageWithProducts["landing_page_products"]
  >[0]["product"];
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  cardBg: string;
  cardBorder: string;
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
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        textDecoration: "none",
        color: tc.textColor,
        backdropFilter: "blur(8px)",
        boxShadow: shadow,
      }}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={product.title}
          style={{
            width: "100%",
            aspectRatio: "1",
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
            fontSize: "0.85rem",
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
            background: `linear-gradient(135deg, ${tc.primaryColor}, ${tc.secondaryColor ?? tc.primaryColor})`,
            color: "#ffffff",
            fontSize: "0.8rem",
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
