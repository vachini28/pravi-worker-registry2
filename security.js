// src/components/security.js
export function initSecurity() {
  const grid = document.getElementById('security-grid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="card">
      <div class="card-title">Authentication controls</div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">JWT — 30 min expiry</div><div class="sec-desc">Short-lived; rotating refresh tokens (7 days)</div></div><span class="badge badge-teal">Active</span></div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">OTP rate limit</div><div class="sec-desc">3 OTPs/hr per phone. Lock after 5 failures.</div></div><span class="badge badge-teal">Active</span></div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">Device binding</div><div class="sec-desc">New device triggers re-verification</div></div><span class="badge badge-teal">Active</span></div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">Geo-velocity check</div><div class="sec-desc">Impossible travel triggers step-up auth</div></div><span class="badge badge-teal">Active</span></div>
    </div>
    <div class="card">
      <div class="card-title">Data protection</div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">AES-256 at rest</div><div class="sec-desc">All PII fields encrypted before DB write</div></div><span class="badge badge-teal">Active</span></div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">TLS 1.3 in transit</div><div class="sec-desc">All API calls encrypted end-to-end</div></div><span class="badge badge-teal">Active</span></div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">RBAC — role-based access</div><div class="sec-desc">District admin cannot access other districts</div></div><span class="badge badge-teal">Active</span></div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">Immutable audit log</div><div class="sec-desc">Hash-chained — every admin action recorded</div></div><span class="badge badge-teal">Active</span></div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">DPDP Act compliance</div><div class="sec-desc">Minimal data, purpose limitation, consent</div></div><span class="badge badge-teal">Active</span></div>
    </div>`;
}