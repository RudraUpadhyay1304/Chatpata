/**
 * GET /api/items/[id]/matches
 * Runs heuristic matching algorithm against real database items of the opposite type.
 * Returns only matches with a score strictly greater than zero.
 */
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../lib/db.js';
import { scoreSmartMatches } from '../../../lib/matching.js';

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query || {};
  if (!id) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const queryId = parseId(id);

    // 1. Fetch target item
    const target = await db.collection('items').findOne({ _id: queryId });
    if (!target) {
      return res.status(404).json({ error: 'Target item not found' });
    }

    // 2. Fetch active counter items (e.g. found items if target is lost)
    const counterType = target.type === 'lost' ? 'found' : 'lost';
    const candidates = await db.collection('items')
      .find({
        type: counterType,
        status: 'active',
        _id: { $ne: target._id }
      })
      .toArray();

    // 3. Score candidates with algorithm (only score > 0 kept)
    const matches = scoreSmartMatches(target, candidates);

    const formattedMatches = matches.map((m) => ({
      ...m,
      candidate: {
        ...m.candidate,
        id: m.candidate._id.toString()
      }
    }));

    return res.status(200).json({
      target: {
        ...target,
        id: target._id.toString()
      },
      matches: formattedMatches
    });
  } catch (err) {
    console.error('Matching error:', err);
    return res.status(500).json({ error: 'Failed to calculate smart matches' });
  }
}
