/**
 * Mock Data Service for FindIt AI Platform
 * 
 * Provides an isolated data access layer using browser localStorage.
 * All functions return Promises to emulate asynchronous backend API calls,
 * making future migration to Node.js/Express + MySQL seamless.
 */

import { INITIAL_USER, INITIAL_ITEMS, INITIAL_CLAIMS } from "../data/sampleData";

const STORAGE_KEYS = {
  ITEMS: "findit_items_v1",
  CLAIMS: "findit_claims_v1",
  USER: "findit_user_v1"
};

// Helper: Initialize localStorage with seed data on first load
function ensureInitialized() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
  }
}

// Ensure storage is seeded immediately
ensureInitialized();

/**
 * ==========================================
 * ITEM OPERATIONS
 * ==========================================
 */

export async function getItems() {
  ensureInitialized();
  const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
  return raw ? JSON.parse(raw) : [];
}

export async function getItemById(id) {
  ensureInitialized();
  const items = await getItems();
  return items.find((item) => item.id === id) || null;
}

export async function createItem(itemData) {
  ensureInitialized();
  const items = await getItems();
  const currentUser = await getCurrentUser();

  const newItem = {
    id: "item-" + Date.now(),
    title: itemData.title || "Untitled Item",
    type: itemData.type || "lost", // "lost" or "found"
    category: itemData.category || "Electronics & Audio",
    location: itemData.location || "Main University Library",
    zone: itemData.zone || "library",
    date: new Date().toISOString(),
    timeAgo: "Just now",
    description: itemData.description || "",
    imageUrl: itemData.imageUrl || "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
    reporterName: currentUser ? currentUser.name : "Anonymous Student",
    reporterContact: currentUser ? currentUser.email : "student@university.edu",
    status: "active",
    matchConfidence: null,
    isSecurityDesk: false,
    ownerUserId: currentUser ? currentUser.id : "guest"
  };

  const updatedList = [newItem, ...items];
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedList));
  return newItem;
}

export async function updateItem(id, updates) {
  ensureInitialized();
  const items = await getItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) throw new Error("Item not found");

  items[index] = { ...items[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  return items[index];
}

export async function deleteItem(id) {
  ensureInitialized();
  const items = await getItems();
  const filtered = items.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filtered));
  return true;
}

/**
 * ==========================================
 * CLAIM OPERATIONS
 * ==========================================
 */

export async function getClaims() {
  ensureInitialized();
  const raw = localStorage.getItem(STORAGE_KEYS.CLAIMS);
  return raw ? JSON.parse(raw) : [];
}

export async function createClaim(claimData) {
  ensureInitialized();
  const claims = await getClaims();
  const currentUser = await getCurrentUser();

  const newClaim = {
    id: "claim-" + Date.now(),
    itemId: claimData.itemId,
    itemTitle: claimData.itemTitle,
    itemLocation: claimData.itemLocation,
    itemType: claimData.itemType || "found",
    claimantId: currentUser ? currentUser.id : "user-101",
    claimantName: currentUser ? currentUser.name : "Alex Chen",
    claimantEmail: currentUser ? currentUser.email : "alex.chen@university.edu",
    date: new Date().toISOString(),
    proofDescription: claimData.proofDescription || "",
    status: "pending", // "pending", "approved", "rejected"
    reviewerNotes: "Submitted for security and finder verification."
  };

  const updated = [newClaim, ...claims];
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
  return newClaim;
}

export async function updateClaimStatus(claimId, status, reviewerNotes = "") {
  ensureInitialized();
  const claims = await getClaims();
  const index = claims.findIndex((c) => c.id === claimId);
  if (index === -1) throw new Error("Claim not found");

  claims[index].status = status;
  if (reviewerNotes) {
    claims[index].reviewerNotes = reviewerNotes;
  }
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
  return claims[index];
}

/**
 * ==========================================
 * AUTHENTICATION (SIMULATED DEMO)
 * ==========================================
 */

export async function getCurrentUser() {
  ensureInitialized();
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export async function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
  return user;
}

