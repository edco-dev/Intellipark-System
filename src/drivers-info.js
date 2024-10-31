import { getFirestore, collection, getDocs } from "firebase/firestore"; // Import Firestore functions
import { db } from "./app"; // Assuming your Firebase app is initialized in app.js

const driversPerPage = 5; // Number of drivers to display per page
let currentPage = 1; // Current page number
let driversData = []; // Array to hold all drivers data

// Function to fetch drivers data from Firestore
async function fetchDriversData() {
    const querySnapshot = await getDocs(collection(db, "drivers"));
    driversData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Extract driver data
    displayDrivers(); // Display the first page of drivers
}

// Function to display drivers on the current page
function displayDrivers() {
    const driversTableBody = document.querySelector('#driversTable tbody');
    driversTableBody.innerHTML = ""; // Clear existing data

    const startIndex = (currentPage - 1) * driversPerPage; // Calculate the start index
    const endIndex = startIndex + driversPerPage; // Calculate the end index
    const driversToDisplay = driversData.slice(startIndex, endIndex); // Get drivers for the current page

    // Populate the table with driver data
    driversToDisplay.forEach(driver => {
        const row = driversTableBody.insertRow();
        row.insertCell(0).innerText = driver.firstName;
        row.insertCell(1).innerText = driver.middleName || "";
        row.insertCell(2).innerText = driver.lastName;
        row.insertCell(3).innerText = driver.gender;
        row.insertCell(4).innerText = driver.age;
        row.insertCell(5).innerText = driver.userType;
        row.insertCell(6).innerText = driver.contactNumber;
        row.insertCell(7).innerText = driver.emailAddress;
        row.insertCell(8).innerText = driver.address;
        row.insertCell(9).innerText = driver.plateNumber;
        row.insertCell(10).innerText = driver.vehicleType;
        row.insertCell(11).innerText = driver.vehicleColor;
    });

    // Update the page indicator
    document.getElementById('currentPage').innerText = `Page ${currentPage} of ${Math.ceil(driversData.length / driversPerPage)}`;
    
    // Enable or disable buttons based on the current page
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage === Math.ceil(driversData.length / driversPerPage);
}

// Event listeners for pagination buttons
document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--; // Go to the previous page
        displayDrivers(); // Update the table display
    }
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
    if (currentPage < Math.ceil(driversData.length / driversPerPage)) {
        currentPage++; // Go to the next page
        displayDrivers(); // Update the table display
    }
});

// Bind the Previous button to go back to Registration
document.getElementById('prevToRegistrationBtn').addEventListener('click', () => {
    window.location.href = "index.html"; // Redirect to Registration page
});

// Fetch drivers data when the page loads
fetchDriversData();
