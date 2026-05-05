import { Crown, Zap, AlertTriangle } from "lucide-react";
import { isPast, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { getMyMembership } from "@/actions/memberships";
import { PLAN_CONFIG } from "@/lib/memberships/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const PLAN_COLOR: Record<string, string> = {
  free: "text-muted-foreground",
  starter: "text-blue-600",
  pro: "text-purple-600",
  enterprise: "text-amber-600",
};

interface Props {
  maxProducts: number;
  maxPages: number;
  productCount: number;
  pageCount: number;
}

export async function MembershipStatusCard({
  maxProducts,
  maxPages,
  productCount,
  pageCount,
}: Props) {
  const result = await getMyMembership();
  const membership = result.success ? result.data : null;
  const planType = membership?.plan_type ?? "free";
  const cfg = PLAN_CONFIG[planType];

  const isExpiring =
    membership?.expires_at &&
    !isPast(new Date(membership.expires_at)) &&
    new Date(membership.expires_at).getTime() - new Date().getTime() <
      7 * 24 * 60 * 60 * 1000; // < 7 days

  const isExpired =
    membership?.expires_at && isPast(new Date(membership.expires_at));

  const productPct =
    maxProducts >= 9999 ? 0 : Math.min((productCount / maxProducts) * 100, 100);
  const pagePct =
    maxPages >= 9999 ? 0 : Math.min((pageCount / maxPages) * 100, 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className={cn("size-4", PLAN_COLOR[planType])} />
          Your Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan badge + expiry */}
        <div className="flex items-center justify-between">
          <Badge
            className={cn("text-sm font-semibold capitalize px-3 py-1", {
              "bg-muted text-muted-foreground": planType === "free",
              "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300":
                planType === "starter",
              "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300":
                planType === "pro",
              "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300":
                planType === "enterprise",
            })}
          >
            {cfg.label}
          </Badge>
          {membership?.expires_at && !isExpired && (
            <p className="text-xs text-muted-foreground">
              Expires{" "}
              {formatDistanceToNow(new Date(membership.expires_at), {
                addSuffix: true,
              })}
            </p>
          )}
          {!membership?.expires_at && planType !== "free" && (
            <p className="text-xs text-muted-foreground">Lifetime</p>
          )}
        </div>

        {/* Expiry warning */}
        {isExpiring && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
            <AlertTriangle className="size-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Your plan expires soon. Renew to avoid losing access.
            </p>
          </div>
        )}

        {isExpired && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
            <AlertTriangle className="size-4 text-destructive shrink-0" />
            <p className="text-xs text-destructive">
              Your plan has expired. You&apos;re now on the Free plan.
            </p>
          </div>
        )}

        {/* Usage bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Landing Pages</span>
              <span className="font-medium">
                {pageCount} / {maxPages >= 9999 ? "∞" : maxPages}
              </span>
            </div>
            {maxPages < 9999 && <Progress value={pagePct} className="h-1.5" />}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Products</span>
              <span className="font-medium">
                {productCount} / {maxProducts >= 9999 ? "∞" : maxProducts}
              </span>
            </div>
            {maxProducts < 9999 && (
              <Progress value={productPct} className="h-1.5" />
            )}
          </div>
        </div>

        {/* Upgrade CTA */}
        {planType !== "pro" && planType !== "enterprise" && (
          <Button asChild className="w-full gap-2" size="sm">
            <Link href="/pricing">
              <Zap className="size-3.5" />
              {planType === "free" ? "Upgrade to Starter" : "Upgrade to Pro"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
