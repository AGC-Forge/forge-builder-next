"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AppWindow,
  Wifi,
  WifiOff,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  createApplication,
  updateApplication,
  deleteApplication,
  toggleApplicationStatus,
} from "@/actions/applications";
import type { Application, AppType } from "@/types/builder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
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

/**
 * App type metadata.
 */
const APP_TYPES: {
  value: AppType;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    value: "wa_rotator",
    label: "WhatsApp Rotator",
    emoji: "💬",
    description: "Round-robin WA agent routing",
  },
  {
    value: "tracking",
    label: "Tracking Pixels",
    emoji: "📊",
    description: "GTM, FB Pixel, TikTok, Histats",
  },
  {
    value: "payment_method",
    label: "Payment Method",
    emoji: "💳",
    description: "Bank, wallet, QRIS, etc.",
  },
  {
    value: "wa_template",
    label: "WA Message Template",
    emoji: "📝",
    description: "WhatsApp message templates",
  },
  {
    value: "email_template",
    label: "Email Template",
    emoji: "📧",
    description: "Reusable email content",
  },
  {
    value: "email_notification",
    label: "Email Notification",
    emoji: "🔔",
    description: "Auto-send triggers",
  },
  {
    value: "logistic_kurir",
    label: "Logistic / Kurir",
    emoji: "🚚",
    description: "Shipping provider config",
  },
  {
    value: "pricing_item",
    label: "Pricing Item",
    emoji: "💰",
    description: "Pricing plan config",
  },
  {
    value: "custom_script",
    label: "Custom Script",
    emoji: "⚙️",
    description: "Code snippets to inject",
  },
  {
    value: "openrouter_ai",
    label: "AI Config",
    emoji: "🤖",
    description: "OpenRouter API settings",
  },
];

interface Props {
  initialData: Application[];
}

