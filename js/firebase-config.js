// ProofPlate — Firebase Configuration
// Using Firebase Compat SDK (no bundler/npm required)

const firebaseConfig = {
  apiKey: "AIzaSyDZM0KpOOfZ7GiUYRklO2UwF3BK6PgYfag",
  authDomain: "proofplate-9433c.firebaseapp.com",
  projectId: "proofplate-9433c",
  storageBucket: "proofplate-9433c.firebasestorage.app",
  messagingSenderId: "8641684889",
  appId: "1:8641684889:web:a8784b02a7c65850ee9f08"
};

firebase.initializeApp(firebaseConfig);

const db      = firebase.firestore();
const storage = firebase.storage();
const auth    = firebase.auth();
