'use client';
import { useEffect, useRef, useState } from 'react';
import { apiGet, getBusinessId } from '@/components/store';

// Simulates an inbound WhatsApp message through the real engine pipeline
// (resolve -> RAG -> classify -> reply -> ticket -> notify). Great for the
// "first demo" without needing a real WhatsApp number.
export default function DemoPage() {
  const [phoneId, setPhoneId] = useState('');
  const [from, setFrom] = useState('201111111111');
  const [text, setText] = useState('');
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    apiGet('/api/integrations').then((rows) => {
      const w = (rows || []).find((r) => r.integration_type === 'whatsapp');
      if (w?.config?.phone_number_id) setPhoneId(w.config.phone_number_id);
    }).catch(() => {});
  }, []);

  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [log]);

  async function send(presetText) {
    const body = presetText || text;
    if (!body || !phoneId) { if (!phoneId) alert('لا يوجد Phone Number ID لهذا النشاط. اضبطه من صفحة واتساب.'); return; }
    setLog((l) => [...l, { who: 'in', text: body }]);
    setText(''); setBusy(true);
    try {
      const res = await fetch('/api/engine/process', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phoneNumberId: phoneId, from, text: body, business_id: getBusinessId() }),
      });
      const j = await res.json();
      if (j.reply) setLog((l) => [...l, { who: 'out', text: j.reply }]);
      const meta = [];
      if (j.intent) meta.push(`intent: ${j.intent}`);
      if (j.ticket) meta.push(`🎫 ${j.ticket}`);
      if (j.needs_human) meta.push('🙋 تحويل للبشري');
      if (j.notified) meta.push(`📣 أُبلغ الدعم (${j.notified.sent?.length || 0})`);
      if (meta.length) setLog((l) => [...l, { who: 'sys', text: meta.join('  •  ') }]);
      if (j.error) setLog((l) => [...l, { who: 'sys', text: 'خطأ: ' + j.error }]);
    } catch (e) {
      setLog((l) => [...l, { who: 'sys', text: 'فشل الاتصال: ' + e.message }]);
    } finally { setBusy(false); }
  }

  const presets = ['النت قاطع', 'عايز فني', 'عايز أحجز كشف', 'السعر كام؟', 'مواعيدكم إيه؟', 'عايز أكلم موظف'];

  return (
    <div>
      <div className="topbar"><h1>محاكاة البوت</h1></div>
      <div className="card">
        <div className="grid two">
          <div><label>Phone Number ID (النشاط)</label><input value={phoneId} onChange={(e) => setPhoneId(e.target.value)} /></div>
          <div><label>رقم العميل (محاكاة)</label><input value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        </div>
        <div className="pill-row" style={{ marginTop: 10 }}>
          {presets.map((p) => <button key={p} className="btn small secondary" disabled={busy} onClick={() => send(p)}>{p}</button>)}
        </div>
      </div>

      <div className="card">
        <div className="chat" ref={boxRef}>
          {log.length === 0 && <div className="msg sys">اكتب رسالة كأنك عميل على واتساب، وشوف رد البوت.</div>}
          {log.map((m, i) => <div key={i} className={`msg ${m.who}`}>{m.text}</div>)}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="رسالة العميل…" />
          <button className="btn" disabled={busy} onClick={() => send()}>{busy ? '...' : 'إرسال'}</button>
        </div>
      </div>
    </div>
  );
}
