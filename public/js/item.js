/**
 * Item Details Page Controller
 * Displays single item, handles ownership checks for edit/delete, and triggers claim modal.
 */
import { api } from './api.js';
import { initApp, openClaimModal, timeAgo } from './common.js';

let currentUser = null;
let currentItem = null;

async function init() {
  currentUser = await initApp();

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (!id) {
    document.getElementById('itemLoading').style.display = 'none';
    document.getElementById('itemNotFound').style.display = 'block';
    return;
  }

  // Share button
  document.getElementById('shareBtn')?.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      document.getElementById('shareText').textContent = 'Copied!';
      document.getElementById('shareIcon').textContent = 'check';
      setTimeout(() => {
        document.getElementById('shareText').textContent = 'Share';
        document.getElementById('shareIcon').textContent = 'share';
      }, 2000);
    }
  });

  await loadItem(id);
}

async function loadItem(id) {
  const loading = document.getElementById('itemLoading');
  const container = document.getElementById('itemContainer');
  const notFound = document.getElementById('itemNotFound');

  try {
    const res = await api.getItem(id);
    currentItem = res.item;

    loading.style.display = 'none';
    container.style.display = 'block';

    // Populate fields with textContent
    document.getElementById('detailTitle').textContent = currentItem.title;
    document.getElementById('detailCategory').textContent = currentItem.category;
    document.getElementById('detailLocation').textContent = currentItem.location;
    document.getElementById('detailZone').textContent = `Campus Zone: ${currentItem.zone}`;
    document.getElementById('detailDescription').textContent = currentItem.description || 'No additional description provided.';
    document.getElementById('detailReporter').textContent = `@${currentItem.ownerUsername || 'campus_user'}`;
    document.getElementById('detailDate').textContent = `Logged ${timeAgo(currentItem.createdAt)}`;

    const img = document.getElementById('detailImg');
    img.src = currentItem.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23eceef3%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23737686%22%20font-size%3D%2216%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%20Uploaded%3C%2Ftext%3E%3C%2Fsvg%3E';

    // Type badge
    const typeBadge = document.getElementById('typeBadgeEl');
    typeBadge.className = `badge ${currentItem.type === 'found' ? 'badge-found' : 'badge-lost'}`;
    typeBadge.textContent = currentItem.type === 'found' ? 'FOUND ITEM' : 'LOST ITEM';

    // Status badge
    const statusBadge = document.getElementById('statusBadgeEl');
    if (currentItem.status && currentItem.status !== 'active') {
      statusBadge.className = `badge badge-${currentItem.status}`;
      statusBadge.textContent = currentItem.status === 'claimed' ? 'Claimed' : 'Resolved';
      statusBadge.style.display = 'inline-flex';
    }

    renderActionButtons();
  } catch (err) {
    loading.style.display = 'none';
    notFound.style.display = 'block';
  }
}

function renderActionButtons() {
  const container = document.getElementById('actionButtonsContainer');
  container.innerHTML = '';

  const isOwner = currentUser && currentItem.ownerId === currentUser.id;

  // Smart Matches button for all items
  const matchesLink = document.createElement('a');
  matchesLink.href = `/matches.html?id=${encodeURIComponent(currentItem.id)}`;
  matchesLink.className = 'btn btn-outline';
  matchesLink.innerHTML = '<span class="material-symbols-outlined fill" style="font-size: 16px;">auto_awesome</span><span>View Smart Matches</span>';
  container.appendChild(matchesLink);

  // If item is found, active, and current user is NOT the owner -> Claim button
  if (currentItem.type === 'found' && currentItem.status === 'active' && !isOwner) {
    const claimBtn = document.createElement('button');
    claimBtn.className = 'btn btn-primary';
    claimBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">verified</span><span>Claim This Item</span>';
    claimBtn.addEventListener('click', () => openClaimModal(currentItem));
    container.appendChild(claimBtn);
  }

  // If owner -> Owner management controls
  if (isOwner) {
    // Mark resolved / active toggle
    const resolveBtn = document.createElement('button');
    resolveBtn.className = 'btn btn-found';
    resolveBtn.textContent = currentItem.status === 'resolved' ? 'Mark as Active' : 'Mark as Resolved';
    resolveBtn.addEventListener('click', async () => {
      const nextStatus = currentItem.status === 'resolved' ? 'active' : 'resolved';
      try {
        await api.updateItem(currentItem.id, { status: nextStatus });
        window.location.reload();
      } catch (err) {
        alert('Failed to update status: ' + err.message);
      }
    });
    container.appendChild(resolveBtn);

    // Delete item button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Delete Report';
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to permanently delete this report? Any associated claims will also be deleted.')) {
        try {
          await api.deleteItem(currentItem.id);
          window.location.href = '/my-reports.html';
        } catch (err) {
          alert('Failed to delete item: ' + err.message);
        }
      }
    });
    container.appendChild(deleteBtn);
  }
}

document.addEventListener('DOMContentLoaded', init);

