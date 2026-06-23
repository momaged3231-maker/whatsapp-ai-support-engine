import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/customer-form";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/delete-button";
import { orderStatusLabels, orderStatusTones, followupStatusLabels, followupStatusTones } from "@/lib/status";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateCustomer, deleteCustomer } from "../actions";
import type { RepairOrder, Sale, Followup } from "@/lib/database.types";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (!customer) notFound();

  const [{ data: orders }, { data: sales }, { data: followups }] = await Promise.all([
    supabase
      .from("repair_orders")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("sales").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase
      .from("followups")
      .select("*")
      .eq("customer_id", id)
      .order("followup_date", { ascending: false }),
  ]);

  const admin = await isAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={customer.phone}
        action={
          admin ? (
            <DeleteButton action={async () => deleteCustomer(id)} confirmText="حذف العميل وكل بياناته المرتبطة؟" />
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>بيانات العميل</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm customer={customer} action={updateCustomer.bind(null, id)} />
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>طلبات الصيانة ({orders?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <Thead>
                  <Tr>
                    <Th>رقم الطلب</Th>
                    <Th>الحالة</Th>
                    <Th>التاريخ</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(orders as RepairOrder[] | null)?.map((o) => (
                    <Tr key={o.id}>
                      <Td className="font-semibold">{o.order_no}</Td>
                      <Td>
                        <Badge tone={orderStatusTones[o.status]}>{orderStatusLabels[o.status]}</Badge>
                      </Td>
                      <Td>{formatDate(o.created_at)}</Td>
                      <Td>
                        <Link href={`/orders/${o.id}`} className="text-blue font-semibold">
                          عرض
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                  {!orders?.length && (
                    <Tr>
                      <Td colSpan={4} className="py-6 text-center text-slate-400">
                        لا يوجد طلبات
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المبيعات ({sales?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <Thead>
                  <Tr>
                    <Th>رقم الفاتورة</Th>
                    <Th>الإجمالي</Th>
                    <Th>التاريخ</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(sales as Sale[] | null)?.map((s) => (
                    <Tr key={s.id}>
                      <Td className="font-semibold">{s.sale_no}</Td>
                      <Td>{formatCurrency(s.total_amount)}</Td>
                      <Td>{formatDate(s.created_at)}</Td>
                      <Td>
                        <Link href={`/sales/${s.id}/invoice`} className="text-blue font-semibold">
                          الفاتورة
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                  {!sales?.length && (
                    <Tr>
                      <Td colSpan={4} className="py-6 text-center text-slate-400">
                        لا يوجد مبيعات
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المتابعات ({followups?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <Thead>
                  <Tr>
                    <Th>العنوان</Th>
                    <Th>التاريخ</Th>
                    <Th>الحالة</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(followups as Followup[] | null)?.map((f) => (
                    <Tr key={f.id}>
                      <Td>{f.title}</Td>
                      <Td>{formatDate(f.followup_date)}</Td>
                      <Td>
                        <Badge tone={followupStatusTones[f.status]}>{followupStatusLabels[f.status]}</Badge>
                      </Td>
                    </Tr>
                  ))}
                  {!followups?.length && (
                    <Tr>
                      <Td colSpan={3} className="py-6 text-center text-slate-400">
                        لا يوجد متابعات
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
