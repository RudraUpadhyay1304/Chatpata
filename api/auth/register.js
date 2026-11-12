/**
 * POST /api/auth/register
 * Registers a new campus user with username and password.
 */
import { connectToDatabase } from '../../lib/db.js';
import { hashPassword, signToken, createAuthCookie } from '../../lib/auth.js';
import { validateUsername, validatePassword, parseBody } from '../../lib/validation.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = parseBody(req);
    const { username, password, confirmPassword } = body;

    // 1. Validate fields presence
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Username, password, and confirm password are required.' });
    }

    // 2. Validate format
    if (!validateUsername(username)) {
      return res.status(400).json({
        error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const { db } = await connectToDatabase();
    const usernameLower = username.toLowerCase();

    // 3. Check for existing username (case-insensitive)
    const existing = await db.collection('users').findOne({ usernameLower });
    if (existing) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    // 4. Hash password with bcryptjs
    const passwordHash = await hashPassword(password);

    // 5. Insert new user document
    const newUser = {
      username: username.trim(),
      usernameLower,
      passwordHash,
      displayName: username.trim(),
      contact: '',
      department: '',
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    const userId = result.insertedId.toString();

    // 6. Generate session JWT token and set httpOnly cookie
    const token = signToken({ id: userId, username: newUser.username });
    const isSecure = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', createAuthCookie(token, isSecure));

    return res.status(201).json({
      message: 'Account registered successfully',
      user: {
        id: userId,
        username: newUser.username,
        displayName: newUser.displayName
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

