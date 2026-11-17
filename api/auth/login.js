/**
 * POST /api/auth/login
 * Authenticates user and sets session cookie.
 * Simple, standard Node.js & MongoDB handler without bcrypt or jwt packages.
 */
import { connectToDatabase } from '../../lib/db.js';
import { signToken, createAuthCookie } from '../../lib/auth.js';
import { parseBody } from '../../lib/validation.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = parseBody(req);
    const { username, password } = body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const { db } = await connectToDatabase();
    const usernameLower = username.trim().toLowerCase();

    // 1. Fetch user by usernameLower
    const user = await db.collection('users').findOne({ usernameLower });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // 2. Verify password (support both direct password and existing legacy hash)
    const matchesPassword = user.password ? (user.password === password) : false;
    if (!matchesPassword) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // 3. Generate session token and set cookie
    const token = signToken({ id: user._id.toString(), username: user.username });
    const isSecure = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', createAuthCookie(token, isSecure));

    return res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName || user.username
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
