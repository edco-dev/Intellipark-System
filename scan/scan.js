// // Import the necessary modules
// import { Html5Qrcode } from "html5-qrcode";
// import { doc, getDoc, updateDoc } from "firebase/firestore"; // Import Firebase functions
// import { db } from "./app"; // Make sure your Firebase app is initialized in app.js

// // Initialize the QR code scanner
// const html5QrCode = new Html5Qrcode("reader");

// // Function to handle a successful scan
// function onScanSuccess(decodedText) {
//     try {
//         const data = JSON.parse(decodedText); // Assuming QR contains JSON with `docId`
//         if (data.docId) {
//             validateAndUpdateStatus(data.docId);
//         } else {
//             console.error("Document ID not found in QR code.");
//             alert("Invalid QR code. Please try again.");
//         }
//     } catch (error) {
//         console.error("Error parsing QR code:", error);
//         alert("The scanned QR code is not valid. Please try again.");
//     }
// }

// // Validation function to check QR code and update status in Firebase
// async function validateAndUpdateStatus(docId) {
//     const docRef = doc(db, "drivers", docId);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//         const driverData = docSnap.data();
        
//         // Toggle the vehicle status
//         if (driverData.status === "Vehicle In") {
//             // Update to "Vehicle Out"
//             await updateDoc(docRef, { status: "Vehicle Out" });
//             console.log("Driver checked out. Status updated to Vehicle Out.");
//             alert("Vehicle checked out successfully.");
//         } else {
//             // Update to "Vehicle In"
//             await updateDoc(docRef, { status: "Vehicle In" });
//             console.log("Driver checked in. Status updated to Vehicle In.");
//             alert("Vehicle checked in successfully.");
//         }
//     } else {
//         console.error("No matching registration found for this QR code.");
//         alert("QR code not valid.");
//     }
// }

// // Start scanning (for live scanning)
// function startScanning() {
//     html5QrCode.start(
//         { facingMode: "environment" }, // Use the back camera
//         { fps: 10, qrbox: { width: 250, height: 250 } },
//         onScanSuccess
//     ).catch(err => {
//         console.error("Failed to start scanning:", err);
//     });
// }

// // Stop scanning
// function stopScanning() {
//     html5QrCode.stop().then(() => {
//         console.log("QR code scanning stopped.");
//     }).catch(err => {
//         console.error("Failed to stop scanning:", err);
//     });
// }

// // Bind the start button
// document.getElementById('startScanBtn').addEventListener('click', startScanning);
// document.getElementById('stopScanBtn').addEventListener('click', stopScanning);
