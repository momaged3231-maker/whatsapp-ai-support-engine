'use client';
import { useState } from 'react';
import { apiGet, apiPost, apiDelete, useAsync, Toast } from '@/components/store';

const CATS = ['faq', 'policy', 'problem_solution', 'service_desc', 'steps', 'offer'];
const blank = { title: '', category: 'faq', content: '', source: 'manual' };

export default function KnowledgePage() {
  const { data: list, reload } = useAsync(() => apiGet('/api/knowledge_documents'), []);
  const [form, setForm] = useState(blank);
  const [toast, setToast] = useState('');
  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    await apiPost('/api/knowledge_documents', form);
    setForm(blank); setToast('تمت الإضافة، جارٍ إنشاء الـ Embeddings…'); reload();
  }
  async function del(id) { await apiDelete(`/api/knowledge_documents/${id}`); reload(); }
  async function ingestAll() {
    const r = await apiPost('/api/knowledge/ingest', {});
    setToast(`تمت المعالجة: ${r.documents ?? 0} مستند، ${r.chunks ?? 0} مقطع`); reload();
  }

  return (
    <div>
      <div className="topbar">
        <h1>قاعدة المعرفة</h1>
        <button className="btn secondary" onClick={ingestAll}>معالجة كل المعلّق (Embeddings)</button>
      </div>

      <div className="card">
        <h3>إضافة معرفة</h3>
        <div className="grid two">
          <div><label>العنوان</label><input value={form.title} onChange={(e) => up('title', e.target.value)} /></div>
          <div>
            <label>التصنيف</label>
            <select value={form.category} onChange={(e) => up('category', e.target.value)}>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <label>المحتوى</label>
        <textarea style={{ minHeight: 140 }} value={form.content} onChange={(e) => up('content', e.target.value)} placeholder="سؤال وجواب / سياسة / مشكلة وحل / خطوات…" />
        <div className="row" style={{ marginTop: 12 }}><button className="btn" onClick={save}>إضافة ومعالجة</button></div>
        <p className="small">كل محتوى يتم تقطيعه وتحويله إلى Embeddings وتخزينه في الـ Vector DB مفلتراً حسب النشاط.</p>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>العنوان</th><th>التصنيف</th><th>الحالة</th><th>المصدر</th><th></th></tr></thead>
          <tbody>
            {(list || []).map((d) => (
              <tr key={d.id}>
                <td><b>{d.title}</b><div className="small">{(d.content || '').slice(0, 90)}…</div></td>
                <td><span className="badge blue">{d.category}</span></td>
                <td>{statusBadge(d.embedding_status)}</td>
                <td className="small">{d.source}</td>
                <td><button className="btn small danger" onClick={() => del(d.id)}>حذف</button></td>
              </tr>
            ))}
            {(list || []).length === 0 && <tr><td colSpan={5} className="muted">لا توجد معرفة بعد.</td></tr>}
          </tbody>
        </table>
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </div>
  );
}

function statusBadge(s) {
  if (s === 'done') return <span className="badge green">مُفهرس</span>;
  if (s === 'error') return <span className="badge red">خطأ</span>;
  return <span className="badge amber">معلّق</span>;
}
