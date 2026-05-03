import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function getProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
) {
  return supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
}

export async function getUserWithProfile(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null as User | null,
      profile: null as ProfileRow | null,
    };
  }

  const { data: existingProfile } = await getProfileByUserId(supabase, user.id);
  if (existingProfile) return { user, profile: existingProfile };

  const email = user.email;
  if (!email) {
    return { user, profile: null as ProfileRow | null };
  }

  const { data: createdProfile } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, email },
      {
        onConflict: "id",
      },
    )
    .select("*")
    .maybeSingle();

  if (createdProfile) return { user, profile: createdProfile };

  const { data: profileAfterRetry } = await getProfileByUserId(supabase, user.id);
  return { user, profile: profileAfterRetry ?? null };
}
