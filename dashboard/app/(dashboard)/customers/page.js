'use client';
import { apiGet, useAsync } from '@/components/store';

export default function CustomersPage() {
  const { data: list } = useAsync(() => apiGet('/api/customers'), []);

  return (
    <div>
      <div className="topbar"><h1>ذاكرة العملاء</h1></div>
      <div className="card">
        <table>
          <thead>
            <tr><th>العميل</th><th>الهاتف</th><th>المنطقة</th><th>الحالة</th><th>متابعة؟</th><th>ملخص المحادثة</th><th>آخر ظهور</th></tr>
          </thead>
          <tbody>
            {(list || []).map((c) => (
              <tr key={c.id}>
                <td><b>{c.name || 'غير معروف'}</b></td>
                <td>{c.phone}</td>
                <td>{c.area || '-'}</td>
                <td>{statusBadge(c.status)}</td>
                <td>{c.needs_followup ? <span className="badge amber">نعم</span> : '—'}</td>
                <td style={{ maxWidth: 360 }} className="small">{c.memory_summary || '—'}</td>
                <td className="small">{c.last_seen_at ? new Date(c.last_seen_at).toLocaleString('ar-EG') : '-'}</td>
              </tr>
            ))}
            {(list || []).length === 0 && <tr><td colSpan={7} className="muted">لا يوجد عملاء بعد. ابدأ من «محاكاة البوت».</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function statusBadge(s) {
  const m = { new: 'blue', active: 'green', needs_followup: 'amber', closed: 'red' };
  const ar = { new: 'جديد', active: 'نشط', needs_followup: 'يحتاج متابعة', closed: 'مغلق' };
  return <span className={`badge ${m[s] || 'blue'}`}>{ar[s] || s}</span>;
}
