'use client';
import { useEffect, useState } from 'react';
import { apiPost, Toast } from '@/components/store';

export default function TemplatesPage() {
  const [list, setList] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/templates').then((r) => r.json()).then((j) => setList(j.data || [])).catch(() => {});
  }, []);

  async function apply(key) {
    const r = await apiPost('/api/templates/apply', { template_key: key });
    setToast(`تم تطبيق قالب «${key}» على النشاط الحالي ✅ (النوع: ${r.business_type})`);
  }

  return (
    <div>
      <div className="topbar"><h1>قوالب الأنشطة</h1></div>
      <p className="small">طبّق قالباً جاهزاً ليضبط نوع النشاط، النوايا الخاصة، ونوع التذكرة والحقول المطلوبة على النشاط المحدد حالياً.</p>
      <div className="grid two">
        {list.map((t) => (
          <div key={t.key} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3>{t.name}</h3><span className="badge blue">{t.business_type}</span>
            </div>
            <p className="small">{t.description}</p>
            <div className="pill-row" style={{ margin: '8px 0' }}>
              {(t.config?.intents || []).map((i) => <span key={i} className="badge">{i}</span>)}
            </div>
            <p className="small">نوع التذكرة: <b>{t.config?.ticket_type}</b> — الحقول: {(t.config?.required_fields || []).join(', ')}</p>
            <button className="btn" onClick={() => apply(t.key)}>تطبيق على النشاط الحالي</button>
          </div>
        ))}
        {list.length === 0 && <div className="card muted">لا توجد قوالب.</div>}
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </div>
  );
}
