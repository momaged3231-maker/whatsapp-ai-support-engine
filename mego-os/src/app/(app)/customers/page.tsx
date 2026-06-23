import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { SearchBox } from "@/components/search-box";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customerTypeLabels } from "@/lib/status";
import { Plus } from "lucide-react";
import type { Customer } from "@/lib/database.types";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  }
  const { data: customers } = await query.limit(200);

  return (
    <div>
      <PageHeader
        title="العملاء"
        description="إدارة بيانات العملاء وسجل تعاملاتهم"
        action={
          <Link href="/customers/new">
            <Button>
              <Plus size={16} /> عميل جديد
            </Button>
          </Link>
        }
      />
      <div className="mb-4">
        <SearchBox placeholder="بحث بالاسم أو رقم الهاتف..." />
      </div>
      <Table>
        <Thead>
          <Tr>
            <Th>الاسم</Th>
            <Th>الهاتف</Th>
            <Th>النوع</Th>
            <Th>المنطقة</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {(customers as Customer[] | null)?.map((c) => (
            <Tr key={c.id}>
              <Td className="font-semibold">{c.name}</Td>
              <Td dir="ltr" className="text-right">
                {c.phone}
              </Td>
              <Td>
                <Badge tone="blue">{customerTypeLabels[c.customer_type]}</Badge>
              </Td>
              <Td>{c.area ?? "—"}</Td>
              <Td>
                <Link href={`/customers/${c.id}`} className="text-blue font-semibold">
                  عرض
                </Link>
              </Td>
            </Tr>
          ))}
          {!customers?.length && (
            <Tr>
              <Td colSpan={5} className="py-8 text-center text-slate-400">
                لا يوجد عملاء
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}
