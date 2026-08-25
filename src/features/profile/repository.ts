import { createClient } from "@/lib/supabase/server";
import type { Profile, UserProfileForAuth } from "./types";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return { profile: null, error };
  return { profile: data as Profile, error: null };
}

export async function getUserWithProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<UserProfileForAuth | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .eq("id", userId)
      .single();

    if (error) {
      return null;
    }
    if (!data) {
      return null;
    }
    return data as UserProfileForAuth;
  } catch {
    return null;
  }
}
