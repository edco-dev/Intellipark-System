// firebase.js
const admin = require('firebase-admin');

// Export the Firestore instance to be used elsewhere
const db = admin.firestore();

module.exports = { db };
