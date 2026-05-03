"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

const PRESETS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#3b82f6",
  "#1e293b",
  "#334155",
  "#64748b",
  "#94a3b8",
  "#f8fafc",
  "#ffffff",
  "#000000",
  "#0f172a",
  "#1e40af",
  "#065f46",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  label,
  className,
}: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleHexChange(raw: string) {
    const cleaned = raw.startsWith("#") ? raw : `#${raw}`;
    // Only update if looks like a valid hex
    if (/^#[0-9A-Fa-f]{0,6}$/.test(cleaned)) {
      onChange(cleaned);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      )}

      {/* Swatch + hex input row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="size-8 shrink-0 rounded-md border-2 border-border shadow-sm transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ backgroundColor: value || "#6366f1" }}
          aria-label="Pick color"
        />
        <input
          ref={inputRef}
          type="color"
          value={value || "#6366f1"}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          tabIndex={-1}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#6366f1"
          maxLength={7}
          className="h-8 w-24 rounded-md border bg-background px-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              "size-6 rounded-full border-2 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === preset
                ? "border-foreground scale-110"
                : "border-transparent",
            )}
            style={{ backgroundColor: preset }}
            title={preset}
          />
        ))}
      </div>
    </div>
  );
}
