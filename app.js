// In-memory data storage
let units = [];
let calls = [];
let bolos = [];

// Current website version
const websiteInfo = { version: "0.1.2.1" };
const releaseDate = "12/17/2024";
document.getElementById("version-heading").textContent = `[DEV ${websiteInfo.version}] - ${releaseDate}`;

// Track if Shift key is pressed
let isShiftPressed = false;

document.addEventListener('keydown', (event) => {
  if (event.key === 'Shift') {
    isShiftPressed = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Shift') {
    isShiftPressed = false;
  }
});

// Retrieve version info from localStorage
const localInfo = JSON.parse(localStorage.getItem("localInfo")) || { version: "" };

// Function to toggle changelog menu visibility
function toggleChangeLogMenu() {
  const changelogMenu = document.getElementById("ChangelogMenu");
  changelogMenu.style.display = changelogMenu.style.display === "none" ? "block" : "none";
}

// Check for version mismatch
if (websiteInfo.version !== localInfo.version) {
  toggleChangeLogMenu(); // Show changelog menu
  localStorage.setItem("localInfo", JSON.stringify(websiteInfo)); // Update stored version
}

// Page Navigation with Active Button
function showPage(page, button) {
  document.querySelectorAll('.section').forEach((section) => {
    section.style.display = 'none';
  });
  document.getElementById(`${page}-page`).style.display = 'block';

  // Update button active styles
  if (button) { // Ensure the button exists
    document.querySelectorAll('.status-btn').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
  }
}

// --- UNITS ---
document.getElementById('add-unit-btn').addEventListener('click', addUnit);

function addUnit() {
  // Create a new default unit
  const newUnit = {
    username: '',       // Empty by default
    callsign: '',       // Empty by default
    dept: 'N/A',        // Default department
    status: 'N/A',      // Default status
    assignedCall: '',   // No call assigned by default
  };

  // Add the new unit to the array
  units.push(newUnit);

  // Render the updated units table
  renderUnits();

  // Save the updated data to localStorage
  saveData();
}

function updateUnit(index, key, value) {
  units[index][key] = value;  // Update the specific key of the unit

  // Get the select element for the department
  const deptSelect = document.querySelector(`#units-table-body tr:nth-child(${index + 1}) td select`);
  const statusSelect = document.querySelector(`#units-table-body tr:nth-child(${index + 1}) td:first-child`);

  // Update the department background color
  if (key === 'dept') {
    deptSelect.classList.remove(...deptSelect.classList); // Remove any existing classes
    deptSelect.classList.add(value);  // Add the new class based on selected dept
  } else if (key === 'status') {
    // If the status is updated, ensure the department class is still set correctly
    const currentDept = units[index].dept;
    deptSelect.classList.remove(...deptSelect.classList); // Remove any existing classes
    deptSelect.classList.add(currentDept);  // Re-add the current department class

    // Update the border color based on the new status
    statusSelect.style.borderLeftColor = getStatusColor(value);
  }

  saveData();  // Save the updated data
}


function getStatusColor(status) {
  switch (status) {
    case 'N/A':
      return 'transparent';
    case '10-6':
      return '#121212';
    case '10-5':
      return '#f2a01b';
    case '10-7':
      return '#ff4545';
    case '10-8':
      return '#56d938';
    case '10-11':
      return '#b347e6';
    case '10-23':
      return '#102640';
    case '10-80':
      return '#f51111';
    case '10-97':
      return '#4a47e6';
    case 'Panic':
      return '#910606';
    default:
      return 'transparent';
  }
}

