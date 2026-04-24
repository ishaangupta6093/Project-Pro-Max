// Score Service — Core hygiene scoring algorithm
//
// Formula from README:
//   Score = (0.6 × Community) + (0.25 × Recency) + (0.15 × Checklist)

/**
 * Calculate the composite hygiene score for a kitchen
 * @param {string} kitchenId
 * @param {firebase.firestore.Timestamp} lastVerifiedAt
 * @param {number} checklistScore - 0 to 1 (fraction of checklist items passed)
 * @returns {number} score from 0 to 100
 */
async function calculateHygieneScore(
  kitchenId,
  lastVerifiedAt,
  checklistScore
) {
  // 1. Community score (0–1): ratio of "clean" votes
  const { ratio: communityScore } = await getVoteSummary(kitchenId);

  // 2. Recency score (0–1): how recently the kitchen was verified
  const recencyScore = getRecencyScore(lastVerifiedAt);

  // 3. Checklist score is already 0–1

  // 4. Weighted composite
  const score =
    0.6 * communityScore + 0.25 * recencyScore + 0.15 * checklistScore;

  return Math.round(score * 100); // Returns 0–100
}

/**
 * Recalculate and persist the score for a kitchen
 * Call this after a new vote or proof submission
 * @param {string} kitchenId
 */
async function recalculateAndSaveScore(kitchenId) {
  const kitchen = await getKitchen(kitchenId);
  if (!kitchen) return;

  const score = await calculateHygieneScore(
    kitchenId,
    kitchen.lastVerifiedAt,
    kitchen.checklistScore
  );

  await updateKitchenScore(kitchenId, score);
  return score;
}
