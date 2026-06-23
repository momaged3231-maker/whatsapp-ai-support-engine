"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { ServiceCategory } from "@/lib/database.types";

export async function createService(formData: FormData) {
  const supabase = await createClient();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    category: formData.get("category") as ServiceCategory,
    starting_price: formData.get("starting_price") ? Number(formData.get("starting_price")) : null,
    cost_estimate: formData.get("cost_estimate") ? Number(formData.get("cost_estimate")) : null,
    description: (formData.get("description") as string) || null,
  };
  if (!payload.name) throw new Error("اسم الخدمة مطلوب");

  const { error } = await supabase.from("services").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/services");
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    category: formData.get("category") as ServiceCategory,
    starting_price: formData.get("starting_price") ? Number(formData.get("starting_price")) : null,
    cost_estimate: formData.get("cost_estimate") ? Number(formData.get("cost_estimate")) : null,
    description: (formData.get("description") as string) || null,
  };
  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/services");
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/services");
}

export async function deleteService(id: string) {
  if (!(await isAdmin())) throw new Error("غير مسموح");
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/services");
}
