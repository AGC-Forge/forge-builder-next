"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Search,
  Trash2,
  Edit,
  Shield,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { deleteUser, updateUser } from "@/actions/users";
import type { Profile } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

interface Props {
  data: Profile[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export function UsersTable({ data, total, page, pageCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editData, setEditData] = useState<Partial<Profile>>({});

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
      const result = await deleteUser(id);
      if (result.success) toast.success("User deleted.");
      else toast.error(result.error ?? "Failed.");
      setDeleteId(null);
    });
  }

  function handleEdit() {
    if (!editUser) return;
    startTransition(async () => {
      const payload = {
        full_name: editData.full_name ?? undefined,
        role: editData.role,
        is_active: editData.is_active,
        max_products: editData.max_products,
        max_landing_pages: editData.max_landing_pages,
      };
      const result = await updateUser(editUser.id, payload);
      if (result.success) toast.success("User updated.");
      else toast.error(result.error ?? "Failed.");
      setEditUser(null);
      setEditData({});
    });
  }

  function handleToggleRole(user: Profile) {
    startTransition(async () => {
      const newRole = user.role === "admin" ? "member" : "admin";
      const result = await updateUser(user.id, { role: newRole });
      if (result.success) toast.success(`Role changed to ${newRole}.`);
      else toast.error(result.error ?? "Failed.");
    });
  }

  function handleToggleStatus(user: Profile) {
    startTransition(async () => {
      const result = await updateUser(user.id, { is_active: !user.is_active });
      if (result.success) toast.success(result.message ?? "Updated.");
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
                placeholder="Search by email…"
                defaultValue={searchParams.get("search") ?? ""}
                onChange={(e) =>
                  updateParams({ search: e.target.value || undefined })
                }
                className="pl-8"
              />
            </div>
            <Select
              value={searchParams.get("role") ?? "all"}
              onValueChange={(v) =>
                updateParams({ role: v === "all" ? undefined : v })
              }
            >
              <SelectTrigger className="w-35">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
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
              {total} user{total !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
                {data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage src={user.avatar_url ?? ""} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.full_name ?? user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {user.full_name ?? "—"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.is_active ? "outline" : "destructive"}
                        className="text-xs"
                      >
                        {user.is_active ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {user.max_products}P / {user.max_landing_pages}LP
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(user.created_at), "dd MMM yy")}
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
                          <DropdownMenuItem
                            onClick={() => {
                              setEditUser(user);
                              setEditData({
                                full_name: user.full_name ?? "",
                                role: user.role,
                                max_products: user.max_products,
                                max_landing_pages: user.max_landing_pages,
                              });
                            }}
                          >
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleRole(user)}
                          >
                            {user.role === "admin" ? (
                              <>
                                <ShieldOff className="mr-2 size-4" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 size-4" />
                                Make Admin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.is_active ? "Suspend" : "Reactivate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(user.id)}
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

      {/* Edit dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Full Name</Label>
              <Input
                value={(editData.full_name as string) ?? ""}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, full_name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={(editData.role as string) ?? "member"}
                onValueChange={(v) =>
                  setEditData((d) => ({
                    ...d,
                    role: v as "admin" | "member",
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Max Products</Label>
                <Input
                  type="number"
                  value={editData.max_products ?? 50}
                  onChange={(e) =>
                    setEditData((d) => ({
                      ...d,
                      max_products: Number(e.target.value),
                    }))
                  }
                  className="mt-1"
                  min={1}
                />
              </div>
              <div>
                <Label>Max Landing Pages</Label>
                <Input
                  type="number"
                  value={editData.max_landing_pages ?? 10}
                  onChange={(e) =>
                    setEditData((d) => ({
                      ...d,
                      max_landing_pages: Number(e.target.value),
                    }))
                  }
                  className="mt-1"
                  min={1}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account and all their data.
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
