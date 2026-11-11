/**
 * PATCH /api/users/me
 * Update authenticated student profile credentials (display name, contact, department).
 */
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';
import { parseBody } from '../../lib/validation.js';

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const body = parseBody(req);
    const { displayName, contact, department } = body;

    const updates = {};
    if (typeof displayName === 'string' && displayName.trim()) {
      updates.displayName = displayName.trim().substring(0, 50);
    }
    if (typeof contact === 'string') {
      updates.contact = contact.trim().substring(0, 100);
    }
    if (typeof department === 'string') {
      updates.department = department.trim().substring(0, 100);
    }

    updates.updatedAt = new Date();

    const { db } = await connectToDatabase();
    const queryId = parseId(authUser.id);

    await db.collection('users').updateOne(
      { _id: queryId },
      { $set: updates }
    );

    const user = await db.collection('users').findOne(
      { _id: queryId },
      { projection: { passwordHash: 0 } }
    );

    return res.status(200).json({
      message: 'Profile updated successfully',
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
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}
