"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
import type { PageView, ProductClick } from "@/actions/analytics";

const PIE_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f97316",
  "#0ea5e9",
  "#ec4899",
  "#a855f7",
  "#64748b",
];

const DEVICE_ICONS: Record<string, string> = {
  mobile: "📱",
  tablet: "📲",
  desktop: "🖥️",
  unknown: "❓",
};

function parseReferrerDomain(url: string | null | undefined): string {
  if (!url) return "Direct";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    // Map known hosts to readable names
    const map: Record<string, string> = {
      "google.com": "Google",
      "l.instagram.com": "Instagram",
      "instagram.com": "Instagram",
      "t.co": "Twitter/X",
      "facebook.com": "Facebook",
      "m.facebook.com": "Facebook",
      "tiktok.com": "TikTok",
      "youtube.com": "YouTube",
      "tokopedia.com": "Tokopedia",
      "shopee.co.id": "Shopee",
      "lazada.co.id": "Lazada",
    };
    return map[host] ?? host;
  } catch {
    return "Direct";
  }
}

interface Props {
  views: PageView[];
  clicks: ProductClick[];
  days?: number;
}

export function AnalyticsCharts({ views, clicks, days = 30 }: Props) {
  // Daily area chart data
  const dailyData = useMemo(() => {
    const dayList = Array.from({ length: days }, (_, i) => {
      const date = startOfDay(subDays(new Date(), days - 1 - i));
      return {
        date: format(date, "dd MMM"),
        fullDate: format(date, "yyyy-MM-dd"),
        views: 0,
        clicks: 0,
      };
    });

    for (const view of views) {
      const key = format(parseISO(view.created_at), "yyyy-MM-dd");
      const day = dayList.find((d) => d.fullDate === key);
      if (day) day.views++;
    }
    for (const click of clicks) {
      const key = format(parseISO(click.created_at), "yyyy-MM-dd");
      const day = dayList.find((d) => d.fullDate === key);
      if (day) day.clicks++;
    }

    return dayList;
  }, [views, clicks, days]);

  // Device breakdown
  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of views) {
      const d = v.device_type ?? "unknown";
      counts[d] = (counts[d] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: `${DEVICE_ICONS[name] ?? ""} ${name}`,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [views]);

  // Referrer source breakdown (top 6)
  const referrerData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of views) {
      const domain = parseReferrerDomain(v.referrer);
      counts[domain] = (counts[domain] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [views]);

  // Click type breakdown
  const clickTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of clicks) {
      const t = c.click_type ?? "affiliate";
      counts[t] = (counts[t] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [clicks]);

  const totalViews = views.length;
  const totalClicks = clicks.length;

  return (
    <div className="space-y-4">
      {/* Main area chart */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
          <CardDescription>
            Daily views and clicks — last {days} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalViews === 0 && totalClicks === 0 ? (
            <EmptyChart message="No traffic data yet for this period." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={dailyData}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
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
          )}
        </CardContent>
      </Card>

      {/* 3-column breakdown row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Device breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Devices</CardTitle>
            <CardDescription className="text-xs">
              {totalViews} total views
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deviceData.length === 0 ? (
              <EmptyChart message="No device data yet." small />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {deviceData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: "11px", borderRadius: "6px" }}
                      formatter={(v) => [
                        `${typeof v === "number" ? v : Number(v ?? 0)} visits`,
                        "",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {deviceData.map((d, i) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        {d.name}
                      </span>
                      <span className="font-medium tabular-nums">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Referrer sources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Traffic Sources</CardTitle>
            <CardDescription className="text-xs">
              Where visitors come from
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrerData.length === 0 ? (
              <EmptyChart message="No referrer data yet." small />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={referrerData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: "11px", borderRadius: "6px" }}
                    formatter={(v) => [
                      `${typeof v === "number" ? v : Number(v ?? 0)} visits`,
                      "Visitors",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                    barSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Click types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Click Types</CardTitle>
            <CardDescription className="text-xs">
              {totalClicks} total clicks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clickTypeData.length === 0 ? (
              <EmptyChart message="No click data yet." small />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={clickTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {clickTypeData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: "11px", borderRadius: "6px" }}
                      formatter={(v) => [
                        `${typeof v === "number" ? v : Number(v ?? 0)} clicks`,
                        "",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {clickTypeData.map((d, i) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="capitalize">{d.name}</span>
                      </span>
                      <span className="font-medium tabular-nums">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyChart({ message, small }: { message: string; small?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center text-muted-foreground ${small ? "h-32" : "h-48"}`}
    >
      <div className={`mb-2 rounded-full bg-muted ${small ? "p-3" : "p-4"}`}>
        <svg
          className={small ? "size-5" : "size-7"}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          />
        </svg>
      </div>
      <p className="text-xs">{message}</p>
    </div>
  );
}
