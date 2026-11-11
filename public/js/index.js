/**
 * Home Page Controller
 * Fetches live items, renders cards, and wires hero search.
 */
import { api } from './api.js';
import { initApp, openReportModal, openClaimModal, createItemCardElement } from './common.js';

let allItems = [];
let activeFilter = 'all';

async function init() {
  await initApp();

  // Hero search form
  const heroForm = document.getElementById('heroSearchForm');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('heroSearchInput')?.value.trim();
      const zone = document.getElementById('heroZoneSelect')?.value;
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (zone && zone !== 'all') params.set('zone', zone);
      window.location.href = `/browse.html${params.toString() ? '?' + params.toString() : ''}`;
    });
  }

  // Hero Lost / Found buttons
  document.getElementById('heroLostBtn')?.addEventListener('click', () => openReportModal('lost'));
  document.getElementById('heroFoundBtn')?.addEventListener('click', () => openReportModal('found'));
  document.getElementById('emptyStateReportBtn')?.addEventListener('click', () => openReportModal('lost'));

  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.type;
      renderFilteredItems();
    });
  });

  await loadRecentItems();
}

async function loadRecentItems() {
  const loading = document.getElementById('loadingIndicator');
  const grid = document.getElementById('itemsGrid');
  const empty = document.getElementById('emptyState');

  try {
    const res = await api.getItems({ limit: 12 });
    allItems = res.items || [];
    loading.style.display = 'none';

    renderFilteredItems();
  } catch (err) {
    loading.innerHTML = `<p style="color: var(--error);">Failed to load campus items: ${err.message}</p>`;
  }
}

function renderFilteredItems() {
  const grid = document.getElementById('itemsGrid');
  const empty = document.getElementById('emptyState');

  const filtered = allItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    grid.style.display = 'grid';

    filtered.forEach((item) => {
      const card = createItemCardElement(item, (targetItem) => openClaimModal(targetItem));
      grid.appendChild(card);
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
