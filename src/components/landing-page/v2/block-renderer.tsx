"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { formatCurrency, cn } from "@/lib/utils";
import type {
  BlockV2,
  BlockLayout,
  BlockClasses,
  BlockAnimation,
} from "@/types/builder";
import type { Product } from "@/types/database";
import {
  TW_PADDING_Y,
  TW_PADDING_X,
  TW_MAX_WIDTH,
  ANIMATION_CLASSES,
} from "@/types/builder";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { resolveWaRotatorUrl } from "@/lib/apps/wa-rotator";
import { getPublicApplicationsByIds } from "@/actions/applications";
import type { Application } from "@/types/builder";

// ── Types ──────────────────────────────────────────────────────
export interface RenderContext {
  products: Product[];
  primaryColor: string;
  textColor: string;
  fontFamily: string;
  appUrl?: string;
  landingPageId?: string;
  onProductClick?: (
    productId: string,
    clickType: "affiliate" | "marketplace" | "detail",
  ) => void;
}

interface Props {
  block: BlockV2;
  ctx: RenderContext;
}

interface BlockProps {
  props: Record<string, any>;
  classes: BlockClasses;
  ctx: RenderContext;
}

type AlignType = "start" | "end" | "center";

function stripScriptTags(html: string): string {
  return html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
}

// ── Layout helper ──────────────────────────────────────────────
function buildWrapperStyle(layout: BlockLayout): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (layout.bgColor) style.backgroundColor = layout.bgColor;
  if (layout.bgImage) {
    style.backgroundImage = layout.bgOverlay
      ? `linear-gradient(${layout.bgOverlay},${layout.bgOverlay}),url(${layout.bgImage})`
      : `url(${layout.bgImage})`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }
  if (layout.textColor) style.color = layout.textColor;
  return style;
}

function buildWrapperClass(block: BlockV2): string {
  const { layout, classes, animation } = block;
  const parts: string[] = [];

  if (layout.paddingY && layout.paddingY !== "none")
    parts.push(TW_PADDING_Y[layout.paddingY]);
  if (layout.paddingX && layout.paddingX !== "none")
    parts.push(TW_PADDING_X[layout.paddingX]);
  if (layout.shadow && layout.shadow !== "none")
    parts.push(`shadow-${layout.shadow}`);
  if (layout.border) parts.push("border border-border");
  if (layout.borderRadius && layout.borderRadius !== "none") {
    parts.push(
      layout.borderRadius === "full"
        ? "rounded-full"
        : `rounded-${layout.borderRadius}`,
    );
  }
  if (animation.type && animation.type !== "none") {
    parts.push(ANIMATION_CLASSES[animation.type]);
  }
  if (classes.wrapper) parts.push(classes.wrapper);

  return parts.filter(Boolean).join(" ");
}

function InnerContainer({
  layout,
  classes,
  children,
}: {
  layout: BlockLayout;
  classes: BlockClasses;
  children: React.ReactNode;
}) {
  const maxW = layout.maxWidth ? TW_MAX_WIDTH[layout.maxWidth] : "max-w-5xl";
  const align =
    layout.align === "left"
      ? "text-left"
      : layout.align === "right"
        ? "text-right"
        : "text-center";
  return (
    <div className={cn("mx-auto w-full", maxW, align, classes.inner)}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN BLOCK RENDERER
// ══════════════════════════════════════════════════════════════
export function BlockRenderer({ block, ctx }: Props) {
  if (!block.visible) return null;

  const wrapperClass = buildWrapperClass(block);
  const wrapperStyle = buildWrapperStyle(block.layout);

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <InnerContainer layout={block.layout} classes={block.classes}>
        <BlockContent block={block} ctx={ctx} />
      </InnerContainer>
    </div>
  );
}

// ── Route each block type to its renderer ─────────────────────
function BlockContent({ block, ctx }: { block: BlockV2; ctx: RenderContext }) {
  const { type, props, classes } = block;
  // ── Layout ───────────────────────────────────────────────────
  if (type === "block-hero")
    return <HeroBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-header")
    return <HeaderBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-footer")
    return <FooterBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-columns")
    return <ColumnsBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-anchor") return <AnchorBlock props={props} />;
  if (type === "block-divider")
    return <DividerBlock props={props} classes={classes} />;
  if (type === "block-frame") return <FrameBlock props={props} />;
  if (type === "block-sidebar")
    return <SidebarBlock props={props} classes={classes} ctx={ctx} />;

  // ── Content ───────────────────────────────────────────────────
  if (type === "block-text")
    return <TextBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-image")
    return props.src ? (
      <ImageBlock props={props} classes={classes} ctx={ctx} />
    ) : null;
  if (type === "block-gallery")
    return <GalleryBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-video")
    return <VideoBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-carousel")
    return <CarouselBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-features")
    return <FeaturesBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-logos")
    return <LogosBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-changelog")
    return <ChangelogBlock props={props} classes={classes} ctx={ctx} />;

  // ── Commerce ──────────────────────────────────────────────────
  if (type === "block-product-card")
    return <ProductCardBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-product-list")
    return <ProductListBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-pricing")
    return <PricingBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-checkout")
    return <CheckoutBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-order-confirm")
    return <OrderConfirmBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-payment-list")
    return <PaymentListBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-stock-counter")
    return <StockCounterBlock props={props} classes={classes} ctx={ctx} />;

  // ── Social ────────────────────────────────────────────────────
  if (type === "block-testimonial")
    return <TestimonialBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-faq")
    return <FAQBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-social-links")
    return <SocialLinksBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-fake-comment")
    return <FakeCommentBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-fake-notification")
    return <FakeNotificationBlock props={props} ctx={ctx} />;
  if (type === "block-contact")
    return <ContactBlock props={props} classes={classes} ctx={ctx} />;

  // ── Interactive ───────────────────────────────────────────────
  if (type === "block-button")
    return <ButtonBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-button-group")
    return <ButtonGroupBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-float-button")
    return <FloatButtonBlock props={props} ctx={ctx} />;
  if (type === "block-countdown")
    return <CountdownBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-form")
    return <FormBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-popup")
    return <PopupBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-chat-bot")
    return <ChatBotBlock props={props} ctx={ctx} />;
  if (type === "block-tab")
    return <TabBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-floating-content")
    return <FloatingContentBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-menu-group")
    return <MenuGroupBlock props={props} classes={classes} ctx={ctx} />;

  // ── Advanced ──────────────────────────────────────────────────
  if (type === "block-animation")
    return <AnimationBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-custom-html") return <CustomHtmlBlock props={props} />;
  if (type === "block-custom-script") return null; // injected via TrackingScripts
  if (type === "block-google-maps") return <GoogleMapsBlock props={props} />;
  if (type === "block-auto-redirect")
    return <AutoRedirectBlock props={props} ctx={ctx} />;
  if (type === "block-back-redirect")
    return <BackRedirectBlock props={props} ctx={ctx} />;
  if (type === "block-blog-post")
    return <BlogPostBlock props={props} classes={classes} ctx={ctx} />;
  if (type === "block-applications") return null; // showcase only, no interactive render

  return null;
}

// ══════════════════════════════════════════════════════════════
// LAYOUT BLOCKS
// ══════════════════════════════════════════════════════════════

function HeroBlock({ props, classes, ctx }: BlockProps) {
  const bg = props.backgroundImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(${props.backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: `linear-gradient(135deg, ${ctx.primaryColor}, ${ctx.primaryColor}cc)`,
      };
  const align = (props.textAlign as string) || "center";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center text-white px-6 py-20 overflow-hidden rounded-xl",
        classes.wrapper,
      )}
      style={{
        ...bg,
        minHeight: (props.minHeight as string) || "400px",
        textAlign: align as React.CSSProperties["textAlign"],
      }}
    >
      <h1
        className={cn(
          "text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl mb-4 leading-tight",
          classes.heading,
        )}
      >
        {(props.headline as string) || "Your Headline Here"}
      </h1>
      {props.subheadline && (
        <p
          className={cn(
            "text-base sm:text-lg opacity-90 mb-8 max-w-xl",
            classes.text,
          )}
        >
          {props.subheadline as string}
        </p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        {props.ctaUrl && props.ctaText && (
          <a
            href={props.ctaUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 bg-white font-bold px-7 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity",
              classes.button,
            )}
            style={{ color: ctx.primaryColor }}
          >
            {props.ctaText as string}
          </a>
        )}
        {props.ctaSecondaryUrl && props.ctaSecondaryText && (
          <a
            href={props.ctaSecondaryUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-white/70 text-white font-semibold px-7 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors"
          >
            {props.ctaSecondaryText as string}
          </a>
        )}
      </div>
    </div>
  );
}

function HeaderBlock({ props, classes, ctx }: BlockProps) {
  const navLinks = (props.navLinks as { label: string; href: string }[]) ?? [];
  return (
    <header
      className={cn(
        "w-full flex items-center justify-between gap-4",
        props.sticky
          ? "sticky top-0 z-50 bg-background/95 backdrop-blur border-b"
          : "",
        classes.wrapper,
      )}
    >
      {props.logoImageUrl ? (
        <Image
          src={props.logoImageUrl as string}
          alt="logo"
          width={0}
          height={0}
          sizes="100vw"
          className="h-8 w-auto"
        />
      ) : (
        <span className={cn("font-bold text-xl", classes.heading)}>
          {(props.logoText as string) || "Brand"}
        </span>
      )}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((l, i) => (
          <a
            key={i}
            href={l.href}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {l.label}
          </a>
        ))}
      </nav>
      {props.ctaText && props.ctaUrl && (
        <a
          href={props.ctaUrl as string}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-sm font-semibold px-4 py-2 rounded-lg text-white",
            classes.button,
          )}
          style={{ backgroundColor: ctx.primaryColor }}
        >
          {props.ctaText as string}
        </a>
      )}
    </header>
  );
}

