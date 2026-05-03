"use client";

import { Settings2 } from "lucide-react";
import type { LandingBlock, Product } from "@/types/database";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  block: LandingBlock | null;
  availableProducts: Product[];
  onUpdate: (id: string, updates: Partial<LandingBlock>) => void;
}

export function BlockSettingsPanel({ block, availableProducts, onUpdate }: Props) {
  if (!block) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <Settings2 className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Select a block to edit its settings.
          </p>
        </div>
      </div>
    );
  }

  function setContent(key: string, value: unknown) {
    onUpdate(block!.id, {
      content: { ...block!.content, [key]: value },
    });
  }

  function setSetting(key: string, value: unknown) {
    onUpdate(block!.id, {
      settings: { ...block!.settings, [key]: value },
    });
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3">
        <div className="mb-3">
          <p className="font-medium text-sm capitalize">
            {block.type.replace(/-/g, " ")} Settings
          </p>
          <p className="text-muted-foreground text-xs">{block.id.slice(0, 8)}…</p>
        </div>

        <Separator className="mb-3" />

        {/* ── Block content settings by type ── */}
        {block.type === "hero" && (
          <HeroSettings content={block.content} setContent={setContent} />
        )}
        {block.type === "product-single" && (
          <ProductSingleSettings
            content={block.content}
            setContent={setContent}
            availableProducts={availableProducts}
          />
        )}
        {block.type === "product-grid" && (
          <ProductGridSettings
            content={block.content}
            setContent={setContent}
            availableProducts={availableProducts}
          />
        )}
        {block.type === "product-list" && (
          <ProductGridSettings
            content={block.content}
            setContent={setContent}
            availableProducts={availableProducts}
          />
        )}
        {block.type === "text" && (
          <TextSettings content={block.content} setContent={setContent} />
        )}
        {block.type === "image" && (
          <ImageSettings content={block.content} setContent={setContent} />
        )}
        {block.type === "cta-button" && (
          <CtaSettings content={block.content} setContent={setContent} />
        )}
        {block.type === "countdown" && (
          <CountdownSettings content={block.content} setContent={setContent} />
        )}
        {block.type === "spacer" && (
          <SpacerSettings content={block.content} setContent={setContent} />
        )}
        {block.type === "custom-html" && (
          <HtmlSettings content={block.content} setContent={setContent} />
        )}

        {/* ── Block-level settings (all types) ── */}
        <Separator className="my-3" />
        <p className="mb-2 font-medium text-xs text-muted-foreground">
          LAYOUT
        </p>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Padding</Label>
            <Select
              value={block.settings.padding ?? "md"}
              onValueChange={(v) => setSetting("padding", v)}
            >
              <SelectTrigger className="mt-1 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["none", "sm", "md", "lg", "xl"].map((v) => (
                  <SelectItem key={v} value={v} className="text-xs">
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Alignment</Label>
            <Select
              value={block.settings.alignment ?? "center"}
              onValueChange={(v) => setSetting("alignment", v)}
            >
              <SelectTrigger className="mt-1 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left" className="text-xs">Left</SelectItem>
                <SelectItem value="center" className="text-xs">Center</SelectItem>
                <SelectItem value="right" className="text-xs">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Background Color</Label>
            <div className="mt-1 flex gap-2">
              <input
                type="color"
                value={block.settings.backgroundColor ?? "#ffffff"}
                onChange={(e) => setSetting("backgroundColor", e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border"
              />
              <Input
                value={block.settings.backgroundColor ?? ""}
                onChange={(e) => setSetting("backgroundColor", e.target.value)}
                className="h-7 font-mono text-xs"
                placeholder="transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

// ── Type-specific settings components ───────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function HeroSettings({
  content,
  setContent,
}: { content: Record<string, unknown>; setContent: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Headline">
        <Input
          value={(content.headline as string) ?? ""}
          onChange={(e) => setContent("headline", e.target.value)}
          className="h-7 text-xs"
        />
      </Field>
      <Field label="Subheadline">
        <Textarea
          value={(content.subheadline as string) ?? ""}
          onChange={(e) => setContent("subheadline", e.target.value)}
          className="text-xs"
          rows={2}
        />
      </Field>
      <Field label="CTA Button Text">
        <Input
          value={(content.ctaText as string) ?? ""}
          onChange={(e) => setContent("ctaText", e.target.value)}
          className="h-7 text-xs"
        />
      </Field>
      <Field label="CTA URL">
        <Input
          value={(content.ctaUrl as string) ?? ""}
          onChange={(e) => setContent("ctaUrl", e.target.value)}
          className="h-7 text-xs"
          placeholder="https://…"
        />
      </Field>
      <Field label="Background Image URL">
        <Input
          value={(content.backgroundImageUrl as string) ?? ""}
          onChange={(e) => setContent("backgroundImageUrl", e.target.value)}
          className="h-7 text-xs"
          placeholder="https://…"
        />
      </Field>
    </div>
  );
}

function ProductSingleSettings({
  content,
  setContent,
  availableProducts,
}: {
  content: Record<string, unknown>;
  setContent: (k: string, v: unknown) => void;
  availableProducts: Product[];
}) {
  return (
    <div className="space-y-3">
      <Field label="Product">
        <Select
          value={(content.productId as string) ?? ""}
          onValueChange={(v) => setContent("productId", v)}
        >
          <SelectTrigger className="mt-1 h-7 text-xs">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {availableProducts.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs">
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="flex items-center gap-2">
        <Switch
          checked={content.showRating as boolean}
          onCheckedChange={(v) => setContent("showRating", v)}
          id="showRating"
        />
        <Label htmlFor="showRating" className="cursor-pointer text-xs">
          Show rating
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={content.showBadges as boolean}
          onCheckedChange={(v) => setContent("showBadges", v)}
          id="showBadges"
        />
        <Label htmlFor="showBadges" className="cursor-pointer text-xs">
          Show badges
        </Label>
      </div>
    </div>
  );
}

function ProductGridSettings({
  content,
  setContent,
  availableProducts,
}: {
  content: Record<string, unknown>;
  setContent: (k: string, v: unknown) => void;
  availableProducts: Product[];
}) {
  const selectedIds = (content.productIds as string[]) ?? [];

  function toggleProduct(id: string) {
    setContent(
      "productIds",
      selectedIds.includes(id)
        ? selectedIds.filter((p) => p !== id)
        : [...selectedIds, id],
    );
  }

  return (
    <div className="space-y-3">
      <Field label="Columns">
        <Select
          value={String(content.columns ?? "2")}
          onValueChange={(v) => setContent("columns", Number(v))}
        >
          <SelectTrigger className="mt-1 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["1", "2", "3", "4"].map((v) => (
              <SelectItem key={v} value={v} className="text-xs">
                {v} column{v !== "1" ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div>
        <Label className="text-xs">Products</Label>
        <div className="mt-1 max-h-48 space-y-1.5 overflow-y-auto">
          {availableProducts.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-2 rounded border px-2 py-1.5"
            >
              <Checkbox
                checked={selectedIds.includes(p.id)}
                onCheckedChange={() => toggleProduct(p.id)}
              />
              <span className="text-xs">{p.title}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function TextSettings({
  content,
  setContent,
}: { content: Record<string, unknown>; setContent: (k: string, v: unknown) => void }) {
  return (
    <Field label="Text Content">
      <Textarea
        value={(content.text as string) ?? ""}
        onChange={(e) => setContent("text", e.target.value)}
        className="text-xs"
        rows={5}
      />
    </Field>
  );
}

function ImageSettings({
  content,
  setContent,
}: { content: Record<string, unknown>; setContent: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Image URL">
        <Input
          value={(content.url as string) ?? ""}
          onChange={(e) => setContent("url", e.target.value)}
          className="h-7 text-xs"
          placeholder="https://…"
        />
      </Field>
      <Field label="Alt Text">
        <Input
          value={(content.alt as string) ?? ""}
          onChange={(e) => setContent("alt", e.target.value)}
          className="h-7 text-xs"
        />
      </Field>
      <Field label="Link URL">
        <Input
          value={(content.link as string) ?? ""}
          onChange={(e) => setContent("link", e.target.value)}
          className="h-7 text-xs"
          placeholder="https://…"
        />
      </Field>
    </div>
  );
}

function CtaSettings({
  content,
  setContent,
}: { content: Record<string, unknown>; setContent: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Button Text">
        <Input
          value={(content.text as string) ?? ""}
          onChange={(e) => setContent("text", e.target.value)}
          className="h-7 text-xs"
        />
      </Field>
      <Field label="URL">
        <Input
          value={(content.url as string) ?? ""}
          onChange={(e) => setContent("url", e.target.value)}
          className="h-7 text-xs"
          placeholder="https://…"
        />
      </Field>
      <Field label="Style">
        <Select
          value={(content.style as string) ?? "filled"}
          onValueChange={(v) => setContent("style", v)}
        >
          <SelectTrigger className="mt-1 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="filled" className="text-xs">Filled</SelectItem>
            <SelectItem value="outlined" className="text-xs">Outlined</SelectItem>
            <SelectItem value="ghost" className="text-xs">Ghost</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

function CountdownSettings({
  content,
  setContent,
}: { content: Record<string, unknown>; setContent: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Target Date & Time">
        <Input
          type="datetime-local"
          value={(content.targetDate as string) ?? ""}
          onChange={(e) => setContent("targetDate", e.target.value)}
          className="h-7 text-xs"
        />
      </Field>
      <Field label="Label">
        <Input
          value={(content.label as string) ?? ""}
          onChange={(e) => setContent("label", e.target.value)}
          className="h-7 text-xs"
          placeholder="Offer ends in:"
        />
      </Field>
    </div>
  );
}

function SpacerSettings({
  content,
  setContent,
}: { content: Record<string, unknown>; setContent: (k: string, v: unknown) => void }) {
  return (
    <Field label="Height (px)">
      <Input
        type="number"
        value={(content.height as number) ?? 32}
        onChange={(e) => setContent("height", Number(e.target.value))}
        className="h-7 text-xs"
        min={8}
        max={200}
        step={8}
      />
    </Field>
  );
}

function HtmlSettings({
  content,
  setContent,
}: { content: Record<string, unknown>; setContent: (k: string, v: unknown) => void }) {
  return (
    <Field label="HTML Code">
      <Textarea
        value={(content.html as string) ?? ""}
        onChange={(e) => setContent("html", e.target.value)}
        className="font-mono text-xs"
        rows={8}
      />
    </Field>
  );
}