function renderUnits() {
  const tbody = document.getElementById('units-table-body');
  tbody.innerHTML = units
    .map(
      (unit, index) => `
      <tr>
        <td style="border-left: 3px solid ${getStatusColor(unit.status)};">
          <input style="background-color:#444444;border:0;border-radius:0;" type="text" 
                 class="callsign-input" 
                 value="${unit.username}" 
                 onchange="updateUnit(${index}, 'username', this.value)" 
                 placeholder="Enter Username">
        </td>
        <td>
          <input style="background-color:#444444;border:0;border-radius:0;" type="text" 
                 class="callsign-input" 
                 value="${unit.callsign}" 
                 onchange="updateUnit(${index}, 'callsign', this.value)" 
                 placeholder="Enter Callsign">
        </td>
        <td>
          <select onchange="updateUnit(${index}, 'dept', this.value)" class="${unit.dept}">
            <option value="N/A" ${unit.dept === 'N/A' ? 'selected' : ''}>N/A</option>
            <option value="FVMPD" ${unit.dept === 'FVMPD' ? 'selected' : ''}>FVMPD</option>
            <option value="NPS" ${unit.dept === 'NPS' ? 'selected' : ''}>NPS</option>
            <option value="OUSO" ${unit.dept === 'OUSO' ? 'selected' : ''}>OUSO</option>
            <option value="WSP" ${unit.dept === 'WSP' ? 'selected' : ''}>WSP</option>
            <option value="GVFD" ${unit.dept === 'GVFD' ? 'selected' : ''}>GVFD</option>
            <option value="WisDOT" ${unit.dept === 'WisDOT' ? 'selected' : ''}>WisDOT</option>
          </select>
        </td>
        <td>
          <select style="background-color:#444444;border:0;border-bottom:1.5px solid #828282;border-radius:0;" onchange="updateUnit(${index}, 'status', this.value)">
            <option value="N/A" ${unit.status === 'N/A' ? 'selected' : ''}>N/A</option>
            <option value="10-5" ${unit.status === '10-5' ? 'selected' : ''}>10-5 Meal Break</option>
            <option value="10-6" ${unit.status === '10-6' ? 'selected' : ''}>10-6 Busy</option>
            <option value="10-7" ${unit.status === '10-7' ? 'selected' : ''}>10-7 Unavailable</option>
            <option value="10-8" ${unit.status === '10-8' ? 'selected' : ''}>10-8 Available</option>
            <option value="10-11" ${unit.status === '10-11' ? 'selected' : ''}>10-11 Traffic</option>
            <option value="10-23" ${unit.status === '10-23' ? 'selected' : ''}>10-23 On Scene</option>
            <option value="10-80" ${unit.status === '10-80' ? 'selected' : ''}>10-80 Pursuit</option>
            <option value="10-97" ${unit.status === '10-97' ? 'selected' : ''}>10-97 Enroute</option>
            <option value="Panic" ${unit.status === 'Panic' ? 'selected' : ''}>Panic</option>
          </select>
        </td>

        <td>
          <select style="background-color:#444444;border:0;border-bottom:1.5px solid #828282;border-radius:0;" onchange="updateUnit(${index}, 'assignedCall', this.value)">
            <option value="" ${unit.assignedCall === '' ? 'selected' : ''}>None</option>
            ${calls
              .map(call => `
                <option value="${call.id}" ${String(unit.assignedCall) === String(call.id) ? 'selected' : ''}>
                  ${call.id} - ${call.type}
                </option>
              `)
              .join('')}
          </select>
        </td>

        <td>
          <button style="padding: 0px; background-color: transparent;" onclick="deleteUnit(${index})">
            <img src="assets/delete-icon.png" alt="Delete" style="width: 24px; height: 24px;">
          </button>
        </td>
      </tr>
    `
    )
    .join('');
}

function deleteUnit(index) {
  if (!isShiftPressed) {
    const confirmation = confirm('Are you sure you want to delete this unit? This cannot be undone.');
    if (!confirmation) return;
  }
  units.splice(index, 1);
  renderUnits();
  saveData();  // Save data to localStorage after deleting a unit
}

// --- Calls ---
function renderCalls() {
  const tbody = document.getElementById('calls-table-body');
  tbody.innerHTML = calls
    .map(
      (call, index) => `
        <tr>
          <td>${call.id}</td>
          <td>${call.type}</td>
          <td>${call.priority}</td>
          <td>${call.location}</td>
          <td>${call.description}</td>

          <td>
            <button style="padding: 0px; margin-right: 5px; background-color: transparent;" class="edit-call-btn" onclick="editCall(${index})">
              <img src="assets/edit-icon.png" alt="Edit" style="width: 24px; height: 24px;">
            </button>

            <button style="padding: 0px; background-color: transparent;" onclick="deleteCall(${index})">
              <img src="assets/delete-icon.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </td>

        </tr>
      `
    )
    .join('');

  renderUnits();
}

function generateUniqueCallId() {
  const min = 1000; // Set your minimum value
  const max = 9999; // Set your maximum value
  let id = Math.floor(Math.random() * (max - min + 1)) + min; // Generate a random number between min and max

  // Check if the id already exists
  while (calls.some(call => call.id === id)) {
    id = Math.floor(Math.random() * (max - min + 1)) + min; // Generate a new ID if the current one exists
  }

  return id;
}

document.getElementById('create-call-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('call-type').value;
  const priority = document.getElementById('call-priority').value;
  const location = document.getElementById('call-location').value;
  const description = document.getElementById('call-description').value;
  const id = generateUniqueCallId(); // Get a unique ID
  calls.push({ id, type, priority, location, description });
  renderCalls();
  saveData();  // Save data to localStorage after adding a call
  e.target.reset();
  showPage('dashboard');
});

function deleteCall(index) {
  if (!isShiftPressed) {
    const confirmation = confirm('Are you sure you want to delete this call? This cannot be undone.');
    if (!confirmation) return;
  }
  calls.splice(index, 1);
  renderCalls();
  renderUnits();  // Update the units table
  saveData();  // Save data to localStorage after deleting a call
}

