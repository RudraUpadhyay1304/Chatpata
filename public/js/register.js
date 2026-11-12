/**
 * Registration Page Controller
 * Registers new user without email or student ID as specified in requirements.
 */
import { api } from './api.js';
import { initApp } from './common.js';

async function init() {
  const user = await initApp();
  if (user) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('registerForm');
  const alertBox = document.getElementById('registerAlert');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.style.display = 'none';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alertBox.textContent = 'Passwords do not match.';
      alertBox.style.display = 'flex';
      return;
    }

    if (password.length < 8) {
      alertBox.textContent = 'Password must be at least 8 characters long.';
      alertBox.style.display = 'flex';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      await api.register({ username, password, confirmPassword });
      window.location.href = '/dashboard.html';
    } catch (err) {
      alertBox.textContent = err.message || 'Registration failed.';
      alertBox.style.display = 'flex';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

