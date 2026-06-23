import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { SearchBox } from "@/components/search-box";
import { FilterSelect } from "@/components/filter-select";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { printJobStatusLabels, printJobStatusTones } from "@/lib/status";
import { formatCurrency, remaining } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { PrintJob } from "@/lib/database.types";

export default async function PrintJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("print_jobs")
    .select("*, customers(name)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (q) query = query.or(`job_no.ilike.%${q}%,description.ilike.%${q}%`);

  const { data: jobs } = await query.limit(300);
  type Row = PrintJob & { customers: { name: string } | null };

  return (
    <div>
      <PageHeader
        title="الطباعة والبانرات"
        description="طباعة، تصوير، بانرات، يافطات، CV وغيرها"
        action={
          <Link href="/print-jobs/new">
            <Button>
              <Plus size={16} /> طلب طباعة جديد
            </Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchBox placeholder="بحث برقم الطلب أو الوصف..." />
        <FilterSelect
          param="status"
          options={Object.entries(printJobStatusLabels).map(([value, label]) => ({ value, label }))}
        />
      </div>
      <Table>
        <Thead>
          <Tr>
            <Th>رقم الطلب</Th>
            <Th>العميل</Th>
            <Th>الوصف</Th>
            <Th>الإجمالي</Th>
            <Th>المتبقي</Th>
            <Th>الحالة</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {(jobs as Row[] | null)?.map((j) => (
            <Tr key={j.id}>
              <Td className="font-semibold">{j.job_no}</Td>
              <Td>{j.customers?.name ?? "—"}</Td>
              <Td>{j.description}</Td>
              <Td>{formatCurrency(j.total_price)}</Td>
              <Td>{formatCurrency(remaining(j.total_price, j.paid_amount))}</Td>
              <Td>
                <Badge tone={printJobStatusTones[j.status]}>{printJobStatusLabels[j.status]}</Badge>
              </Td>
              <Td>
                <Link href={`/print-jobs/${j.id}`} className="text-blue font-semibold">
                  عرض
                </Link>
              </Td>
            </Tr>
          ))}
          {!jobs?.length && (
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
