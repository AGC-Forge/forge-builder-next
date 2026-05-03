"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Profile, PaginatedResult } from "@/types/database";
import { getUserWithProfile } from "@/lib/supabase/profiles";

export async function getUsers(opts: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
} = {}): Promise<ActionResult<PaginatedResult<Profile>>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { page = 1, pageSize = 20, search, role, isActive } = opts;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) query = query.ilike("email", `%${search}%`);
    if (role) query = query.eq("role", role);
    if (isActive !== undefined) query = query.eq("is_active", isActive);

    const { data, error, count } = await query;
    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        data: data as Profile[],
        count: count ?? 0,
        page,
        pageSize,
        pageCount: Math.ceil((count ?? 0) / pageSize),
      },
    };
  } catch {
    return { success: false, error: "Failed to fetch users" };
  }
}
export async function getUser(id: string): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Profile };
  } catch {
    return { success: false, error: "Failed to fetch user" };
  }
}
export async function inviteUser(
  email: string,
  role: "admin" | "member" = "member",
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role },
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/users");
    return { success: true, message: `Invitation sent to ${email}.` };
  } catch {
    return { success: false, error: "Failed to invite user" };
  }
}
export async function updateUser(
  id: string,
  data: {
    full_name?: string;
    role?: "admin" | "member";
    is_active?: boolean;
    max_products?: number;
    max_landing_pages?: number;
  },
): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: updated, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/users");
    return { success: true, data: updated as Profile, message: "User updated." };
  } catch {
    return { success: false, error: "Failed to update user" };
  }
}
export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/users");
    return { success: true, message: "User deleted." };
  } catch {
    return { success: false, error: "Failed to delete user" };
  }
}
export async function getCurrentProfile(): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { user, profile } = await getUserWithProfile(supabase);
    if (!user) return { success: false, error: "Unauthorized" };
    if (!profile) return { success: false, error: "Profile not found" };

    return { success: true, data: profile as unknown as Profile };
  } catch {
    return { success: false, error: "Failed to fetch profile" };
  }
}
export async function getDashboardStats() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const [products, landingPages, users, analytics, clicks] =
      await Promise.all([
        supabase
          .from("products")
          .select("id, is_active", { count: "exact" }),
        supabase
          .from("landing_pages")
          .select("id, is_published, view_count, click_count", { count: "exact" }),
        supabase
          .from("profiles")
          .select("id", { count: "exact" }),
        supabase
          .from("page_analytics")
          .select("id", { count: "exact" })
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ),
        supabase
          .from("product_clicks")
          .select("id", { count: "exact" })
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ),
      ]);

    const lpData = (landingPages.data ?? []) as {
      view_count: number;
      click_count: number;
      is_published: boolean;
    }[];
    const totalViews = lpData.reduce((s, lp) => s + (lp.view_count ?? 0), 0);
    const totalClicks = lpData.reduce(
      (s, lp) => s + (lp.click_count ?? 0),
      0,
    );

    const productsData = (products.data ?? []) as { is_active: boolean }[];

    return {
      success: true,
      data: {
        total_products: products.count ?? 0,
        active_products: productsData.filter((p) => p.is_active).length,
        total_landing_pages: landingPages.count ?? 0,
        published_landing_pages: lpData.filter((lp) => lp.is_published).length,
        total_views: totalViews,
        total_clicks: totalClicks,
        total_users: users.count ?? 0,
        views_last_7d: analytics.count ?? 0,
        clicks_last_7d: clicks.count ?? 0,
      },
    };
  } catch {
    return { success: false, error: "Failed to fetch stats" };
  }
}
