import * as z from "zod";
import { DEFAULT_THEME_CONFIG } from "@/types/database";

const themeConfigSchema = z.object({
  primaryColor: z.string().default("#6366f1"),
  secondaryColor: z.string().default("#8b5cf6"),
  backgroundColor: z.string().default("#ffffff"),
  textColor: z.string().default("#1f2937"),
  accentColor: z.string().optional().default(""),
  fontFamily: z.string().default("Inter"),
  borderRadius: z
    .enum(["none", "sm", "md", "lg", "full"])
    .default("md"),
  buttonStyle: z.enum(["filled", "outlined", "ghost"]).default("filled"),
  backgroundType: z
    .enum(["solid", "gradient", "image"])
    .default("solid"),
  backgroundGradient: z.string().optional().default(""),
  backgroundImageUrl: z.string().optional().default(""),
  profileImageUrl: z.string().optional().default(""),
  coverImageUrl: z.string().optional().default(""),
  linkStyle: z
    .enum(["card", "button", "minimal"])
    .nullable()
    .optional()
    .default(null) as z.ZodType<"card" | "button" | "minimal" | null>,
  shadow: z
    .enum(["none", "sm", "md", "lg"])
    .nullable()
    .optional()
    .default(null) as z.ZodType<"none" | "sm" | "md" | "lg" | null>,
});

const trackingSchema = z.object({
  gtm_id: z.string().nullable().optional().default(null),
  fb_pixel_id: z.string().nullable().optional().default(null),
  histats_id: z.string().nullable().optional().default(null),
  ga_id: z.string().nullable().optional().default(null),
});

const seoSchema = z.object({
  title: z.string().max(70).nullable().optional().default(null),
  description: z.string().max(160).nullable().optional().default(null),
  og_image: z.string().nullable().optional().default(null),
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
  description: z.string().max(500).optional().nullable().default(null),
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
  theme_config: themeConfigSchema.optional().default({
    primaryColor: DEFAULT_THEME_CONFIG.primaryColor ?? "#6366f1",
    secondaryColor: DEFAULT_THEME_CONFIG.secondaryColor ?? "",
    backgroundColor: DEFAULT_THEME_CONFIG.backgroundColor ?? "",
    textColor: DEFAULT_THEME_CONFIG.textColor ?? "",
    accentColor: DEFAULT_THEME_CONFIG.accentColor ?? "",
    fontFamily: DEFAULT_THEME_CONFIG.fontFamily ?? "Inter",
    borderRadius: DEFAULT_THEME_CONFIG.borderRadius ?? "md",
    buttonStyle: DEFAULT_THEME_CONFIG.buttonStyle ?? "filled",
    backgroundType: DEFAULT_THEME_CONFIG.backgroundType ?? "solid",
    backgroundGradient: DEFAULT_THEME_CONFIG.backgroundGradient ?? "",
    backgroundImageUrl: DEFAULT_THEME_CONFIG.backgroundImageUrl ?? "",
    profileImageUrl: DEFAULT_THEME_CONFIG.profileImageUrl ?? "",
    coverImageUrl: DEFAULT_THEME_CONFIG.coverImageUrl ?? "",
    linkStyle: DEFAULT_THEME_CONFIG.linkStyle ?? "card",
    shadow: DEFAULT_THEME_CONFIG.shadow ?? "none",
  }),
  tracking: trackingSchema.optional().default({
    gtm_id: null,
    fb_pixel_id: null,
    histats_id: null,
    ga_id: null,
  }),
  seo: seoSchema.optional().default({
    title: null,
    description: null,
    og_image: null,
  }),
  is_published: z.boolean().default(false),
});

export const updateBlocksSchema = z.object({
  id: z.string().uuid(),
  blocks: z.array(z.record(z.string(), z.unknown())),
});

export type LandingPageFormInput = z.input<typeof landingPageSchema>;
export type LandingPageInput = z.input<typeof landingPageSchema>;
export type LandingPageBlocksInput = z.input<typeof updateBlocksSchema>;
export type LandingPageBlocksUpdate = z.output<typeof updateBlocksSchema>;
export type ThemeConfigInput = z.infer<typeof themeConfigSchema>;
export type TrackingInput = z.infer<typeof trackingSchema>;
export type SeoInput = z.infer<typeof seoSchema>;
