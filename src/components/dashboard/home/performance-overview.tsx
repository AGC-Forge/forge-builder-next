"use client";

import { format, parseISO, subDays } from "date-fns";
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

export function PerformanceOverview({ views, clicks, days = 30 }: Props) {
  const today = new Date();

  const chartData = Array.from({ length: days }, (_, i) => {
    const date = format(subDays(today, days - 1 - i), "yyyy-MM-dd");
    return { date, views: 0, clicks: 0 };
  });

  const dateIndex = Object.fromEntries(chartData.map((d, i) => [d.date, i]));

  for (const v of views) {
    const d = v.created_at.slice(0, 10);
    if (dateIndex[d] !== undefined) chartData[dateIndex[d]].views++;
  }
  for (const c of clicks) {
    const d = c.created_at.slice(0, 10);
    if (dateIndex[d] !== undefined) chartData[dateIndex[d]].clicks++;
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">Views & Clicks</CardTitle>
        <CardDescription>Last {days} days performance</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <ComposedChart data={chartData} margin={{ top: 0 }}>
            <defs>
              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.4} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) =>
                parseISO(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-44"
                  indicator="line"
                  labelFormatter={(v) => format(parseISO(v), "d MMM yyyy")}
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
