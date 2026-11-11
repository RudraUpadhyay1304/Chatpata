/**
 * /api/items
 * GET: Search, filter, and paginate campus lost and found items.
 * POST: Create a new lost or found item report (requires login).
 */
import { connectToDatabase } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';
import { escapeRegex, validateImageDataUrl, parseBody } from '../../lib/validation.js';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const {
        q = '',
        type = 'all',
        category = 'all',
        zone = 'all',
        status = 'all',
        ownerId = '',
        limit = '50',
        page = '1'
      } = req.query || {};

      const filter = {};

      // 1. Type filter
      if (typeof type === 'string' && (type === 'lost' || type === 'found')) {
        filter.type = type;
      }

      // 2. Category filter
      if (typeof category === 'string' && category !== 'all' && category !== 'All Categories') {
        filter.category = category;
      }

      // 3. Zone filter
      if (typeof zone === 'string' && zone !== 'all') {
        filter.zone = zone;
      }

      // 4. Status filter (default to all or specific)
      if (typeof status === 'string' && ['active', 'claimed', 'resolved'].includes(status)) {
        filter.status = status;
      }

      // 5. Owner filter
      if (typeof ownerId === 'string' && ownerId.trim()) {
        filter.ownerId = ownerId.trim();
      }

      // 6. Safe keyword search (title, description, location)
      if (typeof q === 'string' && q.trim()) {
        const safeQuery = escapeRegex(q.trim());
        filter.$or = [
          { title: { $regex: safeQuery, $options: 'i' } },
          { description: { $regex: safeQuery, $options: 'i' } },
          { location: { $regex: safeQuery, $options: 'i' } }
        ];
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
      const skip = (pageNum - 1) * limitNum;

      const total = await db.collection('items').countDocuments(filter);
      const items = await db.collection('items')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray();

      const mapped = items.map((item) => ({
        ...item,
        id: item._id.toString()
      }));

      return res.status(200).json({
        items: mapped,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1
      });
    } catch (err) {
      console.error('Fetch items error:', err);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }
  }

  if (req.method === 'POST') {
    const authUser = requireAuth(req, res);
    if (!authUser) return; // Response sent by requireAuth

    try {
      const body = parseBody(req);
      const {
        type,
        title,
        category,
        location,
        zone = 'library',
        description = '',
        image = ''
      } = body;

      // Validation
      if (!type || !['lost', 'found'].includes(type)) {
        return res.status(400).json({ error: 'Type must be either "lost" or "found".' });
      }

      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Item title is required.' });
      }

      if (!category || typeof category !== 'string' || !category.trim()) {
        return res.status(400).json({ error: 'Category is required.' });
      }

      if (!location || typeof location !== 'string' || !location.trim()) {
        return res.status(400).json({ error: 'Location is required.' });
      }

      // Max 300 KB image check
      if (image && !validateImageDataUrl(image)) {
        return res.status(400).json({
          error: 'Image must be a valid base64 data URL and cannot exceed 300 KB.'
        });
      }

      const newItem = {
        type,
        title: title.trim().substring(0, 100),
        category: category.trim().substring(0, 50),
        location: location.trim().substring(0, 150),
        zone: typeof zone === 'string' ? zone.trim().substring(0, 50) : 'other',
        description: typeof description === 'string' ? description.trim().substring(0, 1000) : '',
        image: image || '',
        status: 'active', // 'active', 'claimed', 'resolved'
        ownerId: authUser.id,
        ownerUsername: authUser.username,
        createdAt: new Date()
      };

      const result = await db.collection('items').insertOne(newItem);
      const createdItem = {
        ...newItem,
        id: result.insertedId.toString()
      };

      return res.status(201).json({
        message: 'Item reported successfully',
        item: createdItem
      });
    } catch (err) {
      console.error('Create item error:', err);
      return res.status(500).json({ error: 'Failed to create item report' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
