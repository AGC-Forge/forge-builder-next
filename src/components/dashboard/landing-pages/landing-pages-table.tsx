"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  Paintbrush,
  QrCode,
  Globe,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  deleteLandingPage,
  setLandingPagePublished,
} from "@/actions/landing-pages";
import type { LandingPage, ThemeType } from "@/types/database";
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
import { QrCodeGenerator } from "@/components/dashboard/qr-code-generator";

const THEME_LABELS: Record<ThemeType, string> = {
  linktree: "Linktree",
  beacons: "Beacons",
  taplink: "TapLink",
  campsite: "Campsite",
  carrd: "Carrd",
  seedprod: "SeedProd",
  lnkbio: "Lnk.bio",
  ecommerce: "E-Commerce",
};

interface Props {
  data: LandingPage[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export function LandingPagesTable({ data, total, page, pageCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

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
      const result = await deleteLandingPage(id);
      if (result.success) toast.success("Landing page deleted.");
      else toast.error(result.error ?? "Failed to delete.");
      setDeleteId(null);
    });
  }

  function handleTogglePublish(id: string, current: boolean) {
    startTransition(async () => {
      const result = await setLandingPagePublished(id, !current);
      if (result.success) toast.success(result.message);
      else toast.error(result.error ?? "Failed.");
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-50 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search pages…"
                defaultValue={searchParams.get("search") ?? ""}
                onChange={(e) =>
                  updateParams({ search: e.target.value || undefined })
                }
                className="pl-8"
              />
            </div>

            <Select
              value={searchParams.get("theme") ?? "all"}
              onValueChange={(v) =>
                updateParams({ theme: v === "all" ? undefined : v })
              }
            >
              <SelectTrigger className="w-37.5">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Themes</SelectItem>
                {Object.entries(THEME_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <span className="ml-auto text-muted-foreground text-sm">
              {total} page{total !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title / Slug</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No landing pages yet.
                    </TableCell>
                  </TableRow>
                )}
                {data.map((lp) => (
                  <TableRow key={lp.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{lp.title}</p>
                        <p className="text-muted-foreground text-xs">
                          /{lp.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {THEME_LABELS[lp.theme_type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lp.view_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {lp.click_count.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={lp.is_published ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {lp.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(lp.created_at), "dd MMM yy")}
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
                            <Link href={`/dashboard/landing-page/${lp.id}`}>
                              <Eye className="mr-2 size-4" />
                              View Detail
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/builder/${lp.id}`}>
                              <Paintbrush className="mr-2 size-4" />
                              Open Builder
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/landing-page/${lp.id}/edit`}
                            >
                              <Pencil className="mr-2 size-4" />
                              Settings
                            </Link>
                          </DropdownMenuItem>
                          {lp.is_published && (
                            <QrCodeGenerator
                              url={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${lp.slug}`}
                              title={lp.title}
                              trigger={
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <QrCode className="mr-2 size-4" />
                                  QR Code
                                </DropdownMenuItem>
                              }
                            />
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleTogglePublish(lp.id, lp.is_published)
                            }
                          >
                            <Globe className="mr-2 size-4" />
                            {lp.is_published ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(lp.id)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete landing page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the page and all its analytics data.
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
