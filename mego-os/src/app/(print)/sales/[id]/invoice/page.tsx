import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { paymentMethodLabels } from "@/lib/status";
import { formatCurrency, formatDateTime, remaining } from "@/lib/utils";
import type { Customer, Sale, SaleItem } from "@/lib/database.types";

export default async function SaleInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: saleData } = await supabase.from("sales").select("*").eq("id", id).maybeSingle();
  if (!saleData) notFound();
  const sale = saleData as Sale;

  const [{ data: items }, { data: settings }] = await Promise.all([
    supabase.from("sale_items").select("*").eq("sale_id", id),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const customer = sale.customer_id
    ? (await supabase.from("customers").select("*").eq("id", sale.customer_id).single<Customer>()).data
    : null;

  const rem = remaining(sale.total_amount, sale.paid_amount);

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
          رقم الفاتورة: <span className="font-bold">{sale.sale_no}</span>
        </span>
        <span>التاريخ: {formatDateTime(sale.created_at)}</span>
      </div>

      <p className="text-sm">
        <span className="text-slate-500">العميل: </span>
        {customer?.name ?? "عميل نقدي"}
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-right text-slate-500">
            <th className="py-1">البند</th>
            <th className="py-1">الكمية</th>
            <th className="py-1">السعر</th>
            <th className="py-1">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {(items as SaleItem[] | null)?.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-1">{item.item_name}</td>
              <td className="py-1">{item.quantity}</td>
              <td className="py-1">{formatCurrency(item.unit_price)}</td>
              <td className="py-1">{formatCurrency(item.total_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rounded-lg border border-slate-200 p-3 text-sm">
        <div className="flex justify-between">
          <span>الإجمالي</span>
          <span>{formatCurrency(sale.total_amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>طريقة الدفع</span>
          <span>{paymentMethodLabels[sale.payment_method]}</span>
        </div>
        <div className="flex justify-between">
          <span>المدفوع</span>
          <span>{formatCurrency(sale.paid_amount)}</span>
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
