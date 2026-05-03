"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { getUserWithProfile } from "@/lib/supabase/profiles";

export async function updateProfile(data: {
    full_name?: string;
}): Promise<ActionResult<Profile>> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        if (!data.full_name?.trim()) {
            return { success: false, error: "Name is required." };
        }

        // Update auth metadata
        await supabase.auth.updateUser({
            data: { full_name: data.full_name.trim() },
        });

        // Update profiles table
        const { data: updated, error } = await supabase
            .from("profiles")
            .update({ full_name: data.full_name.trim() })
            .eq("id", user.id)
            .select()
            .single();

        if (error) return { success: false, error: error.message };

        revalidatePath("/dashboard/settings/profile");
        revalidatePath("/dashboard");
        return { success: true, data: updated as Profile, message: "Profile updated." };
    } catch {
        return { success: false, error: "Failed to update profile" };
    }
}
export async function updateAvatar(avatarUrl: string): Promise<ActionResult<Profile>> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { data: updated, error } = await supabase
            .from("profiles")
            .update({ avatar_url: avatarUrl || null })
            .eq("id", user.id)
            .select()
            .single();

        if (error) return { success: false, error: error.message };

        revalidatePath("/dashboard/settings/profile");
        revalidatePath("/dashboard");
        return { success: true, data: updated as Profile, message: "Avatar updated." };
    } catch {
        return { success: false, error: "Failed to update avatar" };
    }
}
export async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}): Promise<ActionResult> {
    if (!data.newPassword || data.newPassword.length < 8) {
        return { success: false, error: "New password must be at least 8 characters." };
    }
    if (data.newPassword !== data.confirmPassword) {
        return { success: false, error: "Passwords do not match." };
    }

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        // Verify current password by re-signing in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: data.currentPassword,
        });

        if (signInError) {
            return { success: false, error: "Current password is incorrect." };
        }

        // Update to new password
        const { error } = await supabase.auth.updateUser({
            password: data.newPassword,
        });

        if (error) return { success: false, error: error.message };

        return { success: true, message: "Password changed successfully." };
    } catch {
        return { success: false, error: "Failed to change password" };
    }
}
export async function getMyProfile(): Promise<ActionResult<Profile>> {
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
