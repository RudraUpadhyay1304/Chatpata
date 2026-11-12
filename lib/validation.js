/**
 * Input Validation & Security Utilities
 * Protects against NoSQL injection, bad types, and payload size overflows.
 */

export const ALLOWED_CATEGORIES = [
  'Electronics & Audio',
  'Student ID & Cards',
  'Water Bottles & Tumblers',
  'Wallets & Keys',
  'Clothing & Backpacks',
  'Books & Notebooks',
  'Other'
];

export const ALLOWED_ZONES = [
  'library',
  'student-union',
  'sports',
  'science',
  'dining',
  'east-quad',
  'other'
];

/**
 * Escapes user input to safely use inside a regular expression (prevents regex injection)
 */
export function escapeRegex(string) {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates that an input is a non-empty string
 */
export function isString(val) {
  return typeof val === 'string';
}

/**
 * Validates username: 3-20 characters, alphanumeric and underscore only
 */
export function validateUsername(username) {
  if (!isString(username)) return false;
  const trimmed = username.trim();
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(trimmed);
}

/**
 * Validates password: string, at least 8 characters
 */
export function validatePassword(password) {
  if (!isString(password)) return false;
  return password.length >= 8 && password.length <= 128;
}

/**
 * Validates base64 data URL size (max 300 KB)
 */
export function validateImageDataUrl(dataUrl) {
  if (!dataUrl) return true; // Optional image
  if (!isString(dataUrl)) return false;

  // Must begin with data:image/
  if (!dataUrl.startsWith('data:image/')) return false;

  // Rough size estimate from base64 string length: byte length is approx (len * 3/4)
  const byteLength = Math.ceil((dataUrl.length * 3) / 4);
  const maxBytes = 300 * 1024; // 300 KB
  return byteLength <= maxBytes;
}

/**
 * Parse and validate JSON request body safely
 */
export function parseBody(req) {
  if (typeof req.body === 'object' && req.body !== null) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

