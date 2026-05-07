"use client";

import { useState, useTransition, useRef } from "react";
import type { BlockV2, Application } from "@/types/builder";
import type { Product } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
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
import { ButtonGroup } from "@/components/ui/button-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PROMPT_TEMPLATES_BUILDER } from "../promtp-templates";
import { Plus, Trash2, Wand2, Loader2, RefreshCw, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  block: BlockV2;
  availableProducts: Product[];
  availableApps: Application[];
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

function FieldUpload({
  props,
  k,
  label,
  placeholder,
  set,
}: {
  props: Record<string, unknown>;
  k: string;
  label: string;
  placeholder?: string;
  set: (key: string, val: unknown) => void;
}) {
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            mimeType: file.type,
            folder: "snapland/landing-pages",
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          toast.error(json.error ?? "Upload failed");
          return;
        }
        const newUrl: string = json.data.url;
        set(k, newUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsImageUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const deleteImage = async () => {
    const imageUrl = props[k] as string;
    if (!imageUrl) {
      toast.error("Image not found.");
      return;
    }
    if (!extractPublicIdFromUrl(imageUrl)) {
      return;
    }
    const response = await fetch(
      `/api/upload?url=${encodeURIComponent(imageUrl)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Failed to delete image");
    }

    set(k, "");
    toast.success(data.message ?? "Image deleted successfully");
  };

  return (
    <Field className="space-y-1.5">
      <FieldLabel className="text-xs">{label}</FieldLabel>
      <ButtonGroup>
        <Input
          type="file"
          onChange={handleImageFile}
          className="h-8 text-xs"
          disabled={isImageUploading}
        />
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8 flex items-center justify-center"
          onClick={deleteImage}
        >
          <Trash2 />
        </Button>
      </ButtonGroup>
      <FieldDescription className="text-xs text-muted-foreground">
        {placeholder}
      </FieldDescription>
    </Field>
  );
}

function extractPublicIdFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);

    if (!url.hostname.includes("cloudinary.com")) {
      console.warn("Bukan URL Cloudinary:", imageUrl);
      return null;
    }

    const pathParts = url.pathname.split("/");

    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1) return null;

    let relevantParts = pathParts.slice(uploadIndex + 1);

    if (relevantParts[0]?.match(/^v\d+$/)) {
      relevantParts = relevantParts.slice(1);
    }

    const fullPath = relevantParts.join("/");
    const publicId =
      fullPath.substring(0, fullPath.lastIndexOf(".")) || fullPath;

    return publicId || null;
  } catch (error) {
    console.error("Gagal extract public_id:", error);
    return null;
  }
}

export function BlockContentEditor({
  block,
  availableProducts,
  availableApps,
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
        <FieldSelect
          props={props}
          set={set}
          k="imageSourceType"
          label="Image Source"
          options={[
            { value: "upload", label: "Upload Image" },
            { value: "custom", label: "Custom URL" },
          ]}
        />
        {(props.imageSourceType === "upload" || !props.imageSourceType) && (
          <FieldUpload
            k="src"
            label="Image URL"
            props={props}
            set={set}
            placeholder="Select Image..."
          />
        )}
        {props.imageSourceType === "custom" && (
          <FieldText
            props={props}
            k="src"
            label="Image URL"
            placeholder="https://..."
            set={set}
          />
        )}
        <FieldSelect
          props={props}
          set={set}
          k="linkType"
          label="Link URL (optional)"
          options={[
            { value: "none", label: "None" },
            { value: "whatsapp", label: "WhatsApp Chat" },
            { value: "product", label: "Product Link" },
            { value: "custom", label: "Custom Link" },
          ]}
        />
        {props.linkType === "whatsapp" && (
          <AppAssignField
            k="waRotatorId"
            label="WhatsApp Rotator"
            appType="wa_rotator"
            props={props}
            set={set}
            availableApps={availableApps}
            placeholder="Select WA Rotator..."
          />
        )}
        {props.linkType === "product" && (
          <ProductPicker
            props={props}
            availableProducts={availableProducts}
            k="productId"
            label="Product"
            set={set}
          />
        )}
        {props.linkType === "custom" && (
          <FieldText
            props={props}
            k="linkUrl"
            label="Link URL"
            placeholder="https://..."
            set={set}
          />
        )}
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
        {(props.type === "carousel" || !props.type) && (
          <>
            <FieldToggle
              props={props}
              set={set}
              k="autoPlay"
              label="Auto play"
            />
            <FieldToggle props={props} set={set} k="loop" label="Loop" />
            <FieldToggle
              props={props}
              set={set}
              k="showArrows"
              label="Show arrows"
            />
            <FieldToggle
              props={props}
              set={set}
              k="showDots"
              label="Show dots"
            />
            <FieldText
              props={props}
              k="autoPlayDelay"
              label="Auto play delay"
              placeholder="ms"
              set={set}
            />
          </>
        )}
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
        <div className="space-y-1.5">
          <FieldSelect
            props={props}
            set={set}
            k="linkType"
            label="Link Type"
            options={[
              { value: "none", label: "None" },
              { value: "whatsapp", label: "WhatsApp Chat" },
              { value: "product", label: "Product Link" },
              { value: "custom", label: "Custom Link" },
            ]}
          />
          {props.linkType === "whatsapp" && (
            <AppAssignField
              k="waRotatorId"
              label="WhatsApp Rotator"
              appType="wa_rotator"
              props={props}
              set={set}
              availableApps={availableApps}
              placeholder="Select WA Rotator..."
            />
          )}
          {props.linkType === "product" && (
            <ProductPicker
              props={props}
              k="productId"
              availableProducts={availableProducts}
              label="Product"
              set={set}
            />
          )}
          {props.linkType === "custom" && (
            <FieldText
              props={props}
              set={set}
              k="targetUrl"
              label="Redirect URL"
              placeholder="https://..."
            />
          )}
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

  if (type === "block-animation")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="animationType"
          label="Animation Type"
          options={[
            { value: "arrow-bounce", label: "Bouncing Arrow" },
            { value: "image", label: "Animated Image" },
            { value: "text-typewriter", label: "Typewriter Text" },
            { value: "dots-loading", label: "Loading Dots" },
            { value: "spinner", label: "Spinner" },
            { value: "pulse", label: "Pulse Glow" },
          ]}
        />
        <FieldSelect
          props={props}
          set={set}
          k="direction"
          label="Direction"
          options={[
            { value: "down", label: "↓ Down" },
            { value: "up", label: "↑ Up" },
            { value: "left", label: "← Left" },
            { value: "right", label: "→ Right" },
          ]}
        />
        <FieldSelect
          props={props}
          set={set}
          k="speed"
          label="Speed"
          options={[
            { value: "slow", label: "Slow" },
            { value: "normal", label: "Normal" },
            { value: "fast", label: "Fast" },
          ]}
        />
        <FieldToggle props={props} set={set} k="loop" label="Loop animation" />
        {props.animationType === "image" && (
          <FieldText
            props={props}
            set={set}
            k="content"
            label="Image URL"
            placeholder="https://..."
          />
        )}
        {props.animationType === "text-typewriter" && (
          <FieldText
            props={props}
            set={set}
            k="content"
            label="Text to type"
            placeholder="Hello World..."
          />
        )}
      </div>
    );

  if (type === "block-sidebar")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="position"
          label="Position"
          options={[
            { value: "left", label: "Left" },
            { value: "right", label: "Right" },
          ]}
        />
        <FieldText
          props={props}
          set={set}
          k="width"
          label="Width"
          placeholder="280px"
        />
        <FieldToggle
          props={props}
          set={set}
          k="sticky"
          label="Sticky on scroll"
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Content (HTML)</Label>
          <Textarea
            value={(props.content as string) ?? ""}
            onChange={(e) => set("content", e.target.value)}
            className="text-xs font-mono min-h-30"
            rows={6}
            placeholder="<p>Sidebar content</p>"
          />
        </div>
      </div>
    );

  if (type === "block-chat-bot")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="mode"
          label="Mode"
          options={[
            { value: "manual", label: "Manual (WA Agent)" },
            { value: "ai", label: "AI Bot (coming soon)" },
          ]}
        />
        <AppAssignField
          k="waRotatorId"
          label="WhatsApp Rotator"
          appType="wa_rotator"
          props={props}
          set={set}
          availableApps={availableApps}
          placeholder="Select WA Rotator app..."
        />
        <AppAssignField
          k="waTemplateId"
          label="WA Message Template"
          appType="wa_template"
          props={props}
          set={set}
          availableApps={availableApps}
          placeholder="Select template..."
        />
        <FieldText
          props={props}
          set={set}
          k="greeting"
          label="Greeting Message"
          placeholder="Hi! How can I help you?"
        />
        <FieldText
          props={props}
          set={set}
          k="botName"
          label="Bot / Agent Name"
          placeholder="Support"
        />
        <FieldText
          props={props}
          set={set}
          k="botAvatar"
          label="Avatar Image URL"
          placeholder="https://..."
        />
        <FieldSelect
          props={props}
          set={set}
          k="position"
          label="Position"
          options={[
            { value: "bottom-right", label: "Bottom Right" },
            { value: "bottom-left", label: "Bottom Left" },
          ]}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Chat Bubble Color</Label>
          <Input
            type="color"
            value={(props.primaryColor as string) ?? "#25D366"}
            onChange={(e) => set("primaryColor", e.target.value)}
            className="h-8 w-16 cursor-pointer rounded border p-1"
          />
        </div>
      </div>
    );
  if (type === "block-blog-post")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="layout"
          label="Layout"
          options={[1, 2, 3].map((i) => ({
            value: i.toString(),
            label: `${i} Columns${i > 1 ? "s" : ""}`,
          }))}
        />
        <FieldSelect
          props={props}
          set={set}
          k="columns"
          label="Columns"
          options={[
            { value: "1", label: "1 Column" },
            { value: "2", label: "2 Columns" },
            { value: "3", label: "3 Columns" },
          ]}
        />
        <FieldToggle props={props} set={set} k="showDate" label="Show date" />
        <FieldToggle
          props={props}
          set={set}
          k="showExcerpt"
          label="Show excerpt"
        />
        <FieldToggle
          props={props}
          set={set}
          k="showAuthor"
          label="Show author"
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Posts (manual data)</Label>
          <BlogPostItemsEditor
            items={
              (props.posts as {
                title: string;
                excerpt?: string;
                date?: string;
                image?: string;
                url?: string;
              }[]) ?? []
            }
            onChange={(v) => set("posts", v)}
          />
        </div>
      </div>
    );
  if (type === "block-menu-group")
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Menu Groups</Label>
          <MenuGroupsEditor
            groups={
              (props.groups as {
                title: string;
                links: { label: string; href: string }[];
              }[]) ?? []
            }
            onChange={(v) => set("groups", v)}
          />
        </div>
      </div>
    );

  if (type === "block-back-redirect")
    return (
      <div className="space-y-3">
        <FieldToggle
          props={props}
          set={set}
          k="enabled"
          label="Enable back redirect trap"
        />
        <FieldSelect
          props={props}
          set={set}
          k="linkType"
          label="Link Type"
          options={[
            { value: "none", label: "None" },
            { value: "whatsapp", label: "WhatsApp Chat" },
            { value: "product", label: "Product Link" },
            { value: "custom", label: "Custom Link" },
          ]}
        />
        {props.linkType === "whatsapp" && (
          <AppAssignField
            k="waRotatorId"
            label="WhatsApp Rotator"
            appType="wa_rotator"
            props={props}
            set={set}
            availableApps={availableApps}
            placeholder="Select WA Rotator..."
          />
        )}
        {props.linkType === "product" && (
          <ProductPicker
            props={props}
            k="productId"
            availableProducts={availableProducts}
            label="Product"
            set={set}
          />
        )}
        {props.linkType === "custom" && (
          <FieldText
            props={props}
            set={set}
            k="redirectUrl"
            label="Redirect URL"
            placeholder="https://..."
          />
        )}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 px-3 py-2">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            ⚠️ When enabled, pressing the browser back button will keep the user
            on this page instead of going back.
          </p>
        </div>
      </div>
    );

  if (type === "block-custom-script")
    return (
      <div className="space-y-3">
        <AppAssignField
          k="scriptId"
          label="Script App"
          appType="custom_script"
          props={props}
          set={set}
          availableApps={availableApps}
          placeholder="Select a custom script app..."
        />
        <FieldSelect
          props={props}
          set={set}
          k="injectPosition"
          label="Inject Position"
          options={[
            { value: "head", label: "<head>" },
            { value: "body", label: "<body> start" },
            { value: "footer", label: "</body> end" },
          ]}
        />
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Create a Custom Script in the Applications dashboard, then assign it
            here. The script will be injected at the specified position in the
            page HTML.
          </p>
        </div>
      </div>
    );

  if (type === "block-countdown-auto")
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">
            Duration (Days): {(props.durationDays as number) ?? 3}
          </Label>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={(props.durationDays as number) ?? 3}
            onChange={(e) => set("durationDays", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            Duration (Hours): {(props.durationHours as number) ?? 0}
          </Label>
          <input
            type="range"
            min={0}
            max={23}
            step={1}
            value={(props.durationHours as number) ?? 0}
            onChange={(e) => set("durationHours", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            Duration (Minutes): {(props.durationMinutes as number) ?? 0}
          </Label>
          <input
            type="range"
            min={0}
            max={59}
            step={1}
            value={(props.durationMinutes as number) ?? 0}
            onChange={(e) => set("durationMinutes", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <FieldSelect
          props={props}
          set={set}
          k="resetMode"
          label="Reset Timer"
          options={[
            { value: "never", label: "Never (persistent per visitor)" },
            { value: "daily", label: "Daily at midnight" },
            { value: "per_visit", label: "On every page visit" },
          ]}
        />
        <FieldText
          props={props}
          set={set}
          k="label"
          label="Label"
          placeholder="Offer ends in:"
        />
        <FieldSelect
          props={props}
          set={set}
          k="style"
          label="Display Style"
          options={[
            { value: "minimal", label: "Minimal" },
            { value: "boxes", label: "Boxes" },
            { value: "flip", label: "Flip" },
          ]}
        />
        <FieldText
          props={props}
          set={set}
          k="expiredRedirect"
          label="Redirect when expired (URL)"
          placeholder="https://..."
        />
      </div>
    );
  if (type === "block-floating-content")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="position"
          label="Position"
          options={[
            { value: "bottom", label: "Bottom bar" },
            { value: "top", label: "Top bar" },
          ]}
        />
        <FieldText
          props={props}
          set={set}
          k="content"
          label="Content"
          placeholder="Special announcement..."
          multiline
        />
        <FieldToggle
          props={props}
          set={set}
          k="dismissible"
          label="Show close button"
        />
      </div>
    );

  if (type === "block-tab")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="style"
          label="Tab Style"
          options={[
            { value: "underline", label: "Underline" },
            { value: "pills", label: "Pills" },
            { value: "boxed", label: "Boxed" },
          ]}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Tabs</Label>
          <TabItemsEditor
            tabs={(props.tabs as { label: string; content: string }[]) ?? []}
            onChange={(v) => set("tabs", v)}
          />
        </div>
      </div>
    );

  if (type === "block-popup")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="trigger"
          label="Trigger"
          options={[
            { value: "time", label: "After time delay" },
            { value: "scroll", label: "On scroll %" },
            { value: "exit", label: "Exit intent" },
          ]}
        />
        {props.trigger === "time" && (
          <div className="space-y-1.5">
            <Label className="text-xs">
              Delay: {(props.triggerDelay as number) ?? 5} seconds
            </Label>
            <input
              type="range"
              min={1}
              max={60}
              value={(props.triggerDelay as number) ?? 5}
              onChange={(e) => set("triggerDelay", Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
        {props.trigger === "scroll" && (
          <div className="space-y-1.5">
            <Label className="text-xs">
              Scroll %: {(props.triggerScroll as number) ?? 50}%
            </Label>
            <input
              type="range"
              min={10}
              max={100}
              value={(props.triggerScroll as number) ?? 50}
              onChange={(e) => set("triggerScroll", Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
        <FieldToggle
          props={props}
          set={set}
          k="showOnce"
          label="Show only once per session"
        />
        <FieldToggle
          props={props}
          set={set}
          k="showCloseButton"
          label="Show close button"
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Content (HTML)</Label>
          <Textarea
            value={(props.content as string) ?? ""}
            onChange={(e) => set("content", e.target.value)}
            className="text-xs font-mono min-h-20"
            rows={4}
            placeholder="<h2>Special Offer!</h2><p>Get 20% off today</p>"
          />
        </div>
        <FieldText
          props={props}
          set={set}
          k="ctaText"
          label="CTA Button Text"
          placeholder="Claim Now"
        />
        <FieldText
          props={props}
          set={set}
          k="ctaUrl"
          label="CTA Button URL"
          placeholder="https://..."
        />
      </div>
    );

  if (type === "block-float-button")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="type"
          label="Button Type"
          options={[
            { value: "whatsapp", label: "WhatsApp Chat" },
            { value: "scroll-top", label: "Scroll to Top" },
            { value: "product", label: "Product List" },
            { value: "custom", label: "Custom Link" },
          ]}
        />
        {(props.type === "whatsapp" || !props.type) && (
          <AppAssignField
            k="waRotatorId"
            label="WhatsApp Rotator"
            appType="wa_rotator"
            props={props}
            set={set}
            availableApps={availableApps}
            placeholder="Select WA Rotator..."
          />
        )}
        {props.linkType === "product" && (
          <ProductPicker
            props={props}
            k="productId"
            availableProducts={availableProducts}
            label="Product"
            set={set}
          />
        )}
        {props.type === "custom" && (
          <FieldText
            props={props}
            set={set}
            k="customUrl"
            label="URL"
            placeholder="https://..."
          />
        )}
        <FieldSelect
          props={props}
          set={set}
          k="position"
          label="Position"
          options={[
            { value: "bottom-right", label: "Bottom Right" },
            { value: "bottom-left", label: "Bottom Left" },
            { value: "top-right", label: "Top Right" },
            { value: "top-left", label: "Top Left" },
          ]}
        />
        <FieldText
          props={props}
          set={set}
          k="label"
          label="Label"
          placeholder="Chat"
        />
        <FieldToggle
          props={props}
          set={set}
          k="showLabel"
          label="Show label text"
        />
        <FieldToggle
          props={props}
          set={set}
          k="pulseAnimation"
          label="Pulse animation"
        />
      </div>
    );

  if (type === "block-button-group")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="alignment"
          label="Alignment"
          options={[
            { value: "center", label: "Center" },
            { value: "left", label: "Left" },
            { value: "right", label: "Right" },
          ]}
        />
        <FieldSelect
          props={props}
          set={set}
          k="gap"
          label="Gap"
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Buttons</Label>
          <ButtonGroupEditor
            buttons={
              (props.buttons as {
                text: string;
                url: string;
                style?: string;
                size?: string;
              }[]) ?? []
            }
            onChange={(v) => set("buttons", v)}
            availableApps={availableApps}
            availableProducts={availableProducts}
          />
        </div>
      </div>
    );

  if (type === "block-applications")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          set={set}
          k="title"
          label="Section Title"
          placeholder="Integrations"
        />
        <FieldSelect
          props={props}
          set={set}
          k="layout"
          label="Layout"
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ]}
        />
        <FieldSelect
          props={props}
          set={set}
          k="columns"
          label="Columns"
          options={[2, 3, 4, 6].map((n) => ({
            value: String(n),
            label: `${n}`,
          }))}
        />
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            This block displays your active Applications as integration badges.
            All active applications will be shown automatically.
          </p>
        </div>
      </div>
    );

  if (type === "block-contact")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          set={set}
          k="title"
          label="Title"
          placeholder="Get in Touch"
        />
        <FieldText
          props={props}
          set={set}
          k="subtitle"
          label="Subtitle"
          placeholder="We'd love to hear from you"
          multiline
        />
        <div className="space-y-1 rounded-lg border p-2.5">
          <Label className="text-xs font-semibold">Form Fields</Label>
          {[
            { k: "fields.name", label: "Name field" },
            { k: "fields.email", label: "Email field" },
            { k: "fields.phone", label: "Phone field" },
            { k: "fields.message", label: "Message field" },
          ].map((f) => {
            const fieldKey = f.k.split(".")[1] as keyof typeof props.fields;
            return (
              <div key={f.k} className="flex items-center gap-2">
                <Switch
                  checked={
                    ((props.fields as Record<string, boolean>) ?? {})[
                      fieldKey as string
                    ] !== false
                  }
                  onCheckedChange={(v) =>
                    set("fields", {
                      ...(props.fields as Record<string, boolean>),
                      [fieldKey as string]: v,
                    })
                  }
                  id={`contact-${fieldKey as string}`}
                />
                <Label
                  htmlFor={`contact-${fieldKey as string}`}
                  className="text-xs cursor-pointer"
                >
                  {f.label}
                </Label>
              </div>
            );
          })}
        </div>
        <AppAssignField
          k="waRotatorId"
          label="WhatsApp Rotator (for WA button)"
          appType="wa_rotator"
          props={props}
          set={set}
          availableApps={availableApps}
          placeholder="Optional: assign WA rotator..."
        />
        <AppAssignField
          k="emailNotifId"
          label="Email Notification"
          appType="email_notification"
          props={props}
          set={set}
          availableApps={availableApps}
          placeholder="Optional: assign email notif..."
        />
        <FieldText
          props={props}
          set={set}
          k="submitLabel"
          label="Submit Button Text"
          placeholder="Send Message"
        />
      </div>
    );

  if (type === "block-fake-notification")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="position"
          label="Position"
          options={[
            { value: "bottom-left", label: "Bottom Left" },
            { value: "bottom-right", label: "Bottom Right" },
            { value: "top-left", label: "Top Left" },
            { value: "top-right", label: "Top Right" },
          ]}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">
            Interval: {((props.interval as number) ?? 5000) / 1000}s
          </Label>
          <input
            type="range"
            min={2000}
            max={30000}
            step={1000}
            value={(props.interval as number) ?? 5000}
            onChange={(e) => set("interval", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            Show duration: {((props.duration as number) ?? 4000) / 1000}s
          </Label>
          <input
            type="range"
            min={1000}
            max={10000}
            step={500}
            value={(props.duration as number) ?? 4000}
            onChange={(e) => set("duration", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Messages</Label>
          <FakeNotifEditor
            messages={
              (props.messages as {
                name: string;
                location?: string;
                action: string;
                avatar?: string;
              }[]) ?? []
            }
            onChange={(v) => set("messages", v)}
          />
        </div>
      </div>
    );

  if (type === "block-fake-comment")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="platform"
          label="Platform Style"
          options={[
            { value: "instagram", label: "Instagram" },
            { value: "facebook", label: "Facebook" },
            { value: "tiktok", label: "TikTok" },
            { value: "twitter", label: "Twitter/X" },
          ]}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Comments</Label>
          <FakeCommentEditor
            comments={
              (props.comments as {
                avatar?: string;
                username: string;
                text: string;
                likes: number;
                time: string;
              }[]) ?? []
            }
            onChange={(v) => set("comments", v)}
          />
        </div>
      </div>
    );

  if (type === "block-logos")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          set={set}
          k="title"
          label="Section Title"
          placeholder="Trusted by 1000+ businesses"
        />
        <FieldToggle
          props={props}
          set={set}
          k="marquee"
          label="Scrolling marquee animation"
        />
        {props.marquee && (
          <div className="space-y-1.5">
            <Label className="text-xs">
              Speed: {(props.marqueeSpeed as number) ?? 30}s
            </Label>
            <input
              type="range"
              min={10}
              max={60}
              value={(props.marqueeSpeed as number) ?? 30}
              onChange={(e) => set("marqueeSpeed", Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
        <FieldToggle
          props={props}
          set={set}
          k="grayscale"
          label="Grayscale logos (color on hover)"
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Logos</Label>
          <LogoItemsEditor
            props={props}
            logos={(props.logos as { src: string; alt: string }[]) ?? []}
            availableApps={availableApps}
            availableProducts={availableProducts}
            onChange={(v) => set("logos", v)}
          />
        </div>
      </div>
    );

  if (type === "block-stock-counter")
    return (
      <div className="space-y-3">
        <ProductPicker
          props={props}
          k="productId"
          label="Product (optional — for real stock sync)"
          availableProducts={availableProducts}
          set={set}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">
            Initial Stock Count: {(props.initialStock as number) ?? 100}
          </Label>
          <input
            type="range"
            min={1}
            max={999}
            value={(props.initialStock as number) ?? 100}
            onChange={(e) => set("initialStock", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            Low Stock Threshold: {(props.lowStockThreshold as number) ?? 10}
          </Label>
          <input
            type="range"
            min={1}
            max={50}
            value={(props.lowStockThreshold as number) ?? 10}
            onChange={(e) => set("lowStockThreshold", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <FieldToggle
          props={props}
          set={set}
          k="showWhenLow"
          label="Only show when stock is low"
        />
        <FieldText
          props={props}
          set={set}
          k="label"
          label="Label text"
          placeholder="Only {count} left in stock!"
        />
        <FieldToggle
          props={props}
          set={set}
          k="showProgressBar"
          label="Show progress bar"
        />
      </div>
    );

  if (type === "block-payment-list")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          set={set}
          k="title"
          label="Section Title"
          placeholder="Payment Methods"
        />
        <FieldSelect
          props={props}
          set={set}
          k="layout"
          label="Layout"
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ]}
        />
        <FieldToggle
          props={props}
          set={set}
          k="showAccountNumber"
          label="Show account number"
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Payment Method Apps</Label>
          <MultiAppAssignField
            k="paymentMethodIds"
            label=""
            appType="payment_method"
            props={props}
            set={set}
            availableApps={availableApps}
          />
        </div>
      </div>
    );
  if (type === "block-order-confirm")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          set={set}
          k="headline"
          label="Headline"
          placeholder="Order Received! 🎉"
        />
        <FieldText
          props={props}
          set={set}
          k="subheadline"
          label="Subheadline"
          placeholder="Thank you for your purchase!"
          multiline
        />
        <FieldToggle
          props={props}
          set={set}
          k="showOrderNumber"
          label="Show order number"
        />
        <FieldToggle
          props={props}
          set={set}
          k="showOrderSummary"
          label="Show order summary"
        />
        <FieldText
          props={props}
          set={set}
          k="nextStepText"
          label="Next steps heading"
          placeholder="What happens next"
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Steps</Label>
          <ConfirmStepsEditor
            steps={(props.steps as { icon: string; text: string }[]) ?? []}
            onChange={(v) => set("steps", v)}
          />
        </div>
      </div>
    );
  if (type === "block-checkout")
    return (
      <div className="space-y-3">
        <div className="space-y-1 rounded-lg border p-2.5">
          <Label className="text-xs font-semibold">Form Fields</Label>
          {[
            { k: "name", label: "Full Name" },
            { k: "phone", label: "Phone / WA" },
            { k: "email", label: "Email" },
            { k: "address", label: "Shipping Address" },
            { k: "city", label: "City" },
            { k: "notes", label: "Order Notes" },
          ].map((f) => (
            <div key={f.k} className="flex items-center gap-2">
              <Switch
                checked={
                  ((props.fields as Record<string, boolean>) ?? {})[f.k] !==
                  false
                }
                onCheckedChange={(v) =>
                  set("fields", {
                    ...(props.fields as Record<string, boolean>),
                    [f.k]: v,
                  })
                }
                id={`checkout-${f.k}`}
              />
              <Label
                htmlFor={`checkout-${f.k}`}
                className="text-xs cursor-pointer"
              >
                {f.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Payment Methods</Label>
          <MultiAppAssignField
            k="paymentMethodIds"
            label=""
            appType="payment_method"
            props={props}
            set={set}
            availableApps={availableApps}
          />
        </div>
        <AppAssignField
          k="logisticId"
          label="Logistic / Kurir"
          appType="logistic_kurir"
          props={props}
          set={set}
          availableApps={availableApps}
          placeholder="Select logistic app..."
        />
        <AppAssignField
          k="emailNotifId"
          label="Email Notification"
          appType="email_notification"
          props={props}
          set={set}
          availableApps={availableApps}
          placeholder="Optional..."
        />
        <FieldToggle
          props={props}
          set={set}
          k="showOrderSummary"
          label="Show order summary"
        />
        <FieldText
          props={props}
          set={set}
          k="submitLabel"
          label="Submit Button Text"
          placeholder="Pesan Sekarang →"
        />
      </div>
    );

  if (type === "block-pricing")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="style"
          label="Style"
          options={[
            { value: "cards", label: "Cards" },
            { value: "table", label: "Comparison Table" },
          ]}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Pricing Plan Apps</Label>
          <MultiAppAssignField
            k="pricingItemIds"
            label=""
            appType="pricing_item"
            props={props}
            set={set}
            availableApps={availableApps}
          />
          <p className="text-[10px] text-muted-foreground">
            Create Pricing Items in the Applications dashboard to use here.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            Highlighted plan (index): {(props.highlightIndex as number) ?? 1}
          </Label>
          <input
            type="range"
            min={0}
            max={5}
            value={(props.highlightIndex as number) ?? 1}
            onChange={(e) => set("highlightIndex", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <FieldToggle
          props={props}
          set={set}
          k="showMonthlyToggle"
          label="Show monthly/yearly toggle"
        />
      </div>
    );

  if (type === "block-changelog")
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Changelog Items</Label>
          <ChangelogEditor
            items={
              (props.items as {
                version: string;
                date: string;
                changes: string[];
              }[]) ?? []
            }
            onChange={(v) => set("items", v)}
          />
        </div>
      </div>
    );

  if (type === "block-frame")
    return (
      <div className="space-y-3">
        <FieldText
          props={props}
          set={set}
          k="src"
          label="Embed URL"
          placeholder="https://..."
        />
        <FieldText
          props={props}
          set={set}
          k="height"
          label="Height"
          placeholder="450px"
        />
        <FieldText
          props={props}
          set={set}
          k="title"
          label="Title (accessibility)"
          placeholder="Embedded content"
        />
        <FieldToggle
          props={props}
          set={set}
          k="allowFullscreen"
          label="Allow fullscreen"
        />
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Supports: Google Maps, Calendly, Typeform, YouTube, Airtable, etc.
          </p>
        </div>
      </div>
    );

  if (type === "block-carousel")
    return (
      <div className="space-y-3">
        <FieldToggle props={props} set={set} k="autoPlay" label="Auto play" />
        {props.autoPlay && (
          <div className="space-y-1.5">
            <Label className="text-xs">
              Interval: {((props.autoPlayInterval as number) ?? 4000) / 1000}s
            </Label>
            <input
              type="range"
              min={1000}
              max={10000}
              step={500}
              value={(props.autoPlayInterval as number) ?? 4000}
              onChange={(e) => set("autoPlayInterval", Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
        <FieldToggle
          props={props}
          set={set}
          k="showArrows"
          label="Show arrows"
        />
        <FieldToggle props={props} set={set} k="showDots" label="Show dots" />
        <FieldToggle
          props={props}
          set={set}
          k="infinite"
          label="Infinite loop"
        />
        <FieldSelect
          props={props}
          set={set}
          k="slidesPerView"
          label="Slides per view"
          options={[1, 2, 3].map((n) => ({
            value: String(n),
            label: `${n} slides`,
          }))}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Slides</Label>
          <CarouselItemsEditor
            items={
              (props.items as {
                src?: string;
                title?: string;
                content?: string;
              }[]) ?? []
            }
            onChange={(v) => set("items", v)}
          />
        </div>
      </div>
    );

  if (type === "block-gallery")
    return (
      <div className="space-y-3">
        <FieldSelect
          props={props}
          set={set}
          k="layout"
          label="Layout"
          options={[
            { value: "grid", label: "Grid" },
            { value: "masonry", label: "Masonry" },
          ]}
        />
        <FieldSelect
          props={props}
          set={set}
          k="columns"
          label="Columns"
          options={[2, 3, 4].map((n) => ({
            value: String(n),
            label: `${n} columns`,
          }))}
        />
        <FieldSelect
          props={props}
          set={set}
          k="gap"
          label="Gap"
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />
        <FieldToggle
          props={props}
          set={set}
          k="lightbox"
          label="Enable lightbox on click"
        />
        <FieldSelect
          props={props}
          set={set}
          k="aspectRatio"
          label="Image aspect ratio"
          options={[
            { value: "square", label: "Square (1:1)" },
            { value: "landscape", label: "Landscape (4:3)" },
            { value: "wide", label: "Wide (16:9)" },
            { value: "auto", label: "Auto" },
          ]}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Images</Label>
          <GalleryImageEditor
            props={props}
            images={(props.images as { src: string; alt: string }[]) ?? []}
            availableApps={availableApps}
            availableProducts={availableProducts}
            onChange={(v) => set("images", v)}
          />
        </div>
      </div>
    );
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
  items: {
    name: string;
    role: string;
    text: string;
    rating: number;
    avatar?: string;
  }[];
  onChange: (
    v: {
      name: string;
      role: string;
      text: string;
      rating: number;
      avatar?: string;
    }[],
  ) => void;
}) {
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function handleImageFile(
    e: React.ChangeEvent<HTMLInputElement>,
    i: number,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            mimeType: file.type,
            folder: "snapland/landing-pages",
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          toast.error(json.error ?? "Upload failed");
          return;
        }
        const newUrl: string = json.data.url;
        update(i, "avatar", newUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsImageUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const deleteSection = async (id: number) => {
    const imageUrl = items[id].avatar;
    if (!imageUrl) {
      toast.error("Image not found.");
      return;
    }

    if (!extractPublicIdFromUrl(imageUrl)) {
      remove(id);
      return;
    }
    const response = await fetch(
      `/api/upload?url=${encodeURIComponent(imageUrl)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Failed to delete image");
    }

    remove(id);
    toast.success(data.message ?? "Image deleted successfully");
  };
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
              onClick={() => deleteSection(i)}
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
          <div className="flex gap-1.5">
            <div className="grid gap-1">
              <label
                htmlFor={`uploadAvatarFile-${i}`}
                className={cn(
                  "flex items-center justify-center w-max px-2 h-7 text-xs rounded-md font-semibold cursor-pointer tracking-wide text-white dark:text-black border bg-neutral-800 dark:bg-neutral-50 hover:bg-neutral-950 dark:hover:bg-neutral-300 transition-all mx-auto",
                  {
                    "cursor-not-allowed": isImageUploading,
                  },
                )}
              >
                <Upload className="size-3 fill-white dark:fill-black inline" />
                <input
                  id={`uploadAvatarFile-${i}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleImageFile(e, i)}
                  disabled={isImageUploading}
                  ref={fileRef}
                />
              </label>
            </div>
            <Input
              value={item.avatar}
              onChange={(e) => update(i, "avatar", e.target.value)}
              placeholder="Avatar URL"
              className="h-7 text-xs flex-1"
            />
          </div>
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

function AppAssignField({
  k,
  label,
  appType,
  props,
  set,
  availableApps,
  placeholder,
}: {
  k: string;
  label: string;
  appType: string;
  props: Record<string, unknown>;
  set: (key: string, val: unknown) => void;
  availableApps: Application[];
  placeholder?: string;
}) {
  const compatible = availableApps.filter((a) => a.app_type === appType);
  return (
    <div className="space-y-1.5">
      {label && <Label className="text-xs">{label}</Label>}
      <Select
        value={(props[k] as string) ?? "none"}
        onValueChange={(v) => set(k, v === "none" ? null : v)}
      >
        <SelectTrigger className="h-8 text-xs w-full">
          <SelectValue placeholder={placeholder ?? "Select..."} />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectItem value="none" className="text-xs text-muted-foreground">
            — None —
          </SelectItem>
          {compatible.map((app) => (
            <SelectItem key={app.id} value={app.id} className="text-xs">
              {app.name}
            </SelectItem>
          ))}
          {compatible.length === 0 && (
            <SelectItem
              value="__empty"
              disabled
              className="text-xs text-muted-foreground"
            >
              No {appType} apps found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {compatible.length === 0 && (
        <a
          href="/dashboard/applications"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-primary hover:underline"
        >
          Create {appType} app →
        </a>
      )}
    </div>
  );
}

function MultiAppAssignField({
  k,
  label,
  appType,
  props,
  set,
  availableApps,
}: {
  k: string;
  label: string;
  appType: string;
  props: Record<string, unknown>;
  set: (key: string, val: unknown) => void;
  availableApps: Application[];
}) {
  const compatible = availableApps.filter((a) => a.app_type === appType);
  const selected = (props[k] as string[]) ?? [];

  function toggle(id: string) {
    set(
      k,
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  }

  return (
    <div className="space-y-1.5">
      {label && <Label className="text-xs">{label}</Label>}
      {compatible.length === 0 ? (
        <div className="rounded-md bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            No {appType} apps found.
          </p>
          <a
            href="/dashboard/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline"
          >
            Create one →
          </a>
        </div>
      ) : (
        <div className="space-y-1 max-h-40 overflow-y-auto rounded-md border p-2">
          {compatible.map((app) => (
            <label
              key={app.id}
              className="flex items-center gap-2 cursor-pointer py-1 hover:bg-muted/50 rounded px-1"
            >
              <Checkbox
                checked={selected.includes(app.id)}
                onCheckedChange={() => toggle(app.id)}
              />
              <span className="text-xs truncate">{app.name}</span>
            </label>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">
        {selected.length} selected
      </p>
    </div>
  );
}

function BlogPostItemsEditor({
  items,
  onChange,
}: {
  items: {
    title: string;
    excerpt?: string;
    date?: string;
    image?: string;
    url?: string;
  }[];
  onChange: (v: typeof items) => void;
}) {
  const add = () =>
    onChange([
      ...items,
      {
        title: "Post Title",
        excerpt: "Excerpt...",
        date: new Date().toISOString().slice(0, 10),
        url: "",
      },
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
              Post {i + 1}
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
          <Input
            value={item.date ?? ""}
            onChange={(e) => update(i, "date", e.target.value)}
            placeholder="YYYY-MM-DD"
            className="h-7 text-xs"
          />
          <Input
            value={item.image ?? ""}
            onChange={(e) => update(i, "image", e.target.value)}
            placeholder="Image URL"
            className="h-7 text-xs"
          />
          <Input
            value={item.url ?? ""}
            onChange={(e) => update(i, "url", e.target.value)}
            placeholder="Link URL"
            className="h-7 text-xs"
          />
          <Textarea
            value={item.excerpt ?? ""}
            onChange={(e) => update(i, "excerpt", e.target.value)}
            placeholder="Excerpt..."
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
        <Plus className="size-3" /> Add Post
      </Button>
    </div>
  );
}

function MenuGroupsEditor({
  groups,
  onChange,
}: {
  groups: { title: string; links: { label: string; href: string }[] }[];
  onChange: (v: typeof groups) => void;
}) {
  const addGroup = () =>
    onChange([
      ...groups,
      { title: "Group", links: [{ label: "Link", href: "#" }] },
    ]);
  const removeGroup = (i: number) =>
    onChange(groups.filter((_, idx) => idx !== i));
  const updateTitle = (i: number, v: string) =>
    onChange(groups.map((g, idx) => (idx === i ? { ...g, title: v } : g)));
  const addLink = (i: number) =>
    onChange(
      groups.map((g, idx) =>
        idx === i
          ? { ...g, links: [...g.links, { label: "Link", href: "#" }] }
          : g,
      ),
    );
  const removeLink = (gi: number, li: number) =>
    onChange(
      groups.map((g, idx) =>
        idx === gi
          ? { ...g, links: g.links.filter((_, lidx) => lidx !== li) }
          : g,
      ),
    );
  const updateLink = (gi: number, li: number, k: string, v: string) =>
    onChange(
      groups.map((g, idx) =>
        idx === gi
          ? {
              ...g,
              links: g.links.map((l, lidx) =>
                lidx === li ? { ...l, [k]: v } : l,
              ),
            }
          : g,
      ),
    );

  return (
    <div className="space-y-2">
      {groups.map((group, gi) => (
        <div key={gi} className="rounded border p-2 space-y-2 bg-muted/30">
          <div className="flex gap-1.5">
            <Input
              value={group.title}
              onChange={(e) => updateTitle(gi, e.target.value)}
              placeholder="Group title"
              className="h-7 text-xs flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => removeGroup(gi)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
          {group.links.map((link, li) => (
            <div key={li} className="flex gap-1">
              <Input
                value={link.label}
                onChange={(e) => updateLink(gi, li, "label", e.target.value)}
                placeholder="Label"
                className="h-6 text-xs flex-1"
              />
              <Input
                value={link.href}
                onChange={(e) => updateLink(gi, li, "href", e.target.value)}
                placeholder="#href"
                className="h-6 text-xs flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() => removeLink(gi, li)}
              >
                <Trash2 className="size-2.5" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-[10px] h-6"
            onClick={() => addLink(gi)}
          >
            <Plus className="size-2.5" /> Add Link
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={addGroup}
      >
        <Plus className="size-3" /> Add Group
      </Button>
    </div>
  );
}

function TabItemsEditor({
  tabs,
  onChange,
}: {
  tabs: { label: string; content: string }[];
  onChange: (v: typeof tabs) => void;
}) {
  const add = () =>
    onChange([...tabs, { label: `Tab ${tabs.length + 1}`, content: "" }]);
  const remove = (i: number) => onChange(tabs.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange(tabs.map((tab, idx) => (idx === i ? { ...tab, [k]: v } : tab)));

  return (
    <div className="space-y-2">
      {tabs.map((tab, i) => (
        <div key={i} className="rounded border p-2 space-y-1.5 bg-muted/30">
          <div className="flex gap-1.5">
            <Input
              value={tab.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Tab label"
              className="h-7 text-xs flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => remove(i)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
          <Textarea
            value={tab.content}
            onChange={(e) => update(i, "content", e.target.value)}
            placeholder="Tab content (HTML supported)"
            className="text-xs"
            rows={3}
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
        <Plus className="size-3" /> Add Tab
      </Button>
    </div>
  );
}

function FakeNotifEditor({
  messages,
  onChange,
}: {
  messages: {
    name: string;
    location?: string;
    action: string;
    avatar?: string;
  }[];
  onChange: (v: typeof messages) => void;
}) {
  const add = () =>
    onChange([
      ...messages,
      {
        name: "Customer",
        location: "Jakarta",
        action: "just purchased this product",
      },
    ]);
  const remove = (i: number) =>
    onChange(messages.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange(messages.map((m, idx) => (idx === i ? { ...m, [k]: v } : m)));

  return (
    <div className="space-y-2">
      {messages.map((msg, i) => (
        <div key={i} className="rounded border p-2 space-y-1.5 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Message {i + 1}
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
            value={msg.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Name"
            className="h-7 text-xs"
          />
          <Input
            value={msg.location ?? ""}
            onChange={(e) => update(i, "location", e.target.value)}
            placeholder="Location (optional)"
            className="h-7 text-xs"
          />
          <Input
            value={msg.action}
            onChange={(e) => update(i, "action", e.target.value)}
            placeholder="Action text"
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
        <Plus className="size-3" /> Add Message
      </Button>
    </div>
  );
}

function FakeCommentEditor({
  comments,
  onChange,
}: {
  comments: {
    avatar?: string;
    username: string;
    text: string;
    likes: number;
    time: string;
  }[];
  onChange: (v: typeof comments) => void;
}) {
  const add = () =>
    onChange([
      ...comments,
      {
        username: "user123",
        text: "Great product! 🔥",
        likes: 47,
        time: "2h ago",
      },
    ]);
  const remove = (i: number) =>
    onChange(comments.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string | number) =>
    onChange(comments.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)));

  return (
    <div className="space-y-2">
      {comments.map((c, i) => (
        <div key={i} className="rounded border p-2 space-y-1.5 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Comment {i + 1}
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
            value={c.username}
            onChange={(e) => update(i, "username", e.target.value)}
            placeholder="@username"
            className="h-7 text-xs"
          />
          <Input
            value={c.text}
            onChange={(e) => update(i, "text", e.target.value)}
            placeholder="Comment text"
            className="h-7 text-xs"
          />
          <div className="flex gap-1.5">
            <Input
              type="number"
              value={c.likes}
              onChange={(e) => update(i, "likes", Number(e.target.value))}
              placeholder="Likes"
              className="h-7 text-xs"
            />
            <Input
              value={c.time}
              onChange={(e) => update(i, "time", e.target.value)}
              placeholder="2h ago"
              className="h-7 text-xs"
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={add}
      >
        <Plus className="size-3" /> Add Comment
      </Button>
    </div>
  );
}

function LogoItemsEditor({
  props,
  logos,
  availableApps,
  availableProducts,
  onChange,
}: {
  props: Record<string, any>;
  logos: { src: string; alt: string }[];
  availableApps: Application[];
  availableProducts: Product[];
  onChange: (v: typeof logos) => void;
}) {
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const add = () => onChange([...logos, { src: "", alt: "" }]);
  const remove = (i: number) => onChange(logos.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange(logos.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));

  async function handleImageFile(
    e: React.ChangeEvent<HTMLInputElement>,
    i: number,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            mimeType: file.type,
            folder: "snapland/landing-pages",
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          toast.error(json.error ?? "Upload failed");
          return;
        }
        const newUrl: string = json.data.url;
        update(i, "src", newUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsImageUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const deleteSection = async (id: number) => {
    const imageUrl = logos[id].src;
    if (!imageUrl) {
      toast.error("Image not found.");
      return;
    }

    if (!extractPublicIdFromUrl(imageUrl)) {
      remove(id);
      return;
    }
    const response = await fetch(
      `/api/upload?url=${encodeURIComponent(imageUrl)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Failed to delete image");
    }

    remove(id);
    toast.success(data.message ?? "Image deleted successfully");
  };
  return (
    <div className="space-y-1.5">
      {logos.map((logo, i) => (
        <div key={i} className="flex gap-1.5">
          <div className="grid gap-1">
            <label
              htmlFor={`uploadFile-${i}`}
              className={cn(
                "flex items-center justify-center w-max px-2 h-7 text-xs rounded-md font-semibold cursor-pointer tracking-wide text-white dark:text-black border bg-neutral-800 dark:bg-neutral-50 hover:bg-neutral-950 dark:hover:bg-neutral-300 transition-all mx-auto",
                {
                  "cursor-not-allowed": isImageUploading,
                },
              )}
            >
              <Upload className="size-3 fill-white dark:fill-black inline" />
              <input
                type="file"
                id={`uploadFile-${i}`}
                ref={fileRef}
                onChange={(e) => handleImageFile(e, i)}
                className="hidden"
                disabled={isImageUploading}
              />
            </label>
            <Input
              value={logo.src}
              onChange={(e) => update(i, "src", e.target.value)}
              placeholder="Image URL"
              className="h-7 text-xs flex-1"
              disabled={isImageUploading}
            />
            <Input
              value={logo.alt}
              onChange={(e) => update(i, "alt", e.target.value)}
              placeholder="Alt"
              className="h-7 text-xs w-20"
              disabled={isImageUploading}
            />
            <FieldSelect
              props={props}
              set={(v) => update(i, "linkType", v)}
              k="linkType"
              label="Link Type (Optional)"
              options={[
                { value: "whatsapp", label: "WhatsApp Chat" },
                { value: "product", label: "Product Image" },
                { value: "custom", label: "Custom Link" },
              ]}
            />
            {(props.linkType === "whatsapp" || !props.linkType) && (
              <AppAssignField
                k="linkUrl"
                label="WhatsApp Link"
                appType="wa_rotator"
                props={props}
                set={(v) => update(i, "linkUrl", v)}
                availableApps={availableApps}
                placeholder="Select WA Rotator..."
              />
            )}
            {(props.linkType === "product" || !props.linkType) && (
              <ProductPicker
                props={props}
                availableProducts={availableProducts}
                k="productId"
                label="Product"
                set={(v) => update(i, "productId", v)}
              />
            )}
            {props.linkType === "custom" && (
              <FieldText
                props={props}
                set={(v) => update(i, "linkUrl", v)}
                k="linkUrl"
                label="Custom Link"
                placeholder="https://..."
              />
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            disabled={isImageUploading}
            onClick={() => deleteSection(i)}
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
        disabled={isImageUploading}
        onClick={add}
      >
        <Plus className="size-3" /> Add Logo
      </Button>
    </div>
  );
}

function ChangelogEditor({
  items,
  onChange,
}: {
  items: { version: string; date: string; changes: string[] }[];
  onChange: (v: typeof items) => void;
}) {
  const add = () =>
    onChange([
      ...items,
      {
        version: "v1.0.0",
        date: new Date().toISOString().slice(0, 10),
        changes: ["Initial release"],
      },
    ]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string | string[]) =>
    onChange(
      items.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)),
    );

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded border p-2 space-y-1.5 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Version {i + 1}
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
          <div className="flex gap-1.5">
            <Input
              value={item.version}
              onChange={(e) => update(i, "version", e.target.value)}
              placeholder="v1.0.0"
              className="h-7 text-xs flex-1"
            />
            <Input
              value={item.date}
              onChange={(e) => update(i, "date", e.target.value)}
              type="date"
              className="h-7 text-xs flex-1"
            />
          </div>
          <Textarea
            value={item.changes.join("\n")}
            onChange={(e) =>
              update(i, "changes", e.target.value.split("\n").filter(Boolean))
            }
            placeholder="Feature 1&#10;Bug fix 2&#10;Improvement 3"
            className="text-xs"
            rows={3}
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
        <Plus className="size-3" /> Add Version
      </Button>
    </div>
  );
}

function CarouselItemsEditor({
  items,
  onChange,
}: {
  items: { src?: string; title?: string; content?: string }[];
  onChange: (v: typeof items) => void;
}) {
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const add = () => onChange([...items, { src: "", title: "", content: "" }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange(
      items.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)),
    );

  async function handleImageFile(
    e: React.ChangeEvent<HTMLInputElement>,
    i: number,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            mimeType: file.type,
            folder: "snapland/landing-pages",
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          toast.error(json.error ?? "Upload failed");
          return;
        }
        const newUrl: string = json.data.url;
        update(i, "src", newUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsImageUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const deleteSection = async (id: number) => {
    const imageUrl = items[id].src;
    if (!imageUrl) {
      toast.error("Image not found.");
      return;
    }
    if (!extractPublicIdFromUrl(imageUrl)) {
      remove(id);
      return;
    }
    const response = await fetch(
      `/api/upload?url=${encodeURIComponent(imageUrl)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Failed to delete image");
    }

    remove(id);
    toast.success(data.message ?? "Image deleted successfully");
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded border p-2 space-y-1.5 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Slide {i + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              disabled={isImageUploading}
              onClick={() => deleteSection(i)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
          <input
            id={`uploadFile-${i}`}
            type="file"
            className="w-full text-xs text-neutral-600 font-medium border border-neutral-200 rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 file:cursor-pointer file:border-0 file:py-2 file:px-1 file:mr-2 file:bg-neutral-800 hover:file:bg-neutral-950 file:text-white dark:text-black dark:border-neutral-700 dark:file:bg-neutral-50 dark:hover:file:bg-neutral-300"
            onChange={(e) => handleImageFile(e, i)}
          />
          <Input
            value={item.src ?? ""}
            onChange={(e) => update(i, "src", e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="h-7 text-xs"
            disabled={isImageUploading}
          />
          <Input
            value={item.title ?? ""}
            onChange={(e) => update(i, "title", e.target.value)}
            placeholder="Title"
            className="h-7 text-xs"
            disabled={isImageUploading}
          />
          <Input
            value={item.content ?? ""}
            onChange={(e) => update(i, "content", e.target.value)}
            placeholder="Caption/content"
            className="h-7 text-xs"
            disabled={isImageUploading}
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
        <Plus className="size-3" /> Add Slide
      </Button>
    </div>
  );
}

function GalleryImageEditor({
  props,
  images,
  availableApps,
  availableProducts,
  onChange,
}: {
  props: Record<string, any>;
  images: {
    src: string;
    alt: string;
    linkType?: string;
    linkUrl?: string;
    waRotatorId?: string;
    productId?: string;
  }[];
  availableApps: Application[];
  availableProducts: Product[];
  onChange: (v: typeof images) => void;
}) {
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const add = () =>
    onChange([...images, { src: "", alt: "", linkType: "none" }]);
  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange(images.map((img, idx) => (idx === i ? { ...img, [k]: v } : img)));

  async function handleImageFile(
    e: React.ChangeEvent<HTMLInputElement>,
    i: number,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            mimeType: file.type,
            folder: "snapland/landing-pages",
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          toast.error(json.error ?? "Upload failed");
          return;
        }
        const newUrl: string = json.data.url;
        update(i, "src", newUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsImageUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const deleteSection = async (id: number) => {
    const imageUrl = images[id].src;
    if (!imageUrl) {
      toast.error("Image not found.");
      return;
    }

    if (!extractPublicIdFromUrl(imageUrl)) {
      remove(id);
      return;
    }
    const response = await fetch(
      `/api/upload?url=${encodeURIComponent(imageUrl)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Failed to delete image");
    }

    remove(id);
    toast.success(data.message ?? "Image deleted successfully");
  };

  return (
    <div className="space-y-2">
      {images.map((img, i) => (
        <div key={i} className="rounded border p-2 space-y-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Image {i + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => deleteSection(i)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>

          <div className="flex gap-1.5">
            <div className="grid gap-1">
              <label
                htmlFor={`uploadGalleryFile-${i}`}
                className={cn(
                  "flex items-center justify-center w-max px-2 h-7 text-xs rounded-md font-semibold cursor-pointer tracking-wide text-white dark:text-black border bg-neutral-800 dark:bg-neutral-50 hover:bg-neutral-950 dark:hover:bg-neutral-300 transition-all mx-auto",
                  {
                    "cursor-not-allowed": isImageUploading,
                  },
                )}
              >
                <Upload className="size-3 fill-white dark:fill-black inline" />
                <input
                  id={`uploadGalleryFile-${i}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleImageFile(e, i)}
                  disabled={isImageUploading}
                  ref={fileRef}
                />
              </label>
            </div>
            <Input
              value={img.src}
              onChange={(e) => update(i, "src", e.target.value)}
              placeholder="Image URL"
              className="h-7 text-xs flex-1"
            />
          </div>

          <Input
            value={img.alt}
            onChange={(e) => update(i, "alt", e.target.value)}
            placeholder="Alt text"
            className="h-7 text-xs"
          />

          <div className="space-y-1.5">
            <Label className="text-[10px]">Link Type</Label>
            <Select
              value={img.linkType || "none"}
              onValueChange={(v) => update(i, "linkType", v)}
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="none" className="text-xs">
                  None
                </SelectItem>
                <SelectItem value="whatsapp" className="text-xs">
                  WhatsApp Chat
                </SelectItem>
                <SelectItem value="product" className="text-xs">
                  Product Link
                </SelectItem>
                <SelectItem value="custom" className="text-xs">
                  Custom Link
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {img.linkType === "whatsapp" && (
            <div className="space-y-1.5">
              <Label className="text-[10px]">WhatsApp Rotator</Label>
              <Select
                value={img.waRotatorId || "none"}
                onValueChange={(v) =>
                  update(i, "waRotatorId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="h-7 text-xs w-full">
                  <SelectValue placeholder="Select WA Rotator..." />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem
                    value="none"
                    className="text-xs text-muted-foreground"
                  >
                    — None —
                  </SelectItem>
                  {availableApps
                    .filter((a) => a.app_type === "wa_rotator")
                    .map((app) => (
                      <SelectItem
                        key={app.id}
                        value={app.id}
                        className="text-xs"
                      >
                        {app.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {img.linkType === "product" && (
            <div className="space-y-1.5">
              <Label className="text-[10px]">Product</Label>
              <Select
                value={img.productId || "none"}
                onValueChange={(v) =>
                  update(i, "productId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="h-7 text-xs w-full">
                  <SelectValue placeholder="Select Product..." />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem
                    value="none"
                    className="text-xs text-muted-foreground"
                  >
                    — None —
                  </SelectItem>
                  {availableProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {img.linkType === "custom" && (
            <Input
              value={img.linkUrl || ""}
              onChange={(e) => update(i, "linkUrl", e.target.value)}
              placeholder="https://..."
              className="h-7 text-xs"
            />
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={add}
      >
        <Plus className="size-3" /> Add Image
      </Button>
    </div>
  );
}

function ConfirmStepsEditor({
  steps,
  onChange,
}: {
  steps: { icon: string; text: string }[];
  onChange: (v: typeof steps) => void;
}) {
  const add = () =>
    onChange([...steps, { icon: "Package", text: "Order is being processed" }]);
  const remove = (i: number) => onChange(steps.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange(steps.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-1.5">
          <Input
            value={step.text}
            onChange={(e) => update(i, "text", e.target.value)}
            placeholder="Step description"
            className="h-7 text-xs flex-1"
          />
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
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={add}
      >
        <Plus className="size-3" /> Add Step
      </Button>
    </div>
  );
}

function ButtonGroupEditor({
  buttons,
  onChange,
  availableApps,
  availableProducts,
}: {
  buttons: {
    text: string;
    url: string;
    style?: string;
    size?: string;
    linkType?: string;
    waRotatorId?: string;
    productId?: string;
  }[];
  onChange: (v: typeof buttons) => void;
  availableApps: Application[];
  availableProducts: Product[];
}) {
  const add = () =>
    onChange([
      ...buttons,
      {
        text: "Button",
        url: "",
        style: "filled",
        size: "md",
        linkType: "none",
      },
    ]);
  const remove = (i: number) => onChange(buttons.filter((_, idx) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange(buttons.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)));

  return (
    <div className="space-y-2">
      {buttons.map((btn, i) => (
        <div key={i} className="rounded border p-2 space-y-1.5 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Button {i + 1}
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
            value={btn.text}
            onChange={(e) => update(i, "text", e.target.value)}
            placeholder="Button text"
            className="h-7 text-xs"
          />
          <div className="space-y-1.5">
            <Label className="text-[10px]">Link Type</Label>
            <Select
              value={btn.linkType || "none"}
              onValueChange={(v) => update(i, "linkType", v)}
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="none" className="text-xs">
                  None
                </SelectItem>
                <SelectItem value="whatsapp" className="text-xs">
                  WhatsApp Chat
                </SelectItem>
                <SelectItem value="product" className="text-xs">
                  Product Link
                </SelectItem>
                <SelectItem value="custom" className="text-xs">
                  Custom Link
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {btn.linkType === "whatsapp" && (
            <div className="space-y-1.5">
              <Label className="text-[10px]">WhatsApp Rotator</Label>
              <Select
                value={btn.waRotatorId || "none"}
                onValueChange={(v) =>
                  update(i, "waRotatorId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="h-7 text-xs w-full">
                  <SelectValue placeholder="Select WA Rotator..." />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem
                    value="none"
                    className="text-xs text-muted-foreground"
                  >
                    — None —
                  </SelectItem>
                  {availableApps
                    .filter((a) => a.app_type === "wa_rotator")
                    .map((app) => (
                      <SelectItem
                        key={app.id}
                        value={app.id}
                        className="text-xs"
                      >
                        {app.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {btn.linkType === "product" && (
            <div className="space-y-1.5">
              <Label className="text-[10px]">Product</Label>
              <Select
                value={btn.productId || "none"}
                onValueChange={(v) =>
                  update(i, "productId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="h-7 text-xs w-full">
                  <SelectValue placeholder="Select Product..." />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem
                    value="none"
                    className="text-xs text-muted-foreground"
                  >
                    — None —
                  </SelectItem>
                  {availableProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {btn.linkType === "custom" && (
            <Input
              value={btn.url}
              onChange={(e) => update(i, "url", e.target.value)}
              placeholder="URL or #anchor"
              className="h-7 text-xs"
            />
          )}

          <div className="flex gap-1.5">
            <Select
              value={btn.style ?? "filled"}
              onValueChange={(v) => update(i, "style", v)}
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="filled" className="text-xs">
                  Filled
                </SelectItem>
                <SelectItem value="outlined" className="text-xs">
                  Outlined
                </SelectItem>
                <SelectItem value="ghost" className="text-xs">
                  Ghost
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={btn.size ?? "md"}
              onValueChange={(v) => update(i, "size", v)}
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="sm" className="text-xs">
                  SM
                </SelectItem>
                <SelectItem value="md" className="text-xs">
                  MD
                </SelectItem>
                <SelectItem value="lg" className="text-xs">
                  LG
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={add}
      >
        <Plus className="size-3" /> Add Button
      </Button>
    </div>
  );
}
