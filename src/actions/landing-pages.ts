"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  landingPageSchema,
  type LandingPageInput,
} from "@/lib/validations/landing-page";
import type { Database } from "@/types/database.types";
import type {
  LandingPage,
  LandingBlock,
  LandingPageWithProducts,
  PaginatedResult,
} from "@/types/database";

// ── List ────────────────────────────────────────────────────
export async function getLandingPages(opts: {
  page?: number;
  pageSize?: number;
  search?: string;
  themeType?: string;
  isPublished?: boolean;
} = {}): Promise<ActionResult<PaginatedResult<LandingPage>>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { page = 1, pageSize = 20, search, themeType, isPublished } = opts;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("landing_pages")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) query = query.ilike("title", `%${search}%`);
    if (themeType) query = query.eq("theme_type", themeType);
    if (isPublished !== undefined) query = query.eq("is_published", isPublished);

    const { data, error, count } = await query;
    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        data: data as unknown as LandingPage[],
        count: count ?? 0,
        page,
        pageSize,
        pageCount: Math.ceil((count ?? 0) / pageSize),
      },
    };
  } catch {
    return { success: false, error: "Failed to fetch landing pages" };
  }
}

// ── Single ──────────────────────────────────────────────────
export async function getLandingPage(
  id: string,
): Promise<ActionResult<LandingPageWithProducts>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("landing_pages")
      .select(`
        *,
        landing_page_products (
          id, sort_order,
          product:products (
            id, title, subtitle, price, original_price, currency,
            images, affiliate_url, marketplace_url, product_rating,
            review_count, sold_count, badges, is_active
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as unknown as LandingPageWithProducts };
  } catch {
    return { success: false, error: "Failed to fetch landing page" };
  }
}

// ── Public: get by slug (no auth required) ─────────────────
export async function getLandingPageBySlug(
  slug: string,
): Promise<ActionResult<LandingPageWithProducts>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("landing_pages")
      .select(`
        *,
        landing_page_products (
          id, sort_order,
          product:products (
            id, title, subtitle, price, original_price, currency,
            images, affiliate_url, marketplace_url, product_rating,
            review_count, sold_count, badges, is_active, description,
            features, shop_name, discount_label
          )
        )
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) return { success: false, error: "Page not found" };

    // Increment view count (fire and forget)
    supabase
      .from("landing_pages")
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq("id", data.id)
      .then(() => {});

    return { success: true, data: data as unknown as LandingPageWithProducts };
  } catch {
    return { success: false, error: "Page not found" };
  }
}

// ── Create ──────────────────────────────────────────────────
export async function createLandingPage(
  input: LandingPageInput,
): Promise<ActionResult<LandingPage>> {
  const parsed = landingPageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Quota check
    const { count } = await supabase
      .from("landing_pages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("max_landing_pages")
      .eq("id", user.id)
      .single();

    if (count !== null && profile && count >= profile.max_landing_pages) {
      return {
        success: false,
        error: `Landing page limit reached (${profile.max_landing_pages}). Contact admin to increase.`,
      };
    }

    // Slug uniqueness
    const { count: existing } = await supabase
      .from("landing_pages")
      .select("id", { count: "exact", head: true })
      .eq("slug", parsed.data.slug);
    if (existing && existing > 0) {
      return {
        success: false,
        fieldErrors: { slug: ["This slug is already taken. Choose another."] },
      };
    }

    const { data, error } = await supabase
      .from("landing_pages")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/landing-page");
    return {
      success: true,
      data: data as unknown as LandingPage,
      message: "Landing page created.",
    };
  } catch {
    return { success: false, error: "Failed to create landing page" };
  }
}

// ── Update settings ─────────────────────────────────────────
export async function updateLandingPage(
  id: string,
  input: Partial<LandingPageInput>,
): Promise<ActionResult<LandingPage>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    if (input.slug) {
      const { count } = await supabase
        .from("landing_pages")
        .select("id", { count: "exact", head: true })
        .eq("slug", input.slug)
        .neq("id", id);
      if (count && count > 0) {
        return {
          success: false,
          fieldErrors: { slug: ["This slug is already taken."] },
        };
      }
    }

    const updateData =
      input as unknown as Database["public"]["Tables"]["landing_pages"]["Update"];

    const { data, error } = await supabase
      .from("landing_pages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/landing-page");
    revalidatePath(`/dashboard/landing-page/${id}`);
    return { success: true, data: data as unknown as LandingPage, message: "Saved." };
  } catch {
    return { success: false, error: "Failed to update landing page" };
  }
}

// ── Update blocks (builder save) ────────────────────────────
export async function updateLandingPageBlocks(
  id: string,
  blocks: LandingBlock[],
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("landing_pages")
      .update({
        blocks:
          blocks as unknown as Database["public"]["Tables"]["landing_pages"]["Update"]["blocks"],
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath(`/dashboard/landing-page/${id}/builder`);
    return { success: true, message: "Builder saved." };
  } catch {
    return { success: false, error: "Failed to save builder" };
  }
}

// ── Publish / unpublish ─────────────────────────────────────
export async function setLandingPagePublished(
  id: string,
  published: boolean,
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("landing_pages")
      .update({ is_published: published })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/landing-page");
    revalidatePath(`/dashboard/landing-page/${id}`);
    return {
      success: true,
      message: published ? "Page published." : "Page unpublished.",
    };
  } catch {
    return { success: false, error: "Failed to update status" };
  }
}

// ── Assign products ─────────────────────────────────────────
export async function assignProducts(
  landingPageId: string,
  productIds: string[],
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Remove existing
    await supabase
      .from("landing_page_products")
      .delete()
      .eq("landing_page_id", landingPageId);

    if (productIds.length > 0) {
      const rows = productIds.map((pid, idx) => ({
        landing_page_id: landingPageId,
        product_id: pid,
        sort_order: idx,
      }));
      const { error } = await supabase
        .from("landing_page_products")
        .insert(rows);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/landing-page/${landingPageId}`);
    return { success: true, message: "Products assigned." };
  } catch {
    return { success: false, error: "Failed to assign products" };
  }
}

// ── Delete ──────────────────────────────────────────────────
export async function deleteLandingPage(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("landing_pages")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/landing-page");
    return { success: true, message: "Landing page deleted." };
  } catch {
    return { success: false, error: "Failed to delete landing page" };
  }
}

// ── Analytics: track view ───────────────────────────────────
export async function trackPageView(
  landingPageId: string,
  meta: {
    visitorFingerprint?: string;
    userAgent?: string;
    referrer?: string;
    country?: string;
    deviceType?: "mobile" | "tablet" | "desktop" | "unknown";
  },
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("page_analytics").insert({
      landing_page_id: landingPageId,
      visitor_fingerprint: meta.visitorFingerprint ?? null,
      user_agent: meta.userAgent ?? null,
      referrer: meta.referrer ?? null,
      country: meta.country ?? null,
      device_type: meta.deviceType ?? "unknown",
    });
  } catch {
    // analytics failure should not break the page
  }
}

// ── Analytics: track product click ─────────────────────────
export async function trackProductClick(
  productId: string,
  landingPageId: string | null,
  clickType: "affiliate" | "marketplace" | "detail",
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("product_clicks").insert({
      product_id: productId,
      landing_page_id: landingPageId,
      click_type: clickType,
    });
    // Also bump landing page click_count
    if (landingPageId) {
      await (supabase as unknown as { rpc: (fn: string, args: unknown) => unknown }).rpc(
        "increment_click_count",
        { lp_id: landingPageId },
      );
    }
  } catch {
    // silent
  }
}
