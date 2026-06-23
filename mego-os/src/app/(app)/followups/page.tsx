import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { FilterSelect } from "@/components/filter-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerPicker } from "@/components/customer-picker";
import { FollowupRow } from "@/components/followup-row";
import { followupStatusLabels } from "@/lib/status";
import { createFollowup, updateFollowupStatus, deleteFollowup } from "./actions";
import type { Followup, Customer, RepairOrder } from "@/lib/database.types";

export default async function FollowupsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("followups").select("*").order("followup_date", { ascending: true });
  if (status) query = query.eq("status", status);
  const { data: followups } = await query;

  const customerIds = [...new Set((followups ?? []).map((f) => f.customer_id))];
  const { data: customers } = customerIds.length
    ? await supabase.from("customers").select("id, name, phone").in("id", customerIds)
    : { data: [] as Pick<Customer, "id" | "name" | "phone">[] };
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c]));

  const orderIds = [...new Set((followups ?? []).map((f) => f.order_id).filter(Boolean))] as string[];
  const { data: orders } = orderIds.length
    ? await supabase.from("repair_orders").select("id, order_no").in("id", orderIds)
    : { data: [] as Pick<RepairOrder, "id" | "order_no">[] };
  const orderMap = new Map((orders ?? []).map((o) => [o.id, o.order_no]));

  const admin = await isAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="المتابعات" description="متابعة العملاء وتذكيرهم بالمواعيد والتجديدات" />

      <Card>
        <CardHeader>
          <CardTitle>متابعة جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createFollowup} className="space-y-4">
            <CustomerPicker />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="title">عنوان المتابعة *</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="followup_date">تاريخ المتابعة *</Label>
                <Input id="followup_date" name="followup_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea id="notes" name="notes" />
            </div>
            <Button type="submit">حفظ المتابعة</Button>
          </form>
        </CardContent>
      </Card>

      <FilterSelect
        param="status"
        options={Object.entries(followupStatusLabels).map(([value, label]) => ({ value, label }))}
      />

      <Table>
        <Thead>
          <Tr>
            <Th>العميل</Th>
            <Th>الهاتف</Th>
            <Th>العنوان</Th>
            <Th>الطلب</Th>
            <Th>تاريخ المتابعة</Th>
            <Th>الحالة</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {(followups as Followup[] | null)?.map((f) => {
            const customer = customerMap.get(f.customer_id);
            return (
              <FollowupRow
                key={f.id}
                followup={f}
                customerName={customer?.name ?? ""}
                customerPhone={customer?.phone ?? ""}
                orderNo={f.order_id ? orderMap.get(f.order_id) ?? null : null}
                isAdmin={admin}
                statusAction={updateFollowupStatus}
                deleteAction={deleteFollowup.bind(null, f.id)}
              />
            );
          })}
          {!followups?.length && (
            <Tr>
              <Td colSpan={7} className="py-8 text-center text-slate-400">
                لا يوجد متابعات
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}
