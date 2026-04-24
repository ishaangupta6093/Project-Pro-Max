// Kitchen Service — CRUD operations for the kitchens collection

/**
 * Get a single kitchen's data by ID
 * @param {string} kitchenId
 * @returns {Object} kitchen document data
 */
async function getKitchen(kitchenId) {
  const doc = await db.collection("kitchens").doc(kitchenId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Get all kitchens (for listing on index page)
 * @returns {Array} array of kitchen objects
 */
async function getAllKitchens() {
  const snapshot = await db.collection("kitchens").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Register a new kitchen
 * @param {Object} kitchenData - { name, ownerId, location }
 * @returns {string} new kitchen document ID
 */
async function registerKitchen(kitchenData) {
  const docRef = await db.collection("kitchens").add({
    ...kitchenData,
    hygieneScore: 0,
    lastVerifiedAt: null,
    checklistScore: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update a kitchen's hygiene score
 * @param {string} kitchenId
 * @param {number} score - 0 to 100
 */
async function updateKitchenScore(kitchenId, score) {
  await db.collection("kitchens").doc(kitchenId).update({
    hygieneScore: score,
  });
}
