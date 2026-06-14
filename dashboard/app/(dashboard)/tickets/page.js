'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPatch, apiPost, useAsync, Toast } from '@/components/store';

const STATUSES = ['open', 'in_review', 'contacted', 'in_progress', 'solved', 'cancelled'];
const STATUS_AR = { open: 'مفتوح', in_review: 'تحت المراجعة', contacted: 'تم التواصل', in_progress: 'تحت التنفيذ', solved: 'تم الحل', cancelled: 'ملغي' };

export default function TicketsPage() {
  const { data: list, reload } = useAsync(() => apiGet('/api/tickets'), []);
  const [rules, setRules] = useState('');
  const [settingsId, setSettingsId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    apiGet('/api/business_settings').then((rows) => {
      const s = rows[0];
      if (s) { setSettingsId(s.id); setRules(JSON.stringify(s.ticket_rules || {}, null, 2)); }
    }).catch(() => {});
  }, []);

  async function changeStatus(id, status) { await apiPatch(`/api/tickets/${id}`, { status }); reload(); }
  async function saveRules() {
    let parsed; try { parsed = JSON.parse(rules); } catch { setToast('JSON غير صالح'); return; }
    if (settingsId) await apiPatch(`/api/business_settings/${settingsId}`, { ticket_rules: parsed });
    else { const r = await apiPost('/api/business_settings', { ticket_rules: parsed }); setSettingsId(r.id); }
    setToast('تم حفظ قواعد التذاكر ✅');
  }

  return (
    <div>
      <div className="topbar"><h1>التذاكر</h1></div>

      <div className="card">
        <h3>قواعد إنشاء التذاكر (Settings-Driven)</h3>
        <p className="small">حرّر متى يُنشئ البوت تذكرة، الحقول المطلوبة، نوع التذكرة، الأولوية، وهل يؤكد العميل أولاً.</p>
        <textarea style={{ minHeight: 150, fontFamily: 'monospace' }} value={rules} onChange={(e) => setRules(e.target.value)} />
        <div className="row" style={{ marginTop: 10 }}><button className="btn" onClick={saveRules}>حفظ القواعد</button></div>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>الكود</th><th>النوع</th><th>الأولوية</th><th>الملخص</th><th>الحالة</th></tr></thead>
          <tbody>
            {(list || []).map((t) => (
              <tr key={t.id}>
                <td><b>{t.ticket_code}</b><div className="small">{new Date(t.created_at).toLocaleString('ar-EG')}</div></td>
                <td>{t.ticket_type}</td>
                <td>{prio(t.priority)}</td>
                <td style={{ maxWidth: 280 }}>{t.summary}<div className="small">{t.ai_diagnosis}</div></td>
                <td>
                  <select value={t.status} onChange={(e) => changeStatus(t.id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_AR[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {(list || []).length === 0 && <tr><td colSpan={5} className="muted">لا توجد تذاكر بعد.</td></tr>}
          </tbody>
        </table>
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </div>
  );
}
function prio(p) {
  const m = { low: 'blue', medium: 'amber', high: 'red', urgent: 'red' };
  return <span className={`badge ${m[p] || 'blue'}`}>{p}</span>;
}
