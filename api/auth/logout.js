/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
import { clearAuthCookie } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isSecure = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', clearAuthCookie(isSecure));

  return res.status(200).json({ message: 'Logged out successfully' });
}

