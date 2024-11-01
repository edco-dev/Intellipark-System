import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, getDoc } from "firebase/firestore"; 
import { db } from "./app"; // Ensure this points to your Firebase configuration

document.addEventListener('DOMContentLoaded', () => {
    fetchVehiclesData(); // Fetch vehicles once the DOM is ready
});

async function fetchVehiclesData() {
    try {
        const querySnapshot = await getDocs(collection(db, "vehiclesIn"));
        const vehiclesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched vehicles data:", vehiclesData); // Debugging log
        displayVehicles(vehiclesData); 
    } catch (error) {
        console.error("Error fetching vehicles data:", error); // Log any errors
    }
}

function displayVehicles(vehiclesData) {
    const vehiclesTableBody = document.querySelector('#vehiclesTable tbody');
    vehiclesTableBody.innerHTML = ""; // Clear previous entries

    vehiclesData.forEach(vehicle => {
        const row = vehiclesTableBody.insertRow();
        row.insertCell(0).innerText = vehicle.transactionId || "N/A"; // Ensure the field exists
        row.insertCell(1).innerText = vehicle.plateNumber || "N/A"; // Ensure the field exists
        row.insertCell(2).innerText = vehicle.vehicleOwner || "N/A"; // Ensure the field exists
        row.insertCell(3).innerText = vehicle.contactNumber || "N/A"; // Ensure the field exists
        row.insertCell(4).innerText = vehicle.userType || "N/A"; // Ensure the field exists
        row.insertCell(5).innerText = vehicle.vehicleType || "N/A"; // Ensure the field exists
        row.insertCell(6).innerText = vehicle.vehicleColor || "N/A"; // Ensure the field exists
        row.insertCell(7).innerText = vehicle.date || "N/A"; // Ensure the field exists
        row.insertCell(8).innerText = vehicle.timeIn || "N/A"; // Ensure the field exists

        // Actions Cell for vehicle exit
        const actionsCell = row.insertCell(9);
        const exitButton = document.createElement('button');
        exitButton.innerText = 'Checkout';
        exitButton.onclick = () => checkoutVehicle(vehicle.id); 
        actionsCell.appendChild(exitButton);
    });
}

async function checkoutVehicle(vehicleId) {
    const confirmed = confirm("Are you sure you want to checkout this vehicle?");
    if (!confirmed) {
        return; // If the user clicks "Cancel", exit the function
    }

    try {
        // Fetch the vehicle to checkout
        const vehicleRef = doc(db, "vehiclesIn", vehicleId);
        const vehicleDoc = await getDoc(vehicleRef); // Ensure this is imported
        if (!vehicleDoc.exists()) {
            alert("Vehicle not found in vehicles in.");
            return;
        }

        const vehicleData = vehicleDoc.data();

        // Move the vehicle to vehiclesOut
        await addDoc(collection(db, "vehiclesOut"), { ...vehicleData });

        // Remove the vehicle from vehiclesIn
        await deleteDoc(vehicleRef);

        alert("Vehicle checked out successfully!");
        fetchVehiclesData(); // Refresh the list
    } catch (error) {
        console.error("Error during checkout:", error);
        alert("Failed to checkout vehicle. Please try again.");
    }
}
