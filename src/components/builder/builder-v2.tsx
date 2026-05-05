"use client";

import { useEffect, useCallback, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  Undo2,
  Redo2,
  Monitor,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ArrowLeft,
  Globe,
  GlobeOff,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  updateLandingPageBlocks,
  setLandingPagePublished,
} from "@/actions/landing-pages";
import { getBlockDef } from "@/lib/builder/block-catalog";
import { useBuilderStore } from "@/stores/builder-store";
import type { BlockV2, BlockType } from "@/types/builder";
import type { LandingPage, Product } from "@/types/database";
import { DEFAULT_LAYOUT, DEFAULT_ANIMATION } from "@/types/builder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BuilderLeftPanel } from "./panels/builder-left-panel";
import { BuilderCanvas } from "./canvas/builder-canvas";
import { BuilderRightPanel } from "./panels/builder-right-panel";
import { BuilderPreviewPanel } from "./panels/builder-preview-panel";

interface Props {
  landingPage: LandingPage;
  availableProducts: Product[];
  appUrl: string;
}

const AUTO_SAVE_DELAY = 3000;

export function BuilderV2({ landingPage, availableProducts, appUrl }: Props) {
  const router = useRouter();
  const [isSavingTransition, startSave] = useTransition();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const store = useBuilderStore();

  // ── Init store with LP data ───────────────────────────────
  useEffect(() => {
    // Convert V1 blocks to V2 format if needed, or use as-is if already V2
    const initialBlocks = migrateBlocksToV2(landingPage.blocks ?? []);

    useBuilderStore.setState({
      landingPageId: landingPage.id,
      blocks: initialBlocks,
      isPublished: landingPage.is_published,
      isDirty: false,
      history: [
        { blocks: initialBlocks, timestamp: Date.now(), label: "Initial" },
      ],
      historyIndex: 0,
    });
  }, [landingPage.id]); // eslint-disable-line

  const handleSave = useCallback(
    (silent = false) => {
      startSave(async () => {
        store.setIsSaving(true);
        const result = await updateLandingPageBlocks(
          landingPage.id,
          store.blocks as any,
        );
        store.setIsSaving(false);
        if (result.success) {
          store.setIsDirty(false);
          if (!silent) toast.success("Saved!");
        } else {
          toast.error(result.error ?? "Failed to save.");
        }
      });
    },
    [store.blocks, landingPage.id], // eslint-disable-line
  );

  useEffect(() => {
    if (!store.isDirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave(true); // silent auto-save
    }, AUTO_SAVE_DELAY);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [store.blocks, store.isDirty]); // eslint-disable-line

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (store.canUndo()) store.undo();
      }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        if (store.canRedo()) store.redo();
      }
      if (e.key === "s") {
        e.preventDefault();
        handleSave(false);
      }
      if (e.key === "d" && store.selectedBlockId) {
        e.preventDefault();
        store.duplicateBlock(store.selectedBlockId);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [store.selectedBlockId, store.canUndo, store.canRedo]); // eslint-disable-line

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (store.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [store.isDirty]);

  const handleTogglePublish = useCallback(() => {
    startSave(async () => {
      store.setIsSaving(true);
      // Always save first
      await updateLandingPageBlocks(landingPage.id, store.blocks as any);
      const result = await setLandingPagePublished(
        landingPage.id,
        !store.isPublished,
      );
      store.setIsSaving(false);
      if (result.success) {
        store.setIsPublished(!store.isPublished);
        store.setIsDirty(false);
        toast.success(result.message ?? "Status updated.");
      } else {
        toast.error(result.error ?? "Failed.");
      }
    });
  }, [store.isPublished, store.blocks, landingPage.id]); // eslint-disable-line

  const isSaving = isSavingTransition || store.isSaving;
  const previewUrl = `${appUrl}/${landingPage.slug}`;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
        {/* ── TOP TOOLBAR ── */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-3 z-50">
          {/* Left: back + title */}
          <div className="flex items-center gap-2 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() =>
                    router.push(`/dashboard/landing-page/${landingPage.id}`)
                  }
                >
                  <ArrowLeft className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to dashboard</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-medium text-sm truncate max-w-40">
                {landingPage.title}
              </span>
              <Badge
                variant="outline"
                className="font-mono text-xs px-1.5 hidden sm:flex shrink-0"
              >
                /{landingPage.slug}
              </Badge>
              {store.isDirty && (
                <span className="text-muted-foreground text-xs shrink-0">
                  · Unsaved
                </span>
              )}
            </div>
          </div>

          {/* Center: undo/redo + device preview */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={!store.canUndo()}
                  onClick={() => store.undo()}
                >
                  <Undo2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Cmd+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={!store.canRedo()}
                  onClick={() => store.redo()}
                >
                  <Redo2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Cmd+Shift+Z)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <div className="flex rounded-md border overflow-hidden">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      store.previewDevice === "mobile" ? "secondary" : "ghost"
                    }
                    size="icon"
                    className="size-8 rounded-none border-r"
                    onClick={() => store.setPreviewDevice("mobile")}
                  >
                    <Smartphone className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mobile view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      store.previewDevice === "desktop" ? "secondary" : "ghost"
                    }
                    size="icon"
                    className="size-8 rounded-none"
                    onClick={() => store.setPreviewDevice("desktop")}
                  >
                    <Monitor className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Desktop view</TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={store.showPreview ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5 ml-1"
                  onClick={() => store.togglePreview()}
                >
                  {store.showPreview ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle preview panel</TooltipContent>
            </Tooltip>
          </div>

          {/* Right: publish + save + link */}
          <div className="flex items-center gap-2">
            {store.isPublished && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    asChild
                  >
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open live page</TooltipContent>
              </Tooltip>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublish}
              disabled={isSaving}
              className="gap-1.5"
            >
              {store.isPublished ? (
                <>
                  <GlobeOff className="size-3.5" /> Unpublish
                </>
              ) : (
                <>
                  <Globe className="size-3.5" /> Publish
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving || !store.isDirty}
              className="gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save
            </Button>
          </div>
        </header>

        {/* ── MAIN AREA ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel */}
          <aside
            className={cn(
              "shrink-0 border-r bg-background transition-all duration-200 overflow-hidden flex flex-col",
              store.isLeftPanelCollapsed ? "w-0" : "w-72",
            )}
          >
            <BuilderLeftPanel
              availableProducts={availableProducts}
              landingPageId={landingPage.id}
            />
          </aside>

          {/* Left panel collapse toggle */}
          <button
            type="button"
            onClick={() => store.toggleLeftPanel()}
            className="flex w-3 shrink-0 items-center justify-center border-r bg-muted/50 hover:bg-muted transition-colors group"
          >
            {store.isLeftPanelCollapsed ? (
              <ChevronRight className="size-3 text-muted-foreground group-hover:text-foreground" />
            ) : (
              <ChevronLeft className="size-3 text-muted-foreground group-hover:text-foreground" />
            )}
          </button>

          {/* Canvas */}
          <main className="flex flex-1 flex-col overflow-hidden bg-muted/30">
            <BuilderCanvas
              previewDevice={store.previewDevice}
              availableProducts={availableProducts}
            />
          </main>

          {/* Right Panel */}
          <aside className="w-72 shrink-0 border-l bg-background flex flex-col overflow-hidden">
            <BuilderRightPanel
              availableProducts={availableProducts}
              landingPageId={landingPage.id}
            />
          </aside>

          {/* Preview Panel */}
          {store.showPreview && (
            <aside className="w-96 shrink-0 border-l bg-background flex flex-col overflow-hidden">
              <BuilderPreviewPanel
                previewUrl={previewUrl}
                previewDevice={store.previewDevice}
                isPublished={store.isPublished}
                isDirty={store.isDirty}
                onPublish={handleTogglePublish}
                isSaving={isSaving}
              />
            </aside>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function migrateBlocksToV2(blocks: unknown[]): BlockV2[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((raw) => {
    const block = raw as Record<string, unknown>;
    // Already V2 format (has 'props' and 'layout')
    if (block.props && block.layout) {
      return block as unknown as BlockV2;
    }
    // V1 format (has 'content' and 'settings')
    const def = getBlockDef(block.type as string);
    return {
      id: (block.id as string) ?? nanoid(10),
      type: (block.type as BlockType) ?? "block-text",
      visible: (block.visible as boolean) ?? true,
      label: undefined,
      locked: false,
      props: {
        ...(def?.defaultProps ?? {}),
        ...((block.content as Record<string, unknown>) ?? {}),
      },
      layout: { ...DEFAULT_LAYOUT },
      classes: {},
      animation: { ...DEFAULT_ANIMATION },
    } satisfies BlockV2;
  });
}
