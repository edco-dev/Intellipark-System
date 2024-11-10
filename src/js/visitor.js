import { collection, addDoc } from "firebase/firestore";
import { db } from '/app.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("visitorForm");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Collecting visitor data from the form
            const visitorData = {
                firstName: document.getElementById("firstName").value,
                middleName: document.getElementById("middleName").value || "",
                lastName: document.getElementById("lastName").value,
                contactNumber: document.getElementById("contactNumber").value,
                plateNumber: document.getElementById("plateNumber").value,
                vehicleType: document.getElementById("vehicleType").value,
                userType: "Visitor", // Set userType to "Visitor"
                timestamp: new Date(),
            };

            // Generate a unique transactionId based on the current timestamp and plateNumber
            const date = new Date();
            const transactionId = `${date.getTime()}-${visitorData.plateNumber}`;
            const formattedDate = date.toISOString().split('T')[0];
            const timeIn = date.toLocaleTimeString();

            // Add a timeIn field to the vehicle data when entering
            const vehicleInData = {
                ...visitorData,
                transactionId,
                timeIn,
                date: formattedDate
            };

            // Add the same data to the parkingLog collection for logging
            const parkingLogData = {
                ...vehicleInData,
                timeOut: null,
            };

            try {
                // Add the visitor to the 'drivers' collection
                await addDoc(collection(db, "drivers"), visitorData);

                // Add the visitor's vehicle data (with timeIn and transactionId) to the 'vehiclesIn' collection
                await addDoc(collection(db, "vehiclesIn"), vehicleInData);

                // Log the vehicle entry to the 'parkingLog' collection
                await addDoc(collection(db, "parkingLog"), parkingLogData);

                alert("Visitor information added successfully to all collections!");
                form.reset(); // Reset the form after successful submission
            } catch (error) {
                console.error("Error adding visitor information:", error);
                alert("There was an error. Please try again.");
            }
        });
    } else {
        console.error("Visitor form element not found.");
    }
});
