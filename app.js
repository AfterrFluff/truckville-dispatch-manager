//Variables/Constants
let units = [];
let calls = [];
let bolos = [];
let settings = [
    unitAvail = false,
    instantDelete = false,
    disableNotifications = false,
    simpleZulu = false,
];
let selectedCall = 0; //0 default unselected
let callId = 0;

//Changelogs
const websiteInfo = { version: "0.2.2" };
const localInfo = JSON.parse(localStorage.getItem("localInfo")) || { version: "" };
const blurdrop = document.getElementById("popup-backdrop");
document.getElementById("ver").textContent = `v${websiteInfo.version}`; document.getElementById("changelog_ver").textContent = `Update ${websiteInfo.version}`;

function closeChangelogs() {
    const changelogDiv = document.getElementById("changelog-menu");
    changelogDiv.style.display = 'none'; blurdrop.style.display = 'none';
    localStorage.setItem("localInfo", JSON.stringify(websiteInfo)); // Update stored version
}

// Check for version mismatch
if (websiteInfo.version !== localInfo.version) {
    const changelogDiv = document.getElementById("changelog-menu");
    changelogDiv.style.display = 'block'; blurdrop.style.display = 'block';
}

//ZULU
function updateZuluTime() {
    const now = new Date();
    const isoString = now.toISOString();
    const [date, timeWithMilliseconds] = isoString.split('T');

    // Remove milliseconds from the time
    const time = timeWithMilliseconds.split('.')[0];

    document.getElementById('zulu-display').textContent = `${date} ${time}Z`;
}

updateZuluTime();
setInterval(updateZuluTime, 1000);

//Page Handling
function showPage(page, button) {
    // Hide all sections
    document.querySelectorAll('.page-container').forEach((frame) => {
        frame.style.display = 'none';
    });

    // Show the target section
    document.getElementById(`${page}-page`).style.display = 'flex';

    // Update button styles
    if (button) {
        document.querySelectorAll('.header__btn').forEach((btn) => btn.classList.remove('header__selected-btn'));
        button.classList.add('header__selected-btn');
    }
}

function showMessage(type, text, duration = 3000) {
    // Create a new message element
    const message = document.createElement('div');
    message.className = `response__msg response_${type}`;
    message.textContent = text;

    // Add the message to the container
    const container = document.getElementById('response-bg');
    container.appendChild(message);

    // Remove the message after the specified duration
    setTimeout(() => {
        message.classList.add('hidden');
        message.addEventListener('transitionend', () => {
            message.remove();
        });
    }, duration);
}

// ------- LOCAL STORAGE HANDLING -------
function saveData() {
    localStorage.setItem('units', JSON.stringify(units));
    localStorage.setItem('calls', JSON.stringify(calls));
    localStorage.setItem('callId', JSON.stringify(callId));
    localStorage.setItem('settings', JSON.stringify(settings));
}

function loadData() {
    const savedUnits = localStorage.getItem('units');
    const savedCalls = localStorage.getItem('calls');
    const savedCallId = localStorage.getItem('callId');
    const savedSettings = localStorage.getItem('settings');

    if (savedUnits) units = JSON.parse(savedUnits);
    if (savedCalls) calls = JSON.parse(savedCalls);
    if (savedCallId) callId = JSON.parse(savedCallId);
    if (savedSettings) settings = JSON.parse(savedSettings);
}

function resetDashboard() {
    const confirmation = confirm('Are you sure you would like to the dashboard data?');
    if (!confirmation) return;

    units = []; bolos = []; calls = [];
    selectedCall = 0;
    saveData();
    renderCalls(); renderUnits();
    clearEditor();
    showMessage("success", "Successfully completed the dashboard reset.", 3000)
}

window.onload = function () {
    loadData();
    renderUnits();
    renderCalls();
};

function updateFooterStats() {
    document.getElementById('footer-units').textContent = units.length;
    document.getElementById('footer-calls').textContent = calls.length;
    document.getElementById('footer-bolos').textContent = bolos.length;
}

// ------- CALLS -------
document.getElementById('clear-editor-btn').addEventListener('click', clearEditor);
document.getElementById('create-call-btn').addEventListener('click', createCall);
document.getElementById('update-call-btn').addEventListener('click', updateCall);

function createCall() {
    let title = document.getElementById('id-title-input').value;
    let location = document.getElementById('id-location-input').value;
    let priority = document.getElementById('id-priority-input').value;
    let description = document.getElementById('id-description-input').value;

    if (title && location && priority !== "N/A") {
        callId++
        const newCall = {
            id: callId,
            title: title,
            location: location,
            units: [],
            priority: priority,
            description: description
        };

        calls.push(newCall);
        clearEditor();
        renderCalls();
        saveData();
        showMessage("success", `New Dispatch #${callId} successfully created!`, 3000)
    } else {
        showMessage("warning", "Ensure you fill all fields, however description is optional!", 4000)
    }
}

