"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export async function createInventoryItem(formData: FormData) {
  const supabase = await createClient();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    category: (formData.get("category") as string) || null,
    sku: (formData.get("sku") as string) || null,
    quantity: Number(formData.get("quantity") || 0),
    purchase_price: formData.get("purchase_price") ? Number(formData.get("purchase_price")) : null,
    selling_price: formData.get("selling_price") ? Number(formData.get("selling_price")) : null,
    min_quantity: Number(formData.get("min_quantity") || 1),
    supplier_name: (formData.get("supplier_name") as string) || null,
  };
  if (!payload.name) throw new Error("اسم المنتج مطلوب");

  const { error } = await supabase.from("inventory_items").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}

export async function updateInventoryItem(id: string, formData: FormData) {
  const supabase = await createClient();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    category: (formData.get("category") as string) || null,
    sku: (formData.get("sku") as string) || null,
    quantity: Number(formData.get("quantity") || 0),
    purchase_price: formData.get("purchase_price") ? Number(formData.get("purchase_price")) : null,
    selling_price: formData.get("selling_price") ? Number(formData.get("selling_price")) : null,
    min_quantity: Number(formData.get("min_quantity") || 1),
    supplier_name: (formData.get("supplier_name") as string) || null,
  };
  const { error } = await supabase.from("inventory_items").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}

export async function deleteInventoryItem(id: string) {
  if (!(await isAdmin())) throw new Error("غير مسموح");
  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}
