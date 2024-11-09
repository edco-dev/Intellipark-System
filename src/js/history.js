import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from '/app.js';

let currentPage = 1;
const entriesPerPage = 2;
let parkingLogsByDate = {};
let allParkingLogs = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadParkingLogs();
    setupPagination();
    setupDateFilter();
    setupSearchFilter();
});

async function loadParkingLogs(filterDate = null) {
    parkingLogsByDate = {};
    allParkingLogs = [];

    const dateToFilter = filterDate ? new Date(filterDate) : new Date();
    const formattedDate = dateToFilter.toISOString().split('T')[0];

    let logsQuery = query(
        collection(db, "parkingLog"),
        orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(logsQuery);
    querySnapshot.forEach(doc => {
        const logData = doc.data();
        const date = logData.date;

        if (!parkingLogsByDate[date]) {
            parkingLogsByDate[date] = [];
        }
        parkingLogsByDate[date].push(logData);
        allParkingLogs.push(logData);
    });

    if (filterDate) {
        displayLogsByDate(filterDate);
    } else {
        displayLogsByDate();
    }
}

function displayLogsByDate(filterDate = null, filteredLogs = null) {
    const tablesContainer = document.getElementById('tablesContainer');
    tablesContainer.innerHTML = '';

    const logsToDisplay = filteredLogs || (filterDate ? parkingLogsByDate[filterDate] || [] : Object.values(parkingLogsByDate).flat());
    const datesToDisplay = filterDate ? [filterDate] : Object.keys(parkingLogsByDate);

    datesToDisplay.forEach(date => {
        const logs = logsToDisplay.filter(log => log.date === date);

        if (logs.length === 0) return;

        const table = document.createElement('table');
        table.classList.add('logTable');
        table.innerHTML = `<caption>Logs for ${date}</caption>
            <thead>
                <tr>
                    <th>Transaction #</th>
                    <th>Plate Number</th>
                    <th>Vehicle Owner</th>
                    <th>User Type</th>
                    <th>Vehicle Type</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                </tr>
            </thead>`;

        const tbody = document.createElement('tbody');
        logs.forEach(log => {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = log.transactionId || "N/A";
            row.insertCell(1).innerText = log.plateNumber || "N/A";
            row.insertCell(2).innerText = log.vehicleOwner || "N/A";
            row.insertCell(3).innerText = log.userType || "N/A";
            row.insertCell(4).innerText = log.vehicleType || "N/A";
            row.insertCell(5).innerText = log.timeIn || "N/A";
            row.insertCell(6).innerText = log.timeOut || "N/A";
        });

        table.appendChild(tbody);
        tablesContainer.appendChild(table);
    });

    updatePaginationControls();
}

function setupPagination() {
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayLogsByDate();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalDates = Object.keys(parkingLogsByDate).length;
        const totalPages = Math.ceil(totalDates / entriesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayLogsByDate();
        }
    });
}

function updatePaginationControls() {
    const totalDates = Object.keys(parkingLogsByDate).length;
    const totalPages = Math.ceil(totalDates / entriesPerPage);
    document.getElementById('pageIndicator').innerText = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function setupDateFilter() {
    document.getElementById('datePicker').addEventListener('change', async (e) => {
        const selectedDate = e.target.value;

        if (selectedDate) {
            currentPage = 1;
            await loadParkingLogs(selectedDate);
        } else {
            currentPage = 1;
            await loadParkingLogs();
        }
    });
}

function setupSearchFilter() {
    document.getElementById('searchInput').addEventListener('input', filterParkingLogs);
}

function filterParkingLogs() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let logsToFilter = [];

    const selectedDate = document.getElementById('datePicker').value;

    if (selectedDate) {
        logsToFilter = parkingLogsByDate[selectedDate] || [];
    } else {
        logsToFilter = Object.values(parkingLogsByDate).flat();
    }

    const filteredLogs = logsToFilter.filter(log => {
        return (
            log.plateNumber.toLowerCase().includes(searchTerm) ||
            log.vehicleOwner.toLowerCase().includes(searchTerm) ||
            log.userType.toLowerCase().includes(searchTerm) ||
            log.vehicleType.toLowerCase().includes(searchTerm)
        );
    });

    displayLogsByDate(selectedDate, filteredLogs);
}
