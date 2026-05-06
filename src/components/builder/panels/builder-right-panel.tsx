"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Palette,
  Layout,
  Wand2,
  Code2,
  ChevronDown,
} from "lucide-react";
import { useBuilderStore, useSelectedBlock } from "@/stores/builder-store";
import type {
  BlockV2,
  BlockLayout,
  BlockClasses,
  BlockAnimation,
  SpacingSize,
  LayoutWidth,
  AlignType,
  AnimationType,
  AnimationTrigger,
  Application,
} from "@/types/builder";
import type { Product } from "@/types/database";
import { getApplications } from "@/actions/applications";
import { BLOCK_CATALOG } from "@/lib/builder/block-catalog";
import { TW_PADDING_Y, TW_PADDING_X, TW_MAX_WIDTH } from "@/types/builder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BlockContentEditor } from "./block-content-editor";

interface Props {
  availableProducts: Product[];
  landingPageId: string;
}

export function BuilderRightPanel({ availableProducts, landingPageId }: Props) {
  const store = useBuilderStore();
  const selectedBlock = useSelectedBlock();
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    getApplications({ is_active: true }).then((result) => {
      if (result.success) setApps(result.data ?? []);
    });
  }, []);

  if (!selectedBlock) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted">
          <Settings className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No block selected</p>
        <p className="text-xs text-muted-foreground mt-1">
          Click any block on the canvas to edit its settings here.
        </p>
      </div>
    );
  }

  const def = BLOCK_CATALOG.find((d) => d.type === selectedBlock.type);

  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="border-b px-3 py-2.5 flex items-center gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">
            {selectedBlock.label ?? def?.label ?? selectedBlock.type}
          </p>
          <p className="text-muted-foreground text-xs truncate">
            {def?.description ?? selectedBlock.type}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={store.rightPanelTab}
        onValueChange={(v) =>
          store.setRightPanelTab(v as typeof store.rightPanelTab)
        }
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="grid grid-cols-5 rounded-none border-b h-9 px-1 gap-4">
          <TabsTrigger value="content" className="text-sm px-0">
            <Settings className="size-6" />
          </TabsTrigger>
          <TabsTrigger value="style" className="text-sm px-0">
            <Palette className="size-6" />
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-sm px-0">
            <Layout className="size-6" />
          </TabsTrigger>
          <TabsTrigger value="animation" className="text-sm px-0">
            <Wand2 className="size-6" />
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-sm px-0">
            <Code2 className="size-6" />
          </TabsTrigger>
        </TabsList>

        {/* Content tab */}
        <TabsContent value="content" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              <BlockContentEditor
                block={selectedBlock}
                availableProducts={availableProducts}
                availableApps={apps}
                onUpdateProps={(props) =>
                  store.updateBlockProps(selectedBlock.id, props)
                }
              />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Style tab */}
        <TabsContent value="style" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              <StylePanel
                layout={selectedBlock.layout}
                classes={selectedBlock.classes}
                onUpdateLayout={(l) =>
                  store.updateBlockLayout(selectedBlock.id, l)
                }
                onUpdateClasses={(c) =>
                  store.updateBlockClasses(selectedBlock.id, c)
                }
              />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Layout tab */}
        <TabsContent value="layout" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              <LayoutPanel
                layout={selectedBlock.layout}
                onUpdate={(l) => store.updateBlockLayout(selectedBlock.id, l)}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Animation tab */}
        <TabsContent value="animation" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              <AnimationPanel
                animation={selectedBlock.animation}
                onUpdate={(a) =>
                  store.updateBlockAnimation(selectedBlock.id, a)
                }
              />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Advanced tab */}
        <TabsContent value="advanced" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              <AdvancedPanel
                block={selectedBlock}
                onUpdateClasses={(c) =>
                  store.updateBlockClasses(selectedBlock.id, c)
                }
                onUpdateBlock={(u) => store.updateBlock(selectedBlock.id, u)}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Style Panel ───────────────────────────────────────────────
