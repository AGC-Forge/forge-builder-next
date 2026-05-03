import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeProduct } from "@/lib/ai/analyze-product";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's OpenRouter API key
    const { data: keyRow } = await supabase
      .from("user_api_keys")
      .select("api_key, model_id")
      .eq("user_id", user.id)
      .eq("provider", "openrouter")
      .eq("is_active", true)
      .maybeSingle();

    if (!keyRow?.api_key) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured. Go to Settings → API Key." },
        { status: 422 },
      );
    }

    const body = await request.json();
    const { title, imageBase64, imageUrl, marketplaceUrl, category } =
      body as {
        title: string;
        imageBase64?: string;
        imageUrl?: string;
        marketplaceUrl?: string;
        category?: string;
      };

    if (!title) {
      return NextResponse.json({ error: "Product title required" }, { status: 400 });
    }

    const result = await analyzeProduct({
      title,
      imageBase64,
      imageUrl,
      marketplaceUrl,
      category,
      apiKey: keyRow.api_key,
      modelId: keyRow.model_id ?? "openai/gpt-4o-mini",
    });

    // Update last_used_at
    await supabase
      .from("user_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("provider", "openrouter");

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI analysis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
