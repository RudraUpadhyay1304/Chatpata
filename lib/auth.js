/**
 * Authentication & Session Helpers
 * Simple, standard Node.js session management using cookies.
 * No external JWT or Bcrypt dependencies required.
 */
import * as cookie from 'cookie';

const COOKIE_NAME = 'findit_token';
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

/**
 * Creates a simple base64-encoded session token containing the user id and username.
 */
export function signToken(payload) {
  const jsonStr = JSON.stringify({
    id: payload.id,
    username: payload.username,
    createdAt: Date.now()
  });
  return Buffer.from(jsonStr).toString('base64');
}

/**
 * Reads and decodes the session token.
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const jsonStr = Buffer.from(token, 'base64').toString('utf-8');
    const data = JSON.parse(jsonStr);
    if (!data.id || !data.username) return null;
    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Builds Set-Cookie header for user session
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
 * Builds Set-Cookie header to clear session cookie on logout
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
  const header = req.headers?.cookie;
  if (!header) return null;

  try {
    const parsed = cookie.parse(header);
    const token = parsed[COOKIE_NAME];
    if (!token) return null;
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}

/**
 * Middleware helper: requires logged-in user or returns 401 JSON error
 */
export function requireAuth(req, res) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return null;
  }
  return user;
}
