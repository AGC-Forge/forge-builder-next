import type { Metadata } from "next";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { getOrders, getOrderStats } from "@/actions/orders";
import type { OrderStatus } from "@/actions/orders";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  color?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  sub,
  color = "text-primary",
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-lg bg-muted p-1.5 ${color}`}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status as OrderStatus | undefined;
  const search = params.search;

  const [ordersRes, statsRes] = await Promise.all([
    getOrders({ page, status, search }),
    getOrderStats(),
  ]);

  const orders = ordersRes.success ? ordersRes.data : null;
  const stats = statsRes.success ? statsRes.data : null;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Manage customer orders from your landing pages.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Orders"
          value={stats?.total ?? 0}
          icon={Package}
        />
        <StatCard
          title="Pending"
          value={stats?.pending ?? 0}
          icon={Clock}
          color="text-yellow-500"
          sub="Awaiting action"
        />
        <StatCard
          title="Processing"
          value={stats?.processing ?? 0}
          icon={TrendingUp}
          color="text-blue-500"
        />
        <StatCard
          title="Completed"
          value={stats?.completed ?? 0}
          icon={CheckCircle}
          color="text-green-500"
        />
        <StatCard
          title="Cancelled"
          value={stats?.cancelled ?? 0}
          icon={XCircle}
          color="text-red-500"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0, {
            currency: "IDR",
            noDecimals: true,
          })}
          icon={DollarSign}
          color="text-green-500"
          sub="From completed orders"
        />
      </div>

      {/* Orders table */}
      <OrdersTable
        data={orders?.data ?? []}
        count={orders?.count ?? 0}
        page={page}
        pageCount={orders?.pageCount ?? 1}
      />
    </div>
  );
}
