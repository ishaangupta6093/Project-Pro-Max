// Vote Service — Community votes on kitchen hygiene

/**
 * Submit a vote for a kitchen's proof
 * Uses composite doc ID (userId_proofId) to prevent duplicate votes
 * @param {string} kitchenId
 * @param {string} proofId
 * @param {string} userId
 * @param {string} vote - "clean" or "unhygienic"
 */
async function submitVote(kitchenId, proofId, userId, vote) {
  const voteId = `${userId}_${proofId}`;

  await db
    .collection("votes")
    .doc(voteId)
    .set({
      kitchenId,
      proofId,
      userId,
      vote, // "clean" or "unhygienic"
      votedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * Check if a user has already voted on a specific proof
 * @param {string} userId
 * @param {string} proofId
 * @returns {boolean}
 */
async function hasUserVoted(userId, proofId) {
  const voteId = `${userId}_${proofId}`;
  const doc = await db.collection("votes").doc(voteId).get();
  return doc.exists;
}

/**
 * Get vote summary for a kitchen (across all its proofs)
 * @param {string} kitchenId
 * @returns {Object} { clean: N, unhygienic: M, total: N+M, ratio: 0.0–1.0 }
 */
async function getVoteSummary(kitchenId) {
  const snapshot = await db
    .collection("votes")
    .where("kitchenId", "==", kitchenId)
    .get();

  let clean = 0;
  let unhygienic = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.vote === "clean") clean++;
    else unhygienic++;
  });

  const total = clean + unhygienic;
  const ratio = total > 0 ? clean / total : 0;

  return { clean, unhygienic, total, ratio };
}
