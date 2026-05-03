"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const bars = [40, 60, 45, 80, 55, 90, 75, 85, 70, 95, 65, 88, 78, 100];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AnalyticsSection() {
  const t = useTranslations("HomeSectionAnalytics");
  const [activeTab, setActiveTab] = useState<"7days" | "30days" | "90days">(
    "7days",
  );

  const metrics = [
    {
      value: "24,831",
      label: t("metrics.pageviews"),
      change: "▲ 18.4%",
      up: true,
    },
    {
      value: "3,204",
      label: t("metrics.visitors"),
      change: "▲ 9.1%",
      up: true,
    },
    { value: "6.8%", label: t("metrics.ctr"), change: "▼ 1.2%", up: false },
    {
      value: "Rp 4.2M",
      label: t("metrics.revenue"),
      change: "▲ 31%",
      up: true,
    },
  ];

  const tabs = [
    { key: "7days" as const, label: t("tabs.7days") },
    { key: "30days" as const, label: t("tabs.30days") },
    { key: "90days" as const, label: t("tabs.90days") },
  ];

  return (
    <section id="analytics" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <p className="text-xs font-semibold text-accent-3 uppercase tracking-widest mb-3">
          {t("tag")}
        </p>
        <h2
          className="font-display-syne font-bold leading-tight tracking-tight mb-4"
          style={{ fontSize: "clamp(32px,4vw,48px)" }}
        >
          {t("title1")}
          <br />
          {t("title2")}
        </h2>
        <p className="text-white/50 font-light max-w-xl mb-12">
          {t("subtitle")}
        </p>

        {/* Dashboard Card */}
        <div className="bg-bg-2 border border-white/[0.14] rounded-2xl p-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
            <h3 className="font-display-syne text-base font-semibold">
              {t("overview")}
            </h3>
            <div className="flex items-center gap-1 bg-bg-3 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs transition-all duration-200",
                    activeTab === tab.key
                      ? "bg-accent text-white font-medium"
                      : "text-white/40 hover:text-white/70",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((m, i) => (
              <div key={i} className="bg-bg-3 rounded-xl p-4 lg:p-5">
                <div className="font-display-syne text-2xl font-bold">
                  {m.value}
                </div>
                <div className="text-xs text-white/40 mt-1">{m.label}</div>
                <div
                  className={cn(
                    "text-xs mt-2 font-medium",
                    m.up ? "text-brand-green" : "text-brand-coral",
                  )}
                >
                  {m.change}
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-1.5 h-20">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-100 cursor-pointer"
                style={{
                  height: `${h}%`,
                  background:
                    i === bars.length - 1 || i === 5
                      ? "rgb(0,206,201)"
                      : "rgb(108,92,231)",
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {days.map((d) => (
              <span
                key={d}
                className="text-[11px] text-white/30 flex-1 text-center"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
