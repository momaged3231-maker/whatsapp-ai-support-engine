import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusSelect } from "@/components/order-status-select";
import { OrderEditForm } from "@/components/order-edit-form";
import { AddPaymentForm } from "@/components/add-payment-form";
import { CopyButton } from "@/components/copy-button";
import { DeleteButton } from "@/components/delete-button";
import { formatCurrency, formatDateTime, remaining } from "@/lib/utils";
import { deviceTypeLabels, orderStatusLabels, orderStatusTones } from "@/lib/status";
import {
  orderReceivedMessage,
  orderApprovalMessage,
  orderReadyMessage,
  orderDeliveredMessage,
  whatsappLink,
} from "@/lib/whatsapp-templates";
import { updateOrderStatus, updateOrderDetails, addOrderPayment, deleteOrder } from "../actions";
import { Printer, ExternalLink } from "lucide-react";
import type { Customer, RepairOrder } from "@/lib/database.types";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("repair_order_id", id)
    .order("paid_at", { ascending: false });

  const admin = await isAdmin();
  const rem = remaining(order.final_price, order.paid_amount);

  const waReceived = orderReceivedMessage(order.order_no);
  const waApproval = orderApprovalMessage(order.problem_description, order.estimated_price ?? 0);
  const waReady = orderReadyMessage(order.order_no, rem);
  const waDelivered = orderDeliveredMessage();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`طلب ${order.order_no}`}
        description={`${deviceTypeLabels[order.device_type]} — ${customer?.name ?? ""}`}
        action={
          <div className="flex gap-2">
            <Link href={`/orders/${id}/receipt`} target="_blank">
              <Button variant="outline" size="sm">
                <Printer size={14} /> طباعة إيصال
              </Button>
            </Link>
            {admin && (
              <DeleteButton action={async () => deleteOrder(id)} confirmText="حذف هذا الطلب؟" />
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>تفاصيل الطلب</CardTitle>
              <Badge tone={orderStatusTones[order.status]}>{orderStatusLabels[order.status]}</Badge>
            </CardHeader>
            <CardContent>
              <OrderEditForm order={order} action={updateOrderDetails.bind(null, id)} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>العميل</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{customer?.name}</p>
              <p dir="ltr" className="text-right text-slate-500">
                {customer?.phone}
              </p>
              {customer && (
                <Link href={`/customers/${customer.id}`} className="mt-2 inline-flex items-center gap-1 text-sm text-blue font-semibold">
                  ملف العميل <ExternalLink size={12} />
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تغيير الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusSelect orderId={id} status={order.status} action={updateOrderStatus} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الملخص المالي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">السعر التقديري</span>
                <span>{formatCurrency(order.estimated_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">السعر النهائي</span>
                <span>{formatCurrency(order.final_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المدفوع</span>
                <span className="text-green font-semibold">{formatCurrency(order.paid_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                <span>المتبقي</span>
                <span className="text-orange">{formatCurrency(rem)}</span>
              </div>
              <div className="pt-2">
                <AddPaymentForm action={addOrderPayment.bind(null, id)} />
              </div>
              {!!payments?.length && (
                <ul className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-500">
                  {payments.map((p) => (
                    <li key={p.id} className="flex justify-between">
                      <span>{formatDateTime(p.paid_at)}</span>
                      <span className="font-semibold text-navy">{formatCurrency(p.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>رسائل واتساب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "تم استلام الجهاز", text: waReceived },
                { label: "طلب الموافقة", text: waApproval },
                { label: "الجهاز جاهز", text: waReady },
                { label: "تم التسليم", text: waDelivered },
              ].map((m) => (
                <div key={m.label} className="rounded-lg border border-slate-100 p-2">
                  <p className="mb-2 text-xs font-semibold text-slate-500">{m.label}</p>
                  <p className="mb-2 text-sm">{m.text}</p>
                  <div className="flex gap-2">
                    <CopyButton text={m.text} />
                    {customer && (
                      <a href={whatsappLink(customer.phone, m.text)} target="_blank" rel="noreferrer">
                        <Button type="button" size="sm" variant="success">
                          إرسال واتساب
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
