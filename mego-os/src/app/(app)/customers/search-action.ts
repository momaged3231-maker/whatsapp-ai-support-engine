"use server";

import { createClient } from "@/lib/supabase/server";

export async function searchCustomers(query: string) {
  if (!query || query.trim().length < 1) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("id, name, phone")
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}
