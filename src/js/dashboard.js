import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from '/app.js';
import { onAuthStateChanged } from 'firebase/auth';

const TOTAL_SLOTS_TWO_WHEEL = 5;
const TOTAL_SLOTS_FOUR_WHEEL = 5;

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User is logged in:', user);
        } else {
            console.log('No user is logged in. Redirecting to login page...');
            window.location.href = '/index.html';
        }
    });
});

function updateDashboard(twoWheelsCount, fourWheelsCount, vehiclesInCount, vehiclesOutCount) {
    const twoWheelsElement = document.querySelector('#twoWheels h3 i');
    const fourWheelsElement = document.querySelector('#fourWheels h3 i');
    const vehiclesInElement = document.querySelector('#vehiclesIn h3 i');
    const vehiclesOutElement = document.querySelector('#vehiclesOut h3 i');

    if (twoWheelsElement && fourWheelsElement && vehiclesInElement && vehiclesOutElement) {
        // Update two-wheeled and four-wheeled vehicles with /10 format
        twoWheelsElement.textContent = `${twoWheelsCount}/${TOTAL_SLOTS_TWO_WHEEL}`;
        fourWheelsElement.textContent = `${fourWheelsCount}/${TOTAL_SLOTS_FOUR_WHEEL}`;

        // Calculate total vehicles and display in the vehiclesIn card with /10
        const totalVehicles = twoWheelsCount + fourWheelsCount;
        vehiclesInElement.textContent = `${totalVehicles}/10`;  // Combined total with /10 format

        // Update vehicles out count
        vehiclesOutElement.textContent = vehiclesOutCount;
    } else {
        console.error('One or more elements were not found in the DOM.');
    }
}


// Listen for changes in the 'vehicleTwo' collection (2-wheeled vehicles)
const twoWheelRef = collection(db, 'vehicleTwo');
onSnapshot(twoWheelRef, (snapshot) => {
    const twoWheelsCount = snapshot.size;

    // Fetch data for 4-wheeled vehicles and update the dashboard
    fetchAndUpdateDashboard(twoWheelsCount);
});

// Listen for changes in the 'vehicleFour' collection (4-wheeled vehicles)
function fetchAndUpdateDashboard(twoWheelsCount) {
    const fourWheelRef = collection(db, 'vehicleFour');
    onSnapshot(fourWheelRef, (snapshot) => {
        const fourWheelsCount = snapshot.size;

        // Fetch data for general vehicles in and out
        fetchVehiclesInOut(twoWheelsCount, fourWheelsCount);
    });
}

// Listen for changes in the 'vehiclesIn' and 'vehiclesOut' collections
function fetchVehiclesInOut(twoWheelsCount, fourWheelsCount) {
    const vehiclesInRef = collection(db, 'vehiclesIn');
    const vehiclesOutRef = collection(db, 'vehiclesOut');

    onSnapshot(vehiclesInRef, (snapshot) => {
        const vehiclesInCount = snapshot.size;

        onSnapshot(vehiclesOutRef, (snapshot) => {
            const vehiclesOutCount = snapshot.size;

            // Update the dashboard with all data
            updateDashboard(twoWheelsCount, fourWheelsCount, vehiclesInCount, vehiclesOutCount);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar a[data-section]');
    const sections = document.querySelectorAll('.content-section');

    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
            section.style.display = section.id === sectionId ? 'block' : 'none';
        });
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    showSection('dashboard');
});
