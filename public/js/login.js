/**
 * Login Page Controller
 * Handles user authentication, password toggle, error messaging, and redirection.
 */
import { api } from './api.js';
import { initApp } from './common.js';

async function init() {
  const user = await initApp();
  // If already logged in, redirect to dashboard
  if (user) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const alertBox = document.getElementById('loginAlert');
  const submitBtn = document.getElementById('submitBtn');
  const togglePassBtn = document.getElementById('togglePasswordBtn');
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('togglePasswordIcon');

  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passwordInput.type === 'password';
      passwordInput.type = isPass ? 'text' : 'password';
      toggleIcon.textContent = isPass ? 'visibility_off' : 'visibility';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.style.display = 'none';

    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      await api.login({ username, password });

      // Check redirect URL parameter
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/dashboard.html';
      window.location.href = redirect;
    } catch (err) {
      alertBox.textContent = err.message || 'Invalid username or password.';
      alertBox.style.display = 'flex';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

