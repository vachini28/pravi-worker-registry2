// src/components/auth.js
let authStep = 1;

const AUTH_STEPS = {
  1: `<div class="auth-step visible" id="as-1">
    <div style="font-family:var(--syne);font-size:14px;font-weight:700;color:var(--teal);margin-bottom:2px">ShramSetu</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:18px">Worker Registry · Login</div>
    <label class="form-label">Mobile number</label>
    <input class="form-input" value="+91 98765 43210"/>
    <button class="btn-primary" onclick="window.authGo(2)">Get OTP →</button>
    <div class="hint">No email · No password · SMS only</div>
  </div>`,
  2: `<div class="auth-step visible" id="as-2">
    <div style="font-size:13px;font-weight:500;color:var(--text);margin-bottom:4px">OTP sent in Hindi</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:16px">To +91 98765 43210 · Expires in 5 min</div>
    <div class="otp-row">
      <input class="otp-box otp-filled" maxlength="1" value="4"/>
      <input class="otp-box otp-filled" maxlength="1" value="7"/>
      <input class="otp-box otp-filled" maxlength="1" value="2"/>
      <input class="otp-box otp-filled" maxlength="1" value="9"/>
      <input class="otp-box otp-filled" maxlength="1" value="0"/>
      <input class="otp-box otp-filled" maxlength="1" value="1"/>
    </div>
    <button class="btn-primary" onclick="window.authGo(3)">Verify OTP →</button>
    <div class="hint">Rate limited · 3/hr · Lock after 5 fails</div>
  </div>`,
  3: `<div class="auth-step visible" id="as-3">
    <div style="font-size:13px;font-weight:500;margin-bottom:4px">Choose 2nd factor</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:14px">Select one method</div>
    <div class="mfa-grid">
      <div class="mfa-btn sel" onclick="document.querySelectorAll('.mfa-btn').forEach(b=>b.classList.remove('sel'));this.classList.add('sel')"><span class="mfa-icon">🤳</span><span class="mfa-label">Face scan</span></div>
      <div class="mfa-btn" onclick="document.querySelectorAll('.mfa-btn').forEach(b=>b.classList.remove('sel'));this.classList.add('sel')"><span class="mfa-icon">🔢</span><span class="mfa-label">6-digit PIN</span></div>
      <div class="mfa-btn" onclick="document.querySelectorAll('.mfa-btn').forEach(b=>b.classList.remove('sel'));this.classList.add('sel')"><span class="mfa-icon">🪪</span><span class="mfa-label">Aadhaar OTP</span></div>
      <div class="mfa-btn" onclick="document.querySelectorAll('.mfa-btn').forEach(b=>b.classList.remove('sel'));this.classList.add('sel')"><span class="mfa-icon">👮</span><span class="mfa-label">Officer verify</span></div>
    </div>
    <button class="btn-primary" onclick="window.authGo(4)">Confirm identity →</button>
  </div>`,
  4: `<div class="auth-step visible" id="as-4">
    <div style="text-align:center;padding:10px 0">
      <div style="font-size:42px;margin-bottom:10px">✅</div>
      <div style="font-family:var(--syne);font-size:15px;font-weight:700;color:var(--teal)">Authenticated</div>
      <div style="font-size:11px;color:var(--text2);margin-top:4px">Session: 30 minutes</div>
      <div style="font-size:10px;color:var(--text3);margin-top:3px;line-height:1.7">JWT issued · Device bound<br>Geo-logged · AES-256 session</div>
      <div style="height:14px"></div>
      <button class="btn-sm btn-sm-teal" onclick="window.authGo(1)">Replay demo</button>
    </div>
  </div>`
};

export function initAuth() {
  renderAuthStep(1);

  const infoPanel = document.getElementById('auth-info-panel');
  if (infoPanel) infoPanel.innerHTML = `
    <div class="card" style="margin-bottom:14px">
      <div class="card-title">Why no email required?</div>
      <div class="alert alert-info"><div class="alert-body" style="line-height:1.7">
        <strong>65%+ of India's informal workers</strong> have no email account. Phone-first auth is the only viable path at population scale.<br/><br/>
        SMS OTP + face scan = two-factor security without requiring email literacy.
      </div></div>
    </div>
    <div class="card">
      <div class="card-title">Session security</div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">JWT access token: 30 min</div><div class="sec-desc">Short expiry reduces stolen-token risk window</div></div></div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">Refresh token: 7 days, rotating</div><div class="sec-desc">Each use generates new refresh; old one invalidated</div></div></div>
      <div class="sec-item"><div class="sec-dot"></div><div><div class="sec-name">Device-bound session</div><div class="sec-desc">Token tied to device fingerprint; transfer blocked</div></div></div>
      <div class="sec-item"><div class="sec-dot warn"></div><div><div class="sec-name">Bcrypt PIN storage</div><div class="sec-desc">PIN never stored plaintext — always hashed</div></div></div>
    </div>`;

  window.authGo = (n) => {
    authStep = n;
    renderAuthStep(n);
    const dots = document.querySelectorAll('#auth-dots .sdot');
    dots.forEach((d, i) => {
      d.classList.remove('done', 'active');
      if (i < n - 1) d.classList.add('done');
      else if (i === n - 1) d.classList.add('active');
    });
  };
}

function renderAuthStep(n) {
  const container = document.getElementById('auth-steps-container');
  if (container) container.innerHTML = AUTH_STEPS[n] || '';
}