function FooterBlock({ props, classes, ctx }: BlockProps) {
  const cols =
    (props.columns as {
      title: string;
      links: { label: string; href: string }[];
    }[]) ?? [];
  return (
    <footer className={cn("w-full", classes.wrapper)}>
      {cols.length > 0 && (
        <div
          className={cn(
            "grid gap-8 mb-8",
            `grid-cols-${Math.min(cols.length, 4)}`,
          )}
        >
          {cols.map((col, i) => (
            <div key={i}>
              <p className={cn("font-semibold text-sm mb-3", classes.heading)}>
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((l, j) => (
                  <li key={j}>
                    <a
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {props.copyright as string}
        </p>
        {props.showPoweredBy && (
          <p className="text-xs text-muted-foreground/60">
            Powered by SnapLand
          </p>
        )}
      </div>
    </footer>
  );
}

function ColumnsBlock({ props, classes, ctx }: BlockProps) {
  const cols = (props.columns as number) || 2;
  const gapMap: Record<string, string> = {
    none: "gap-0",
    sm: "gap-3",
    md: "gap-6",
    lg: "gap-10",
  };
  const gap = gapMap[(props.gap as string) || "md"] || "gap-6";
  const items = (props.items as { content: string; id: string }[]) || [];

  return (
    <div
      className={cn(
        "grid",
        gap,
        `grid-cols-1 sm:grid-cols-${Math.min(cols, 4)}`,
        classes.wrapper,
      )}
    >
      {items.map((item) => (
        <div key={item.id} className={cn("min-w-0", classes.inner)}>
          <div
            className="text-sm leading-relaxed"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: user content
            dangerouslySetInnerHTML={{ __html: stripScriptTags(item.content) }}
          />
        </div>
      ))}
    </div>
  );
}

function AnchorBlock({ props }: { props: Record<string, unknown> }) {
  return <div id={props.anchorId as string} aria-hidden="true" />;
}

function DividerBlock({
  props,
  classes,
}: {
  props: Record<string, unknown>;
  classes: BlockClasses;
}) {
  const style = (props.style as string) || "line";
  return (
    <div className={cn("flex items-center gap-4 w-full py-2", classes.wrapper)}>
      {props.text ? (
        <>
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {props.text as string}
          </span>
          <div className="h-px flex-1 bg-border" />
        </>
      ) : (
        <hr
          className={cn(
            "w-full",
            style === "dashed"
              ? "border-dashed"
              : style === "dots"
                ? "border-dotted"
                : "border-solid",
            "border-t border-border",
          )}
        />
      )}
    </div>
  );
}

function FrameBlock({ props }: { props: Record<string, unknown> }) {
  if (!props.src) return null;
  return (
    <div className="w-full overflow-hidden rounded-xl">
      <iframe
        src={props.src as string}
        title={(props.title as string) || "Embedded content"}
        style={{ height: (props.height as string) || "450px" }}
        className="w-full border-0"
        allowFullScreen={props.allowFullscreen as boolean}
        sandbox={props.sandbox as string}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CONTENT BLOCKS
// ══════════════════════════════════════════════════════════════

function TextBlock({ props, classes }: BlockProps) {
  const sizeMap: Record<string, string> = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };
  return (
    <div
      className={cn(
        "prose prose-sm sm:prose max-w-none",
        sizeMap[(props.fontSize as string) || "base"],
        classes.wrapper,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: user content
      dangerouslySetInnerHTML={{
        __html: stripScriptTags((props.html as string) || ""),
      }}
    />
  );
}

function ImageBlock({ props, classes, ctx }: BlockProps) {
  const linkType = (props.linkType as string) || "none";
  const hasRotator = linkType === "whatsapp" && Boolean(props.waRotatorId);
  const hasProduct = linkType === "product" && Boolean(props.productId);
  const hasCustomLink = linkType === "custom" && Boolean(props.linkUrl);

  const product = hasProduct
    ? (ctx.products.find((p) => p.id === props.productId) ?? ctx.products[0])
    : undefined;
  const productUrl = product?.affiliate_url ?? product?.marketplace_url ?? "#";

  const [href, setHref] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const resolveHref = async () => {
      if (hasRotator) {
        setIsResolving(true);
        try {
          const url = await resolveWaRotatorUrl(
            props.waRotatorId as string,
            props.waTemplateMessage as string | undefined,
          );
          setHref(url || "https://wa.me/");
        } catch (error) {
          console.error("Failed to resolve wa rotator:", error);
          setHref("https://wa.me/"); // fallback
        } finally {
          setIsResolving(false);
        }
      } else if (hasProduct) {
        // Find product in context to get its affiliate/marketplace URL
        if (product) {
          setHref(productUrl);
        } else {
          setHref("#");
        }
      } else if (hasCustomLink) {
        setHref((props.linkUrl as string) || "");
      } else {
        setHref("");
      }
    };

    resolveHref();
  }, [
    props.waRotatorId,
    props.waTemplateMessage,
    props.linkUrl,
    props.productId,
    hasRotator,
    hasProduct,
    hasCustomLink,
    ctx.products,
    product,
    productUrl,
  ]);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isResolving) {
      e.preventDefault();
      return;
    }
    if (!href || href === "#") {
      e.preventDefault();
      return;
    }

    // Track product click if it's a product link
    if (hasProduct && ctx.onProductClick) {
      if (product) {
        const clickType = product.affiliate_url ? "affiliate" : "marketplace";
        ctx.onProductClick(product.id, clickType);
      }
    }
  }

  const img = (
    <Image
      src={
        (props.src as string) || "https://placehold.co/600x400?text=No+Image"
      }
      alt={(props.alt as string) || ""}
      width={0}
      height={0}
      sizes="100vw"
      className={cn(
        "w-full max-w-full block rounded-xl overflow-hidden object-cover",
        classes.image,
      )}
      style={{
        aspectRatio:
          (props.aspectRatio as string) !== "auto"
            ? (props.aspectRatio as string)
            : undefined,
        objectFit: (props.objectFit as any) || "cover",
      }}
    />
  );

  const shouldWrap = hasRotator || hasProduct || hasCustomLink;
  const linkTarget = (props.linkTarget as string) || "_blank";

  if (props.caption) {
    return (
      <figure className="w-full">
        {shouldWrap ? (
          <a
            href={href || "#"}
            target={linkTarget}
            rel="noopener noreferrer"
            onClick={handleClick}
          >
            {img}
          </a>
        ) : (
          img
        )}
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {props.caption as string}
        </figcaption>
      </figure>
    );
  }

  return shouldWrap ? (
    <a
      href={href || "#"}
      target={linkTarget}
      rel="noopener noreferrer"
      className="block"
      onClick={handleClick}
    >
      {img}
    </a>
  ) : (
    img
  );
}

function GalleryImageItem({
  img,
  props,
  classes,
  ctx,
}: {
  img: {
    src: string;
    alt: string;
    linkType?: string;
    linkUrl?: string;
    waRotatorId?: string;
    productId?: string;
  };
  props: Record<string, any>;
  classes: BlockClasses;
  ctx: RenderContext;
}) {
  const linkType = img.linkType || "none";
  const hasRotator = linkType === "whatsapp" && Boolean(img.waRotatorId);
  const hasProduct = linkType === "product" && Boolean(img.productId);
  const hasCustomLink = linkType === "custom" && Boolean(img.linkUrl);

  const [href, setHref] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const product = hasProduct
    ? (ctx.products.find((p) => p.id === props.productId) ?? ctx.products[0])
    : undefined;
  const productUrl = product?.affiliate_url ?? product?.marketplace_url ?? "#";

  useEffect(() => {
    const resolveHref = async () => {
      if (hasRotator) {
        setIsResolving(true);
        try {
          const url = await resolveWaRotatorUrl(
            img.waRotatorId as string,
            undefined,
          );
          setHref(url || "https://wa.me/");
        } catch (error) {
          console.error("Failed to resolve wa rotator:", error);
          setHref("https://wa.me/"); // fallback
        } finally {
          setIsResolving(false);
        }
      } else if (hasProduct) {
        if (product) {
          setHref(productUrl);
        } else {
          setHref("#");
        }
      } else if (hasCustomLink) {
        setHref((img.linkUrl as string) || "");
      } else {
        setHref("");
      }
    };

    resolveHref();
  }, [
    img.waRotatorId,
    img.linkUrl,
    img.productId,
    hasRotator,
    hasProduct,
    hasCustomLink,
    ctx.products,
    product,
    productUrl,
  ]);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isResolving) {
      e.preventDefault();
      return;
    }
    if (!href || href === "#") {
      e.preventDefault();
      return;
    }

    if (hasProduct && ctx.onProductClick) {
      if (product) {
        const clickType = product.affiliate_url ? "affiliate" : "marketplace";
        ctx.onProductClick(product.id, clickType);
      }
    }
  }

  const imageEl = (
    <Image
      src={(img.src as string) || "https://placehold.co/600x400?text=No+Image"}
      alt={(img.alt as string) || ""}
      width={0}
      height={0}
      sizes="100vw"
      className={cn("w-full object-cover rounded-lg", classes.image)}
      style={{ aspectRatio: (props.aspectRatio as string) || "1/1" }}
    />
  );

  const shouldWrap = hasRotator || hasProduct || hasCustomLink;

  return shouldWrap ? (
    <a
      href={href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      onClick={handleClick}
    >
      {imageEl}
    </a>
  ) : (
    imageEl
  );
}

function GalleryBlock({ props, classes, ctx }: BlockProps) {
  const images =
    (props.images as {
      src: string;
      alt: string;
      linkType?: string;
      linkUrl?: string;
      waRotatorId?: string;
      productId?: string;
    }[]) ?? [];
  const cols = (props.columns as number) || 3;
  if (images.length === 0) return null;
  return (
    <div
      className={cn(
        `grid grid-cols-2 sm:grid-cols-${cols} gap-2 sm:gap-4`,
        classes.wrapper,
      )}
    >
      {images.map((img, i) => (
        <GalleryImageItem
          key={i}
          img={img}
          props={props}
          classes={classes}
          ctx={ctx}
        />
      ))}
    </div>
  );
}

function VideoBlock({ props, classes }: BlockProps) {
  const platform = (props.platform as string) || "youtube";
  const videoId = props.videoId as string;
  if (!videoId) return null;

  let embedUrl = "";
  if (platform === "youtube") {
    const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
    if (props.autoplay) params.set("autoplay", "1");
    if (props.loop) params.set("loop", "1");
    embedUrl = `https://www.youtube.com/embed/${videoId}?${params}`;
  } else if (platform === "tiktok") {
    embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
  }

  const aspectPadding = platform === "tiktok" ? "pb-[177.78%]" : "pb-[56.25%]";

  return (
    <figure className={cn("w-full", classes.wrapper)}>
      <div
        className={cn("relative h-0 overflow-hidden rounded-xl", aspectPadding)}
      >
        <iframe
          src={embedUrl}
          title="Video"
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {props.caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {props.caption as string}
        </figcaption>
      )}
    </figure>
  );
}

function CarouselBlock({ props, classes, ctx }: BlockProps) {
  const items =
    (props.items as { src?: string; title?: string; content?: string }[]) ?? [];

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [autoPlayInterval] = useState(() => {
    if (typeof props.autoPlayInterval === "number") {
      return props.autoPlayInterval;
    } else if (typeof props.autoPlayInterval === "string") {
      return Number(props.autoPlayInterval);
    }
    return 3000;
  });
  const [slidesPerView] = useState(() => {
    if (typeof props.slidesPerView === "number") {
      return props.slidesPerView;
    } else if (typeof props.slidesPerView === "string") {
      return Number(props.slidesPerView);
    }
    return 1;
  });

  // Sync Embla state ke React state
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    return () => {
      api.off("select", () => {});
    };
  }, [api]);

  if (items.length === 0) return null;

  const autoPlayPlugin = Autoplay({
    active: Boolean(props.autoPlay),
    delay: autoPlayInterval,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  });

  return (
    <div className={cn("relative w-full", classes.wrapper)}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: Boolean(props.infinite),
        }}
        plugins={props.autoPlay ? [autoPlayPlugin] : []}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((item, i) => (
            <CarouselItem
              key={i}
              className={cn(
                "pl-2 md:pl-4",
                // Responsive: 1 kolom mobile, bisa dikonfigurasi desktop
                slidesPerView === 2
                  ? "sm:basis-1/2"
                  : slidesPerView === 3
                    ? "sm:basis-1/3"
                    : "basis-full",
              )}
            >
              <div className="overflow-hidden rounded-xl">
                {item.src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt={item.title || ""}
                    className="w-full object-cover rounded-xl"
                    style={{ aspectRatio: "16/9" }}
                  />
                )}
                {(item.title || item.content) && (
                  <div className="pt-3 px-1">
                    {item.title && (
                      <p className="font-semibold text-sm">{item.title}</p>
                    )}
                    {item.content && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.content}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrows */}
        {props.showArrows && items.length > 1 && (
          <>
            <CarouselPrevious className="-left-4 sm:-left-6" />
            <CarouselNext className="-right-4 sm:-right-6" />
          </>
        )}
      </Carousel>

      {/* Dots indicator */}
      {props.showDots && count > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "rounded-full transition-all",
                i === current
                  ? "w-4 h-2 bg-primary"
                  : "size-2 bg-muted-foreground/30 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturesBlock({ props, classes, ctx }: BlockProps) {
  const items =
    (props.items as { icon?: string; title: string; description: string }[]) ??
    [];
  const cols = (props.columns as number) || 3;
  const numbered = props.numbered as boolean;

  return (
    <div
      className={cn(
        `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(cols, 4)} gap-6 sm:gap-8`,
        classes.wrapper,
      )}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col",
            props.style === "list"
              ? "flex-row gap-4"
              : "items-center text-center",
            classes.card,
          )}
        >
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl text-white mb-4",
            )}
            style={{ backgroundColor: ctx.primaryColor }}
          >
            {numbered ? (
              <span className="font-bold text-lg">{i + 1}</span>
            ) : (
              <span className="text-lg">★</span>
            )}
          </div>
          <div>
            <h3
              className={cn("font-semibold text-base mb-1.5", classes.heading)}
            >
              {item.title}
            </h3>
            <p
              className={cn(
                "text-sm text-muted-foreground leading-relaxed",
                classes.text,
              )}
            >
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LogosBlock({ props, classes }: BlockProps) {
  const logos = (props.logos as { src: string; alt: string }[]) ?? [];
  return (
    <div className={cn("text-center", classes.wrapper)}>
      {props.title && (
        <p className={cn("text-sm text-muted-foreground mb-6", classes.text)}>
          {props.title as string}
        </p>
      )}
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-8",
          props.grayscale
            ? "grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
            : "",
        )}
      >
        {logos.map((logo, i) => (
          <Image
            key={i}
            src={logo.src}
            alt={logo.alt || ""}
            width={0}
            height={0}
            sizes="100vw"
            className="h-8 w-auto object-contain"
          />
        ))}
        {logos.length === 0 &&
          [1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className="h-7 w-20 rounded bg-border" />
          ))}
      </div>
    </div>
  );
}

