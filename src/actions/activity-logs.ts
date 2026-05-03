"use server";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

export interface ActivityLog {
    id: string;
    user_id: string | null;
    action: string;
    resource: string | null;
    resource_id: string | null;
    metadata: Json;
    ip_address: string | null;
    created_at: string;
    profile?: {
        full_name: string | null;
        email: string;
        avatar_url: string | null;
    } | null;
}

export async function logActivity(
    action: string,
    options?: {
        resource?: string;
        resourceId?: string;
        metadata?: Json;
    },
): Promise<void> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("activity_logs").insert({
            user_id: user.id,
            action,
            resource: options?.resource ?? null,
            resource_id: options?.resourceId ?? null,
            metadata: options?.metadata ?? ({} as Json),
        });
    } catch {
        // Fire-and-forget — never throw from logActivity
    }
}
export async function getActivityLogs(options?: {
    page?: number;
    pageSize?: number;
    userId?: string;
    action?: string;
}): Promise<ActionResult<{ data: ActivityLog[]; count: number; pageCount: number }>> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const page = options?.page ?? 1;
        const pageSize = options?.pageSize ?? 25;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from("activity_logs")
            .select(
                `*, profile:profiles(full_name, email, avatar_url)`,
                { count: "exact" },
            )
            .order("created_at", { ascending: false })
            .range(from, to);

        if (options?.userId) query = query.eq("user_id", options.userId);
        if (options?.action) query = query.eq("action", options.action);

        const { data, error, count } = await query;
        if (error) return { success: false, error: error.message };

        return {
            success: true,
            data: {
                data: (data ?? []) as ActivityLog[],
                count: count ?? 0,
                pageCount: Math.ceil((count ?? 0) / pageSize),
            },
        };
    } catch {
        return { success: false, error: "Failed to fetch activity logs" };
    }
}

export async function getMyActivity(limit = 10): Promise<ActionResult<ActivityLog[]>> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { data, error } = await supabase
            .from("activity_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) return { success: false, error: error.message };
        return { success: true, data: (data ?? []) as ActivityLog[] };
    } catch {
        return { success: false, error: "Failed to fetch activity" };
    }
}
