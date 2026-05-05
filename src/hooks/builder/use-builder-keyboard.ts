"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/stores/builder-store";

/**
 * Registers keyboard shortcuts for the builder.
 * Mount this hook once in the root builder component.
 *
 * Shortcuts:
 *  Cmd/Ctrl + Z         → Undo
 *  Cmd/Ctrl + Shift + Z → Redo
 *  Cmd/Ctrl + D         → Duplicate selected block
 *  Delete / Backspace   → Delete selected block (only when not in input)
 *  Escape               → Deselect block
 */
export function useBuilderKeyboard() {
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const duplicateBlock = useBuilderStore((s) => s.duplicateBlock);
  const removeBlock = useBuilderStore((s) => s.removeBlock);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Skip if user is typing in an input/textarea/contenteditable
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isEditing =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (e.target as HTMLElement)?.isContentEditable;

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (mod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // Actions below require a selected block and must not be in editing mode
      if (!selectedBlockId || isEditing) return;

      if (mod && e.key === "d") {
        e.preventDefault();
        duplicateBlock(selectedBlockId);
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeBlock(selectedBlockId);
        return;
      }

      if (e.key === "Escape") {
        selectBlock(null);
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, duplicateBlock, removeBlock, selectBlock, selectedBlockId]);
}
