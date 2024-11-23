import { db } from '/app.js';
import { query, where, collection, doc, getDoc, addDoc, deleteDoc, updateDoc, getDocs } from "firebase/firestore";

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

        // Insert the generated incrementing transaction ID and vehicle data into the row
        row.insertCell(0).innerText = incrementingId;
        row.insertCell(1).innerText = vehicle.plateNumber || "N/A";
        row.insertCell(2).innerText = vehicle.vehicleOwner;
        row.insertCell(3).innerText = vehicle.contactNumber || "N/A";
        row.insertCell(4).innerText = vehicle.userType || "N/A";
        row.insertCell(5).innerText = vehicle.vehicleType || "N/A";
        row.insertCell(6).innerText = vehicle.date || "N/A";
        row.insertCell(7).innerText = vehicle.timeIn || "N/A";

        // Add checkout button
        const actionsCell = row.insertCell(8);
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
    // Get the modal and modal content elements
    const confirmationModal = document.getElementById('confirmationModal');
    const popupContent = confirmationModal.querySelector('.popup-content');

    // Show the modal with animation
    confirmationModal.classList.remove('hidden');
    setTimeout(() => {
        confirmationModal.classList.remove('opacity-0', 'scale-75');
        confirmationModal.classList.add('opacity-100', 'scale-100');
        popupContent.classList.remove('opacity-0', 'scale-75');
        popupContent.classList.add('opacity-100', 'scale-100');
    }, 10);

    // Handle Yes and No button actions
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    // Function to close the modal with animation
    const closeModal = () => {
        confirmationModal.classList.add('opacity-0', 'scale-75');
        popupContent.classList.add('opacity-0', 'scale-75');
        setTimeout(() => {
            confirmationModal.classList.add('hidden');
            confirmationModal.classList.remove('opacity-0', 'scale-75', 'opacity-100', 'scale-100');
            popupContent.classList.remove('opacity-0', 'scale-75', 'opacity-100', 'scale-100');
        }, 300);
    };

    // "Yes" button confirms checkout
    confirmYes.onclick = async () => {
        closeModal(); // Hide the modal with animation

        try {
            const vehicleRef = doc(db, "vehiclesIn", vehicleId);
            const vehicleDoc = await getDoc(vehicleRef);

            if (!vehicleDoc.exists()) {
                alert("Vehicle not found in vehicles in.");
                return;
            }

            const timeOut = formatTime(new Date()); // Get the current time for checkout
            const vehicleData = vehicleDoc.data();
            const plateNumber = vehicleData.plateNumber;

            // Add the vehicle to the "vehiclesOut" collection and remove it from "vehiclesIn"
            await addDoc(collection(db, "vehiclesOut"), { 
                ...vehicleData, 
                timeOut 
            });
            await deleteDoc(vehicleRef);

            // Log the timeOut in the parkingLog collection
            const parkingLogRef = collection(db, "parkingLog");
            const parkingLogQuery = query(parkingLogRef, where("plateNumber", "==", plateNumber));

            console.log("Searching for parking log with plate number:", plateNumber);

            const parkingLogSnapshot = await getDocs(parkingLogQuery);

            if (!parkingLogSnapshot.empty) {
                const parkingLogDoc = parkingLogSnapshot.docs[0]; // Get the first matching document
                console.log("Parking log found. Updating timeOut...");

                // Update the parkingLog with the timeOut
                await updateDoc(parkingLogDoc.ref, {
                    timeOut // Set the actual timeOut when the vehicle checks out
                });

                console.log(`Updated timeOut in parking log for plate ${plateNumber}`);
            } else {
                console.error("No matching parking log entry found for this plate number.");
            }

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
    const options = { 
        timeZone: 'Asia/Manila', // Ensure the time is in Philippine Standard Time
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric', 
        hour12: true 
    };
    return date.toLocaleTimeString('en-US', options); // Use 'en-US' for AM/PM style
}

document.getElementById("paginationText").innerText = currentPage;
document.getElementById("pageTracker").innerText = `Page ${currentPage} of ${Math.ceil(driversData.length / itemsPerPage)}`;

// Enable/disable pagination buttons
document.getElementById("prevPageBtn").disabled = currentPage === 1;
document.getElementById("nextPageBtn").disabled = endIndex >= driversData.length;
