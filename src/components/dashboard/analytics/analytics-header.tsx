"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportAnalyticsCSV } from "@/actions/analytics";
import { DateRangePickerInput } from "@/components/date-range-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QUICK_RANGES = [
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
] as const;

interface Props {
  days: number;
  from?: string;
  to?: string;
}

export function AnalyticsHeader({ days, from, to }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExporting, startExport] = useTransition();

  // Active quick range — only highlight if no custom range selected
  const hasCustomRange = Boolean(from && to);

  function setQuickRange(d: number) {
    const sp = new URLSearchParams();
    sp.set("days", String(d));
    // Clear custom range when switching to quick range
    router.push(`${pathname}?${sp.toString()}`);
  }

  function handleDateRangeChange(
    range: { from?: string; to?: string } | undefined,
  ) {
    const sp = new URLSearchParams(searchParams.toString());
    if (range?.from && range?.to) {
      sp.set("from", range.from);
      sp.set("to", range.to);
      sp.delete("days");
    } else {
      // Range cleared — fall back to 30 days
      sp.delete("from");
      sp.delete("to");
      sp.set("days", "30");
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  function handleExport() {
    startExport(async () => {
      const result = await exportAnalyticsCSV(days, from, to);
      if (!result.success || !result.data) {
        toast.error(result.error ?? "Export failed.");
        return;
      }
      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const suffix =
        from && to
          ? `${from.slice(0, 10)}_${to.slice(0, 10)}`
          : `${days}d_${new Date().toISOString().slice(0, 10)}`;
      a.download = `snapland-analytics-${suffix}.csv`;
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

      <div className="flex flex-wrap items-center gap-2">
        {/* Quick range tabs */}
        <div className="flex rounded-lg border bg-muted/40 p-0.5 gap-0.5">
          {QUICK_RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setQuickRange(r.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                !hasCustomRange && days === r.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Date range picker using existing component */}
        <DateRangePickerInput
          label=""
          value={from && to ? { from, to } : undefined}
          onChange={handleDateRangeChange}
        />

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
