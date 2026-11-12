/**
 * Profile Page Controller
 * Protected page: loads user details, updates profile attributes, and handles logout.
 */
import { api } from './api.js';
import { initApp } from './common.js';

let currentUser = null;

async function init() {
  currentUser = await initApp({ requireLogin: true });
  if (!currentUser) return;

  // Populate user data safely with textContent and input values
  document.getElementById('profileDisplayName').textContent = currentUser.displayName || currentUser.username;
  document.getElementById('profileUsername').textContent = `@${currentUser.username}`;
  document.getElementById('profileAvatar').textContent = currentUser.username.substring(0, 2).toUpperCase();

  document.getElementById('editDisplayName').value = currentUser.displayName || '';
  document.getElementById('editContact').value = currentUser.contact || '';
  document.getElementById('editDepartment').value = currentUser.department || '';

  // Logout button
  document.getElementById('profileLogoutBtn')?.addEventListener('click', async () => {
    try {
      await api.logout();
      window.location.href = '/login.html';
    } catch (err) {
      alert('Logout failed: ' + err.message);
    }
  });

  // Save form
  const form = document.getElementById('profileForm');
  const alertBox = document.getElementById('profileAlert');
  const saveBtn = document.getElementById('saveProfileBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.style.display = 'none';
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const displayName = document.getElementById('editDisplayName').value.trim();
    const contact = document.getElementById('editContact').value.trim();
    const department = document.getElementById('editDepartment').value;

    try {
      const res = await api.updateProfile({ displayName, contact, department });
      currentUser = res.user;

      document.getElementById('profileDisplayName').textContent = currentUser.displayName || currentUser.username;
      alertBox.textContent = 'Profile changes saved successfully!';
      alertBox.className = 'alert alert-success';
      alertBox.style.display = 'flex';
    } catch (err) {
      alertBox.textContent = err.message || 'Failed to update profile.';
      alertBox.className = 'alert alert-error';
      alertBox.style.display = 'flex';
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  });

  await loadUserStats();
}

async function loadUserStats() {
  try {
    const stats = await api.getStats();
    document.getElementById('metricReports').textContent = stats.user?.myReports || 0;
    document.getElementById('metricClaims').textContent = stats.user?.myClaims || 0;
  } catch (err) {
    console.error('Failed to load profile metrics:', err);
  }
}

document.addEventListener('DOMContentLoaded', init);

