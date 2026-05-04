"use client";

import { format, subDays } from "date-fns";
import { Area, CartesianGrid, ComposedChart, Line, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface AnalyticsEvent {
  id: string;
  created_at: string;
}

interface Props {
  views: AnalyticsEvent[];
  clicks: AnalyticsEvent[];
  days?: number;
}

const chartConfig = {
  views: { label: "Views", color: "var(--chart-1)" },
  clicks: { label: "Clicks", color: "var(--chart-2)" },
} satisfies ChartConfig;

/**
 * Timezone-safe: extract local date string from any ISO/timestamptz string.
 * Supabase returns timestamps with timezone offset (e.g. 2025-05-03T10:00:00+07:00).
 * Using new Date().toLocaleDateString() respects the browser/server local TZ.
 * We use a fixed locale + options to always get YYYY-MM-DD format regardless of env.
 */
function toLocalDateKey(isoString: string): string {
  const d = new Date(isoString);
  // Use 'sv-SE' locale which always returns YYYY-MM-DD
  return d.toLocaleDateString("sv-SE");
}

export function PerformanceOverview({ views, clicks, days = 30 }: Props) {
  const today = new Date();

  const chartData = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i);
    // Use sv-SE for consistent YYYY-MM-DD key
    const dateKey = date.toLocaleDateString("sv-SE");
    return { date: dateKey, views: 0, clicks: 0 };
  });

  const dateIndex = Object.fromEntries(chartData.map((d, i) => [d.date, i]));

  for (const v of views) {
    const key = toLocalDateKey(v.created_at);
    if (dateIndex[key] !== undefined) {
      chartData[dateIndex[key]].views++;
    }
  }
  for (const c of clicks) {
    const key = toLocalDateKey(c.created_at);
    if (dateIndex[key] !== undefined) {
      chartData[dateIndex[key]].clicks++;
    }
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">Views & Clicks</CardTitle>
        <CardDescription>Last {days} days performance</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full"
        >
          <ComposedChart data={chartData} margin={{ top: 0 }}>
            <defs>
              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-views)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-views)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.4} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-44"
                  indicator="line"
                  labelFormatter={(label) => {
                    if (typeof label !== "string") return label;
                    return new Date(label).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <ChartLegend
              verticalAlign="top"
              content={<ChartLegendContent className="mb-4 justify-end" />}
            />
            <Area
              dataKey="views"
              type="monotone"
              fill="url(#fillViews)"
              stroke="var(--color-views)"
              strokeWidth={1.5}
              dot={false}
              fillOpacity={1}
            />
            <Line
              dataKey="clicks"
              type="monotone"
              stroke="var(--color-clicks)"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
