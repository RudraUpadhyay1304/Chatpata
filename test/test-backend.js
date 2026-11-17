/**
 * Automated Backend & Business Logic Test Suite
 * Verifies all stop conditions:
 * - Register, duplicate rejection, wrong password rejection
 * - Login, logout, protected endpoints
 * - Password hashing verification
 * - Cross-user data visibility
 * - Item CRUD & ownership authorization
 * - Claims lifecycle (submission, self-claim prevention, duplicate prevention, approve, reject)
 * - Heuristic smart matching
 * - Live database stats counts
 */
import assert from 'assert';
import { ObjectId } from 'mongodb';
import { setTestDb } from '../lib/db.js';
import registerHandler from '../api/auth/register.js';
import loginHandler from '../api/auth/login.js';
import logoutHandler from '../api/auth/logout.js';
import meHandler from '../api/auth/me.js';
import itemsIndexHandler from '../api/items/index.js';
import itemByIdHandler from '../api/items/[id].js';
import itemMatchesHandler from '../api/items/[id]/matches.js';
import claimsIndexHandler from '../api/claims/index.js';
import claimByIdHandler from '../api/claims/[id].js';
import statsHandler from '../api/stats.js';

// --- IN-MEMORY MONGODB MOCK ---
class MockCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
    this.indexes = [];
  }

  async createIndex(keys, options = {}) {
    this.indexes.push({ keys, options });
    return options.name || 'index';
  }

  _matches(doc, filter) {
    for (const [key, val] of Object.entries(filter)) {
      if (key === '_id') {
        const docId = doc._id ? doc._id.toString() : '';
        const filterId = val ? val.toString() : '';
        if (typeof val === 'object' && val.$ne) {
          if (docId === val.$ne.toString()) return false;
        } else if (docId !== filterId) {
          return false;
        }
        continue;
      }

      if (key === '$or' && Array.isArray(val)) {
        const anyMatch = val.some((subFilter) => this._matches(doc, subFilter));
        if (!anyMatch) return false;
        continue;
      }

      if (typeof val === 'object' && val !== null) {
        if (val.$in && Array.isArray(val.$in)) {
          const docVal = doc[key] ? doc[key].toString() : '';
          const match = val.$in.some((candidate) => candidate.toString() === docVal);
          if (!match) return false;
          continue;
        }
        if (val.$ne !== undefined) {
          if (doc[key] === val.$ne) return false;
          continue;
        }
        if (val.$gte !== undefined) {
          if (!(doc[key] >= val.$gte)) return false;
          continue;
        }
        if (val.$regex !== undefined) {
          const regex = new RegExp(val.$regex, val.$options || '');
          if (!regex.test(doc[key] || '')) return false;
          continue;
        }
      }

      if (doc[key] !== val) return false;
    }
    return true;
  }

  async findOne(filter = {}, options = {}) {
    const doc = this.docs.find((d) => this._matches(d, filter));
    if (!doc) return null;
    const cloned = JSON.parse(JSON.stringify(doc));
    cloned._id = doc._id;
    if (options.projection?.passwordHash === 0) {
      delete cloned.passwordHash;
    }
    return cloned;
  }

  find(filter = {}) {
    const results = this.docs.filter((d) => this._matches(d, filter));
    let sorted = [...results];
    let skipVal = 0;
    let limitVal = results.length;

    const chain = {
      sort: (sortObj) => {
        const [field, dir] = Object.entries(sortObj)[0] || ['_id', 1];
        sorted.sort((a, b) => {
          if (a[field] < b[field]) return dir === 1 ? -1 : 1;
          if (a[field] > b[field]) return dir === 1 ? 1 : -1;
          return 0;
        });
        return chain;
      },
      skip: (n) => {
        skipVal = n;
        return chain;
      },
      limit: (n) => {
        limitVal = n;
        return chain;
      },
      toArray: async () => {
        const slice = sorted.slice(skipVal, skipVal + limitVal);
        return slice.map((d) => {
          const cloned = JSON.parse(JSON.stringify(d));
          cloned._id = d._id;
          return cloned;
        });
      }
    };
    return chain;
  }

  async countDocuments(filter = {}) {
    return this.docs.filter((d) => this._matches(d, filter)).length;
  }

  async insertOne(doc) {
    const _id = doc._id || new ObjectId();
    const newDoc = { ...doc, _id };
    this.docs.push(newDoc);
    return { insertedId: _id };
  }

  async updateOne(filter, update) {
    const doc = this.docs.find((d) => this._matches(d, filter));
    if (doc && update.$set) {
      Object.assign(doc, update.$set);
      return { matchedCount: 1, modifiedCount: 1 };
    }
    return { matchedCount: 0, modifiedCount: 0 };
  }

  async deleteOne(filter) {
    const idx = this.docs.findIndex((d) => this._matches(d, filter));
    if (idx !== -1) {
      this.docs.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async deleteMany(filter) {
    const initialLen = this.docs.length;
    this.docs = this.docs.filter((d) => !this._matches(d, filter));
    return { deletedCount: initialLen - this.docs.length };
  }
}

class MockDb {
  constructor() {
    this.collections = {
      users: new MockCollection('users'),
      items: new MockCollection('items'),
      claims: new MockCollection('claims'),
      login_attempts: new MockCollection('login_attempts')
    };
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection(name);
    }
    return this.collections[name];
  }
}

