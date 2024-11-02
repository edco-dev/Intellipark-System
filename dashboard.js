// Import Firebase from the locally installed package
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

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

// Total parking slots
const TOTAL_SLOTS = 50;

// Function to update dashboard statistics
function updateDashboard(totalVehicles, availableSlots, vehiclesIn, vehiclesOut) {
    document.querySelector('.totalVehicles i').textContent = totalVehicles;
    document.querySelector('.slotsAvailable i').textContent = `${totalVehicles}/${TOTAL_SLOTS}`;
    document.querySelector('.vehiclesIn i').textContent = vehiclesIn;
    document.querySelector('.vehiclesOut i').textContent = vehiclesOut;
}

// Real-time listener for vehiclesIn collection
const vehiclesInRef = collection(db, 'vehiclesIn');
onSnapshot(vehiclesInRef, (snapshot) => {
    const vehiclesIn = snapshot.size; // Count of documents in vehiclesIn
    const totalVehicles = vehiclesIn; // All documents are vehicles currently parked
    const availableSlots = TOTAL_SLOTS - totalVehicles; // Calculate available slots

    // Update dashboard with vehicles in count
    updateDashboard(totalVehicles, availableSlots, vehiclesIn, 0); // Placeholder for vehicles out
});

// Real-time listener for vehiclesOut collection
const vehiclesOutRef = collection(db, 'vehiclesOut');
onSnapshot(vehiclesOutRef, (snapshot) => {
    const vehiclesOut = snapshot.size; // Count of documents in vehiclesOut

    // Calculate total vehicles based on vehicles in
    const totalVehicles = document.querySelector('.vehiclesIn i').textContent;

    // Update the dashboard with the latest counts
    const availableSlots = TOTAL_SLOTS - totalVehicles; // Recalculate available slots
    updateDashboard(totalVehicles, availableSlots, totalVehicles, vehiclesOut);
});
