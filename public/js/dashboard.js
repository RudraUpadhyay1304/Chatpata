/**
 * Dashboard Page Controller
 * Protected page: loads real stats from /api/stats and items reported by user.
 */
import { api } from './api.js';
import { initApp, openReportModal, createItemCardElement } from './common.js';

async function init() {
  const user = await initApp({ requireLogin: true });
  if (!user) return;

  // Set user texts safely with textContent
  document.getElementById('welcomeHeading').textContent = `Welcome back, ${user.displayName || user.username}!`;
  document.getElementById('userSubtext').textContent = user.department
    ? `Campus Member • ${user.department}`
    : `Campus Member @${user.username}`;
  document.getElementById('sideName').textContent = user.displayName || user.username;
  document.getElementById('sideUsername').textContent = `@${user.username}`;
  document.getElementById('sideAvatar').textContent = (user.username.substring(0, 2)).toUpperCase();

  // Quick Action Buttons
  document.getElementById('dashReportLostBtn')?.addEventListener('click', () => openReportModal('lost'));
  document.getElementById('dashReportFoundBtn')?.addEventListener('click', () => openReportModal('found'));
  document.getElementById('emptyReportBtn')?.addEventListener('click', () => openReportModal('lost'));

  // Load real telemetry stats
  await loadStats();

  // Load user's recent reports
  await loadMyReports(user.id);
}

async function loadStats() {
  try {
    const stats = await api.getStats();
    document.getElementById('statCatalog').textContent = stats.totalItems || 0;
    document.getElementById('statLost').textContent = stats.lostItems || 0;
    document.getElementById('statFound').textContent = stats.foundItems || 0;
    document.getElementById('statClaims').textContent = stats.user?.myClaims || 0;

    if (stats.user?.myReports > 0) {
      const badge = document.getElementById('myReportsBadge');
      badge.textContent = stats.user.myReports;
      badge.style.display = 'inline-block';
    }
    if (stats.user?.myClaims > 0) {
      const badge = document.getElementById('myClaimsBadge');
      badge.textContent = stats.user.myClaims;
      badge.style.display = 'inline-block';
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

async function loadMyReports(userId) {
  const grid = document.getElementById('myReportsGrid');
  const empty = document.getElementById('noReportsEmpty');

  try {
    const res = await api.getItems({ ownerId: userId, limit: 6 });
    const items = res.items || [];

    grid.innerHTML = '';
    if (items.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      grid.style.display = 'grid';

      items.forEach((item) => {
        const card = createItemCardElement(item);
        grid.appendChild(card);
      });
    }
  } catch (err) {
    console.error('Failed to load user reports:', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
