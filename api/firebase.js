// firebase.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account key
admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Adjust this if you're using a specific service account key
});

const db = admin.firestore();

module.exports = { db };
