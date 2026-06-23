import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateTime, remaining } from "@/lib/utils";
import type { Customer, PrintJob } from "@/lib/database.types";

export default async function PrintJobReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: jobData } = await supabase.from("print_jobs").select("*").eq("id", id).maybeSingle();
  if (!jobData) notFound();
  const job = jobData as PrintJob;

  const customer = job.customer_id
    ? (await supabase.from("customers").select("*").eq("id", job.customer_id).single<Customer>()).data
    : null;

  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  const rem = remaining(job.total_price, job.paid_amount);

  return (
    <div className="space-y-4 text-navy" dir="rtl">
      <div className="border-b-2 border-navy pb-3 text-center">
        <h1 className="text-2xl font-extrabold">{settings?.shop_name ?? "ميجو"}</h1>
        <p className="text-sm text-slate-500">{settings?.slogan}</p>
        <p className="text-xs text-slate-500">
          {settings?.address} {settings?.phone ? `· ${settings.phone}` : ""}
        </p>
      </div>

      <div className="flex justify-between text-sm">
        <span>
          رقم الطلب: <span className="font-bold">{job.job_no}</span>
        </span>
        <span>التاريخ: {formatDateTime(job.created_at)}</span>
      </div>

      {customer && (
        <p className="text-sm">
          <span className="text-slate-500">العميل: </span>
          {customer.name} <span dir="ltr">({customer.phone})</span>
        </p>
      )}

      <p className="text-sm">
        <span className="text-slate-500">الوصف: </span>
        {job.description} × {job.quantity}
      </p>

      <div className="rounded-lg border border-slate-200 p-3 text-sm">
        <div className="flex justify-between">
          <span>الإجمالي</span>
          <span>{formatCurrency(job.total_price)}</span>
        </div>
        <div className="flex justify-between">
          <span>المدفوع</span>
          <span>{formatCurrency(job.paid_amount)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
          <span>المتبقي</span>
          <span>{formatCurrency(rem)}</span>
        </div>
      </div>

      {settings?.receipt_footer && (
        <p className="border-t border-slate-200 pt-2 text-center text-xs text-slate-400">
          {settings.receipt_footer}
        </p>
      )}
    </div>
  );
}
