"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { SubscriptionPackage, SubscriptionStatus } from "@/lib/database.types";

export async function createSubscription(formData: FormData) {
  const supabase = await createClient();

  let customerId = (formData.get("customer_id") as string) || null;
  const newName = String(formData.get("new_customer_name") ?? "").trim();
  const newPhone = String(formData.get("new_customer_phone") ?? "").trim();
  if (!customerId && newName && newPhone) {
    const { data, error } = await supabase
      .from("customers")
      .insert({ name: newName, phone: newPhone, customer_type: "business", source: "walk_in" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    customerId = data.id;
  }
  if (!customerId) throw new Error("بيانات العميل مطلوبة");

  const payload = {
    customer_id: customerId,
    business_name: String(formData.get("business_name") ?? "").trim(),
    package_name: formData.get("package_name") as SubscriptionPackage,
    monthly_price: Number(formData.get("monthly_price") || 0),
    start_date: (formData.get("start_date") as string) || new Date().toISOString().slice(0, 10),
    renewal_date: formData.get("renewal_date") as string,
    included_visits: Number(formData.get("included_visits") || 0),
    included_remote_support: formData.get("included_remote_support") === "on",
    notes: (formData.get("notes") as string) || null,
  };
  if (!payload.business_name || !payload.renewal_date) throw new Error("بيانات الاشتراك غير مكتملة");

  const { error } = await supabase.from("business_subscriptions").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/business-care");
  revalidatePath("/dashboard");
}

export async function updateSubscriptionStatus(id: string, status: SubscriptionStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("business_subscriptions").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/business-care");
  revalidatePath("/dashboard");
}

export async function incrementUsedVisit(id: string, used: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("business_subscriptions").update({ used_visits: used }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/business-care");
}

export async function renewSubscription(id: string, renewalDate: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("business_subscriptions")
    .update({ renewal_date: renewalDate, used_visits: 0, status: "active" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/business-care");
}

export async function deleteSubscription(id: string) {
  if (!(await isAdmin())) throw new Error("غير مسموح");
  const supabase = await createClient();
  const { error } = await supabase.from("business_subscriptions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/business-care");
  revalidatePath("/dashboard");
}
