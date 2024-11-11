import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from '/app.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadDriversData();
    document.getElementById('searchInput').addEventListener('input', filterDriversData);
    document.getElementById("prevPageBtn").addEventListener("click", prevPage);
    document.getElementById("nextPageBtn").addEventListener("click", nextPage);
});

let allDriversData = [];
let currentPage = 1;
const itemsPerPage = 7; // Limit display to 5 drivers per page

async function loadDriversData() {
    const driversTableBody = document.querySelector('#driversTable tbody');
    driversTableBody.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "drivers"));
        allDriversData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        currentPage = 1; // Reset to the first page on data load
        displayDrivers(allDriversData);
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

    driversToShow.forEach(driverData => {
        const row = driversTableBody.insertRow();
        row.insertCell(0).innerText = driverData.firstName;
        row.insertCell(1).innerText = driverData.middleInitials || "N/A";
        row.insertCell(2).innerText = driverData.lastName;
        row.insertCell(3).innerText = driverData.gender;
        row.insertCell(4).innerText = driverData.age;
        row.insertCell(5).innerText = driverData.userType;
        row.insertCell(6).innerText = driverData.contactNumber;
        row.insertCell(7).innerText = driverData.emailAddress;
        row.insertCell(8).innerText = driverData.address;
        row.insertCell(9).innerText = driverData.plateNumber;
        row.insertCell(10).innerText = driverData.vehicleType;
        row.insertCell(11).innerText = driverData.vehicleColor;

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
        row.insertCell(12).appendChild(showQRBtn);
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
    const filteredData = allDriversData.filter(driver => {
        return (
            driver.firstName.toLowerCase().includes(searchTerm) ||
            driver.middleInitials?.toLowerCase().includes(searchTerm) ||
            driver.lastName.toLowerCase().includes(searchTerm) ||
            driver.contactNumber.includes(searchTerm) ||
            driver.emailAddress.toLowerCase().includes(searchTerm) ||
            driver.address.toLowerCase().includes(searchTerm) ||
            driver.plateNumber.toLowerCase().includes(searchTerm) ||
            driver.vehicleType.toLowerCase().includes(searchTerm) ||
            driver.vehicleColor.toLowerCase().includes(searchTerm)
        );
    });

    currentPage = 1; // Reset to the first page on filter
    displayDrivers(filteredData);
}

function nextPage() {
    currentPage++;
    displayDrivers(allDriversData);
}

function prevPage() {
    currentPage--;
    displayDrivers(allDriversData);
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
