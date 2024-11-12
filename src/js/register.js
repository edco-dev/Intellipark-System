import { collection, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from '/app.js';

const form = document.getElementById('driverForm');
const formSection = document.getElementById('formSection');
const qrSection = document.getElementById('qrSection');
const confirmationSection = document.getElementById('confirmationSection');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.status = false;

    try {
        const docRef = await addDoc(collection(db, "drivers"), data);
        console.log("Document written with ID:", docRef.id);
        alert("Registration successful!");

        generateQRCode(docRef.id);
        formSection.classList.remove('show');
        qrSection.classList.add('show');
        form.reset();
    } catch (e) {
        console.error("Error adding document:", e);
        alert("Registration failed!");
    }
});

async function generateQRCode(docId) {
    const qrCanvas = document.getElementById('qrcode');
    const qrData = JSON.stringify({ docId });
    const qr = new QRious({ element: qrCanvas, value: qrData, size: 128 });

    const qrDataUrl = qrCanvas.toDataURL('image/png');

    try {
        const driverDocRef = doc(db, "drivers", docId);
        await updateDoc(driverDocRef, { qrCode: qrDataUrl });
        console.log("QR Code stored successfully!");
    } catch (error) {
        console.error("Error storing QR Code:", error);
    }
}

document.getElementById('downloadBtn').addEventListener('click', () => {
    const qrCanvas = document.getElementById('qrcode');
    const link = document.createElement('a');
    link.href = qrCanvas.toDataURL('image/png');
    link.download = 'qrcode.png';
    link.click();
});

document.getElementById('nextBtn').addEventListener('click', () => {
    qrSection.classList.remove('show');
    confirmationSection.classList.add('show');
});

document.getElementById('finishBtn').addEventListener('click', () => {
    window.location.href = "/dashboard.8008bccb.html";
});
