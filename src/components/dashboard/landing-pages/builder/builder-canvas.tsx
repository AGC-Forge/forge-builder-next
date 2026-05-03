"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LandingBlock, ThemeConfig, Product } from "@/types/database";

import { Button } from "@/components/ui/button";

interface CanvasProps {
  blocks: LandingBlock[];
  selectedBlockId: string | null;
  themeConfig: ThemeConfig;
  availableProducts: Product[];
  onSelectBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

export function BuilderCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onRemoveBlock,
  onToggleVisibility,
}: CanvasProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border bg-muted">
            <ChevronRight className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">No blocks yet</p>
          <p className="text-muted-foreground text-xs">
            Add blocks from the left panel to start building.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-1 p-4">
      {blocks.map((block) => (
        <SortableBlockItem
          key={block.id}
          block={block}
          isSelected={block.id === selectedBlockId}
          onSelect={() => onSelectBlock(block.id)}
          onRemove={() => onRemoveBlock(block.id)}
          onToggleVisibility={() => onToggleVisibility(block.id)}
        />
      ))}
    </div>
  );
}

interface ItemProps {
  block: LandingBlock;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
}

function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onRemove,
  onToggleVisibility,
}: ItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const BLOCK_LABELS: Record<string, string> = {
    hero: "Hero Section",
    "product-single": "Product Card",
    "product-grid": "Product Grid",
    "product-list": "Product List",
    text: "Text Block",
    image: "Image",
    "cta-button": "CTA Button",
    "social-links": "Social Links",
    divider: "Divider",
    countdown: "Countdown Timer",
    testimonials: "Testimonials",
    faq: "FAQ",
    "custom-html": "Custom HTML",
    spacer: "Spacer",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-lg border bg-card p-3 transition-all",
        isSelected && "border-primary ring-2 ring-primary ring-offset-1",
        isDragging && "opacity-50",
        !block.visible && "opacity-60",
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        type="button"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Block info */}
      <button
        type="button"
        className="flex-1 text-left"
        onClick={onSelect}
      >
        <p className="font-medium text-sm">
          {BLOCK_LABELS[block.type] ?? block.type}
        </p>
        <p className="text-muted-foreground text-xs capitalize">
          {block.type}
        </p>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onToggleVisibility}
          title={block.visible ? "Hide block" : "Show block"}
        >
          {block.visible ? (
            <Eye className="size-3.5" />
          ) : (
            <EyeOff className="size-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          onClick={onRemove}
          title="Remove block"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
