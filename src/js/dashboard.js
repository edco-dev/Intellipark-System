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
    document.querySelector('.totalVehicles i').textContent = totalVehicles;
    document.querySelector('.slotsAvailable i').textContent = `${totalVehicles}/${TOTAL_SLOTS}`;
    document.querySelector('.vehiclesIn i').textContent = vehiclesIn;
    document.querySelector('.vehiclesOut i').textContent = vehiclesOut;
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
    const totalVehicles = document.querySelector('.vehiclesIn i').textContent;
    const availableSlots = TOTAL_SLOTS - totalVehicles;
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
