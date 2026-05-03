"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { deleteProduct, toggleProductStatus } from "@/actions/products";
import { formatCurrency } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Props {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export function ProductsTable({ data, total, page, pageCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function updateParams(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (result.success) toast.success("Product deleted.");
      else toast.error(result.error ?? "Failed to delete.");
      setDeleteId(null);
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      const result = await toggleProductStatus(id, !current);
      if (result.success) toast.success(result.message);
      else toast.error(result.error ?? "Failed to update status.");
    });
  }

  const primaryImage = (p: Product) =>
    p.images.find((i) => i.is_primary)?.url ?? p.images[0]?.url ?? null;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-50 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                defaultValue={searchParams.get("search") ?? ""}
                onChange={(e) =>
                  updateParams({ search: e.target.value || undefined })
                }
                className="pl-8"
              />
            </div>

            <Select
              value={searchParams.get("category") ?? "all"}
              onValueChange={(v) =>
                updateParams({ category: v === "all" ? undefined : v })
              }
            >
              <SelectTrigger className="w-40">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(PRODUCT_CATEGORIES).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    {cat.emoji} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchParams.get("status") ?? "all"}
              onValueChange={(v) =>
                updateParams({ status: v === "all" ? undefined : v })
              }
            >
              <SelectTrigger className="w-35">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <span className="ml-auto text-muted-foreground text-sm">
              {total} product{total !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
                {data.map((product) => {
                  const thumb = primaryImage(product);
                  const cat = product.category
                    ? PRODUCT_CATEGORIES[
                        product.category as keyof typeof PRODUCT_CATEGORIES
                      ]
                    : null;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={product.title}
                            className="size-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-muted" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-50">
                          <p className="truncate font-medium text-sm">
                            {product.title}
                          </p>
                          {product.shop_name && (
                            <p className="truncate text-muted-foreground text-xs">
                              {product.shop_name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {cat ? (
                          <Badge variant="outline" className="text-xs">
                            {cat.emoji} {cat.label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.price != null ? (
                          <div>
                            <p className="font-medium text-sm">
                              {formatCurrency(product.price, product.currency)}
                            </p>
                            {product.original_price &&
                              product.original_price > product.price && (
                                <p className="text-muted-foreground text-xs line-through">
                                  {formatCurrency(
                                    product.original_price,
                                    product.currency,
                                  )}
                                </p>
                              )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.product_rating != null ? (
                          <span className="text-sm">
                            ⭐ {product.product_rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(product.created_at), "dd MMM yy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/products/${product.id}`}>
                                <Eye className="mr-2 size-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/products/${product.id}/edit`}
                              >
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggle(product.id, product.is_active)
                              }
                            >
                              {product.is_active ? (
                                <>
                                  <ToggleLeft className="mr-2 size-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 size-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(product.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
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
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
