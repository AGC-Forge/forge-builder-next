"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  excludeId?: string; // current LP id when editing (exclude from check)
  titleValue?: string; // auto-generate slug from title
  appUrl?: string;
  error?: string;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type Status = "idle" | "checking" | "available" | "taken" | "invalid";

export function SlugInput({
  value,
  onChange,
  excludeId,
  titleValue,
  appUrl = "",
  error,
}: SlugInputProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSlug = useRef<string>("");
  const lastGeneratedSlug = useRef<string>("");
  const userEditedSlug = useRef(Boolean(value));

  // Keep slug synced with title until the user edits the slug manually.
  useEffect(() => {
    if (!titleValue) return;
    const generated = toSlug(titleValue);
    if (!generated) return;

    const canAutoFill =
      !userEditedSlug.current ||
      !value ||
      value === lastGeneratedSlug.current;

    if (canAutoFill && generated !== value) {
      lastGeneratedSlug.current = generated;
      onChange(generated);
    }
  }, [titleValue, value, onChange]);

  function handleChange(nextValue: string) {
    const nextSlug = nextValue.toLowerCase().replace(/[^a-z0-9-]/g, "");
    userEditedSlug.current = Boolean(nextSlug);
    onChange(nextSlug);
  }

  // Real-time availability check with debounce
  useEffect(() => {
    if (!value || value === prevSlug.current) return;
    prevSlug.current = value;

    // Basic format check client-side first
    const slugRegex = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/;
    if (!slugRegex.test(value)) {
      setStatus("invalid");
      setStatusMsg("Lowercase letters, numbers, hyphens only. Min 3 chars.");
      return;
    }

    setStatus("checking");
    setStatusMsg(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ slug: value });
        if (excludeId) params.set("excludeId", excludeId);

        const res = await fetch(`/api/slug-check?${params.toString()}`);
        const json = await res.json();

        if (json.available) {
          setStatus("available");
          setStatusMsg("Slug is available!");
        } else {
          setStatus("taken");
          setStatusMsg(json.error ?? "Slug is already taken.");
        }
      } catch {
        setStatus("idle");
        setStatusMsg(null);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, excludeId]);

  const Icon =
    status === "checking"
      ? Loader2
      : status === "available"
        ? CheckCircle2
        : status === "taken" || status === "invalid"
          ? XCircle
          : null;

  const iconColor =
    status === "available"
      ? "text-green-500"
      : status === "taken" || status === "invalid"
        ? "text-destructive"
        : "text-muted-foreground";

  const msgColor =
    status === "available"
      ? "text-green-600"
      : status === "taken" || status === "invalid"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className="space-y-1.5">
      <Label htmlFor="slug">
        URL Slug <span className="text-destructive">*</span>
      </Label>
      <div className="mt-1 flex items-center gap-2">
        <span className="shrink-0 text-muted-foreground text-sm hidden sm:inline">
          {appUrl}/
        </span>
        <div className="relative flex-1">
          <Input
            id="slug"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="my-product-page"
            className={cn(
              "font-mono pr-9",
              (status === "taken" || status === "invalid" || error) &&
                "border-destructive focus-visible:ring-destructive",
              status === "available" &&
                "border-green-500 focus-visible:ring-green-500",
            )}
            autoComplete="off"
            spellCheck={false}
          />
          {Icon && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <Icon
                className={cn(
                  "size-4",
                  iconColor,
                  status === "checking" && "animate-spin",
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Status message */}
      {(statusMsg || error) && (
        <p className={cn("text-xs", msgColor)}>{statusMsg ?? error}</p>
      )}
      {!statusMsg && !error && (
        <p className="text-muted-foreground text-xs">
          Lowercase letters, numbers, hyphens only. Min 3 chars.
        </p>
      )}
    </div>
  );
}
