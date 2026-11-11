/**
 * Common Shared Utilities, Components & Auth Guards
 * Renders global navbar, footer, modals, and client-side image resizing via Canvas.
 */
import { api } from './api.js';

let currentUser = null;

/**
 * Format date into relative human friendly format
 */
export function timeAgo(dateInput) {
  if (!dateInput) return 'recently';
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

/**
 * Client-side Canvas Image Resizer
 * Resizes image file to max 800px width/height at ~0.7 JPEG quality.
 * Ensures data URL is under 300 KB before uploading to MongoDB.
 */
export function resizeImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to process image.'));
      img.onload = () => {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

        // Calculate size in KB
        const approxBytes = Math.ceil((dataUrl.length * 3) / 4);
        if (approxBytes > 300 * 1024) {
          return reject(new Error('Compressed image is larger than 300 KB limit. Please choose a smaller image.'));
        }

        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Creates an item card DOM element safely using textContent for all user strings
 */
export function createItemCardElement(item, onClaimClick) {
  const card = document.createElement('div');
  card.className = 'item-card';

  // Image wrapper
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'item-card-image-wrapper';

  const img = document.createElement('img');
  img.className = 'item-card-image';
  img.alt = item.title || 'Campus item';
  img.src = item.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%23eceef3%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23737686%22%20font-size%3D%2214%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%20Uploaded%3C%2Ftext%3E%3C%2Fsvg%3E';
  imgWrapper.appendChild(img);

  // Badges container
  const badges = document.createElement('div');
  badges.className = 'item-card-badges';

  const typeBadge = document.createElement('span');
  typeBadge.className = `badge ${item.type === 'found' ? 'badge-found' : 'badge-lost'}`;
  typeBadge.textContent = item.type === 'found' ? 'FOUND' : 'LOST';
  badges.appendChild(typeBadge);

  if (item.status && item.status !== 'active') {
    const statusBadge = document.createElement('span');
    statusBadge.className = `badge badge-${item.status}`;
    statusBadge.textContent = item.status === 'claimed' ? 'Claimed' : 'Resolved';
    badges.appendChild(statusBadge);
  }

  imgWrapper.appendChild(badges);
  card.appendChild(imgWrapper);

  // Body container
  const body = document.createElement('div');
  body.className = 'item-card-body';

  const topMeta = document.createElement('div');

  const titleLink = document.createElement('a');
  titleLink.href = `/item.html?id=${encodeURIComponent(item.id)}`;
  const titleH3 = document.createElement('h3');
  titleH3.className = 'item-card-title';
  titleH3.textContent = item.title;
  titleLink.appendChild(titleH3);
  topMeta.appendChild(titleLink);

  const locP = document.createElement('p');
  locP.className = 'item-card-meta';
  const locIcon = document.createElement('span');
  locIcon.className = 'material-symbols-outlined';
  locIcon.style.fontSize = '14px';
  locIcon.textContent = 'location_on';
  locP.appendChild(locIcon);

  const locText = document.createElement('span');
  locText.textContent = `${item.location} • ${item.category}`;
  locP.appendChild(locText);
  topMeta.appendChild(locP);

  const timeP = document.createElement('p');
  timeP.className = 'item-card-meta';
  timeP.style.color = 'var(--outline)';
  timeP.textContent = `Logged ${timeAgo(item.createdAt)}`;
  topMeta.appendChild(timeP);

  body.appendChild(topMeta);

  // Footer button
  const footer = document.createElement('div');
  footer.className = 'item-card-footer';

  if (item.type === 'found' && onClaimClick && item.status === 'active') {
    const claimBtn = document.createElement('button');
    claimBtn.className = 'btn btn-primary btn-sm btn-full';
    claimBtn.textContent = 'View & Claim';
    claimBtn.addEventListener('click', () => onClaimClick(item));
    footer.appendChild(claimBtn);
  } else {
    const viewBtn = document.createElement('a');
    viewBtn.href = `/item.html?id=${encodeURIComponent(item.id)}`;
    viewBtn.className = 'btn btn-secondary btn-sm btn-full';
    viewBtn.textContent = 'View Details';
    footer.appendChild(viewBtn);
  }

  body.appendChild(footer);
  card.appendChild(body);

  return card;
}

/**
 * Initializes Global Navigation & User Session
 */
export async function initApp(options = {}) {
  const { requireLogin = false } = options;

  try {
    const res = await api.getMe();
    currentUser = res.user;
  } catch (err) {
    currentUser = null;
    if (requireLogin) {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return null;
    }
  }

  renderNavbar();
  renderFooter();
  setupGlobalModals();

  return currentUser;
}

/**
 * Render Header & Navbar
 */
function renderNavbar() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const currentPath = window.location.pathname;

  let authHtml = '';
  if (currentUser) {
    const initials = currentUser.username.substring(0, 2).toUpperCase();
    authHtml = `
      <div class="user-menu-wrapper">
        <button class="user-pill-btn" id="userMenuBtn" aria-expanded="false">
          <span class="avatar-badge">${initials}</span>
          <span style="max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(currentUser.displayName || currentUser.username)}</span>
          <span class="material-symbols-outlined" style="font-size: 16px;">expand_more</span>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown-header">
            <p style="font-weight: 700; font-size: 0.8125rem;">${escapeHtml(currentUser.displayName || currentUser.username)}</p>
            <p style="font-size: 0.6875rem; color: var(--outline);">@${escapeHtml(currentUser.username)}</p>
          </div>
          <a href="/dashboard.html" class="user-dropdown-item">
            <span class="material-symbols-outlined">dashboard</span> Dashboard
          </a>
          <a href="/my-reports.html" class="user-dropdown-item">
            <span class="material-symbols-outlined">inventory_2</span> My Reports
          </a>
          <a href="/my-claims.html" class="user-dropdown-item">
            <span class="material-symbols-outlined">verified</span> My Claims
          </a>
          <a href="/profile.html" class="user-dropdown-item">
            <span class="material-symbols-outlined">person</span> Profile
          </a>
          <hr style="border: none; border-top: 1px solid var(--outline-variant); margin: 0.25rem 0;">
          <button id="logoutBtn" class="user-dropdown-item" style="color: var(--error);">
            <span class="material-symbols-outlined">logout</span> Log Out
          </button>
        </div>
      </div>
    `;
  } else {
    authHtml = `
      <a href="/login.html" class="nav-link">Sign In</a>
      <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }

  header.innerHTML = `
    <div class="container header-container">
      <a href="/" class="brand-logo">
        <span class="brand-icon">
          <span class="material-symbols-outlined fill" style="font-size: 18px;">auto_awesome</span>
        </span>
        <span>FindIt AI</span>
      </a>

      <form class="header-search" id="globalSearchForm">
        <span class="material-symbols-outlined">search</span>
        <input type="text" id="globalSearchInput" placeholder="Search lost & found articles..." />
      </form>

      <div class="nav-actions">
        <a href="/browse.html" class="nav-link ${currentPath.includes('browse') ? 'active' : ''}">Browse</a>
        ${currentUser ? `<a href="/dashboard.html" class="nav-link ${currentPath.includes('dashboard') ? 'active' : ''}">Dashboard</a>` : ''}
        <button class="btn btn-primary btn-sm" id="globalReportBtn">
          <span class="material-symbols-outlined" style="font-size: 16px;">add_circle</span>
          <span>Report Item</span>
        </button>
        ${authHtml}
        <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Toggle menu">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
    </div>
    <div class="mobile-nav-drawer" id="mobileNavDrawer">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <a href="/browse.html" class="nav-link">Browse Items</a>
        ${currentUser ? `
          <a href="/dashboard.html" class="nav-link">Student Dashboard</a>
          <a href="/my-reports.html" class="nav-link">My Reports</a>
          <a href="/my-claims.html" class="nav-link">My Claims</a>
          <a href="/profile.html" class="nav-link">Profile Settings</a>
        ` : `
          <a href="/login.html" class="nav-link">Sign In</a>
          <a href="/register.html" class="nav-link">Register Account</a>
        `}
      </div>
    </div>
  `;

  // Attach search listener
  const searchForm = document.getElementById('globalSearchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('globalSearchInput')?.value.trim();
      window.location.href = `/browse.html${query ? '?q=' + encodeURIComponent(query) : ''}`;
    });
  }

  // Attach dropdown listeners
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    document.addEventListener('click', () => {
      userDropdown.classList.remove('show');
    });
  }

  // Attach mobile toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('show');
    });
  }

  // Attach logout listener
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await api.logout();
        window.location.href = '/login.html';
      } catch (err) {
        alert('Logout failed: ' + err.message);
      }
    });
  }

  // Global report button
  const reportBtn = document.getElementById('globalReportBtn');
  if (reportBtn) {
    reportBtn.addEventListener('click', () => {
      if (!currentUser) {
        window.location.href = '/login.html?redirect=' + encodeURIComponent('/report.html');
      } else {
        openReportModal();
      }
    });
  }
}

/**
 * Render Global Footer
 */
function renderFooter() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container footer-container">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span class="brand-icon" style="width: 22px; height: 22px;">
          <span class="material-symbols-outlined fill" style="font-size: 14px;">auto_awesome</span>
        </span>
        <span style="font-weight: 700; color: var(--on-surface);">FindIt AI</span>
        <span>• Campus Lost & Found College Project</span>
      </div>
      <div class="footer-links">
        <a href="/browse.html">Browse Items</a>
        <a href="/report.html?type=lost">Report Lost</a>
        <a href="/report.html?type=found">Report Found</a>
        <a href="/dashboard.html">Dashboard</a>
      </div>
    </div>
  `;
}

/**
 * Global Modals: Quick Report & Claim
 */
function setupGlobalModals() {
  if (document.getElementById('globalReportModal')) return;

  const modalRoot = document.createElement('div');
  modalRoot.innerHTML = `
    <!-- REPORT MODAL -->
    <div class="modal-backdrop" id="globalReportModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="material-symbols-outlined" style="color: var(--primary);">add_circle</span>
            <h3 class="font-headline" style="font-size: 1.125rem;">Report Campus Item</h3>
          </div>
          <button class="modal-close" id="closeReportModalBtn">&times;</button>
        </div>
        <div id="reportModalAlert" style="display: none;" class="alert alert-error"></div>
        <form id="globalReportForm">
          <div class="form-group">
            <label class="form-label">Report Type *</label>
            <div style="display: flex; gap: 0.5rem;">
              <label style="flex: 1; border: 1px solid var(--outline-variant); border-radius: var(--radius-md); padding: 0.5rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="radio" name="reportType" value="lost" checked />
                <span style="font-weight: 600; color: #be123c;">I Lost Something</span>
              </label>
              <label style="flex: 1; border: 1px solid var(--outline-variant); border-radius: var(--radius-md); padding: 0.5rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="radio" name="reportType" value="found" />
                <span style="font-weight: 600; color: #047857;">I Found Something</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="reportTitle">Item Title *</label>
            <input type="text" id="reportTitle" class="form-input" required placeholder="e.g. AirPods Pro White Case, Hydro Flask" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label" for="reportCategory">Category *</label>
              <select id="reportCategory" class="form-select" required>
                <option value="Electronics & Audio">Electronics & Audio</option>
                <option value="Student ID & Cards">Student ID & Cards</option>
                <option value="Water Bottles & Tumblers">Water Bottles & Tumblers</option>
                <option value="Wallets & Keys">Wallets & Keys</option>
                <option value="Clothing & Backpacks">Clothing & Backpacks</option>
                <option value="Books & Notebooks">Books & Notebooks</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="reportZone">Campus Zone *</label>
              <select id="reportZone" class="form-select" required>
                <option value="library">Main University Library</option>
                <option value="student-union">Student Union Center</option>
                <option value="sports">Rec Sports Complex</option>
                <option value="science">Science & Engineering</option>
                <option value="dining">Dining Commons</option>
                <option value="east-quad">East Quad Pavilion</option>
                <option value="other">Other / Campus Grounds</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="reportLocation">Specific Location Description *</label>
            <input type="text" id="reportLocation" class="form-input" required placeholder="e.g. 2nd Floor Quiet Study Desk #24" />
          </div>

          <div class="form-group">
            <label class="form-label" for="reportDesc">Item Description</label>
            <textarea id="reportDesc" rows="3" class="form-textarea" placeholder="Color, brand, stickers, scratches, or distinguishing features..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Photo Upload (Optional, auto-resized to ≤ 300 KB)</label>
            <input type="file" id="reportImageInput" accept="image/*" class="form-input" style="padding: 0.35rem;" />
            <div id="reportImagePreviewContainer" style="margin-top: 0.5rem; display: none;">
              <img id="reportImagePreview" src="" alt="Preview" style="max-height: 120px; border-radius: var(--radius-md); border: 1px solid var(--outline-variant);" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid var(--outline-variant); padding-top: 0.75rem;">
            <button type="button" class="btn btn-secondary" id="cancelReportModalBtn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="submitReportModalBtn">Submit Report</button>
          </div>
        </form>
      </div>
    </div>

    <!-- CLAIM MODAL -->
    <div class="modal-backdrop" id="globalClaimModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="material-symbols-outlined" style="color: var(--primary);">verified</span>
            <h3 class="font-headline" style="font-size: 1.125rem;">Verify Ownership & Claim</h3>
          </div>
          <button class="modal-close" id="closeClaimModalBtn">&times;</button>
        </div>
        <div id="claimModalAlert" style="display: none;" class="alert alert-error"></div>
        <div id="claimTargetSummary" style="background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: var(--radius-md); padding: 0.75rem; margin-bottom: 1rem;">
          <h4 id="claimItemTitle" style="font-size: 0.875rem; font-weight: 700;">Item Title</h4>
          <p id="claimItemLocation" style="font-size: 0.75rem; color: var(--on-surface-variant);">Location</p>
        </div>
        <form id="globalClaimForm">
          <input type="hidden" id="claimTargetItemId" />
          <div class="form-group">
            <label class="form-label" for="claimProof">Proof of Ownership *</label>
            <textarea id="claimProof" rows="3" class="form-textarea" required placeholder="Describe unique features only the owner would know (passcode, engraving, contents, serial number)..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="claimContact">Pickup / Contact Note (Optional)</label>
            <input type="text" id="claimContact" class="form-input" placeholder="e.g. Available for verification today after 2pm" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid var(--outline-variant); padding-top: 0.75rem;">
            <button type="button" class="btn btn-secondary" id="cancelClaimModalBtn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="submitClaimModalBtn">Submit Claim</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modalRoot);

  // Setup modal handlers
  const reportModal = document.getElementById('globalReportModal');
  const closeReportBtn = document.getElementById('closeReportModalBtn');
  const cancelReportBtn = document.getElementById('cancelReportModalBtn');
  const reportForm = document.getElementById('globalReportForm');
  const imageInput = document.getElementById('reportImageInput');
  const imagePreview = document.getElementById('reportImagePreview');
  const previewContainer = document.getElementById('reportImagePreviewContainer');
  let currentResizedDataUrl = '';

  if (imageInput) {
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          currentResizedDataUrl = await resizeImageToDataUrl(file);
          imagePreview.src = currentResizedDataUrl;
          previewContainer.style.display = 'block';
        } catch (err) {
          alert(err.message);
          imageInput.value = '';
          previewContainer.style.display = 'none';
          currentResizedDataUrl = '';
        }
      }
    });
  }

  const closeReport = () => {
    reportModal.classList.remove('open');
    reportForm.reset();
    currentResizedDataUrl = '';
    previewContainer.style.display = 'none';
    document.getElementById('reportModalAlert').style.display = 'none';
  };

  closeReportBtn.addEventListener('click', closeReport);
  cancelReportBtn.addEventListener('click', closeReport);

  reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('reportModalAlert');
    alertBox.style.display = 'none';

    const submitBtn = document.getElementById('submitReportModalBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const type = document.querySelector('input[name="reportType"]:checked')?.value || 'lost';
    const title = document.getElementById('reportTitle').value.trim();
    const category = document.getElementById('reportCategory').value;
    const zone = document.getElementById('reportZone').value;
    const location = document.getElementById('reportLocation').value.trim();
    const description = document.getElementById('reportDesc').value.trim();

    try {
      const res = await api.createItem({
        type,
        title,
        category,
        zone,
        location,
        description,
        image: currentResizedDataUrl
      });
      closeReport();
      // Redirect to smart matches for this newly submitted item
      window.location.href = `/matches.html?id=${encodeURIComponent(res.item.id)}`;
    } catch (err) {
      alertBox.textContent = err.message;
      alertBox.style.display = 'flex';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
    }
  });

  // Setup claim modal handlers
  const claimModal = document.getElementById('globalClaimModal');
  const closeClaimBtn = document.getElementById('closeClaimModalBtn');
  const cancelClaimBtn = document.getElementById('cancelClaimModalBtn');
  const claimForm = document.getElementById('globalClaimForm');

  const closeClaim = () => {
    claimModal.classList.remove('open');
    claimForm.reset();
    document.getElementById('claimModalAlert').style.display = 'none';
  };

  closeClaimBtn.addEventListener('click', closeClaim);
  cancelClaimBtn.addEventListener('click', closeClaim);

  claimForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('claimModalAlert');
    alertBox.style.display = 'none';

    const submitBtn = document.getElementById('submitClaimModalBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const itemId = document.getElementById('claimTargetItemId').value;
    const proof = document.getElementById('claimProof').value.trim();
    const contact = document.getElementById('claimContact').value.trim();

    try {
      await api.createClaim({
        itemId,
        proofDescription: contact ? `${proof} | Note: ${contact}` : proof
      });
      closeClaim();
      window.location.href = '/my-claims.html';
    } catch (err) {
      alertBox.textContent = err.message;
      alertBox.style.display = 'flex';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Claim';
    }
  });
}

export function openReportModal(defaultType = 'lost') {
  if (!currentUser) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent('/report.html');
    return;
  }
  const modal = document.getElementById('globalReportModal');
  if (!modal) return;
  const radio = document.querySelector(`input[name="reportType"][value="${defaultType}"]`);
  if (radio) radio.checked = true;
  modal.classList.add('open');
}

export function openClaimModal(item) {
  if (!currentUser) {
    window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }
  const modal = document.getElementById('globalClaimModal');
  if (!modal) return;

  document.getElementById('claimTargetItemId').value = item.id;
  document.getElementById('claimItemTitle').textContent = item.title;
  document.getElementById('claimItemLocation').textContent = `${item.location} (${item.category})`;

  modal.classList.add('open');
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}
