// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//     apiKey: "AIzaSyDbXiBef-fXk9igZ5mZv_F896kyPtnXxvk",
//     authDomain: "intellipark-db283.firebaseapp.com",
//     projectId: "intellipark-db283",
//     storageBucket: "intellipark-db283.appspot.com",
//     messagingSenderId: "159684284966",
//     appId: "1:159684284966:web:5149d6318931c0bedc4ce7"
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const auth = getAuth(app);

// export { db, auth };

//Production
import 'dotenv/config'; // Ensure this line is at the top

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.APP_FIREBASE_API_KEY,
    authDomain: process.env.APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
