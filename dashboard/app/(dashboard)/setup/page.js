'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPatch, apiPost, getBusinessId, Toast } from '@/components/store';

const empty = { name: '', business_type: '', description: '', phone: '', email: '', timezone: 'Africa/Cairo', language: 'ar-EG' };

export default function SetupPage() {
  const [biz, setBiz] = useState(empty);
  const [settings, setSettings] = useState(null);
  const [toast, setToast] = useState('');
  const id = typeof window !== 'undefined' ? getBusinessId() : 1;

  useEffect(() => {
    apiGet(`/api/businesses/${id}`).then(setBiz).catch(() => {});
    apiGet(`/api/business_settings`).then((rows) => setSettings(rows[0] || null)).catch(() => {});
  }, [id]);

  function up(k, v) { setBiz((b) => ({ ...b, [k]: v })); }
  function ups(k, v) { setSettings((s) => ({ ...(s || {}), [k]: v })); }

  async function saveBusiness() {
    await apiPatch(`/api/businesses/${id}`, biz);
    setToast('تم حفظ بيانات النشاط ✅');
  }
  async function saveSettings() {
    const payload = {
      welcome_message: settings?.welcome_message,
      handoff_message: settings?.handoff_message,
      fallback_message: settings?.fallback_message,
      default_reply_style: settings?.default_reply_style || 'friendly_short',
      confidence_threshold: parseFloat(settings?.confidence_threshold ?? 0.65),
      allow_ai_auto_reply: settings?.allow_ai_auto_reply !== false,
      allow_ticket_creation: settings?.allow_ticket_creation !== false,
      coverage_areas: parseList(settings?.coverage_areas),
      working_hours: parseJson(settings?.working_hours),
      policies: parseJson(settings?.policies),
    };
    if (settings?.id) await apiPatch(`/api/business_settings/${settings.id}`, payload);
    else { const r = await apiPost(`/api/business_settings`, payload); setSettings(r); }
    setToast('تم حفظ الإعدادات ✅');
  }

  return (
    <div>
      <div className="topbar"><h1>إعداد النشاط</h1></div>

      <div className="card">
        <h3>بيانات النشاط</h3>
        <div className="grid two">
          <div><label>اسم النشاط</label><input value={biz.name || ''} onChange={(e) => up('name', e.target.value)} /></div>
          <div><label>نوع النشاط</label><input value={biz.business_type || ''} onChange={(e) => up('business_type', e.target.value)} placeholder="internet / clinic / restaurant ..." /></div>
        </div>
        <label>الوصف</label>
        <textarea value={biz.description || ''} onChange={(e) => up('description', e.target.value)} />
        <div className="grid three">
          <div><label>الهاتف</label><input value={biz.phone || ''} onChange={(e) => up('phone', e.target.value)} /></div>
          <div><label>البريد</label><input value={biz.email || ''} onChange={(e) => up('email', e.target.value)} /></div>
          <div><label>اللغة</label><input value={biz.language || ''} onChange={(e) => up('language', e.target.value)} /></div>
        </div>
        <div className="row" style={{ marginTop: 12 }}><button className="btn" onClick={saveBusiness}>حفظ النشاط</button></div>
      </div>

      <div className="card">
        <h3>سلوك البوت</h3>
        <div className="grid two">
          <div><label>رسالة الترحيب</label><textarea value={settings?.welcome_message || ''} onChange={(e) => ups('welcome_message', e.target.value)} /></div>
          <div><label>رسالة التحويل للدعم</label><textarea value={settings?.handoff_message || ''} onChange={(e) => ups('handoff_message', e.target.value)} /></div>
        </div>
        <div className="grid two">
          <div><label>رسالة افتراضية (fallback)</label><textarea value={settings?.fallback_message || ''} onChange={(e) => ups('fallback_message', e.target.value)} /></div>
          <div>
            <label>نبرة الرد</label>
            <select value={settings?.default_reply_style || 'friendly_short'} onChange={(e) => ups('default_reply_style', e.target.value)}>
              <option value="friendly_short">ودّي ومختصر</option>
              <option value="professional_short">رسمي ومختصر</option>
              <option value="detailed">مفصّل</option>
            </select>
            <label>حد الثقة (تحويل للبشري تحته)</label>
            <input type="number" step="0.05" min="0" max="1" value={settings?.confidence_threshold ?? 0.65} onChange={(e) => ups('confidence_threshold', e.target.value)} />
          </div>
        </div>
        <div className="grid two">
          <div><label>المناطق المغطاة (مفصولة بفاصلة)</label><input value={toList(settings?.coverage_areas)} onChange={(e) => ups('coverage_areas', e.target.value)} /></div>
          <div className="row" style={{ alignItems: 'end', gap: 18 }}>
            <label className="row"><input type="checkbox" style={{ width: 18 }} checked={settings?.allow_ai_auto_reply !== false} onChange={(e) => ups('allow_ai_auto_reply', e.target.checked)} /> رد آلي بالذكاء الاصطناعي</label>
            <label className="row"><input type="checkbox" style={{ width: 18 }} checked={settings?.allow_ticket_creation !== false} onChange={(e) => ups('allow_ticket_creation', e.target.checked)} /> إنشاء تذاكر</label>
          </div>
        </div>
        <label>مواعيد العمل (JSON)</label>
        <textarea value={toJson(settings?.working_hours)} onChange={(e) => ups('working_hours', e.target.value)} placeholder='{"sat":["10:00","22:00"]}' />
        <label>السياسات (JSON)</label>
        <textarea value={toJson(settings?.policies)} onChange={(e) => ups('policies', e.target.value)} placeholder='{"refund":"..."}' />
        <div className="row" style={{ marginTop: 12 }}><button className="btn" onClick={saveSettings}>حفظ الإعدادات</button></div>
      </div>

      <Toast msg={toast} onDone={() => setToast('')} />
    </div>
  );
}

function toList(v) { if (!v) return ''; return Array.isArray(v) ? v.join(', ') : v; }
function parseList(v) { if (Array.isArray(v)) return v; return String(v || '').split(',').map((s) => s.trim()).filter(Boolean); }
function toJson(v) { if (v == null) return ''; return typeof v === 'string' ? v : JSON.stringify(v, null, 2); }
function parseJson(v) { if (v == null || v === '') return null; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return null; } }
