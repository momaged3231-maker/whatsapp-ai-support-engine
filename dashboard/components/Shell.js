'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBusinessId, setBusinessId } from './store';

const NAV = [
  ['/setup', '⚙️', 'إعداد النشاط'],
  ['/services', '🧾', 'الخدمات / المنتجات'],
  ['/knowledge', '📚', 'قاعدة المعرفة'],
  ['/whatsapp', '🟢', 'واتساب'],
  ['/support', '🎧', 'توجيه الدعم'],
  ['/tickets', '🎫', 'التذاكر'],
  ['/customers', '🧠', 'ذاكرة العملاء'],
  ['/reports', '📊', 'التقارير'],
  ['/templates', '🧩', 'القوالب'],
  ['/demo', '💬', 'محاكاة البوت'],
];

export default function Shell({ children }) {
  const pathname = usePathname();
  const [businesses, setBusinesses] = useState([]);
  const [biz, setBiz] = useState(1);

  useEffect(() => {
    setBiz(getBusinessId());
    fetch('/api/businesses')
      .then((r) => r.json())
      .then((j) => setBusinesses(j.data || []))
      .catch(() => {});
  }, []);

  function onPick(e) {
    const id = parseInt(e.target.value, 10);
    setBiz(id);
    setBusinessId(id);
    window.location.reload();
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span className="dot" /> WhatsApp AI Engine</div>
        <nav className="nav">
          {NAV.map(([href, icon, label]) => (
            <a key={href} href={href} className={pathname === href ? 'active' : ''}>
              <span>{icon}</span> <span>{label}</span>
            </a>
          ))}
        </nav>
        <div style={{ marginTop: 18 }} className="small">
          <label>النشاط الحالي</label>
          <select value={biz} onChange={onPick}>
            {businesses.length === 0 && <option value={1}>#1</option>}
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>#{b.id} — {b.name}</option>
            ))}
          </select>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
