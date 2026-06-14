#!/usr/bin/env node
// Runs the test matrix against a running dashboard.
//   node scripts/test_scenarios.mjs
//   BASE=https://your-domain node scripts/test_scenarios.mjs
const BASE = process.env.BASE || 'http://localhost:3000';

const BUSINESSES = {
  internet: '100000000000001',
  clinic: '100000000000002',
  restaurant: '100000000000003',
  real_estate: '100000000000004',
  maintenance: '100000000000005',
};

const SCENARIOS = [
  ['price', 'السعر كام؟'],
  ['hours', 'مواعيدكم إيه؟'],
  ['booking/order', 'عايز أحجز'],
  ['complaint', 'في مشكلة مش شغال'],
  ['human', 'عايز أكلم موظف'],
  ['unclear', 'تمام'],
];

// Vertical-specific "headline" message used for the two required demos.
const HEADLINE = {
  internet: ['النت قاطع', 'عايز فني'],
  clinic: ['عايز أحجز كشف بكرة الساعة 5'],
  restaurant: ['عايز أطلب كشري كبير'],
  real_estate: ['عايز شقة إيجار في التجمع ميزانية 15 ألف'],
  maintenance: ['الموبايل شاشته مكسورة، بكام؟'],
};

async function call(phoneNumberId, from, text) {
  const r = await fetch(`${BASE}/api/engine/process`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phoneNumberId, from, text }),
  });
  return r.json();
}

function line(label, res) {
  const tag = [res.intent, res.ticket ? `🎫${res.ticket}` : '', res.needs_human ? '🙋' : '', res.notified ? `📣${res.notified.sent?.length ?? 0}` : '']
    .filter(Boolean).join(' ');
  console.log(`   • ${label.padEnd(16)} → ${tag}\n     ${String(res.reply || res.error || '').replace(/\n/g, ' ')}`);
}

(async () => {
  // health
  try {
    const h = await (await fetch(`${BASE}/api/health`)).json();
    console.log('Health:', JSON.stringify(h), '\n');
  } catch (e) {
    console.error('Cannot reach', BASE, '-', e.message); process.exit(1);
  }

  let i = 0;
  for (const [vertical, phoneId] of Object.entries(BUSINESSES)) {
    console.log(`\n=== ${vertical.toUpperCase()} (phone_number_id ${phoneId}) ===`);
    const from = '20100000' + String(1000 + i++).padStart(4, '0');

    for (const text of HEADLINE[vertical]) {
      line('headline', await call(phoneId, from, text));
    }
    for (const [label, text] of SCENARIOS) {
      line(label, await call(phoneId, from, text));
    }
    // returning customer (memory)
    line('returning', await call(phoneId, from, 'تمام شكراً'));
  }
  console.log('\nDone. Check the dashboard: Customers / Tickets / Reports.');
})();
