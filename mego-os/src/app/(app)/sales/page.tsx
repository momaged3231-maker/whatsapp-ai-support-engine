import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { SearchBox } from "@/components/search-box";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { paymentMethodLabels } from "@/lib/status";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Sale } from "@/lib/database.types";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("sales")
    .select("*, customers(name)")
    .order("created_at", { ascending: false });
  if (q) query = query.ilike("sale_no", `%${q}%`);

  const { data: sales } = await query.limit(300);
  type Row = Sale & { customers: { name: string } | null };

  return (
    <div>
      <PageHeader
        title="المبيعات"
        description="فواتير البيع والمنتجات والخدمات"
        action={
          <Link href="/sales/new">
            <Button>
              <Plus size={16} /> فاتورة بيع
            </Button>
          </Link>
        }
      />
      <div className="mb-4">
        <SearchBox placeholder="بحث برقم الفاتورة..." />
      </div>
      <Table>
        <Thead>
          <Tr>
            <Th>رقم الفاتورة</Th>
            <Th>العميل</Th>
            <Th>الإجمالي</Th>
            <Th>طريقة الدفع</Th>
            <Th>التاريخ</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {(sales as Row[] | null)?.map((s) => (
            <Tr key={s.id}>
              <Td className="font-semibold">{s.sale_no}</Td>
              <Td>{s.customers?.name ?? "عميل نقدي"}</Td>
              <Td>{formatCurrency(s.total_amount)}</Td>
              <Td>
                <Badge tone="blue">{paymentMethodLabels[s.payment_method]}</Badge>
              </Td>
              <Td>{formatDateTime(s.created_at)}</Td>
              <Td>
                <Link href={`/sales/${s.id}/invoice`} className="text-blue font-semibold">
                  الفاتورة
                </Link>
              </Td>
            </Tr>
          ))}
          {!sales?.length && (
            <Tr>
              <Td colSpan={6} className="py-8 text-center text-slate-400">
                لا يوجد مبيعات
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}