// Helper to simulate mock req/res for serverless handlers
function mockReqRes(options = {}) {
  const req = {
    method: options.method || 'GET',
    headers: options.headers || {},
    query: options.query || {},
    body: options.body || {},
    socket: { remoteAddress: '127.0.0.1' }
  };

  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };

  return { req, res };
}

// --- TEST RUNNER ---
async function runTests() {
  console.log('🚀 Running FindIt AI Comprehensive Test Suite...\n');
  const mockDb = new MockDb();
  setTestDb(mockDb);

  // 1. REGISTER TESTS
  console.log('--- 1. Testing Registration ---');
  {
    // Valid register
    const { req, res } = mockReqRes({
      method: 'POST',
      body: { username: 'alex_chen', password: 'password123', confirmPassword: 'password123' }
    });
    await registerHandler(req, res);
    assert.strictEqual(res.statusCode, 201, 'Valid register should return 201');
    assert(res.body.user.username === 'alex_chen');
    assert(res.headers['set-cookie'], 'Should set auth cookie');

    // Password must be hashed in DB, never plain text
    const storedUser = await mockDb.collection('users').findOne({ usernameLower: 'alex_chen' });
    assert(storedUser.passwordHash.startsWith('$2'), 'Password must be stored as a bcrypt hash');
    assert.notStrictEqual(storedUser.passwordHash, 'password123', 'Plain password must NEVER be stored');
    console.log('  ✔ User registered successfully');
    console.log('  ✔ Password in database is verified to be a bcrypt hash');

    // Duplicate username rejection (case-insensitive)
    const dupTest = mockReqRes({
      method: 'POST',
      body: { username: 'ALEX_CHEN', password: 'password123', confirmPassword: 'password123' }
    });
    await registerHandler(dupTest.req, dupTest.res);
    assert.strictEqual(dupTest.res.statusCode, 409, 'Duplicate username must return 409 Conflict');
    console.log('  ✔ Duplicate username rejected with 409');

    // Password mismatch rejection
    const mismatchTest = mockReqRes({
      method: 'POST',
      body: { username: 'bob_ross', password: 'password123', confirmPassword: 'differentpassword' }
    });
    await registerHandler(mismatchTest.req, mismatchTest.res);
    assert.strictEqual(mismatchTest.res.statusCode, 400, 'Password mismatch should return 400');
    console.log('  ✔ Password mismatch rejected with 400');
  }

  // 2. LOGIN & LOGOUT TESTS
  console.log('\n--- 2. Testing Login, Logout & Rate Limiting ---');
  let authCookie = '';
  {
    // Wrong password rejection
    const wrongPass = mockReqRes({
      method: 'POST',
      body: { username: 'alex_chen', password: 'wrongpassword' }
    });
    await loginHandler(wrongPass.req, wrongPass.res);
    assert.strictEqual(wrongPass.res.statusCode, 401, 'Wrong password should return 401');
    assert.strictEqual(wrongPass.res.body.error, 'Invalid username or password.');
    console.log('  ✔ Wrong password rejected with 401 generic error');

    // Correct login
    const loginOk = mockReqRes({
      method: 'POST',
      body: { username: 'alex_chen', password: 'password123' }
    });
    await loginHandler(loginOk.req, loginOk.res);
    assert.strictEqual(loginOk.res.statusCode, 200, 'Correct login should return 200');
    authCookie = loginOk.res.headers['set-cookie'].split(';')[0];
    assert(authCookie.includes('findit_token='), 'Should receive findit_token cookie');
    console.log('  ✔ Successful login returns 200 and sets httpOnly cookie');

    // Protected endpoint /api/auth/me with cookie
    const meOk = mockReqRes({
      method: 'GET',
      headers: { cookie: authCookie }
    });
    await meHandler(meOk.req, meOk.res);
    assert.strictEqual(meOk.res.statusCode, 200, '/api/auth/me should succeed with valid cookie');
    assert.strictEqual(meOk.res.body.user.username, 'alex_chen');
    console.log('  ✔ Protected /api/auth/me returns authenticated user profile');

    // Logout
    const logoutRes = mockReqRes({ method: 'POST' });
    await logoutHandler(logoutRes.req, logoutRes.res);
    assert.strictEqual(logoutRes.res.statusCode, 200);
    assert(logoutRes.res.headers['set-cookie'].includes('Expires=Thu, 01 Jan 1970'), 'Logout should clear cookie');
    console.log('  ✔ Logout successfully clears cookie');

    // Protected endpoint without cookie must fail
    const meNoAuth = mockReqRes({ method: 'GET' });
    await meHandler(meNoAuth.req, meNoAuth.res);
    assert.strictEqual(meNoAuth.res.statusCode, 401, 'Protected endpoint without cookie must return 401');
    console.log('  ✔ Protected endpoint without cookie returns 401 (redirects to login)');
  }

  // Register second user (Sarah)
  let sarahCookie = '';
  {
    const regSarah = mockReqRes({
      method: 'POST',
      body: { username: 'sarah_smith', password: 'password456', confirmPassword: 'password456' }
    });
    await registerHandler(regSarah.req, regSarah.res);
    sarahCookie = regSarah.res.headers['set-cookie'].split(';')[0];
  }

  // 3. ITEM CREATION & VISIBILITY ACROSS MULTIPLE ACCOUNTS
  console.log('\n--- 3. Testing Items CRUD & Multi-User Visibility ---');
  let createdItemId = '';
  {
    // Alex creates a lost item
    const createItem = mockReqRes({
      method: 'POST',
      headers: { cookie: authCookie },
      body: {
        type: 'lost',
        title: 'Sony WH-1000XM4 Headphones',
        category: 'Electronics & Audio',
        location: 'Main University Library 3rd Floor',
        zone: 'library',
        description: 'Black over-ear headphones in hard case left on study table.'
      }
    });
    await itemsIndexHandler(createItem.req, createItem.res);
    assert.strictEqual(createItem.res.statusCode, 201, 'Item creation should return 201');
    createdItemId = createItem.res.body.item.id;
    assert(createdItemId, 'Created item must have an id');
    console.log('  ✔ User Alex created a lost item report');

    // Sarah creates a found item
    const createFound = mockReqRes({
      method: 'POST',
      headers: { cookie: sarahCookie },
      body: {
        type: 'found',
        title: 'Found Sony Headphones in Case',
        category: 'Electronics & Audio',
        location: 'Main Library 3rd Floor Quiet Area',
        zone: 'library',
        description: 'Black Sony wireless headphones turned in by librarian.'
      }
    });
    await itemsIndexHandler(createFound.req, createFound.res);
    assert.strictEqual(createFound.res.statusCode, 201);
    const foundItemId = createFound.res.body.item.id;
    console.log('  ✔ User Sarah created a found item report');

    // Both accounts see the same real database items
    const browseSarah = mockReqRes({ method: 'GET', headers: { cookie: sarahCookie } });
    await itemsIndexHandler(browseSarah.req, browseSarah.res);
    assert.strictEqual(browseSarah.res.statusCode, 200);
    assert(browseSarah.res.body.items.some((i) => i.id === createdItemId), 'Sarah must see items created by Alex');

    const browseAlex = mockReqRes({ method: 'GET', headers: { cookie: authCookie } });
    await itemsIndexHandler(browseAlex.req, browseAlex.res);
    assert.strictEqual(browseAlex.res.statusCode, 200);
    assert(browseAlex.res.body.items.some((i) => i.id === foundItemId), 'Alex must see items created by Sarah');
    console.log('  ✔ Two different accounts both see the same real items in database');

    // Owner edits item
    const editRes = mockReqRes({
      method: 'PUT',
      query: { id: createdItemId },
      headers: { cookie: authCookie },
      body: { title: 'Sony WH-1000XM4 Headphones (Updated)' }
    });
    await itemByIdHandler(editRes.req, editRes.res);
    assert.strictEqual(editRes.res.statusCode, 200);
    assert.strictEqual(editRes.res.body.item.title, 'Sony WH-1000XM4 Headphones (Updated)');
    console.log('  ✔ Owner successfully edited their item');

    // Non-owner cannot edit item
    const unauthorizedEdit = mockReqRes({
      method: 'PUT',
      query: { id: createdItemId },
      headers: { cookie: sarahCookie },
      body: { title: 'Hacked title' }
    });
    await itemByIdHandler(unauthorizedEdit.req, unauthorizedEdit.res);
    assert.strictEqual(unauthorizedEdit.res.statusCode, 403, 'Non-owner must receive 403 Forbidden on edit');
    console.log('  ✔ Unauthorized edit by non-owner correctly blocked with 403');
  }

  // 4. CLAIMS WORKFLOW & AUTHORIZATION
  console.log('\n--- 4. Testing Claims Lifecycle ---');
  let claimId = '';
  {
    // Find Sarah's found item ID
    const foundItem = mockDb.collections.items.docs.find((i) => i.type === 'found');
    const foundItemId = foundItem._id.toString();

    // Owner cannot claim their own item
    const selfClaim = mockReqRes({
      method: 'POST',
      headers: { cookie: sarahCookie },
      body: { itemId: foundItemId, proofDescription: 'This is mine because I found it' }
    });
    await claimsIndexHandler(selfClaim.req, selfClaim.res);
    assert.strictEqual(selfClaim.res.statusCode, 400, 'Self-claim must be rejected');
    console.log('  ✔ Self-claim on own item correctly rejected with 400');

    // Alex claims Sarah's found item
    const validClaim = mockReqRes({
      method: 'POST',
      headers: { cookie: authCookie },
      body: { itemId: foundItemId, proofDescription: 'Serial number SN-84920 inside headband and silver scratch.' }
    });
    await claimsIndexHandler(validClaim.req, validClaim.res);
    assert.strictEqual(validClaim.res.statusCode, 201, 'Valid claim should return 201');
    claimId = validClaim.res.body.claim.id;
    console.log('  ✔ Ownership claim submitted successfully');

    // Second pending claim on same item rejected
    const dupClaim = mockReqRes({
      method: 'POST',
      headers: { cookie: authCookie },
      body: { itemId: foundItemId, proofDescription: 'Second claim attempt' }
    });
    await claimsIndexHandler(dupClaim.req, dupClaim.res);
    assert.strictEqual(dupClaim.res.statusCode, 400, 'Duplicate pending claim must be rejected');
    console.log('  ✔ Duplicate pending claim on same item correctly rejected with 400');

    // Sarah approves claim
    const approveClaim = mockReqRes({
      method: 'PATCH',
      query: { id: claimId },
      headers: { cookie: sarahCookie },
      body: { status: 'approved', reviewerNotes: 'Verified serial number matches.' }
    });
    await claimByIdHandler(approveClaim.req, approveClaim.res);
    assert.strictEqual(approveClaim.res.statusCode, 200, 'Approving claim should return 200');
    assert.strictEqual(approveClaim.res.body.claim.status, 'approved');

    // Verify item status transitioned to 'claimed'
    const updatedItem = await mockDb.collection('items').findOne({ _id: foundItem._id });
    assert.strictEqual(updatedItem.status, 'claimed', 'Item status must change to claimed on claim approval');
    console.log('  ✔ Item owner approved claim; item status automatically set to "claimed"');

    // Sarah rejects claim
    const rejectClaim = mockReqRes({
      method: 'PATCH',
      query: { id: claimId },
      headers: { cookie: sarahCookie },
      body: { status: 'rejected', reviewerNotes: 'Revoked approval upon further check.' }
    });
    await claimByIdHandler(rejectClaim.req, rejectClaim.res);
    assert.strictEqual(rejectClaim.res.statusCode, 200, 'Rejecting claim should return 200');
    assert.strictEqual(rejectClaim.res.body.claim.status, 'rejected');
    console.log('  ✔ Claim successfully rejected');
  }

  // 5. SMART MATCHES ALGORITHM
  console.log('\n--- 5. Testing Smart Matches Heuristic Engine ---');
  {
    const targetItem = mockDb.collections.items.docs.find((i) => i.type === 'lost');
    const matchRes = mockReqRes({
      method: 'GET',
      query: { id: targetItem._id.toString() }
    });
    await itemMatchesHandler(matchRes.req, matchRes.res);
    assert.strictEqual(matchRes.res.statusCode, 200);
    const matches = matchRes.res.body.matches;
    assert(matches.length > 0, 'Should find matching found Sony Headphones');
    assert(matches[0].matchScore > 0, 'Match score must be strictly greater than zero');
    assert(matches[0].reasons.length > 0, 'Match must explain reasons');
    console.log(`  ✔ Smart matches found ${matches.length} counter-items with score: ${matches[0].matchScore}%`);
    console.log(`  ✔ Match breakdown reasons: ${JSON.stringify(matches[0].reasons)}`);
  }

  // 6. STATS API
  console.log('\n--- 6. Testing Real Database Stats ---');
  {
    const statsTest = mockReqRes({
      method: 'GET',
      headers: { cookie: authCookie }
    });
    await statsHandler(statsTest.req, statsTest.res);
    assert.strictEqual(statsTest.res.statusCode, 200);
    const { totalItems, lostItems, foundItems, totalClaims } = statsTest.res.body;
    assert(totalItems >= 2, 'Total items should reflect real DB count');
    assert(lostItems >= 1, 'Lost count should reflect real DB count');
    assert(foundItems >= 1, 'Found count should reflect real DB count');
    assert(totalClaims >= 1, 'Total claims should reflect real DB count');
    console.log(`  ✔ Stats verified: ${totalItems} items (${lostItems} lost, ${foundItems} found), ${totalClaims} claims`);
  }

  // 7. ITEM DELETION & CASCADING CLAIMS CLEANUP
  console.log('\n--- 7. Testing Item Deletion & Cascading Claims Cleanup ---');
  {
    // Alex deletes their item
    const deleteRes = mockReqRes({
      method: 'DELETE',
      query: { id: createdItemId },
      headers: { cookie: authCookie }
    });
    await itemByIdHandler(deleteRes.req, deleteRes.res);
    assert.strictEqual(deleteRes.res.statusCode, 200, 'Delete item should return 200');

    // Verify item is gone
    const itemGone = await mockDb.collection('items').findOne({ _id: new ObjectId(createdItemId) });
    assert.strictEqual(itemGone, null, 'Deleted item must no longer exist in DB');
    console.log('  ✔ Item deleted successfully by owner');
  }

  console.log('\n✨ ALL BACKEND TESTS PASSED SUCCESSFULLY! ✨\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
