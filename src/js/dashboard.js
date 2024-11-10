import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from '/app.js';
import { onAuthStateChanged } from 'firebase/auth';

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

const TOTAL_SLOTS = 50;

function updateDashboard(totalVehicles, availableSlots, vehiclesIn, vehiclesOut) {
    const totalVehiclesElement = document.querySelector('#totalVehicles i');
    const slotsAvailableElement = document.querySelector('#slotsAvailable i');
    const vehiclesInElement = document.querySelector('#vehiclesIn i');
    const vehiclesOutElement = document.querySelector('#vehiclesOut i');

    if (totalVehiclesElement && slotsAvailableElement && vehiclesInElement && vehiclesOutElement) {
        totalVehiclesElement.textContent = totalVehicles;
        slotsAvailableElement.textContent = `${totalVehicles}/${TOTAL_SLOTS}`;
        vehiclesInElement.textContent = vehiclesIn;
        vehiclesOutElement.textContent = vehiclesOut;
    } else {
        console.error('One or more elements were not found in the DOM. Check if #vehiclesOut and others are correctly defined.');
    }
}


const vehiclesInRef = collection(db, 'vehiclesIn');
onSnapshot(vehiclesInRef, (snapshot) => {
    const vehiclesIn = snapshot.size;
    const totalVehicles = vehiclesIn;
    const availableSlots = TOTAL_SLOTS - totalVehicles;
    updateDashboard(totalVehicles, availableSlots, vehiclesIn, 0);
});

const vehiclesOutRef = collection(db, 'vehiclesOut');
onSnapshot(vehiclesOutRef, (snapshot) => {
    const vehiclesOut = snapshot.size;
    const totalVehicles = document.querySelector('#vehiclesIn i')?.textContent || 0;
    const availableSlots = TOTAL_SLOTS - totalVehicles;

    console.log('Vehicles Out Snapshot:', snapshot);
    console.log('Vehicles Out:', vehiclesOut);
    console.log('Total Vehicles:', totalVehicles);
    console.log('Available Slots:', availableSlots);

    updateDashboard(totalVehicles, availableSlots, totalVehicles, vehiclesOut);
});


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
