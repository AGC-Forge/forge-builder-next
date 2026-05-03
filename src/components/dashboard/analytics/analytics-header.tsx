"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportAnalyticsCSV } from "@/actions/analytics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
] as const;

export function AnalyticsHeader({ days }: { days: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExporting, startExport] = useTransition();

  function setDays(d: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("days", String(d));
    router.push(`${pathname}?${sp.toString()}`);
  }

  function handleExport() {
    startExport(async () => {
      const result = await exportAnalyticsCSV(days);
      if (!result.success || !result.data) {
        toast.error(result.error ?? "Export failed.");
        return;
      }

      // Trigger browser download
      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `snapland-analytics-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Analytics exported!");
    });
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Track performance across all your landing pages.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Date range tabs */}
        <div className="flex rounded-lg border bg-muted/40 p-0.5 gap-0.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setDays(r.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                days === r.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Export CSV */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="gap-1.5"
        >
          {isExporting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          Export CSV
        </Button>
      </div>
    </div>
  );
}
