"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { endOfDay, startOfDay, subDays } from "date-fns";

// ── Types ────────────────────────────────────────────────────
export interface PageView {
  id: string;
  created_at: string;
  device_type?: string | null;
  country?: string | null;
  referrer?: string | null;
  landing_page_id?: string | null;
}

export interface ProductClick {
  id: string;
  created_at: string;
  click_type?: string | null;
  product_id?: string | null;
}

export interface TopPage {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  click_count: number;
  is_published: boolean;
}

export interface TopProduct {
  id: string;
  title: string;
  click_count: number;
  images: { url: string; is_primary?: boolean }[];
}

export interface AnalyticsSummary {
  views: PageView[];
  clicks: ProductClick[];
  topPages: TopPage[];
  topProducts: TopProduct[];
}
function resolveDateRange(
  days?: number,
  from?: string,
  to?: string,
): { since: string; until: string } {
  if (from && to) {
    // Custom range from DateRangePickerInput — use as-is but clamp to end of day
    const fromDate = new Date(from);
    const toDate = endOfDay(new Date(to));
    return {
      since: startOfDay(fromDate).toISOString(),
      until: toDate.toISOString(),
    };
  }
  if (from && !to) {
    return {
      since: startOfDay(new Date(from)).toISOString(),
      until: endOfDay(new Date()).toISOString(),
    };
  }
  // Default: last N days
  const d = Math.min(Math.max(days ?? 30, 1), 365);
  return {
    since: startOfDay(subDays(new Date(), d - 1)).toISOString(),
    until: endOfDay(new Date()).toISOString(),
  };
}
export async function getAnalyticsSummary(
  days = 30,
  from?: string,
  to?: string,
): Promise<ActionResult<AnalyticsSummary>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const admin = createAdminClient();
    const { since, until } = resolveDateRange(days, from, to);

    const [views, clicks, topPages, topProductsClicks] = await Promise.all([
      admin
        .from("page_analytics")
        .select("id, created_at, device_type, country, referrer, landing_page_id")
        .gte("created_at", since)
        .lte("created_at", until)
        .order("created_at", { ascending: false }),

      admin
        .from("product_clicks")
        .select("id, created_at, click_type, product_id")
        .gte("created_at", since)
        .lte("created_at", until)
        .order("created_at", { ascending: false }),

      admin
        .from("landing_pages")
        .select("id, title, slug, view_count, click_count, is_published")
        .order("view_count", { ascending: false })
        .limit(10),

      admin
        .from("product_clicks")
        .select("product_id, products(id, title, images)")
        .gte("created_at", since)
        .lte("created_at", until),
    ]);

    // Aggregate top products
    const productClickMap: Record<
      string,
      { count: number; title: string; images: { url: string; is_primary?: boolean }[] }
    > = {};
    for (const row of topProductsClicks.data ?? []) {
      const pid = row.product_id as string;
      const prodRaw = (row as { products?: unknown }).products;
      const prod = (Array.isArray(prodRaw) ? prodRaw[0] : prodRaw) as {
        id: string;
        title: string;
        images: { url: string; is_primary?: boolean }[];
      } | null;
      if (!pid || !prod) continue;
      if (!productClickMap[pid]) {
        productClickMap[pid] = { count: 0, title: prod.title, images: prod.images ?? [] };
      }
      productClickMap[pid].count++;
    }
    const topProducts: TopProduct[] = Object.entries(productClickMap)
      .map(([id, v]) => ({ id, title: v.title, click_count: v.count, images: v.images }))
      .sort((a, b) => b.click_count - a.click_count)
      .slice(0, 8);

    return {
      success: true,
      data: {
        views: (views.data ?? []) as PageView[],
        clicks: (clicks.data ?? []) as ProductClick[],
        topPages: (topPages.data ?? []) as TopPage[],
        topProducts,
      },
    };
  } catch {
    return { success: false, error: "Failed to fetch analytics" };
  }
}
export async function exportAnalyticsCSV(
  days = 30,
  from?: string,
  to?: string,
): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const admin = createAdminClient();
    const { since, until } = resolveDateRange(days, from, to);

    const { data: topPages } = await admin
      .from("landing_pages")
      .select("id, title, slug, view_count, click_count, is_published, created_at")
      .order("view_count", { ascending: false });

    const { data: views } = await admin
      .from("page_analytics")
      .select("created_at, device_type, country, referrer")
      .gte("created_at", since)
      .lte("created_at", until)
      .order("created_at", { ascending: false })
      .limit(5000);

    const lines: string[] = [];
    lines.push("# Landing Pages Performance");
    lines.push("Title,Slug,Views,Clicks,Published");
    for (const p of topPages ?? []) {
      lines.push(
        `"${p.title}","${p.slug}",${p.view_count},${p.click_count},${p.is_published}`,
      );
    }
    lines.push("");
    lines.push(`# Page Views (${since.slice(0, 10)} to ${until.slice(0, 10)})`);
    lines.push("Date,Device,Country,Referrer");
    for (const v of views ?? []) {
      const date = new Date(v.created_at).toLocaleDateString("id-ID");
      lines.push(
        `"${date}","${v.device_type ?? ""}","${v.country ?? ""}","${v.referrer ?? ""}"`,
      );
    }

    return { success: true, data: lines.join("\n") };
  } catch {
    return { success: false, error: "Failed to export analytics" };
  }
}