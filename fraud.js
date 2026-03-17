// src/components/fraud.js
export function initFraud() {
  const alertsPanel = document.getElementById('fraud-alerts-panel');
  if (alertsPanel) alertsPanel.innerHTML = `
    <div class="card-title">Active fraud flags — AI-detected</div>
    <div class="alert alert-danger"><div class="alert-title">🔴 CRITICAL — Biometric duplicate</div><div class="alert-body">Workers SRT-29814 and SRT-10043 share 87% face embedding similarity. Both accounts suspended.</div></div>
    <div class="alert alert-danger"><div class="alert-title">🔴 CRITICAL — GPS velocity anomaly</div><div class="alert-body">SRT-44019 registered Surat 10 AM, logged in Ahmedabad 1 PM. 280 km in 3 hrs — impossible.</div></div>
    <div class="alert alert-warn"><div class="alert-title">🟡 Employer license fraud</div><div class="alert-body">Shree Textiles license shows expiry Dec 2025. Database shows actual expiry Dec 2023.</div></div>
    <div class="alert alert-warn"><div class="alert-title">🟡 Mass registration — one device</div><div class="alert-body">47 workers registered from device ID iPhone-A9F2C in 6 hours. Rate limiter auto-triggered.</div></div>
    <div class="alert alert-info"><div class="alert-title">🔵 Address cluster anomaly</div><div class="alert-body">28 workers listed same address in Katargam. AI risk score 0.73. Under review.</div></div>`;

  const statsPanel = document.getElementById('fraud-stats-panel');
  if (statsPanel) statsPanel.innerHTML = `
    <div class="card-title">Fraud stats this month</div>
    <div class="grid2" style="gap:10px;margin-bottom:16px">
      <div class="stat-card"><div class="stat-label">Auto-blocked</div><div class="stat-num" style="font-size:20px">214</div><div class="stat-change up">By rate limiter</div></div>
      <div class="stat-card"><div class="stat-label">Manual review</div><div class="stat-num" style="font-size:20px">37</div><div class="stat-change warn">5 critical</div></div>
      <div class="stat-card"><div class="stat-label">Duplicates found</div><div class="stat-num" style="font-size:20px">12</div><div class="stat-change danger">Accounts merged</div></div>
      <div class="stat-card"><div class="stat-label">False positives</div><div class="stat-num" style="font-size:20px">3</div><div class="stat-change up">Cleared by admin</div></div>
    </div>
    <div class="card-title">Detection methods active</div>
    <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">Biometric deduplication</div><div class="sec-desc">Cosine similarity on 128-dim Facenet embeddings. Threshold: 0.80</div></div></div>
    <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">Geo-velocity check</div><div class="sec-desc">Haversine distance ÷ time gap. Flags if implied speed > 150 km/h</div></div></div>
    <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">Device fingerprinting</div><div class="sec-desc">Max 10 registrations per device per day</div></div></div>
    <div class="sec-item"><div class="sec-dot warn"></div><div><div class="sec-name">Document OCR cross-check</div><div class="sec-desc">Extracted fields vs. database records. Beta.</div></div></div>`;
}