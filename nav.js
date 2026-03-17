// src/utils/nav.js
const TITLES = {
  dashboard: 'Dashboard',
  register:  'Register Worker',
  workers:   'Worker Records',
  fraud:     'Fraud Alerts',
  security:  'Security Controls',
  auth:      'Auth / MFA Flow',
};
const SUBS = {
  dashboard: 'Surat District · March 2026',
  register:  'Phone-first onboarding — no email required',
  workers:   'Search and manage all registered workers',
  fraud:     'AI-powered fraud detection and alerts',
  security:  'Active security controls and compliance',
  auth:      'Interactive authentication demo',
};

export function initNav() {
  document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section, btn));
  });
}

export function showSection(name, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const sec = document.getElementById('sec-' + name);
  if (sec) sec.classList.add('active');
  if (btn) btn.classList.add('active');
  else {
    const b = document.querySelector(`.nav-item[data-section="${name}"]`);
    if (b) b.classList.add('active');
  }
  const t = document.getElementById('page-title');
  const s = document.getElementById('page-sub');
  if (t) t.textContent = TITLES[name] || name;
  if (s) s.textContent = SUBS[name] || '';
}