function StylePanel({
  layout,
  classes,
  onUpdateLayout,
  onUpdateClasses,
}: {
  layout: BlockLayout;
  classes: BlockClasses;
  onUpdateLayout: (l: Partial<BlockLayout>) => void;
  onUpdateClasses: (c: Partial<BlockClasses>) => void;
}) {
  return (
    <>
      <Section label="Background">
        <ColorPicker
          label="Background Color"
          value={layout.bgColor ?? ""}
          onChange={(v) => onUpdateLayout({ bgColor: v })}
        />
        <div className="space-y-1.5 mt-2">
          <Label className="text-xs">Background Image URL</Label>
          <Input
            value={layout.bgImage ?? ""}
            onChange={(e) => onUpdateLayout({ bgImage: e.target.value })}
            placeholder="https://..."
            className="h-8 text-xs"
          />
        </div>
        {layout.bgImage && (
          <div className="space-y-1.5 mt-2">
            <Label className="text-xs">Overlay Color (hex + alpha)</Label>
            <Input
              value={layout.bgOverlay ?? ""}
              onChange={(e) => onUpdateLayout({ bgOverlay: e.target.value })}
              placeholder="#00000066"
              className="h-8 text-xs font-mono"
            />
          </div>
        )}
      </Section>

      <Section label="Text">
        <ColorPicker
          label="Text Color"
          value={layout.textColor ?? ""}
          onChange={(v) => onUpdateLayout({ textColor: v })}
        />
      </Section>

      <Section label="Border & Shadow">
        <div className="flex items-center gap-2 mb-2">
          <Switch
            checked={layout.border ?? false}
            onCheckedChange={(v) => onUpdateLayout({ border: v })}
            id="show-border"
          />
          <Label htmlFor="show-border" className="text-xs cursor-pointer">
            Show Border
          </Label>
        </div>
        {layout.border && (
          <ColorPicker
            label="Border Color"
            value={layout.borderColor ?? ""}
            onChange={(v) => onUpdateLayout({ borderColor: v })}
          />
        )}

        <div className="mt-2 space-y-1.5">
          <Label className="text-xs">Shadow</Label>
          <Select
            value={layout.shadow ?? "none"}
            onValueChange={(v) =>
              onUpdateLayout({ shadow: v as BlockLayout["shadow"] })
            }
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {["none", "sm", "md", "lg", "xl"].map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-2 space-y-1.5">
          <Label className="text-xs">Border Radius</Label>
          <Select
            value={layout.borderRadius ?? "none"}
            onValueChange={(v) =>
              onUpdateLayout({ borderRadius: v as BlockLayout["borderRadius"] })
            }
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {["none", "sm", "md", "lg", "xl", "full"].map((r) => (
                <SelectItem key={r} value={r} className="text-xs">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section label="Custom CSS Classes">
        <Label className="text-xs">Wrapper Classes</Label>
        <Input
          value={classes.wrapper ?? ""}
          onChange={(e) => onUpdateClasses({ wrapper: e.target.value })}
          placeholder="e.g. my-custom-class"
          className="h-8 text-xs font-mono mt-1"
        />
      </Section>
    </>
  );
}

// ── Layout Panel ──────────────────────────────────────────────
function LayoutPanel({
  layout,
  onUpdate,
}: {
  layout: BlockLayout;
  onUpdate: (l: Partial<BlockLayout>) => void;
}) {
  const spacings: SpacingSize[] = ["none", "xs", "sm", "md", "lg", "xl", "2xl"];
  const widths: LayoutWidth[] = ["full", "xl", "lg", "md", "sm"];
  const aligns: AlignType[] = ["left", "center", "right"];

  return (
    <>
      <Section label="Spacing">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Vertical Padding</Label>
            <Select
              value={layout.paddingY ?? "md"}
              onValueChange={(v) => onUpdate({ paddingY: v as SpacingSize })}
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                {spacings.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s} ({TW_PADDING_Y[s]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Horizontal Padding</Label>
            <Select
              value={layout.paddingX ?? "md"}
              onValueChange={(v) => onUpdate({ paddingX: v as SpacingSize })}
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                {spacings.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s} ({TW_PADDING_X[s]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section label="Width & Alignment">
        <div className="space-y-1 mb-2">
          <Label className="text-xs">Max Width</Label>
          <Select
            value={layout.maxWidth ?? "lg"}
            onValueChange={(v) => onUpdate({ maxWidth: v as LayoutWidth })}
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {widths.map((w) => (
                <SelectItem key={w} value={w} className="text-xs">
                  {w} ({TW_MAX_WIDTH[w]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Content Alignment</Label>
          <div className="flex gap-1">
            {aligns.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onUpdate({ align: a })}
                className={cn(
                  "flex-1 rounded border py-1.5 text-xs capitalize transition-colors",
                  layout.align === a
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted",
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

// ── Animation Panel ───────────────────────────────────────────
function AnimationPanel({
  animation,
  onUpdate,
}: {
  animation: BlockAnimation;
  onUpdate: (a: Partial<BlockAnimation>) => void;
}) {
  const types: AnimationType[] = [
    "none",
    "fade-in",
    "fade-in-up",
    "fade-in-down",
    "slide-in-left",
    "slide-in-right",
    "zoom-in",
    "bounce-in",
    "flip-in",
    "pulse",
  ];
  const triggers: AnimationTrigger[] = ["load", "scroll", "hover", "click"];

  return (
    <>
      <Section label="Animation">
        <div className="space-y-1 mb-3">
          <Label className="text-xs">Type</Label>
          <Select
            value={animation.type ?? "none"}
            onValueChange={(v) => onUpdate({ type: v as AnimationType })}
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {types.map((t) => (
                <SelectItem key={t} value={t} className="text-xs capitalize">
                  {t.replace(/-/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {animation.type !== "none" && (
          <>
            <div className="space-y-1 mb-3">
              <Label className="text-xs">Trigger</Label>
              <Select
                value={animation.trigger ?? "load"}
                onValueChange={(v) =>
                  onUpdate({ trigger: v as AnimationTrigger })
                }
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {triggers.map((t) => (
                    <SelectItem
                      key={t}
                      value={t}
                      className="text-xs capitalize"
                    >
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 mb-3">
              <Label className="text-xs">
                Duration: {animation.duration ?? 500}ms
              </Label>
              <Slider
                min={100}
                max={2000}
                step={100}
                value={[animation.duration ?? 500]}
                onValueChange={([v]) => onUpdate({ duration: v })}
              />
            </div>

            <div className="space-y-1.5 mb-3">
              <Label className="text-xs">Delay: {animation.delay ?? 0}ms</Label>
              <Slider
                min={0}
                max={2000}
                step={100}
                value={[animation.delay ?? 0]}
                onValueChange={([v]) => onUpdate({ delay: v })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={animation.repeat ?? false}
                onCheckedChange={(v) => onUpdate({ repeat: v })}
                id="anim-repeat"
              />
              <Label htmlFor="anim-repeat" className="text-xs cursor-pointer">
                Repeat animation
              </Label>
            </div>
          </>
        )}
      </Section>
    </>
  );
}

// ── Advanced Panel ────────────────────────────────────────────
function AdvancedPanel({
  block,
  onUpdateClasses,
  onUpdateBlock,
}: {
  block: BlockV2;
  onUpdateClasses: (c: Partial<BlockClasses>) => void;
  onUpdateBlock: (u: Partial<BlockV2>) => void;
}) {
  return (
    <>
      <Section label="Label">
        <Label className="text-xs">Block Label (internal)</Label>
        <Input
          value={block.label ?? ""}
          onChange={(e) =>
            onUpdateBlock({ label: e.target.value || undefined })
          }
          placeholder="e.g. Main Hero"
          className="h-8 text-xs mt-1"
        />
        <p className="text-muted-foreground text-[10px] mt-1">
          Used in Layers panel for identification
        </p>
      </Section>

      <Section label="Custom CSS Classes">
        {(
          [
            "wrapper",
            "inner",
            "heading",
            "text",
            "button",
            "image",
            "card",
          ] as const
        ).map((slot) => (
          <div key={slot} className="space-y-1 mb-2">
            <Label className="text-xs capitalize">{slot} classes</Label>
            <Input
              value={block.classes[slot] ?? ""}
              onChange={(e) => onUpdateClasses({ [slot]: e.target.value })}
              placeholder={`TW classes for ${slot}`}
              className="h-7 text-xs font-mono"
            />
          </div>
        ))}
      </Section>

      <Section label="Block Info">
        <div className="rounded-md bg-muted/50 px-3 py-2 font-mono text-[10px] text-muted-foreground space-y-1">
          <div>ID: {block.id}</div>
          <div>Type: {block.type}</div>
          <div>Visible: {String(block.visible)}</div>
          <div>Locked: {String(block.locked ?? false)}</div>
        </div>
      </Section>
    </>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      {children}
      <Separator className="mt-4" />
    </div>
  );
}
