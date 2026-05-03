/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Wand2, PenLine } from "lucide-react";
import {
  productSchema,
  type ProductFormInput,
  type ProductInput,
} from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/actions/products";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types/database";
import type { AnalyzeProductOutput } from "@/lib/ai/analyze-product";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { ImageUploader } from "./image-uploader";
import { AiAnalyzer } from "./ai-analyzer";

interface Props {
  mode: "create" | "edit";
  product?: Product;
}

export function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inputMode, setInputMode] = useState<"manual" | "auto">(
    product?.input_mode ?? "manual",
  );
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title ?? "",
      subtitle: product?.subtitle ?? "",
      description: product?.description ?? "",
      price: product?.price ?? undefined,
      original_price: product?.original_price ?? undefined,
      currency: product?.currency ?? "IDR",
      discount_label: product?.discount_label ?? "",
      category: product?.category ?? "",
      subcategory: product?.subcategory ?? "",
      images: product?.images ?? [],
      marketplace_url: product?.marketplace_url ?? "",
      affiliate_url: product?.affiliate_url ?? "",
      shop_name: product?.shop_name ?? "",
      product_rating: product?.product_rating ?? undefined,
      review_count: product?.review_count ?? 0,
      sold_count: product?.sold_count ?? 0,
      tags: product?.tags ?? [],
      features: product?.features ?? [],
      specifications: product?.specifications ?? [],
      badges: product?.badges ?? [],
      is_active: product?.is_active ?? true,
      input_mode: product?.input_mode ?? "manual",
    },
  });

  const images = watch("images");
  const category = watch("category");
  const tags = watch("tags");
  const features = watch("features");
  const specifications = watch("specifications");
  const badges = watch("badges");
  const title = watch("title");
  const isActive = watch("is_active");

  const selectedCategory = category
    ? PRODUCT_CATEGORIES[category as keyof typeof PRODUCT_CATEGORIES]
    : null;

  function applyAiResult(result: AnalyzeProductOutput) {
    if (result.subtitle) setValue("subtitle", result.subtitle);
    if (result.description) setValue("description", result.description);
    if (result.price) setValue("price", result.price);
    if (result.original_price)
      setValue("original_price", result.original_price);
    if (result.discount_label)
      setValue("discount_label", result.discount_label);
    if (result.shop_name) setValue("shop_name", result.shop_name);
    if (result.product_rating)
      setValue("product_rating", result.product_rating);
    if (result.review_count) setValue("review_count", result.review_count);
    if (result.sold_count) setValue("sold_count", result.sold_count);
    if (result.currency) setValue("currency", result.currency);
    if (result.tags?.length) setValue("tags", result.tags);
    if (result.features?.length) setValue("features", result.features);
    if (result.specifications?.length)
      setValue("specifications", result.specifications);
    if (result.badges?.length) setValue("badges", result.badges);
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags?.includes(t)) {
      setValue("tags", [...(tags ?? []), t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setValue(
      "tags",
      tags?.filter((t) => t !== tag),
    );
  }

  function addFeature() {
    setValue("features", [...(features ?? []), { title: "", description: "" }]);
  }

  function addSpec() {
    setValue("specifications", [
      ...(specifications ?? []),
      { name: "", value: "" },
    ]);
  }

  function addBadge() {
    setValue("badges", [
      ...(badges ?? []),
      { text: "", color: "#ffffff", bgColor: "#6366f1" },
    ]);
  }

  function onSubmit(data: ProductInput) {
    startTransition(async () => {
      const payload = { ...data, input_mode: inputMode };
      const result =
        mode === "create"
          ? await createProduct(payload)
          : await updateProduct(product!.id, payload);

      if (result.success) {
        toast.success(result.message ?? "Saved!");
        router.push("/dashboard/products");
      } else {
        toast.error(result.error ?? result.message ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Input mode toggle */}
      <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
        <button
          type="button"
          onClick={() => setInputMode("manual")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            inputMode === "manual"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PenLine className="size-4" />
          Manual
        </button>
        <button
          type="button"
          onClick={() => setInputMode("auto")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            inputMode === "auto"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wand2 className="size-4" />
          AI Auto-fill
        </button>
        <span className="ml-auto text-muted-foreground text-xs">
          {inputMode === "auto"
            ? "AI will analyze your title & image"
            : "Fill product details manually"}
        </span>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="links">Links & Sales</TabsTrigger>
        </TabsList>

        {/* ── Basic Info ── */}
        <TabsContent value="basic" className="space-y-4">
          {inputMode === "auto" && (
            <AiAnalyzer
              title={title}
              category={category ?? undefined}
              images={
                images?.map((img) => ({
                  ...img,
                  source: img.source ?? "url",
                })) ?? []
              }
              onResult={applyAiResult}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Product name, description, and category.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">
                  Product Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g. Samsung Galaxy S25 Ultra"
                  className="mt-1"
                />
                {errors.title && (
                  <p className="mt-1 text-destructive text-xs">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle / Tagline</Label>
                <Input
                  id="subtitle"
                  {...register("subtitle")}
                  placeholder="Short catchy tagline"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Detailed product description…"
                  className="mt-1 min-h-30"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={category ?? ""}
                    onValueChange={(v) => {
                      setValue("category", v);
                      setValue("subcategory", "");
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRODUCT_CATEGORIES).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>
                          {cat.emoji} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Subcategory</Label>
                  <Select
                    value={watch("subcategory") ?? ""}
                    onValueChange={(v) => setValue("subcategory", v)}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedCategory?.subcategories ?? []).map((sub) => (
                        <SelectItem key={sub.value} value={sub.value}>
                          {sub.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tag and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                {tags && tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-0.5 rounded-full hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <Switch
                  checked={isActive}
                  onCheckedChange={(v) => setValue("is_active", v)}
                />
                <div>
                  <Label>Active</Label>
                  <p className="text-muted-foreground text-xs">
                    Inactive products won&apos;t appear on landing pages.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Media ── */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload from file or paste image URLs. First image is the primary
                thumbnail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                images={
                  images?.map((img) => ({
                    ...img,
                    source: img.source ?? "url",
                  })) ?? []
                }
                onChange={(imgs) =>
                  setValue(
                    "images",
                    imgs.map((img) => ({
                      ...img,
                      is_primary: img.is_primary ?? false,
                    })),
                  )
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Details ── */}
        <TabsContent value="details" className="space-y-4">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features / Benefits</CardTitle>
              <CardDescription>Key product selling points.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {features &&
                features?.map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Feature title"
                        value={features[i].title}
                        onChange={(e) => {
                          const updated = [...features];
                          updated[i] = { ...updated[i], title: e.target.value };
                          setValue("features", updated);
                        }}
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={features[i].description ?? ""}
                        onChange={(e) => {
                          const updated = [...features];
                          updated[i] = {
                            ...updated[i],
                            description: e.target.value,
                          };
                          setValue("features", updated);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="mt-1 self-start text-destructive"
                      onClick={() =>
                        setValue(
                          "features",
                          features.filter((_, fi) => fi !== i),
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
              >
                <Plus className="size-4" />
                Add Feature
              </Button>
            </CardContent>
          </Card>

          {/* Specs */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
              <CardDescription>
                Technical specs (name: value pairs).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {specifications &&
                specifications?.map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Name (e.g. RAM)"
                      value={specifications[i].name}
                      onChange={(e) => {
                        const updated = [...specifications];
                        updated[i] = { ...updated[i], name: e.target.value };
                        setValue("specifications", updated);
                      }}
                    />
                    <Input
                      placeholder="Value (e.g. 8 GB)"
                      value={specifications[i].value}
                      onChange={(e) => {
                        const updated = [...specifications];
                        updated[i] = { ...updated[i], value: e.target.value };
                        setValue("specifications", updated);
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() =>
                        setValue(
                          "specifications",
                          specifications.filter((_, si) => si !== i),
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpec}
              >
                <Plus className="size-4" />
                Add Spec
              </Button>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges / Labels</CardTitle>
              <CardDescription>
                Labels like &quot;Free Shipping&quot;, &quot;Best Seller&quot;.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {badges &&
                badges?.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder="Badge text"
                      value={badge.text}
                      onChange={(e) => {
                        const updated = [...badges];
                        updated[i] = { ...updated[i], text: e.target.value };
                        setValue("badges", updated);
                      }}
                    />
                    <div className="flex items-center gap-1">
                      <Label className="text-xs">Text</Label>
                      <input
                        type="color"
                        value={badge.color ?? "#ffffff"}
                        onChange={(e) => {
                          const updated = [...badges];
                          updated[i] = { ...updated[i], color: e.target.value };
                          setValue("badges", updated);
                        }}
                        className="h-7 w-10 cursor-pointer rounded border"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Label className="text-xs">BG</Label>
                      <input
                        type="color"
                        value={badge.bgColor ?? "#6366f1"}
                        onChange={(e) => {
                          const updated = [...badges];
                          updated[i] = {
                            ...updated[i],
                            bgColor: e.target.value,
                          };
                          setValue("badges", updated);
                        }}
                        className="h-7 w-10 cursor-pointer rounded border"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() =>
                        setValue(
                          "badges",
                          badges.filter((_, bi) => bi !== i),
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBadge}
              >
                <Plus className="size-4" />
                Add Badge
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Links & Sales ── */}
        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Links & Sales Data</CardTitle>
              <CardDescription>
                Affiliate/marketplace URLs and pricing information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="affiliate_url">Affiliate URL</Label>
                <Input
                  id="affiliate_url"
                  {...register("affiliate_url")}
                  placeholder="https://affiliate.example.com/..."
                  className="mt-1"
                />
                {errors.affiliate_url && (
                  <p className="mt-1 text-destructive text-xs">
                    {errors.affiliate_url.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="marketplace_url">Marketplace URL</Label>
                <Input
                  id="marketplace_url"
                  {...register("marketplace_url")}
                  placeholder="https://shopee.co.id/..."
                  className="mt-1"
                />
                {errors.marketplace_url && (
                  <p className="mt-1 text-destructive text-xs">
                    {errors.marketplace_url.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="original_price">Original Price</Label>
                  <Input
                    id="original_price"
                    type="number"
                    {...register("original_price", { valueAsNumber: true })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={watch("currency")}
                    onValueChange={(v) => setValue("currency", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["IDR", "USD", "SGD", "MYR", "PHP", "THB"].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="discount_label">Discount Label</Label>
                <Input
                  id="discount_label"
                  {...register("discount_label")}
                  placeholder="e.g. FLASH SALE, DISKON 20%"
                  className="mt-1"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="shop_name">Shop / Brand Name</Label>
                  <Input
                    id="shop_name"
                    {...register("shop_name")}
                    placeholder="e.g. Official Samsung Store"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="product_rating">Rating (0–5)</Label>
                  <Input
                    id="product_rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    {...register("product_rating", { valueAsNumber: true })}
                    placeholder="4.8"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="review_count">Review Count</Label>
                  <Input
                    id="review_count"
                    type="number"
                    {...register("review_count", { valueAsNumber: true })}
                    placeholder="1234"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sold_count">Sold Count</Label>
                  <Input
                    id="sold_count"
                    type="number"
                    {...register("sold_count", { valueAsNumber: true })}
                    placeholder="9999"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create Product"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
