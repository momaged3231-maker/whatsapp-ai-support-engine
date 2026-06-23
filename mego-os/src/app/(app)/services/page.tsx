import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th } from "@/components/ui/table";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceRow } from "@/components/service-row";
import { serviceCategoryLabels } from "@/lib/status";
import { createService, updateService, toggleServiceActive, deleteService } from "./actions";
import type { Service } from "@/lib/database.types";

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from("services").select("*").order("created_at");
  const admin = await isAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="الخدمات" description="إدارة قائمة الخدمات والأسعار" />

      <Card>
        <CardHeader>
          <CardTitle>إضافة خدمة جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createService} className="grid gap-3 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <Label htmlFor="name">اسم الخدمة *</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="category">التصنيف</Label>
              <Select id="category" name="category" defaultValue="other">
                {Object.entries(serviceCategoryLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="starting_price">السعر</Label>
              <Input id="starting_price" name="starting_price" type="number" step="0.01" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                إضافة
              </Button>
            </div>
            <div className="sm:col-span-5">
              <Label htmlFor="description">الوصف</Label>
              <Textarea id="description" name="description" />
            </div>
          </form>
        </CardContent>
      </Card>

      <Table>
        <Thead>
          <Tr>
            <Th>الاسم</Th>
            <Th>التصنيف</Th>
            <Th>السعر</Th>
            <Th>الحالة</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {(services as Service[] | null)?.map((s) => (
            <ServiceRow
              key={s.id}
              service={s}
              isAdmin={admin}
              updateAction={updateService.bind(null, s.id)}
              toggleAction={toggleServiceActive}
              deleteAction={deleteService.bind(null, s.id)}
            />
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
