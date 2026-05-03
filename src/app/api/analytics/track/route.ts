import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Public endpoint — no auth required (called from landing pages)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { type, landingPageId, productId, clickType } = body as {
      type: "view" | "click";
      landingPageId?: string;
      productId?: string;
      clickType?: "affiliate" | "marketplace" | "detail";
    };

    const ua = request.headers.get("user-agent") ?? undefined;
    const referer = request.headers.get("referer") ?? undefined;

    // Detect device type from UA
    let deviceType: "mobile" | "tablet" | "desktop" | "unknown" = "unknown";
    if (ua) {
      if (/mobile/i.test(ua)) deviceType = "mobile";
      else if (/tablet|ipad/i.test(ua)) deviceType = "tablet";
      else if (ua.length > 0) deviceType = "desktop";
    }

    if (type === "view" && landingPageId) {
      await supabase.from("page_analytics").insert({
        landing_page_id: landingPageId,
        user_agent: ua ?? null,
        referrer: referer ?? null,
        device_type: deviceType,
      });
      await supabase
        .from("landing_pages")
        .update({ view_count: supabase.rpc as unknown })
        .eq("id", landingPageId);
    }

    if (type === "click" && productId) {
      await supabase.from("product_clicks").insert({
        product_id: productId,
        landing_page_id: landingPageId ?? null,
        click_type: clickType ?? "affiliate",
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
