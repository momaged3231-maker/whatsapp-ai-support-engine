import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerPicker } from "@/components/customer-picker";
import { deviceTypeLabels, orderPriorityLabels } from "@/lib/status";
import { createOrder } from "../actions";

export default function NewOrderPage() {
  return (
    <div>
      <PageHeader title="طلب صيانة جديد" />
      <Card className="max-w-3xl">
        <CardContent>
          <form action={createOrder} className="space-y-5">
            <CustomerPicker />

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="device_type">نوع الجهاز *</Label>
                <Select id="device_type" name="device_type" required defaultValue="laptop">
                  {Object.entries(deviceTypeLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="device_brand">الماركة</Label>
                <Input id="device_brand" name="device_brand" />
              </div>
              <div>
                <Label htmlFor="device_model">الموديل</Label>
                <Input id="device_model" name="device_model" />
              </div>
            </div>

            <div>
              <Label htmlFor="problem_description">وصف العطل *</Label>
              <Textarea id="problem_description" name="problem_description" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="received_accessories">الملحقات المستلمة</Label>
                <Input id="received_accessories" name="received_accessories" placeholder="شاحن، شنطة، ..." />
              </div>
              <div>
                <Label htmlFor="device_condition">حالة الجهاز عند الاستلام</Label>
                <Input id="device_condition" name="device_condition" placeholder="خدوش، كسر في الشاشة، ..." />
              </div>
            </div>

            <div>
              <Label htmlFor="data_privacy_note">ملاحظة خصوصية البيانات</Label>
              <Textarea
                id="data_privacy_note"
                name="data_privacy_note"
                placeholder="مثال: العميل تم تنبيهه بعمل نسخة احتياطية من بياناته قبل الصيانة"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="estimated_price">السعر التقديري</Label>
                <Input id="estimated_price" name="estimated_price" type="number" step="0.01" min="0" />
              </div>
              <div>
                <Label htmlFor="priority">الأولوية</Label>
                <Select id="priority" name="priority" defaultValue="normal">
                  {Object.entries(orderPriorityLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="customer_notes">ملاحظات العميل</Label>
              <Textarea id="customer_notes" name="customer_notes" />
            </div>

            <Button type="submit">حفظ الطلب</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