function renderCalls() {
    updateFooterStats();
    const calls_body = document.getElementById('q-table__calls-body');
    const nonActive = document.getElementById('no-active-calls');

    calls_body.innerHTML = calls.map((call, index) =>
        `
        <tr>
            <td>
                <button class="button"
                    style="background-color: #3b6cec; height: auto; width: 100%; border-radius: 10px; padding: 5px 10px; font-size: 11px;"
                    id="select-call-id"
                    onclick="selectCall(${index})">
                    ${call.id}
                </button>
            </td>

            <td>
                ${call.title}
            </td>

            <td>
                ${call.location}
            </td>

            <td>
                ${call.units.join(", ")}
            </td>

            <td>
                ${call.priority}
            </td>

            <td style="text-align: left;">
                <button class="button"
                    style="border: 2px solid rgb(236, 59, 59); height: 22px; width: 22px; border-radius: 1em; padding: 5px; font-size: 18px;"
                    id="add-call-btn" onclick="deleteCall(${index})">
                    <img src="assets/icons/trash_vector.png" style="height: 12px;">
                </button>
            </td>
        </tr>
    `
    ).join('');

    if (calls.length > 0) {
        nonActive.style.display = 'none';
    } else {
        nonActive.style.display = 'block';
    }
}

function updateCall() {
    let call = calls.find(call => call.id === selectedCall);
    if (!call) { 
        return;
     } //If call isn't found

    let title = document.getElementById('id-title-input').value;
    let location = document.getElementById('id-location-input').value;
    let priority = document.getElementById('id-priority-input').value;
    let description = document.getElementById('id-description-input').value;

    if (title && location && priority !== "N/A") {
        call.title = title;
        call.location = location;
        call.priority = priority;
        call.description = description;

        renderCalls();
        saveData();
        showMessage("message", `Dispatch #${selectedCall} successfully updated!`, 3000)
    } else {
        showMessage("warning", "Ensure you fill all fields, however description is optional!", 4000)
    }

    renderCalls();
    saveData();
}

function deleteCall(index) {
    if (!isShiftPressed) {
        const confirmation = confirm('Are you sure you want to delete this call? This cannot be undone.');
        if (!confirmation) return;
    }

    if (calls[index].id == selectedCall) { clearEditor(); }

    calls.splice(index, 1);

    renderCalls();
    saveData();
}

function selectCall(index) {
    let call = calls[index]
    selectedCall = call.id;
    document.getElementById('dispatch-title-id').textContent = `DISPATCH: #${selectedCall}`;

    document.getElementById('id-title-input').value = call.title;
    document.getElementById('id-location-input').value = call.location;
    document.getElementById('id-priority-input').value = call.priority;
    document.getElementById('id-description-input').value = call.description;

    document.getElementById('attached-units-display').textContent = `ATTACHED UNITS: ${call.units.join(", ")}`;

    document.getElementById('update-call-btn').style.display = 'block';
    document.getElementById('create-call-btn').style.display = 'none';
}

function clearEditor() {
    selectedCall = 0;
    document.getElementById('dispatch-title-id').textContent = "NEW DISPATCH";
    document.getElementById('attached-units-display').textContent = "ATTACHED UNITS:";

    document.getElementById('id-title-input').value = "";
    document.getElementById('id-location-input').value = "";
    document.getElementById('id-priority-input').value = "N/A";
    document.getElementById('id-description-input').value = "";

    document.getElementById('update-call-btn').style.display = 'none';
    document.getElementById('create-call-btn').style.display = 'block';
}

// ------- UNITS -------
document.getElementById('add-unit-btn').addEventListener('click', addUnit);

function addUnit() {
    if (units.length <= 15) {
        const newUnit = {
            unitNumber: '',
            name: '',
            department: 'N/A',
            status: 'N/A'
        };

        units.push(newUnit);
        renderUnits();
    } else {
        showMessage("warning", "Uh oh, cannot add more than 15 units at once!", 4000)
    }

    saveData();
}

