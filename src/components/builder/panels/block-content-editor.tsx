"use client";

import { useState, useTransition } from "react";
import type { BlockV2 } from "@/types/builder";
import type { Product } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PROMPT_TEMPLATES_BUILDER } from "../promtp-templates";
import { Plus, Trash2, Wand2, Loader2, RefreshCw } from "lucide-react";

interface Props {
  block: BlockV2;
  availableProducts: Product[];
  onUpdateProps: (props: Record<string, unknown>) => void;
}

function FieldText({
  props,
  k,
  label,
  placeholder,
  multiline = false,
  set,
}: {
  props: Record<string, unknown>;
  k: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  set: (key: string, val: unknown) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {multiline ? (
        <Textarea
          value={(props[k] as string) ?? ""}
          onChange={(e) => set(k, e.target.value)}
          placeholder={placeholder}
          className="text-xs min-h-18"
          rows={3}
        />
      ) : (
        <Input
          value={(props[k] as string) ?? ""}
          onChange={(e) => set(k, e.target.value)}
          placeholder={placeholder}
          className="h-8 text-xs"
        />
      )}
    </div>
  );
}

function FieldToggle({
  props,
  k,
  label,
  set,
}: {
  props: Record<string, unknown>;
  k: string;
  label: string;
  set: (key: string, val: unknown) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={(props[k] as boolean) ?? false}
        onCheckedChange={(v) => set(k, v)}
        id={`toggle-${k}`}
      />
      <Label htmlFor={`toggle-${k}`} className="text-xs cursor-pointer">
        {label}
      </Label>
    </div>
  );
}

