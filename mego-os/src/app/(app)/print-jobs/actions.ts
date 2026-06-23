"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { PrintJobStatus, PrintJobType } from "@/lib/database.types";

export async function createPrintJob(formData: FormData) {
  const supabase = await createClient();

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

  const quantity = Number(formData.get("quantity") || 1);
  const unitPrice = Number(formData.get("unit_price") || 0);

  const payload = {
    customer_id: customerId,
    job_type: formData.get("job_type") as PrintJobType,
    description: String(formData.get("description") ?? "").trim(),
    quantity,
    unit_price: unitPrice,
    total_price: quantity * unitPrice,
    paid_amount: Number(formData.get("paid_amount") || 0),
    due_at: (formData.get("due_at") as string) || null,
  };

  if (!payload.description) throw new Error("الوصف مطلوب");

  const { data, error } = await supabase.from("print_jobs").insert(payload).select("id").single();
  if (error) throw new Error(error.message);

  revalidatePath("/print-jobs");
  revalidatePath("/dashboard");
  redirect(`/print-jobs/${data.id}`);
}

export async function updatePrintJobStatus(id: string, status: PrintJobStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("print_jobs").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/print-jobs/${id}`);
  revalidatePath("/print-jobs");
  revalidatePath("/dashboard");
}

export async function addPrintJobPayment(jobId: string, formData: FormData) {
  const supabase = await createClient();
  const amount = Number(formData.get("amount"));
  if (!amount || amount <= 0) throw new Error("ادخل قيمة صحيحة");

  const { data: job, error: jobError } = await supabase
    .from("print_jobs")
    .select("paid_amount")
    .eq("id", jobId)
    .single();
  if (jobError) throw new Error(jobError.message);

  const { error: payError } = await supabase.from("payments").insert({
    print_job_id: jobId,
    amount,
    payment_method: formData.get("payment_method") || "cash",
  });
  if (payError) throw new Error(payError.message);

  const { error: updateError } = await supabase
    .from("print_jobs")
    .update({ paid_amount: Number(job.paid_amount) + amount })
    .eq("id", jobId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/print-jobs/${jobId}`);
  revalidatePath("/dashboard");
}

export async function deletePrintJob(id: string) {
  if (!(await isAdmin())) throw new Error("غير مسموح");
  const supabase = await createClient();
  const { error } = await supabase.from("print_jobs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/print-jobs");
  redirect("/print-jobs");
}
