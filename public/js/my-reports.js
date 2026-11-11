/**
 * My Reports Page Controller
 * Protected page: allows editing, resolving, deleting own items.
 */
import { api } from './api.js';
import { initApp, openReportModal, timeAgo } from './common.js';

let currentUser = null;
let myItems = [];
let activeTab = 'all';

async function init() {
  currentUser = await initApp({ requireLogin: true });
  if (!currentUser) return;

  document.getElementById('newReportBtn')?.addEventListener('click', () => openReportModal('lost'));
  document.getElementById('emptyCreateReportBtn')?.addEventListener('click', () => openReportModal('lost'));

  // Tab listeners
  const tabs = document.querySelectorAll('.report-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      renderReports();
    });
  });

  // Setup edit modal
  setupEditModal();

  await loadReports();
}

async function loadReports() {
  const loading = document.getElementById('reportsLoading');

  try {
    const res = await api.getItems({ ownerId: currentUser.id });
    myItems = res.items || [];
    loading.style.display = 'none';

    renderReports();
  } catch (err) {
    loading.innerHTML = `<p style="color: var(--error);">Error loading reports: ${err.message}</p>`;
  }
}

function renderReports() {
  const list = document.getElementById('reportsList');
  const empty = document.getElementById('reportsEmpty');

  const filtered = myItems.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'resolved') return item.status === 'resolved';
    if (activeTab === 'active') return item.status !== 'resolved';
    return true;
  });

  list.innerHTML = '';

  if (filtered.length === 0) {
    list.style.display = 'none';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    list.style.display = 'flex';

    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.padding = '1.25rem';

      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.justifyContent = 'space-between';
      topRow.style.alignItems = 'flex-start';
      topRow.style.flexWrap = 'wrap';
      topRow.style.gap = '0.5rem';

      const leftCol = document.createElement('div');
      const badgeRow = document.createElement('div');
      badgeRow.style.display = 'flex';
      badgeRow.style.gap = '0.375rem';
      badgeRow.style.marginBottom = '0.25rem';

      const typeBadge = document.createElement('span');
      typeBadge.className = `badge ${item.type === 'found' ? 'badge-found' : 'badge-lost'}`;
      typeBadge.textContent = item.type === 'found' ? 'FOUND' : 'LOST';
      badgeRow.appendChild(typeBadge);

      const statusBadge = document.createElement('span');
      statusBadge.className = `badge badge-${item.status || 'active'}`;
      statusBadge.textContent = item.status === 'resolved' ? 'Resolved' : item.status === 'claimed' ? 'Claimed' : 'Active';
      badgeRow.appendChild(statusBadge);

      leftCol.appendChild(badgeRow);

      const titleH3 = document.createElement('h3');
      titleH3.style.fontSize = '1.125rem';
      titleH3.textContent = item.title;
      leftCol.appendChild(titleH3);

      const locP = document.createElement('p');
      locP.style.fontSize = '0.75rem';
      locP.style.color = 'var(--on-surface-variant)';
      locP.textContent = `${item.location} • ${item.category} • Logged ${timeAgo(item.createdAt)}`;
      leftCol.appendChild(locP);

      topRow.appendChild(leftCol);
      card.appendChild(topRow);

      if (item.description) {
        const descP = document.createElement('p');
        descP.style.fontSize = '0.8125rem';
        descP.style.color = 'var(--on-surface-variant)';
        descP.style.margin = '0.75rem 0';
        descP.textContent = item.description;
        card.appendChild(descP);
      }

      // Actions row
      const actionsRow = document.createElement('div');
      actionsRow.style.display = 'flex';
      actionsRow.style.justifyContent = 'flex-end';
      actionsRow.style.gap = '0.5rem';
      actionsRow.style.paddingTop = '0.75rem';
      actionsRow.style.marginTop = '0.75rem';
      actionsRow.style.borderTop = '1px solid var(--outline-variant)';

      const matchesBtn = document.createElement('a');
      matchesBtn.href = `/matches.html?id=${encodeURIComponent(item.id)}`;
      matchesBtn.className = 'btn btn-outline btn-sm';
      matchesBtn.textContent = 'Smart Matches';
      actionsRow.appendChild(matchesBtn);

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary btn-sm';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => openEditModal(item));
      actionsRow.appendChild(editBtn);

      const toggleStatusBtn = document.createElement('button');
      toggleStatusBtn.className = 'btn btn-secondary btn-sm';
      toggleStatusBtn.textContent = item.status === 'resolved' ? 'Mark Active' : 'Mark Resolved';
      toggleStatusBtn.addEventListener('click', async () => {
        const newStatus = item.status === 'resolved' ? 'active' : 'resolved';
        try {
          await api.updateItem(item.id, { status: newStatus });
          await loadReports();
        } catch (err) {
          alert('Failed to update status: ' + err.message);
        }
      });
      actionsRow.appendChild(toggleStatusBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger btn-sm';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this report? Any associated claims will also be deleted.')) {
          try {
            await api.deleteItem(item.id);
            await loadReports();
          } catch (err) {
            alert('Failed to delete report: ' + err.message);
          }
        }
      });
      actionsRow.appendChild(deleteBtn);

      card.appendChild(actionsRow);
      list.appendChild(card);
    });
  }
}

function setupEditModal() {
  const modal = document.getElementById('editItemModal');
  const closeBtn = document.getElementById('closeEditModalBtn');
  const cancelBtn = document.getElementById('cancelEditModalBtn');
  const form = document.getElementById('editItemForm');

  const closeModal = () => modal.classList.remove('open');
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editItemId').value;
    const title = document.getElementById('editTitle').value.trim();
    const location = document.getElementById('editLocation').value.trim();
    const description = document.getElementById('editDesc').value.trim();

    try {
      await api.updateItem(id, { title, location, description });
      closeModal();
      await loadReports();
    } catch (err) {
      alert('Failed to save changes: ' + err.message);
    }
  });
}

function openEditModal(item) {
  const modal = document.getElementById('editItemModal');
  document.getElementById('editItemId').value = item.id;
  document.getElementById('editTitle').value = item.title;
  document.getElementById('editLocation').value = item.location;
  document.getElementById('editDesc').value = item.description || '';
  modal.classList.add('open');
}

document.addEventListener('DOMContentLoaded', init);
