import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from '/app.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("visitorForm");
    let isSubmitting = false; // Flag to prevent multiple submissions

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (isSubmitting) return; // Block if a submission is already in progress
            isSubmitting = true; // Set flag to block further submissions

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true; // Disable the submit button to prevent spam

            // Collecting visitor data from the form
            const firstName = document.getElementById("firstName").value;
            const middleName = document.getElementById("middleName").value || "";
            const lastName = document.getElementById("lastName").value;

            const vehicleOwner = `${firstName} ${middleName} ${lastName}`.trim();

            const visitorData = {
                firstName,
                middleName,
                lastName,
                contactNumber: document.getElementById("contactNumber").value,
                plateNumber: document.getElementById("plateNumber").value,
                vehicleType: document.getElementById("vehicleType").value,
                userType: document.getElementById("userType").value,
                timestamp: new Date(),
            };

            const date = new Date();
            const transactionId = `${date.getTime()}-${visitorData.plateNumber}`;
            const formattedDate = date.toISOString().split('T')[0];
            const timeIn = date.toLocaleTimeString();

            const vehicleInData = {
                ...visitorData,
                vehicleOwner,
                transactionId,
                timeIn,
                date: formattedDate,
            };

            const parkingLogData = {
                ...vehicleInData,
                timeOut: null,
            };

            try {
                const vehiclesInCollection = collection(db, "vehiclesIn");
                const vehiclesQuery = query(vehiclesInCollection);
                const querySnapshot = await getDocs(vehiclesQuery);

                if (querySnapshot.size >= 10) {
                    alert("Maximum vehicle capacity reached. Cannot add more vehicles.");
                    return;
                }

                if (visitorData.vehicleType === "2 Wheels") {
                    const twoWheelsCollection = collection(db, "vehicleTwo");
                    const twoWheelsQuery = query(twoWheelsCollection);
                    const twoWheelsSnapshot = await getDocs(twoWheelsQuery);

                    if (twoWheelsSnapshot.size >= 5) {
                        alert("Maximum capacity for 2-wheeled vehicles reached.");
                        return;
                    }

                    await addDoc(twoWheelsCollection, vehicleInData);
                } else if (visitorData.vehicleType === "4 Wheels") {
                    const fourWheelsCollection = collection(db, "vehicleFour");
                    const fourWheelsQuery = query(fourWheelsCollection);
                    const fourWheelsSnapshot = await getDocs(fourWheelsQuery);

                    if (fourWheelsSnapshot.size >= 5) {
                        alert("Maximum capacity for 4-wheeled vehicles reached.");
                        return;
                    }

                    await addDoc(fourWheelsCollection, vehicleInData);
                }

                await addDoc(collection(db, "drivers"), visitorData);
                await addDoc(vehiclesInCollection, vehicleInData);
                await addDoc(collection(db, "parkingLog"), parkingLogData);

                alert("Visitor information added successfully to all collections!");
                form.reset(); // Reset the form
            } catch (error) {
                console.error("Error adding visitor information:", error);
                alert("There was an error. Please try again.");
            } finally {
                isSubmitting = false; // Reset flag
                submitButton.disabled = false; // Re-enable the submit button
            }
        });
    } else {
        console.error("Visitor form element not found.");
    }
});
