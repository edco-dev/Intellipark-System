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
document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar a[data-section]');
    const sections = document.querySelectorAll('.content-section');

    // Function to show the selected section and hide others
    function showSection(sectionId) {
        sections.forEach(section => {
            // Toggle visibility based on matching ID
            if (section.id === sectionId) {
                section.classList.add('active');
                section.style.display = 'block'; // Show active section
            } else {
                section.classList.remove('active');
                section.style.display = 'none'; // Hide other sections
            }
        });
    }

    // Add click event listeners to each sidebar link
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent page reload on link click
            const sectionId = link.getAttribute('data-section'); // Get section ID from data-section attribute
            showSection(sectionId); // Show the selected section
        });
    });

    // Display the default section on page load (e.g., Dashboard)
    showSection('dashboard'); // Show 'dashboard' as the initial section
});
