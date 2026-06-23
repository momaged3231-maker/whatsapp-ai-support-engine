import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { MonthPicker } from "@/components/month-picker";
import { orderStatusLabels } from "@/lib/status";
import { formatCurrency, formatDate, remaining } from "@/lib/utils";
import type { RepairOrder, PrintJob, Customer } from "@/lib/database.types";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const supabase = await createClient();

  const now = new Date();
  const selectedMonth = month || now.toISOString().slice(0, 7);
  const [year, mon] = selectedMonth.split("-").map(Number);
  const monthStart = new Date(year, mon - 1, 1).toISOString().slice(0, 10);
  const monthEnd = new Date(year, mon, 1).toISOString().slice(0, 10);
  const todayStart = now.toISOString().slice(0, 10);

  const [
    { data: todayPayments },
    { data: todaySales },
    { data: todayExpenses },
    { data: monthPayments },
    { data: monthSales },
    { data: monthExpenses },
    { data: monthSaleItems },
    { data: openOrders },
    { data: unpaidOrders },
    { data: unpaidPrintJobs },
  ] = await Promise.all([
    supabase.from("payments").select("amount").gte("paid_at", todayStart),
    supabase.from("sales").select("paid_amount").gte("created_at", todayStart),
    supabase.from("expenses").select("amount").gte("expense_date", todayStart),
    supabase.from("payments").select("amount").gte("paid_at", monthStart).lt("paid_at", monthEnd),
    supabase.from("sales").select("paid_amount").gte("created_at", monthStart).lt("created_at", monthEnd),
    supabase.from("expenses").select("amount").gte("expense_date", monthStart).lt("expense_date", monthEnd),
    supabase
      .from("sale_items")
      .select("item_name, item_type, quantity, total_price, sales!inner(created_at)")
      .eq("item_type", "service")
      .gte("sales.created_at", monthStart)
      .lt("sales.created_at", monthEnd),
    supabase
      .from("repair_orders")
      .select("*")
      .not("status", "in", "(delivered,cancelled)")
      .order("received_at", { ascending: true }),
    supabase.from("repair_orders").select("*").not("status", "eq", "cancelled").not("final_price", "is", null),
    supabase.from("print_jobs").select("*").not("status", "eq", "cancelled"),
  ]);

  const sum = (rows: { amount?: number; paid_amount?: number; total_price?: number }[] | null, key: "amount" | "paid_amount" | "total_price") =>
    (rows ?? []).reduce((s, r) => s + Number(r[key] ?? 0), 0);

  const todayIncome = sum(todayPayments, "amount") + sum(todaySales, "paid_amount");
  const todayExpenseTotal = sum(todayExpenses, "amount");
  const monthIncome = sum(monthPayments, "amount") + sum(monthSales, "paid_amount");
  const monthExpenseTotal = sum(monthExpenses, "amount");

  const topServices = new Map<string, { quantity: number; total: number }>();
  for (const row of monthSaleItems ?? []) {
    const r = row as { item_name: string; quantity: number; total_price: number };
    const entry = topServices.get(r.item_name) ?? { quantity: 0, total: 0 };
    entry.quantity += Number(r.quantity);
    entry.total += Number(r.total_price);
    topServices.set(r.item_name, entry);
  }
  const topServicesList = [...topServices.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 10);

  const outstandingOrders = ((unpaidOrders as RepairOrder[] | null) ?? []).filter(
    (o) => remaining(o.final_price, o.paid_amount) > 0,
  );
  const outstandingPrintJobs = ((unpaidPrintJobs as PrintJob[] | null) ?? []).filter(
    (j) => remaining(j.total_price, j.paid_amount) > 0,
  );

  const orderCustomerIds = [...new Set(outstandingOrders.map((o) => o.customer_id))];
  const jobCustomerIds = [...new Set(outstandingPrintJobs.map((j) => j.customer_id).filter(Boolean))] as string[];
  const allCustomerIds = [...new Set([...orderCustomerIds, ...jobCustomerIds])];
  const { data: customers } = allCustomerIds.length
    ? await supabase.from("customers").select("id, name").in("id", allCustomerIds)
    : { data: [] as Pick<Customer, "id" | "name">[] };
  const customerNameMap = new Map((customers ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <PageHeader title="التقارير" description="دخل ومصاريف وأرصدة المحل" />

      <MonthPicker defaultValue={selectedMonth} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="text-center">
            <p className="text-sm text-slate-500">دخل اليوم</p>
            <p className="text-2xl font-extrabold text-green">{formatCurrency(todayIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-sm text-slate-500">مصاريف اليوم</p>
            <p className="text-2xl font-extrabold text-orange">{formatCurrency(todayExpenseTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-sm text-slate-500">دخل الشهر</p>
            <p className="text-2xl font-extrabold text-green">{formatCurrency(monthIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-sm text-slate-500">صافي الشهر</p>
            <p className="text-2xl font-extrabold text-blue">{formatCurrency(monthIncome - monthExpenseTotal)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أكثر الخدمات طلبًا هذا الشهر</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>الخدمة</Th>
                <Th>الكمية</Th>
                <Th>الإجمالي</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topServicesList.map(([name, v]) => (
                <Tr key={name}>
                  <Td className="font-semibold">{name}</Td>
                  <Td>{v.quantity}</Td>
                  <Td>{formatCurrency(v.total)}</Td>
                </Tr>
              ))}
              {!topServicesList.length && (
                <Tr>
                  <Td colSpan={3} className="py-6 text-center text-slate-400">
                    لا يوجد بيانات
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>طلبات صيانة مفتوحة ({(openOrders ?? []).length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>رقم الطلب</Th>
                <Th>الحالة</Th>
                <Th>تاريخ الاستلام</Th>
              </Tr>
            </Thead>
            <Tbody>
              {((openOrders as RepairOrder[] | null) ?? []).map((o) => (
                <Tr key={o.id}>
                  <Td className="font-semibold">{o.order_no}</Td>
                  <Td>{orderStatusLabels[o.status]}</Td>
                  <Td>{formatDate(o.received_at)}</Td>
                </Tr>
              ))}
              {!openOrders?.length && (
                <Tr>
                  <Td colSpan={3} className="py-6 text-center text-slate-400">
                    لا يوجد طلبات مفتوحة
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>أرصدة متبقية على العملاء</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>العميل</Th>
                <Th>النوع</Th>
                <Th>الرقم</Th>
                <Th>المتبقي</Th>
              </Tr>
            </Thead>
            <Tbody>
              {outstandingOrders.map((o) => (
                <Tr key={o.id}>
                  <Td className="font-semibold">{customerNameMap.get(o.customer_id) ?? "—"}</Td>
                  <Td>طلب صيانة</Td>
                  <Td>{o.order_no}</Td>
                  <Td className="text-orange font-semibold">{formatCurrency(remaining(o.final_price, o.paid_amount))}</Td>
                </Tr>
              ))}
              {outstandingPrintJobs.map((j) => (
                <Tr key={j.id}>
                  <Td className="font-semibold">{j.customer_id ? customerNameMap.get(j.customer_id) ?? "—" : "—"}</Td>
                  <Td>طباعة</Td>
                  <Td>{j.job_no}</Td>
                  <Td className="text-orange font-semibold">{formatCurrency(remaining(j.total_price, j.paid_amount))}</Td>
                </Tr>
              ))}
              {!outstandingOrders.length && !outstandingPrintJobs.length && (
                <Tr>
                  <Td colSpan={4} className="py-6 text-center text-slate-400">
                    لا يوجد أرصدة متبقية
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
