"use client";

import { useState, useCallback, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { updateLandingPageBlocks, setLandingPagePublished } from "@/actions/landing-pages";
import type { LandingBlock, LandingPage, Product } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlockPanel } from "./block-panel";
import { BuilderCanvas } from "./builder-canvas";
import { BlockSettingsPanel } from "./block-settings-panel";

interface Props {
  landingPage: LandingPage;
  availableProducts: Product[];
}

export function LandingPageBuilder({ landingPage, availableProducts }: Props) {
  const [blocks, setBlocks] = useState<LandingBlock[]>(
    landingPage.blocks ?? [],
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(landingPage.is_published);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, startSave] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((prev) => {
      const oldIdx = prev.findIndex((b) => b.id === active.id);
      const newIdx = prev.findIndex((b) => b.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
    setIsDirty(true);
  }

  function addBlock(block: LandingBlock) {
    setBlocks((prev) => [...prev, block]);
    setSelectedBlockId(block.id);
    setIsDirty(true);
  }

  function updateBlock(id: string, updates: Partial<LandingBlock>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );
    setIsDirty(true);
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
    setIsDirty(true);
  }

  function toggleBlockVisibility(id: string) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)),
    );
    setIsDirty(true);
  }

  const handleSave = useCallback(() => {
    startSave(async () => {
      const result = await updateLandingPageBlocks(landingPage.id, blocks);
      if (result.success) {
        setIsDirty(false);
        toast.success("Builder saved!");
      } else {
        toast.error(result.error ?? "Failed to save.");
      }
    });
  }, [blocks, landingPage.id]);

  async function handleTogglePublish() {
    startSave(async () => {
      // Save blocks first
      await updateLandingPageBlocks(landingPage.id, blocks);
      const result = await setLandingPagePublished(landingPage.id, !isPublished);
      if (result.success) {
        setIsPublished((p) => !p);
        setIsDirty(false);
        toast.success(result.message);
      } else {
        toast.error(result.error ?? "Failed.");
      }
    });
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Block panel */}
      <aside className="w-64 shrink-0 overflow-y-auto border-r bg-background">
        <BlockPanel onAddBlock={addBlock} availableProducts={availableProducts} />
      </aside>

      {/* Center: Canvas */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Canvas toolbar */}
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Badge variant={isPublished ? "default" : "secondary"} className="text-xs">
            {isPublished ? "Published" : "Draft"}
          </Badge>
          {isDirty && (
            <span className="text-muted-foreground text-xs">Unsaved changes</span>
          )}
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublish}
              disabled={isSaving}
            >
              {isPublished ? (
                <>
                  <EyeOff className="size-3.5" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="size-3.5" />
                  Publish
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex-1 overflow-y-auto">
              <BuilderCanvas
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                themeConfig={landingPage.theme_config}
                availableProducts={availableProducts}
                onSelectBlock={setSelectedBlockId}
                onRemoveBlock={removeBlock}
                onToggleVisibility={toggleBlockVisibility}
              />
            </div>
          </SortableContext>
        </DndContext>
      </main>

      {/* Right: Block settings */}
      <aside className="w-72 shrink-0 overflow-y-auto border-l bg-background">
        <BlockSettingsPanel
          block={selectedBlock}
          availableProducts={availableProducts}
          onUpdate={updateBlock}
        />
      </aside>
    </div>
  );
}
