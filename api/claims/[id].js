/**
 * PATCH /api/claims/[id]
 * Review claim (approve or reject).
 * Only the item owner can approve or reject claims.
 * Approving sets the item status to 'claimed'.
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

  const { id } = req.query || {};
  if (!id) {
    return res.status(400).json({ error: 'Claim ID is required' });
  }

  try {
    const body = parseBody(req);
    const { status, reviewerNotes = '' } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected".' });
    }

    const { db } = await connectToDatabase();
    const queryId = parseId(id);

    // 1. Fetch claim
    const claim = await db.collection('claims').findOne({ _id: queryId });
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // 2. Fetch associated item
    const item = await db.collection('items').findOne({ _id: parseId(claim.itemId) });
    if (!item) {
      return res.status(404).json({ error: 'Associated item no longer exists.' });
    }

    // 3. Security check: Only the item owner can approve or reject claims
    if (item.ownerId !== authUser.id) {
      return res.status(403).json({ error: 'Only the item owner can review and approve or reject claims.' });
    }

    // 4. Update claim
    const claimUpdates = {
      status,
      reviewerNotes: typeof reviewerNotes === 'string' ? reviewerNotes.trim().substring(0, 500) : '',
      reviewedAt: new Date()
    };

    await db.collection('claims').updateOne({ _id: queryId }, { $set: claimUpdates });

    // 5. Business rule: Approving sets item status to "claimed"
    if (status === 'approved') {
      await db.collection('items').updateOne(
        { _id: item._id },
        { $set: { status: 'claimed', claimedBy: claim.claimantId, updatedAt: new Date() } }
      );
    } else if (status === 'rejected' && item.status === 'claimed' && item.claimedBy === claim.claimantId) {
      // If was previously claimed by this claimant and now rejected, revert back to active
      await db.collection('items').updateOne(
        { _id: item._id },
        { $set: { status: 'active', claimedBy: null, updatedAt: new Date() } }
      );
    }

    const updatedClaim = await db.collection('claims').findOne({ _id: queryId });

    return res.status(200).json({
      message: `Claim ${status} successfully`,
      claim: {
        ...updatedClaim,
        id: updatedClaim._id.toString()
      }
    });
  } catch (err) {
    console.error('Update claim error:', err);
    return res.status(500).json({ error: 'Failed to update claim' });
  }
}

