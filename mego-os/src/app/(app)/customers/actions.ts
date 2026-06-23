"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { CustomerType, CustomerSource } from "@/lib/database.types";

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    phone2: (formData.get("phone2") as string) || null,
    area: (formData.get("area") as string) || null,
    address: (formData.get("address") as string) || null,
    customer_type: formData.get("customer_type") as CustomerType,
    source: formData.get("source") as CustomerSource,
    notes: (formData.get("notes") as string) || null,
  };

  if (!payload.name || !payload.phone) {
    throw new Error("الاسم ورقم الهاتف مطلوبان");
  }

  const { data, error } = await supabase.from("customers").insert(payload).select("id").single();
  if (error) throw new Error(error.message);

  revalidatePath("/customers");
  redirect(`/customers/${data.id}`);
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    phone2: (formData.get("phone2") as string) || null,
    area: (formData.get("area") as string) || null,
    address: (formData.get("address") as string) || null,
    customer_type: formData.get("customer_type") as CustomerType,
    source: formData.get("source") as CustomerSource,
    notes: (formData.get("notes") as string) || null,
  };

  const { error } = await supabase.from("customers").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  if (!(await isAdmin())) throw new Error("غير مسموح");

  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/customers");
  redirect("/customers");
}
