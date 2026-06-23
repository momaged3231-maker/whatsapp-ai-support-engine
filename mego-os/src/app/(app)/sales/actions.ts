"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import type { ItemType, PaymentMethod, SaleType } from "@/lib/database.types";

interface ItemInput {
  item_type: ItemType;
  item_name: string;
  inventory_item_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export async function createSale(formData: FormData) {
  const supabase = await createClient();
  const current = await getCurrentProfile();

  const items = JSON.parse(String(formData.get("items_json") ?? "[]")) as ItemInput[];
  if (!items.length) throw new Error("أضف بند واحد على الأقل");

  const totalAmount = items.reduce((sum, i) => sum + i.total_price, 0);
  const hasService = items.some((i) => i.item_type === "service");
  const hasProduct = items.some((i) => i.item_type === "product");
  const saleType: SaleType = hasService && hasProduct ? "mixed" : hasService ? "service" : "product";

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

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      customer_id: customerId,
      sale_type: saleType,
      total_amount: totalAmount,
      paid_amount: Number(formData.get("paid_amount") || totalAmount),
      payment_method: (formData.get("payment_method") as PaymentMethod) || "cash",
      notes: (formData.get("notes") as string) || null,
      created_by: current?.userId ?? null,
    })
    .select("id")
    .single();
  if (saleError) throw new Error(saleError.message);

  const { error: itemsError } = await supabase
    .from("sale_items")
    .insert(items.map((i) => ({ ...i, sale_id: sale.id })));
  if (itemsError) throw new Error(itemsError.message);

  for (const item of items) {
    if (item.item_type === "product" && item.inventory_item_id) {
      const { data: inv } = await supabase
        .from("inventory_items")
        .select("quantity")
        .eq("id", item.inventory_item_id)
        .single();
      if (inv) {
        await supabase
          .from("inventory_items")
          .update({ quantity: Math.max(0, Number(inv.quantity) - item.quantity) })
          .eq("id", item.inventory_item_id);
      }
    }
  }

  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  redirect(`/sales/${sale.id}/invoice`);
}

export async function deleteSale(id: string) {
  if (!(await isAdmin())) throw new Error("غير مسموح");
  const supabase = await createClient();
  const { error } = await supabase.from("sales").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/sales");
  redirect("/sales");
}
