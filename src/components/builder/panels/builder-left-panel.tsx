"use client";

import { useMemo } from "react";
import { nanoid } from "nanoid";
import { Search, LayoutTemplate, Layers, AppWindow, Plus } from "lucide-react";
import {
  BLOCK_CATALOG,
  CATEGORIES,
  CATEGORY_META,
  getBlocksByCategory,
  searchBlocks,
} from "@/lib/builder/block-catalog";
import { useBuilderStore } from "@/stores/builder-store";
import type { BlockV2, BlockType } from "@/types/builder";
import type { Product } from "@/types/database";
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
import * as Icons from "lucide-react";

interface Props {
  availableProducts: Product[];
  landingPageId: string;
}

export function BuilderLeftPanel({ availableProducts, landingPageId }: Props) {
  const store = useBuilderStore();
  const { leftPanelTab, blockSearch, blocks } = store;

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
        /* Tabs: Blocks / Templates / Layers / Apps */
        <Tabs
          value={leftPanelTab}
          onValueChange={(v) => store.setLeftPanelTab(v as typeof leftPanelTab)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-4 rounded-none border-b h-9 px-2">
            <TabsTrigger value="blocks" className="text-xs gap-1">
              <LayoutTemplate className="size-3" />
              Blocks
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs gap-1">
              <LayoutTemplate className="size-3" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="layers" className="text-xs gap-1">
              <Layers className="size-3" />
              Layers
            </TabsTrigger>
            <TabsTrigger value="apps" className="text-xs gap-1">
              <AppWindow className="size-3" />
              Apps
            </TabsTrigger>
          </TabsList>

          {/* Blocks tab */}
          <TabsContent value="blocks" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-3">
                {CATEGORIES.map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const catBlocks = getBlocksByCategory(cat);
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

          {/* Templates tab */}
          <TabsContent value="templates" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <TemplatesPanel landingPageId={landingPageId} />
            </ScrollArea>
          </TabsContent>

          {/* Layers tab */}
          <TabsContent value="layers" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <LayersPanel blocks={blocks} />
            </ScrollArea>
          </TabsContent>

          {/* Apps tab */}
          <TabsContent value="apps" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <AppsPanel landingPageId={landingPageId} />
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

function TemplatesPanel({ landingPageId }: { landingPageId: string }) {
  const STARTER_TEMPLATES = [
    {
      id: "linkbio",
      name: "Link Bio",
      desc: "Linktree-style profile page",
      emoji: "🔗",
    },
    {
      id: "ecommerce",
      name: "E-Commerce",
      desc: "Shopify-style product page",
      emoji: "🛒",
    },
    {
      id: "sales",
      name: "Sales Page",
      desc: "High-converting landing page",
      emoji: "🚀",
    },
  ];

  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Starter Templates
      </p>
      {STARTER_TEMPLATES.map((tmpl) => (
        <button
          key={tmpl.id}
          type="button"
          className="w-full flex items-start gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
          onClick={() => {
            // TODO Sprint G: load template blocks into canvas
          }}
        >
          <span className="text-2xl">{tmpl.emoji}</span>
          <div>
            <p className="text-sm font-medium">{tmpl.name}</p>
            <p className="text-xs text-muted-foreground">{tmpl.desc}</p>
          </div>
        </button>
      ))}
      <p className="text-xs text-muted-foreground italic text-center pt-2">
        More templates coming soon.
      </p>
    </div>
  );
}

function AppsPanel({ landingPageId }: { landingPageId: string }) {
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Applications
        </p>
        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" asChild>
          <a
            href="/dashboard/applications"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Plus className="size-3" />
            Add
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Apps are integrations like WhatsApp Rotator, Payment Methods, and
        Scripts. Create them in the Applications dashboard and assign them to
        blocks here.
      </p>
      <Button variant="outline" size="sm" className="w-full text-xs" asChild>
        <a
          href="/dashboard/applications"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AppWindow className="size-3.5" />
          Manage Applications
        </a>
      </Button>
    </div>
  );
}
