/**
 * Login Rate Limiting (Brute-force protection)
 * Blocks account after 5 failed attempts within 15 minutes.
 * Uses MongoDB collection with TTL index for auto-cleanup.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Checks if a username has reached the 5-attempt limit in the last 15 minutes
 */
export async function checkRateLimit(db, usernameLower) {
  const cutoff = new Date(Date.now() - WINDOW_MS);

  const failedCount = await db.collection('login_attempts').countDocuments({
    usernameLower,
    createdAt: { $gte: cutoff }
  });

  if (failedCount >= MAX_ATTEMPTS) {
    return {
      blocked: true,
      error: 'Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.'
    };
  }

  return { blocked: false, attemptsRemaining: MAX_ATTEMPTS - failedCount };
}

/**
 * Records a failed login attempt
 */
export async function recordFailedAttempt(db, usernameLower, ip = '') {
  await db.collection('login_attempts').insertOne({
    usernameLower,
    ip,
    createdAt: new Date()
  });
}

/**
 * Clears failed attempts upon successful login
 */
export async function clearFailedAttempts(db, usernameLower) {
  await db.collection('login_attempts').deleteMany({ usernameLower });
}

