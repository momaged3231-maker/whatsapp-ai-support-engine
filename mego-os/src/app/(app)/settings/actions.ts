"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export async function updateSettings(formData: FormData) {
  if (!(await isAdmin())) throw new Error("غير مسموح");
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const payload = {
    shop_name: String(formData.get("shop_name") ?? "").trim(),
    phone: (formData.get("phone") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    address: (formData.get("address") as string) || null,
    slogan: (formData.get("slogan") as string) || null,
    receipt_footer: (formData.get("receipt_footer") as string) || null,
  };
  if (!payload.shop_name) throw new Error("اسم المحل مطلوب");

  const { error } = await supabase.from("settings").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
