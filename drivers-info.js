import { collection, getDocs, doc, updateDoc } from "firebase/firestore"; 
import { db } from "./app"; // Import db from app.js

const driversPerPage = 5; 
let currentPage = 1; 
let driversData = []; 

async function fetchDriversData() {
    console.log("Firestore DB:", db);  // This should print a valid Firestore object if db is correctly initialized

    try {
        const querySnapshot = await getDocs(collection(db, "drivers"));
        driversData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayDrivers(); 
    } catch (error) {
        console.error("Error fetching drivers data:", error);
    }
}


function displayDrivers(filteredDrivers = driversData) {
    const driversTableBody = document.querySelector('#driversTable tbody');
    driversTableBody.innerHTML = ""; 

    const startIndex = (currentPage - 1) * driversPerPage; 
    const endIndex = startIndex + driversPerPage; 
    const driversToDisplay = filteredDrivers.slice(startIndex, endIndex); 

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

        // Actions Cell
        const actionsCell = row.insertCell(12);
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.onclick = () => editDriver(row, driver); 
        actionsCell.appendChild(editButton);
    });

    document.getElementById('currentPage').innerText = `Page ${currentPage} of ${Math.ceil(filteredDrivers.length / driversPerPage)}`;

    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage === Math.ceil(filteredDrivers.length / driversPerPage);
}

function searchDrivers() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase(); 
    const filteredDrivers = driversData.filter(driver => {
        return (
            driver.firstName.toLowerCase().includes(searchInput) ||
            (driver.middleName && driver.middleName.toLowerCase().includes(searchInput)) ||
            driver.lastName.toLowerCase().includes(searchInput)
        );
    });
    currentPage = 1; 
    displayDrivers(filteredDrivers); 
}

function editDriver(row, driver) {
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

    // Show the Save button
    const actionsCell = row.cells[12]; // Ensure you're accessing the correct cell
    actionsCell.innerHTML = ''; // Clear existing buttons
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.onclick = () => saveDriver(driver.id, row); // Call save function
    actionsCell.appendChild(saveButton);
}

async function saveDriver(driverId, row) {
    const updatedDriver = {
        firstName: row.cells[0].querySelector('input').value,
        middleName: row.cells[1].querySelector('input').value,
        lastName: row.cells[2].querySelector('input').value,
        gender: row.cells[3].querySelector('input').value,
        age: parseInt(row.cells[4].querySelector('input').value),
        userType: row.cells[5].querySelector('input').value,
        contactNumber: row.cells[6].querySelector('input').value,
        emailAddress: row.cells[7].querySelector('input').value,
        address: row.cells[8].querySelector('input').value,
        plateNumber: row.cells[9].querySelector('input').value,
        vehicleType: row.cells[10].querySelector('input').value,
        vehicleColor: row.cells[11].querySelector('input').value,
    };

    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, updatedDriver);
    
    fetchDriversData(); // Refresh data after saving
}

// Event listeners for pagination
document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--; 
        displayDrivers(); 
    }
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
    if (currentPage < Math.ceil(driversData.length / driversPerPage)) {
        currentPage++; 
        displayDrivers(); 
    }
});

// Fetch data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchInput').addEventListener('keyup', searchDrivers); 
    fetchDriversData(); 
});
