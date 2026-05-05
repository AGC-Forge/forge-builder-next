"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addDays, addMonths, addYears, isPast } from "date-fns";

export type PlanType = "free" | "starter" | "pro" | "enterprise";
export type BillingPeriod = "monthly" | "yearly" | "lifetime";

export interface Membership {
  id: string;
  user_id: string;
  plan_type: PlanType;
  started_at: string;
  expires_at: string | null;
  is_active: boolean;
  payment_ref: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * @description Plan configs
 */
export const PLAN_CONFIG: Record<PlanType, {
  label: string;
  price_monthly: number;
  price_yearly: number;
  max_pages: number;
  max_products: number;
  features: string[];
  color: string;
}> = {
  free: {
    label: "Free",
    price_monthly: 0,
    price_yearly: 0,
    max_pages: 3,
    max_products: 5,
    color: "text-muted-foreground",
    features: [
      "3 landing pages",
      "5 products",
      "Basic blocks (20)",
      "5 AI uses/month",
      "Tracking pixels",
      "SnapLand subdomain",
    ],
  },
  starter: {
    label: "Starter",
    price_monthly: 99000,
    price_yearly: 899000,
    max_pages: 10,
    max_products: 30,
    color: "text-blue-600",
    features: [
      "10 landing pages",
      "30 products",
      "All 42 blocks",
      "50 AI uses/month",
      "Order system",
      "WA Rotator + Payments",
      "All tracking pixels",
    ],
  },
  pro: {
    label: "Pro",
    price_monthly: 299000,
    price_yearly: 2499000,
    max_pages: 999,
    max_products: 999,
    color: "text-purple-600",
    features: [
      "Unlimited landing pages",
      "Unlimited products",
      "All blocks + applications",
      "Unlimited AI usage",
      "Custom domain (1)",
      "Remove SnapLand branding",
      "Priority support",
    ],
  },
  enterprise: {
    label: "Enterprise",
    price_monthly: 0,
    price_yearly: 0,
    max_pages: 9999,
    max_products: 9999,
    color: "text-amber-600",
    features: [
      "Everything in Pro",
      "Unlimited custom domains",
      "White-label option",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
};

/**
 * @description Get my current active membership
 */
export async function getMyMembership(): Promise<ActionResult<Membership | null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Membership) ?? null };
  } catch {
    return { success: false, error: "Failed to fetch membership" };
  }
}

/**
 * @description Get membership for any user (admin)
 */
export async function getUserMembership(userId: string): Promise<ActionResult<Membership | null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Membership) ?? null };
  } catch {
    return { success: false, error: "Failed to fetch membership" };
  }
}

/**
 * @description Upgrade / change plan (admin assign)
 */
export async function assignMembership(input: {
  userId: string;
  planType: PlanType;
  period?: BillingPeriod;
  paymentRef?: string;
}): Promise<ActionResult<Membership>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Calculate expiry
    const now = new Date();
    let expiresAt: Date | null = null;

    if (input.planType !== "free" && input.planType !== "enterprise") {
      switch (input.period) {
        case "yearly":
          expiresAt = addYears(now, 1);
          break;
        case "lifetime":
          expiresAt = null; // never expires
          break;
        default: // monthly
          expiresAt = addMonths(now, 1);
      }
    }

    // Deactivate any existing active membership
    await supabase
      .from("memberships")
      .update({ is_active: false })
      .eq("user_id", input.userId)
      .eq("is_active", true);

    // Insert new membership
    const { data, error } = await supabase
      .from("memberships")
      .insert({
        user_id: input.userId,
        plan_type: input.planType,
        started_at: now.toISOString(),
        expires_at: expiresAt?.toISOString() ?? null,
        is_active: true,
        payment_ref: input.paymentRef ?? null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // Sync plan limits to profiles table
    const planCfg = PLAN_CONFIG[input.planType];
    await supabase
      .from("profiles")
      .update({
        plan_type: input.planType,
        plan_expires_at: expiresAt?.toISOString() ?? null,
        max_products: planCfg.max_products,
        max_landing_pages: planCfg.max_pages,
      })
      .eq("id", input.userId);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");
    return { success: true, data: data as Membership, message: `Plan upgraded to ${input.planType}.` };
  } catch {
    return { success: false, error: "Failed to assign membership" };
  }
}

/**
 * @description Downgrade a user's membership to free plan
 */
export async function downgradeMembership(userId: string): Promise<ActionResult> {
  return assignMembership({ userId, planType: "free" });
}

/**
 * @description Get all memberships paginated (admin)
 */
export async function getAllMemberships(opts: {
  page?: number;
  pageSize?: number;
  planType?: PlanType;
  search?: string;
} = {}): Promise<ActionResult<{
  data: (Membership & { profile: { email: string; full_name: string | null; avatar_url: string | null } })[];
  count: number;
  pageCount: number;
}>> {
  try {
    const supabase = await createClient();
    const { page = 1, pageSize = 20, planType, search } = opts;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("memberships")
      .select(`
        *,
        profile:profiles(email, full_name, avatar_url)
      `, { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (planType) query = query.eq("plan_type", planType);

    const { data, error, count } = await query;
    if (error) return { success: false, error: error.message };

    let filtered = (data ?? []) as (Membership & { profile: { email: string; full_name: string | null; avatar_url: string | null } })[];

    // Filter by search (client-side since profiles join is nested)
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(m =>
        m.profile?.email?.toLowerCase().includes(q) ||
        m.profile?.full_name?.toLowerCase().includes(q),
      );
    }

    return {
      success: true,
      data: {
        data: filtered,
        count: count ?? 0,
        pageCount: Math.ceil((count ?? 0) / pageSize),
      },
    };
  } catch {
    return { success: false, error: "Failed to fetch memberships" };
  }
}

/**
 * @description Check for memberships that have passed expires_at with 3-day grace period.
 * @returns {Promise<{ expired: number; errors: string[] }>} - Number of expired memberships and any errors that occurred.
 */
export async function runExpireMemberships(): Promise<{
  expired: number;
  errors: string[];
}> {
  const supabase = createAdminClient();
  const errors: string[] = [];
  let expiredCount = 0;

  try {
    // Find all memberships that have passed expires_at with 3-day grace period
    const gracePeriodEnd = addDays(new Date(), -3); // expired > 3 days ago

    const { data: expiredMemberships } = await supabase
      .from("memberships")
      .select("id, user_id, plan_type")
      .eq("is_active", true)
      .not("expires_at", "is", null)
      .lt("expires_at", gracePeriodEnd.toISOString());

    for (const membership of expiredMemberships ?? []) {
      try {
        // Deactivate expired membership
        await supabase
          .from("memberships")
          .update({ is_active: false })
          .eq("id", membership.id);

        // Create new free membership
        await supabase
          .from("memberships")
          .insert({
            user_id: membership.user_id,
            plan_type: "free",
            is_active: true,
          });

        // Sync profile
        await supabase
          .from("profiles")
          .update({
            plan_type: "free",
            plan_expires_at: null,
            max_products: PLAN_CONFIG.free.max_products,
            max_landing_pages: PLAN_CONFIG.free.max_pages,
          })
          .eq("id", membership.user_id);

        expiredCount++;
      } catch (err) {
        errors.push(`Failed for user ${membership.user_id}: ${String(err)}`);
      }
    }
  } catch (err) {
    errors.push(`Cron job failed: ${String(err)}`);
  }

  return { expired: expiredCount, errors };
}
