"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays, parseISO, startOfDay } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageView {
  id: string;
  created_at: string;
  device_type?: string;
}

interface ProductClick {
  id: string;
  created_at: string;
  click_type?: string;
}

interface Props {
  views: PageView[];
  clicks: ProductClick[];
}

export function AnalyticsCharts({ views, clicks }: Props) {
  const dailyData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      const key = format(date, "yyyy-MM-dd");
      return {
        date: format(date, "dd MMM"),
        fullDate: key,
        views: 0,
        clicks: 0,
      };
    });

    for (const view of views) {
      const key = format(parseISO(view.created_at), "yyyy-MM-dd");
      const day = days.find((d) => d.fullDate === key);
      if (day) day.views++;
    }

    for (const click of clicks) {
      const key = format(parseISO(click.created_at), "yyyy-MM-dd");
      const day = days.find((d) => d.fullDate === key);
      if (day) day.clicks++;
    }

    return days;
  }, [views, clicks]);

  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of views) {
      const d = (v.device_type ?? "unknown") as string;
      counts[d] = (counts[d] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [views]);

  const clickTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of clicks) {
      const t = c.click_type ?? "affiliate";
      counts[t] = (counts[t] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [clicks]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Views & Clicks over time */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
          <CardDescription>Daily views and clicks — last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                fill="url(#colorViews)"
                strokeWidth={2}
                dot={false}
                name="Views"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#22c55e"
                fill="url(#colorClicks)"
                strokeWidth={2}
                dot={false}
                name="Clicks"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Side charts */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceData.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No data yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={deviceData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Click Types</CardTitle>
          </CardHeader>
          <CardContent>
            {clickTypeData.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No data yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={clickTypeData}
                  margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="value" fill="#22c55e" radius={[3, 3, 0, 0]} name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
