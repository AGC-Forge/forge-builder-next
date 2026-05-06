"use client";

import { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import {
  BLOCK_CATALOG,
  CATEGORIES,
  CATEGORY_META,
  getBlocksByCategory,
  searchBlocks,
} from "@/lib/builder/block-catalog";
import {
  STARTER_TEMPLATES,
  loadTemplate,
} from "@/lib/builder/starter-templates";
import { useBuilderStore } from "@/stores/builder-store";
import type { BlockV2, BlockType, Application, AppType } from "@/types/builder";
import type { Product } from "@/types/database";
import { getApplications } from "@/actions/applications";
import { DEFAULT_LAYOUT, DEFAULT_ANIMATION } from "@/types/builder";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  LayoutTemplate,
  Layers,
  AppWindow,
  Plus,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
import * as Icons from "lucide-react";

interface Props {
  availableProducts: Product[];
  landingPageId: string;
}

const APP_TYPE_META: Record<AppType, { label: string; emoji: string }> = {
  wa_rotator: { label: "WA Rotator", emoji: "💬" },
  tracking: { label: "Tracking", emoji: "📊" },
  payment_method: { label: "Payment", emoji: "💳" },
  wa_template: { label: "WA Template", emoji: "📝" },
  email_template: { label: "Email Template", emoji: "📧" },
  email_notification: { label: "Email Notif", emoji: "🔔" },
  logistic_kurir: { label: "Kurir", emoji: "🚚" },
  pricing_item: { label: "Pricing", emoji: "💰" },
  custom_script: { label: "Script", emoji: "⚙️" },
  openrouter_ai: { label: "AI Config", emoji: "🤖" },
};

const BLOCK_APP_INTEGRATION: Partial<Record<BlockType, AppType[]>> = {
  "block-button": ["wa_rotator", "wa_template", "tracking"],
  "block-button-group": ["wa_rotator", "tracking"],
  "block-float-button": ["wa_rotator", "wa_template"],
  "block-chat-bot": ["wa_rotator", "wa_template", "openrouter_ai"],
  "block-contact": ["wa_rotator", "email_notification"],
  "block-checkout": ["payment_method", "logistic_kurir", "email_notification"],
  "block-payment-list": ["payment_method"],
  "block-pricing": ["pricing_item"],
  "block-custom-script": ["custom_script"],
  "block-form": ["email_notification"],
  "block-fake-notification": [],
  "block-hero": ["tracking"],
};

export function BuilderLeftPanel({ availableProducts, landingPageId }: Props) {
  const store = useBuilderStore();
  const { leftPanelTab, blockSearch, blocks } = store;
  const [apps, setApps] = useState<Application[]>([]);
  const [appsLoaded, setAppsLoaded] = useState(false);

  useEffect(() => {
    getApplications({ is_active: true }).then((result) => {
      if (result.success) setApps(result.data ?? []);
      setAppsLoaded(true);
    });
  }, []);

  const filteredBlocks = useMemo(
    () => (blockSearch ? searchBlocks(blockSearch) : null),
    [blockSearch],
  );
  function addBlock(type: BlockType) {
    const def = BLOCK_CATALOG.find((b) => b.type === type);
    if (!def) return;

    const block: BlockV2 = {
      id: nanoid(10),
      type,
      visible: true,
      label: def.label,
      locked: false,
      props: { ...def.defaultProps },
      layout: { ...DEFAULT_LAYOUT, ...def.defaultLayout },
      classes: { ...(def.defaultClasses ?? {}) },
      animation: { ...DEFAULT_ANIMATION, ...(def.defaultAnimation ?? {}) },
    };

    store.addBlock(block);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b px-3 py-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={blockSearch}
            onChange={(e) => store.setBlockSearch(e.target.value)}
            placeholder="Search blocks..."
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Search results */}
      {blockSearch && filteredBlocks ? (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredBlocks.length === 0 ? (
              <p className="text-center text-muted-foreground text-xs py-6">
                No blocks found
              </p>
            ) : (
              filteredBlocks.map((def) => (
                <BlockButton
                  key={def.type}
                  def={def}
                  onAdd={() => addBlock(def.type)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      ) : (
        <Tabs
          value={leftPanelTab}
          onValueChange={(v) => store.setLeftPanelTab(v as typeof leftPanelTab)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-4 rounded-none border-b h-9 px-2">
            <TabsTrigger value="blocks" className="text-xs gap-1">
              <LayoutTemplate className="size-3" /> Blocks
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs gap-1">
              <LayoutTemplate className="size-3" /> Templates
            </TabsTrigger>
            <TabsTrigger value="layers" className="text-xs gap-1">
              <Layers className="size-3" /> Layers
            </TabsTrigger>
            <TabsTrigger value="apps" className="text-xs gap-1">
              <AppWindow className="size-3" />
              Apps
              {apps.length > 0 && (
                <Badge className="ml-0.5 h-4 px-1 text-[9px]">
                  {apps.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Blocks tab */}
          <TabsContent value="blocks" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-3">
                {CATEGORIES.map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const catBlocks = BLOCK_CATALOG.filter(
                    (b) => b.category === cat,
                  );
                  return (
                    <div key={cat}>
                      <p
                        className={cn(
                          "px-1 mb-1.5 text-xs font-semibold uppercase tracking-wider",
                          meta.color,
                        )}
                      >
                        {meta.label}
                      </p>
                      <div className="space-y-0.5">
                        {catBlocks.map((def) => (
                          <BlockButton
                            key={def.type}
                            def={def}
                            onAdd={() => addBlock(def.type)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Templates tab — FIXED ─────────────────────────── */}
          <TabsContent value="templates" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <TemplatesPanel />
            </ScrollArea>
          </TabsContent>

          {/* Layers tab */}
          <TabsContent value="layers" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <LayersPanel blocks={blocks} />
            </ScrollArea>
          </TabsContent>

          {/* Apps tab — FIXED ─────────────────────────────── */}
          <TabsContent value="apps" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <AppsPanel
                apps={apps}
                loaded={appsLoaded}
                landingPageId={landingPageId}
                blocks={blocks}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function BlockButton({
  def,
  onAdd,
}: {
  def: (typeof BLOCK_CATALOG)[0];
  onAdd: () => void;
}) {
  const IconComponent =
    (Icons as unknown as Record<string, React.ElementType>)[def.icon] ??
    Icons.Box;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onAdd}
          className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted transition-colors"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background">
            <IconComponent className="size-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{def.label}</p>
          </div>
          {def.planRequired && (
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 h-4 shrink-0 uppercase"
            >
              {def.planRequired}
            </Badge>
          )}
          <Plus className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-45 text-xs">
        {def.description}
      </TooltipContent>
    </Tooltip>
  );
}

function LayersPanel({ blocks }: { blocks: BlockV2[] }) {
  const store = useBuilderStore();

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <Layers className="size-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs text-muted-foreground">
          No blocks yet. Add blocks from the Blocks tab.
        </p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-0.5">
      {blocks.map((block, i) => {
        const def = BLOCK_CATALOG.find((d) => d.type === block.type);
        const IconComponent = def
          ? ((Icons as unknown as Record<string, React.ElementType>)[
              def.icon
            ] ?? Icons.Box)
          : Icons.Box;
        const isSelected = store.selectedBlockId === block.id;

        return (
          <button
            key={block.id}
            type="button"
            onClick={() => store.selectBlock(block.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
              isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted",
              !block.visible && "opacity-50",
            )}
          >
            <span className="text-muted-foreground w-5 text-[10px] shrink-0">
              {i + 1}
            </span>
            <IconComponent className="size-3.5 shrink-0" />
            <span className="flex-1 truncate">
              {block.label ?? def?.label ?? block.type}
            </span>
            {block.locked && (
              <Icons.Lock className="size-3 text-muted-foreground shrink-0" />
            )}
            {!block.visible && (
              <Icons.EyeOff className="size-3 text-muted-foreground shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function TemplatesPanel() {
  const store = useBuilderStore();
  const [loading, setLoading] = useState<string | null>(null);

  function handleLoad(templateId: string) {
    if (store.blocks.length > 0) {
      const confirmed = window.confirm(
        "Loading a template will replace your current blocks. Continue?",
      );
      if (!confirmed) return;
    }

    setLoading(templateId);
    try {
      const blocks = loadTemplate(templateId);
      if (!blocks.length) {
        toast.error("Template not found.");
        return;
      }
      store.pushHistory("Load template");
      store.setBlocks(blocks);
      store.setLeftPanelTab("layers");
      toast.success("Template loaded! Customize it in the canvas.");
    } catch {
      toast.error("Failed to load template.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-3 space-y-3">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Starter Templates
        </p>
        <p className="text-[10px] text-muted-foreground">
          ⚠️ Loading a template replaces all current blocks.
        </p>
      </div>

      {STARTER_TEMPLATES.map((tmpl) => (
        <button
          key={tmpl.id}
          type="button"
          disabled={loading === tmpl.id}
          onClick={() => handleLoad(tmpl.id)}
          className="w-full flex items-start gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 hover:border-primary/30 transition-all disabled:opacity-50"
        >
          <span className="text-2xl shrink-0">{tmpl.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{tmpl.name}</p>
            <p className="text-xs text-muted-foreground">{tmpl.description}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              {tmpl.blocks.length} blocks
            </p>
          </div>
          {loading === tmpl.id ? (
            <Icons.Loader2 className="size-4 text-primary animate-spin shrink-0 mt-0.5" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          )}
        </button>
      ))}

      <p className="text-xs text-muted-foreground italic text-center pt-2">
        More templates coming soon.
      </p>
    </div>
  );
}

function AppsPanel({
  apps,
  loaded,
  landingPageId,
  blocks,
}: {
  apps: Application[];
  loaded: boolean;
  landingPageId: string;
  blocks: BlockV2[];
}) {
  const store = useBuilderStore();
  const selectedBlock = blocks.find((b) => b.id === store.selectedBlockId);

  // What app types can the selected block use?
  const compatibleAppTypes = selectedBlock
    ? (BLOCK_APP_INTEGRATION[selectedBlock.type as BlockType] ?? [])
    : [];

  const compatibleApps = apps.filter((a) =>
    compatibleAppTypes.includes(a.app_type as AppType),
  );

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="p-3 space-y-3">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AppWindow className="size-9 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-medium">No applications yet</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Create integrations in the Applications dashboard to use in blocks.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs gap-1"
          asChild
        >
          <a
            href="/dashboard/applications"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Plus className="size-3" /> Create Applications
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      {/* Selected block integrations */}
      {selectedBlock && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Integrations for:{" "}
            <span className="text-foreground capitalize">
              {selectedBlock.label ?? selectedBlock.type}
            </span>
          </p>

          {compatibleApps.length === 0 ? (
            <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-center">
              <p className="text-xs text-muted-foreground">
                {compatibleAppTypes.length === 0
                  ? "This block doesn't use applications."
                  : `No ${compatibleAppTypes.map((t) => APP_TYPE_META[t]?.label).join(", ")} apps found.`}
              </p>
              {compatibleAppTypes.length > 0 && (
                <a
                  href="/dashboard/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  Create compatible app →
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {compatibleApps.map((app) => {
                const meta = APP_TYPE_META[app.app_type as AppType];
                // Find the prop key for this app type in the selected block
                const propKey = getPropKeyForAppType(
                  selectedBlock.type as BlockType,
                  app.app_type as AppType,
                );
                const isAssigned =
                  propKey && selectedBlock.props[propKey] === app.id;

                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      if (!propKey) return;
                      // Toggle assign/unassign
                      const newVal = isAssigned ? null : app.id;
                      store.updateBlockProps(selectedBlock.id, {
                        [propKey]: newVal,
                      });
                      toast.success(
                        isAssigned
                          ? "App unassigned."
                          : `${app.name} assigned!`,
                      );
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-lg border p-2.5 text-left text-xs transition-all",
                      isAssigned
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/30 hover:bg-muted/50",
                      !propKey && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={!propKey}
                  >
                    <span className="text-base shrink-0">
                      {meta?.emoji ?? "🔌"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{app.name}</p>
                      <p className="text-muted-foreground">{meta?.label}</p>
                    </div>
                    {isAssigned && (
                      <Check className="size-4 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!selectedBlock && (
        <div className="rounded-lg bg-muted/50 px-3 py-3 flex items-start gap-2">
          <AlertCircle className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Select a block on the canvas to see available app integrations for
            it.
          </p>
        </div>
      )}

      {/* All apps list */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          All Applications
        </p>
        <div className="space-y-1.5">
          {apps.map((app) => {
            const meta = APP_TYPE_META[app.app_type as AppType];
            return (
              <div
                key={app.id}
                className="flex items-center gap-2.5 rounded-lg border px-2.5 py-2"
              >
                <span className="text-sm shrink-0">{meta?.emoji ?? "🔌"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{app.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {meta?.label}
                  </p>
                </div>
                <div
                  className="size-2 rounded-full bg-green-500 shrink-0"
                  title="Active"
                />
              </div>
            );
          })}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs gap-1"
        asChild
      >
        <a
          href="/dashboard/applications"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Plus className="size-3" /> Manage Applications
        </a>
      </Button>
    </div>
  );
}

function getPropKeyForAppType(
  blockType: BlockType,
  appType: AppType,
): string | null {
  const mapping: Partial<Record<BlockType, Partial<Record<AppType, string>>>> =
    {
      "block-button": {
        wa_rotator: "waRotatorId",
        wa_template: "waTemplateId",
      },
      "block-button-group": { wa_rotator: "waRotatorId" },
      "block-float-button": {
        wa_rotator: "waRotatorId",
        wa_template: "waTemplateId",
      },
      "block-chat-bot": {
        wa_rotator: "waRotatorId",
        wa_template: "waTemplateId",
        openrouter_ai: "aiConfigId",
      },
      "block-contact": {
        wa_rotator: "waRotatorId",
        email_notification: "emailNotifId",
      },
      "block-checkout": {
        payment_method: "paymentMethodId",
        logistic_kurir: "logisticId",
        email_notification: "emailNotifId",
      },
      "block-payment-list": { payment_method: "paymentMethodId" },
      "block-pricing": { pricing_item: "pricingItemId" },
      "block-custom-script": { custom_script: "scriptId" },
      "block-form": { email_notification: "emailNotifId" },
    };

  return mapping[blockType]?.[appType] ?? null;
}
