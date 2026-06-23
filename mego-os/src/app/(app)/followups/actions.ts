"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import type { FollowupStatus } from "@/lib/database.types";

export async function createFollowup(formData: FormData) {
  const supabase = await createClient();
  const current = await getCurrentProfile();

  let customerId = (formData.get("customer_id") as string) || null;
  const newName = String(formData.get("new_customer_name") ?? "").trim();
  const newPhone = String(formData.get("new_customer_phone") ?? "").trim();
  if (!customerId && newName && newPhone) {
    const { data, error } = await supabase
      .from("customers")
      .insert({ name: newName, phone: newPhone, customer_type: "individual", source: "walk_in" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    customerId = data.id;
  }
  if (!customerId) throw new Error("بيانات العميل مطلوبة");

  const orderId = (formData.get("order_id") as string) || null;

  const payload = {
    customer_id: customerId,
    order_id: orderId,
    title: String(formData.get("title") ?? "").trim(),
    followup_date: formData.get("followup_date") as string,
    notes: (formData.get("notes") as string) || null,
    created_by: current?.userId ?? null,
  };
  if (!payload.title || !payload.followup_date) throw new Error("بيانات المتابعة غير مكتملة");

  const { error } = await supabase.from("followups").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/followups");
  revalidatePath("/dashboard");
}

export async function updateFollowupStatus(id: string, status: FollowupStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("followups").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/followups");
  revalidatePath("/dashboard");
}

export async function deleteFollowup(id: string) {
  if (!(await isAdmin())) throw new Error("غير مسموح");
  const supabase = await createClient();
  const { error } = await supabase.from("followups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/followups");
  revalidatePath("/dashboard");
}
