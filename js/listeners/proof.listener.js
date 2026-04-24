// Proof Listener — Real-time Firestore listener for live proof feed
// Shows new proof submissions as they happen

/**
 * Listen to the latest proofs for a kitchen in real time
 * @param {string} kitchenId
 * @param {Function} callback - called with array of proof objects on every change
 * @param {number} limit - max number of proofs to listen to (default 5)
 * @returns {Function} unsubscribe function
 */
function listenToProofs(kitchenId, callback, limit = 5) {
  return db
    .collection("proofs")
    .where("kitchenId", "==", kitchenId)
    .orderBy("submittedAt", "desc")
    .limit(limit)
    .onSnapshot((snapshot) => {
      const proofs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(proofs);
    });
}

/**
 * Listen to the single most recent proof for a kitchen
 * @param {string} kitchenId
 * @param {Function} callback - called with proof object or null
 * @returns {Function} unsubscribe function
 */
function listenToLatestProof(kitchenId, callback) {
  return db
    .collection("proofs")
    .where("kitchenId", "==", kitchenId)
    .orderBy("submittedAt", "desc")
    .limit(1)
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        callback(null);
      } else {
        const doc = snapshot.docs[0];
        callback({ id: doc.id, ...doc.data() });
      }
    });
}
