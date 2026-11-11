/**
 * Smart Matching Engine
 * Compares target item against database counter-items (lost vs found).
 * Evaluates category, campus zone proximity, and keyword overlap.
 * Only returns matches with a score strictly greater than zero.
 */

const STOP_WORDS = new Set([
  'the', 'and', 'with', 'for', 'near', 'this', 'case', 'some', 'left',
  'found', 'lost', 'from', 'that', 'have', 'were', 'been', 'there'
]);

/**
 * Extracts normalized keyword tokens of length >= 3 from text
 */
function extractKeywords(text) {
  if (!text || typeof text !== 'string') return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  return new Set(words);
}

/**
 * Calculate smart matches for a target item against candidates from the database
 */
export function scoreSmartMatches(target, candidates) {
  if (!target || !Array.isArray(candidates)) return [];

  const targetTitleWords = extractKeywords(target.title);
  const targetDescWords = extractKeywords(target.description);
  const allTargetWords = new Set([...targetTitleWords, ...targetDescWords]);

  const matches = [];

  for (const cand of candidates) {
    // Only compare opposite item types (lost against found, found against lost)
    if (cand.type === target.type) continue;
    if (cand._id.toString() === target._id.toString()) continue;

    let score = 0;
    const reasons = [];

    // 1. Category match (up to 35 points)
    if (cand.category && target.category && cand.category === target.category) {
      score += 35;
      reasons.push(`Exact Category match (${target.category})`);
    }

    // 2. Zone / Location proximity (up to 25 points)
    if (cand.zone && target.zone && cand.zone !== 'other' && cand.zone === target.zone) {
      score += 25;
      reasons.push(`Same Campus Zone (${cand.location})`);
    } else if (cand.location && target.location) {
      const firstTargetWord = target.location.toLowerCase().split(' ')[0];
      if (firstTargetWord && firstTargetWord.length >= 3 && cand.location.toLowerCase().includes(firstTargetWord)) {
        score += 15;
        reasons.push('Location proximity match');
      }
    }

    // 3. Keyword overlap (up to 38 points)
    const candWords = new Set([
      ...extractKeywords(cand.title),
      ...extractKeywords(cand.description)
    ]);

    const overlappingWords = [];
    allTargetWords.forEach((word) => {
      if (candWords.has(word)) {
        overlappingWords.push(word);
      }
    });

    if (overlappingWords.length > 0) {
      const keywordScore = Math.min(38, overlappingWords.length * 15);
      score += keywordScore;
      reasons.push(`Key terms match: "${overlappingWords.slice(0, 3).join('", "')}"`);
    }

    // STRICT REQUIREMENT: Show a match only if it scores above zero
    if (score > 0) {
      // Normalize score into percentage (bounded between 35% and 98%)
      const matchScore = Math.min(98, Math.max(35, score));
      matches.push({
        candidate: cand,
        matchScore,
        reasons: reasons.length > 0 ? reasons : ['Potential related campus item'],
        overlappingWords
      });
    }
  }

  // Sort descending by highest match score
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
