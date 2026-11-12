/**
 * Database Connection & Index Management
 * Uses the official MongoDB driver with cached client connection for Vercel Serverless.
 */
import dns from 'dns';
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;
let indexesPromise = null;

/**
 * Connect to MongoDB and return { client, db }
 * Caches connection across serverless function invocations.
 */
export async function connectToDatabase(customUri) {
  if (cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = customUri || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  // Fallback DNS for local Windows machines whose router blocks SRV lookups
  if (!process.env.VERCEL && uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch {
      // Ignore if environment disallows overriding DNS
    }
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  // Ensure indexes are created once per connection lifecycle
  if (!indexesPromise) {
    indexesPromise = ensureIndexes(db).catch((err) => {
      console.warn('Index initialization note:', err.message);
    });
  }
  await indexesPromise;

  return { client, db };
}

/**
 * Creates required collections indexes:
 * - users: unique usernameLower
 * - items: compound filters and owner
 * - claims: itemId, claimantId
 * - login_attempts: 15-minute TTL index
 */
export async function ensureIndexes(db) {
  try {
    // Users: unique case-insensitive username
    await db.collection('users').createIndex(
      { usernameLower: 1 },
      { unique: true, name: 'idx_unique_username_lower' }
    );

    // Items: indexing for queries and owner lookups
    await db.collection('items').createIndex(
      { ownerId: 1, createdAt: -1 },
      { name: 'idx_items_owner' }
    );
    await db.collection('items').createIndex(
      { type: 1, category: 1, zone: 1, status: 1 },
      { name: 'idx_items_filter' }
    );

    // Claims: indexing for items and claimants
    await db.collection('claims').createIndex(
      { itemId: 1, status: 1 },
      { name: 'idx_claims_item' }
    );
    await db.collection('claims').createIndex(
      { claimantId: 1, createdAt: -1 },
      { name: 'idx_claims_claimant' }
    );

    // Login Attempts: 15-minute (900 seconds) TTL index for brute-force rate limiting
    await db.collection('login_attempts').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 900, name: 'idx_login_attempts_ttl' }
    );
    await db.collection('login_attempts').createIndex(
      { usernameLower: 1, createdAt: -1 },
      { name: 'idx_login_attempts_user' }
    );
  } catch (err) {
    console.error('Error ensuring indexes:', err.message);
  }
}

/**
 * Helper to inject a test database for automated test suites
 */
export function setTestDb(db, client = null) {
  cachedDb = db;
  cachedClient = client;
  indexesPromise = Promise.resolve();
}
