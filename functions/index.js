// Firebase Cloud Functions — Server-side score triggers
// These run on Firebase's servers so scores can't be tampered with client-side

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

/**
 * Trigger: When a new vote is created
 * Recalculates the kitchen's hygiene score
 */
exports.onVoteCreated = functions.firestore
  .document("votes/{voteId}")
  .onCreate(async (snap) => {
    const { kitchenId } = snap.data();
    await recalculateScore(kitchenId);
  });

/**
 * Trigger: When a new proof is submitted
 * Updates lastVerifiedAt and recalculates score
 */
exports.onProofSubmitted = functions.firestore
  .document("proofs/{proofId}")
  .onCreate(async (snap) => {
    const { kitchenId } = snap.data();
    await recalculateScore(kitchenId);
  });

/**
 * Shared helper — recalculate and persist score
 */
async function recalculateScore(kitchenId) {
  // 1. Get kitchen data
  const kitchenDoc = await db.collection("kitchens").doc(kitchenId).get();
  if (!kitchenDoc.exists) return;

  const kitchen = kitchenDoc.data();

  // 2. Community score
  const votesSnap = await db
    .collection("votes")
    .where("kitchenId", "==", kitchenId)
    .get();

  let clean = 0;
  let total = 0;
  votesSnap.docs.forEach((doc) => {
    total++;
    if (doc.data().vote === "clean") clean++;
  });
  const communityScore = total > 0 ? clean / total : 0;

  // 3. Recency score
  let recencyScore = 0;
  if (kitchen.lastVerifiedAt) {
    const hoursSince =
      (Date.now() - kitchen.lastVerifiedAt.toMillis()) / 3_600_000;
    recencyScore = Math.max(0, Math.min(1, 1 - hoursSince / 24));
  }

  // 4. Checklist score
  const checklistScore = kitchen.checklistScore || 0;

  // 5. Weighted composite
  const score =
    0.6 * communityScore + 0.25 * recencyScore + 0.15 * checklistScore;
  const finalScore = Math.round(score * 100);

  // 6. Persist
  await db.collection("kitchens").doc(kitchenId).update({
    hygieneScore: finalScore,
  });

  console.log(`Kitchen ${kitchenId} score updated to ${finalScore}`);
}
