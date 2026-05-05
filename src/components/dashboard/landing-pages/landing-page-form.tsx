"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  landingPageSchema,
  type LandingPageInput,
} from "@/lib/validations/landing-page";
import {
  DEFAULT_THEME_CONFIG,
  type LandingPage,
  type Product,
} from "@/types/database";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlugInput } from "@/components/dashboard/landing-pages/slug-input";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  createLandingPage,
  updateLandingPage,
  assignProducts,
} from "@/actions/landing-pages";

const LP_TYPE_OPTIONS = [
  {
    value: "general",
    label: "General Page",
    desc: "Blank canvas — add any blocks you want",
    emoji: "📄",
    badge: null,
  },
  {
    value: "linkbio",
    label: "Link Bio",
    desc: "Social links + products (Linktree style)",
    emoji: "🔗",
    badge: "Template ready",
  },
  {
    value: "ecommerce",
    label: "E-Commerce",
    desc: "Full product sales page with checkout",
    emoji: "🛒",
    badge: "Template ready",
  },
  {
    value: "sales",
    label: "Sales Page",
    desc: "High-converting long-form landing page",
    emoji: "🚀",
    badge: "Template ready",
  },
] as const;

type LandingPageTypeOption = (typeof LP_TYPE_OPTIONS)[number]["value"];

const LP_TYPE_THEME_MAP: Record<
  LandingPageTypeOption,
  LandingPageInput["theme_type"]
> = {
  general: "linktree",
  linkbio: "linktree",
  ecommerce: "ecommerce",
  sales: "seedprod",
};

function getInitialPageType(
  landingPage?: LandingPage,
): LandingPageTypeOption {
  if (!landingPage) return "general";
  if (landingPage.theme_type === "ecommerce") return "ecommerce";
  if (landingPage.theme_type === "seedprod") return "sales";
  return "linkbio";
}

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Default)" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Nunito", label: "Nunito" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
];

interface Props {
  mode: "create" | "edit";
  landingPage?: LandingPage;
  availableProducts?: Product[];
  assignedProductIds?: string[];
}

