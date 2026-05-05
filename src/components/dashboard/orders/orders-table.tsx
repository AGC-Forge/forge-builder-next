"use client";

import React, { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle,
  Download,
  Package,
  Truck,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  updateOrderStatus,
  deleteOrder,
  confirmOrderPayment,
  exportOrdersCSV,
} from "@/actions/orders";
import type { Order, OrderStatus } from "@/actions/orders";
import { formatCurrency, cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Truck,
  },
  completed: {
    label: "Completed",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "completed", "cancelled"],
  shipped: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

interface Props {
  data: Order[];
  count: number;
  page: number;
  pageCount: number;
}

export function OrdersTable({ data, count, page, pageCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [orders, setOrders] = useState(data);

  function updateParams(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (!v) sp.delete(k);
      else sp.set(k, v);
    }
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
        toast.success(`Order marked as ${newStatus}.`);
        if (viewOrder?.id === orderId)
          setViewOrder((v) => (v ? { ...v, status: newStatus } : null));
      } else toast.error(result.error ?? "Failed.");
    });
  }

  function handleConfirmPayment(orderId: string) {
    startTransition(async () => {
      const result = await confirmOrderPayment(orderId);
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, payment_status: "paid", status: "processing" }
              : o,
          ),
        );
        toast.success("Payment confirmed!");
      } else toast.error(result.error ?? "Failed.");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteOrder(id);
      if (result.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        toast.success("Order deleted.");
      } else toast.error(result.error ?? "Failed.");
      setDeleteId(null);
    });
  }

  function handleExportCSV() {
    startTransition(async () => {
      const result = await exportOrdersCSV();
      if (!result.success || !result.data) {
        toast.error("Export failed.");
        return;
      }
      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Orders exported!");
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) =>
              updateParams({ search: e.target.value || undefined })
            }
            placeholder="Search name, phone, order #..."
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(v) =>
            updateParams({ status: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-40 h-9">
            <Filter className="size-3.5 mr-1 text-muted-foreground" />
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={isPending}
          className="gap-1.5"
        >
          <Download className="size-3.5" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="size-10 text-muted-foreground/40 mb-3" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Orders will appear here when customers complete the checkout
                form.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Landing Page
                      </TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Payment
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Date
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const statusCfg = STATUS_CONFIG[order.status];
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs font-medium">
                            {order.order_number}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {order.customer_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.customer_phone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {(order.landing_page as { title?: string } | null)
                              ?.title ?? "—"}
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            {formatCurrency(order.total_amount, {
                              currency: "IDR",
                              noDecimals: true,
                            })}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                                statusCfg.color,
                              )}
                            >
                              <statusCfg.icon className="size-3" />
                              {statusCfg.label}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              variant={
                                order.payment_status === "paid"
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs capitalize"
                            >
                              {order.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {format(new Date(order.created_at), "dd MMM yyyy")}
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
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() => setViewOrder(order)}
                                >
                                  <Eye className="size-4" /> View Details
                                </DropdownMenuItem>
                                {order.payment_status === "unpaid" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleConfirmPayment(order.id)
                                    }
                                  >
                                    <CheckCircle className="size-4" /> Confirm
                                    Payment
                                  </DropdownMenuItem>
                                )}
                                {NEXT_STATUSES[order.status].length > 0 && (
                                  <>
                                    <DropdownMenuSeparator />
                                    {NEXT_STATUSES[order.status].map((s) => (
                                      <DropdownMenuItem
                                        key={s}
                                        onClick={() =>
                                          handleStatusChange(order.id, s)
                                        }
                                      >
                                        {React.createElement(
                                          STATUS_CONFIG[s].icon,
                                          { className: "size-4" },
                                        )}
                                        Mark as {STATUS_CONFIG[s].label}
                                      </DropdownMenuItem>
                                    ))}
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteId(order.id)}
                                >
                                  <Trash2 className="size-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {orders.length} of {count} orders
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

      {/* Order Detail Dialog */}
      {viewOrder && (
        <Dialog open onOpenChange={() => setViewOrder(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order {viewOrder.order_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              {/* Status + Payment */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                    STATUS_CONFIG[viewOrder.status].color,
                  )}
                >
                  {STATUS_CONFIG[viewOrder.status].label}
                </span>
                <Badge
                  variant={
                    viewOrder.payment_status === "paid" ? "default" : "outline"
                  }
                  className="capitalize text-xs"
                >
                  Payment: {viewOrder.payment_status}
                </Badge>
              </div>

              <Separator />

              {/* Customer */}
              <div>
                <p className="font-semibold mb-2">Customer</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground w-28 inline-block">
                      Name:
                    </span>
                    {viewOrder.customer_name}
                  </p>
                  <p>
                    <span className="text-muted-foreground w-28 inline-block">
                      Phone:
                    </span>
                    {viewOrder.customer_phone}
                  </p>
                  {viewOrder.customer_email && (
                    <p>
                      <span className="text-muted-foreground w-28 inline-block">
                        Email:
                      </span>
                      {viewOrder.customer_email}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Shipping */}
              <div>
                <p className="font-semibold mb-2">Shipping Address</p>
                <p className="text-muted-foreground text-sm">
                  {viewOrder.shipping_address.street},{" "}
                  {viewOrder.shipping_address.city}
                  {viewOrder.shipping_address.province &&
                    `, ${viewOrder.shipping_address.province}`}
                  {viewOrder.shipping_address.postal_code &&
                    ` ${viewOrder.shipping_address.postal_code}`}
                </p>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <p className="font-semibold mb-2">Items</p>
                <div className="space-y-2">
                  {viewOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.title} × {item.qty}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.subtotal, {
                          currency: "IDR",
                          noDecimals: true,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(viewOrder.subtotal, {
                        currency: "IDR",
                        noDecimals: true,
                      })}
                    </span>
                  </div>
                  {viewOrder.shipping_cost > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping</span>
                      <span>
                        {formatCurrency(viewOrder.shipping_cost, {
                          currency: "IDR",
                          noDecimals: true,
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>
                      {formatCurrency(viewOrder.total_amount, {
                        currency: "IDR",
                        noDecimals: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {viewOrder.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="font-semibold mb-1">Notes</p>
                    <p className="text-muted-foreground text-sm">
                      {viewOrder.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Actions */}
              {NEXT_STATUSES[viewOrder.status].length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {NEXT_STATUSES[viewOrder.status].map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => handleStatusChange(viewOrder.id, s)}
                    >
                      {React.createElement(STATUS_CONFIG[s].icon, {
                        className: "size-3.5",
                      })}
                      {STATUS_CONFIG[s].label}
                    </Button>
                  ))}
                  {viewOrder.payment_status === "unpaid" && (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleConfirmPayment(viewOrder.id)}
                    >
                      <CheckCircle className="size-3.5" /> Confirm Payment
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the order. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
