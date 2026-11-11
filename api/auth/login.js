/**
 * POST /api/auth/login
 * Authenticates user, enforces rate-limiting (5 attempts / 15 mins), sets httpOnly JWT cookie.
 */
import { connectToDatabase } from '../../lib/db.js';
import { comparePassword, signToken, createAuthCookie } from '../../lib/auth.js';
import { checkRateLimit, recordFailedAttempt, clearFailedAttempts } from '../../lib/rateLimit.js';
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
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

    // 1. Check rate limit
    const limitStatus = await checkRateLimit(db, usernameLower);
    if (limitStatus.blocked) {
      return res.status(429).json({ error: limitStatus.error });
    }

    // 2. Fetch user by usernameLower
    const user = await db.collection('users').findOne({ usernameLower });
    if (!user) {
      await recordFailedAttempt(db, usernameLower, ip);
      // Generic error message for security
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // 3. Verify password hash
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      await recordFailedAttempt(db, usernameLower, ip);
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // 4. Clear failed login attempts upon success
    await clearFailedAttempts(db, usernameLower);

    // 5. Generate JWT token and set httpOnly cookie
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
