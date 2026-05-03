import { ExternalLink, ShoppingCart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type {
  LandingPageWithProducts,
  ThemeConfig,
  LandingBlock,
} from "@/types/database";

interface Props {
  landingPage: LandingPageWithProducts;
}

export function EcommerceTheme({ landingPage }: Props) {
  const tc: ThemeConfig = {
    primaryColor: "#f97316",
    secondaryColor: "#fb923c",
    backgroundColor: "#f9fafb",
    textColor: "#111827",
    fontFamily: "Inter",
    borderRadius: "md",
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

  const radiusMap: Record<string, string> = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "9999px",
  };
  const shadowMap: Record<string, string> = {
    none: "none",
    sm: "0 1px 3px rgba(0,0,0,.1)",
    md: "0 4px 16px rgba(0,0,0,.1)",
    lg: "0 8px 32px rgba(0,0,0,.12)",
  };
  const radius = radiusMap[tc.borderRadius] ?? "8px";
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
      {/* Store Header */}
      <header
        style={{
          backgroundColor: tc.primaryColor,
          color: "#ffffff",
          padding: "1rem",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,.15)",
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
              }}
            />
          )}
          <div>
            <h1 style={{ fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>
              {landingPage.title}
            </h1>
            {landingPage.description && (
              <p style={{ fontSize: "0.75rem", opacity: 0.85, margin: 0 }}>
                {landingPage.description}
              </p>
            )}
          </div>
        </div>
      </header>

      <main
        style={{ maxWidth: "960px", margin: "0 auto", padding: "1.5rem 1rem" }}
      >
        {/* Blocks */}
        {visibleBlocks.length > 0 &&
          visibleBlocks.map((block) => (
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

        {/* Product grid fallback */}
        {products.length > 0 && visibleBlocks.length === 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {products.map((product) => {
              if (!product) return null;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  tc={tc}
                  radius={radius}
                  shadow={shadow}
                />
              );
            })}
          </div>
        )}
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
          borderRadius: radius,
          overflow: "hidden",
          marginBottom: "1.5rem",
          background: content?.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(${content.backgroundImageUrl}) center/cover`
            : `linear-gradient(135deg, ${tc.primaryColor}, ${tc.secondaryColor ?? tc.primaryColor})`,
          color: "#fff",
          padding: "3rem 2rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.75rem" }}
        >
          {(content?.headline as string) ?? ""}
        </h2>
        {content?.subheadline && (
          <p style={{ fontSize: "1.1rem", opacity: 0.9, margin: "0 0 1.5rem" }}>
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
              background: "#ffffff",
              color: tc.primaryColor,
              fontWeight: 700,
              borderRadius: radius,
              textDecoration: "none",
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(0,0,0,.2)",
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
      <div
        style={{ marginBottom: "1.5rem", lineHeight: 1.7, fontSize: "0.95rem" }}
      >
        {(content?.text as string) ?? ""}
      </div>
    );
  }

  if (type === "divider") {
    return (
      <hr
        style={{
          border: "none",
          borderTop: `1px solid ${(content?.color as string) ?? "#e5e7eb"}`,
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
          marginBottom: "1rem",
          borderRadius: radius,
          background: tc.primaryColor,
          color: "#ffffff",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: shadow,
          fontSize: "1rem",
        }}
      >
        <ShoppingCart
          style={{
            display: "inline",
            marginRight: "8px",
            width: 18,
            height: 18,
          }}
        />
        {(content.text as string) ?? "Shop Now"}
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
          marginBottom: "1.5rem",
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
      <div style={{ marginBottom: "1.5rem" }}>
        <ProductCard
          product={product}
          tc={tc}
          radius={radius}
          shadow={shadow}
          featured
        />
      </div>
    );
  }

  if (
    (type === "product-grid" || type === "product-list") &&
    Array.isArray(content?.productIds)
  ) {
    const cols = (content?.columns as number) ?? 3;
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
              : `repeat(${Math.min(cols, 4)}, 1fr)`,
          gap: "16px",
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
  featured = false,
}: {
  product: NonNullable<
    LandingPageWithProducts["landing_page_products"]
  >[0]["product"];
  tc: ThemeConfig;
  radius: string;
  shadow: string;
  featured?: boolean;
}) {
  if (!product) return null;
  const thumb =
    product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url;
  const href = product.affiliate_url ?? product.marketplace_url ?? "#";
  const hasDiscount =
    product.original_price != null &&
    product.original_price > (product.price ?? 0);
  const discountPct = hasDiscount
    ? Math.round(
        ((product.original_price! - product.price!) / product.original_price!) *
          100,
      )
    : 0;

  if (featured) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          gap: "1.5rem",
          borderRadius: radius,
          overflow: "hidden",
          boxShadow: shadow,
          backgroundColor: "#ffffff",
          textDecoration: "none",
          color: tc.textColor,
          border: "1px solid rgba(0,0,0,.06)",
          padding: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={product.title}
            style={{
              width: "200px",
              height: "200px",
              objectFit: "cover",
              borderRadius: radius,
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          {product.badges.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "4px",
                flexWrap: "wrap",
                marginBottom: "8px",
              }}
            >
              {product.badges.map((b, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    color: b.color ?? "#fff",
                    backgroundColor: b.bgColor ?? tc.primaryColor,
                    fontWeight: 700,
                  }}
                >
                  {b.text}
                </span>
              ))}
            </div>
          )}
          <h3
            style={{ fontWeight: 700, fontSize: "1.1rem", margin: "0 0 8px" }}
          >
            {product.title}
          </h3>
          {product.product_rating != null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  style={{
                    width: 14,
                    height: 14,
                    fill:
                      i < Math.round(product.product_rating!)
                        ? "#f59e0b"
                        : "transparent",
                    color: "#f59e0b",
                  }}
                />
              ))}
              <span style={{ fontWeight: 600 }}>
                {product.product_rating.toFixed(1)}
              </span>
              {product.review_count > 0 && (
                <span style={{ opacity: 0.6 }}>
                  ({product.review_count.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}
          {product.price != null && (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: tc.primaryColor,
                }}
              >
                {formatCurrency(product.price, { currency: product.currency })}
              </span>
              {hasDiscount && (
                <>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      opacity: 0.5,
                      textDecoration: "line-through",
                    }}
                  >
                    {formatCurrency(product.original_price!, {
                      currency: product.currency,
                    })}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>
          )}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.7rem 2rem",
              borderRadius: radius,
              backgroundColor: tc.primaryColor,
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            <ShoppingCart style={{ width: 16, height: 16 }} />
            Buy Now
          </div>
        </div>
      </a>
    );
  }

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
        position: "relative",
      }}
    >
      {hasDiscount && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            backgroundColor: "#ef4444",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            padding: "3px 7px",
            borderRadius: "4px",
            zIndex: 1,
          }}
        >
          -{discountPct}%
        </div>
      )}
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
            <span style={{ fontWeight: 600 }}>
              {product.product_rating.toFixed(1)}
            </span>
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
                fontWeight: 800,
                fontSize: "1rem",
                color: tc.primaryColor,
              }}
            >
              {formatCurrency(product.price, { currency: product.currency })}
            </span>
            {hasDiscount && (
              <span
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.5,
                  textDecoration: "line-through",
                }}
              >
                {formatCurrency(product.original_price!, {
                  currency: product.currency,
                })}
              </span>
            )}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "7px",
            borderRadius: radius,
            backgroundColor: tc.primaryColor,
            color: "#ffffff",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          <ShoppingCart style={{ width: 14, height: 14 }} />
          Buy Now
        </div>
      </div>
    </a>
  );
}
