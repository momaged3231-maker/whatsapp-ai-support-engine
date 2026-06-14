'use client';
import { useState } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete, useAsync, Toast } from '@/components/store';

const ROLES = ['agent', 'technician', 'doctor', 'manager', 'group'];
const blank = { name: '', phone: '', role: 'agent', area: 'all', channel: 'whatsapp', is_active: true };

export default function SupportPage() {
  const { data: list, reload } = useAsync(() => apiGet('/api/support_members'), []);
  const [form, setForm] = useState(blank);
  const [toast, setToast] = useState('');
  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (form.id) await apiPatch(`/api/support_members/${form.id}`, form);
    else await apiPost('/api/support_members', form);
    setForm(blank); setToast('تم الحفظ ✅'); reload();
  }
  async function del(id) { await apiDelete(`/api/support_members/${id}`); reload(); }

  return (
    <div>
      <div className="topbar"><h1>توجيه الدعم</h1></div>

      <div className="card">
        <h3>{form.id ? 'تعديل عضو دعم' : 'إضافة رقم / قسم دعم'}</h3>
        <div className="grid three">
          <div><label>الاسم</label><input value={form.name} onChange={(e) => up('name', e.target.value)} /></div>
          <div><label>الهاتف</label><input value={form.phone} onChange={(e) => up('phone', e.target.value)} placeholder="+2010..." /></div>
          <div>
            <label>الدور</label>
            <select value={form.role} onChange={(e) => up('role', e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
          </div>
        </div>
        <div className="grid two">
          <div><label>المنطقة (all لكل المناطق)</label><input value={form.area} onChange={(e) => up('area', e.target.value)} /></div>
          <div>
            <label>القناة</label>
            <select value={form.channel} onChange={(e) => up('channel', e.target.value)}>
              <option value="whatsapp">whatsapp</option><option value="group">group</option>
              <option value="telegram">telegram</option><option value="email">email</option>
            </select>
          </div>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={save}>{form.id ? 'تحديث' : 'إضافة'}</button>
          {form.id && <button className="btn secondary" onClick={() => setForm(blank)}>إلغاء</button>}
        </div>
      </div>

      <div className="card">
        <p className="small">قاعدة التوجيه: التذاكر تُرسَل لأعضاء الدعم النشطين على واتساب، ويُفضّل من يطابق منطقة العميل، وإلا تُرسل للجميع.</p>
        <table>
          <thead><tr><th>الاسم</th><th>الهاتف</th><th>الدور</th><th>المنطقة</th><th>القناة</th><th></th></tr></thead>
          <tbody>
            {(list || []).map((m) => (
              <tr key={m.id}>
                <td><b>{m.name}</b></td><td>{m.phone}</td><td>{m.role}</td><td>{m.area}</td><td>{m.channel}</td>
                <td className="row">
                  <button className="btn small secondary" onClick={() => setForm(m)}>تعديل</button>
                  <button className="btn small danger" onClick={() => del(m.id)}>حذف</button>
                </td>
              </tr>
            ))}
            {(list || []).length === 0 && <tr><td colSpan={6} className="muted">لا يوجد أعضاء دعم بعد.</td></tr>}
          </tbody>
        </table>
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </div>
  );
}
