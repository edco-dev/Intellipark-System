import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from '/app.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadDriversData();
    document.getElementById('searchInput').addEventListener('input', filterDriversData);
    document.getElementById("prevPageBtn").addEventListener("click", prevPage);
    document.getElementById("nextPageBtn").addEventListener("click", nextPage);

    const logoutButton = document.querySelector('#logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }
});

let allDriversData = [];
let filteredDriversData = [];
let currentPage = 1;
const itemsPerPage = 8; // Limit display to 5 drivers per page

async function loadDriversData() {
    const driversTableBody = document.querySelector('#driversTable tbody');
    driversTableBody.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "drivers"));
        allDriversData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filteredDriversData = [...allDriversData];  // Initially set filtered data to all drivers
        currentPage = 1; // Reset to the first page on data load
        displayDrivers(filteredDriversData);
    } catch (error) {
        console.error("Error loading driver data:", error);
    }
}

function displayDrivers(driversData) {
    const driversTableBody = document.querySelector('#driversTable tbody');
    driversTableBody.innerHTML = ""; // Clear existing data

    // Calculate pagination range
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const driversToShow = driversData.slice(startIndex, endIndex);

    // Loop through the subset of driversData to show (limited to itemsPerPage)
    driversToShow.forEach((driverData, index) => {
        const row = driversTableBody.insertRow();

        // Generate incrementing ID (001, 002, 003, ...)
        const incrementingId = (startIndex + index + 1).toString().padStart(3, '0');
        row.insertCell(0).innerText = incrementingId;

        // Combine firstName, middleInitials, and lastName for Vehicle Owner
        const vehicleOwner = `${driverData.firstName || ''} ${driverData.middleInitials || ''} ${driverData.lastName || ''}`.trim() || "N/A";
        

        // Populate the rest of the driver details
        row.insertCell(1).innerText = driverData.plateNumber || "N/A";
        row.insertCell(2).innerText = vehicleOwner;
        row.insertCell(3).innerText = driverData.age || "N/A";
        row.insertCell(4).innerText = driverData.gender || "N/A";
        row.insertCell(5).innerText = driverData.contactNumber || "N/A";
        row.insertCell(6).innerText = driverData.emailAddress || "N/A";
        row.insertCell(7).innerText = driverData.address || "N/A";
        row.insertCell(8).innerText = driverData.userType || "N/A";
        row.insertCell(9).innerText = driverData.vehicleType || "N/A";
        row.insertCell(10).innerText = driverData.vehicleColor || "N/A";

        // QR button setup
        const showQRBtn = document.createElement('button');
        showQRBtn.innerText = "Show";
        showQRBtn.onclick = () => showQrPopup(driverData.id);
        showQRBtn.style.backgroundColor = '#4aa5ff';
        showQRBtn.style.border = 'none';
        showQRBtn.style.padding = '5px';
        showQRBtn.style.width = '50px';
        showQRBtn.style.borderRadius = '20px';
        showQRBtn.style.color = '#ffffff';

        showQRBtn.addEventListener('mouseover', () => {
            showQRBtn.style.cursor = 'pointer'; 
        });
        row.insertCell(11).appendChild(showQRBtn); // Adjust column index for QR button
    });

    // Update pagination text
    document.getElementById("paginationText").innerText = currentPage;
    document.getElementById("pageTracker").innerText = `Page ${currentPage} of ${Math.ceil(driversData.length / itemsPerPage)}`;

    // Enable/disable pagination buttons
    document.getElementById("prevPageBtn").disabled = currentPage === 1;
    document.getElementById("nextPageBtn").disabled = endIndex >= driversData.length;
}

function filterDriversData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    filteredDriversData = allDriversData.filter(driver => {
        // Combine first, middle, and last name into a single string for easier full name matching
        const fullName = `${driver.firstName || ''} ${driver.middleInitials || ''} ${driver.lastName || ''}`.toLowerCase();

        return (
            fullName.includes(searchTerm) || // Search in full name
            (driver.contactNumber || '').includes(searchTerm) ||
            (driver.emailAddress || '').toLowerCase().includes(searchTerm) ||
            (driver.address || '').toLowerCase().includes(searchTerm) ||
            (driver.plateNumber || '').toLowerCase().includes(searchTerm) ||
            (driver.vehicleType || '').toLowerCase().includes(searchTerm) ||
            (driver.vehicleColor || '').toLowerCase().includes(searchTerm)
        );
    });

    currentPage = 1; // Reset to the first page on filter
    displayDrivers(filteredDriversData);
}


function nextPage() {
    currentPage++;
    displayDrivers(filteredDriversData);
}

function prevPage() {
    currentPage--;
    displayDrivers(filteredDriversData);
}

async function showQrPopup(docId) {
    try {
        const driverRef = doc(db, "drivers", docId);
        const driverSnap = await getDoc(driverRef);

        if (driverSnap.exists()) {
            const driverData = driverSnap.data();
            document.getElementById("userType").innerText = ` ${driverData.userType}`;
            document.getElementById("driverName").innerText = ` ${driverData.firstName} ${driverData.lastName}`;
            document.getElementById("plateNumber").innerText = ` ${driverData.plateNumber}`;

            const qrCanvas = document.getElementById("qrCodeCanvas");
            const context = qrCanvas.getContext("2d");
            const qrImage = new Image();
            qrImage.src = driverData.qrCode;
            qrImage.onload = () => {
                context.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
                context.drawImage(qrImage, 0, 0, qrCanvas.width, qrCanvas.height);
            };

            document.getElementById("qrPopup").style.display = "flex";

            document.getElementById("downloadQRBtn").onclick = () => {
                const link = document.createElement("a");
                link.href = qrCanvas.toDataURL("image/png");
                link.download = "driver_qrcode.png";
                link.click();
            };
        } else {
            alert("Driver data not found.");
        }
    } catch (error) {
        console.error("Error fetching driver data:", error);
    }
}

document.getElementById("closePopupBtn").onclick = () => {
    document.getElementById("qrPopup").style.display = "none";
};