export async function login(email, password) {
  ensureInitialized();
  // Simulated authentication: any valid email will log in
  // Default demo user: Alex Chen
  const user = {
    id: "user-101",
    name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Alex Chen",
    initials: (email.split("@")[0].substring(0, 2) || "AC").toUpperCase(),
    email: email,
    studentId: "STU-84920",
    department: "Computer Science & Engineering",
    role: "Student",
    avatarUrl: null,
    phone: "+1 (555) 382-9401",
    joinedDate: "Fall 2024"
  };

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
}

export async function register(userData) {
  ensureInitialized();
  const nameParts = (userData.name || "Student User").split(" ");
  const initials = nameParts.length >= 2 
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : nameParts[0].substring(0, 2).toUpperCase();

  const user = {
    id: "user-" + Date.now(),
    name: userData.name || "Campus Student",
    initials: initials,
    email: userData.email,
    studentId: userData.studentId || "STU-" + Math.floor(10000 + Math.random() * 90000),
    department: userData.department || "General Studies",
    role: "Student",
    avatarUrl: null,
    phone: userData.phone || "+1 (555) 000-0000",
    joinedDate: "Current Semester"
  };

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
}

export async function logout() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  return true;
}

/**
 * ==========================================
 * SMART MATCHING ALGORITHM (DEMO TEXT SIMILARITY)
 * ==========================================
 * Calculates text & attribute similarity between items.
 * Evaluates category match, location proximity, and keyword overlap.
 */
export async function calculateSmartMatches(targetItemId) {
  const items = await getItems();
  const target = items.find((i) => i.id === targetItemId);
  if (!target) return [];

  // Counter type: if target is "lost", look for "found", and vice-versa
  const counterType = target.type === "lost" ? "found" : "lost";
  const candidates = items.filter((i) => i.id !== target.id && i.type === counterType);

  // Helper function to extract meaningful keywords (lowercased words >= 3 chars)
  const getKeywords = (text) => {
    if (!text) return new Set();
    const stopWords = new Set(["the", "and", "with", "for", "near", "this", "case", "some", "left", "found", "lost"]);
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w))
    );
  };

  const targetTitleWords = getKeywords(target.title);
  const targetDescWords = getKeywords(target.description);
  const allTargetWords = new Set([...targetTitleWords, ...targetDescWords]);

  const matches = candidates.map((cand) => {
    let score = 0;
    const reasons = [];

    // 1. Category Match (up to 35 points)
    if (cand.category === target.category) {
      score += 35;
      reasons.push(`Exact Category match (${target.category})`);
    }

    // 2. Location / Zone Proximity (up to 25 points)
    if (cand.zone && target.zone && cand.zone === target.zone) {
      score += 25;
      reasons.push(`Same Campus Zone (${cand.location})`);
    } else if (cand.location.toLowerCase().includes(target.location.toLowerCase().split(" ")[0])) {
      score += 15;
      reasons.push(`Location proximity match`);
    }

    // 3. Keyword Overlap in Title and Description (up to 38 points)
    const candWords = new Set([...getKeywords(cand.title), ...getKeywords(cand.description)]);
    const overlappingWords = [];
    allTargetWords.forEach((word) => {
      if (candWords.has(word)) {
        overlappingWords.push(word);
      }
    });

    if (overlappingWords.length > 0) {
      const keywordBoost = Math.min(38, overlappingWords.length * 15);
      score += keywordBoost;
      reasons.push(`Key terms match: "${overlappingWords.slice(0, 3).join('", "')}"`);
    }

    // Baseline minimum if same category or location
    if (score === 0 && cand.category === target.category) {
      score = 45;
    }

    // Normalize score to realistic AI percentage (60% - 98%)
    const finalScore = Math.min(98, Math.max(50, score));

    return {
      candidate: cand,
      matchScore: finalScore,
      reasons: reasons.length > 0 ? reasons : ["Potential related campus item"],
      overlappingWords
    };
  });

  // Sort descending by match score
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Reset localStorage to original initial sample state
 */
export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
}

