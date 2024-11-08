import { collection, getDocs, doc, getDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from '/app.js';

let allVehiclesData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchVehiclesData();
    setupSearch();
});

// Fetch data from Firestore
async function fetchVehiclesData() {
    try {
        const querySnapshot = await getDocs(collection(db, "vehiclesIn"));
        allVehiclesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched vehicles data:", allVehiclesData);
        displayVehicles(allVehiclesData);  // Display all vehicles initially
    } catch (error) {
        console.error("Error fetching vehicles data:", error);
    }
}

// Display vehicle data in the table
function displayVehicles(vehiclesData) {
    const vehiclesTableBody = document.querySelector('#vehiclesTable tbody');
    vehiclesTableBody.innerHTML = "";  // Clear existing table rows

    vehiclesData.forEach(vehicle => {
        const row = vehiclesTableBody.insertRow();
        row.insertCell(0).innerText = vehicle.transactionId || "N/A";
        row.insertCell(1).innerText = vehicle.plateNumber || "N/A";
        row.insertCell(2).innerText = vehicle.vehicleOwner || "N/A";
        row.insertCell(3).innerText = vehicle.contactNumber || "N/A";
        row.insertCell(4).innerText = vehicle.userType || "N/A";
        row.insertCell(5).innerText = vehicle.vehicleType || "N/A";
        row.insertCell(6).innerText = vehicle.vehicleColor || "N/A";
        row.insertCell(7).innerText = vehicle.date || "N/A";
        row.insertCell(8).innerText = vehicle.timeIn || "N/A";

        // Add checkout button
        const actionsCell = row.insertCell(9);
        const exitButton = document.createElement('button');
        exitButton.innerText = 'End';
        exitButton.onclick = () => checkoutVehicle(vehicle.id);
        actionsCell.appendChild(exitButton);
    });
}

// Checkout vehicle (move it to vehiclesOut collection and delete from vehiclesIn)
async function checkoutVehicle(vehicleId) {
    const confirmed = confirm("Are you sure you want to checkout this vehicle?");
    if (!confirmed) return;

    try {
        const vehicleRef = doc(db, "vehiclesIn", vehicleId);
        const vehicleDoc = await getDoc(vehicleRef);

        if (!vehicleDoc.exists()) {
            alert("Vehicle not found in vehicles in.");
            return;
        }

        const timeOut = formatTime(new Date()); // Format current time for checkout
        const vehicleData = vehicleDoc.data();
        await addDoc(collection(db, "vehiclesOut"), { 
            ...vehicleData, 
            timeOut 
        });

        await deleteDoc(vehicleRef);  // Remove from vehiclesIn collection

        alert("Vehicle checked out successfully!");
        fetchVehiclesData();  // Refresh the data
    } catch (error) {
        console.error("Error during checkout:", error);
        alert("Failed to checkout vehicle. Please try again.");
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();

        const filteredVehicles = allVehiclesData.filter(vehicle =>
            (vehicle.transactionId && vehicle.transactionId.toLowerCase().includes(query)) ||
            (vehicle.plateNumber && vehicle.plateNumber.toLowerCase().includes(query)) ||
            (vehicle.vehicleOwner && vehicle.vehicleOwner.toLowerCase().includes(query)) ||
            (vehicle.contactNumber && vehicle.contactNumber.toLowerCase().includes(query)) ||
            (vehicle.userType && vehicle.userType.toLowerCase().includes(query)) ||
            (vehicle.vehicleType && vehicle.vehicleType.toLowerCase().includes(query)) ||
            (vehicle.vehicleColor && vehicle.vehicleColor.toLowerCase().includes(query)) ||
            (vehicle.date && vehicle.date.toLowerCase().includes(query)) ||
            (vehicle.timeIn && vehicle.timeIn.toLowerCase().includes(query))
        );

        displayVehicles(filteredVehicles);  // Display filtered vehicles
    });
}

// Format time to 12-hour format (e.g., 11:07:15 PM)
function formatTime(date) {
    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    return date.toLocaleTimeString('en-US', options);
}
