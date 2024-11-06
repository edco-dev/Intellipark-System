import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDbXiBef-fXk9igZ5mZv_F896kyPtnXxvk",
    authDomain: "intellipark-db283.firebaseapp.com",
    projectId: "intellipark-db283",
    storageBucket: "intellipark-db283.appspot.com",
    messagingSenderId: "159684284966",
    appId: "1:159684284966:web:5149d6318931c0bedc4ce7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function logoutUser() {
    console.log("Executing logoutUser function");
    signOut(auth)
        .then(() => {
            console.log("User successfully logged out");
            window.location.href = '/index.html';
        })
        .catch((error) => {
            console.error("Error during logout:", error);
            alert("Failed to log out. Please try again.");
        });
}