function ChangelogBlock({ props, classes, ctx }: BlockProps) {
  const items =
    (props.items as { version: string; date: string; changes: string[] }[]) ??
    [];
  return (
    <div className={cn("space-y-8", classes.wrapper)}>
      {items.map((item, i) => (
        <div
          key={i}
          className="relative pl-6 border-l-2"
          style={{ borderColor: ctx.primaryColor }}
        >
          <div
            className="absolute -left-2.25 top-0 size-4 rounded-full"
            style={{ backgroundColor: ctx.primaryColor }}
          />
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-bold font-mono">{item.version}</span>
            <span className="text-xs text-muted-foreground">{item.date}</span>
          </div>
          <ul className="space-y-1">
            {item.changes.map((c, j) => (
              <li key={j} className="text-sm text-muted-foreground">
                • {c}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMMERCE BLOCKS
// ══════════════════════════════════════════════════════════════

function ProductCardBlock({ props, classes, ctx }: BlockProps) {
  const product =
    ctx.products.find((p) => p.id === props.productId) ?? ctx.products[0];
  if (!product) return null;
  const thumb =
    product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url;
  const href = product.affiliate_url ?? product.marketplace_url ?? "#";
  const hasDiscount =
    product.original_price && product.original_price > (product.price ?? 0);

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden border bg-card shadow-sm max-w-sm mx-auto",
        classes.card,
      )}
    >
      {thumb && (
        <Image
          src={thumb}
          alt={product.title}
          width={0}
          height={0}
          sizes="100vw"
          className={cn("w-full object-cover", classes.image)}
          style={{
            aspectRatio: props.layout === "horizontal" ? "16/9" : "4/3",
          }}
        />
      )}
      <div className="p-4">
        {product.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.badges.map((b, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  color: b.color || "#fff",
                  backgroundColor: b.bgColor || ctx.primaryColor,
                }}
              >
                {b.text}
              </span>
            ))}
          </div>
        )}
        <h3
          className={cn(
            "font-semibold text-base leading-snug mb-1",
            classes.heading,
          )}
        >
          {product.title}
        </h3>
        {props.showDescription && product.subtitle && (
          <p className="text-sm text-muted-foreground mb-2">
            {product.subtitle}
          </p>
        )}
        {product.product_rating != null && props.showRating && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-yellow-400 text-sm">
              {"★".repeat(Math.round(product.product_rating))}
            </span>
            <span className="text-xs text-muted-foreground">
              {product.product_rating.toFixed(1)} ·{" "}
              {product.review_count.toLocaleString()} reviews
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-2 mb-3">
          {product.price != null && (
            <span
              className="font-bold text-xl"
              style={{ color: ctx.primaryColor }}
            >
              {formatCurrency(product.price, { currency: product.currency })}
            </span>
          )}
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.original_price!, {
                currency: product.currency,
              })}
            </span>
          )}
        </div>
        {props.showSoldCount && product.sold_count > 0 && (
          <p className="text-xs text-muted-foreground mb-3">
            ✓ {product.sold_count.toLocaleString()} sold
          </p>
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center justify-center w-full py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition-opacity",
            classes.button,
          )}
          style={{ backgroundColor: ctx.primaryColor }}
          onClick={() =>
            ctx.onProductClick?.(
              product.id,
              product.affiliate_url ? "affiliate" : "marketplace",
            )
          }
        >
          {(props.ctaText as string) || "Buy Now"}
        </a>
      </div>
    </div>
  );
}

