import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from '/app.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("visitorForm");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Collecting visitor data from the form
            const firstName = document.getElementById("firstName").value;
            const middleName = document.getElementById("middleName").value || "";
            const lastName = document.getElementById("lastName").value;

            const vehicleOwner = `${firstName} ${middleName} ${lastName}`.trim(); // Combine names into one field

            const visitorData = {
                firstName,
                middleName,
                lastName,
                contactNumber: document.getElementById("contactNumber").value,
                plateNumber: document.getElementById("plateNumber").value,
                vehicleType: document.getElementById("vehicleType").value,
                userType: document.getElementById("userType").value, // Set userType to "Visitor"
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
                vehicleOwner, // Include the combined name as vehicleOwner
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
                // Check the current count of vehicles in the 'vehiclesIn' collection
                const vehiclesInCollection = collection(db, "vehiclesIn");
                const vehiclesQuery = query(vehiclesInCollection);
                const querySnapshot = await getDocs(vehiclesQuery);

                if (querySnapshot.size >= 5) {
                    alert("Maximum vehicle capacity reached. Cannot add more vehicles.");
                    return;
                }

                // Proceed to add the visitor and their vehicle data
                await addDoc(collection(db, "drivers"), visitorData);
                await addDoc(vehiclesInCollection, vehicleInData); // Add to vehiclesIn
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
