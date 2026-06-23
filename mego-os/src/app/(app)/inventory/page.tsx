import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { SearchBox } from "@/components/search-box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InventoryRow } from "@/components/inventory-row";
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "./actions";
import type { InventoryItem } from "@/lib/database.types";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("inventory_items").select("*").order("created_at", { ascending: false });
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
  const { data: items } = await query.limit(300);
  const admin = await isAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="المخزون" description="إدارة المنتجات والإكسسوارات والمخزون" />

      <Card>
        <CardHeader>
          <CardTitle>إضافة منتج جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createInventoryItem} className="grid gap-3 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <Label htmlFor="name">اسم المنتج *</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="category">التصنيف</Label>
              <Input id="category" name="category" />
            </div>
            <div>
              <Label htmlFor="quantity">الكمية</Label>
              <Input id="quantity" name="quantity" type="number" defaultValue={0} />
            </div>
            <div>
              <Label htmlFor="purchase_price">سعر الشراء</Label>
              <Input id="purchase_price" name="purchase_price" type="number" step="0.01" />
            </div>
            <div>
              <Label htmlFor="selling_price">سعر البيع</Label>
              <Input id="selling_price" name="selling_price" type="number" step="0.01" />
            </div>
            <div>
              <Label htmlFor="min_quantity">حد أدنى للتنبيه</Label>
              <Input id="min_quantity" name="min_quantity" type="number" defaultValue={1} />
            </div>
            <div>
              <Label htmlFor="supplier_name">المورد</Label>
              <Input id="supplier_name" name="supplier_name" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                إضافة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <SearchBox placeholder="بحث بالاسم أو الكود..." />

      <Table>
        <Thead>
          <Tr>
            <Th>المنتج</Th>
            <Th>التصنيف</Th>
            <Th>الكمية</Th>
            <Th>سعر البيع</Th>
            <Th>المورد</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {(items as InventoryItem[] | null)?.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              isAdmin={admin}
              updateAction={updateInventoryItem.bind(null, item.id)}
              deleteAction={deleteInventoryItem.bind(null, item.id)}
            />
          ))}
          {!items?.length && (
            <Tr>
              <Td colSpan={6} className="py-8 text-center text-slate-400">
                لا يوجد منتجات
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}
