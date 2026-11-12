/**
 * Authentication & Security Helpers
 * Password hashing with bcryptjs and JWT session cookies.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const COOKIE_NAME = 'findit_token';
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is missing.');
    }
    return 'findit_dev_fallback_secret_key_minimum_32_chars';
  }
  return secret;
}

/**
 * Hash a plain password using bcryptjs
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain password against bcrypt hash
 */
export async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Sign JWT token for user session
 */
export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '7d'
  });
}

/**
 * Verify JWT token and return payload, or null if invalid/expired
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (err) {
    return null;
  }
}

/**
 * Build Set-Cookie header for session JWT
 */
export function createAuthCookie(token, isSecure = true) {
  return cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: SEVEN_DAYS_SECONDS
  });
}

/**
 * Build Set-Cookie header to clear session cookie on logout
 */
export function clearAuthCookie(isSecure = true) {
  return cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  });
}

/**
 * Extract authenticated user payload from request cookies
 */
export function getAuthenticatedUser(req) {
  const header = req.headers.cookie;
  if (!header) return null;

  const parsed = cookie.parse(header);
  const token = parsed[COOKIE_NAME];
  if (!token) return null;

  return verifyToken(token);
}

/**
 * Middleware-like helper: requires auth or sends 401 JSON error
 */
export function requireAuth(req, res) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return null;
  }
  return user;
}

