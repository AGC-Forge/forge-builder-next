"use client";

import { cn } from "@/lib/utils";
import type { LandingBlock } from "@/types/database";
import {
  BLOCK_LABEL_MAP,
  BLOCK_ICON_MAP,
} from "../dashboard/landing-pages/builder/block-definitions";

interface Props {
  block: LandingBlock;
  isSelected: boolean;
}

/**
 * Renders a realistic Tailwind-based preview of a block inside the canvas.
 * This is NOT the public LP renderer — it's a preview-only component.
 */
export function BlockPreview({ block, isSelected }: Props) {
  const props = (block.props ?? block.content ?? {}) as Record<string, any>;
  const style = block.style ?? {};

  // Build wrapper classes from style config
  const wrapperCn = cn(
    "w-full",
    style.paddingX ?? "px-4",
    style.paddingY ?? "py-8",
    style.bgColor,
    style.textAlign ?? "text-left",
    style.borderRadius,
    style.border,
    style.shadow,
    style.customClass,
  );

  const innerCn = cn("mx-auto w-full", style.maxWidth ?? "max-w-5xl");

  switch (block.type) {
    case "block-hero":
      return (
        <div
          className={cn(
            wrapperCn,
            "min-h-40",
            style.bgGradient ?? "bg-linear-to-r from-indigo-600 to-violet-600",
            "relative overflow-hidden",
          )}
        >
          {style.bgImageUrl && <div className="absolute inset-0 bg-black/40" />}
          <div className={cn(innerCn, "relative z-10 text-center")}>
            <h1 className="text-2xl font-bold text-white mb-2">
              {(props.headline as string) || "Your Headline Here"}
            </h1>
            <p className="text-white/80 text-sm mb-4">
              {(props.subheadline as string) ||
                "A compelling subheadline for your product."}
            </p>
            {props.ctaText && (
              <span className="inline-block rounded-lg bg-white px-5 py-2 text-sm font-semibold text-indigo-600">
                {props.ctaText as string}
              </span>
            )}
          </div>
        </div>
      );

    case "block-header":
      return (
        <div className={cn(wrapperCn, "border-b", style.bgColor ?? "bg-white")}>
          <div className={cn(innerCn, "flex items-center justify-between")}>
            <span className="font-bold text-base">
              {(props.logoText as string) || "Brand"}
            </span>
            <div className="flex items-center gap-4">
              {((props.links as { label: string }[]) ?? [])
                .slice(0, 3)
                .map((l, i) => (
                  <span key={i} className="text-sm text-muted-foreground">
                    {l.label}
                  </span>
                ))}
              {props.ctaText && (
                <span className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground">
                  {props.ctaText as string}
                </span>
              )}
            </div>
          </div>
        </div>
      );

    case "block-footer":
      return (
        <div
          className={cn(
            wrapperCn,
            style.bgColor ?? "bg-gray-900",
            "text-white",
          )}
        >
          <div className={cn(innerCn)}>
            <div className="grid grid-cols-3 gap-6 mb-4">
              {(
                (props.columns as { heading: string }[]) ?? [
                  { heading: "Company" },
                ]
              )
                .slice(0, 3)
                .map((col, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold text-white/70 mb-1">
                      {col.heading}
                    </p>
                    <div className="space-y-1">
                      <div className="h-2 w-16 rounded bg-white/20" />
                      <div className="h-2 w-12 rounded bg-white/20" />
                    </div>
                  </div>
                ))}
            </div>
            <p className="text-white/40 text-xs border-t border-white/10 pt-3">
              {(props.copyright as string) || "© 2025 Your Brand"}
            </p>
          </div>
        </div>
      );

    case "block-text":
      return (
        <div className={wrapperCn}>
          <div
            className={cn(innerCn, "prose prose-sm max-w-none")}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: canvas preview
            dangerouslySetInnerHTML={{
              __html:
                (props.html as string) ||
                "<p>Add your text content here. Click to edit.</p>",
            }}
          />
        </div>
      );

    case "block-image":
      return (
        <div className={wrapperCn}>
          <div className={innerCn}>
            {props.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.url as string}
                alt={(props.alt as string) ?? ""}
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: "300px" }}
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                <div className="text-center">
                  <div className="text-3xl mb-1">🖼️</div>
                  <p className="text-xs text-muted-foreground">
                    Image block — click to set image
                  </p>
                </div>
              </div>
            )}
            {props.caption && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {props.caption as string}
              </p>
            )}
          </div>
        </div>
      );

    case "block-video":
      return (
        <div className={wrapperCn}>
          <div className={innerCn}>
            {props.videoId ? (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
                <iframe
                  src={
                    props.platform === "tiktok"
                      ? `https://www.tiktok.com/embed/v2/${props.videoId}`
                      : `https://www.youtube.com/embed/${props.videoId}?rel=0`
                  }
                  className="h-full w-full border-0"
                  allowFullScreen
                  title="Video preview"
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                <div className="text-center">
                  <div className="text-3xl mb-1">▶️</div>
                  <p className="text-xs text-muted-foreground">
                    Video block — set YouTube or TikTok URL
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case "block-button":
      return (
        <div
          className={cn(
            wrapperCn,
            "flex",
            style.textAlign === "text-center"
              ? "justify-center"
              : style.textAlign === "text-right"
                ? "justify-end"
                : "justify-start",
          )}
        >
          <div className={innerCn}>
            <span
              className={cn(
                "inline-block rounded-lg px-6 py-2.5 text-sm font-semibold",
                props.style === "outline"
                  ? "border-2 border-primary text-primary"
                  : props.style === "ghost"
                    ? "text-primary hover:bg-primary/10"
                    : "bg-primary text-primary-foreground",
                props.fullWidth && "w-full text-center",
              )}
            >
              {(props.text as string) || "Click Here"}
            </span>
          </div>
        </div>
      );

    case "block-countdown":
      return (
        <div className={wrapperCn}>
          <div className={cn(innerCn, "text-center")}>
            <p className="text-sm font-medium mb-3 text-muted-foreground">
              {(props.label as string) || "Offer ends in:"}
            </p>
            <div className="flex justify-center gap-3">
              {(props.showDays
                ? ["00", "12", "45", "30"]
                : ["12", "45", "30"]
              ).map((v, i, arr) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="flex size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xl font-bold">
                    {v}
                  </div>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {i === 0 && props.showDays
                      ? "Days"
                      : i === (props.showDays ? 1 : 0)
                        ? "Hrs"
                        : i === (props.showDays ? 2 : 1)
                          ? "Min"
                          : "Sec"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "block-testimonial":
      return (
        <div className={wrapperCn}>
          <div className={cn(innerCn, "grid grid-cols-2 gap-4")}>
            {(
              (props.items as {
                name: string;
                text: string;
                rating: number;
              }[]) ?? [
                { name: "Customer A", text: "Great product!", rating: 5 },
                { name: "Customer B", text: "Highly recommended.", rating: 5 },
              ]
            )
              .slice(0, 2)
              .map((item, i) => (
                <div key={i} className="rounded-lg border bg-background p-4">
                  <p className="text-xs mb-2 text-muted-foreground">
                    {"⭐".repeat(item.rating ?? 5)}
                  </p>
                  <p className="text-sm italic mb-2">&quot;{item.text}&quot;</p>
                  <p className="text-xs font-semibold">— {item.name}</p>
                </div>
              ))}
          </div>
        </div>
      );

    case "block-faq":
      return (
        <div className={wrapperCn}>
          <div className={cn(innerCn, "space-y-2")}>
            {(
              (props.items as { question: string; answer: string }[]) ?? [
                { question: "How does it work?", answer: "It works great!" },
              ]
            )
              .slice(0, 2)
              .map((item, i) => (
                <div key={i} className="rounded-lg border px-4 py-3">
                  <p className="text-sm font-medium">{item.question}</p>
                  {isSelected && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      );

    case "block-divider":
      return (
        <div className={cn(wrapperCn, "py-4")}>
          <div className={innerCn}>
            <hr
              className={cn(
                "border-t",
                props.style === "dashed"
                  ? "border-dashed"
                  : props.style === "dotted"
                    ? "border-dotted"
                    : "",
              )}
            />
          </div>
        </div>
      );

    case "block-product-card":
    case "block-product-list":
      return (
        <div className={wrapperCn}>
          <div className={cn(innerCn)}>
            <div className="flex gap-3">
              <div className="size-16 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                🛍️
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-muted rounded mb-1.5 w-3/4" />
                <div className="h-3 bg-muted/60 rounded mb-1 w-1/2" />
                <div className="h-5 bg-primary/20 rounded w-20 mt-2" />
              </div>
            </div>
          </div>
        </div>
      );

    case "block-custom-html":
      return (
        <div className={cn(wrapperCn, "bg-muted/40")}>
          <div
            className={cn(
              innerCn,
              "rounded-lg border border-dashed p-4 text-center",
            )}
          >
            <p className="text-xs font-mono text-muted-foreground mb-1">
              {"<custom-html />"}
            </p>
            <p className="text-xs text-muted-foreground">
              {(props.html as string)
                ? `${String(props.html).slice(0, 60)}...`
                : "Custom HTML block — open settings to edit code"}
            </p>
          </div>
        </div>
      );

    default: {
      // Generic placeholder for all other block types
      const Icon = BLOCK_ICON_MAP[block.type];
      const label =
        BLOCK_LABEL_MAP[block.type] ?? block.type.replace("block-", "");
      return (
        <div className={cn(wrapperCn, "bg-muted/20")}>
          <div
            className={cn(
              innerCn,
              "flex items-center gap-3 rounded-lg border border-dashed p-4",
            )}
          >
            {Icon && <Icon className="size-6 shrink-0 text-muted-foreground" />}
            <div className="min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                {isSelected
                  ? "Configure in the right panel →"
                  : "Click to configure"}
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
}
