'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, Toast } from '@/components/store';

export default function WhatsAppPage() {
  const [ig, setIg] = useState(null);
  const [cfg, setCfg] = useState({ phone_number_id: '', waba_id: '', access_token: '', verify_token: '', api_version: 'v21.0' });
  const [test, setTest] = useState({ to: '', text: 'رسالة اختبار ✅' });
  const [toast, setToast] = useState('');
  const [webhook, setWebhook] = useState('');

  useEffect(() => {
    setWebhook(`${window.location.origin}/api/whatsapp`);
    apiGet('/api/integrations').then((rows) => {
      const w = (rows || []).find((r) => r.integration_type === 'whatsapp');
      if (w) { setIg(w); setCfg({ ...cfg, ...(w.config || {}) }); }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const up = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  async function save() {
    if (ig) await apiPatch(`/api/integrations/${ig.id}`, { config: cfg, is_active: true });
    else { const r = await apiPost('/api/integrations', { integration_type: 'whatsapp', name: 'WhatsApp Cloud', config: cfg, is_active: true }); setIg(r); }
    setToast('تم حفظ إعدادات واتساب ✅');
  }
  async function sendTest() {
    const r = await apiPost('/api/whatsapp/test', test);
    setToast(r.demo ? 'وضع تجريبي: تم تسجيل الرسالة (بدون توكن حقيقي)' : 'تم إرسال رسالة الاختبار ✅');
  }

  const connected = ig && cfg.access_token && cfg.access_token !== 'REPLACE_ME';

  return (
    <div>
      <div className="topbar">
        <h1>إعداد واتساب</h1>
        <span className={`badge ${connected ? 'green' : 'amber'}`}>{connected ? 'مربوط' : 'غير مكتمل / وضع تجريبي'}</span>
      </div>

      <div className="card">
        <h3>WhatsApp Cloud API</h3>
        <div className="grid two">
          <div><label>Phone Number ID</label><input value={cfg.phone_number_id} onChange={(e) => up('phone_number_id', e.target.value)} /></div>
          <div><label>WhatsApp Business Account ID</label><input value={cfg.waba_id} onChange={(e) => up('waba_id', e.target.value)} /></div>
        </div>
        <label>Access Token</label>
        <input value={cfg.access_token} onChange={(e) => up('access_token', e.target.value)} placeholder="EAAG..." />
        <div className="grid two">
          <div><label>Verify Token</label><input value={cfg.verify_token} onChange={(e) => up('verify_token', e.target.value)} /></div>
          <div><label>API Version</label><input value={cfg.api_version} onChange={(e) => up('api_version', e.target.value)} /></div>
        </div>
        <label>Webhook URL (ضعه في إعدادات تطبيق Meta)</label>
        <input readOnly value={webhook} onFocus={(e) => e.target.select()} />
        <p className="small">طريقة الربط: استخدم الـ Verify Token أعلاه ورابط الـ Webhook في لوحة Meta Developers، واشترك في حقل <code>messages</code>.</p>
        <div className="row" style={{ marginTop: 12 }}><button className="btn" onClick={save}>حفظ</button></div>
      </div>

      <div className="card">
        <h3>اختبار الإرسال</h3>
        <div className="grid two">
          <div><label>إلى رقم (بصيغة دولية بدون +)</label><input value={test.to} onChange={(e) => setTest((t) => ({ ...t, to: e.target.value }))} placeholder="2010xxxxxxx" /></div>
          <div><label>النص</label><input value={test.text} onChange={(e) => setTest((t) => ({ ...t, text: e.target.value }))} /></div>
        </div>
        <div className="row" style={{ marginTop: 12 }}><button className="btn secondary" onClick={sendTest}>إرسال اختبار</button></div>
        <p className="small">بدون توكن حقيقي يعمل النظام في «وضع تجريبي» ويسجّل الرسالة بدل إرسالها فعلياً.</p>
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </div>
  );
}
