import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Activity, ArrowRight } from "lucide-react";
import { getActivityLogs } from "@/actions/activity-logs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  "product.created": "Created product",
  "product.updated": "Updated product",
  "product.deleted": "Deleted product",
  "landing_page.created": "Created landing page",
  "landing_page.updated": "Updated landing page",
  "landing_page.deleted": "Deleted landing page",
  "landing_page.published": "Published landing page",
  "profile.updated": "Updated profile",
  "password.changed": "Changed password",
  "user.invited": "Invited user",
  "user.deleted": "Deleted user",
};

export async function RecentActivityCard() {
  const result = await getActivityLogs({ page: 1, pageSize: 6 });
  const logs = result.success ? (result.data?.data ?? []) : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
            <Link href="/dashboard/activity">
              View all
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        {logs.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          <div className="divide-y">
            {logs.map((log) => {
              const userName =
                log.profile?.full_name ?? log.profile?.email ?? "Unknown";
              const label = ACTION_LABELS[log.action] ?? log.action;
              return (
                <div key={log.id} className="flex items-center gap-3 py-2.5">
                  <Avatar className="size-7 shrink-0">
                    <AvatarImage src={log.profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      <span className="font-medium">{userName}</span>{" "}
                      <span className="text-muted-foreground">{label}</span>
                    </p>
                  </div>
                  <span className="text-muted-foreground text-xs shrink-0 hidden sm:block">
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
