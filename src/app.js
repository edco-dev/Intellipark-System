// Import the functions you need from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDbXiBef-fXk9igZ5mZv_F896kyPtnXxvk",
    authDomain: "intellipark-db283.firebaseapp.com",
    projectId: "intellipark-db283",
    storageBucket: "intellipark-db283.appspot.com",
    messagingSenderId: "159684284966",
    appId: "1:159684284966:web:5149d6318931c0bedc4ce7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to handle form submission
const form = document.getElementById('driverForm');
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        // Add a new document with a generated ID to Firestore
        const docRef = await addDoc(collection(db, "drivers"), data);
        console.log("Document written with ID: ", docRef.id);
        alert("Registration successful!");

        // Reset the form after successful submission
        form.reset(); // Reset the form
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Registration failed!");
    }
});
