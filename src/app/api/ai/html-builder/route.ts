import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are an expert web developer specializing in building beautiful, responsive HTML/CSS components for landing pages.

When given a description, generate a complete, self-contained HTML snippet using:
- Semantic HTML5
- Tailwind CSS classes via CDN (assume Tailwind is available)
- Inline styles when needed for dynamic values
- Mobile-first responsive design
- Modern, professional aesthetics

RULES:
1. Return ONLY the HTML code — no explanation, no markdown code blocks, no backticks
2. The snippet must be self-contained and work when injected into a page body
3. Use class="..." with Tailwind utility classes
4. Include all required content inline (no external data fetching)
5. Make it visually polished and production-ready
6. Keep JavaScript minimal; use it only when essential for interactivity
7. For any icons, use simple Unicode/emoji or SVG inline
8. Ensure the design works in both light and dark themes when possible`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, currentHtml, model } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Get user's API key from DB
    const { data: apiKeyRow } = await supabase
      .from("user_api_keys")
      .select("api_key, model_id")
      .eq("user_id", user.id)
      .eq("provider", "openrouter")
      .eq("is_active", true)
      .maybeSingle();

    const apiKey = apiKeyRow?.api_key ?? process.env.OPENROUTER_API_KEY;
    const modelId = model ?? apiKeyRow?.model_id ?? "anthropic/claude-3-5-sonnet";

    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key configured. Please add your OpenRouter API key in Settings." },
        { status: 400 },
      );
    }

    // Build messages
    const messages: { role: "user" | "assistant"; content: string }[] = [];

    if (currentHtml?.trim()) {
      messages.push({
        role: "user",
        content: `Here is the current HTML I want to modify:\n\n${currentHtml}\n\nPlease update it based on this instruction: ${prompt}`,
      });
    } else {
      messages.push({
        role: "user",
        content: `Create an HTML component for the following: ${prompt}`,
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost",
        "X-Title": process.env.APP_NAME ?? "SnapLand",
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson?.error?.message ?? `OpenRouter error: HTTP ${response.status}`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const data = await response.json();
    let html: string = data?.choices?.[0]?.message?.content ?? "";

    if (!html) {
      return NextResponse.json({ error: "AI returned empty response. Try again." }, { status: 500 });
    }

    // Strip markdown code blocks if model wrapped it
    html = html
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Update last_used_at
    if (apiKeyRow) {
      await supabase
        .from("user_api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("provider", "openrouter");
    }

    return NextResponse.json({ success: true, html });
  } catch (err: unknown) {
    console.error("[AI HTML Builder]", err);
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
