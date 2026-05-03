import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
    const slug = req.nextUrl.searchParams.get("slug")?.toLowerCase().trim();
    const excludeId = req.nextUrl.searchParams.get("excludeId");

    if (!slug) {
        return NextResponse.json({ available: false, error: "Slug required" });
    }

    // Basic format validation
    const slugRegex = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/;
    if (!slugRegex.test(slug)) {
        return NextResponse.json({ available: false, error: "Invalid slug format" });
    }

    // Reserved slugs that can never be used
    const RESERVED = [
        "dashboard", "login", "register", "forgot-password", "reset-password",
        "api", "admin", "auth", "callback", "_next", "static", "public",
        "unauthorized", "404", "500", "health", "sitemap", "robots",
    ];
    if (RESERVED.includes(slug)) {
        return NextResponse.json({ available: false, error: "This slug is reserved" });
    }

    try {
        const supabase = await createClient();

        let query = supabase
            .from("landing_pages")
            .select("id", { count: "exact", head: true })
            .eq("slug", slug);

        if (excludeId) {
            query = query.neq("id", excludeId);
        }

        const { count, error } = await query;
        if (error) {
            return NextResponse.json({ available: false, error: "Check failed" });
        }

        return NextResponse.json({ available: count === 0 });
    } catch {
        return NextResponse.json({ available: false, error: "Server error" });
    }
}