import { Eye, MousePointerClick, Package, Link2, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

interface Stats {
  total_products: number;
  active_products: number;
  total_landing_pages: number;
  published_landing_pages: number;
  total_views: number;
  total_clicks: number;
  total_users: number;
  views_last_7d: number;
  clicks_last_7d: number;
}

export function AnalyticsOverview({ stats }: { stats: Stats | null }) {
  const s = stats ?? {
    total_products: 0,
    active_products: 0,
    total_landing_pages: 0,
    published_landing_pages: 0,
    total_views: 0,
    total_clicks: 0,
    total_users: 0,
    views_last_7d: 0,
    clicks_last_7d: 0,
  };

  const ctr =
    s.total_views > 0
      ? ((s.total_clicks / s.total_views) * 100).toFixed(1)
      : "0.0";

  const metrics = [
    {
      label: "Total Views",
      value: s.total_views.toLocaleString(),
      sub: `${s.views_last_7d.toLocaleString()} last 7d`,
      icon: Eye,
    },
    {
      label: "Total Clicks",
      value: s.total_clicks.toLocaleString(),
      sub: `${s.clicks_last_7d.toLocaleString()} last 7d`,
      icon: MousePointerClick,
    },
    {
      label: "Overall CTR",
      value: `${ctr}%`,
      sub: "Click-through rate",
      icon: TrendingUp,
    },
    {
      label: "Products",
      value: s.total_products.toLocaleString(),
      sub: `${s.active_products} active`,
      icon: Package,
    },
    {
      label: "Landing Pages",
      value: s.total_landing_pages.toLocaleString(),
      sub: `${s.published_landing_pages} published`,
      icon: Link2,
    },
    {
      label: "Members",
      value: s.total_users.toLocaleString(),
      sub: "Total registered",
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {metrics.map(({ label, value, sub, icon: Icon }) => (
        <Card
          key={label}
          className="bg-gradient-to-t from-primary/5 to-card dark:bg-card"
        >
          <CardHeader className="pb-1 pt-3">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Icon className="size-3.5" />
            </div>
            <CardDescription className="text-xs">{label}</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="font-bold text-2xl tabular-nums">{value}</div>
            <p className="text-muted-foreground text-xs">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
