/**
 * /api/claims
 * GET: Retrieve user's submitted and received claim verifications.
 * POST: Submit an ownership claim on a found item (prevents self-claim and duplicate pending).
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
  const authUser = requireAuth(req, res);
  if (!authUser) return;

  const { db } = await connectToDatabase();

  // 1. GET User's Claims (both submitted and received)
  if (req.method === 'GET') {
    try {
      const { type } = req.query || {};

      // Find all items owned by current user (for received claims)
      const myItems = await db.collection('items')
        .find({ ownerId: authUser.id })
        .toArray();
      const myItemIds = myItems.map((i) => i._id.toString());

      // Fetch submitted claims
      const submitted = await db.collection('claims')
        .find({ claimantId: authUser.id })
        .sort({ createdAt: -1 })
        .toArray();

      // Fetch received claims on items owned by current user
      const received = myItemIds.length > 0
        ? await db.collection('claims')
            .find({ itemId: { $in: myItemIds }, claimantId: { $ne: authUser.id } })
            .sort({ createdAt: -1 })
            .toArray()
        : [];

      const mapClaim = (c) => ({
        ...c,
        id: c._id.toString()
      });

      if (type === 'submitted') {
        return res.status(200).json({ claims: submitted.map(mapClaim) });
      }
      if (type === 'received') {
        return res.status(200).json({ claims: received.map(mapClaim) });
      }

      return res.status(200).json({
        submitted: submitted.map(mapClaim),
        received: received.map(mapClaim)
      });
    } catch (err) {
      console.error('Fetch claims error:', err);
      return res.status(500).json({ error: 'Failed to fetch claims' });
    }
  }

  // 2. POST Submit a New Claim
  if (req.method === 'POST') {
    try {
      const body = parseBody(req);
      const { itemId, proofDescription } = body;

      if (!itemId || typeof itemId !== 'string') {
        return res.status(400).json({ error: 'Item ID is required.' });
      }

      if (!proofDescription || typeof proofDescription !== 'string' || proofDescription.trim().length < 5) {
        return res.status(400).json({ error: 'Please provide a detailed proof of ownership (at least 5 characters).' });
      }

      // Check item in DB
      const item = await db.collection('items').findOne({ _id: parseId(itemId) });
      if (!item) {
        return res.status(404).json({ error: 'Item not found.' });
      }

      // Business rule: Users cannot claim their own item
      if (item.ownerId === authUser.id) {
        return res.status(400).json({ error: 'You cannot claim an item that you reported yourself.' });
      }

      // Business rule: Users cannot submit a second pending claim on the same item
      const existingPending = await db.collection('claims').findOne({
        itemId: itemId.toString(),
        claimantId: authUser.id,
        status: 'pending'
      });
      if (existingPending) {
        return res.status(400).json({ error: 'You already have an active pending claim for this item.' });
      }

      const newClaim = {
        itemId: itemId.toString(),
        itemTitle: item.title,
        itemLocation: item.location,
        itemType: item.type,
        itemOwnerId: item.ownerId,
        claimantId: authUser.id,
        claimantUsername: authUser.username,
        proofDescription: proofDescription.trim().substring(0, 1000),
        status: 'pending', // 'pending', 'approved', 'rejected'
        reviewerNotes: '',
        createdAt: new Date()
      };

      const result = await db.collection('claims').insertOne(newClaim);

      return res.status(201).json({
        message: 'Claim submitted successfully',
        claim: {
          ...newClaim,
          id: result.insertedId.toString()
        }
      });
    } catch (err) {
      console.error('Create claim error:', err);
      return res.status(500).json({ error: 'Failed to submit claim' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

