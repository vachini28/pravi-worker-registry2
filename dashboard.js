// src/components/dashboard.js
import { WORKERS, SECTORS } from '../data/workers.js';
import { animateCounter, renderWorkerRows, renderSectorBars } from '../utils/helpers.js';

export function initDashboard() {
  animateCounter('cnt-workers', 184203, 1800);
  animateCounter('cnt-emp',      8441,  1400);
  animateCounter('cnt-fraud',      37,   800);
  animateCounter('cnt-kyc',      1209,  1200);
  renderWorkerRows(WORKERS.slice(0, 5), 'recent-workers');
  renderSectorBars(SECTORS, 'sector-bars');
}