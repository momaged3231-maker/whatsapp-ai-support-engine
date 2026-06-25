"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, LogOut, Search } from "lucide-react";
import { REQUEST_STATUSES } from "@/lib/constants";
import type { RequestStatus, ServiceRequestRow } from "@/lib/types";

const STATUS_COLORS: Record<RequestStatus, string> = {
  new: "bg-mego-blue/20 text-mego-blue",
  contacted: "bg-mego-cyan/20 text-mego-cyan",
  booked: "bg-mego-yellow/20 text-mego-yellow",
  done: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

function buildReplyMessage(row: ServiceRequestRow) {
  return [
    `أهلاً ${row.customer_name}، معاك ميجو.`,
    `بخصوص طلب "${row.service_type}"،`,
    `هنحدد معاد ونقولك السعر قبل التنفيذ.`,
  ].join("\n");
}

export default function RequestsDashboard({
  initialRequests,
}: {
  initialRequests: ServiceRequestRow[];
}) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ServiceRequestRow | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const term = search.trim().toLowerCase();
      return (
        r.customer_name.toLowerCase().includes(term) ||
        r.phone.toLowerCase().includes(term)
      );
    });
  }, [requests, search, statusFilter]);

  async function updateStatus(id: string, status: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: status as RequestStatus } : r))
    );
    await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function handleCopy(row: ServiceRequestRow) {
    await navigator.clipboard.writeText(buildReplyMessage(row));
    setCopiedId(row.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-white">طلبات الخدمة</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white hover:border-mego-cyan"
        >
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو رقم الهاتف"
            className="input pr-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input sm:w-56"
        >
          <option value="all">كل الحالات</option>
          {REQUEST_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[800px] text-right text-sm">
          <thead className="bg-mego-navy-light text-white/70">
            <tr>
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">الهاتف</th>
              <th className="px-4 py-3">الخدمة</th>
              <th className="px-4 py-3">المكان</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">التاريخ</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((row) => (
              <tr key={row.id} className="text-white/90">
                <td className="px-4 py-3 font-bold">{row.customer_name}</td>
                <td className="px-4 py-3">{row.phone}</td>
                <td className="px-4 py-3">{row.service_type}</td>
                <td className="px-4 py-3">{row.service_place}</td>
                <td className="px-4 py-3">
                  <select
                    value={row.status}
                    onChange={(e) => updateStatus(row.id, e.target.value)}
                    className={`rounded-full border-0 px-3 py-1 text-xs font-bold ${STATUS_COLORS[row.status]}`}
                  >
                    {REQUEST_STATUSES.map((s) => (
                      <option key={s.value} value={s.value} className="text-black">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-white/60">
                  {new Date(row.created_at).toLocaleDateString("ar-EG")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelected(row)}
                      className="text-xs font-bold text-mego-cyan hover:underline"
                    >
                      تفاصيل
                    </button>
                    <button
                      onClick={() => handleCopy(row)}
                      className="flex items-center gap-1 text-xs font-bold text-white/70 hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedId === row.id ? "تم النسخ" : "نسخ الرد"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/50">
                  لا يوجد طلبات مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-mego-navy-light p-6"
          >
            <h2 className="text-xl font-extrabold text-white">
              {selected.customer_name}
            </h2>
            <dl className="mt-4 space-y-2 text-sm text-white/80">
              <Row label="الهاتف" value={selected.phone} />
              <Row label="نوع العميل" value={selected.customer_type} />
              <Row label="نوع الخدمة" value={selected.service_type} />
              <Row label="مكان الخدمة" value={selected.service_place} />
              <Row label="العنوان" value={selected.area} />
              <Row label="المشكلة" value={selected.description} />
              <Row label="الوقت المناسب" value={selected.preferred_time || "-"} />
            </dl>
            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-full bg-mego-blue py-2 text-sm font-bold text-white"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-bold text-white">{label}:</dt>
      <dd className="text-white/70">{value}</dd>
    </div>
  );
}
