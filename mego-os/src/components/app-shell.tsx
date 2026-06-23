"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AppShell({
  children,
  fullName,
}: {
  children: React.ReactNode;
  fullName: string | null;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col bg-navy p-4 lg:flex">
        <Link href="/dashboard" className="mb-6 block px-2">
          <div className="text-xl font-extrabold text-white">Mego OS</div>
          <div className="text-xs text-slate-300">ميجو · خدمتك في مكان واحد</div>
        </Link>
        <Sidebar className="flex-1" />
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="px-2 text-sm text-slate-300">{fullName ?? "مستخدم"}</div>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-72 flex-col bg-navy p-4 flex">
            <div className="mb-6 flex items-center justify-between px-2">
              <div>
                <div className="text-xl font-extrabold text-white">Mego OS</div>
                <div className="text-xs text-slate-300">ميجو</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white">
                <X size={22} />
              </button>
            </div>
            <Sidebar className="flex-1" />
            <button
              onClick={logout}
              className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="no-print flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="text-navy">
            <Menu size={22} />
          </button>
          <div className="font-extrabold text-navy">Mego OS</div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
