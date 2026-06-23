import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrintJobStatusSelect } from "@/components/print-job-status-select";
import { AddPaymentForm } from "@/components/add-payment-form";
import { DeleteButton } from "@/components/delete-button";
import { formatCurrency, formatDateTime, remaining } from "@/lib/utils";
import { printJobStatusLabels, printJobStatusTones } from "@/lib/status";
import { updatePrintJobStatus, addPrintJobPayment, deletePrintJob } from "../actions";
import { Printer } from "lucide-react";
import type { Customer, PrintJob } from "@/lib/database.types";

export default async function PrintJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: jobData } = await supabase.from("print_jobs").select("*").eq("id", id).maybeSingle();
  if (!jobData) notFound();
  const job = jobData as PrintJob;

  const customer = job.customer_id
    ? (await supabase.from("customers").select("*").eq("id", job.customer_id).single<Customer>()).data
    : null;

  const admin = await isAdmin();
  const rem = remaining(job.total_price, job.paid_amount);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`طلب ${job.job_no}`}
        description={job.description}
        action={
          <div className="flex gap-2">
            <Link href={`/print-jobs/${id}/receipt`} target="_blank">
              <Button variant="outline" size="sm">
                <Printer size={14} /> طباعة إيصال
              </Button>
            </Link>
            {admin && <DeleteButton action={deletePrintJob.bind(null, id)} confirmText="حذف هذا الطلب؟" />}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>تفاصيل الطلب</CardTitle>
            <Badge tone={printJobStatusTones[job.status]}>{printJobStatusLabels[job.status]}</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">العميل: </span>
              {customer?.name ?? "—"}
            </p>
            <p>
              <span className="text-slate-500">الوصف: </span>
              {job.description}
            </p>
            <p>
              <span className="text-slate-500">الكمية: </span>
              {job.quantity}
            </p>
            <p>
              <span className="text-slate-500">سعر الوحدة: </span>
              {formatCurrency(job.unit_price)}
            </p>
            <p>
              <span className="text-slate-500">موعد التسليم: </span>
              {job.due_at ? formatDateTime(job.due_at) : "—"}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تغيير الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <PrintJobStatusSelect jobId={id} status={job.status} action={updatePrintJobStatus} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الملخص المالي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">الإجمالي</span>
                <span>{formatCurrency(job.total_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المدفوع</span>
                <span className="text-green font-semibold">{formatCurrency(job.paid_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                <span>المتبقي</span>
                <span className="text-orange">{formatCurrency(rem)}</span>
              </div>
              <div className="pt-2">
                <AddPaymentForm action={addPrintJobPayment.bind(null, id)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
