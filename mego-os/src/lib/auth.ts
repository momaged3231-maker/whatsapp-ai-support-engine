import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

export async function getCurrentProfile(): Promise<{ userId: string; profile: Profile | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  return { userId: data.user.id, profile: (profile as Profile) ?? null };
}

export async function isAdmin() {
  const current = await getCurrentProfile();
  return current?.profile?.role === "admin";
}
