"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import type { ExpenseCategory, PaymentMethod } from "@/lib/database.types";

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const current = await getCurrentProfile();

  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    category: formData.get("category") as ExpenseCategory,
    amount: Number(formData.get("amount")),
    payment_method: (formData.get("payment_method") as PaymentMethod) || "cash",
    expense_date: (formData.get("expense_date") as string) || new Date().toISOString().slice(0, 10),
    notes: (formData.get("notes") as string) || null,
    created_by: current?.userId ?? null,
  };

  if (!payload.title || !payload.amount) throw new Error("العنوان والقيمة مطلوبان");

  const { error } = await supabase.from("expenses").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  if (!(await isAdmin())) throw new Error("غير مسموح");
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
