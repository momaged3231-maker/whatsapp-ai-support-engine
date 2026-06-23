import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { FilterSelect } from "@/components/filter-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/delete-button";
import { expenseCategoryLabels, paymentMethodLabels } from "@/lib/status";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createExpense, deleteExpense } from "./actions";
import type { Expense } from "@/lib/database.types";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; month?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("expenses").select("*").order("expense_date", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data: expenses } = await query.limit(300);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const { data: monthExpenses } = await supabase.from("expenses").select("amount").gte("expense_date", monthStart);
  const monthTotal = (monthExpenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0);

  const admin = await isAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="المصاريف" description="تسجيل ومتابعة مصاريف المحل" />

      <Card className="max-w-xs">
        <CardContent className="text-center">
          <p className="text-sm text-slate-500">إجمالي مصاريف الشهر الحالي</p>
          <p className="text-2xl font-extrabold text-orange">{formatCurrency(monthTotal)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مصروف جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createExpense} className="grid gap-3 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <Label htmlFor="title">العنوان *</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="category">التصنيف</Label>
              <Select id="category" name="category" defaultValue="other">
                {Object.entries(expenseCategoryLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">القيمة *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="expense_date">التاريخ</Label>
              <Input id="expense_date" name="expense_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <Label htmlFor="payment_method">طريقة الدفع</Label>
              <Select id="payment_method" name="payment_method" defaultValue="cash">
                {Object.entries(paymentMethodLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea id="notes" name="notes" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                حفظ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <FilterSelect
        param="category"
        options={Object.entries(expenseCategoryLabels).map(([value, label]) => ({ value, label }))}
      />

      <Table>
        <Thead>
          <Tr>
            <Th>العنوان</Th>
            <Th>التصنيف</Th>
            <Th>القيمة</Th>
            <Th>طريقة الدفع</Th>
            <Th>التاريخ</Th>
            {admin && <Th></Th>}
          </Tr>
        </Thead>
        <Tbody>
          {(expenses as Expense[] | null)?.map((e) => (
            <Tr key={e.id}>
              <Td className="font-semibold">{e.title}</Td>
              <Td>
                <Badge tone="orange">{expenseCategoryLabels[e.category]}</Badge>
              </Td>
              <Td>{formatCurrency(e.amount)}</Td>
              <Td>{paymentMethodLabels[e.payment_method]}</Td>
              <Td>{formatDate(e.expense_date)}</Td>
              {admin && (
                <Td>
                  <DeleteButton action={async () => deleteExpense(e.id)} confirmText="حذف هذا المصروف؟" />
                </Td>
              )}
            </Tr>
          ))}
          {!expenses?.length && (
            <Tr>
              <Td colSpan={6} className="py-8 text-center text-slate-400">
                لا يوجد مصاريف
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}
