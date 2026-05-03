import { z } from "zod";

const productImageSchema = z.object({
  id: z.string(),
  url: z.string().min(1, "Image URL required"),
  public_id: z.string().optional(),
  name: z.string().optional(),
  alt: z.string().optional(),
  is_primary: z.boolean().optional().default(false),
  source: z.enum(["upload", "url"]).default("url"),
});

const featureSchema = z.object({
  title: z.string().min(1, "Feature title required"),
  description: z.string().optional(),
});

const specSchema = z.object({
  name: z.string().min(1, "Spec name required"),
  value: z.string().min(1, "Spec value required"),
});

const badgeSchema = z.object({
  text: z.string().min(1, "Badge text required"),
  color: z.string().optional(),
  bgColor: z.string().optional(),
});

export const productSchema = z.object({
  title: z
    .string()
    .min(3, "Title min 3 characters")
    .max(200, "Title max 200 characters"),
  subtitle: z.string().max(200).optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
  original_price: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().default("IDR"),
  discount_label: z.string().max(50).optional().nullable(),
  category: z.string().optional().nullable(),
  subcategory: z.string().optional().nullable(),
  images: z.array(productImageSchema).default([]),
  marketplace_url: z
    .union([z.string().url("Invalid URL"), z.literal(""), z.null()])
    .optional()
    .nullable(),
  affiliate_url: z
    .union([z.string().url("Invalid URL"), z.literal(""), z.null()])
    .optional()
    .nullable(),
  shop_name: z.string().max(100).optional().nullable(),
  product_rating: z.coerce
    .number()
    .min(0)
    .max(5)
    .optional()
    .nullable(),
  review_count: z.coerce.number().int().min(0).default(0),
  sold_count: z.coerce.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  features: z.array(featureSchema).default([]),
  specifications: z.array(specSchema).default([]),
  badges: z.array(badgeSchema).default([]),
  is_active: z.boolean().default(true),
  input_mode: z.enum(["manual", "auto"]).default("manual"),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type ProductFeatureInput = z.infer<typeof featureSchema>;
export type ProductSpecInput = z.infer<typeof specSchema>;
export type ProductBadgeInput = z.infer<typeof badgeSchema>;
