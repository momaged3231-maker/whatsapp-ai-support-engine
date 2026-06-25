import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import AdminLoginForm from "@/components/admin/login-form";
import RequestsDashboard from "@/components/admin/requests-dashboard";
import type { ServiceRequestRow } from "@/lib/types";

export const metadata: Metadata = {
  title: "إدارة طلبات الخدمة",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <AdminLoginForm />;
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-white">
          Supabase غير مفعل
        </h1>
        <p className="mt-3 text-white/70">
          أضف SUPABASE_SERVICE_ROLE_KEY و NEXT_PUBLIC_SUPABASE_URL في متغيرات
          البيئة لعرض طلبات الخدمة هنا.
        </p>
      </div>
    );
  }

  const { data } = await supabaseAdmin
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <RequestsDashboard initialRequests={(data as ServiceRequestRow[]) || []} />
  );
}
