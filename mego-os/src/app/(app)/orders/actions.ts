"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import type { DeviceType, OrderPriority, OrderStatus } from "@/lib/database.types";

async function resolveCustomerId(formData: FormData): Promise<string> {
  const supabase = await createClient();
  const existingId = formData.get("customer_id") as string;
  if (existingId) return existingId;

  const name = String(formData.get("new_customer_name") ?? "").trim();
  const phone = String(formData.get("new_customer_phone") ?? "").trim();
  if (!name || !phone) throw new Error("بيانات العميل غير مكتملة");

  const { data, error } = await supabase
    .from("customers")
    .insert({ name, phone, customer_type: "individual", source: "walk_in" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const current = await getCurrentProfile();
  const customerId = await resolveCustomerId(formData);

  const payload = {
    customer_id: customerId,
    device_type: formData.get("device_type") as DeviceType,
    device_brand: (formData.get("device_brand") as string) || null,
    device_model: (formData.get("device_model") as string) || null,
    problem_description: String(formData.get("problem_description") ?? "").trim(),
    received_accessories: (formData.get("received_accessories") as string) || null,
    device_condition: (formData.get("device_condition") as string) || null,
    data_privacy_note: (formData.get("data_privacy_note") as string) || null,
    estimated_price: formData.get("estimated_price") ? Number(formData.get("estimated_price")) : null,
    priority: (formData.get("priority") as OrderPriority) || "normal",
    customer_notes: (formData.get("customer_notes") as string) || null,
    created_by: current?.userId ?? null,
  };

  if (!payload.problem_description) throw new Error("وصف العطل مطلوب");

  const { data, error } = await supabase.from("repair_orders").insert(payload).select("id").single();
  if (error) throw new Error(error.message);

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  redirect(`/orders/${data.id}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { status };
  if (status === "delivered") patch.delivered_at = new Date().toISOString();

  const { error } = await supabase.from("repair_orders").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}

export async function updateOrderDetails(id: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    device_type: formData.get("device_type") as DeviceType,
    device_brand: (formData.get("device_brand") as string) || null,
    device_model: (formData.get("device_model") as string) || null,
    problem_description: String(formData.get("problem_description") ?? "").trim(),
    received_accessories: (formData.get("received_accessories") as string) || null,
    device_condition: (formData.get("device_condition") as string) || null,
    estimated_price: formData.get("estimated_price") ? Number(formData.get("estimated_price")) : null,
    final_price: formData.get("final_price") ? Number(formData.get("final_price")) : null,
    priority: formData.get("priority") as OrderPriority,
    expected_delivery_at: (formData.get("expected_delivery_at") as string) || null,
    technician_notes: (formData.get("technician_notes") as string) || null,
    customer_notes: (formData.get("customer_notes") as string) || null,
  };

  const { error } = await supabase.from("repair_orders").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}

export async function addOrderPayment(orderId: string, formData: FormData) {
  const supabase = await createClient();
  const current = await getCurrentProfile();
  const amount = Number(formData.get("amount"));
  if (!amount || amount <= 0) throw new Error("ادخل قيمة صحيحة");

  const { data: order, error: orderError } = await supabase
    .from("repair_orders")
    .select("paid_amount")
    .eq("id", orderId)
    .single();
  if (orderError) throw new Error(orderError.message);

  const { error: payError } = await supabase.from("payments").insert({
    repair_order_id: orderId,
    amount,
    payment_method: formData.get("payment_method") || "cash",
    notes: (formData.get("notes") as string) || null,
    created_by: current?.userId ?? null,
  });
  if (payError) throw new Error(payError.message);

  const { error: updateError } = await supabase
    .from("repair_orders")
    .update({ paid_amount: Number(order.paid_amount) + amount })
    .eq("id", orderId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dashboard");
}

export async function deleteOrder(id: string) {
  if (!(await isAdmin())) throw new Error("غير مسموح");
  const supabase = await createClient();
  const { error } = await supabase.from("repair_orders").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/orders");
  redirect("/orders");
}
