import { db } from '/app.js';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc } from "firebase/firestore";

let allVehiclesData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchVehiclesData();
    setupSearch();
});

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

function displayVehicles(vehiclesData) {
    const vehiclesTableBody = document.querySelector('#vehiclesTable tbody');
    vehiclesTableBody.innerHTML = "";  // Clear any existing rows

    // Loop through the vehiclesData and display each vehicle with an incrementing ID
    vehiclesData.forEach((vehicle, index) => {
        const row = vehiclesTableBody.insertRow();

        // Generate incrementing transaction ID (001, 002, 003, ...)
        const incrementingId = (index + 1).toString().padStart(3, '0');

        // Handle the combination of firstName, middleName, and lastName for vehicle owner
        const vehicleOwner = `${vehicle.firstName || ''} ${vehicle.middleName || ''} ${vehicle.lastName || ''}`.trim() || "N/A";

        // Insert the generated incrementing transaction ID and vehicle data into the row
        row.insertCell(0).innerText = incrementingId;
        row.insertCell(1).innerText = vehicle.plateNumber || "N/A";
        row.insertCell(2).innerText = vehicleOwner;
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
        exitButton.style.backgroundColor = '#4aa5ff';
        exitButton.style.border = 'none';
        exitButton.style.padding = '5px';
        exitButton.style.width = '50px';
        exitButton.style.borderRadius = '20px';
        exitButton.style.color = '#ffffff';
        exitButton.style.backgroundColor = '#ed7576';
        exitButton.onclick = () => checkoutVehicle(vehicle.id);
        actionsCell.appendChild(exitButton);
    });
}

async function checkoutVehicle(vehicleId) {
    // Display the confirmation modal
    const confirmationModal = document.getElementById('confirmationModal');
    confirmationModal.style.display = 'flex';

    // Handle Yes and No button actions
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    const closeModal = () => {
        confirmationModal.style.display = 'none';
    };

    // "Yes" button confirms checkout
    confirmYes.onclick = async () => {
        closeModal(); // Hide the modal

        try {
            const vehicleRef = doc(db, "vehiclesIn", vehicleId);
            const vehicleDoc = await getDoc(vehicleRef);

            if (!vehicleDoc.exists()) {
                alert("Vehicle not found in vehicles in.");
                return;
            }

            const timeOut = formatTime(new Date());
            const vehicleData = vehicleDoc.data();

            await addDoc(collection(db, "vehiclesOut"), { 
                ...vehicleData, 
                timeOut 
            });

            await deleteDoc(vehicleRef);

            alert("Vehicle checked out successfully!");
            fetchVehiclesData(); // Refresh vehicle data
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("Failed to checkout vehicle. Please try again.");
        }
    };

    // "No" button cancels the action and closes the modal
    confirmNo.onclick = closeModal;
}


// Function to setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();

        // Filter the vehicles data based on the search term
        const filteredVehicles = allVehiclesData.filter(vehicle => {
            return (
                (vehicle.transactionId && vehicle.transactionId.toLowerCase().includes(query)) ||
                (vehicle.plateNumber && vehicle.plateNumber.toLowerCase().includes(query)) ||
                (vehicle.firstName && vehicle.firstName.toLowerCase().includes(query)) ||
                (vehicle.middleName && vehicle.middleName.toLowerCase().includes(query)) ||
                (vehicle.lastName && vehicle.lastName.toLowerCase().includes(query)) ||
                (vehicle.contactNumber && vehicle.contactNumber.toLowerCase().includes(query)) ||
                (vehicle.userType && vehicle.userType.toLowerCase().includes(query)) ||
                (vehicle.vehicleType && vehicle.vehicleType.toLowerCase().includes(query)) ||
                (vehicle.vehicleColor && vehicle.vehicleColor.toLowerCase().includes(query)) ||
                (vehicle.date && vehicle.date.toLowerCase().includes(query)) ||
                (vehicle.timeIn && vehicle.timeIn.toLowerCase().includes(query))
            );
        });

        // Display the filtered vehicles
        displayVehicles(filteredVehicles);  
    });
}

function formatTime(date) {
    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    return date.toLocaleTimeString('en-US', options);
}


document.getElementById("paginationText").innerText = currentPage;
document.getElementById("pageTracker").innerText = `Page ${currentPage} of ${Math.ceil(driversData.length / itemsPerPage)}`;

// Enable/disable pagination buttons
document.getElementById("prevPageBtn").disabled = currentPage === 1;
document.getElementById("nextPageBtn").disabled = endIndex >= driversData.length;