function ProductListBlock({ props, classes, ctx }: BlockProps) {
  const productIds = (props.productIds as string[]) ?? [];
  const products =
    productIds.length > 0
      ? (productIds
          .map((id) => ctx.products.find((p) => p.id === id))
          .filter(Boolean) as Product[])
      : ctx.products;
  if (products.length === 0) return null;

  const isGrid = props.layout !== "list";
  const cols = (props.columns as number) || 3;

  return (
    <div
      className={cn(
        isGrid
          ? `grid grid-cols-2 sm:grid-cols-${Math.min(cols, 4)} gap-4`
          : "space-y-3",
        classes.wrapper,
      )}
    >
      {products.map((product) => {
        const thumb =
          product.images.find((i) => i.is_primary)?.url ??
          product.images[0]?.url;
        const href = product.affiliate_url ?? product.marketplace_url ?? "#";
        const hasDiscount =
          product.original_price &&
          product.original_price > (product.price ?? 0);

        if (!isGrid) {
          return (
            <a
              key={product.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex gap-3 items-center rounded-xl border bg-card p-3 hover:shadow-md transition-shadow",
                classes.card,
              )}
            >
              {thumb && (
                <Image
                  src={thumb}
                  alt={product.title}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="size-16 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.title}</p>
                {product.price != null && (
                  <p
                    className="font-bold text-sm mt-0.5"
                    style={{ color: ctx.primaryColor }}
                  >
                    {formatCurrency(product.price, {
                      currency: product.currency,
                    })}
                  </p>
                )}
              </div>
              <span className="text-muted-foreground shrink-0">›</span>
            </a>
          );
        }

        return (
          <a
            key={product.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "block rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow",
              classes.card,
            )}
            onClick={() =>
              ctx.onProductClick?.(
                product.id,
                product.affiliate_url ? "affiliate" : "marketplace",
              )
            }
          >
            {thumb && (
              <Image
                src={thumb}
                alt={product.title}
                width={0}
                height={0}
                sizes="100vw"
                className={cn("w-full object-cover", classes.image)}
                style={{ aspectRatio: "1/1" }}
              />
            )}
            <div className="p-3">
              <p className="font-medium text-xs line-clamp-2 mb-1">
                {product.title}
              </p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                {product.price != null && (
                  <span
                    className="font-bold text-sm"
                    style={{ color: ctx.primaryColor }}
                  >
                    {formatCurrency(product.price, {
                      currency: product.currency,
                    })}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.original_price!, {
                      currency: product.currency,
                    })}
                  </span>
                )}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

function PricingBlock({ props, classes, ctx }: BlockProps) {
  const highlighted = (props.highlightIndex as number) ?? 1;
  const pricingItemIds = useMemo(
    () => (props.pricingItemIds as string[]) ?? [],
    [props.pricingItemIds],
  );
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pricingItemIds.length === 0) {
      setLoading(false);
      return;
    }
    getPublicApplicationsByIds(pricingItemIds).then((res) => {
      if (res.success) {
        // Sort apps to match the order of pricingItemIds
        const sortedApps = (res.data ?? []).sort(
          (a, b) => pricingItemIds.indexOf(a.id) - pricingItemIds.indexOf(b.id),
        );
        setApps(sortedApps);
      }
      setLoading(false);
    });
  }, [pricingItemIds]);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground text-sm p-8">
        Loading pricing plans...
      </div>
    );
  }

  if (apps.length === 0)
    return (
      <div className="text-center text-muted-foreground text-sm p-8">
        Configure pricing plans in the block settings.
      </div>
    );

  return (
    <div
      className={cn(
        `grid grid-cols-1 sm:grid-cols-${Math.min(apps.length, 3)} gap-6`,
        classes.wrapper,
      )}
    >
      {apps.map((app, i) => {
        const config = app.config as {
          price?: number | string;
          period?: string;
          features?: string[];
          ctaText?: string;
          ctaUrl?: string;
        };
        return (
          <div
            key={app.id}
            className={cn(
              "rounded-2xl border p-6 flex flex-col",
              i === highlighted
                ? "border-primary ring-2 ring-primary relative"
                : "",
              classes.card,
            )}
          >
            {i === highlighted && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: ctx.primaryColor }}
              >
                Most Popular
              </div>
            )}
            <h3 className="font-bold text-lg mb-1">{app.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-extrabold">
                {typeof config.price === "number"
                  ? formatCurrency(config.price, {
                      currency: "IDR",
                      noDecimals: true,
                    })
                  : config.price}
              </span>
              {config.period && (
                <span className="text-muted-foreground text-sm">
                  /{config.period}
                </span>
              )}
            </div>
            <ul className="space-y-2 flex-1 mb-6">
              {(config.features ?? []).map((f, j) => (
                <li key={j} className="text-sm flex items-start gap-2">
                  <span className="text-green-500 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={config.ctaUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-center py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90",
                i === highlighted ? "text-white" : "border",
                classes.button,
              )}
              style={
                i === highlighted
                  ? { backgroundColor: ctx.primaryColor }
                  : { color: ctx.primaryColor, borderColor: ctx.primaryColor }
              }
            >
              {config.ctaText || "Get Started"}
            </a>
          </div>
        );
      })}
    </div>
  );
}

function CheckoutBlock({ props, classes, ctx }: BlockProps) {
  const fields = (props.fields as Record<string, boolean>) ?? {};
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Sprint D will wire this to the orders table
    // For now show success state
    setSubmitted(true);
  }

  if (submitted)
    return (
      <OrderConfirmBlock
        props={{
          ...props,
          headline: "Order Received! 🎉",
          subheadline: "Thank you! We'll contact you shortly.",
        }}
        classes={classes}
        ctx={ctx}
      />
    );

  return (
    <div className={cn("w-full max-w-lg mx-auto", classes.wrapper)}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.name !== false && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Full Name *
            </label>
            <input
              type="text"
              required
              className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2"
              style={
                { "--tw-ring-color": ctx.primaryColor } as React.CSSProperties
              }
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
        )}
        {fields.phone !== false && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Phone / WhatsApp *
            </label>
            <input
              type="tel"
              required
              className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2"
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>
        )}
        {fields.email && (
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2"
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>
        )}
        {fields.address !== false && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Shipping Address *
            </label>
            <textarea
              required
              className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 min-h-18 resize-none"
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
            />
          </div>
        )}
        {fields.notes && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Notes (optional)
            </label>
            <textarea
              className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 min-h-15 resize-none"
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
        )}
        <button
          type="submit"
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity mt-2",
            classes.button,
          )}
          style={{ backgroundColor: ctx.primaryColor }}
        >
          {(props.submitLabel as string) || "Place Order"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          🔒 Your data is safe and secure
        </p>
      </form>
    </div>
  );
}

