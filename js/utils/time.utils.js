// Time Utilities — Recency calculations for the scoring algorithm

/**
 * Calculate recency score (0–1)
 * 1.0 = verified in the last hour
 * 0.0 = verified 24+ hours ago (or never)
 * Linear decay over 24 hours
 *
 * @param {firebase.firestore.Timestamp|null} lastVerifiedAt
 * @returns {number} score between 0 and 1
 */
function getRecencyScore(lastVerifiedAt) {
  if (!lastVerifiedAt) return 0;

  const now = Date.now();
  const verifiedMs = lastVerifiedAt.toMillis();
  const hoursSince = (now - verifiedMs) / 3_600_000; // ms → hours

  // Linear decay: 1.0 at 0 hrs, 0.0 at 24 hrs
  return Math.max(0, Math.min(1, 1 - hoursSince / 24));
}

/**
 * Get a human-readable recency label
 * @param {firebase.firestore.Timestamp|null} lastVerifiedAt
 * @returns {string} e.g. "Verified 2 hrs ago", "Verified 15 min ago", "Not yet verified"
 */
function getRecencyLabel(lastVerifiedAt) {
  if (!lastVerifiedAt) return "Not yet verified";

  const now = Date.now();
  const verifiedMs = lastVerifiedAt.toMillis();
  const diffMs = now - verifiedMs;

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return "Verified just now";
  if (minutes < 60) return `Verified ${minutes} min ago`;
  if (hours < 24) return `Verified ${hours} hr${hours > 1 ? "s" : ""} ago`;
  return `Verified ${days} day${days > 1 ? "s" : ""} ago`;
}

/**
 * Check if a proof is considered "fresh" (within last 6 hours)
 * @param {firebase.firestore.Timestamp|null} lastVerifiedAt
 * @returns {boolean}
 */
function isProofFresh(lastVerifiedAt) {
  if (!lastVerifiedAt) return false;
  const hoursSince = (Date.now() - lastVerifiedAt.toMillis()) / 3_600_000;
  return hoursSince <= 6;
}
