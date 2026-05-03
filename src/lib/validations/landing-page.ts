import { z } from "zod";

const themeConfigSchema = z.object({
  primaryColor: z.string().default("#6366f1"),
  secondaryColor: z.string().default("#8b5cf6"),
  backgroundColor: z.string().default("#ffffff"),
  textColor: z.string().default("#1f2937"),
  accentColor: z.string().optional(),
  fontFamily: z.string().default("Inter"),
  borderRadius: z
    .enum(["none", "sm", "md", "lg", "full"])
    .default("md"),
  buttonStyle: z.enum(["filled", "outlined", "ghost"]).default("filled"),
  backgroundType: z
    .enum(["solid", "gradient", "image"])
    .default("solid"),
  backgroundGradient: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  profileImageUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  linkStyle: z.enum(["card", "button", "minimal"]).optional(),
  shadow: z.enum(["none", "sm", "md", "lg"]).optional(),
});

const trackingSchema = z.object({
  gtm_id: z.string().nullable().optional(),
  fb_pixel_id: z.string().nullable().optional(),
  histats_id: z.string().nullable().optional(),
  ga_id: z.string().nullable().optional(),
});

const seoSchema = z.object({
  title: z.string().max(70).nullable().optional(),
  description: z.string().max(160).nullable().optional(),
  og_image: z.string().nullable().optional(),
});

export const landingPageSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug min 3 characters")
    .max(60, "Slug max 60 characters")
    .regex(
      /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/,
      "Slug: lowercase letters, numbers, and hyphens only (no leading/trailing hyphens)",
    ),
  title: z.string().min(1, "Title required").max(200),
  description: z.string().max(500).optional().nullable(),
  theme_type: z
    .enum([
      "linktree",
      "beacons",
      "taplink",
      "campsite",
      "carrd",
      "seedprod",
      "lnkbio",
      "ecommerce",
    ])
    .default("linktree"),
  theme_config: themeConfigSchema.default({}),
  tracking: trackingSchema.default({}),
  seo: seoSchema.default({}),
  is_published: z.boolean().default(false),
});

export const updateBlocksSchema = z.object({
  id: z.string().uuid(),
  blocks: z.array(z.record(z.unknown())),
});

export type LandingPageInput = z.infer<typeof landingPageSchema>;
export type ThemeConfigInput = z.infer<typeof themeConfigSchema>;
export type TrackingInput = z.infer<typeof trackingSchema>;
export type SeoInput = z.infer<typeof seoSchema>;
