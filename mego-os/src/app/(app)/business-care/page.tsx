import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerPicker } from "@/components/customer-picker";
import { SubscriptionRow } from "@/components/subscription-row";
import {
  createSubscription,
  updateSubscriptionStatus,
  incrementUsedVisit,
  renewSubscription,
  deleteSubscription,
} from "./actions";
import type { BusinessSubscription, Customer } from "@/lib/database.types";

export default async function BusinessCarePage() {
  const supabase = await createClient();
  const { data: subs } = await supabase
    .from("business_subscriptions")
    .select("*")
    .order("renewal_date", { ascending: true });

  const customerIds = [...new Set((subs ?? []).map((s) => s.customer_id))];
  const { data: customers } = customerIds.length
    ? await supabase.from("customers").select("id, phone").in("id", customerIds)
    : { data: [] as Pick<Customer, "id" | "phone">[] };
  const phoneMap = new Map((customers ?? []).map((c) => [c.id, c.phone]));

  const admin = await isAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="اشتراكات المحلات" description="إدارة اشتراكات الدعم التقني الشهري للمحلات" />

      <Card>
        <CardHeader>
          <CardTitle>اشتراك جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSubscription} className="space-y-4">
            <CustomerPicker />
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="business_name">اسم المحل/الشركة *</Label>
                <Input id="business_name" name="business_name" required />
              </div>
              <div>
                <Label htmlFor="package_name">الباقة</Label>
                <Select id="package_name" name="package_name" defaultValue="Start">
                  <option value="Start">Start</option>
                  <option value="Business">Business</option>
                  <option value="Pro">Pro</option>
                  <option value="Custom">Custom</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="monthly_price">السعر الشهري</Label>
                <Input id="monthly_price" name="monthly_price" type="number" step="0.01" />
              </div>
              <div>
                <Label htmlFor="start_date">تاريخ البدء</Label>
                <Input id="start_date" name="start_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
              <div>
                <Label htmlFor="renewal_date">تاريخ التجديد *</Label>
                <Input id="renewal_date" name="renewal_date" type="date" required />
              </div>
              <div>
                <Label htmlFor="included_visits">عدد الزيارات الشاملة</Label>
                <Input id="included_visits" name="included_visits" type="number" defaultValue={1} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="included_remote_support" />
              يشمل الدعم عن بُعد
            </label>
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea id="notes" name="notes" />
            </div>
            <Button type="submit">حفظ الاشتراك</Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <Thead>
          <Tr>
            <Th>المحل</Th>
            <Th>الباقة</Th>
            <Th>السعر</Th>
            <Th>التجديد</Th>
            <Th>الزيارات</Th>
            <Th>الحالة</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {(subs as BusinessSubscription[] | null)?.map((s) => (
            <SubscriptionRow
              key={s.id}
              sub={s}
              customerPhone={phoneMap.get(s.customer_id) ?? ""}
              isAdmin={admin}
              statusAction={updateSubscriptionStatus}
              visitsAction={incrementUsedVisit}
              renewAction={renewSubscription}
              deleteAction={deleteSubscription.bind(null, s.id)}
            />
          ))}
          {!subs?.length && (
            <Tr>
              <Td colSpan={7} className="py-8 text-center text-slate-400">
                لا يوجد اشتراكات
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}
