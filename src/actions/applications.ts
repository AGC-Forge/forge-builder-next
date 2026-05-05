"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Application, AppType } from "@/types/builder";

export interface ApplicationInput {
  app_type: AppType;
  name: string;
  config: Record<string, unknown>;
  is_active?: boolean;
}

/**
 * Get all applications for current user.
 * @param opts Optional filter options.
 * @returns Action result.
 * */
export async function getApplications(opts?: {
  app_type?: AppType;
  is_active?: boolean;
}): Promise<ActionResult<Application[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    let query = supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (opts?.app_type) query = query.eq("app_type", opts.app_type);
    if (opts?.is_active !== undefined) query = query.eq("is_active", opts.is_active);

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };

    return { success: true, data: (data ?? []) as Application[] };
  } catch {
    return { success: false, error: "Failed to fetch applications" };
  }
}

/**
 * Get a single application.
 * @param id Application ID.
 * @returns Action result.
 * */
export async function getApplication(id: string): Promise<ActionResult<Application>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Application };
  } catch {
    return { success: false, error: "Failed to fetch application" };
  }
}

/**
 * Create an application.
 * @param input Application input.
 * @returns Action result.
 * */
export async function createApplication(input: ApplicationInput): Promise<ActionResult<Application>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    if (!input.name?.trim()) return { success: false, error: "Name is required." };
    if (!input.app_type) return { success: false, error: "App type is required." };

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        app_type: input.app_type,
        name: input.name.trim(),
        config: input.config ?? {},
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/applications");
    return { success: true, data: data as Application, message: "Application created." };
  } catch {
    return { success: false, error: "Failed to create application" };
  }
}

/**
 * Update an application.
 * @param id Application ID.
 * @param input Application input.
 * @returns Action result.
 * */
export async function updateApplication(
  id: string,
  input: Partial<ApplicationInput>,
): Promise<ActionResult<Application>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.config !== undefined) updates.config = input.config;
    if (input.is_active !== undefined) updates.is_active = input.is_active;

    const { data, error } = await supabase
      .from("applications")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/applications");
    return { success: true, data: data as Application, message: "Application updated." };
  } catch {
    return { success: false, error: "Failed to update application" };
  }
}

/**
 * Delete an application.
 * @param id Application ID.
 * @returns Action result.
 * */
export async function deleteApplication(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/applications");
    return { success: true, message: "Application deleted." };
  } catch {
    return { success: false, error: "Failed to delete application" };
  }
}

/**
 * Toggle active status of an application.
 * @param id Application ID.
 * @param isActive New active status.
 * @returns Action result.
 * */
export async function toggleApplicationStatus(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("applications")
      .update({ is_active: isActive })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/applications");
    return { success: true, message: isActive ? "Application enabled." : "Application disabled." };
  } catch {
    return { success: false, error: "Failed to update status" };
  }
}
