"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useBuilderStore } from "@/stores/builder-store";
import { updateLandingPageBlocks } from "@/actions/landing-pages";

const AUTOSAVE_DELAY_MS = 3000;

/**
 * Auto-saves builder blocks to DB 3 seconds after last change.
 * Shows a subtle toast only on error.
 */
export function useBuilderAutosave() {
  const blocks = useBuilderStore((s) => s.blocks);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const isSaving = useBuilderStore((s) => s.isSaving);
  const landingPageId = useBuilderStore((s) => s.landingPageId);
  const markSaved = useBuilderStore((s) => s.markSaved);
  const setIsSaving = useBuilderStore((s) => s.setIsSaving);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty || isSaving || !landingPageId) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const result = await updateLandingPageBlocks(landingPageId, blocks);
        if (result.success) {
          markSaved();
        } else {
          toast.error(`Auto-save failed: ${result.error ?? "Unknown error"}`);
        }
      } finally {
        setIsSaving(false);
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [blocks, isDirty, isSaving, landingPageId, markSaved, setIsSaving]);
}
