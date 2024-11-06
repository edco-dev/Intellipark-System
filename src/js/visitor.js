import { collection, addDoc } from "firebase/firestore";
import { db } from '/app.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("visitorForm");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const visitorData = {
                firstName: document.getElementById("firstName").value,
                middleName: document.getElementById("middleName").value || "",
                lastName: document.getElementById("lastName").value,
                contactNumber: document.getElementById("contactNumber").value,
                plateNumber: document.getElementById("plateNumber").value,
                vehicleType: document.getElementById("vehicleType").value,
                userType: document.getElementById("userType").value,
                timestamp: new Date(),
            };

            try {
                await addDoc(collection(db, "drivers"), visitorData);
                await addDoc(collection(db, "vehiclesIn"), visitorData);

                alert("Visitor information added successfully to both collections!");
                form.reset();
            } catch (error) {
                console.error("Error adding visitor information:", error);
                alert("There was an error. Please try again.");
            }
        });
    } else {
        console.error("Visitor form element not found.");
    }
});
