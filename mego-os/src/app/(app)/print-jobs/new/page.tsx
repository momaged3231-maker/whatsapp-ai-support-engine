import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerPicker } from "@/components/customer-picker";
import { createPrintJob } from "../actions";

const jobTypeLabels: Record<string, string> = {
  print: "طباعة",
  copy: "تصوير",
  scan: "سكان",
  pdf: "تحويل PDF",
  cv: "سيرة ذاتية",
  banner: "بانر",
  signage: "يافطة",
  led: "حروف LED",
  sticker: "ستيكر",
  other: "أخرى",
};

export default function NewPrintJobPage() {
  return (
    <div>
      <PageHeader title="طلب طباعة / بانر جديد" />
      <Card className="max-w-2xl">
        <CardContent>
          <form action={createPrintJob} className="space-y-5">
            <CustomerPicker />

            <div>
              <Label htmlFor="job_type">نوع الخدمة *</Label>
              <Select id="job_type" name="job_type" required defaultValue="print">
                {Object.entries(jobTypeLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="description">الوصف *</Label>
              <Textarea id="description" name="description" required placeholder="مثال: طباعة بانر 2×1 متر" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="quantity">الكمية</Label>
                <Input id="quantity" name="quantity" type="number" step="0.01" defaultValue={1} />
              </div>
              <div>
                <Label htmlFor="unit_price">سعر الوحدة</Label>
                <Input id="unit_price" name="unit_price" type="number" step="0.01" defaultValue={0} />
              </div>
              <div>
                <Label htmlFor="paid_amount">المدفوع مقدمًا</Label>
                <Input id="paid_amount" name="paid_amount" type="number" step="0.01" defaultValue={0} />
              </div>
            </div>

            <div>
              <Label htmlFor="due_at">موعد التسليم</Label>
              <Input id="due_at" name="due_at" type="datetime-local" />
            </div>

            <Button type="submit">حفظ الطلب</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
