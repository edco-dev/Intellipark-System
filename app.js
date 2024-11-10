import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.PARCEL_APP_FIREBASE_API_KEY,
    authDomain: process.env.PARCEL_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.PARCEL_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.PARCEL_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.PARCEL_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.PARCEL_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
    
console.log(process.env.PARCEL_APP_FIREBASE_API_KEY);
