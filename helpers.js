// src/utils/helpers.js
export function animateCounter(id, target, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString('en-IN');
    if (current >= target) clearInterval(timer);
  }, 16);
}

export function renderWorkerRows(workers, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = workers.map(w => `
    <div class="worker-row">
      <div class="avatar ${w.avClass}">${w.av}</div>
      <div style="flex:1">
        <div class="wname">${w.name}</div>
        <div class="wmeta">${w.sector} · ${w.district}</div>
      </div>
      <span class="badge ${w.status==='Verified'?'badge-teal':w.status==='Pending'?'badge-amber':'badge-coral'}">${w.status}</span>
    </div>`).join('');
}

export function renderTable(workers) {
  const tbody = document.getElementById('workers-tbody');
  if (!tbody) return;
  tbody.innerHTML = workers.map(w => {
    const rc = w.risk > 0.6 ? 'risk-h' : w.risk > 0.3 ? 'risk-m' : 'risk-l';
    const bc = w.status==='Verified'?'badge-teal':w.status==='Pending'?'badge-amber':'badge-coral';
    return `<tr>
      <td style="font-weight:500;color:var(--teal)">${w.id}</td>
      <td>${w.name}</td><td>${w.sector}</td><td>${w.district}</td><td>${w.origin}</td>
      <td><span class="badge ${bc}">${w.status}</span></td>
      <td class="${rc}">${w.risk.toFixed(2)}</td>
    </tr>`;
  }).join('');
}

export function renderSectorBars(sectors, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = sectors.map(s => `
    <div class="bar-row">
      <div class="bar-label">${s.label}</div>
      <div class="bar-track"><div class="bar-fill" style="background:${s.color}" data-w="${s.val}"></div></div>
      <div class="bar-val">${s.val}k</div>
    </div>`).join('');
  setTimeout(() => {
    el.querySelectorAll('.bar-fill[data-w]').forEach(b => b.style.width = b.dataset.w + '%');
  }, 300);
}