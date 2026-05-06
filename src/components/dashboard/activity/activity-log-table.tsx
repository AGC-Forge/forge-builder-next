"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";
import type { ActivityLog } from "@/actions/activity-logs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInitials } from "@/lib/utils";

const ACTION_META: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  "product.created": { label: "Product Created", variant: "default" },
  "product.updated": { label: "Product Updated", variant: "secondary" },
  "product.deleted": { label: "Product Deleted", variant: "destructive" },
  "landing_page.created": { label: "LP Created", variant: "default" },
  "landing_page.updated": { label: "LP Updated", variant: "secondary" },
  "landing_page.deleted": { label: "LP Deleted", variant: "destructive" },
  "landing_page.published": { label: "LP Published", variant: "default" },
  "profile.updated": { label: "Profile Updated", variant: "outline" },
  "password.changed": { label: "Password Changed", variant: "outline" },
  "api_key.saved": { label: "API Key Saved", variant: "outline" },
  "api_key.deleted": { label: "API Key Deleted", variant: "destructive" },
  "user.invited": { label: "User Invited", variant: "default" },
  "user.deleted": { label: "User Deleted", variant: "destructive" },
  "user.updated": { label: "User Updated", variant: "secondary" },
  "landing_page.unpublished": { label: "LP Unpublished", variant: "secondary" },
  "application.created": { label: "App Created", variant: "default" },
  "application.updated": { label: "App Updated", variant: "secondary" },
  "application.deleted": { label: "App Deleted", variant: "destructive" },
  "order.pending": { label: "Order Pending", variant: "outline" },
  "order.processing": { label: "Order Processing", variant: "default" },
  "order.shipped": { label: "Order Shipped", variant: "default" },
  "order.completed": { label: "Order Completed", variant: "default" },
  "order.cancelled": { label: "Order Cancelled", variant: "destructive" },
  "order.payment_confirmed": { label: "Payment Confirmed", variant: "default" },
  "membership.upgraded": { label: "Membership Upgraded", variant: "default" },
  "membership.downgraded": {
    label: "Membership Downgraded",
    variant: "secondary",
  },
};

interface Props {
  data: ActivityLog[];
  count: number;
  page: number;
  pageCount: number;
}

export function ActivityLogTable({ data, count, page, pageCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined) sp.delete(k);
      else sp.set(k, v);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4" />
            Activity Log
            <span className="text-muted-foreground text-sm font-normal">
              ({count.toLocaleString()} total)
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              No activity recorded yet.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Resource
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Details
                    </TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((log) => {
                    const meta = ACTION_META[log.action] ?? {
                      label: log.action,
                      variant: "outline" as const,
                    };
                    const userName =
                      log.profile?.full_name ?? log.profile?.email ?? "Unknown";
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarImage
                                src={log.profile?.avatar_url ?? undefined}
                              />
                              <AvatarFallback className="text-xs">
                                {getInitials(userName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium max-w-30 truncate">
                              {userName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={meta.variant}
                            className="text-xs whitespace-nowrap"
                          >
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                          {log.resource ?? "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-xs max-w-50 truncate">
                          {log.metadata && Object.keys(log.metadata).length > 0
                            ? JSON.stringify(log.metadata).slice(0, 60)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {formatDistanceToNow(new Date(log.created_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-sm">
                  Page {page} of {pageCount}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pageCount}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