function OrderConfirmBlock({ props, classes, ctx }: BlockProps) {
  const steps = (props.steps as { icon: string; text: string }[]) ?? [];
  return (
    <div className={cn("text-center space-y-6 py-8", classes.wrapper)}>
      <div className="text-6xl">🎉</div>
      <div>
        <h2 className={cn("text-2xl font-bold mb-2", classes.heading)}>
          {(props.headline as string) || "Order Received!"}
        </h2>
        <p className={cn("text-muted-foreground", classes.text)}>
          {(props.subheadline as string) || "Thank you for your purchase!"}
        </p>
      </div>
      {steps.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="size-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: ctx.primaryColor }}
              >
                {i + 1}
              </div>
              <p className="text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentListBlock({ props, classes, ctx }: BlockProps) {
  // Renders from payment_method apps assigned — Sprint D will wire actual data
  return (
    <div className={cn("text-center", classes.wrapper)}>
      {props.title && (
        <h3 className="font-semibold mb-4">{props.title as string}</h3>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {[
          "Bank Transfer",
          "GoPay",
          "OVO",
          "Dana",
          "ShopeePay",
          "QRIS",
          "COD",
        ].map((m) => (
          <div
            key={m}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/30"
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function StockCounterBlock({ props, classes, ctx }: BlockProps) {
  const initial = (props.initialStock as number) || 100;
  const [current] = useState(() => {
    const baseSold = Math.floor(Math.random() * 30) + 5;
    return Math.max(0, initial - baseSold);
  });
  const pct = (current / initial) * 100;
  const label = ((props.label as string) || "Only {count} left!").replace(
    "{count}",
    String(current),
  );

  return (
    <div className={cn("w-full", classes.wrapper)}>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium text-orange-600">{label}</span>
        <span className="font-bold" style={{ color: ctx.primaryColor }}>
          {current}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-orange-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SOCIAL & TRUST BLOCKS
// ══════════════════════════════════════════════════════════════

function TestimonialBlock({ props, classes, ctx }: BlockProps) {
  const items =
    (props.items as {
      name: string;
      role?: string;
      text: string;
      rating: number;
      avatar?: string;
    }[]) ?? [];

  const cols = (props.columns as number) || 3;

  // ── Carousel mode ──────────────────────────────────────────
  if (props.style === "carousel") {
    return (
      <TestimonialCarousel
        items={items}
        props={props}
        classes={classes}
        ctx={ctx}
        cols={cols}
      />
    );
  }

  // ── Grid / List mode ───────────────────────────────────────
  return (
    <div
      className={cn(
        props.style === "list"
          ? "space-y-4"
          : `grid grid-cols-1 sm:grid-cols-${Math.min(cols, 3)} gap-4`,
        classes.wrapper,
      )}
    >
      {items.map((item, i) => (
        <TestimonialCard
          key={i}
          item={item}
          props={props}
          classes={classes}
          ctx={ctx}
        />
      ))}
    </div>
  );
}

function TestimonialCarousel({
  items,
  props,
  classes,
  ctx,
  cols,
}: {
  items: {
    name: string;
    role?: string;
    text: string;
    rating: number;
    avatar?: string;
  }[];
  props: Record<string, unknown>;
  classes: BlockClasses;
  ctx: RenderContext;
  cols: number;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [autoPlayDelay] = useState(() => {
    if (typeof props.autoPlayDelay === "number") {
      return props.autoPlayDelay;
    } else if (typeof props.autoPlayDelay === "string") {
      return Number(props.autoPlayDelay);
    }
    return 3000;
  });

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    return () => {
      api.off("select", () => {});
    };
  }, [api]);

  const autoPlayPlugin = Autoplay({
    active: Boolean(props.autoPlay),
    delay: autoPlayDelay,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  });

  // How many slides visible at once based on cols config
  const basisClass =
    cols === 1 ? "basis-full" : cols === 2 ? "sm:basis-1/2" : "sm:basis-1/3";

  return (
    <div className={cn("relative w-full", classes.wrapper)}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: Boolean(props.loop ?? true),
        }}
        plugins={props.autoPlay ? [autoPlayPlugin] : []}
        className="w-full"
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {items.map((item, i) => (
            <CarouselItem key={i} className={cn("pl-3 md:pl-4", basisClass)}>
              <TestimonialCard
                item={item}
                props={props}
                classes={classes}
                ctx={ctx}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrows — only show when enough items */}
        {(props.showArrows ?? true) && items.length > 1 && (
          <>
            <CarouselPrevious className="-left-4 sm:-left-6" />
            <CarouselNext className="-right-4 sm:-right-6" />
          </>
        )}
      </Carousel>

      {/* Dots */}
      {(props.showDots ?? true) && count > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={cn(
                "rounded-full transition-all cursor-pointer",
                i === current
                  ? "w-4 h-2 bg-primary"
                  : "size-2 bg-muted-foreground/30 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialCard({
  item,
  props,
  classes,
  ctx,
}: {
  item: {
    name: string;
    role?: string;
    text: string;
    rating: number;
    avatar?: string;
  };
  props: Record<string, any>;
  classes: BlockClasses;
  ctx: RenderContext;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-5 flex flex-col gap-3 h-full",
        classes.card,
      )}
    >
      {/* Rating stars */}
      {props.showRating && (
        <div className="flex gap-0.5 text-yellow-400">
          {Array.from({ length: Math.min(item.rating ?? 5, 5) }).map((_, j) => (
            <span key={j} aria-hidden>
              ★
            </span>
          ))}
        </div>
      )}

      {/* Review text */}
      <p
        className={cn(
          "text-sm text-muted-foreground leading-relaxed italic flex-1",
          classes.text,
        )}
      >
        &ldquo;{item.text}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-2 mt-auto">
        {props.showAvatar &&
          (item.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.avatar}
              alt={item.name}
              className="size-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="size-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: ctx.primaryColor }}
            >
              {item.name.charAt(0).toUpperCase()}
            </div>
          ))}
        <div className="min-w-0 text-start">
          <p className={cn("font-semibold text-sm truncate", classes.heading)}>
            {item.name}
          </p>
          {item.role && (
            <p className="text-xs text-muted-foreground truncate">
              {item.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FAQBlock({ props, classes, ctx }: BlockProps) {
  const items = (props.items as { question: string; answer: string }[]) ?? [];
  const [open, setOpen] = useState<number | null>(props.openFirst ? 0 : null);

  return (
    <div className={cn("space-y-2", classes.wrapper)}>
      {items.map((item, i) => (
        <div
          key={i}
          className={cn("rounded-xl border overflow-hidden", classes.card)}
        >
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-muted/50 transition-colors gap-3"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className={cn("font-medium text-sm", classes.heading)}>
              {item.question}
            </span>
            <span
              className={cn(
                "text-xl shrink-0 transition-transform",
                open === i ? "rotate-45" : "",
              )}
              style={{ color: ctx.primaryColor }}
            >
              +
            </span>
          </button>
          {open === i && (
            <div className="px-4 pb-4">
              <p
                className={cn(
                  "text-sm text-muted-foreground leading-relaxed",
                  classes.text,
                )}
              >
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SocialLinksBlock({ props, classes, ctx }: BlockProps) {
  const links =
    (props.links as { platform: string; label: string; url: string }[]) ?? [];
  const isList = props.layout === "list" || !props.layout;
  const isHorizontal = props.layout === "horizontal";

  return (
    <div
      className={cn(
        isHorizontal
          ? "flex flex-wrap gap-3 justify-center"
          : isList
            ? "flex flex-col gap-2 max-w-sm mx-auto"
            : "grid grid-cols-2 gap-2",
        classes.wrapper,
      )}
    >
      {links
        .filter((l) => l.url)
        .map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 rounded-xl font-medium text-sm transition-opacity hover:opacity-90",
              props.buttonStyle === "outlined"
                ? "border-2 px-4 py-2.5"
                : props.buttonStyle === "ghost"
                  ? "px-4 py-2.5 hover:bg-muted"
                  : "px-4 py-3 text-white",
              classes.button,
            )}
            style={
              props.buttonStyle !== "outlined" && props.buttonStyle !== "ghost"
                ? { backgroundColor: ctx.primaryColor }
                : { color: ctx.primaryColor, borderColor: ctx.primaryColor }
            }
          >
            <span className="size-4 shrink-0" />
            {link.label}
          </a>
        ))}
    </div>
  );
}

function FakeCommentBlock({ props, classes }: BlockProps) {
  const comments =
    (props.comments as {
      avatar?: string;
      username: string;
      text: string;
      likes: number;
      time: string;
    }[]) ?? [];
  return (
    <div className={cn("space-y-3", classes.wrapper)}>
      {comments.map((c, i) => (
        <div
          key={i}
          className={cn("flex gap-3 rounded-xl bg-muted/40 p-3", classes.card)}
        >
          {c.avatar ? (
            <Image
              src={c.avatar}
              alt={c.username}
              width={0}
              height={0}
              sizes="100vw"
              className="size-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
              {c.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">@{c.username}</p>
            <p className="text-sm text-muted-foreground">{c.text}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>❤️ {c.likes}</span>
              <span>{c.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FakeNotificationBlock({
  props,
  ctx,
}: {
  props: Record<string, unknown>;
  ctx: RenderContext;
}) {
  const messages = useMemo(
    () =>
      (props.messages as {
        name: string;
        location?: string;
        action: string;
        avatar?: string;
      }[]) ?? [],
    [props.messages],
  );
  const [current, setCurrent] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (messages.length === 0) return;
    let i = 0;
    const show = () => {
      setCurrent(i % messages.length);
      setVisible(true);
      setTimeout(() => setVisible(false), (props.duration as number) || 4000);
      i++;
    };
    const initial = setTimeout(show, 1000);
    const interval = setInterval(show, (props.interval as number) || 5000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [messages, props.interval, props.duration]);

  if (current === null || !visible) return null;
  const msg = messages[current];
  const posMap: Record<string, string> = {
    "bottom-left": "fixed bottom-4 left-4",
    "bottom-right": "fixed bottom-4 right-4",
    "top-left": "fixed top-4 left-4",
    "top-right": "fixed top-4 right-4",
  };

  return (
    <div
      className={cn(
        posMap[(props.position as string) || "bottom-left"],
        "z-50 max-w-xs animate-in slide-in-from-bottom-2 fade-in",
      )}
    >
      <div className="flex gap-3 items-start bg-background border shadow-lg rounded-xl p-3">
        {msg.avatar ? (
          <Image
            src={msg.avatar}
            alt={msg.name}
            width={0}
            height={0}
            sizes="100vw"
            className="size-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="size-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: ctx.primaryColor }}
          >
            {msg.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold truncate text-start">
            {msg.name}
          </p>
          {msg.location && (
            <p className="text-xs text-muted-foreground truncate text-start">
              {msg.location}
            </p>
          )}
          <p className="text-xs text-muted-foreground truncate text-start">
            {msg.action}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactBlock({ props, classes, ctx }: BlockProps) {
  const fields = (props.fields as Record<string, boolean>) ?? {};
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-3">✉️</p>
        <p className="font-semibold">
          Message sent! We&apos;ll get back to you soon.
        </p>
      </div>
    );

  return (
    <div className={cn("w-full max-w-lg mx-auto", classes.wrapper)}>
      {props.title && (
        <h2 className={cn("font-bold text-2xl mb-2", classes.heading)}>
          {props.title as string}
        </h2>
      )}
      {props.subtitle && (
        <p className={cn("text-muted-foreground mb-6", classes.text)}>
          {props.subtitle as string}
        </p>
      )}
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        {fields.name !== false && (
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background"
          />
        )}
        {fields.email !== false && (
          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background"
          />
        )}
        {fields.phone && (
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background"
          />
        )}
        {fields.message !== false && (
          <textarea
            placeholder="Your message..."
            rows={4}
            required
            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background resize-none"
          />
        )}
        <button
          type="submit"
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity",
            classes.button,
          )}
          style={{ backgroundColor: ctx.primaryColor }}
        >
          {(props.submitLabel as string) || "Send Message"}
        </button>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// INTERACTIVE BLOCKS
// ══════════════════════════════════════════════════════════════

function ButtonBlock({ props, classes, ctx }: BlockProps) {
  const styleClass =
    props.style === "outlined"
      ? cn(
          "border-2 font-semibold hover:opacity-80 transition-opacity",
          classes.button,
        )
      : props.style === "ghost"
        ? cn("hover:bg-muted transition-colors font-semibold", classes.button)
        : cn(
            "text-white font-bold hover:opacity-90 transition-opacity",
            classes.button,
          );

  const sizeClass =
    props.size === "sm"
      ? "px-4 py-2 text-sm"
      : props.size === "xl"
        ? "px-10 py-5 text-lg"
        : props.size === "lg"
          ? "px-8 py-3.5 text-base"
          : "px-6 py-3 text-sm";

  // ── WA Rotator: click handler resolves URL dynamically ─────
  const hasRotator = Boolean(props.waRotatorId);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!hasRotator) return; // normal link behavior

    e.preventDefault(); // stop default navigation

    const url = await resolveWaRotatorUrl(
      props.waRotatorId as string,
      props.waTemplateMessage as string | undefined,
    );

    if (url) {
      window.open(
        url,
        (props.target as string) || "_blank",
        "noopener,noreferrer",
      );
    }
  }

  const href = hasRotator ? "#" : (props.url as string) || "#";

  return (
    <a
      href={href}
      target={hasRotator ? undefined : (props.target as string) || "_blank"}
      rel="noopener noreferrer"
      onClick={hasRotator ? handleClick : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl",
        styleClass,
        sizeClass,
        props.fullWidth ? "w-full" : "",
      )}
      style={
        props.style === "outlined"
          ? { borderColor: ctx.primaryColor, color: ctx.primaryColor }
          : props.style === "ghost"
            ? { color: ctx.primaryColor }
            : { backgroundColor: ctx.primaryColor }
      }
    >
      {(props.text as string) || "Click Here"}
    </a>
  );
}

function ButtonGroupBlock({ props, classes, ctx }: BlockProps) {
  const buttons =
    (props.buttons as {
      text: string;
      url: string;
      style?: string;
      size?: string;
      linkType?: string;
      waRotatorId?: string;
      productId?: string;
    }[]) ?? [];

  const alignClass =
    props.alignment === "left"
      ? "justify-start"
      : props.alignment === "right"
        ? "justify-end"
        : "justify-center";

  return (
    <div className={cn("flex flex-wrap gap-3", alignClass, classes.wrapper)}>
      {buttons.map((btn, i) => (
        <ButtonItem
          key={i}
          btn={btn}
          props={props}
          classes={classes}
          ctx={ctx}
        />
      ))}
    </div>
  );
}

function ButtonItem({
  btn,
  props,
  classes,
  ctx,
}: {
  btn: {
    text: string;
    url: string;
    style?: string | undefined;
    size?: string | undefined;
    linkType?: string | undefined;
    waRotatorId?: string | undefined;
    productId?: string | undefined;
  };
  props: Record<string, any>;
  classes: BlockClasses;
  ctx: RenderContext;
}) {
  const linkType = btn.linkType || "none";
  const hasRotator = linkType === "whatsapp" && Boolean(btn.waRotatorId);
  const hasProduct = linkType === "product" && Boolean(btn.productId);
  const hasCustomLink = linkType === "custom" && Boolean(btn.url);

  const product = hasProduct
    ? (ctx.products.find((p) => p.id === props.productId) ?? ctx.products[0])
    : undefined;
  const productUrl = product?.affiliate_url ?? product?.marketplace_url ?? "#";

  const [href, setHref] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const resolveHref = async () => {
      if (hasRotator) {
        setIsResolving(true);
        try {
          const url = await resolveWaRotatorUrl(
            btn.waRotatorId as string,
            undefined,
          );
          setHref(url || "https://wa.me/");
        } catch (error) {
          console.error("Failed to resolve wa rotator:", error);
          setHref("https://wa.me/"); // fallback
        } finally {
          setIsResolving(false);
        }
      } else if (hasProduct) {
        if (product) {
          setHref(productUrl);
        } else {
          setHref("#");
        }
      } else if (hasCustomLink) {
        setHref((btn.url as string) || "");
      } else {
        setHref("");
      }
    };

    resolveHref();
  }, [
    btn.waRotatorId,
    btn.url,
    btn.productId,
    hasRotator,
    hasProduct,
    hasCustomLink,
    ctx.products,
    product,
    productUrl,
  ]);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isResolving) {
      e.preventDefault();
      return;
    }
    if (!href || href === "#") {
      e.preventDefault();
      return;
    }

    if (hasProduct && ctx.onProductClick) {
      if (product) {
        const clickType = product.affiliate_url ? "affiliate" : "marketplace";
        ctx.onProductClick(product.id, clickType);
      }
    }
  }

  const shouldWrap = hasRotator || hasProduct || hasCustomLink;

  return shouldWrap ? (
    <a
      href={href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl font-semibold transition-opacity hover:opacity-90",
        btn.size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3 text-sm",
        btn.style === "outlined" ? "border-2" : "text-white",
        classes.button,
      )}
      style={
        btn.style === "outlined"
          ? { borderColor: ctx.primaryColor, color: ctx.primaryColor }
          : { backgroundColor: ctx.primaryColor }
      }
      onClick={handleClick}
    >
      {btn.text}
    </a>
  ) : (
    <a
      href={btn.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl font-semibold transition-opacity hover:opacity-90",
        btn.size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3 text-sm",
        btn.style === "outlined" ? "border-2" : "text-white",
        classes.button,
      )}
      style={
        btn.style === "outlined"
          ? { borderColor: ctx.primaryColor, color: ctx.primaryColor }
          : { backgroundColor: ctx.primaryColor }
      }
    >
      {btn.text}
    </a>
  );
}

function FloatButtonBlock({
  props,
  ctx,
}: {
  props: Record<string, any>;
  ctx: RenderContext;
}) {
  const posMap: Record<string, string> = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "top-right": "fixed top-6 right-6",
    "top-left": "fixed top-6 left-6",
  };

  const linkType = props.type || "scroll-top";
  const hasRotator = linkType === "whatsapp" && Boolean(props.waRotatorId);
  const hasProduct = linkType === "product" && Boolean(props.productId);
  const hasCustomLink = linkType === "custom" && Boolean(props.customUrl);

  const product = hasProduct
    ? (ctx.products.find((p) => p.id === props.productId) ?? ctx.products[0])
    : undefined;
  const productUrl = product?.affiliate_url ?? product?.marketplace_url ?? "#";

  const [href, setHref] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const resolveHref = async () => {
      if (hasRotator) {
        setIsResolving(true);
        try {
          const url = await resolveWaRotatorUrl(
            props.waRotatorId as string,
            props.waTemplateMessage as string | undefined,
          );
          setHref(url || "https://wa.me/");
        } catch (error) {
          console.error("Failed to resolve wa rotator:", error);
          setHref("https://wa.me/"); // fallback
        } finally {
          setIsResolving(false);
        }
      } else if (hasProduct) {
        if (product) {
          setHref(productUrl);
        } else {
          setHref("#");
        }
      } else if (hasCustomLink) {
        setHref((props.linkUrl as string) || "");
      } else {
        setHref("");
      }
    };

    resolveHref();
  }, [
    props.waRotatorId,
    props.waTemplateMessage,
    props.linkUrl,
    props.productId,
    hasRotator,
    hasProduct,
    hasCustomLink,
    ctx.products,
    product,
    productUrl,
  ]);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isResolving) {
      e.preventDefault();
      return;
    }

    if (linkType === "scroll-top") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!href || href === "#") {
      e.preventDefault();
      return;
    }

    // Track product click if it's a product link
    if (hasProduct && ctx.onProductClick) {
      if (product) {
        const clickType = product.affiliate_url ? "affiliate" : "marketplace";
        ctx.onProductClick(product.id, clickType);
      }
    }
  }

  const primaryColor = "#25D366"; // always green for WA float button

  return (
    <a
      href={href || "#"}
      target={linkType === "scroll-top" ? "_self" : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        posMap[(props.position as string) || "bottom-right"],
        "z-50 flex items-center gap-2 rounded-full shadow-xl px-4 py-3 text-white font-semibold text-sm hover:scale-105 transition-transform",
        props.pulseAnimation ? "animate-pulse" : "",
      )}
      style={{ backgroundColor: primaryColor }}
    >
      <span>💬</span>
      {props.showLabel && <span>{(props.label as string) || "Chat"}</span>}
    </a>
  );
}

function CountdownBlock({ props, classes, ctx }: BlockProps) {
  const targetDate = props.targetDate as string;
  const [diff, setDiff] = useState(() =>
    targetDate ? Math.max(0, new Date(targetDate).getTime() - Date.now()) : 0,
  );

  useEffect(() => {
    if (!targetDate) return;
    const t = setInterval(
      () => setDiff(Math.max(0, new Date(targetDate).getTime() - Date.now())),
      1000,
    );
    return () => clearInterval(t);
  }, [targetDate]);

  const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
  const expired = diff === 0 && targetDate;

  if (expired)
    return (
      <p
        className={cn(
          "text-center font-semibold text-muted-foreground",
          classes.text,
        )}
      >
        {(props.expiredText as string) || "Offer has ended"}
      </p>
    );

  const units = [
    { v: pad(diff / 86400000), u: "Days", show: props.showDays !== false },
    { v: pad((diff % 86400000) / 3600000), u: "Hours" },
    { v: pad((diff % 3600000) / 60000), u: "Min" },
    { v: pad((diff % 60000) / 1000), u: "Sec" },
  ].filter((u) => u.show !== false);

  return (
    <div className={cn("text-center", classes.wrapper)}>
      {props.label && (
        <p
          className={cn(
            "text-sm font-semibold mb-3 text-muted-foreground",
            classes.text,
          )}
        >
          {props.label as string}
        </p>
      )}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {units.map(({ v, u }) => (
          <div
            key={u}
            className={cn("flex flex-col items-center", classes.card)}
          >
            <div
              className="rounded-xl px-4 py-3 min-w-15 sm:min-w-20 text-center font-extrabold text-3xl sm:text-4xl tabular-nums text-white"
              style={{ backgroundColor: ctx.primaryColor }}
            >
              {v}
            </div>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              {u}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormBlock({ props, classes, ctx }: BlockProps) {
  const fields =
    (props.fields as {
      name: string;
      label: string;
      type: string;
      required?: boolean;
      placeholder?: string;
    }[]) ?? [];
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div className="text-center py-6">
        <p className="text-lg">✅</p>
        <p className="font-semibold mt-2">
          {(props.successMessage as string) || "Thank you!"}
        </p>
      </div>
    );

  return (
    <div className={cn("w-full max-w-md mx-auto", classes.wrapper)}>
      {props.title && (
        <h2 className={cn("font-bold text-xl mb-2", classes.heading)}>
          {props.title as string}
        </h2>
      )}
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        {fields.map((f, i) => (
          <div key={i}>
            <label className="text-sm font-medium mb-1 block">
              {f.label}
              {f.required ? " *" : ""}
            </label>
            {f.type === "textarea" ? (
              <textarea
                placeholder={f.placeholder}
                required={f.required}
                className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background resize-none min-h-20"
              />
            ) : (
              <input
                type={f.type}
                placeholder={f.placeholder}
                required={f.required}
                className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity mt-1",
            classes.button,
          )}
          style={{ backgroundColor: ctx.primaryColor }}
        >
          {(props.submitLabel as string) || "Submit"}
        </button>
      </form>
    </div>
  );
}

function PopupBlock({ props, classes, ctx }: BlockProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const trigger = props.trigger as string;
    if (trigger === "time") {
      const t = setTimeout(
        () => setShow(true),
        ((props.triggerDelay as number) || 5) * 1000,
      );
      return () => clearTimeout(t);
    }
    if (trigger === "scroll") {
      const onScroll = () => {
        const pct =
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100;
        if (pct >= ((props.triggerScroll as number) || 50)) {
          setShow(true);
          window.removeEventListener("scroll", onScroll);
        }
      };
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [dismissed, props.trigger, props.triggerDelay, props.triggerScroll]);

  if (!show || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
      onClick={() => setDismissed(true)}
    >
      <div
        className={cn(
          "relative bg-background rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center",
          classes.card,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {props.showCloseButton && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 size-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            ✕
          </button>
        )}
        <div
          className="text-sm"
          dangerouslySetInnerHTML={{
            __html: stripScriptTags((props.content as string) || ""),
          }}
        />
        {props.ctaUrl && props.ctaText && (
          <a
            href={props.ctaUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-4 inline-flex items-center gap-2 rounded-xl font-bold px-6 py-2.5 text-sm text-white hover:opacity-90 transition-opacity",
              classes.button,
            )}
            style={{ backgroundColor: ctx.primaryColor }}
          >
            {props.ctaText as string}
          </a>
        )}
      </div>
    </div>
  );
}

function ChatBotBlock({
  props,
  ctx,
}: {
  props: Record<string, any>;
  ctx: RenderContext;
}) {
  const [open, setOpen] = useState(false);
  const greeting = (props.greeting as string) || "Hi! How can I help you?";
  const botName = (props.botName as string) || "Support";
  const primaryColor = (props.primaryColor as string) || "#25D366";
  const hasRotator = Boolean(props.waRotatorId);

  async function handleChatClick(e: React.MouseEvent) {
    e.preventDefault();

    let url: string | null = null;

    if (hasRotator) {
      url = await resolveWaRotatorUrl(
        props.waRotatorId as string,
        props.waTemplateMessage as string | undefined,
      );
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(greeting)}`;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col items-end gap-3",
        props.position === "bottom-left"
          ? "bottom-6 left-6"
          : "bottom-6 right-6",
      )}
    >
      {open && (
        <div className="bg-background rounded-2xl shadow-2xl border w-72 overflow-hidden animate-in slide-in-from-bottom-2">
          <div
            className="px-4 py-3 text-white flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="size-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {botName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-sm">{botName}</p>
              <p className="text-xs opacity-80">● Online</p>
            </div>
          </div>
          <div className="p-4">
            <div className="rounded-xl bg-muted p-3 text-sm mb-4">
              {greeting}
            </div>
            <button
              type="button"
              onClick={handleChatClick}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              💬 {hasRotator ? "Chat via WhatsApp" : "Chat Now"}
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="size-14 rounded-full shadow-xl flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform"
        style={{ backgroundColor: primaryColor }}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

function TabBlock({ props, classes, ctx }: BlockProps) {
  const tabs = (props.tabs as { label: string; content: string }[]) ?? [];
  const [active, setActive] = useState((props.defaultTab as number) || 0);

  return (
    <div className={cn("w-full", classes.wrapper)}>
      <div
        className={cn(
          "flex border-b mb-4",
          props.style === "pills" ? "gap-2" : "",
        )}
      >
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              props.style === "pills" ? "rounded-full" : "border-b-2 -mb-px",
              i === active
                ? props.style === "pills"
                  ? "text-white"
                  : "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
            style={
              i === active && props.style === "pills"
                ? { backgroundColor: ctx.primaryColor }
                : {}
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[active] && (
        <div
          className={cn("text-sm leading-relaxed", classes.text)}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: user content
          dangerouslySetInnerHTML={{
            __html: stripScriptTags(tabs[active].content),
          }}
        />
      )}
    </div>
  );
}

function FloatingContentBlock({ props, classes }: BlockProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const posMap: Record<string, string> = {
    bottom: "fixed bottom-0 left-0 right-0",
    top: "fixed top-0 left-0 right-0",
  };
  return (
    <div
      className={cn(
        posMap[(props.position as string) || "bottom"],
        "z-50 bg-background border-t shadow-xl p-4 flex items-center justify-between gap-4",
      )}
    >
      <p className={cn("text-sm", classes.text)}>{props.content as string}</p>
      {props.dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground text-sm shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function MenuGroupBlock({ props, classes, ctx }: BlockProps) {
  const groups =
    (props.groups as {
      title: string;
      links: { label: string; href: string }[];
    }[]) ?? [];
  const [open, setOpen] = useState<string | null>(groups[0]?.title ?? null);
  return (
    <div className={cn("space-y-2 w-full max-w-md mx-auto", classes.wrapper)}>
      {groups.map((group) => (
        <div key={group.title} className="rounded-xl overflow-hidden border">
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold hover:bg-muted/50 transition-colors"
            onClick={() => setOpen(open === group.title ? null : group.title)}
          >
            {group.title}
            <span
              className={cn(
                "transition-transform",
                open === group.title ? "rotate-180" : "",
              )}
            >
              ⌄
            </span>
          </button>
          {open === group.title && (
            <div className="border-t divide-y">
              {group.links.map((l, i) => (
                <a
                  key={i}
                  href={l.href}
                  className="flex items-center px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ADVANCED BLOCKS
// ══════════════════════════════════════════════════════════════

function AnimationBlock({ props, classes, ctx }: BlockProps) {
  if (props.animationType === "arrow-bounce") {
    return (
      <div className={cn("flex justify-center", classes.wrapper)}>
        <div
          className="animate-bounce text-3xl"
          style={{ color: ctx.primaryColor }}
        >
          {props.direction === "up"
            ? "↑"
            : props.direction === "left"
              ? "←"
              : props.direction === "right"
                ? "→"
                : "↓"}
        </div>
      </div>
    );
  }
  if (props.animationType === "image" && props.content) {
    return (
      <div className={cn("flex justify-center", classes.wrapper)}>
        <Image
          src={props.content as string}
          alt="animation"
          width={0}
          height={0}
          sizes="100vw"
          className="animate-pulse max-w-xs w-full"
        />
      </div>
    );
  }
  return null;
}

function CustomHtmlBlock({ props }: { props: Record<string, any> }) {
  if (!props.html) return null;
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: user custom HTML
    <div
      dangerouslySetInnerHTML={{
        __html: stripScriptTags(props.html as string),
      }}
    />
  );
}

function GoogleMapsBlock({ props }: { props: Record<string, any> }) {
  const address = props.address as string;
  if (!address) return null;
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=${props.zoom || 15}&output=embed`;
  return (
    <div className="w-full rounded-xl overflow-hidden">
      <iframe
        src={src}
        style={{ height: (props.height as string) || "400px" }}
        className="w-full border-0"
        title="Google Maps"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function AutoRedirectBlock({
  props,
  ctx,
}: {
  props: Record<string, any>;
  ctx: RenderContext;
}) {
  const [secs, setSecs] = useState((props.delaySeconds as number) || 5);

  const linkType = props.linkType || "none";
  const hasRotator = linkType === "whatsapp" && Boolean(props.waRotatorId);
  const hasProduct = linkType === "product" && Boolean(props.productId);
  const hasCustomLink = linkType === "custom" && Boolean(props.targetUrl);

  const product = hasProduct
    ? (ctx.products.find((p) => p.id === props.productId) ?? ctx.products[0])
    : undefined;
  const productUrl = product?.affiliate_url ?? product?.marketplace_url ?? "#";

  const [finalURL, setFinalURL] = useState<string>("");
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const resolveURL = async () => {
      if (hasRotator) {
        setIsResolving(true);
        try {
          const rotatorUrl = await resolveWaRotatorUrl(
            props.waRotatorId as string,
            props.waTemplateMessage as string | undefined,
          );
          setFinalURL(
            rotatorUrl || (props.targetUrl as string) || "https://wa.me/",
          );
        } catch (error) {
          console.error("Gagal resolve wa rotator", error);
          setFinalURL((props.targetUrl as string) || "");
        } finally {
          setIsResolving(false);
        }
      } else if (hasProduct) {
        if (product) {
          setFinalURL(productUrl);
        } else {
          setFinalURL("");
        }
      } else if (hasCustomLink) {
        setFinalURL((props.targetUrl as string) || "");
      } else {
        setFinalURL("");
      }
    };

    resolveURL();
  }, [
    hasRotator,
    hasProduct,
    hasCustomLink,
    props.targetUrl,
    props.waRotatorId,
    props.waTemplateMessage,
    props.productId,
    ctx.products,
    product,
    productUrl,
  ]);

  useEffect(() => {
    if (isResolving || !finalURL) return;

    if (secs <= 0) {
      // Track product click if it's a product link
      if (hasProduct && ctx.onProductClick) {
        if (product) {
          const clickType = product.affiliate_url ? "affiliate" : "marketplace";
          ctx.onProductClick(product.id, clickType);
        }
      }
      window.location.href = finalURL;
      return;
    }

    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs, finalURL, isResolving, hasProduct, ctx, product]);

  const message = (
    (props.message as string) || "Redirecting in {seconds} seconds..."
  ).replace("{seconds}", String(secs));

  return (
    <div className="text-center py-8">
      {props.showCountdown && (
        <p
          className="text-6xl font-black mb-4"
          style={{ color: ctx.primaryColor }}
        >
          {secs}
        </p>
      )}
      <p className="text-muted-foreground">{message}</p>
      {finalURL && (
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          {finalURL}
        </p>
      )}
    </div>
  );
}

function BackRedirectBlock({
  props,
  ctx,
}: {
  props: Record<string, any>;
  ctx: RenderContext;
}) {
  const linkType = props.linkType || "none";
  const hasRotator = linkType === "whatsapp" && Boolean(props.waRotatorId);
  const hasProduct = linkType === "product" && Boolean(props.productId);
  const hasCustomLink = linkType === "custom" && Boolean(props.redirectUrl);

  const product = hasProduct
    ? (ctx.products.find((p) => p.id === props.productId) ?? ctx.products[0])
    : undefined;
  const productUrl = product?.affiliate_url ?? product?.marketplace_url ?? "#";

  useEffect(() => {
    if (!props.enabled) return;

    history.pushState(null, "", window.location.href);

    const onPopState = async () => {
      history.pushState(null, "", window.location.href);

      let finalURL: string | undefined = undefined;

      if (hasRotator) {
        try {
          const rotatorUrl = await resolveWaRotatorUrl(
            props.waRotatorId as string,
            props.waTemplateMessage as string | undefined,
          );
          if (rotatorUrl) {
            finalURL = rotatorUrl;
          }
        } catch (error) {
          console.error(error);
        }
      } else if (hasProduct) {
        if (product) {
          finalURL = productUrl;
        }
      } else if (hasCustomLink) {
        finalURL = props.redirectUrl as string | undefined;
      }

      if (finalURL) {
        // Track product click if it's a product link
        if (hasProduct && ctx.onProductClick) {
          if (product) {
            const clickType = product.affiliate_url
              ? "affiliate"
              : "marketplace";
            ctx.onProductClick(product.id, clickType);
          }
        }
        window.location.href = finalURL;
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [
    hasRotator,
    hasProduct,
    hasCustomLink,
    props.enabled,
    props.redirectUrl,
    props.waRotatorId,
    props.waTemplateMessage,
    props.productId,
    ctx,
    product,
    productUrl,
  ]);

  return null; // invisible block
}

function BlogPostBlock({ props, classes, ctx }: BlockProps) {
  const posts =
    (props.posts as {
      title: string;
      excerpt?: string;
      date?: string;
      image?: string;
      url?: string;
    }[]) ?? [];
  if (posts.length === 0) return null;
  const cols = (props.columns as number) || 3;

  return (
    <div
      className={cn(
        props.layout === "list"
          ? "space-y-4"
          : `grid grid-cols-1 sm:grid-cols-${Math.min(cols, 3)} gap-6`,
        classes.wrapper,
      )}
    >
      {posts.map((post, i) => (
        <a
          key={i}
          href={post.url || "#"}
          className={cn(
            "group block rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow",
            classes.card,
          )}
        >
          {post.image && (
            <Image
              src={post.image}
              alt={post.title}
              width={0}
              height={0}
              sizes="100vw"
              className="w-full object-cover"
              style={{ aspectRatio: "16/9" }}
            />
          )}
          <div className="p-4">
            {post.date && props.showDate && (
              <p className="text-xs text-muted-foreground mb-1">{post.date}</p>
            )}
            <h3
              className={cn(
                "font-semibold group-hover:text-primary transition-colors",
                classes.heading,
              )}
            >
              {post.title}
            </h3>
            {post.excerpt && props.showExcerpt && (
              <p
                className={cn(
                  "text-sm text-muted-foreground mt-1 line-clamp-2",
                  classes.text,
                )}
              >
                {post.excerpt}
              </p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

function SidebarBlock({ props, classes, ctx }: BlockProps) {
  const position = (props.position as string) ?? "left";
  const width = (props.width as string) ?? "280px";
  const sticky = (props.sticky as boolean) ?? false;
  const topOffset = (props.topOffset as string) ?? "0px";
  const content = (props.content as string) ?? "";

  // ── Sticky sidebar: render as a floating panel ─────────────
  // When sticky=true the sidebar is position:sticky inside the
  // nearest scrolling ancestor (the page body).  The main page
  // content must sit beside it, so we use a flex row wrapper.
  // Because BlockRenderer already wraps in <InnerContainer>,
  // we break out of that centering by using a full-width
  // negative-margin trick via classes.
  //
  // Non-sticky: render as a simple aside that sits on the side
  // the user selected in the builder.

  const sidebarStyles: React.CSSProperties = {
    width,
    minWidth: width,
    maxWidth: "100%",
    ...(sticky
      ? {
          position: "sticky",
          top: topOffset || "1rem",
          alignSelf: "flex-start",
          maxHeight: "calc(100vh - 2rem)",
          overflowY: "auto",
        }
      : {}),
  };

  const aside = (
    <aside
      aria-label="Sidebar"
      className={cn(
        // Base
        "shrink-0 rounded-xl border bg-card",
        // Spacing
        "p-4",
        // Mobile: always full width and not sticky
        "w-full sm:w-auto",
        // Custom classes from builder
        classes.wrapper,
      )}
      style={sidebarStyles}
    >
      {/* Render HTML content if it looks like HTML, plain text otherwise */}
      {content.trim().startsWith("<") ? (
        <div
          className="prose prose-sm max-w-none text-sm"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: user content
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {content}
        </p>
      )}
    </aside>
  );

  // When position is left or right, we return just the aside —
  // layout context (flex row with main content) should be set up
  // by the parent page or a block-columns block wrapping this.
  // We do add a visual indicator of position via border accent.
  return (
    <div
      className={cn(
        "flex w-full",
        position === "right" ? "justify-end" : "justify-start",
      )}
    >
      <aside
        aria-label="Sidebar"
        className={cn(
          "rounded-xl border bg-card p-4",
          // Left accent line to visually indicate it's a sidebar
          position === "left" ? "border-l-4" : "border-r-4",
          // Full width on mobile, fixed width on desktop
          "w-full",
          classes.wrapper,
        )}
        style={{
          // Apply the configured width only on sm+ screens
          // (on mobile it stretches full width for readability)
          ...sidebarStyles,
        }}
      >
        {/* Content */}
        {content.trim().startsWith("<") ? (
          <div
            className={cn("prose prose-sm max-w-none", classes.inner)}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: user content
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : content ? (
          <p
            className={cn(
              "text-sm text-muted-foreground leading-relaxed",
              classes.text,
            )}
          >
            {content}
          </p>
        ) : (
          // Empty state shown in builder preview
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-1 text-2xl opacity-20">☰</div>
            <p className="text-xs text-muted-foreground/60">Sidebar content</p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5">
              Add content in the block settings
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