// --- BOLOs ---
function renderBolos() {
  const tbody = document.getElementById('bolos-table-body');
  tbody.innerHTML = bolos
    .map(
      (bolo, index) => `
      <tr>
        <td>${bolo.description}</td>
        <td>${bolo.lastSeen}</td>
        <td>${bolo.reason}</td>

        <td>
          <button style="padding: 0px; margin-right: 5px; background-color: transparent;" class="edit-bolo-btn" onclick="editBolo(${index})">
            <img src="assets/edit-icon.png" alt="Edit" style="width: 24px; height: 24px;">
          </button>

          <button style="padding: 0px; background-color: transparent;" onclick="deleteBolo(${index})">
            <img src="assets/delete-icon.png" alt="Delete" style="width: 24px; height: 24px;">
          </button>
        </td>
      </tr>
    `
    )
    .join('');
}

document.getElementById('create-bolo-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const description = document.getElementById('bolo-description').value;
  const lastSeen = document.getElementById('bolo-last-seen').value;
  const reason = document.getElementById('bolo-reason').value;
  bolos.push({ description, lastSeen, reason });
  renderBolos();
  saveData();  // Save data to localStorage after adding a bolo
  e.target.reset();
  showPage('dashboard');
});

function deleteBolo(index) {
  if (!isShiftPressed) {
    const confirmation = confirm('Are you sure you want to delete this bolo? This cannot be undone.');
    if (!confirmation) return;
  }
  bolos.splice(index, 1);
  renderBolos();
  saveData();  // Save data to localStorage after deleting a bolo
}

function editCall(index) {
  const call = calls[index];

  // Fill form inputs with the selected call's data
  document.getElementById('edit-call-type').value = call.type;
  document.getElementById('edit-call-priority').value = call.priority;
  document.getElementById('edit-call-location').value = call.location;
  document.getElementById('edit-call-description').value = call.description;

  // Show the edit call page
  showPage('edit-call');

  // Handle form submission
  const editCallForm = document.getElementById('edit-call-form');
  editCallForm.onsubmit = (e) => {
    e.preventDefault();

    // Update the call record with the new values
    call.type = document.getElementById('edit-call-type').value;
    call.priority = document.getElementById('edit-call-priority').value;
    call.location = document.getElementById('edit-call-location').value;
    call.description = document.getElementById('edit-call-description').value;

    // Render updated calls and return to dashboard
    renderCalls();
    saveData();
    showPage('dashboard');
  };
}

function editBolo(index) {
  const bolo = bolos[index];

  // Fill form inputs with the selected BOLO's data
  document.getElementById('edit-bolo-description').value = bolo.description;
  document.getElementById('edit-bolo-last-seen').value = bolo.lastSeen;
  document.getElementById('edit-bolo-reason').value = bolo.reason;

  // Show the edit BOLO page
  showPage('edit-bolo');

  // Handle form submission
  const editBoloForm = document.getElementById('edit-bolo-form');
  editBoloForm.onsubmit = (e) => {
    e.preventDefault();

    // Update the BOLO record with the new values
    bolo.description = document.getElementById('edit-bolo-description').value;
    bolo.lastSeen = document.getElementById('edit-bolo-last-seen').value;
    bolo.reason = document.getElementById('edit-bolo-reason').value;

    // Render updated BOLOs and return to dashboard
    renderBolos();
    saveData();
    showPage('dashboard');
  };
}


// --- Local Storage Functions ---

// Save data to localStorage
function saveData() {
  localStorage.setItem('units', JSON.stringify(units));
  localStorage.setItem('calls', JSON.stringify(calls));
  localStorage.setItem('bolos', JSON.stringify(bolos));
}

// Load data from localStorage
function loadData() {
  const savedUnits = localStorage.getItem('units');
  const savedCalls = localStorage.getItem('calls');
  const savedBolos = localStorage.getItem('bolos');

  if (savedUnits) units = JSON.parse(savedUnits);
  if (savedCalls) calls = JSON.parse(savedCalls);
  if (savedBolos) bolos = JSON.parse(savedBolos);
}

// Load data on page load
window.onload = function () {
  loadData();  // Load the data from localStorage
  renderUnits();
  renderCalls();
  renderBolos();
};

// --- Clear Page Functionality ---
function clearPage() {
  const confirmation = confirm('Are you sure you want to clear all data? This cannot be undone.');
  if (confirmation) {
    // Clear all data arrays
    units = [];
    calls = [];
    bolos = [];

    // Render empty tables
    renderUnits();
    renderCalls();
    renderBolos();

    // Clear localStorage
    localStorage.removeItem('units');
    localStorage.removeItem('calls');
    localStorage.removeItem('bolos');
  }
}

document.getElementById('clear-page').addEventListener('click', clearPage);
