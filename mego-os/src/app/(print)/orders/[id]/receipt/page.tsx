import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deviceTypeLabels } from "@/lib/status";
import { formatCurrency, formatDateTime, remaining } from "@/lib/utils";
import type { Customer, RepairOrder } from "@/lib/database.types";

export default async function OrderReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: orderData } = await supabase.from("repair_orders").select("*").eq("id", id).maybeSingle();
  if (!orderData) notFound();
  const order = orderData as RepairOrder;

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", order.customer_id)
    .single<Customer>();

  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();

  const rem = remaining(order.final_price, order.paid_amount);

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
          رقم الطلب: <span className="font-bold">{order.order_no}</span>
        </span>
        <span>التاريخ: {formatDateTime(order.received_at)}</span>
      </div>

      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="w-1/3 py-1 font-semibold text-slate-500">العميل</td>
            <td className="py-1">{customer?.name}</td>
          </tr>
          <tr>
            <td className="py-1 font-semibold text-slate-500">الهاتف</td>
            <td className="py-1" dir="ltr">
              {customer?.phone}
            </td>
          </tr>
          <tr>
            <td className="py-1 font-semibold text-slate-500">نوع الجهاز</td>
            <td className="py-1">
              {deviceTypeLabels[order.device_type]} {order.device_brand} {order.device_model}
            </td>
          </tr>
          <tr>
            <td className="py-1 font-semibold text-slate-500">العطل</td>
            <td className="py-1">{order.problem_description}</td>
          </tr>
          <tr>
            <td className="py-1 font-semibold text-slate-500">الملحقات المستلمة</td>
            <td className="py-1">{order.received_accessories || "—"}</td>
          </tr>
          <tr>
            <td className="py-1 font-semibold text-slate-500">حالة الجهاز</td>
            <td className="py-1">{order.device_condition || "—"}</td>
          </tr>
        </tbody>
      </table>

      <div className="rounded-lg border border-slate-200 p-3 text-sm">
        <div className="flex justify-between">
          <span>السعر التقديري</span>
          <span>{formatCurrency(order.estimated_price)}</span>
        </div>
        <div className="flex justify-between">
          <span>المدفوع</span>
          <span>{formatCurrency(order.paid_amount)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
          <span>المتبقي</span>
          <span>{formatCurrency(rem)}</span>
        </div>
      </div>

      {order.customer_notes && (
        <div className="text-sm">
          <p className="font-semibold text-slate-500">ملاحظات</p>
          <p>{order.customer_notes}</p>
        </div>
      )}

      <p className="rounded-lg bg-orange/10 p-3 text-xs leading-6 text-orange">
        المحل غير مسؤول عن أي بيانات غير مذكور تسليمها أو نسخها احتياطيًا، ويجب على العميل طلب حفظ
        البيانات قبل الصيانة.
      </p>

      <div className="mt-10 flex justify-between text-sm">
        <div>
          <p className="mb-8">توقيع العميل</p>
          <p className="border-t border-slate-400 pt-1">..............................</p>
        </div>
        <div>
          <p className="mb-8">توقيع المحل</p>
          <p className="border-t border-slate-400 pt-1">..............................</p>
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
