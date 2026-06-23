import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { SearchBox } from "@/components/search-box";
import { FilterSelect } from "@/components/filter-select";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { orderStatusLabels, orderStatusTones, deviceTypeLabels } from "@/lib/status";
import { formatCurrency, formatDate, remaining } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { RepairOrder } from "@/lib/database.types";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("repair_orders")
    .select("*, customers(name, phone)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (q) query = query.or(`order_no.ilike.%${q}%`);

  const { data: orders } = await query.limit(300);

  type Row = RepairOrder & { customers: { name: string; phone: string } | null };

  return (
    <div>
      <PageHeader
        title="طلبات الصيانة"
        description="إدارة طلبات الصيانة وتتبع حالتها"
        action={
          <Link href="/orders/new">
            <Button>
              <Plus size={16} /> طلب صيانة جديد
            </Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchBox placeholder="بحث برقم الطلب..." />
        <FilterSelect
          param="status"
          options={Object.entries(orderStatusLabels).map(([value, label]) => ({ value, label }))}
        />
      </div>
      <Table>
        <Thead>
          <Tr>
            <Th>رقم الطلب</Th>
            <Th>العميل</Th>
            <Th>الجهاز</Th>
            <Th>الحالة</Th>
            <Th>المتبقي</Th>
            <Th>التاريخ</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {(orders as Row[] | null)?.map((o) => (
            <Tr key={o.id}>
              <Td className="font-semibold">{o.order_no}</Td>
              <Td>{o.customers?.name ?? "—"}</Td>
              <Td>{deviceTypeLabels[o.device_type]}</Td>
              <Td>
                <Badge tone={orderStatusTones[o.status]}>{orderStatusLabels[o.status]}</Badge>
              </Td>
              <Td>{formatCurrency(remaining(o.final_price, o.paid_amount))}</Td>
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
              <Td colSpan={7} className="py-8 text-center text-slate-400">
                لا يوجد طلبات
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}