function FieldSelect({
  props,
  k,
  label,
  options,
  set,
}: {
  props: Record<string, unknown>;
  k: string;
  label: string;
  options: { value: string; label: string }[];
  set: (key: string, val: unknown) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select
        value={(props[k] as string) ?? options[0]?.value}
        onValueChange={(v) => set(k, v)}
      >
        <SelectTrigger className="h-8 text-xs w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="w-full">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ProductPicker({
  props,
  k,
  label,
  multi = false,
  availableProducts,
  set,
}: {
  props: Record<string, unknown>;
  k: string;
  label: string;
  multi?: boolean;
  availableProducts: Product[];
  set: (key: string, val: unknown) => void;
}) {
  if (multi) {
    const selected = (props[k] as string[]) ?? [];
    const toggle = (id: string) =>
      set(
        k,
        selected.includes(id)
          ? selected.filter((x) => x !== id)
          : [...selected, id],
      );
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{label}</Label>
        <div className="max-h-48 overflow-y-auto space-y-1 rounded-md border p-2">
          {availableProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center">
              No products found
            </p>
          ) : (
            availableProducts.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 cursor-pointer py-1 hover:bg-muted/50 rounded px-1"
              >
                <Checkbox
                  checked={selected.includes(p.id)}
                  onCheckedChange={() => toggle(p.id)}
                />
                <span className="text-xs truncate">{p.title}</span>
              </label>
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {selected.length} product(s) selected
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select
        value={(props[k] as string) ?? ""}
        onValueChange={(v) => set(k, v === "none" ? null : v)}
      >
        <SelectTrigger className="h-8 text-xs w-full">
          <SelectValue placeholder="Select product..." />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectItem value="none" className="text-xs text-muted-foreground">
            No product
          </SelectItem>
          {availableProducts.map((p) => (
            <SelectItem key={p.id} value={p.id} className="text-xs">
              {p.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function BlockContentEditor({
  block,
  availableProducts,
  onUpdateProps,
}: Props) {
  const { type, props } = block;
  const set = (key: string, val: unknown) => onUpdateProps({ [key]: val });

  // ════════════════════════════════════════════
  // LAYOUT BLOCKS
  // ════════════════════════════════════════════
  if (type === "block-hero")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          k="headline"
          label="Headline"
          placeholder="Your headline here"
          set={set}
        />
        <FieldText
          props={props}
          k="subheadline"
          label="Subheadline"
          placeholder="Supporting text..."
          multiline
          set={set}
        />
        <FieldText
          props={props}
          k="ctaText"
          label="Primary CTA Text"
          placeholder="Get Started"
          set={set}
        />
        <FieldText
          props={props}
          k="ctaUrl"
          label="Primary CTA URL"
          placeholder="https://..."
          set={set}
        />
        <FieldText
          props={props}
          k="ctaSecondaryText"
          label="Secondary CTA Text (optional)"
          set={set}
        />
        <FieldText
          props={props}
          k="ctaSecondaryUrl"
          label="Secondary CTA URL"
          set={set}
        />
        <FieldText
          props={props}
          k="backgroundImageUrl"
          label="Background Image URL"
          set={set}
        />
        <FieldSelect
          props={props}
          k="textAlign"
          label="Text Alignment"
          options={[
            { value: "center", label: "Center" },
            { value: "left", label: "Left" },
            { value: "right", label: "Right" },
          ]}
          set={set}
        />
        <FieldText
          props={props}
          k="minHeight"
          label="Min Height"
          placeholder="500px"
          set={set}
        />
      </div>
    );

  if (type === "block-header")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          k="logoText"
          label="Logo Text"
          placeholder="Brand"
          set={set}
        />
        <FieldText
          props={props}
          k="logoImageUrl"
          label="Logo Image URL (optional)"
          set={set}
        />
        <FieldText
          props={props}
          k="ctaText"
          label="CTA Button Text"
          set={set}
        />
        <FieldText props={props} k="ctaUrl" label="CTA Button URL" set={set} />
        <FieldToggle props={props} k="sticky" label="Sticky header" set={set} />
        <FieldToggle
          props={props}
          k="transparent"
          label="Transparent background"
          set={set}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Navigation Links</Label>
          <NavLinksEditor
            links={(props.navLinks as { label: string; href: string }[]) ?? []}
            onChange={(v) => set("navLinks", v)}
          />
        </div>
      </div>
    );

  if (type === "block-footer")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          k="logoText"
          label="Logo / Brand Name"
          set={set}
        />
        <FieldText
          props={props}
          k="copyright"
          label="Copyright Text"
          set={set}
        />
        <FieldToggle
          props={props}
          k="showPoweredBy"
          label="Show 'Powered by SnapLand'"
          set={set}
        />
      </div>
    );

  if (type === "block-columns")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          k="columns"
          label="Number of Columns"
          options={[1, 2, 3, 4, 5, 6].map((n) => ({
            value: String(n),
            label: `${n} column${n > 1 ? "s" : ""}`,
          }))}
          set={set}
        />
        <FieldSelect
          props={props}
          k="gap"
          label="Gap"
          options={[
            { value: "none", label: "None" },
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
          set={set}
        />
        <FieldSelect
          props={props}
          k="verticalAlign"
          label="Vertical Alignment"
          options={[
            { value: "top", label: "Top" },
            { value: "middle", label: "Middle" },
            { value: "bottom", label: "Bottom" },
          ]}
          set={set}
        />
        <FieldToggle
          props={props}
          k="responsive"
          label="Stack on mobile"
          set={set}
        />
      </div>
    );

  if (type === "block-anchor")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          k="anchorId"
          label="Anchor ID"
          placeholder="section-features"
          set={set}
        />
        <p className="text-xs text-muted-foreground">
          Link to this section with{" "}
          <code className="bg-muted px-1 rounded">#section-features</code>
        </p>
      </div>
    );

  if (type === "block-divider")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          k="style"
          label="Style"
          options={[
            { value: "line", label: "Line" },
            { value: "dashed", label: "Dashed" },
            { value: "dots", label: "Dots" },
            { value: "wave", label: "Wave" },
          ]}
          set={set}
        />
        <FieldText
          props={props}
          k="text"
          label="Center text (optional)"
          placeholder="OR"
          set={set}
        />
      </div>
    );

  // ════════════════════════════════════════════
  // CONTENT BLOCKS
  // ════════════════════════════════════════════

  if (type === "block-text")
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">HTML Content</Label>
          <Textarea
            value={(props.html as string) ?? ""}
            onChange={(e) => set("html", e.target.value)}
            className="text-xs min-h-30 font-mono"
            rows={6}
            placeholder="<p>Your content...</p>"
          />
          <p className="text-[10px] text-muted-foreground">
            Supports HTML tags: p, strong, em, ul, ol, li, a, h2-h6
          </p>
        </div>
        <FieldSelect
          props={props}
          k="fontSize"
          label="Base Font Size"
          options={[
            { value: "sm", label: "Small" },
            { value: "base", label: "Normal" },
            { value: "lg", label: "Large" },
            { value: "xl", label: "XL" },
          ]}
          set={set}
        />
      </div>
    );

  if (type === "block-image")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          k="src"
          label="Image URL"
          placeholder="https://..."
          set={set}
        />
        <FieldText
          props={props}
          k="alt"
          label="Alt Text"
          placeholder="Description of image"
          set={set}
        />
        <FieldText
          props={props}
          k="caption"
          label="Caption (optional)"
          set={set}
        />
        <FieldText
          props={props}
          k="linkUrl"
          label="Link URL (optional)"
          placeholder="https://..."
          set={set}
        />
        <FieldSelect
          props={props}
          k="aspectRatio"
          label="Aspect Ratio"
          options={[
            { value: "16/9", label: "16:9" },
            { value: "4/3", label: "4:3" },
            { value: "1/1", label: "Square" },
            { value: "3/4", label: "3:4 Portrait" },
            { value: "auto", label: "Auto" },
          ]}
          set={set}
        />
        <FieldSelect
          props={props}
          k="objectFit"
          label="Image Fit"
          options={[
            { value: "cover", label: "Cover" },
            { value: "contain", label: "Contain" },
            { value: "fill", label: "Fill" },
          ]}
          set={set}
        />
      </div>
    );

  if (type === "block-video")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          k="platform"
          label="Platform"
          options={[
            { value: "youtube", label: "YouTube" },
            { value: "tiktok", label: "TikTok" },
          ]}
          set={set}
        />
        <FieldText
          props={props}
          k="url"
          label="Video URL"
          placeholder={
            props.platform === "tiktok"
              ? "https://tiktok.com/@user/video/..."
              : "https://youtube.com/watch?v=..."
          }
          set={set}
        />
        <FieldText
          props={props}
          k="caption"
          label="Caption (optional)"
          set={set}
        />
        <FieldToggle
          props={props}
          k="autoplay"
          label="Autoplay (muted)"
          set={set}
        />
        <FieldToggle props={props} k="loop" label="Loop" set={set} />
        <FieldToggle
          props={props}
          k="showControls"
          label="Show controls"
          set={set}
        />
        <FieldSelect
          props={props}
          k="aspectRatio"
          label="Aspect Ratio"
          options={[
            { value: "16/9", label: "16:9 (Landscape)" },
            { value: "9/16", label: "9:16 (Portrait / TikTok)" },
            { value: "4/3", label: "4:3" },
            { value: "1/1", label: "Square" },
          ]}
          set={set}
        />
      </div>
    );

  if (type === "block-features")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          k="style"
          label="Style"
          options={[
            { value: "grid", label: "Icon Grid" },
            { value: "list", label: "Numbered Steps" },
            { value: "cards", label: "Cards" },
          ]}
          set={set}
        />
        <FieldSelect
          props={props}
          k="columns"
          label="Columns"
          options={[1, 2, 3, 4].map((n) => ({
            value: String(n),
            label: `${n} col`,
          }))}
          set={set}
        />
        <FieldToggle
          props={props}
          k="numbered"
          label="Show numbers"
          set={set}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Items</Label>
          <FeatureItemsEditor
            items={
              (props.items as {
                icon: string;
                title: string;
                description: string;
              }[]) ?? []
            }
            onChange={(v) => set("items", v)}
          />
        </div>
      </div>
    );

  // ════════════════════════════════════════════
  // COMMERCE BLOCKS
  // ════════════════════════════════════════════

  if (type === "block-product-card")
    return (
      <div className="space-y-3">
        <ProductPicker
          props={props}
          availableProducts={availableProducts}
          k="productId"
          label="Product"
          set={set}
        />
        <FieldText
          props={props}
          k="ctaText"
          label="Button Text"
          placeholder="Buy Now"
          set={set}
        />
        <FieldSelect
          props={props}
          k="layout"
          label="Card Layout"
          options={[
            { value: "vertical", label: "Vertical" },
            { value: "horizontal", label: "Horizontal" },
          ]}
          set={set}
        />
        <FieldToggle
          props={props}
          k="showRating"
          label="Show rating"
          set={set}
        />
        <FieldToggle
          props={props}
          k="showBadges"
          label="Show badges"
          set={set}
        />
        <FieldToggle
          props={props}
          k="showDescription"
          label="Show description"
          set={set}
        />
        <FieldToggle
          props={props}
          k="showSoldCount"
          label="Show sold count"
          set={set}
        />
      </div>
    );

  if (type === "block-product-list")
    return (
      <div className="space-y-3">
        <ProductPicker
          props={props}
          k="productIds"
          availableProducts={availableProducts}
          label="Products"
          multi
          set={set}
        />
        <FieldSelect
          props={props}
          k="layout"
          label="Layout"
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ]}
          set={set}
        />
        <FieldSelect
          props={props}
          k="columns"
          label="Grid Columns"
          options={[1, 2, 3, 4].map((n) => ({
            value: String(n),
            label: `${n} col`,
          }))}
          set={set}
        />
        <FieldText
          props={props}
          k="ctaText"
          label="Button Text"
          placeholder="Shop Now"
          set={set}
        />
        <FieldToggle
          props={props}
          k="showRating"
          label="Show rating"
          set={set}
        />
        <FieldToggle
          props={props}
          k="showBadges"
          label="Show badges"
          set={set}
        />
        <FieldToggle
          k="showDescription"
          label="Show description"
          props={props}
          set={set}
        />
      </div>
    );

  if (type === "block-countdown")
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Target Date & Time</Label>
          <Input
            type="datetime-local"
            value={(props.targetDate as string) ?? ""}
            onChange={(e) => set("targetDate", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <FieldText
          props={props}
          k="label"
          label="Label"
          placeholder="Offer ends in:"
          set={set}
        />
        <FieldSelect
          props={props}
          k="style"
          label="Display Style"
          options={[
            { value: "minimal", label: "Minimal" },
            { value: "flip", label: "Flip Clock" },
            { value: "digital", label: "Digital" },
            { value: "boxes", label: "Boxes" },
          ]}
          set={set}
        />
        <FieldText
          props={props}
          k="expiredText"
          label="Expired Message"
          placeholder="Offer has ended"
          set={set}
        />
        <FieldToggle props={props} k="showDays" label="Show days" set={set} />
      </div>
    );

  if (type === "block-button")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          set={set}
          k="text"
          label="Button Text"
          placeholder="Click Here"
        />
        <FieldText
          props={props}
          set={set}
          k="url"
          label="Link URL"
          placeholder="https://..."
        />
        <FieldSelect
          props={props}
          set={set}
          k="target"
          label="Open in"
          options={[
            { value: "_blank", label: "New tab" },
            { value: "_self", label: "Same tab" },
          ]}
        />
        <FieldSelect
          props={props}
          set={set}
          k="style"
          label="Button Style"
          options={[
            { value: "filled", label: "Filled" },
            { value: "outlined", label: "Outlined" },
            { value: "ghost", label: "Ghost" },
            { value: "link", label: "Link" },
          ]}
        />
        <FieldSelect
          props={props}
          set={set}
          k="size"
          label="Size"
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
            { value: "xl", label: "XL" },
          ]}
        />
        <FieldToggle props={props} set={set} k="fullWidth" label="Full width" />
      </div>
    );

  if (type === "block-testimonial")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="style"
          label="Layout"
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
            { value: "carousel", label: "Carousel" },
          ]}
        />
        <FieldSelect
          props={props}
          set={set}
          k="columns"
          label="Columns"
          options={[1, 2, 3].map((n) => ({
            value: String(n),
            label: `${n} col`,
          }))}
        />
        <FieldToggle
          props={props}
          set={set}
          k="showRating"
          label="Show star rating"
        />
        <FieldToggle
          props={props}
          set={set}
          k="showAvatar"
          label="Show avatar"
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Reviews</Label>
          <TestimonialItemsEditor
            items={
              (props.items as {
                name: string;
                role: string;
                text: string;
                rating: number;
              }[]) ?? []
            }
            onChange={(v) => set("items", v)}
          />
        </div>
      </div>
    );

  if (type === "block-faq")
    return (
      <div className="space-y-3">
        <FieldToggle
          props={props}
          set={set}
          k="showSearch"
          label="Show search field"
        />
        <FieldToggle
          props={props}
          set={set}
          k="openFirst"
          label="Open first item by default"
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Questions</Label>
          <FAQItemsEditor
            items={
              (props.items as { question: string; answer: string }[]) ?? []
            }
            onChange={(v) => set("items", v)}
          />
        </div>
      </div>
    );

  if (type === "block-custom-html")
    return <CustomHtmlEditor props={props} set={set} />;

  if (type === "block-social-links")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="layout"
          label="Layout"
          options={[
            { value: "list", label: "Vertical List" },
            { value: "grid", label: "Grid" },
            { value: "horizontal", label: "Horizontal" },
          ]}
        />
        <FieldSelect
          props={props}
          set={set}
          k="buttonStyle"
          label="Button Style"
          options={[
            { value: "filled", label: "Filled" },
            { value: "outlined", label: "Outlined" },
            { value: "ghost", label: "Ghost" },
          ]}
        />
        <FieldToggle props={props} set={set} k="showIcon" label="Show icon" />
        <FieldToggle props={props} set={set} k="showLabel" label="Show label" />
        <div className="space-y-1.5">
          <Label className="text-xs">Social Links</Label>
          <SocialLinksEditor
            links={
              (props.links as {
                platform: string;
                label: string;
                url: string;
              }[]) ?? []
            }
            onChange={(v) => set("links", v)}
          />
        </div>
      </div>
    );

  if (type === "block-google-maps")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          set={set}
          k="address"
          label="Address or Place Name"
          placeholder="Jl. Sudirman No. 1, Jakarta"
        />
        <FieldText
          props={props}
          set={set}
          k="height"
          label="Map Height"
          placeholder="400px"
        />
        <div className="space-y-1.5">
          <Label className="text-xs">
            Zoom Level: {(props.zoom as number) ?? 15}
          </Label>
          <input
            type="range"
            min={5}
            max={20}
            value={(props.zoom as number) ?? 15}
            onChange={(e) => set("zoom", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <FieldToggle
          props={props}
          set={set}
          k="showMarker"
          label="Show location marker"
        />
        <FieldText
          props={props}
          set={set}
          k="markerLabel"
          label="Marker Label"
          placeholder="Our Location"
        />
      </div>
    );

  if (type === "block-auto-redirect")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          set={set}
          k="targetUrl"
          label="Redirect URL"
          placeholder="https://..."
        />
        <div className="space-y-1.5">
          <Label className="text-xs">
            Delay: {(props.delaySeconds as number) ?? 5} seconds
          </Label>
          <input
            type="range"
            min={1}
            max={30}
            value={(props.delaySeconds as number) ?? 5}
            onChange={(e) => set("delaySeconds", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <FieldText
          props={props}
          set={set}
          k="message"
          label="Message"
          placeholder="Redirecting in {seconds} seconds..."
        />
        <FieldToggle
          props={props}
          set={set}
          k="showCountdown"
          label="Show countdown"
        />
      </div>
    );

  if (type === "block-form")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          set={set}
          k="title"
          label="Form Title"
          placeholder="Subscribe"
        />
        <FieldText
          props={props}
          set={set}
          k="submitLabel"
          label="Submit Button Text"
          placeholder="Submit"
        />
        <FieldText
          props={props}
          set={set}
          k="successMessage"
          label="Success Message"
          placeholder="Thank you!"
          multiline
        />
      </div>
    );

  // ── Default fallback ─────────────────────────────────────
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
      <p className="font-medium mb-1">Block settings</p>
      <p>
        Content editor for <strong>{type}</strong> is coming in Sprint B.
      </p>
    </div>
  );
}

