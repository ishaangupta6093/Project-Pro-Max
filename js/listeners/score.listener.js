// Score Listener — Real-time Firestore listener for live hygiene score updates
// Uses onSnapshot so the UI updates instantly without page refresh

/**
 * Listen to a kitchen's hygiene score in real time
 * @param {string} kitchenId
 * @param {Function} callback - called with the new score (0–100) on every change
 * @returns {Function} unsubscribe function — call to stop listening
 */
function listenToKitchenScore(kitchenId, callback) {
  return db
    .collection("kitchens")
    .doc(kitchenId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        callback(data.hygieneScore, data);
      }
    });
}

/**
 * Listen to all kitchens' scores (for the index/listing page)
 * @param {Function} callback - called with array of kitchen objects on every change
 * @returns {Function} unsubscribe function
 */
function listenToAllKitchens(callback) {
  return db.collection("kitchens").onSnapshot((snapshot) => {
    const kitchens = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(kitchens);
  });
}
