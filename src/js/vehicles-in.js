import { collection, getDocs, doc, getDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from '/app.js';

document.addEventListener('DOMContentLoaded', fetchVehiclesData);

async function fetchVehiclesData() {
    try {
        const querySnapshot = await getDocs(collection(db, "vehiclesIn"));
        const vehiclesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched vehicles data:", vehiclesData);
        displayVehicles(vehiclesData);
    } catch (error) {
        console.error("Error fetching vehicles data:", error);
    }
}

function displayVehicles(vehiclesData) {
    const vehiclesTableBody = document.querySelector('#vehiclesTable tbody');
    vehiclesTableBody.innerHTML = "";

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

        const actionsCell = row.insertCell(9);
        const exitButton = document.createElement('button');
        exitButton.innerText = 'Checkout';
        exitButton.onclick = () => checkoutVehicle(vehicle.id);
        actionsCell.appendChild(exitButton);
    });
}

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

        const vehicleData = vehicleDoc.data();
        await addDoc(collection(db, "vehiclesOut"), { ...vehicleData });
        await deleteDoc(vehicleRef);

        alert("Vehicle checked out successfully!");
        fetchVehiclesData(); // Refresh the list
    } catch (error) {
        console.error("Error during checkout:", error);
        alert("Failed to checkout vehicle. Please try again.");
    }
}
