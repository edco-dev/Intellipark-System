// Import necessary functions from Firebase Firestore
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from '/app.js';

let currentPage = 1;
const entriesPerPage = 2; // Display 2 records per page
let vehiclesOutByDate = {};
let allVehiclesOut = [];

// Initialize event listeners on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    await loadVehiclesOut();
    setupPagination();
    setupDropdownFilter();
    setupSearchFilter();
});

// Load vehiclesOut logs, optionally filtered by a specific date
async function loadVehiclesOut(filterDate = null) {
    vehiclesOutByDate = {};
    allVehiclesOut = [];
    const dateToFilter = filterDate ? new Date(filterDate) : null;

    // Query vehiclesOut collection, ordered by date in descending order
    let logsQuery = query(
        collection(db, "vehiclesOut"),
        orderBy("date", "desc")  // Change to descending order to get the newest logs first
    );

    const querySnapshot = await getDocs(logsQuery);
    querySnapshot.forEach(doc => {
        const logData = doc.data();
        const date = logData.date;

        if (!vehiclesOutByDate[date]) {
            vehiclesOutByDate[date] = [];
        }
        vehiclesOutByDate[date].push(logData);
        allVehiclesOut.push(logData);
    });

    displayLogsByDate(filterDate);
}

// Display logs, handling pagination and optional filtering
function displayLogsByDate(filterDate = null, filteredLogs = null) {
    const tablesContainer = document.getElementById('tablesContainer');
    tablesContainer.innerHTML = '';

    const logsToDisplay = filteredLogs || (filterDate ? vehiclesOutByDate[filterDate] || [] : Object.values(vehiclesOutByDate).flat());
    const datesToDisplay = filterDate ? [filterDate] : Object.keys(vehiclesOutByDate);

    const paginatedDates = paginateDates(datesToDisplay);
    const currentDates = paginatedDates[currentPage - 1] || [];
    
    currentDates.forEach(date => {
        const logs = logsToDisplay.filter(log => log.date === date);
        if (logs.length === 0) return;

        const table = document.createElement('table');
        table.classList.add('logTable');
        const captionColor = "#ed7576";
        table.innerHTML = `<caption style="color: ${captionColor}; font-weight: semibold; text-align: left; font-size: 1rem; margin: 20px">${date}</caption>
            <thead class="font-thin" style="font-size: 13px;">
                <tr>
                    <th>Transaction #</th>
                    <th>Plate Number</th>
                    <th>Vehicle Owner</th>
                    <th>User Type</th>
                    <th>Vehicle Type</th>
                    <th>Time IN</th>
                    <th>Time OUT</th>
                </tr>
            </thead>`;

        const tbody = document.createElement('tbody');
        logs.forEach((log, index) => {
            const row = tbody.insertRow();
            const formattedTransactionId = (index + 1).toString().padStart(3, '0');

            // Combine firstName, middleName, and lastName to form the vehicleOwner
            const vehicleOwner = `${log.firstName || ''} ${log.middleName || ''} ${log.lastName || ''}`.trim();

            row.insertCell(0).innerText = formattedTransactionId;
            row.insertCell(1).innerText = log.plateNumber || "N/A";
            row.insertCell(2).innerText = vehicleOwner || "N/A"; // Display the combined vehicleOwner
            row.insertCell(3).innerText = log.userType || "N/A";
            row.insertCell(4).innerText = log.vehicleType || "N/A";
            row.insertCell(5).innerText = log.timeIn || "N/A";
            row.insertCell(6).innerText = log.timeOut || "N/A";
        });

        table.appendChild(tbody);
        tablesContainer.appendChild(table);
    });

    updatePaginationControls(paginatedDates);
}

// Split dates into paginated groups
function paginateDates(datesToDisplay) {
    const paginated = [];
    for (let i = 0; i < datesToDisplay.length; i += entriesPerPage) {
        paginated.push(datesToDisplay.slice(i, i + entriesPerPage));
    }
    return paginated;
}

// Set up pagination control buttons
function setupPagination() {
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayLogsByDate();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(Object.keys(vehiclesOutByDate).length / entriesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayLogsByDate();
        }
    });
}

// Update pagination controls based on current page
function updatePaginationControls(paginatedDates) {
    const totalPages = paginatedDates.length;
    document.getElementById('pageTracker').innerText = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('paginationText').innerText = currentPage;

    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// Set up the date picker for date-based filtering
function setupDatePicker() {
    const datePicker = document.getElementById('datePicker');
    flatpickr(datePicker, {
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr) {
            const selectedDate = dateStr;
            loadVehiclesOut(selectedDate);
        }
    });
    datePicker.value = ""; // Clear any previous selection
}


// Function to handle the selection of a date and apply the red color
function setupDropdownFilter() {
    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownContent = document.getElementById('dropdownContent');
    const allOption = document.getElementById('allOption');
    const calendarOption = document.getElementById('calendarOption');
    const datePicker = document.getElementById('datePicker');

    // Hide the actual date input field (for visual clarity)
    datePicker.style.display = 'none';

    // Toggle dropdown visibility
    dropdownBtn.addEventListener('click', () => {
        dropdownContent.classList.toggle('hidden');
    });

    // "All" option - Reset to "All" and load all logs
    allOption.addEventListener('click', () => {
        dropdownBtn.innerText = "All";  // Show "All" on the dropdown button
        dropdownBtn.style.color = "";   // Reset color to default
        loadVehiclesOut(); // Load all logs without date filter
        dropdownContent.classList.add('hidden'); // Close the dropdown menu
    });

    // "Calendar" option - Open date picker and update button with selected date
    calendarOption.addEventListener('click', () => {
        dropdownBtn.innerText = "Select Date";  // Placeholder text on dropdown button
        dropdownContent.classList.add('hidden'); // Close the dropdown menu

        // Initialize Flatpickr and open date picker automatically
        const fpInstance = flatpickr(datePicker, {
            dateFormat: "Y-m-d",
            onChange: function(selectedDates, dateStr) {
                dropdownBtn.innerText = dateStr; // Show selected date on dropdown button
                dropdownBtn.style.color = "#ed7576"; // Set the text color to red
                loadVehiclesOut(dateStr); // Filter logs based on selected date
            }
        });
        fpInstance.open(); // Open the date picker automatically
    });
}

// Set up search filter based on input
function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredLogs = allVehiclesOut.filter(log =>
            (log.plateNumber && log.plateNumber.toLowerCase().includes(query)) || 
            (log.vehicleOwner && log.vehicleOwner.toLowerCase().includes(query)) ||
            (log.userType && log.userType.toLowerCase().includes(query))
        );
        displayLogsByDate(null, filteredLogs);
    });
}
