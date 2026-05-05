"use client";

import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Settings,
  Plus,
  Layers,
} from "lucide-react";
import { BLOCK_CATALOG } from "@/lib/builder/block-catalog";
import { useBuilderStore } from "@/stores/builder-store";
import { buildBlockClasses } from "@/types/builder";
import type { BlockV2, BlockType } from "@/types/builder";
import type { Product } from "@/types/database";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// Block preview renderers (one per block type)
import { BlockPreviewRenderer } from "./block-preview-renderer";

interface Props {
  previewDevice: "mobile" | "desktop";
  availableProducts: Product[];
}

const DEVICE_MAX_WIDTH = {
  mobile: "390px",
  desktop: "100%",
};

export function BuilderCanvas({ previewDevice, availableProducts }: Props) {
  const store = useBuilderStore();
  const { blocks, selectedBlockId } = store;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const fromIdx = blocks.findIndex((b) => b.id === active.id);
      const toIdx = blocks.findIndex((b) => b.id === over.id);
      if (fromIdx >= 0 && toIdx >= 0) {
        store.moveBlock(fromIdx, toIdx);
      }
    },
    [blocks, store],
  );

  // Click on canvas bg → deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) store.selectBlock(null);
    },
    [store],
  );

  if (blocks.length === 0) {
    return (
      <div
        className="flex h-full items-center justify-center p-8"
        onClick={handleCanvasClick}
      >
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border-2 border-dashed bg-background">
            <Layers className="size-7 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold mb-1">Canvas is empty</h3>
          <p className="text-muted-foreground text-sm">
            Click any block from the left panel to add it here. Blocks stack
            vertically and can be reordered by dragging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div
        className="min-h-full py-6 px-4 flex flex-col items-center"
        onClick={handleCanvasClick}
      >
        {/* Device frame */}
        <div
          className="w-full transition-all duration-200"
          style={{ maxWidth: DEVICE_MAX_WIDTH[previewDevice] }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    availableProducts={availableProducts}
                    onSelect={() => store.selectBlock(block.id)}
                    onDuplicate={() => store.duplicateBlock(block.id)}
                    onRemove={() => store.removeBlock(block.id)}
                    onToggleVisibility={() => store.toggleVisibility(block.id)}
                    onToggleLock={() => store.toggleLock(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add block button at bottom */}
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
            onClick={() => store.setLeftPanelTab("blocks")}
          >
            <Plus className="size-4" />
            Add Block
          </button>
        </div>
      </div>
    </ScrollArea>
  );
}

// ── Sortable Block Item ───────────────────────────────────────
interface SortableBlockProps {
  block: BlockV2;
  isSelected: boolean;
  availableProducts: Product[];
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
}

function SortableBlock({
  block,
  isSelected,
  availableProducts,
  onSelect,
  onDuplicate,
  onRemove,
  onToggleVisibility,
  onToggleLock,
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled: block.locked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const def = BLOCK_CATALOG.find((d) => d.type === block.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border-2 transition-all",
        isSelected
          ? "border-primary shadow-sm shadow-primary/10"
          : "border-transparent hover:border-border",
        isDragging && "opacity-50 shadow-xl z-50",
        !block.visible && "opacity-50",
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Block toolbar — show on hover/select */}
      <div
        className={cn(
          "absolute -top-px left-0 right-0 flex items-center justify-between px-2 py-1 rounded-t-lg text-xs transition-all z-10 pointer-events-none",
          "bg-primary text-primary-foreground",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
        style={{ transform: "translateY(-100%)", top: 0 }}
      >
        {/* Left: drag + label */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {!block.locked && (
            <button
              type="button"
              className="cursor-grab active:cursor-grabbing touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-3.5" />
            </button>
          )}
          <span className="font-medium">
            {block.label ?? def?.label ?? block.type}
          </span>
          {block.locked && <Lock className="size-3" />}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-0.5 pointer-events-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="p-1 rounded hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility();
                }}
              >
                {block.visible ? (
                  <Eye className="size-3" />
                ) : (
                  <EyeOff className="size-3" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>{block.visible ? "Hide" : "Show"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="p-1 rounded hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock();
                }}
              >
                {block.locked ? (
                  <Unlock className="size-3" />
                ) : (
                  <Lock className="size-3" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>{block.locked ? "Unlock" : "Lock"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="p-1 rounded hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
              >
                <Copy className="size-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
          {!block.locked && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-red-500/80 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <Trash2 className="size-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Block content preview */}
      <div
        className={cn("overflow-hidden rounded-lg", buildBlockClasses(block))}
      >
        <BlockPreviewRenderer
          block={block}
          availableProducts={availableProducts}
          isSelected={isSelected}
        />
      </div>

      {/* Selected indicator border */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-primary ring-offset-1 pointer-events-none" />
      )}
    </div>
  );
}