export function ApplicationsTable({ initialData }: Props) {
  const [apps, setApps] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppType | "all">("all");

  const filtered =
    activeTab === "all" ? apps : apps.filter((a) => a.app_type === activeTab);

  function handleToggle(app: Application) {
    startTransition(async () => {
      const result = await toggleApplicationStatus(app.id, !app.is_active);
      if (result.success) {
        setApps((prev) =>
          prev.map((a) =>
            a.id === app.id ? { ...a, is_active: !a.is_active } : a,
          ),
        );
        toast.success(result.message);
      } else toast.error(result.error ?? "Failed.");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteApplication(id);
      if (result.success) {
        setApps((prev) => prev.filter((a) => a.id !== id));
        toast.success("Application deleted.");
      } else toast.error(result.error ?? "Failed.");
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-muted-foreground text-sm">
            Integrations used by your landing page blocks.
          </p>
        </div>
        <CreateApplicationDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(app) => {
            setApps((prev) => [app, ...prev]);
            setCreateOpen(false);
          }}
        />
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("all")}
        >
          All ({apps.length})
        </Button>
        {APP_TYPES.filter((t) => apps.some((a) => a.app_type === t.value)).map(
          (t) => (
            <Button
              key={t.value}
              variant={activeTab === t.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(t.value)}
            >
              {t.emoji} {t.label} (
              {apps.filter((a) => a.app_type === t.value).length})
            </Button>
          ),
        )}
      </div>

      {/* App cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
          <AppWindow className="size-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium">No applications yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first integration to use in builder blocks.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => {
            const meta = APP_TYPES.find((t) => t.value === app.app_type);
            return (
              <Card key={app.id} className={app.is_active ? "" : "opacity-60"}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta?.emoji ?? "🔌"}</span>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {app.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {meta?.label}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditApp(app)}>
                          <Pencil className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle(app)}>
                          {app.is_active ? (
                            <>
                              <WifiOff className="size-4" /> Disable
                            </>
                          ) : (
                            <>
                              <Wifi className="size-4" /> Enable
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(app.id)}
                        >
                          <Trash2 className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={app.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {app.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(app.created_at), "dd MMM yyyy")}
                    </span>
                  </div>
                  {/* Config preview */}
                  <div className="mt-2 rounded-md bg-muted/50 px-2 py-1.5 font-mono text-[10px] text-muted-foreground truncate">
                    {JSON.stringify(app.config).slice(0, 60)}...
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      {editApp && (
        <EditApplicationDialog
          app={editApp}
          onUpdated={(updated) => {
            setApps((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a)),
            );
            setEditApp(null);
          }}
          onClose={() => setEditApp(null)}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the application. Blocks using this
              app may stop working.
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

/**
 * Create Create dialog.
 */
function CreateApplicationDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (app: Application) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [appType, setAppType] = useState<AppType>("wa_rotator");
  const [name, setName] = useState("");
  const [config, setConfig] = useState<Record<string, unknown>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createApplication({
        app_type: appType,
        name,
        config,
      });
      if (result.success && result.data) {
        toast.success("Application created!");
        onCreated(result.data);
        setName("");
        setConfig({});
      } else toast.error(result.error ?? "Failed.");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" /> Add Application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Application Type</Label>
            <Select
              value={appType}
              onValueChange={(v) => {
                setAppType(v as AppType);
                setConfig({});
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APP_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.emoji} {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {APP_TYPES.find((t) => t.value === appType)?.description}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main WhatsApp CS"
              required
            />
          </div>
          <AppConfigEditor
            appType={appType}
            config={config}
            onChange={setConfig}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Edit dialog.
 */
function EditApplicationDialog({
  app,
  onUpdated,
  onClose,
}: {
  app: Application;
  onUpdated: (app: Application) => void;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(app.name);
  const [config, setConfig] = useState<Record<string, unknown>>(app.config);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateApplication(app.id, { name, config });
      if (result.success && result.data) {
        toast.success("Application updated!");
        onUpdated(result.data);
      } else toast.error(result.error ?? "Failed.");
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <AppConfigEditor
            appType={app.app_type}
            config={config}
            onChange={setConfig}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Dynamic config editor per app type.
 */
function AppConfigEditor({
  appType,
  config,
  onChange,
}: {
  appType: AppType;
  config: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const set = (k: string, v: unknown) => onChange({ ...config, [k]: v });

  if (appType === "wa_rotator") {
    const agents = (config.agents as {
      name: string;
      number: string;
      label: string;
    }[]) ?? [{ name: "", number: "", label: "" }];
    const updateAgent = (i: number, k: string, v: string) => {
      const updated = agents.map((a, idx) =>
        idx === i ? { ...a, [k]: v } : a,
      );
      set("agents", updated);
    };
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Rotation Mode</Label>
          <Select
            value={(config.mode as string) ?? "round-robin"}
            onValueChange={(v) => set("mode", v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round-robin">Round Robin</SelectItem>
              <SelectItem value="random">Random</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Agents</Label>
          {agents.map((agent, i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-1.5 rounded-lg border p-2"
            >
              <Input
                value={agent.name}
                onChange={(e) => updateAgent(i, "name", e.target.value)}
                placeholder="Name"
                className="h-7 text-xs"
              />
              <Input
                value={agent.number}
                onChange={(e) => updateAgent(i, "number", e.target.value)}
                placeholder="628xxx"
                className="h-7 text-xs"
              />
              <Input
                value={agent.label}
                onChange={(e) => updateAgent(i, "label", e.target.value)}
                placeholder="Label"
                className="h-7 text-xs"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs h-7"
            onClick={() =>
              set("agents", [...agents, { name: "", number: "", label: "" }])
            }
          >
            <Plus className="size-3" /> Add Agent
          </Button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Default WA Message</Label>
          <Textarea
            value={(config.defaultMessage as string) ?? ""}
            onChange={(e) => set("defaultMessage", e.target.value)}
            placeholder="Halo, saya ingin bertanya..."
            className="text-xs"
            rows={2}
          />
        </div>
      </div>
    );
  }

  if (appType === "tracking") {
    return (
      <div className="space-y-2">
        {[
          {
            k: "gtm_id",
            label: "Google Tag Manager ID",
            placeholder: "GTM-XXXXXXX",
          },
          {
            k: "fb_pixel_id",
            label: "Facebook Pixel ID",
            placeholder: "1234567890",
          },
          {
            k: "tiktok_pixel_id",
            label: "TikTok Pixel ID",
            placeholder: "XXXXXXXXXX",
          },
          { k: "histats_id", label: "Histats ID", placeholder: "1234567" },
          {
            k: "ga_id",
            label: "Google Analytics 4 ID",
            placeholder: "G-XXXXXXXXXX",
          },
        ].map((field) => (
          <div key={field.k} className="space-y-1">
            <Label className="text-xs">{field.label}</Label>
            <Input
              value={(config[field.k] as string) ?? ""}
              onChange={(e) => set(field.k, e.target.value)}
              placeholder={field.placeholder}
              className="h-7 text-xs"
            />
          </div>
        ))}
      </div>
    );
  }

  if (appType === "payment_method") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Payment Type</Label>
          <Select
            value={(config.type as string) ?? "bank"}
            onValueChange={(v) => set("type", v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "bank",
                "gopay",
                "ovo",
                "dana",
                "shopeepay",
                "qris",
                "paypal",
                "stripe",
                "cod",
              ].map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Account Name / Bank Name</Label>
          <Input
            value={(config.account_name as string) ?? ""}
            onChange={(e) => set("account_name", e.target.value)}
            placeholder="Bank BCA - Atas nama Budi"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Account Number</Label>
          <Input
            value={(config.account_number as string) ?? ""}
            onChange={(e) => set("account_number", e.target.value)}
            placeholder="1234567890"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">QR Code Image URL (optional)</Label>
          <Input
            value={(config.qr_url as string) ?? ""}
            onChange={(e) => set("qr_url", e.target.value)}
            placeholder="https://..."
            className="h-7 text-xs"
          />
        </div>
      </div>
    );
  }

  if (appType === "wa_template") {
    return (
      <div className="space-y-2">
        <Label className="text-sm">Message Template</Label>
        <Textarea
          value={(config.template_text as string) ?? ""}
          onChange={(e) => set("template_text", e.target.value)}
          placeholder="Halo {name}, terima kasih sudah memesan {product}!"
          className="text-xs"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Variables: {"{name}"}, {"{product}"}, {"{order_id}"}, {"{total}"}
        </p>
      </div>
    );
  }

  if (appType === "email_template") {
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-xs">Subject</Label>
          <Input
            value={(config.subject as string) ?? ""}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="Order Confirmation - {order_id}"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Body (HTML)</Label>
          <Textarea
            value={(config.body_html as string) ?? ""}
            onChange={(e) => set("body_html", e.target.value)}
            placeholder="<p>Hi {name},...</p>"
            className="text-xs font-mono"
            rows={5}
          />
        </div>
      </div>
    );
  }

  if (appType === "email_notification") {
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-xs">Trigger Event</Label>
          <Select
            value={(config.trigger as string) ?? "order_created"}
            onValueChange={(v) => set("trigger", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order_created">Order Created</SelectItem>
              <SelectItem value="order_completed">Order Completed</SelectItem>
              <SelectItem value="form_submitted">Form Submitted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Send to Emails (comma-separated)</Label>
          <Input
            value={(config.to_emails as string) ?? ""}
            onChange={(e) => set("to_emails", e.target.value)}
            placeholder="admin@example.com, cs@example.com"
            className="h-7 text-xs"
          />
        </div>
      </div>
    );
  }

  if (appType === "logistic_kurir") {
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-xs">Provider</Label>
          <Select
            value={(config.provider as string) ?? "jne"}
            onValueChange={(v) => set("provider", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "JNE",
                "JNT",
                "SiCepat",
                "Anteraja",
                "Pos Indonesia",
                "Gosend",
                "Grab Express",
              ].map((p) => (
                <SelectItem key={p} value={p.toLowerCase().replace(/ /g, "_")}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Origin City</Label>
          <Input
            value={(config.origin_city as string) ?? ""}
            onChange={(e) => set("origin_city", e.target.value)}
            placeholder="Jakarta Selatan"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Flat Rate (IDR, 0 = dynamic)</Label>
          <Input
            type="number"
            value={(config.flat_rate as number) ?? 0}
            onChange={(e) => set("flat_rate", Number(e.target.value))}
            className="h-7 text-xs"
          />
        </div>
      </div>
    );
  }

  if (appType === "pricing_item") {
    const features = (config.features as string[]) ?? [""];
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Plan Name</Label>
            <Input
              value={(config.name as string) ?? ""}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Pro"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Price (IDR)</Label>
            <Input
              type="number"
              value={(config.price as number) ?? 0}
              onChange={(e) => set("price", Number(e.target.value))}
              className="h-7 text-xs"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Period</Label>
          <Select
            value={(config.period as string) ?? "month"}
            onValueChange={(v) => set("period", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">per month</SelectItem>
              <SelectItem value="year">per year</SelectItem>
              <SelectItem value="one-time">one-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Features (one per line)</Label>
          <Textarea
            value={features.join("\n")}
            onChange={(e) =>
              set("features", e.target.value.split("\n").filter(Boolean))
            }
            placeholder="Unlimited pages&#10;All blocks&#10;Priority support"
            className="text-xs"
            rows={4}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">CTA Text</Label>
          <Input
            value={(config.cta_label as string) ?? "Get Started"}
            onChange={(e) => set("cta_label", e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">CTA URL</Label>
          <Input
            value={(config.cta_url as string) ?? ""}
            onChange={(e) => set("cta_url", e.target.value)}
            placeholder="https://..."
            className="h-7 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={(config.highlight as boolean) ?? false}
            onCheckedChange={(v) => set("highlight", v)}
            id="highlight"
          />
          <Label htmlFor="highlight" className="text-xs">
            Mark as highlighted / popular
          </Label>
        </div>
      </div>
    );
  }

  if (appType === "custom_script") {
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-xs">Inject Position</Label>
          <Select
            value={(config.inject_position as string) ?? "body"}
            onValueChange={(v) => set("inject_position", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="head">{"<head>"}</SelectItem>
              <SelectItem value="body">{"<body> start"}</SelectItem>
              <SelectItem value="footer">{"</body> end"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Script Code</Label>
          <Textarea
            value={(config.code as string) ?? ""}
            onChange={(e) => set("code", e.target.value)}
            placeholder="<script>...</script>"
            className="text-xs font-mono"
            rows={6}
          />
        </div>
      </div>
    );
  }

  if (appType === "openrouter_ai") {
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-xs">OpenRouter API Key</Label>
          <Input
            type="password"
            value={(config.api_key as string) ?? ""}
            onChange={(e) => set("api_key", e.target.value)}
            placeholder="sk-or-..."
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Model</Label>
          <Input
            value={(config.model_id as string) ?? ""}
            onChange={(e) => set("model_id", e.target.value)}
            placeholder="anthropic/claude-3-5-sonnet"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Max Tokens</Label>
          <Input
            type="number"
            value={(config.max_tokens as number) ?? 2000}
            onChange={(e) => set("max_tokens", Number(e.target.value))}
            className="h-7 text-xs"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs">Config (JSON)</Label>
      <Textarea
        value={JSON.stringify(config, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {}
        }}
        className="font-mono text-xs"
        rows={4}
      />
    </div>
  );
}