export function LandingPageForm({
  mode,
  landingPage,
  availableProducts = [],
  assignedProductIds = [],
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedProducts, setSelectedProducts] =
    useState<string[]>(assignedProductIds);
  const [selectedPageType, setSelectedPageType] =
    useState<LandingPageTypeOption>(() => getInitialPageType(landingPage));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LandingPageInput>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      slug: landingPage?.slug ?? "",
      title: landingPage?.title ?? "",
      description: landingPage?.description ?? "",
      theme_type: landingPage?.theme_type ?? "linktree",
      // Store lp_type in theme_config.linkStyle field (reuse existing schema)
      // until a proper DB migration adds lp_type column
      theme_config: landingPage?.theme_config ?? {
        primaryColor: DEFAULT_THEME_CONFIG.primaryColor,
        secondaryColor: DEFAULT_THEME_CONFIG.secondaryColor,
        backgroundColor: DEFAULT_THEME_CONFIG.backgroundColor,
        textColor: DEFAULT_THEME_CONFIG.textColor,
        fontFamily: DEFAULT_THEME_CONFIG.fontFamily,
        borderRadius: DEFAULT_THEME_CONFIG.borderRadius,
        buttonStyle: DEFAULT_THEME_CONFIG.buttonStyle,
        backgroundType: DEFAULT_THEME_CONFIG.backgroundType,
        backgroundGradient: DEFAULT_THEME_CONFIG.backgroundGradient ?? "",
        backgroundImageUrl: DEFAULT_THEME_CONFIG.backgroundImageUrl ?? "",
        profileImageUrl: DEFAULT_THEME_CONFIG.profileImageUrl ?? "",
        coverImageUrl: DEFAULT_THEME_CONFIG.coverImageUrl ?? "",
        linkStyle: DEFAULT_THEME_CONFIG.linkStyle ?? null,
        shadow: DEFAULT_THEME_CONFIG.shadow ?? null,
      },
      tracking: landingPage?.tracking ?? {
        gtm_id: "",
        fb_pixel_id: "",
        histats_id: "",
        ga_id: "",
      },
      seo: landingPage?.seo ?? {
        title: "",
        description: "",
        og_image: "",
      },
      is_published: landingPage?.is_published ?? false,
    },
  });

  const themeConfig = useWatch({ control, name: "theme_config" });
  const isPublished = useWatch({ control, name: "is_published" });
  const tracking = useWatch({ control, name: "tracking" });
  const seo = useWatch({ control, name: "seo" });
  const titleValue = useWatch({ control, name: "title" });
  const slugValue = useWatch({ control, name: "slug" });

  // Detect if page uses V2 builder (has BlockV2 format blocks)
  const isV2Page = (() => {
    const blocks = landingPage?.blocks ?? [];
    if (blocks.length === 0) return true; // new page always → V2 builder
    const first = blocks[0] as Record<string, any>;
    return "props" in first && "layout" in first;
  })();

  function toggleProduct(id: string) {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  // ── FIX: onSubmit uses module-level imports, NOT dynamic import ────────
  async function onSubmit(data: LandingPageInput) {
    startTransition(async () => {
      // Call module-level imported server action
      const result =
        mode === "create"
          ? await createLandingPage(data)
          : await updateLandingPage(landingPage!.id, data);

      if (!result.success) {
        const msg =
          result.fieldErrors?.slug?.[0] ??
          result.error ??
          result.message ??
          "Something went wrong.";
        toast.error(msg);
        return;
      }

      const pageId = mode === "create" ? result.data?.id : landingPage!.id;

      // Assign products via module-level import
      if (pageId) {
        await assignProducts(pageId, selectedProducts);
      }

      toast.success(
        mode === "create" ? "Landing page created!" : "Settings saved!",
      );

      // V2 pages redirect to full-page builder
      if (mode === "create" && pageId && isV2Page) {
        router.push(`/builder/${pageId}`);
      } else {
        router.push(
          mode === "create"
            ? `/dashboard/landing-page/${pageId}`
            : `/dashboard/landing-page/${landingPage!.id}`,
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Appearance</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* ── GENERAL TAB ─────────────────────────────────── */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Page Settings</CardTitle>
              <CardDescription>
                Configure basic page information and URL slug.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Page Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="My Awesome Page"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-destructive text-xs">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <SlugInput
                value={slugValue ?? ""}
                onChange={(val) =>
                  setValue("slug", val, { shouldValidate: true })
                }
                excludeId={landingPage?.id}
                titleValue={titleValue}
                appUrl={process.env.NEXT_PUBLIC_APP_URL ?? ""}
                error={errors.slug?.message}
              />

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of this page..."
                  rows={3}
                />
              </div>

              {/* Page Type / Template */}
              <div className="space-y-2">
                <Label>Page Type</Label>
                <p className="text-xs text-muted-foreground">
                  Choose a starting point. You can always change blocks later in
                  the builder.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {LP_TYPE_OPTIONS.map((opt) => {
                    const isSelected = selectedPageType === opt.value;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedPageType(opt.value);
                          setValue(
                            "theme_type",
                            LP_TYPE_THEME_MAP[opt.value],
                            { shouldDirty: true, shouldValidate: true },
                          );
                        }}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all hover:border-primary/40 ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <div>
                          <p className="text-xs font-semibold">{opt.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                        {opt.badge && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary/90 px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                            {opt.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  💡 After saving, you&apos;ll be taken to the visual builder to
                  customize your page.
                </p>
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Switch
                  id="is_published"
                  checked={isPublished}
                  onCheckedChange={(v) =>
                    setValue("is_published", v, { shouldDirty: true })
                  }
                />
                <div>
                  <Label
                    htmlFor="is_published"
                    className="cursor-pointer font-medium"
                  >
                    {isPublished ? "Published" : "Draft"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isPublished
                      ? "Page is live and publicly accessible."
                      : "Page is hidden from public."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── APPEARANCE TAB ──────────────────────────────── */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize colors, fonts, and styling. These apply globally to
                your page in the builder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Colors */}
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    { key: "primaryColor", label: "Primary Color" },
                    { key: "secondaryColor", label: "Secondary Color" },
                    { key: "backgroundColor", label: "Background Color" },
                    { key: "textColor", label: "Text Color" },
                  ] as const
                ).map(({ key, label }) => (
                  <ColorPicker
                    key={key}
                    label={label}
                    value={(themeConfig?.[key] as string) ?? ""}
                    onChange={(color) =>
                      setValue(
                        "theme_config",
                        { ...(themeConfig as any), [key]: color },
                        { shouldDirty: true },
                      )
                    }
                  />
                ))}
              </div>

              {/* Font */}
              <div className="space-y-1.5">
                <Label>Font Family</Label>
                <Select
                  value={(themeConfig?.fontFamily as string) ?? "Inter"}
                  onValueChange={(v) =>
                    setValue(
                      "theme_config",
                      {
                        ...(themeConfig as any),
                        fontFamily: v,
                      },
                      { shouldDirty: true },
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Border radius */}
              <div className="space-y-1.5">
                <Label>Border Radius</Label>
                <Select
                  value={(themeConfig?.borderRadius as string) ?? "md"}
                  onValueChange={(v) =>
                    setValue(
                      "theme_config",
                      {
                        ...(themeConfig as any),
                        borderRadius: v,
                      },
                      { shouldDirty: true },
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {[
                      { value: "none", label: "Sharp (no radius)" },
                      { value: "sm", label: "Small" },
                      { value: "md", label: "Medium" },
                      { value: "lg", label: "Large" },
                      { value: "full", label: "Pill / Full" },
                    ].map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Background type */}
              <div className="space-y-1.5">
                <Label>Background Type</Label>
                <Select
                  value={(themeConfig?.backgroundType as string) ?? "solid"}
                  onValueChange={(v) =>
                    setValue(
                      "theme_config",
                      {
                        ...(themeConfig as any),
                        backgroundType: v,
                      },
                      { shouldDirty: true },
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="image">Background Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {themeConfig?.backgroundType === "gradient" && (
                <div className="space-y-1.5">
                  <Label>Gradient CSS</Label>
                  <Input
                    value={(themeConfig?.backgroundGradient as string) ?? ""}
                    onChange={(e) =>
                      setValue(
                        "theme_config",
                        {
                          ...(themeConfig as any),
                          backgroundGradient: e.target.value,
                        },
                        { shouldDirty: true },
                      )
                    }
                    placeholder="linear-gradient(135deg, #6366f1, #8b5cf6)"
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {themeConfig?.backgroundType === "image" && (
                <div className="space-y-1.5">
                  <Label>Background Image URL</Label>
                  <Input
                    value={(themeConfig?.backgroundImageUrl as string) ?? ""}
                    onChange={(e) =>
                      setValue(
                        "theme_config",
                        {
                          ...(themeConfig as any),
                          backgroundImageUrl: e.target.value,
                        },
                        { shouldDirty: true },
                      )
                    }
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* Profile image */}
              <div className="space-y-1.5">
                <Label>Profile Image URL</Label>
                <Input
                  value={(themeConfig?.profileImageUrl as string) ?? ""}
                  onChange={(e) =>
                    setValue(
                      "theme_config",
                      {
                        ...(themeConfig as any),
                        profileImageUrl: e.target.value,
                      },
                      { shouldDirty: true },
                    )
                  }
                  placeholder="https://... (your avatar/logo)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PRODUCTS TAB ────────────────────────────────── */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Assign Products</CardTitle>
              <CardDescription>
                Select products to assign to this page. Assigned products can be
                used in product blocks in the builder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableProducts.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <p className="font-medium text-sm">No products found</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Create products first, then assign them here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    {selectedProducts.length} of {availableProducts.length}{" "}
                    products selected
                  </p>
                  <div className="grid gap-2 max-h-80 overflow-y-auto pr-1">
                    {availableProducts.map((product) => {
                      const thumb =
                        product.images.find((i) => i.is_primary)?.url ??
                        product.images[0]?.url;
                      const isSelected = selectedProducts.includes(product.id);
                      return (
                        <label
                          key={product.id}
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          {thumb && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt={product.title}
                              className="size-10 rounded-md object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {product.title}
                            </p>
                            {product.price != null && (
                              <p className="text-xs text-muted-foreground">
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: product.currency ?? "IDR",
                                  maximumFractionDigits: 0,
                                }).format(product.price)}
                              </p>
                            )}
                          </div>
                          {!product.is_active && (
                            <Badge
                              variant="outline"
                              className="text-xs shrink-0"
                            >
                              Inactive
                            </Badge>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TRACKING TAB ────────────────────────────────── */}
        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Tracking & Analytics</CardTitle>
              <CardDescription>
                Connect your analytics and advertising pixels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "gtm_id",
                  label: "Google Tag Manager ID",
                  placeholder: "GTM-XXXXXXX",
                },
                {
                  key: "fb_pixel_id",
                  label: "Facebook Pixel ID",
                  placeholder: "1234567890123456",
                },
                {
                  key: "ga_id",
                  label: "Google Analytics 4 ID",
                  placeholder: "G-XXXXXXXXXX",
                },
                {
                  key: "histats_id",
                  label: "Histats ID",
                  placeholder: "1234567",
                },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label>{field.label}</Label>
                  <Input
                    value={
                      ((tracking as Record<string, unknown>)?.[
                        field.key
                      ] as string) ?? ""
                    }
                    onChange={(e) =>
                      setValue(
                        "tracking",
                        {
                          ...(tracking as Record<string, unknown>),
                          [field.key]: e.target.value,
                        },
                        { shouldDirty: true },
                      )
                    }
                    placeholder={field.placeholder}
                    className="font-mono"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SEO TAB ─────────────────────────────────────── */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize how your page appears in search results and social
                shares.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>SEO Title</Label>
                <Input
                  value={
                    ((seo as Record<string, unknown>)?.title as string) ?? ""
                  }
                  onChange={(e) =>
                    setValue(
                      "seo",
                      {
                        ...(seo as Record<string, unknown>),
                        title: e.target.value,
                      },
                      { shouldDirty: true },
                    )
                  }
                  placeholder="Page title for search engines..."
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use page title.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Meta Description</Label>
                <Textarea
                  value={
                    ((seo as Record<string, unknown>)?.description as string) ??
                    ""
                  }
                  onChange={(e) =>
                    setValue(
                      "seo",
                      {
                        ...(seo as Record<string, unknown>),
                        description: e.target.value,
                      },
                      { shouldDirty: true },
                    )
                  }
                  placeholder="Brief description for search results (160 chars max)..."
                  rows={3}
                  maxLength={160}
                />
              </div>
              <div className="space-y-1.5">
                <Label>OG Image URL</Label>
                <Input
                  value={
                    ((seo as Record<string, unknown>)?.og_image as string) ?? ""
                  }
                  onChange={(e) =>
                    setValue(
                      "seo",
                      {
                        ...(seo as Record<string, unknown>),
                        og_image: e.target.value,
                      },
                      { shouldDirty: true },
                    )
                  }
                  placeholder="https://... (shown when shared on social media)"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 1200×630px.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-32">
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create & Open Builder"
              : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
