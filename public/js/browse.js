/**
 * Browse Items Page Controller
 * Supports query URL synchronization, filtering by category/zone/type, and keyword search.
 */
import { api } from './api.js';
import { initApp, openClaimModal, createItemCardElement } from './common.js';

let queryParams = {};

async function init() {
  await initApp();

  // Read initial URL params
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q') || '';
  const type = urlParams.get('type') || 'all';
  const category = urlParams.get('category') || 'all';
  const zone = urlParams.get('zone') || 'all';

  document.getElementById('filterSearch').value = q;
  document.getElementById('filterType').value = type;
  document.getElementById('filterCategory').value = category;
  document.getElementById('filterZone').value = zone;

  queryParams = { q, type, category, zone };

  // Form submit
  const form = document.getElementById('filterForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    queryParams.q = document.getElementById('filterSearch').value.trim();
    queryParams.type = document.getElementById('filterType').value;
    queryParams.category = document.getElementById('filterCategory').value;
    queryParams.zone = document.getElementById('filterZone').value;

    syncUrlParams();
    fetchAndRender();
  });

  // Reset button
  document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
    form.reset();
    queryParams = { q: '', type: 'all', category: 'all', zone: 'all' };
    syncUrlParams();
    fetchAndRender();
  });

  document.getElementById('emptyClearBtn')?.addEventListener('click', () => {
    form.reset();
    queryParams = { q: '', type: 'all', category: 'all', zone: 'all' };
    syncUrlParams();
    fetchAndRender();
  });

  await fetchAndRender();
}

function syncUrlParams() {
  const search = new URLSearchParams();
  if (queryParams.q) search.set('q', queryParams.q);
  if (queryParams.type && queryParams.type !== 'all') search.set('type', queryParams.type);
  if (queryParams.category && queryParams.category !== 'all') search.set('category', queryParams.category);
  if (queryParams.zone && queryParams.zone !== 'all') search.set('zone', queryParams.zone);

  const newUrl = `${window.location.pathname}${search.toString() ? '?' + search.toString() : ''}`;
  window.history.replaceState({}, '', newUrl);
}

async function fetchAndRender() {
  const loading = document.getElementById('browseLoading');
  const grid = document.getElementById('browseGrid');
  const empty = document.getElementById('browseEmpty');
  const counter = document.getElementById('resultsCounter');

  loading.style.display = 'block';
  grid.style.display = 'none';
  empty.style.display = 'none';

  try {
    const res = await api.getItems(queryParams);
    const items = res.items || [];
    loading.style.display = 'none';

    counter.textContent = `Showing ${items.length} ${items.length === 1 ? 'item' : 'items'} found`;

    grid.innerHTML = '';
    if (items.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      grid.style.display = 'grid';

      items.forEach((item) => {
        const card = createItemCardElement(item, (targetItem) => openClaimModal(targetItem));
        grid.appendChild(card);
      });
    }
  } catch (err) {
    loading.innerHTML = `<p style="color: var(--error);">Failed to load catalog: ${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', init);

