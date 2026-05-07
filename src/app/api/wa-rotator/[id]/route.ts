import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/wa-rotator/[id]
 *
 * Public endpoint — no auth required.
 * Called from landing page blocks when visitor clicks WA button.
 *
 * Returns: { url: "https://wa.me/628xxx?text=..." }
 *
 * Round-robin is handled CLIENT-SIDE via localStorage to avoid
 * DB race conditions in serverless environments.
 * This endpoint just returns the app config so the client
 * can determine the correct agent.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("applications")
      .select("config, is_active")
      .eq("id", id)
      .eq("app_type", "wa_rotator")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Rotator not found" }, { status: 404 });
    }

    if (!data.is_active) {
      return NextResponse.json({ error: "Rotator is inactive" }, { status: 403 });
    }

    const config = data.config as {
      mode?: string;
      agents?: { name: string; number: string; label: string }[];
      defaultMessage?: string;
    };

    const agents = (config.agents ?? []).filter((a) => a.number?.trim());

    if (agents.length === 0) {
      return NextResponse.json({ error: "No agents configured" }, { status: 400 });
    }

    return NextResponse.json({
      mode: config.mode ?? "round-robin",
      agents,
      defaultMessage: config.defaultMessage ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
