// Proof Service — Image uploads to Firebase Storage + proof documents to Firestore

/**
 * Upload an image file to Firebase Storage
 * @param {string} kitchenId
 * @param {File} file - image file from input
 * @param {string} type - "front" or "kitchen"
 * @returns {string} download URL
 */
async function uploadImage(kitchenId, file, type) {
  const timestamp = Date.now();
  const ref = storage.ref(`proofs/${kitchenId}/${type}_${timestamp}.jpg`);
  await ref.put(file);
  return await ref.getDownloadURL();
}

/**
 * Submit a complete proof (both images + checklist)
 * @param {string} kitchenId
 * @param {File} frontFile - front-of-house image
 * @param {File} kitchenFile - kitchen image
 * @param {Object} checklist - { cleanSurfaces, staffGloves, foodCovered, ... }
 */
async function submitProof(kitchenId, frontFile, kitchenFile, checklist) {
  // 1. Upload both images
  const frontImageUrl = await uploadImage(kitchenId, frontFile, "front");
  const kitchenImageUrl = await uploadImage(kitchenId, kitchenFile, "kitchen");

  // 2. Calculate checklist score (fraction of items checked)
  const checklistItems = Object.values(checklist);
  const checklistScore =
    checklistItems.filter(Boolean).length / checklistItems.length;

  // 3. Write proof document to Firestore
  const proofRef = await db.collection("proofs").add({
    kitchenId,
    frontImageUrl,
    kitchenImageUrl,
    checklist,
    checklistScore,
    submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  // 4. Update kitchen's last verified time and checklist score
  await db.collection("kitchens").doc(kitchenId).update({
    lastVerifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
    checklistScore,
  });

  return proofRef.id;
}

/**
 * Get the most recent proof for a kitchen
 * @param {string} kitchenId
 * @returns {Object|null} proof document data
 */
async function getLatestProof(kitchenId) {
  const snapshot = await db
    .collection("proofs")
    .where("kitchenId", "==", kitchenId)
    .orderBy("submittedAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

/**
 * Get all proofs for a kitchen (for history view)
 * @param {string} kitchenId
 * @returns {Array} array of proof objects
 */
async function getProofHistory(kitchenId) {
  const snapshot = await db
    .collection("proofs")
    .where("kitchenId", "==", kitchenId)
    .orderBy("submittedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
