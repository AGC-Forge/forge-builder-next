"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { WebSetting, UserApiKey } from "@/types/database";

export async function getSettings(
  groupName?: string,
): Promise<ActionResult<WebSetting[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("web_settings")
      .select("*")
      .order("group_name")
      .order("key");

    if (groupName) query = query.eq("group_name", groupName);

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as WebSetting[] };
  } catch {
    return { success: false, error: "Failed to fetch settings" };
  }
}

export async function getPublicSettings(): Promise<
  ActionResult<Record<string, string | null>>
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("web_settings")
      .select("key, value")
      .eq("is_public", true);
    if (error) return { success: false, error: error.message };

    const map: Record<string, string | null> = {};
    for (const s of data ?? []) map[s.key] = s.value;
    return { success: true, data: map };
  } catch {
    return { success: false, error: "Failed to fetch settings" };
  }
}

export async function updateSetting(
  key: string,
  value: string | null,
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("web_settings")
      .update({ value })
      .eq("key", key);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/settings/web");
    return { success: true, message: "Setting saved." };
  } catch {
    return { success: false, error: "Failed to save setting" };
  }
}

export async function updateSettingsBulk(
  updates: Record<string, string | null>,
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const promises = Object.entries(updates).map(([key, value]) =>
      supabase.from("web_settings").update({ value }).eq("key", key),
    );

    const results = await Promise.all(promises);
    const firstError = results.find((r) => r.error);
    if (firstError?.error) return { success: false, error: firstError.error.message };

    revalidatePath("/dashboard/settings/web");
    return { success: true, message: "Settings saved." };
  } catch {
    return { success: false, error: "Failed to save settings" };
  }
}

export async function getApiKey(
  provider = "openrouter",
): Promise<ActionResult<UserApiKey | null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as UserApiKey) ?? null };
  } catch {
    return { success: false, error: "Failed to fetch API key" };
  }
}

export async function saveApiKey(
  provider: string,
  apiKey: string,
  modelId: string | null,
  label?: string,
): Promise<ActionResult<UserApiKey>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("user_api_keys")
      .upsert(
        {
          user_id: user.id,
          provider,
          api_key: apiKey,
          model_id: modelId,
          label: label ?? null,
          is_active: true,
        },
        { onConflict: "user_id,provider" },
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/settings/api-key");
    return { success: true, data: data as UserApiKey, message: "API key saved." };
  } catch {
    return { success: false, error: "Failed to save API key" };
  }
}

export async function deleteApiKey(provider = "openrouter"): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("user_api_keys")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/settings/api-key");
    return { success: true, message: "API key deleted." };
  } catch {
    return { success: false, error: "Failed to delete API key" };
  }
}

export async function getAnalyticsSummary(days = 30) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [views, clicks, topPages] = await Promise.all([
      supabase
        .from("page_analytics")
        .select("id, created_at, device_type, country")
        .gte("created_at", since),
      supabase
        .from("product_clicks")
        .select("id, created_at, click_type, product_id")
        .gte("created_at", since),
      supabase
        .from("landing_pages")
        .select("id, title, slug, view_count, click_count, is_published")
        .order("view_count", { ascending: false })
        .limit(10),
    ]);

    return {
      success: true,
      data: {
        views: views.data ?? [],
        clicks: clicks.data ?? [],
        topPages: topPages.data ?? [],
      },
    };
  } catch {
    return { success: false, error: "Failed to fetch analytics" };
  }
}