// ── Mini sub-editors ──────────────────────────────────────────

function NavLinksEditor({
  links,
  onChange,
}: {
  links: { label: string; href: string }[];
  onChange: (v: { label: string; href: string }[]) => void;
}) {
  const addLink = () => onChange([...links, { label: "New Link", href: "#" }]);
  const removeLink = (i: number) =>
    onChange(links.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange(links.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  return (
    <div className="space-y-1.5">
      {links.map((l, i) => (
        <div key={i} className="flex gap-1.5">
          <Input
            value={l.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder="Label"
            className="h-7 text-xs flex-1"
          />
          <Input
            value={l.href}
            onChange={(e) => update(i, "href", e.target.value)}
            placeholder="#href"
            className="h-7 text-xs flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => removeLink(i)}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={addLink}
      >
        <Plus className="size-3" /> Add Link
      </Button>
    </div>
  );
}

function FeatureItemsEditor({
  items,
  onChange,
}: {
  items: { icon: string; title: string; description: string }[];
  onChange: (v: { icon: string; title: string; description: string }[]) => void;
}) {
  const add = () =>
    onChange([
      ...items,
      { icon: "Star", title: "Feature", description: "Description" },
    ]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange(
      items.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)),
    );
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded border p-2 space-y-1.5 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Item {i + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => remove(i)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
          <Input
            value={item.title}
            onChange={(e) => update(i, "title", e.target.value)}
            placeholder="Title"
            className="h-7 text-xs"
          />
          <Textarea
            value={item.description}
            onChange={(e) => update(i, "description", e.target.value)}
            placeholder="Description"
            className="text-xs"
            rows={2}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={add}
      >
        <Plus className="size-3" /> Add Item
      </Button>
    </div>
  );
}

function TestimonialItemsEditor({
  items,
  onChange,
}: {
  items: { name: string; role: string; text: string; rating: number }[];
  onChange: (
    v: { name: string; role: string; text: string; rating: number }[],
  ) => void;
}) {
  const add = () =>
    onChange([
      ...items,
      {
        name: "Customer Name",
        role: "Customer",
        text: "Great product!",
        rating: 5,
      },
    ]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string | number) =>
    onChange(
      items.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)),
    );
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded border p-2 space-y-1.5 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Review {i + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => remove(i)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
          <Input
            value={item.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Name"
            className="h-7 text-xs"
          />
          <Input
            value={item.role}
            onChange={(e) => update(i, "role", e.target.value)}
            placeholder="Role / Location"
            className="h-7 text-xs"
          />
          <Textarea
            value={item.text}
            onChange={(e) => update(i, "text", e.target.value)}
            placeholder="Review text..."
            className="text-xs"
            rows={2}
          />
          <Select
            value={String(item.rating)}
            onValueChange={(v) => update(i, "rating", Number(v))}
          >
            <SelectTrigger className="h-7 text-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {[5, 4, 3, 2, 1].map((r) => (
                <SelectItem key={r} value={String(r)} className="text-xs">
                  {"⭐".repeat(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={add}
      >
        <Plus className="size-3" /> Add Review
      </Button>
    </div>
  );
}

function FAQItemsEditor({
  items,
  onChange,
}: {
  items: { question: string; answer: string }[];
  onChange: (v: { question: string; answer: string }[]) => void;
}) {
  const add = () =>
    onChange([...items, { question: "Question?", answer: "Answer..." }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange(
      items.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)),
    );
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded border p-2 space-y-1.5 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Q&A {i + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => remove(i)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
          <Input
            value={item.question}
            onChange={(e) => update(i, "question", e.target.value)}
            placeholder="Question?"
            className="h-7 text-xs"
          />
          <Textarea
            value={item.answer}
            onChange={(e) => update(i, "answer", e.target.value)}
            placeholder="Answer..."
            className="text-xs"
            rows={2}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={add}
      >
        <Plus className="size-3" /> Add Q&A
      </Button>
    </div>
  );
}

const SOCIAL_PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "twitter",
  "whatsapp",
  "telegram",
  "shopee",
  "tokopedia",
  "lazada",
  "tiktokshop",
  "website",
  "email",
  "other",
];

function SocialLinksEditor({
  links,
  onChange,
}: {
  links: { platform: string; label: string; url: string }[];
  onChange: (v: { platform: string; label: string; url: string }[]) => void;
}) {
  const add = () =>
    onChange([
      ...links,
      { platform: "instagram", label: "Instagram", url: "" },
    ]);
  const remove = (i: number) => onChange(links.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) => {
    const updated = links.map((l, idx) => {
      if (idx !== i) return l;
      const newL = { ...l, [k]: v };
      if (k === "platform") newL.label = v.charAt(0).toUpperCase() + v.slice(1);
      return newL;
    });
    onChange(updated);
  };
  return (
    <div className="space-y-2">
      {links.map((l, i) => (
        <div key={i} className="rounded border p-2 space-y-1.5 bg-muted/30">
          <div className="flex gap-1.5 items-center">
            <Select
              value={l.platform}
              onValueChange={(v) => update(i, "platform", v)}
            >
              <SelectTrigger className="h-7 text-xs flex-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                {SOCIAL_PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p} className="text-xs capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => remove(i)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
          <Input
            value={l.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder="Label"
            className="h-7 text-xs"
          />
          <Input
            value={l.url}
            onChange={(e) => update(i, "url", e.target.value)}
            placeholder="https://..."
            className="h-7 text-xs"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={add}
      >
        <Plus className="size-3" /> Add Link
      </Button>
    </div>
  );
}

function CustomHtmlEditor({
  props,
  set,
}: {
  props: Record<string, unknown>;
  set: (key: string, val: unknown) => void;
}) {
  const [activeTab, setActiveTab] = useState<"code" | "ai">("code");
  const [prompt, setPrompt] = useState((props.aiPrompt as string) ?? "");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isGenerating, startGenerate] = useTransition();

  function handleGenerate() {
    if (!prompt.trim()) {
      toast.error("Please describe what you want to build.");
      return;
    }

    startGenerate(async () => {
      try {
        const res = await fetch("/api/ai/html-builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            currentHtml: (props.html as string) ?? "",
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          toast.error(
            data.error ?? "AI generation failed. Check your API key.",
          );
          return;
        }

        set("html", data.html);
        set("aiPrompt", prompt);
        toast.success("HTML generated! Review the code tab.");
        setActiveTab("code");
      } catch {
        toast.error("Network error. Please try again.");
      }
    });
  }

  const currentHtml = (props.html as string) ?? "";
  const hasHtml = currentHtml.trim().length > 0;

  function handleTemplateChange(v: string) {
    setSelectedTemplate(v);
    setPrompt(v);
  }

  return (
    <div className="space-y-2">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "code" | "ai")}
      >
        <TabsList className="w-full h-8 grid grid-cols-2">
          <TabsTrigger value="code" className="text-xs">
            Code Editor
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs gap-1">
            <Wand2 className="size-3" />
            AI Builder
          </TabsTrigger>
        </TabsList>

        {/* ── Code tab ─────────────────────────────────────── */}
        <TabsContent value="code" className="mt-2 space-y-1.5">
          <Label className="text-xs">HTML Code</Label>
          <Textarea
            value={currentHtml}
            onChange={(e) => set("html", e.target.value)}
            className="text-xs font-mono min-h-45 resize-y"
            rows={10}
            placeholder={
              '<!-- Your custom HTML here -->\n<div class="text-center py-8">\n  <h2 class="text-2xl font-bold">Hello!</h2>\n</div>'
            }
            spellCheck={false}
          />
          <p className="text-[10px] text-muted-foreground">
            Tailwind CSS classes available. Use standard HTML.
          </p>
        </TabsContent>

        {/* ── AI tab ───────────────────────────────────────── */}
        <TabsContent value="ai" className="mt-2 space-y-3">
          {/* Info box */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Wand2 className="size-3" />
              AI HTML Builder
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Describe the component and AI will generate HTML with Tailwind
              CSS. Requires OpenRouter API key in Settings.
            </p>
          </div>

          {/* Prompt templates */}
          <div className="space-y-1.5">
            <Label className="text-xs">Prompt (Optional)</Label>
            <Select
              value={selectedTemplate}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger className="h-8 text-sm flex-1 w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectGroup>
                  <SelectLabel>Builder Templates</SelectLabel>
                  {PROMPT_TEMPLATES_BUILDER.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Prompt input */}
          <div className="space-y-1.5">
            <Label className="text-xs">Describe what you want</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="text-xs min-h-20"
              rows={3}
              placeholder="e.g. A pricing card with a title, price, list of features, and a CTA button. Use a gradient border and dark background."
            />
          </div>

          {/* Generate button */}
          <Button
            type="button"
            size="sm"
            className="w-full gap-1.5"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Generating...
              </>
            ) : hasHtml ? (
              <>
                <RefreshCw className="size-3.5" />
                Regenerate HTML
              </>
            ) : (
              <>
                <Wand2 className="size-3.5" />
                Generate HTML
              </>
            )}
          </Button>

          {/* Preview of current HTML */}
          {hasHtml && (
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">
                Current HTML ({currentHtml.length} chars)
              </Label>
              <div className="max-h-20 overflow-y-auto rounded-md bg-muted/50 p-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                {currentHtml.slice(0, 300)}
                {currentHtml.length > 300 && "..."}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 w-full text-[10px]"
                onClick={() => setActiveTab("code")}
              >
                View & Edit Full Code
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
