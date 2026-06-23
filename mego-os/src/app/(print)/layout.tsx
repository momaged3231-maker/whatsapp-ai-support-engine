import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintBar } from "@/components/print-bar";

export default async function PrintLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl bg-white p-6 print:p-0">
      <PrintBar />
      {children}
    </div>
  );
}
