"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Crown,
  Users,
  TrendingUp,
  Zap,
  MoreHorizontal,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { assignMembership, downgradeMembership } from "@/actions/memberships";
import type {
  Membership,
  PlanType,
  BillingPeriod,
} from "@/lib/memberships/plans";
import { PLAN_CONFIG } from "@/lib/memberships/plans";
import { getInitials, cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MembershipWithProfile = Membership & {
  profile: {
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

interface Props {
  data: MembershipWithProfile[];
  count: number;
  stats: { free: number; starter: number; pro: number; enterprise: number };
}

const PLAN_BADGE_COLOR: Record<PlanType, string> = {
  free: "bg-muted text-muted-foreground",
  starter: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  pro: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  enterprise:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export function MembershipsTable({ data, count, stats }: Props) {
  const [memberships, setMemberships] = useState(data);
  const [search, setSearch] = useState("");
  const [upgradeTarget, setUpgradeTarget] =
    useState<MembershipWithProfile | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = memberships.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.profile.email.toLowerCase().includes(q) ||
      (m.profile.full_name ?? "").toLowerCase().includes(q)
    );
  });

  function handleDowngrade(membership: MembershipWithProfile) {
    startTransition(async () => {
      const result = await downgradeMembership(membership.user_id);
      if (result.success) {
        setMemberships((prev) =>
          prev.map((m) =>
            m.user_id === membership.user_id
              ? { ...m, plan_type: "free", expires_at: null }
              : m,
          ),
        );
        toast.success("Downgraded to Free.");
      } else toast.error(result.error ?? "Failed.");
    });
  }

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["free", "starter", "pro", "enterprise"] as PlanType[]).map(
          (plan) => (
            <Card key={plan}>
              <CardHeader className="pb-1 pt-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground capitalize">
                  {PLAN_CONFIG[plan].label}
                </CardTitle>
                <Crown className={cn("size-4", PLAN_CONFIG[plan].color)} />
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-2xl font-bold">{stats[plan]}</p>
                <p className="text-xs text-muted-foreground">users</p>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email or name..."
                className="pl-9 h-9"
              />
            </div>
            <p className="text-sm text-muted-foreground shrink-0">
              {count} total
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Started
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Expires
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Payment Ref
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={m.profile.avatar_url ?? undefined}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(
                              m.profile.full_name ?? m.profile.email,
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {m.profile.full_name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.profile.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          PLAN_BADGE_COLOR[m.plan_type],
                        )}
                      >
                        <Crown className="size-3" />
                        {PLAN_CONFIG[m.plan_type].label}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {format(new Date(m.started_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {m.expires_at ? (
                        <span
                          className={cn(
                            new Date(m.expires_at) < new Date()
                              ? "text-destructive"
                              : "text-muted-foreground",
                          )}
                        >
                          {format(new Date(m.expires_at), "dd MMM yyyy")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                      {m.payment_ref ?? "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setUpgradeTarget(m)}>
                            <ArrowUpCircle className="size-4" /> Assign Plan
                          </DropdownMenuItem>
                          {m.plan_type !== "free" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDowngrade(m)}
                              >
                                <ArrowDownCircle className="size-4" /> Downgrade
                                to Free
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-muted-foreground text-sm"
                    >
                      No memberships found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Plan Dialog */}
      {upgradeTarget && (
        <AssignPlanDialog
          membership={upgradeTarget}
          onAssigned={(planType, expiresAt) => {
            setMemberships((prev) =>
              prev.map((m) =>
                m.user_id === upgradeTarget.user_id
                  ? { ...m, plan_type: planType, expires_at: expiresAt }
                  : m,
              ),
            );
            setUpgradeTarget(null);
          }}
          onClose={() => setUpgradeTarget(null)}
        />
      )}
    </div>
  );
}

// ── Assign Plan Dialog ────────────────────────────────────────
function AssignPlanDialog({
  membership,
  onAssigned,
  onClose,
}: {
  membership: MembershipWithProfile;
  onAssigned: (planType: PlanType, expiresAt: string | null) => void;
  onClose: () => void;
}) {
  const [planType, setPlanType] = useState<PlanType>(membership.plan_type);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [paymentRef, setPaymentRef] = useState(membership.payment_ref ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await assignMembership({
        userId: membership.user_id,
        planType,
        period,
        paymentRef: paymentRef || undefined,
      });
      if (result.success && result.data) {
        toast.success(result.message);
        onAssigned(planType, result.data.expires_at);
      } else toast.error(result.error ?? "Failed.");
    });
  }

  const cfg = PLAN_CONFIG[planType];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Membership Plan</DialogTitle>
        </DialogHeader>
        <div className="mb-2">
          <p className="text-sm font-medium">
            {membership.profile.full_name ?? membership.profile.email}
          </p>
          <p className="text-xs text-muted-foreground">
            {membership.profile.email}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Select
              value={planType}
              onValueChange={(v) => setPlanType(v as PlanType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                {(["free", "starter", "pro", "enterprise"] as PlanType[]).map(
                  (p) => (
                    <SelectItem key={p} value={p}>
                      {PLAN_CONFIG[p].label} —{" "}
                      {p === "free" || p === "enterprise"
                        ? "Free"
                        : formatCurrency(PLAN_CONFIG[p].price_monthly, {
                            currency: "IDR",
                            noDecimals: true,
                          }) + "/mo"}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {planType !== "free" && planType !== "enterprise" && (
            <div className="space-y-1.5">
              <Label>Billing Period</Label>
              <Select
                value={period}
                onValueChange={(v) => setPeriod(v as BillingPeriod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly (1 month)</SelectItem>
                  <SelectItem value="yearly">Yearly (12 months)</SelectItem>
                  <SelectItem value="lifetime">Lifetime (no expiry)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Payment Reference (optional)</Label>
            <Input
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. TRX-20250505-001"
              className="h-9"
            />
          </div>

          {/* Plan summary */}
          <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
            <p className="font-semibold text-sm">{cfg.label} — Features:</p>
            {cfg.features.slice(0, 4).map((f, i) => (
              <p key={i} className="text-muted-foreground">
                ✓ {f}
              </p>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              Assign Plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
