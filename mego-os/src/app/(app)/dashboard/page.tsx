import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orderStatusLabels, orderStatusTones } from "@/lib/status";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Customer, RepairOrder } from "@/lib/database.types";
import { PlusCircle, UserPlus, ShoppingCart, Receipt, Printer } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const todayStart = new Date().toISOString().slice(0, 10);

  const [
    { data: todayPayments },
    { data: todaySales },
    { data: todayExpenses },
    { count: newOrdersCount },
    { count: readyOrdersCount },
    { count: inShopCount },
    { count: pendingFollowupsCount },
    { data: lowStock },
    { count: activeSubsCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("payments").select("amount").gte("paid_at", todayStart),
    supabase.from("sales").select("paid_amount").gte("created_at", todayStart),
    supabase.from("expenses").select("amount").gte("expense_date", todayStart),
    supabase.from("repair_orders").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("repair_orders").select("id", { count: "exact", head: true }).eq("status", "ready"),
    supabase.from("repair_orders").select("id", { count: "exact", head: true }).not("status", "in", "(delivered,cancelled)"),
    supabase.from("followups").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("inventory_items").select("*"),
    supabase.from("business_subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("repair_orders").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  const sum = (rows: { amount?: number; paid_amount?: number }[] | null, key: "amount" | "paid_amount") =>
    (rows ?? []).reduce((s, r) => s + Number(r[key] ?? 0), 0);

  const todayIncome = sum(todayPayments, "amount") + sum(todaySales, "paid_amount");
  const todayExpenseTotal = sum(todayExpenses, "amount");
  const lowStockCount = (lowStock ?? []).filter((i) => Number(i.quantity) <= Number(i.min_quantity)).length;

  const recentOrderIds = ((recentOrders as RepairOrder[] | null) ?? []).map((o) => o.customer_id);
  const { data: customers } = recentOrderIds.length
    ? await supabase.from("customers").select("id, name").in("id", [...new Set(recentOrderIds)])
    : { data: [] as Pick<Customer, "id" | "name">[] };
  const customerNameMap = new Map((customers ?? []).map((c) => [c.id, c.name]));

  const stats = [
    { label: "دخل اليوم", value: formatCurrency(todayIncome), tone: "text-green" },
    { label: "مصاريف اليوم", value: formatCurrency(todayExpenseTotal), tone: "text-orange" },
    { label: "صافي اليوم", value: formatCurrency(todayIncome - todayExpenseTotal), tone: "text-blue" },
    { label: "طلبات جديدة", value: newOrdersCount ?? 0, tone: "text-navy" },
    { label: "طلبات جاهزة للتسليم", value: readyOrdersCount ?? 0, tone: "text-green" },
    { label: "أجهزة داخل المحل", value: inShopCount ?? 0, tone: "text-cyan" },
    { label: "عملاء يحتاجون متابعة", value: pendingFollowupsCount ?? 0, tone: "text-orange" },
    { label: "مخزون منخفض", value: lowStockCount, tone: "text-red-600" },
    { label: "اشتراكات نشطة", value: activeSubsCount ?? 0, tone: "text-blue" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="الرئيسية" description="نظرة عامة على نشاط المحل اليوم" />

      <div className="flex flex-wrap gap-3">
        <Link href="/orders/new">
          <Button>
            <PlusCircle size={16} /> طلب صيانة جديد
          </Button>
        </Link>
        <Link href="/customers/new">
          <Button variant="secondary">
            <UserPlus size={16} /> عميل جديد
          </Button>
        </Link>
        <Link href="/sales/new">
          <Button variant="success">
            <ShoppingCart size={16} /> فاتورة بيع
          </Button>
        </Link>
        <Link href="/expenses">
          <Button variant="outline">
            <Receipt size={16} /> مصروف جديد
          </Button>
        </Link>
        <Link href="/print-jobs/new">
          <Button variant="outline">
            <Printer size={16} /> طباعة إيصال
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="text-center">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.tone}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 pb-0">
            <h3 className="text-base font-bold text-navy">آخر طلبات الصيانة</h3>
            <Link href="/orders" className="text-sm font-semibold text-blue">
              عرض الكل
            </Link>
          </div>
          <Table>
            <Thead>
              <Tr>
                <Th>رقم الطلب</Th>
                <Th>العميل</Th>
                <Th>الحالة</Th>
                <Th>تاريخ الإنشاء</Th>
              </Tr>
            </Thead>
            <Tbody>
              {((recentOrders as RepairOrder[] | null) ?? []).map((o) => (
                <Tr key={o.id}>
                  <Td className="font-semibold">
                    <Link href={`/orders/${o.id}`} className="text-blue">
                      {o.order_no}
                    </Link>
                  </Td>
                  <Td>{customerNameMap.get(o.customer_id) ?? "—"}</Td>
                  <Td>
                    <Badge tone={orderStatusTones[o.status]}>{orderStatusLabels[o.status]}</Badge>
                  </Td>
                  <Td>{formatDateTime(o.created_at)}</Td>
                </Tr>
              ))}
              {!recentOrders?.length && (
                <Tr>
                  <Td colSpan={4} className="py-8 text-center text-slate-400">
                    لا يوجد طلبات حتى الآن
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
