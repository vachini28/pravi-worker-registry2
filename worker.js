// src/components/workers.js
import { WORKERS } from '../data/workers.js';
import { renderTable } from '../utils/helpers.js';

let all = [...WORKERS];

export function initWorkers() {
  renderTable(all);
  // expose to inline HTML onchange handlers
  window.filterWorkers = (q) => {
    const lo = q.toLowerCase();
    renderTable(all.filter(w =>
      w.name.toLowerCase().includes(lo) ||
      w.id.toLowerCase().includes(lo) ||
      w.sector.toLowerCase().includes(lo)
    ));
  };
  window.filterStatus = (s) => {
    renderTable(s ? all.filter(w => w.status === s) : all);
  };
}