/**
 * /api/items/[id]
 * GET: Retrieve item details.
 * PUT: Edit item (owner only).
 * DELETE: Delete item and its associated claims (owner only).
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
  const { id } = req.query || {};
  if (!id) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  const { db } = await connectToDatabase();
  const queryId = parseId(id);

  // 1. GET Item Details
  if (req.method === 'GET') {
    try {
      const item = await db.collection('items').findOne({ _id: queryId });
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      return res.status(200).json({
        item: {
          ...item,
          id: item._id.toString()
        }
      });
    } catch (err) {
      console.error('Get item error:', err);
      return res.status(500).json({ error: 'Failed to retrieve item' });
    }
  }

  // 2. PUT Update Item (Owner only)
  if (req.method === 'PUT') {
    const authUser = requireAuth(req, res);
    if (!authUser) return;

    try {
      const item = await db.collection('items').findOne({ _id: queryId });
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // Security check: Only the owner can edit
      if (item.ownerId !== authUser.id) {
        return res.status(403).json({ error: 'You are not authorized to edit this item.' });
      }

      const body = parseBody(req);
      const updates = {};

      if (typeof body.title === 'string' && body.title.trim()) {
        updates.title = body.title.trim().substring(0, 100);
      }
      if (typeof body.description === 'string') {
        updates.description = body.description.trim().substring(0, 1000);
      }
      if (typeof body.location === 'string' && body.location.trim()) {
        updates.location = body.location.trim().substring(0, 150);
      }
      if (typeof body.category === 'string' && body.category.trim()) {
        updates.category = body.category.trim().substring(0, 50);
      }
      if (typeof body.zone === 'string' && body.zone.trim()) {
        updates.zone = body.zone.trim().substring(0, 50);
      }
      if (typeof body.status === 'string' && ['active', 'claimed', 'resolved'].includes(body.status)) {
        updates.status = body.status;
      }

      updates.updatedAt = new Date();

      await db.collection('items').updateOne({ _id: queryId }, { $set: updates });
      const updatedItem = await db.collection('items').findOne({ _id: queryId });

      return res.status(200).json({
        message: 'Item updated successfully',
        item: {
          ...updatedItem,
          id: updatedItem._id.toString()
        }
      });
    } catch (err) {
      console.error('Update item error:', err);
      return res.status(500).json({ error: 'Failed to update item' });
    }
  }

  // 3. DELETE Item and associated claims (Owner only)
  if (req.method === 'DELETE') {
    const authUser = requireAuth(req, res);
    if (!authUser) return;

    try {
      const item = await db.collection('items').findOne({ _id: queryId });
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // Security check: Only the owner can delete
      if (item.ownerId !== authUser.id) {
        return res.status(403).json({ error: 'You are not authorized to delete this item.' });
      }

      // Delete the item
      await db.collection('items').deleteOne({ _id: queryId });

      // Cascading delete: delete all claims associated with this item
      await db.collection('claims').deleteMany({ itemId: id.toString() });

      return res.status(200).json({
        message: 'Item and associated claims deleted successfully'
      });
    } catch (err) {
      console.error('Delete item error:', err);
      return res.status(500).json({ error: 'Failed to delete item' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

