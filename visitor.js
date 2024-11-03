import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Firebase configuration
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

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("visitorForm");
    
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
    
            // Retrieve form values
            const firstName = document.getElementById("firstName").value;
            const middleName = document.getElementById("middleName").value || "";
            const lastName = document.getElementById("lastName").value;
            const contactNumber = document.getElementById("contactNumber").value;
            const plateNumber = document.getElementById("plateNumber").value;
            const vehicleType = document.getElementById("vehicleType").value;
            const userType = document.getElementById("userType").value;

            const visitorData = {
                firstName,
                middleName,
                lastName,
                contactNumber,
                plateNumber,
                vehicleType,
                userType,
                timestamp: new Date(),
            };
    
            try {
                // Add visitor info to the drivers collection first
                await addDoc(collection(db, "drivers"), visitorData);

                // Add visitor info to the vehiclesIn collection
                await addDoc(collection(db, "vehiclesIn"), visitorData);
    
                alert("Visitor information added successfully to both collections!");
                form.reset();
            } catch (error) {
                console.error("Error adding visitor information:", error);
                alert("There was an error. Please try again.");
            }
        });
    } else {
        console.error("Visitor form element not found.");
    }
});
