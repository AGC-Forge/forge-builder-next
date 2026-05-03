"use server";

import { createClient } from "@/lib/supabase/server";

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

export async function getAnalyticsSummary(days = 30): Promise<
    ActionResult<{
        views: PageView[];
        clicks: ProductClick[];
        topPages: TopPage[];
        topProducts: TopProduct[];
    }>
> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        const [views, clicks, topPages, topProductsClicks] = await Promise.all([
            supabase
                .from("page_analytics")
                .select("id, created_at, device_type, country, referrer, landing_page_id")
                .gte("created_at", since)
                .order("created_at", { ascending: false }),

            supabase
                .from("product_clicks")
                .select("id, created_at, click_type, product_id")
                .gte("created_at", since)
                .order("created_at", { ascending: false }),

            supabase
                .from("landing_pages")
                .select("id, title, slug, view_count, click_count, is_published")
                .order("view_count", { ascending: false })
                .limit(10),

            // Top products by click count in period
            supabase
                .from("product_clicks")
                .select("product_id, products(id, title, images)")
                .gte("created_at", since),
        ]);

        // Aggregate product clicks
        const productClickMap: Record<string, { count: number; title: string; images: { url: string; is_primary?: boolean }[] }> = {};
        for (const row of topProductsClicks.data ?? []) {
            const pid = row.product_id as string;
            const prodRaw = (row as { products?: unknown }).products;
            const prod = (Array.isArray(prodRaw) ? prodRaw[0] : prodRaw) as unknown as
                | { id: string; title: string; images: { url: string; is_primary?: boolean }[] }
                | null;
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

export async function exportAnalyticsCSV(days = 30): Promise<ActionResult<string>> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        const { data: topPages } = await supabase
            .from("landing_pages")
            .select("id, title, slug, view_count, click_count, is_published, created_at")
            .order("view_count", { ascending: false });

        const { data: views } = await supabase
            .from("page_analytics")
            .select("created_at, device_type, country, referrer")
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .limit(5000);

        // Build CSV
        const lines: string[] = [];

        // Section 1: Landing Pages Performance
        lines.push("# Landing Pages Performance");
        lines.push("Title,Slug,Views,Clicks,Published");
        for (const p of topPages ?? []) {
            lines.push(`"${p.title}","${p.slug}",${p.view_count},${p.click_count},${p.is_published}`);
        }

        lines.push("");

        // Section 2: Raw Page Views (last N days)
        lines.push(`# Page Views (Last ${days} Days)`);
        lines.push("Date,Device,Country,Referrer");
        for (const v of views ?? []) {
            const date = new Date(v.created_at).toLocaleDateString();
            lines.push(`"${date}","${v.device_type ?? ""}","${v.country ?? ""}","${v.referrer ?? ""}"`);
        }

        return { success: true, data: lines.join("\n") };
    } catch {
        return { success: false, error: "Failed to export analytics" };
    }
}