function renderUnits() {
    updateFooterStats();

    const units_body = document.getElementById('q-table__units-body');
    const nonActive = document.getElementById('no-active-units');

    units_body.innerHTML = units.map((unit, index) =>
        `
        <tr>
            <td>
                <input onchange="updateUnit(${index}, 'unitNumber', this.value)" type="text" placeholder="XXX" value="${unit.unitNumber}">
            </td>

            <td>
                <input onchange="updateUnit(${index}, 'name', this.value)" type="text" placeholder="NOT ASSIGNED" value="${unit.name}">
            </td>

            <td>
                <select onchange="updateUnit(${index}, 'department', this.value)" style="color: ${getDepartmentColor(unit.department)}">
                    <option value="N/A" class="status-na" ${unit.department === 'N/A' ? 'selected' : ''}>N/A</option>
                    <option value="FVMPD" class="fvmpd" ${unit.department === 'FVMPD' ? 'selected' : ''}>FVMPD</option>
                    <option value="NPS" class="nps" ${unit.department === 'NPS' ? 'selected' : ''}>NPS</option>
                    <option value="OUSO" class="ouso" ${unit.department === 'OUSO' ? 'selected' : ''}>OUSO</option>
                    <option value="WSP" class="wsp" ${unit.department === 'WSP' ? 'selected' : ''}>WSP</option>
                    <option value="GVFD" class="gvfd" ${unit.department === 'GVFD' ? 'selected' : ''}>GVFD</option>
                    <option value="WISDOT" class="wisdot" ${unit.department === 'WISDOT' ? 'selected' : ''}>WISDOT</option>
                </select>
            </td>

            <td>
                <select onchange="updateUnit(${index}, 'status', this.value)" style="color: ${getStatusColor(unit.status)}">
                    <option value="N/A" class="status-na" ${unit.status === 'N/A' ? 'selected' : ''}>N/A</option>
                    <option value="BUSY" class="status-busy" ${unit.status === 'BUSY' ? 'selected' : ''}>BUSY</option>
                    <option value="UNAVAILABLE" class="status-unavailable" ${unit.status === 'UNAVAILABLE' ? 'selected' : ''}>UNAVAILABLE</option>
                    <option value="AVAILABLE" class="status-available" ${unit.status === 'AVAILABLE' ? 'selected' : ''}>AVAILABLE</option>
                    <option value="ENROUTE" class="status-enroute" ${unit.status === 'ENROUTE' ? 'selected' : ''}>ENROUTE</option>
                    <option value="ON SCENE" class="status-on-scene" ${unit.status === 'ON SCENE' ? 'selected' : ''}>ON SCENE</option>
                    <option value="PRIORITY" class="status-priority" ${unit.status === 'PRIORITY' ? 'selected' : ''}>PRIORITY</option>
                </select>
            </td>

            <td style="text-align: left; display: flex; gap: 10px;">
                <button class="button"
                    style="border: 2px solid #26a69a; height: 22px; width: 22px; border-radius: 1em; padding: 5px; font-size: 18px;"
                    onclick="assignUnit(${index})">
                    <img src="assets/icons/human_vector.png" style="height: 12px;">
                </button>

                <button class="button"
                    style="border: 2px solid rgb(236, 59, 59); height: 22px; width: 22px; border-radius: 1em; padding: 5px; font-size: 18px;"
                    onclick="deleteUnit(${index})">
                    <img src="assets/icons/trash_vector.png" style="height: 12px;">
                </button>
            </td>
        </tr>
    `
    ).join('');

    if (units.length > 0) {
        nonActive.style.display = 'none';
    } else {
        nonActive.style.display = 'block';
    }
}

function assignUnit(index) {
    let unitNumber = units[index].unitNumber
    
    //Find selected call & it's array index and attach the unit to it for data (Toggle so if already there, remove)
    let call = calls.find(call => call.id === selectedCall);
    if (!call || !unitNumber) { return } //If call isn't found

    if(call.units.includes(unitNumber)) {
        let indexOfUnitNumber = call.units.indexOf(unitNumber);
        call.units.splice(indexOfUnitNumber, 1);
        showMessage("warning", `Unit ${unitNumber} has been dettached from Call #${call.id}`)
    } else {
        call.units.push(unitNumber);
        showMessage("message", `Unit ${unitNumber} has been attached Call #${call.id}`)
    }

    selectCall(calls.findIndex(call => call.id === selectedCall));
    renderCalls();
    saveData();
}

function updateUnit(index, key, value) {
    units[index][key] = value;  // Update the specific key of the unit
    const statusSelect = document.querySelector(`#q-table__units-body tr:nth-child(${index + 1}) td:nth-child(4) select`);
    const departmentSelect = document.querySelector(`#q-table__units-body tr:nth-child(${index + 1}) td:nth-child(3) select`);

    if (key === "status") {
        statusSelect.style.color = getStatusColor(value);
    } else if (key === "department") {
        departmentSelect.style.color = getDepartmentColor(value);
    }

    saveData();
}

function getStatusColor(status) {
    switch (status) {
        case 'N/A':
            return '#dedee7';
        case 'BUSY':
            return '#ed7315';
        case 'UNAVAILABLE':
            return '#980919';
        case 'AVAILABLE':
            return '#26a69a';
        case 'ENROUTE':
            return '#2652a4';
        case 'ON SCENE':
            return '#26a642';
        case 'PRIORITY':
            return 'red';
        case 'PANIC':
            return '#910606';
        default:
            return '#dedee7';
    }
}

function getDepartmentColor(dept) {
    switch (dept) {
        case 'N/A':
            return '#dedee7';
        case 'FVMPD':
            return '#0031a5';
        case 'NPS':
            return '#127501';
        case 'OUSO':
            return '#866551';
        case 'WSP':
            return '#476fb4';
        case 'GVFD':
            return '#9b3a3a';
        case 'WISDOT':
            return '#e49310';
        default:
            return '#dedee7';
    }
}


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

function deleteUnit(index) {
    if (!isShiftPressed) {
        const confirmation = confirm('Are you sure you want to delete this unit? This cannot be undone.');
        if (!confirmation) return;
    }
    units.splice(index, 1);
    renderUnits();

    saveData();
}

//SETTINGS
function toggleSettingsFrame() {
    let settingsFrame = document.getElementById('settings-menu')
    settingsFrame.style.display = settingsFrame.style.display === "none" ? "block" : "none"; 
}
