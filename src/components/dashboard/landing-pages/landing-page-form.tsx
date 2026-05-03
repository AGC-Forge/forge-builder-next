"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  landingPageSchema,
  type LandingPageInput,
  type LandingPageFormInput,
} from "@/lib/validations/landing-page";
import {
  createLandingPage,
  updateLandingPage,
  assignProducts,
} from "@/actions/landing-pages";
import {
  DEFAULT_THEME_CONFIG,
  type ThemeConfig,
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

const THEME_OPTIONS = [
  { value: "linktree", label: "Linktree", desc: "Clean vertical link list" },
  { value: "beacons", label: "Beacons", desc: "Bio page with large cards" },
  { value: "taplink", label: "TapLink", desc: "Grid of rounded buttons" },
  { value: "campsite", label: "Campsite", desc: "Minimal bio page style" },
  { value: "carrd", label: "Carrd", desc: "Single-page portfolio" },
  { value: "seedprod", label: "SeedProd", desc: "Coming-soon / sales page" },
  { value: "lnkbio", label: "Lnk.bio", desc: "Micro landing page" },
  {
    value: "ecommerce",
    label: "E-Commerce",
    desc: "Product-focused shop style",
  },
] as const;

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
      theme_config: landingPage?.theme_config ?? {
        primaryColor: DEFAULT_THEME_CONFIG.primaryColor,
        secondaryColor: DEFAULT_THEME_CONFIG.secondaryColor,
        backgroundColor: DEFAULT_THEME_CONFIG.backgroundColor,
        textColor: DEFAULT_THEME_CONFIG.textColor,
        accentColor: DEFAULT_THEME_CONFIG.accentColor ?? "",
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

  const themeType = useWatch({ control, name: "theme_type" });
  const themeConfig = useWatch({ control, name: "theme_config" });
  const isPublished = useWatch({ control, name: "is_published" });
  const tracking = useWatch({ control, name: "tracking" });
  const seo = useWatch({ control, name: "seo" });

  function toggleProduct(id: string) {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function onSubmit(data: LandingPageInput) {
    startTransition(async () => {
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

      // Assign products
      if (pageId) {
        await assignProducts(pageId, selectedProducts);
      }

      toast.success(
        mode === "create" ? "Landing page created!" : "Settings saved!",
      );
      router.push(
        mode === "create"
          ? `/dashboard/landing-page/${pageId}/builder`
          : `/dashboard/landing-page/${pageId}`,
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* ── General ── */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Page Settings</CardTitle>
              <CardDescription>
                Basic configuration for your landing page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">
                  Page Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g. My Product Showcase"
                  className="mt-1"
                />
                {errors.title && (
                  <p className="mt-1 text-destructive text-xs">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">
                  URL Slug <span className="text-destructive">*</span>
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="shrink-0 text-muted-foreground text-sm">
                    {process.env.NEXT_PUBLIC_APP_URL ?? "https://yoursite.com"}/
                  </span>
                  <Input
                    id="slug"
                    {...register("slug")}
                    placeholder="my-product-page"
                    className="font-mono"
                  />
                </div>
                {errors.slug && (
                  <p className="mt-1 text-destructive text-xs">
                    {errors.slug.message}
                  </p>
                )}
                <p className="mt-1 text-muted-foreground text-xs">
                  Lowercase letters, numbers, hyphens only. Min 3 chars.
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Short description of this landing page…"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={isPublished}
                  onCheckedChange={(v) => setValue("is_published", v)}
                />
                <div>
                  <Label>Published</Label>
                  <p className="text-muted-foreground text-xs">
                    Unpublished pages are hidden from visitors.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Theme ── */}
        <TabsContent value="theme">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Style</CardTitle>
                <CardDescription>
                  Choose the visual style for your landing page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue("theme_type", opt.value)}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        themeType === opt.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-muted-foreground text-xs">
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theme Colors & Style</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {(
                  [
                    { key: "primaryColor", label: "Primary Color" },
                    { key: "secondaryColor", label: "Secondary Color" },
                    { key: "backgroundColor", label: "Background Color" },
                    { key: "textColor", label: "Text Color" },
                    { key: "accentColor", label: "Accent Color" },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-xs">{label}</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={themeConfig?.[key] ?? "#000000"}
                        onChange={(e) =>
                          setValue(
                            "theme_config",
                            {
                              ...(themeConfig as any),
                              [key]: e.target.value,
                            },
                            { shouldDirty: true },
                          )
                        }
                        className="h-8 w-16 cursor-pointer rounded border"
                      />
                      <Input
                        value={themeConfig?.[key] ?? ""}
                        onChange={(e) =>
                          setValue(
                            "theme_config",
                            {
                              ...(themeConfig as any),
                              [key]: e.target.value,
                            },
                            { shouldDirty: true },
                          )
                        }
                        className="h-8 font-mono text-xs"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <Label className="text-xs">Font Family</Label>
                  <Select
                    value={themeConfig?.fontFamily ?? "Inter"}
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
                    <SelectTrigger className="mt-1 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Inter",
                        "Roboto",
                        "Poppins",
                        "Nunito",
                        "Lato",
                        "Montserrat",
                        "Open Sans",
                        "Raleway",
                      ].map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Border Radius</Label>
                  <Select
                    value={themeConfig?.borderRadius ?? "md"}
                    onValueChange={(v) =>
                      setValue(
                        "theme_config",
                        {
                          ...(themeConfig as any),
                          borderRadius: v as ThemeConfig["borderRadius"],
                        },
                        { shouldDirty: true },
                      )
                    }
                  >
                    <SelectTrigger className="mt-1 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["none", "sm", "md", "lg", "full"].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Button Style</Label>
                  <Select
                    value={themeConfig?.buttonStyle ?? "filled"}
                    onValueChange={(v) =>
                      setValue(
                        "theme_config",
                        {
                          ...(themeConfig as any),
                          buttonStyle: v as ThemeConfig["buttonStyle"],
                        },
                        { shouldDirty: true },
                      )
                    }
                  >
                    <SelectTrigger className="mt-1 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="outlined">Outlined</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Products ── */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Assign Products</CardTitle>
              <CardDescription>
                Select products to show on this landing page. You can also
                assign them in the builder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No active products found. Add products first.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableProducts.map((product) => {
                    const thumb =
                      product.images.find((i) => i.is_primary)?.url ??
                      product.images[0]?.url;
                    return (
                      <label
                        key={product.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                        />
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            className="size-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-muted" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.title}</p>
                          {product.price != null && (
                            <p className="text-muted-foreground text-xs">
                              {product.currency}{" "}
                              {product.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {selectedProducts.length > 0 && (
                <p className="mt-3 text-muted-foreground text-xs">
                  {selectedProducts.length} product
                  {selectedProducts.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tracking ── */}
        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>
                Tracking codes injected on this landing page only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  {
                    field: "tracking.gtm_id",
                    label: "Google Tag Manager",
                    placeholder: "GTM-XXXXXXX",
                    key: "gtm_id",
                  },
                  {
                    field: "tracking.ga_id",
                    label: "Google Analytics 4",
                    placeholder: "G-XXXXXXXXXX",
                    key: "ga_id",
                  },
                  {
                    field: "tracking.fb_pixel_id",
                    label: "Facebook Pixel ID",
                    placeholder: "1234567890",
                    key: "fb_pixel_id",
                  },
                  {
                    field: "tracking.histats_id",
                    label: "Histats ID",
                    placeholder: "1234567",
                    key: "histats_id",
                  },
                ] as const
              ).map(({ label, placeholder, key }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    placeholder={placeholder}
                    className="mt-1"
                    defaultValue={
                      (
                        landingPage?.tracking as unknown as Record<
                          string,
                          string
                        >
                      )?.[key] ?? ""
                    }
                    onChange={(e) =>
                      setValue("tracking", {
                        ...tracking,
                        [key]: e.target.value || null,
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SEO ── */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize how your page appears in search engines and social
                media.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>SEO Title</Label>
                <Input
                  placeholder="Page title for search engines (max 70 chars)"
                  defaultValue={landingPage?.seo?.title ?? ""}
                  onChange={(e) =>
                    setValue("seo", {
                      ...seo,
                      title: e.target.value || null,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  placeholder="Brief description for search engines (max 160 chars)"
                  defaultValue={landingPage?.seo?.description ?? ""}
                  onChange={(e) =>
                    setValue("seo", {
                      ...seo,
                      description: e.target.value || null,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>OG Image URL</Label>
                <Input
                  placeholder="https://… (recommended: 1200×630)"
                  defaultValue={landingPage?.seo?.og_image ?? ""}
                  onChange={(e) =>
                    setValue("seo", {
                      ...seo,
                      og_image: e.target.value || null,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/landing-page")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create & Open Builder"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
