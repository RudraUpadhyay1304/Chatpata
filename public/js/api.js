/**
 * Centralized API Client for FindIt AI
 * Wraps all backend serverless fetch calls with cookie credentials and error handling.
 */

async function request(endpoint, options = {}) {
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include',
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(endpoint, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // --- AUTHENTICATION ---
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  getMe: () => request('/api/auth/me'),

  // --- ITEMS ---
  getItems: (params = {}) => {
    const search = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        search.append(key, val);
      }
    }
    const query = search.toString();
    return request(`/api/items${query ? '?' + query : ''}`);
  },
  getItem: (id) => request(`/api/items/${encodeURIComponent(id)}`),
  createItem: (payload) => request('/api/items', { method: 'POST', body: payload }),
  updateItem: (id, payload) => request(`/api/items/${encodeURIComponent(id)}`, { method: 'PUT', body: payload }),
  deleteItem: (id) => request(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getItemMatches: (id) => request(`/api/items/${encodeURIComponent(id)}/matches`),

  // --- CLAIMS ---
  getClaims: (type) => request(`/api/claims${type ? '?type=' + encodeURIComponent(type) : ''}`),
  createClaim: (payload) => request('/api/claims', { method: 'POST', body: payload }),
  updateClaim: (id, payload) => request(`/api/claims/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload }),

  // --- STATS ---
  getStats: () => request('/api/stats'),

  // --- USER PROFILE ---
  updateProfile: (payload) => request('/api/users/me', { method: 'PATCH', body: payload })
};

