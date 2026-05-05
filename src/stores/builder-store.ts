"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type {
  BuilderState,
  BuilderHistoryEntry,
  BlockV2,
} from "@/types/builder";

const MAX_HISTORY = 50;

export const useBuilderStore = create<BuilderState>((set, get) => ({
  // ── Core ──────────────────────────────────────────────────
  landingPageId: "",
  blocks: [],
  isDirty: false,
  isSaving: false,
  isPublished: false,

  // ── Selection ────────────────────────────────────────────
  selectedBlockId: null,

  // ── History ──────────────────────────────────────────────
  history: [],
  historyIndex: -1,

  // ── UI ───────────────────────────────────────────────────
  previewDevice: "mobile",
  showPreview: false,
  leftPanelTab: "blocks",
  rightPanelTab: "content",
  isLeftPanelCollapsed: false,
  blockSearch: "",

  // ── Block Actions ─────────────────────────────────────────
  setBlocks: (blocks) => set({ blocks, isDirty: true }),

  addBlock: (block, afterId) => {
    get().pushHistory("Add block");
    set((state) => {
      let newBlocks: BlockV2[];
      if (afterId) {
        const idx = state.blocks.findIndex((b) => b.id === afterId);
        newBlocks = idx >= 0
          ? [...state.blocks.slice(0, idx + 1), block, ...state.blocks.slice(idx + 1)]
          : [...state.blocks, block];
      } else {
        newBlocks = [...state.blocks, block];
      }
      return { blocks: newBlocks, isDirty: true, selectedBlockId: block.id };
    });
  },

  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      isDirty: true,
    })),

  updateBlockProps: (id, props) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, props: { ...b.props, ...props } } : b,
      ),
      isDirty: true,
    })),

  updateBlockLayout: (id, layout) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, layout: { ...b.layout, ...layout } } : b,
      ),
      isDirty: true,
    })),

  updateBlockClasses: (id, classes) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, classes: { ...b.classes, ...classes } } : b,
      ),
      isDirty: true,
    })),

  updateBlockAnimation: (id, animation) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, animation: { ...b.animation, ...animation } } : b,
      ),
      isDirty: true,
    })),

  removeBlock: (id) => {
    get().pushHistory("Delete block");
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
      isDirty: true,
    }));
  },

  duplicateBlock: (id) => {
    get().pushHistory("Duplicate block");
    set((state) => {
      const idx = state.blocks.findIndex((b) => b.id === id);
      if (idx < 0) return state;
      const orig = state.blocks[idx];
      const clone: BlockV2 = {
        ...JSON.parse(JSON.stringify(orig)),
        id: nanoid(10),
        label: orig.label ? `${orig.label} (copy)` : undefined,
        locked: false,
      };
      const newBlocks = [
        ...state.blocks.slice(0, idx + 1),
        clone,
        ...state.blocks.slice(idx + 1),
      ];
      return { blocks: newBlocks, selectedBlockId: clone.id, isDirty: true };
    });
  },

  moveBlock: (fromIndex, toIndex) =>
    set((state) => {
      if (fromIndex === toIndex) return state;
      const blocks = [...state.blocks];
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return { blocks, isDirty: true };
    }),

  toggleVisibility: (id) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)),
      isDirty: true,
    })),

  toggleLock: (id) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, locked: !b.locked } : b)),
      isDirty: true,
    })),

  selectBlock: (id) => set({ selectedBlockId: id, rightPanelTab: "content" }),

  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsSaving: (saving) => set({ isSaving: saving }),
  setIsPublished: (published) => set({ isPublished: published }),

  // ── History ───────────────────────────────────────────────
  pushHistory: (label) => {
    const state = get();
    const entry: BuilderHistoryEntry = {
      blocks: JSON.parse(JSON.stringify(state.blocks)),
      timestamp: Date.now(),
      label,
    };
    const newHistory = [
      ...state.history.slice(0, state.historyIndex + 1),
      entry,
    ].slice(-MAX_HISTORY);
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({
      blocks: JSON.parse(JSON.stringify(history[newIndex].blocks)),
      historyIndex: newIndex,
      isDirty: true,
      selectedBlockId: null,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({
      blocks: JSON.parse(JSON.stringify(history[newIndex].blocks)),
      historyIndex: newIndex,
      isDirty: true,
      selectedBlockId: null,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // ── UI ────────────────────────────────────────────────────
  setPreviewDevice: (device) => set({ previewDevice: device }),
  togglePreview: () => set((s) => ({ showPreview: !s.showPreview })),
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  toggleLeftPanel: () => set((s) => ({ isLeftPanelCollapsed: !s.isLeftPanelCollapsed })),
  setBlockSearch: (search) => set({ blockSearch: search }),
}));

// ── Selector hooks ────────────────────────────────────────────
export const useSelectedBlock = () =>
  useBuilderStore((s) => s.blocks.find((b) => b.id === s.selectedBlockId) ?? null);

export const useBuilderBlocks = () => useBuilderStore((s) => s.blocks);
export const useBuilderIsDirty = () => useBuilderStore((s) => s.isDirty);
