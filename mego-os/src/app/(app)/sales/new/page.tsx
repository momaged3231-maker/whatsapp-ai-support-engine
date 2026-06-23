import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerPicker } from "@/components/customer-picker";
import { SaleItemsEditor } from "@/components/sale-items-editor";
import { paymentMethodLabels } from "@/lib/status";
import { createSale } from "../actions";

export default async function NewSalePage() {
  const supabase = await createClient();
  const [{ data: services }, { data: products }] = await Promise.all([
    supabase.from("services").select("id, name, starting_price").eq("is_active", true),
    supabase.from("inventory_items").select("id, name, selling_price"),
  ]);

  const serviceOptions = (services ?? []).map((s) => ({ id: s.id, name: s.name, price: s.starting_price ?? 0 }));
  const productOptions = (products ?? []).map((p) => ({ id: p.id, name: p.name, price: p.selling_price ?? 0 }));

  return (
    <div>
      <PageHeader title="فاتورة بيع جديدة" />
      <Card className="max-w-4xl">
        <CardContent>
          <form action={createSale} className="space-y-5">
            <CustomerPicker />

            <div>
              <Label>البنود</Label>
              <SaleItemsEditor services={serviceOptions} products={productOptions} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="paid_amount">المدفوع</Label>
                <Input id="paid_amount" name="paid_amount" type="number" step="0.01" placeholder="الإجمالي بالكامل افتراضيًا" />
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
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea id="notes" name="notes" />
            </div>

            <Button type="submit">حفظ الفاتورة</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
