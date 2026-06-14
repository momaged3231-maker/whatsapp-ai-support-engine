'use client';
import { useState } from 'react';
import { apiPost, getBusinessId, useAsync, Toast } from '@/components/store';

async function fetchReport(type) {
  const id = getBusinessId();
  const res = await fetch(`/api/report-generate?business_id=${id}&type=${type}`, { cache: 'no-store' });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error);
  return j.data;
}

export default function ReportsPage() {
  const [type, setType] = useState('daily');
  const { data, reload, loading } = useAsync(() => fetchReport(type), [type]);
  const [toast, setToast] = useState('');

  return (
    <div>
      <div className="topbar">
        <h1>التقارير</h1>
        <div className="row">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="daily">يومي</option><option value="weekly">أسبوعي</option>
          </select>
          <button className="btn secondary" onClick={() => { reload(); setToast('تم التحديث'); }}>تحديث</button>
        </div>
      </div>

      {loading && <div className="card muted">جارٍ الحساب…</div>}

      {data && (
        <>
          <div className="grid three">
            <Kpi label="الرسائل" v={data.messages} />
            <Kpi label="عملاء جدد" v={data.new_customers} />
            <Kpi label="تذاكر مفتوحة" v={data.open_tickets} />
            <Kpi label="تذاكر تم حلها" v={data.solved_tickets} />
            <Kpi label="تحويلات للبشري" v={data.handoffs} />
          </div>

          <div className="grid two" style={{ marginTop: 4 }}>
            <div className="card">
              <h3>أكثر النوايا (Intents)</h3>
              <RankList rows={data.top_intents} keyName="intent" />
            </div>
            <div className="card">
              <h3>أكثر أنواع التذاكر</h3>
              <RankList rows={data.top_ticket_types} keyName="ticket_type" />
            </div>
          </div>
          <p className="small">آخر توليد: {new Date(data.generated_at).toLocaleString('ar-EG')} — يُحفظ كل تقرير في جدول reports.</p>
        </>
      )}
      <Toast msg={toast} onDone={() => setToast('')} />
    </div>
  );
}

function Kpi({ label, v }) {
  return <div className="card kpi"><span className="muted small">{label}</span><span className="v">{v ?? 0}</span></div>;
}
function RankList({ rows, keyName }) {
  if (!rows || rows.length === 0) return <p className="muted small">لا بيانات بعد.</p>;
  const max = Math.max(...rows.map((r) => Number(r.n)));
  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span>{r[keyName] || 'غير محدد'}</span><span className="muted">{r.n}</span>
          </div>
          <div style={{ height: 6, background: 'var(--panel-2)', borderRadius: 6 }}>
            <div style={{ width: `${(Number(r.n) / max) * 100}%`, height: 6, background: 'var(--brand)', borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
