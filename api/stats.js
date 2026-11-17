/**
 * GET /api/stats
 * Returns live real database counts for campus lost & found dashboard metrics.
 */
import { connectToDatabase } from '../lib/db.js';
import { getAuthenticatedUser } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const authUser = getAuthenticatedUser(req);

    const [totalItems, lostItems, foundItems, resolvedItems, claimedItems, totalClaims] = await Promise.all([
      db.collection('items').countDocuments(),
      db.collection('items').countDocuments({ type: 'lost' }),
      db.collection('items').countDocuments({ type: 'found' }),
      db.collection('items').countDocuments({ status: 'resolved' }),
      db.collection('items').countDocuments({ status: 'claimed' }),
      db.collection('claims').countDocuments()
    ]);

    let userStats = null;
    if (authUser) {
      const [myReports, myClaims] = await Promise.all([
        db.collection('items').countDocuments({ ownerId: authUser.id }),
        db.collection('claims').countDocuments({ claimantId: authUser.id })
      ]);
      userStats = {
        myReports,
        myClaims
      };
    }

    return res.status(200).json({
      totalItems,
      lostItems,
      foundItems,
      resolvedItems,
      claimedItems,
      totalClaims,
      user: userStats
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Failed to retrieve stats' });
  }
}

