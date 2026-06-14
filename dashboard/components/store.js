'use client';
// Minimal client-side helpers: selected business + fetch wrappers.
import { useEffect, useState, useCallback } from 'react';

const KEY = 'was_business_id';

export function getBusinessId() {
  if (typeof window === 'undefined') return 1;
  return parseInt(window.localStorage.getItem(KEY) || '1', 10);
}
export function setBusinessId(id) {
  if (typeof window !== 'undefined') window.localStorage.setItem(KEY, String(id));
}

function withBiz(url) {
  const id = getBusinessId();
  return url + (url.includes('?') ? '&' : '?') + 'business_id=' + id;
}

export async function apiGet(path) {
  const res = await fetch(withBiz(path), { cache: 'no-store' });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || res.statusText);
  return j.data ?? j;
}

export async function apiSend(path, method, body) {
  const id = getBusinessId();
  const res = await fetch(path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ business_id: id, ...(body || {}) }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || res.statusText);
  return j.data ?? j;
}

export const apiPost = (p, b) => apiSend(p, 'POST', b);
export const apiPatch = (p, b) => apiSend(p, 'PATCH', b);
export const apiDelete = (p) => apiSend(p, 'DELETE');

// hook: load + reload helper
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const run = useCallback(() => {
    setLoading(true);
    Promise.resolve(fn())
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(run, [run]);
  return { data, error, loading, reload: run };
}

export function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}
