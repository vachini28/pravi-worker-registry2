// src/components/register.js
let step = 1;

const STEPS = {
  1: `
    <div class="step-page visible" id="sp-1">
      <div class="card-title">Phone — no email required</div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:16px;line-height:1.6">65% of informal workers have no email. We use <strong>mobile OTP only</strong> in their language.</p>
      <label class="form-label">Mobile number</label>
      <input class="form-input" id="reg-phone" placeholder="+91 98765 43210" type="tel"/>
      <label class="form-label">Language for OTP</label>
      <div class="pill-row" id="lang-pills">
        <div class="pill sel" onclick="this.classList.toggle('sel')">Hindi</div>
        <div class="pill" onclick="this.classList.toggle('sel')">Gujarati</div>
        <div class="pill" onclick="this.classList.toggle('sel')">Bengali</div>
        <div class="pill" onclick="this.classList.toggle('sel')">Tamil</div>
        <div class="pill" onclick="this.classList.toggle('sel')">Telugu</div>
        <div class="pill" onclick="this.classList.toggle('sel')">Odia</div>
      </div>
      <button class="btn-primary" onclick="window.regGo(2)">Send OTP →</button>
      <div class="hint">OTP arrives via SMS · Expires in 5 minutes</div>
    </div>`,
  2: `
    <div class="step-page visible" id="sp-2">
      <div class="card-title">Verify OTP</div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:16px">6-digit code sent to your mobile. Rate limited: 3/hr. Expires in 5 min.</p>
      <div class="otp-row">
        <input class="otp-box otp-filled" maxlength="1" value="4"/>
        <input class="otp-box otp-filled" maxlength="1" value="7"/>
        <input class="otp-box otp-filled" maxlength="1" value="2"/>
        <input class="otp-box otp-filled" maxlength="1" value="9"/>
        <input class="otp-box" maxlength="1"/>
        <input class="otp-box" maxlength="1"/>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:75%"></div></div>
      <div class="hint" style="margin-bottom:14px">Expires in 28s · <a href="#" style="color:var(--teal)">Resend</a></div>
      <button class="btn-primary" onclick="window.regGo(3)">Verify →</button>
    </div>`,
  3: `
    <div class="step-page visible" id="sp-3">
      <div class="card-title">Worker details</div>
      <div class="form-group">
        <div><label class="form-label">Full name</label><input class="form-input" placeholder="As on govt. ID"/></div>
        <div><label class="form-label">Date of birth</label><input class="form-input" type="date"/></div>
      </div>
      <div class="form-group">
        <div><label class="form-label">State of origin</label>
          <select class="form-select"><option>Bihar</option><option>Uttar Pradesh</option><option>Rajasthan</option><option>Odisha</option><option>West Bengal</option></select>
        </div>
        <div><label class="form-label">Sector</label>
          <select class="form-select"><option>Construction</option><option>Domestic Help</option><option>Factory</option><option>Agriculture</option><option>Transport</option></select>
        </div>
      </div>
      <button class="btn-primary" onclick="window.regGo(4)">Continue →</button>
    </div>`,
  4: `
    <div class="step-page visible" id="sp-4">
      <div class="card-title">Document upload</div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">Upload any one government document. Workers without documents can proceed via <strong>officer verification</strong>.</p>
      <select class="form-select"><option>Aadhaar Card</option><option>Voter ID</option><option>Labour Card</option><option>No document — officer verify</option></select>
      <div class="upload-zone" onclick="this.classList.add('active');this.querySelector('span').textContent='aadhaar_front.jpg ✓'">
        <div class="upload-icon">📄</div>
        <div style="font-size:12px;color:var(--text2)"><span>Tap to upload</span><br/><span style="color:var(--teal);font-weight:500">Browse files</span></div>
      </div>
      <div class="alert alert-info"><div class="alert-title">No document?</div><div class="alert-body">Officer physically verifies worker on-site. GPS + timestamp recorded for audit trail.</div></div>
      <button class="btn-primary" onclick="window.regGo(5)">Continue →</button>
    </div>`,
  5: `
    <div class="step-page visible" id="sp-5">
      <div class="card-title">Face capture — deduplication only</div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">Used only to prevent double-registration. Stored as an encrypted embedding — never as a raw photo.</p>
      <div class="face-zone" id="face-zone" onclick="window.captureFace()">
        <div class="face-oval" id="face-oval">😐</div>
        <div class="capture-text" id="face-text">Tap to capture face</div>
      </div>
      <div class="alert alert-info" style="margin-bottom:14px"><div class="alert-body">AI checks cosine similarity ≥ 0.80 against all district workers. Match = flagged duplicate.</div></div>
      <button class="btn-primary" onclick="window.regGo(6)">Submit registration →</button>
    </div>`,
  6: `
    <div class="step-page visible" id="sp-6">
      <div class="success-wrap">
        <div style="font-size:52px;margin-bottom:12px">✅</div>
        <div style="font-family:var(--syne);font-size:17px;font-weight:700;color:var(--text)">Worker registered</div>
        <div style="font-size:12px;color:var(--text2);margin-top:4px">Unique ID assigned · AES-256 encrypted</div>
        <div class="worker-id">SRT-2026-48291</div>
        <div style="font-size:11px;color:var(--text3)">QR code sent via SMS · Usable at any labour office nationwide</div>
        <div style="height:18px"></div>
        <button class="btn-sm btn-sm-teal" onclick="window.regGo(1)">Register another →</button>
      </div>
    </div>`
};

export function initRegister() {
  render(1);

  window.regGo = (n) => {
    step = n;
    render(n);
    for (let i = 1; i <= 6; i++) {
      const el = document.getElementById('si-' + i);
      if (!el) continue;
      el.classList.remove('done', 'active');
      if (i < n) el.classList.add('done');
      else if (i === n) el.classList.add('active');
    }
  };

  window.captureFace = () => {
    const z = document.getElementById('face-zone');
    const o = document.getElementById('face-oval');
    const t = document.getElementById('face-text');
    if (z) z.classList.add('captured');
    if (o) { o.textContent = '😊'; o.style.borderColor = 'var(--teal-mid)'; }
    if (t) t.textContent = 'Face captured — embedding generated ✓';
  };
}

function render(n) {
  const card = document.getElementById('reg-card');
  if (card) card.innerHTML = STEPS[n] || '';
}