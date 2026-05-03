import {
  Eye,
  FileText,
  MousePointerClick,
  Package,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardStats } from "@/types/database";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  badge?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </div>
        </CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {badge && (
            <Badge>
              <TrendingUp className="size-3" />
              {badge}
            </Badge>
          )}
        </div>
        {sub && <p className="text-muted-foreground text-sm">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function MetricCards({ stats }: { stats: DashboardStats }) {
  const ctr =
    stats.total_views > 0
      ? ((stats.total_clicks / stats.total_views) * 100).toFixed(1) + "%"
      : "0.0%";

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <StatCard
        icon={Package}
        label="Total Products"
        value={stats.total_products}
        sub={`${stats.active_products} active`}
      />
      <StatCard
        icon={FileText}
        label="Landing Pages"
        value={stats.total_landing_pages}
        sub={`${stats.published_landing_pages} published`}
      />
      <StatCard
        icon={Eye}
        label="Total Views"
        value={stats.total_views}
        sub={`${stats.views_last_7d} last 7d`}
      />
      <StatCard
        icon={MousePointerClick}
        label="Total Clicks"
        value={stats.total_clicks}
        sub={`CTR ${ctr}`}
      />
    </div>
  );
}

