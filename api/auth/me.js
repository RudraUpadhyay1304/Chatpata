/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile.
 */
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../lib/db.js';
import { getAuthenticatedUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { db } = await connectToDatabase();
    let queryId;
    try {
      queryId = new ObjectId(authUser.id);
    } catch {
      queryId = authUser.id;
    }

    const user = await db.collection('users').findOne(
      { _id: queryId },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName || user.username,
        contact: user.contact || '',
        department: user.department || '',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Auth check error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
