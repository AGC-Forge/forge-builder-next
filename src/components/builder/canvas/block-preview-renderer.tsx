"use client";

import Image from "next/image";
import type { BlockV2 } from "@/types/builder";
import type { Product } from "@/types/database";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import {
  Play,
  Star,
  ChevronDown,
  MapPin,
  Globe,
  Mail,
  Phone,
  ShoppingBag,
  ChevronRight,
  Quote,
  Minus,
} from "lucide-react";

interface Props {
  block: BlockV2;
  availableProducts: Product[];
  isSelected?: boolean;
}

export function BlockPreviewRenderer({
  block,
  availableProducts,
  isSelected,
}: Props) {
  const { type, props } = block;

  if (type === "block-hero") {
    return (
      <div
        className="relative min-h-50 flex flex-col items-center justify-center p-8 text-center"
        style={{
          background: props.backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url(${props.backgroundImageUrl as string}) center/cover`
            : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
        }}
      >
        <h2 className="text-2xl font-bold mb-2">
          {(props.headline as string) || "Your Headline"}
        </h2>
        {props.subheadline && (
          <p className="text-sm opacity-80 mb-4 max-w-md">
            {props.subheadline as string}
          </p>
        )}
        {props.ctaText && (
          <button
            type="button"
            className="bg-white text-purple-600 font-semibold px-6 py-2 rounded-lg text-sm"
          >
            {props.ctaText as string}
          </button>
        )}
      </div>
    );
  }

  if (type === "block-header") {
    return (
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background">
        <span className="font-bold text-sm">
          {(props.logoText as string) || "Brand"}
        </span>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {((props.navLinks as { label: string }[]) ?? [])
            .slice(0, 3)
            .map((l, i) => (
              <span key={i}>{l.label}</span>
            ))}
        </div>
        {props.ctaText && (
          <button
            type="button"
            className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md font-medium"
          >
            {props.ctaText as string}
          </button>
        )}
      </div>
    );
  }

  if (type === "block-footer") {
    return (
      <div className="bg-muted px-6 py-6 text-sm">
        <p className="font-semibold mb-1">
          {(props.logoText as string) || "Brand"}
        </p>
        <p className="text-muted-foreground text-xs">
          {(props.copyright as string) || `© ${new Date().getFullYear()} Brand`}
        </p>
      </div>
    );
  }

  if (type === "block-columns") {
    const cols = (props.columns as number) || 2;
    return (
      <div className={cn("grid gap-4 p-4", `grid-cols-${Math.min(cols, 4)}`)}>
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center h-16 text-xs text-muted-foreground"
          >
            Column {i + 1}
          </div>
        ))}
      </div>
    );
  }

  if (type === "block-anchor") {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono">
          #{(props.anchorId as string) || "anchor-id"}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    );
  }

  if (type === "block-divider") {
    return (
      <div className="px-4 py-3 flex items-center gap-3">
        {props.text ? (
          <>
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              {props.text as string}
            </span>
            <div className="h-px flex-1 bg-border" />
          </>
        ) : (
          <div className="h-px w-full bg-border" />
        )}
      </div>
    );
  }

  // ── Content ───────────────────────────────────────────────
  if (type === "block-text") {
    return (
      <div
        className="px-4 py-3 text-sm leading-relaxed prose prose-sm max-w-none"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: preview only
        dangerouslySetInnerHTML={{
          __html:
            (props.html as string) || "<p>Add your text content here...</p>",
        }}
      />
    );
  }

  if (type === "block-image") {
    return (
      <div className="overflow-hidden">
        {props.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.src as string}
            alt={(props.alt as string) || ""}
            className="w-full object-cover"
            style={{ aspectRatio: (props.aspectRatio as string) || "16/9" }}
          />
        ) : (
          <div
            className="bg-muted flex flex-col items-center justify-center gap-2"
            style={{ aspectRatio: "16/9" }}
          >
            <Globe className="size-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Image placeholder</p>
          </div>
        )}
        {props.caption && (
          <p className="text-center text-xs text-muted-foreground py-1.5">
            {props.caption as string}
          </p>
        )}
      </div>
    );
  }

  if (type === "block-video") {
    return (
      <div
        className="relative overflow-hidden rounded-lg bg-black"
        style={{ aspectRatio: (props.aspectRatio as string) || "16/9" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-white/90">
            <Play className="size-6 text-gray-900 ml-1" />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 text-xs text-white/70">
          {(props.platform as string)?.toUpperCase() || "VIDEO"}
        </div>
      </div>
    );
  }

  if (type === "block-features") {
    const items =
      (props.items as { icon: string; title: string; description: string }[]) ??
      [];
    return (
      <div className="p-4">
        <div
          className={cn(
            "grid gap-4",
            `grid-cols-${Math.min((props.columns as number) || 3, 3)}`,
          )}
        >
          {items.slice(0, 3).map((item, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Star className="size-5 text-primary" />
              </div>
              <p className="font-semibold text-xs">{item.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Commerce ──────────────────────────────────────────────
  if (type === "block-product-card") {
    const product =
      availableProducts.find((p) => p.id === props.productId) ??
      availableProducts[0];
    if (!product)
      return (
        <BlockPlaceholder
          label="Product Card"
          desc="Assign a product in the settings panel"
        />
      );
    const thumb =
      product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url;
    return (
      <div className="rounded-lg border overflow-hidden max-w-xs mx-auto">
        {thumb && (
          <Image
            src={thumb}
            alt={product.title}
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto aspect-square object-cover"
          />
        )}
        <div className="p-3">
          <p className="font-semibold text-sm">{product.title}</p>
          {product.price && (
            <p className="text-primary font-bold">
              {formatCurrency(product.price, { currency: product.currency })}
            </p>
          )}
          <button
            type="button"
            className="mt-2 w-full bg-primary text-primary-foreground text-xs py-1.5 rounded-md font-medium"
          >
            {(props.ctaText as string) || "Buy Now"}
          </button>
        </div>
      </div>
    );
  }

  if (type === "block-product-list") {
    const productIds = (props.productIds as string[]) ?? [];
    const products =
      productIds.length > 0
        ? productIds
            .map((id) => availableProducts.find((p) => p.id === id))
            .filter(Boolean)
            .slice(0, 4)
        : availableProducts.slice(0, 4);
    if (products.length === 0)
      return (
        <BlockPlaceholder
          label="Product List"
          desc="Assign products in the settings panel"
        />
      );
    return (
      <div
        className={cn(
          "grid gap-3 p-4",
          `grid-cols-${Math.min((props.columns as number) || 3, 3)}`,
        )}
      >
        {products.map((p, i) => {
          if (!p) return null;
          const thumb =
            p.images.find((img) => img.is_primary)?.url ?? p.images[0]?.url;
          return (
            <div key={p.id} className="rounded border overflow-hidden text-xs">
              {thumb && (
                <Image
                  src={thumb}
                  alt={p.title}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-auto aspect-square object-cover"
                />
              )}
              <div className="p-2">
                <p className="font-medium truncate">{p.title}</p>
                {p.price && (
                  <p className="text-primary font-bold text-xs">
                    {formatCurrency(p.price, { currency: p.currency })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === "block-pricing") {
    return (
      <div className="p-4 grid grid-cols-3 gap-3">
        {["Free", "Pro", "Enterprise"].map((plan, i) => (
          <div
            key={plan}
            className={cn(
              "rounded-lg border p-3 text-center text-xs",
              i === 1 && "border-primary ring-1 ring-primary bg-primary/5",
            )}
          >
            {i === 1 && (
              <div className="text-[10px] bg-primary text-primary-foreground rounded-full px-2 py-0.5 mb-1">
                Popular
              </div>
            )}
            <p className="font-bold">{plan}</p>
            <p className="text-muted-foreground text-[10px] mt-1">
              Starting from
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "block-checkout") {
    return (
      <div className="p-4 space-y-2">
        <p className="font-semibold text-sm mb-3">Order Form</p>
        {["Full Name", "Phone / WhatsApp", "Shipping Address"].map((field) => (
          <div
            key={field}
            className="h-8 rounded border bg-muted/40 flex items-center px-2 text-xs text-muted-foreground"
          >
            {field}
          </div>
        ))}
        <button
          type="button"
          className="w-full bg-primary text-primary-foreground py-2 rounded-md text-xs font-semibold mt-2"
        >
          {(props.submitLabel as string) || "Place Order"}
        </button>
      </div>
    );
  }

  // ── Social ────────────────────────────────────────────────
  if (type === "block-testimonial") {
    const items =
      (props.items as { name: string; text: string; rating: number }[]) ?? [];
    return (
      <div
        className={cn(
          "p-4 grid gap-3",
          `grid-cols-${Math.min((props.columns as number) || 3, 3)}`,
        )}
      >
        {(items.length > 0
          ? items
          : [{ name: "Customer", text: "Great product!", rating: 5 }]
        )
          .slice(0, 3)
          .map((item, i) => (
            <div key={i} className="rounded-lg border p-3 text-xs">
              <div className="flex text-yellow-400 mb-1.5">
                {Array.from({ length: item.rating || 5 }).map((_, j) => (
                  <Star key={j} className="size-3 fill-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground line-clamp-3">
                &quot;{item.text}&quot;
              </p>
              <p className="font-semibold mt-1.5">{item.name}</p>
            </div>
          ))}
      </div>
    );
  }

  if (type === "block-faq") {
    const items = (props.items as { question: string }[]) ?? [];
    return (
      <div className="p-3 space-y-1.5">
        {(items.length > 0
          ? items
          : [{ question: "Frequently asked question?" }]
        )
          .slice(0, 3)
          .map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border rounded-md px-3 py-2 text-xs"
            >
              <span>{item.question}</span>
              <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
            </div>
          ))}
      </div>
    );
  }

  if (type === "block-social-links") {
    const links = (props.links as { platform: string; label: string }[]) ?? [];
    return (
      <div className="flex flex-col gap-2 p-4 max-w-xs mx-auto">
        {(links.length > 0
          ? links
          : [{ platform: "instagram", label: "Instagram" }]
        )
          .slice(0, 3)
          .map((l, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium"
            >
              <Globe className="size-4" />
              {l.label}
            </div>
          ))}
      </div>
    );
  }

  // ── Interactive ───────────────────────────────────────────
  if (type === "block-button") {
    return (
      <div className="flex justify-center p-4">
        <button
          type="button"
          className={cn(
            "px-6 py-2.5 rounded-lg font-semibold text-sm",
            props.style === "outlined"
              ? "border-2 border-primary text-primary"
              : "bg-primary text-primary-foreground",
          )}
        >
          {(props.text as string) || "Click Here"}
        </button>
      </div>
    );
  }

  if (type === "block-button-group") {
    const buttons = (props.buttons as { text: string; style: string }[]) ?? [];
    return (
      <div className="flex flex-wrap gap-2 justify-center p-4">
        {(buttons.length > 0
          ? buttons
          : [
              { text: "Primary", style: "filled" },
              { text: "Secondary", style: "outlined" },
            ]
        ).map((btn, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              btn.style === "outlined"
                ? "border border-primary text-primary"
                : "bg-primary text-primary-foreground",
            )}
          >
            {btn.text}
          </button>
        ))}
      </div>
    );
  }

  if (type === "block-countdown") {
    return (
      <div className="text-center p-4">
        <p className="text-xs text-muted-foreground mb-2">
          {(props.label as string) || "Offer ends in:"}
        </p>
        <div className="flex justify-center gap-2">
          {[
            ["23", "Hrs"],
            ["45", "Min"],
            ["12", "Sec"],
          ].map(([val, unit]) => (
            <div
              key={unit}
              className="bg-muted rounded-lg p-2 min-w-13 text-center"
            >
              <p className="text-xl font-bold">{val}</p>
              <p className="text-[10px] text-muted-foreground">{unit}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "block-form") {
    return (
      <div className="p-4 max-w-sm mx-auto space-y-2">
        <p className="font-semibold text-sm">
          {(props.title as string) || "Subscribe"}
        </p>
        {((props.fields as { label: string }[]) ?? [{ label: "Email Address" }])
          .slice(0, 2)
          .map((f, i) => (
            <div
              key={i}
              className="h-8 rounded border bg-muted/40 flex items-center px-2 text-xs text-muted-foreground"
            >
              {f.label}
            </div>
          ))}
        <button
          type="button"
          className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md font-medium"
        >
          {(props.submitLabel as string) || "Submit"}
        </button>
      </div>
    );
  }

  if (type === "block-custom-html") {
    return (
      <div className="p-3 font-mono text-xs text-muted-foreground bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="size-2 rounded-full bg-red-400" />
          <div className="size-2 rounded-full bg-yellow-400" />
          <div className="size-2 rounded-full bg-green-400" />
          <span className="ml-1 text-[10px] opacity-50">Custom HTML</span>
        </div>
        <p className="line-clamp-3 text-[10px] leading-relaxed opacity-60">
          {(props.html as string) || "<!-- Your custom HTML here -->"}
        </p>
      </div>
    );
  }

  if (type === "block-google-maps") {
    return (
      <div className="bg-muted flex flex-col items-center justify-center gap-2 p-6">
        <MapPin className="size-8 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">
          {(props.address as string) || "Set address in settings"}
        </p>
      </div>
    );
  }

  if (type === "block-logos") {
    return (
      <div className="p-4 text-center">
        {props.title ? (
          <p className="text-xs text-muted-foreground mb-3">
            {props.title as string}
          </p>
        ) : null}
        <div className="flex items-center justify-center gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 w-16 rounded bg-muted-foreground/20" />
          ))}
        </div>
      </div>
    );
  }

  if (type === "block-auto-redirect") {
    return (
      <div className="p-6 text-center">
        <p className="text-sm">
          {(props.message as string)?.replace(
            "{seconds}",
            String(props.delaySeconds),
          ) || "Redirecting in 5 seconds..."}
        </p>
        <div className="mt-2 text-xs text-muted-foreground">
          → {(props.targetUrl as string) || "No URL set"}
        </div>
      </div>
    );
  }

  if (type === "block-stock-counter") {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {(props.label as string)?.replace("{count}", "24") ||
              "Only 24 left in stock!"}
          </span>
          <span className="font-bold text-orange-500">24</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full"
            style={{ width: "24%" }}
          />
        </div>
      </div>
    );
  }

  // ── Default fallback ──────────────────────────────────────
  return (
    <BlockPlaceholder label={type.replace("block-", "").replace(/-/g, " ")} />
  );
}

function BlockPlaceholder({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
      <div className="rounded-lg bg-muted px-3 py-1.5">
        <p className="text-xs font-medium capitalize">{label}</p>
      </div>
      {desc && (
        <p className="text-[11px] text-muted-foreground max-w-xs">{desc}</p>
      )}
    </div>
  );
}
