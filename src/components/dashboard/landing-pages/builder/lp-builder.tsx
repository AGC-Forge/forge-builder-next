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
import {
  Eye,
  EyeOff,
  Loader2,
  Save,
  Monitor,
  Smartphone,
  PanelRight,
  PanelRightClose,
} from "lucide-react";
import {
  updateLandingPageBlocks,
  setLandingPagePublished,
} from "@/actions/landing-pages";
import type { LandingBlock, LandingPage, Product } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BlockPanel } from "./block-panel";
import { BuilderCanvas } from "./builder-canvas";
import { BlockSettingsPanel } from "./block-settings-panel";

interface Props {
  landingPage: LandingPage;
  availableProducts: Product[];
}

type PreviewDevice = "mobile" | "desktop";

export function LandingPageBuilder({ landingPage, availableProducts }: Props) {
  const [blocks, setBlocks] = useState<LandingBlock[]>(
    landingPage.blocks ?? [],
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(landingPage.is_published);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, startSave] = useTransition();

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("mobile");
  const [previewKey, setPreviewKey] = useState(0); // force iframe refresh on save

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
        setPreviewKey((k) => k + 1); // refresh iframe after save
        toast.success("Builder saved!");
      } else {
        toast.error(result.error ?? "Failed to save.");
      }
    });
  }, [blocks, landingPage.id]);

  async function handleTogglePublish() {
    startSave(async () => {
      await updateLandingPageBlocks(landingPage.id, blocks);
      const result = await setLandingPagePublished(
        landingPage.id,
        !isPublished,
      );
      if (result.success) {
        setIsPublished((p) => !p);
        setIsDirty(false);
        setPreviewKey((k) => k + 1);
        toast.success(result.message);
      } else {
        toast.error(result.error ?? "Failed.");
      }
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const previewUrl = `${siteUrl}/${landingPage.slug}`;

  const DEVICE_WIDTHS: Record<PreviewDevice, string> = {
    mobile: "390px",
    desktop: "100%",
  };

  return (
    <TooltipProvider>
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Block panel ── */}
        <aside className="w-64 shrink-0 overflow-y-auto border-r bg-background">
          <BlockPanel
            onAddBlock={addBlock}
            availableProducts={availableProducts}
          />
        </aside>

        {/* ── Center: Canvas + toolbar ── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Canvas toolbar */}
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <Badge
              variant={isPublished ? "default" : "secondary"}
              className="text-xs"
            >
              {isPublished ? "Published" : "Draft"}
            </Badge>
            {isDirty && (
              <span className="text-muted-foreground text-xs">
                Unsaved changes
              </span>
            )}

            <div className="ml-auto flex items-center gap-1.5">
              {/* Preview toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showPreview ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setShowPreview((v) => !v)}
                    className="gap-1.5"
                  >
                    {showPreview ? (
                      <PanelRightClose className="size-3.5" />
                    ) : (
                      <PanelRight className="size-3.5" />
                    )}
                    Preview
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle live preview panel</TooltipContent>
              </Tooltip>

              {/* Device selector — only when preview is open */}
              {showPreview && (
                <div className="flex rounded-md border">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          previewDevice === "mobile" ? "secondary" : "ghost"
                        }
                        size="sm"
                        onClick={() => setPreviewDevice("mobile")}
                        className="rounded-r-none border-r px-2"
                      >
                        <Smartphone className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mobile preview</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          previewDevice === "desktop" ? "secondary" : "ghost"
                        }
                        size="sm"
                        onClick={() => setPreviewDevice("desktop")}
                        className="rounded-l-none px-2"
                      >
                        <Monitor className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Desktop preview</TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Publish/Unpublish */}
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

              {/* Save */}
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

          {/* Canvas area */}
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

        {/* ── Right: Settings panel ── */}
        <aside className="w-72 shrink-0 overflow-y-auto border-l bg-background">
          <BlockSettingsPanel
            block={selectedBlock}
            availableProducts={availableProducts}
            onUpdate={updateBlock}
          />
        </aside>

        {/* ── Far right: Live Preview panel ── */}
        {showPreview && (
          <aside
            className="flex shrink-0 flex-col border-l bg-muted/30"
            style={{
              width: previewDevice === "mobile" ? "440px" : "600px",
              minWidth: previewDevice === "mobile" ? "440px" : "480px",
            }}
          >
            {/* Preview header */}
            <div className="flex items-center justify-between border-b bg-background px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                Live Preview
              </p>
              {isDirty && (
                <p className="text-xs text-amber-500">
                  Save to refresh preview
                </p>
              )}
            </div>

            {/* Device frame */}
            <div className="flex flex-1 items-start justify-center overflow-auto p-4">
              <div
                className="overflow-hidden rounded-2xl border-2 border-border shadow-xl bg-white"
                style={{
                  width: DEVICE_WIDTHS[previewDevice],
                  maxWidth: "100%",
                  height: previewDevice === "mobile" ? "780px" : "600px",
                  position: "relative",
                }}
              >
                {isPublished ? (
                  <iframe
                    key={previewKey}
                    src={previewUrl}
                    className="h-full w-full border-0"
                    title="Landing page preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                    <EyeOff className="size-10 text-muted-foreground/40" />
                    <div>
                      <p className="font-medium text-sm">
                        Page is not published
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Publish the page to see a live preview.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleTogglePublish}
                      disabled={isSaving}
                    >
                      <Eye className="size-3.5" />
                      Publish & Preview
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Preview footer link */}
            {isPublished && (
              <div className="border-t bg-background px-3 py-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline truncate block"
                >
                  {previewUrl}
                </a>
              </div>
            )}
          </aside>
        )}
      </div>
    </TooltipProvider>
  );
}
