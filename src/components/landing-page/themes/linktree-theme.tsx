import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type {
  LandingPageWithProducts,
  ThemeConfig,
  LandingBlock,
} from "@/types/database";

interface Props {
  landingPage: LandingPageWithProducts;
}

export function LinktreeTheme({ landingPage }: Props) {
  const tc: ThemeConfig = {
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#f8fafc",
    textColor: "#1e293b",
    fontFamily: "Inter",
    borderRadius: "lg",
    buttonStyle: "filled",
    backgroundType: "solid",
    linkStyle: "card",
    shadow: "md",
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

  const radiusMap = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "9999px",
  };
  const shadowMap = {
    none: "none",
    sm: "0 1px 3px rgba(0,0,0,.12)",
    md: "0 4px 12px rgba(0,0,0,.12)",
    lg: "0 8px 24px rgba(0,0,0,.15)",
  };
  const radius = radiusMap[tc.borderRadius] ?? "12px";
  const shadow = shadowMap[tc.shadow ?? "md"] ?? "none";

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
        style={{ maxWidth: "480px", margin: "0 auto", padding: "2rem 1rem" }}
      >
        {/* Profile header */}
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
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.4rem",
            marginBottom: "0.5rem",
          }}
        >
          {landingPage.title}
        </h1>
        {landingPage.description && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              opacity: 0.7,
              marginBottom: "2rem",
            }}
          >
            {landingPage.description}
          </p>
        )}

        {/* Blocks */}
        {landingPage.blocks
          .filter((b) => b.visible)
          .map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              tc={tc}
              radius={radius}
              shadow={shadow}
              products={
                products.filter(Boolean) as NonNullable<(typeof products)[0]>[]
              }
            />
          ))}

        {/* Products as link cards */}
        {products.length > 0 && landingPage.blocks.length === 0 && (
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
                    padding: "12px",
                    borderRadius: radius,
                    boxShadow: shadow,
                    backgroundColor: "#ffffff",
                    textDecoration: "none",
                    color: tc.textColor,
                    border: "1px solid rgba(0,0,0,.06)",
                    transition: "transform .15s",
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
                      opacity: 0.4,
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
            fontSize: "0.75rem",
            opacity: 0.4,
          }}
        >
          Powered by Snapland
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
