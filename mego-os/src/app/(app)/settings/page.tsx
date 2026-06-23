import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateSettings } from "./actions";
import type { ShopSettings } from "@/lib/database.types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
  const settings = data as ShopSettings | null;
  const admin = await isAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="الإعدادات" description="بيانات المحل المستخدمة في الإيصالات والرسائل" />

      <Card>
        <CardHeader>
          <CardTitle>بيانات المحل</CardTitle>
        </CardHeader>
        <CardContent>
          {settings ? (
            <form action={updateSettings} className="space-y-4">
              <input type="hidden" name="id" value={settings.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="shop_name">اسم المحل *</Label>
                  <Input id="shop_name" name="shop_name" defaultValue={settings.shop_name} required disabled={!admin} />
                </div>
                <div>
                  <Label htmlFor="slogan">الشعار</Label>
                  <Input id="slogan" name="slogan" defaultValue={settings.slogan ?? ""} disabled={!admin} />
                </div>
                <div>
                  <Label htmlFor="phone">رقم التليفون</Label>
                  <Input id="phone" name="phone" dir="ltr" defaultValue={settings.phone ?? ""} disabled={!admin} />
                </div>
                <div>
                  <Label htmlFor="whatsapp">رقم الواتساب</Label>
                  <Input id="whatsapp" name="whatsapp" dir="ltr" defaultValue={settings.whatsapp ?? ""} disabled={!admin} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input id="address" name="address" defaultValue={settings.address ?? ""} disabled={!admin} />
              </div>
              <div>
                <Label htmlFor="receipt_footer">نص أسفل الإيصال</Label>
                <Textarea id="receipt_footer" name="receipt_footer" defaultValue={settings.receipt_footer ?? ""} disabled={!admin} />
              </div>
              {admin ? (
                <Button type="submit">حفظ التعديلات</Button>
              ) : (
                <p className="text-sm text-slate-400">الإعدادات متاحة للمدير فقط.</p>
              )}
            </form>
          ) : (
            <p className="text-sm text-slate-400">لا توجد بيانات إعدادات. يرجى إضافة بيانات المحل في قاعدة البيانات.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
