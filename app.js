// Import the functions you need from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDbXiBef-fXk9igZ5mZv_F896kyPtnXxvk",
    authDomain: "intellipark-db283.firebaseapp.com",
    projectId: "intellipark-db283",
    storageBucket: "intellipark-db283.appspot.com",
    messagingSenderId: "159684284966",
    appId: "1:159684284966:web:5149d6318931c0bedc4ce7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the Firestore database instance
export { db };

// Main logic for handling form submission
const form = document.getElementById('driverForm');
const formSection = document.getElementById('formSection');
const qrSection = document.getElementById('qrSection');
const confirmationSection = document.getElementById('confirmationSection');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    // Add the status field with a default value of false
    data.status = false; // Set status to false on registration
    
    try {
        // Add a new document with a generated ID to Firestore
        const docRef = await addDoc(collection(db, "drivers"), data);
        console.log("Document written with ID: ", docRef.id);
        alert("Registration successful!");

        // Generate the QR code
        generateQRCode(docRef.id);

        // Slide to QR section
        formSection.classList.remove('show');
        qrSection.classList.add('show');

        // Reset the form after successful submission
        form.reset();
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Registration failed!");
    }
});
// Function to generate the QR code and store it in Firestore
async function generateQRCode(docId) {
    const qrCanvas = document.getElementById('qrcode');
    const qrData = JSON.stringify({ docId: docId }); // QR data as JSON
    const qr = new QRious({
        element: qrCanvas,
        value: qrData, // Store JSON with docId
        size: 128
    });

    // Convert QR code canvas to a Data URL (base64 format)
    const qrDataUrl = qrCanvas.toDataURL('image/png');

    try {
        // Update the Firestore document with the QR code data URL
        const driverDocRef = doc(db, "drivers", docId);
        await updateDoc(driverDocRef, { qrCode: qrDataUrl });
        console.log("QR Code stored successfully!");
    } catch (error) {
        console.error("Error storing QR Code:", error);
    }
}

// Download QR Code functionality
document.getElementById('downloadBtn').addEventListener('click', () => {
    const qrCanvas = document.getElementById('qrcode');
    const link = document.createElement('a');
    link.href = qrCanvas.toDataURL('image/png');
    link.download = 'qrcode.png';
    link.click();
});

// Next button to go to confirmation
document.getElementById('nextBtn').addEventListener('click', () => {
    qrSection.classList.remove('show');
    confirmationSection.classList.add('show');
});

// Finish button to close the form and redirect
document.getElementById('finishBtn').addEventListener('click', () => {
    // Redirect to the home page
    window.location.href = "index.html"; // Change this to your home page URL
});
