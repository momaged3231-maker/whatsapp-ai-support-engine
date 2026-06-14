'use client';
import { useState } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete, useAsync, Toast } from '@/components/store';

const blank = { name: '', description: '', category: '', price: '', currency: 'EGP', price_visible: true, duration: '', needs_booking: false, needs_staff: false };

export default function ServicesPage() {
  const { data: list, reload } = useAsync(() => apiGet('/api/services'), []);
  const [form, setForm] = useState(blank);
  const [toast, setToast] = useState('');
  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    const payload = { ...form, price: form.price === '' ? null : Number(form.price) };
    if (form.id) await apiPatch(`/api/services/${form.id}`, payload);
    else await apiPost('/api/services', payload);
    setForm(blank); setToast('تم الحفظ ✅'); reload();
  }
  async function del(id) { await apiDelete(`/api/services/${id}`); reload(); }

  return (
    <div>
      <div className="topbar"><h1>الخدمات / المنتجات</h1></div>

      <div className="card">
        <h3>{form.id ? 'تعديل خدمة' : 'إضافة خدمة / منتج'}</h3>
        <div className="grid three">
          <div><label>الاسم</label><input value={form.name} onChange={(e) => up('name', e.target.value)} /></div>
          <div><label>التصنيف</label><input value={form.category} onChange={(e) => up('category', e.target.value)} /></div>
          <div><label>المدة</label><input value={form.duration} onChange={(e) => up('duration', e.target.value)} placeholder="30 دقيقة / 2-3 أيام" /></div>
        </div>
        <label>الوصف</label>
        <textarea value={form.description} onChange={(e) => up('description', e.target.value)} />
        <div className="grid three">
          <div><label>السعر</label><input type="number" value={form.price} onChange={(e) => up('price', e.target.value)} /></div>
          <div><label>العملة</label><input value={form.currency} onChange={(e) => up('currency', e.target.value)} /></div>
          <div className="row" style={{ alignItems: 'end', gap: 16 }}>
            <label className="row"><input type="checkbox" style={{ width: 18 }} checked={!!form.price_visible} onChange={(e) => up('price_visible', e.target.checked)} /> إظهار السعر</label>
          </div>
        </div>
        <div className="row" style={{ gap: 20, marginTop: 8 }}>
          <label className="row"><input type="checkbox" style={{ width: 18 }} checked={!!form.needs_booking} onChange={(e) => up('needs_booking', e.target.checked)} /> يحتاج حجز</label>
          <label className="row"><input type="checkbox" style={{ width: 18 }} checked={!!form.needs_staff} onChange={(e) => up('needs_staff', e.target.checked)} /> يحتاج موظف</label>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={save}>{form.id ? 'تحديث' : 'إضافة'}</button>
          {form.id && <button className="btn secondary" onClick={() => setForm(blank)}>إلغاء</button>}
        </div>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>الاسم</th><th>التصنيف</th><th>السعر</th><th>حجز</th><th>موظف</th><th></th></tr></thead>
          <tbody>
            {(list || []).map((s) => (
              <tr key={s.id}>
                <td><b>{s.name}</b><div className="small">{s.description}</div></td>
                <td>{s.category || '-'}</td>
                <td>{s.price != null ? `${s.price} ${s.currency}` : '-'} {s.price_visible ? '' : <span className="badge amber">مخفي</span>}</td>
                <td>{s.needs_booking ? '✓' : '—'}</td>
                <td>{s.needs_staff ? '✓' : '—'}</td>
                <td className="row">
                  <button className="btn small secondary" onClick={() => setForm({ ...s, price: s.price ?? '' })}>تعديل</button>
                  <button className="btn small danger" onClick={() => del(s.id)}>حذف</button>
                </td>
              </tr>
            ))}
            {(list || []).length === 0 && <tr><td colSpan={6} className="muted">لا توجد خدمات بعد.</td></tr>}
          </tbody>
        </table>
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </div>
  );
}
