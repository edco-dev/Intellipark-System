import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "./app"; // Ensure this is correct

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

        // Add an Edit button
        const editCell = row.insertCell(12);
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.onclick = () => editDriver(row, driver); // Call edit function with the row and driver object
        editCell.appendChild(editButton);

        // Add a Save button
        const saveCell = row.insertCell(13);
        const saveButton = document.createElement('button');
        saveButton.innerText = 'Save';
        saveButton.onclick = () => saveDriver(row, driver.id); // Call save function with the row and driver ID
        saveButton.style.display = 'none'; // Initially hidden
        saveCell.appendChild(saveButton);
    });

    // Update the page indicator
    document.getElementById('currentPage').innerText = `Page ${currentPage} of ${Math.ceil(driversData.length / driversPerPage)}`;
    
    // Enable or disable buttons based on the current page
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage === Math.ceil(driversData.length / driversPerPage);
}

// Function to edit a driver
function editDriver(row, driver) {
    // Replace row cells with input fields
    row.cells[0].innerHTML = `<input type="text" value="${driver.firstName}" />`;
    row.cells[1].innerHTML = `<input type="text" value="${driver.middleName || ''}" />`;
    row.cells[2].innerHTML = `<input type="text" value="${driver.lastName}" />`;
    row.cells[3].innerHTML = `<input type="text" value="${driver.gender}" />`;
    row.cells[4].innerHTML = `<input type="number" value="${driver.age}" />`;
    row.cells[5].innerHTML = `<input type="text" value="${driver.userType}" />`;
    row.cells[6].innerHTML = `<input type="text" value="${driver.contactNumber}" />`;
    row.cells[7].innerHTML = `<input type="email" value="${driver.emailAddress}" />`;
    row.cells[8].innerHTML = `<input type="text" value="${driver.address}" />`;
    row.cells[9].innerHTML = `<input type="text" value="${driver.plateNumber}" />`;
    row.cells[10].innerHTML = `<input type="text" value="${driver.vehicleType}" />`;
    row.cells[11].innerHTML = `<input type="text" value="${driver.vehicleColor}" />`;

    // Show the Save button and hide the Edit button
    row.cells[12].querySelector('button').style.display = 'none'; // Hide edit button
    row.cells[13].querySelector('button').style.display = 'inline'; // Show save button
}

// Function to save the updated driver data
async function saveDriver(row, docId) {
    // Get the updated data from input fields
    const updatedData = {
        firstName: row.cells[0].querySelector('input').value,
        middleName: row.cells[1].querySelector('input').value,
        lastName: row.cells[2].querySelector('input').value,
        gender: row.cells[3].querySelector('input').value,
        age: parseInt(row.cells[4].querySelector('input').value), // Ensure age is a number
        userType: row.cells[5].querySelector('input').value,
        contactNumber: row.cells[6].querySelector('input').value,
        emailAddress: row.cells[7].querySelector('input').value,
        address: row.cells[8].querySelector('input').value,
        plateNumber: row.cells[9].querySelector('input').value,
        vehicleType: row.cells[10].querySelector('input').value,
        vehicleColor: row.cells[11].querySelector('input').value,
    };

    // Update the document in Firestore
    const driverRef = doc(db, "drivers", docId);
    await updateDoc(driverRef, updatedData);

    // Refresh the displayed data
    fetchDriversData(); // Refresh the data displayed in the table
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
