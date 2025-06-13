// Device data from CSV
let deviceData = [
    { id: 1, category: "Sound System", name: "Mixer", model: "Pioneer DJM‑900NXS2", qty: 1, watts: 40, va: 70, notes: "Main audio mixer" },
    { id: 2, category: "Sound System", name: "Media Player", model: "Pioneer CDJ‑2000NXS2", qty: 2, watts: 50, va: 75, notes: "50W/75VA each" },
    { id: 3, category: "Sound System", name: "Laptop", model: "Acer Aspire V3‑471G", qty: 1, watts: 65, va: 90, notes: "Used for DJ software" },
    { id: 4, category: "Sound System", name: "Digital Mixer", model: "Behringer/Midas MR12", qty: 1, watts: 15, va: 25, notes: "Remote audio management" },
    { id: 5, category: "Sound System", name: "Graphic Equalizer", model: "Tapco T231", qty: 1, watts: 30, va: 45, notes: "" },
    { id: 6, category: "Sound System", name: "Signal Processor", model: "dbx DriveRack PA2", qty: 1, watts: 20, va: 35, notes: "Speaker tuning" },
    { id: 7, category: "Sound System", name: "Amplifier", model: "MicroTech GM2", qty: 3, watts: 250, va: 350, notes: "250W/350VA each" },
    { id: 8, category: "Sound System", name: "Amplifier", model: "Soundstandard Techno 4A", qty: 1, watts: 300, va: 450, notes: "High power amp" },
    { id: 9, category: "Sound System", name: "Speaker", model: "Partner PS 15” Passive", qty: 5, watts: 300, va: 300, notes: "Use 2 Amplifier" },
    { id: 10, category: "Sound System", name: "Speaker", model: "CAT Dual 15” Cabinet", qty: 4, watts: 600, va: 600, notes: "Use 2 Amplifier" },
    { id: 11, category: "Lighting", name: "Desktop PC", model: "Dell OptiPlex-style", qty: 1, watts: 150, va: 250, notes: "Sound control system" },
    { id: 12, category: "Lighting", name: "DMX Interface", model: "NightSun DMX8", qty: 1, watts: 20, va: 30, notes: "Controls lighting" },
    { id: 13, category: "Lighting", name: "Laser", model: "EL‑400RGB MK2", qty: 3, watts: 30, va: 30, notes: "Laser RGB DMX" },
    { id: 14, category: "Lighting", name: "Moving Head LED", model: "230W Beam Moving Head", qty: 6, watts: 250, va: 250, notes: "LED Beam Moving Head, DMX" },
    { id: 15, category: "Lighting", name: "PAR64 RGBW", model: "LED PAR64 MKII RGBW", qty: 22, watts: 16, va: 16, notes: "168×10 mm RGBW LEDs, DMX" },
    { id: 16, category: "Lighting", name: "Smoke Machine", model: "Generic 1500W Fog Machine", qty: 1, watts: 1500, va: 1500, notes: "Stage smoke machine, DMX or remote control" },
    { id: 17, category: "Lighting", name: "Blacklight Blue Fluorescent", model: "BLB Tube 32W", qty: 30, watts: 32, va: 32, notes: "Blacklight-blue UV fluorescent tube" },
    { id: 18, category: "Lighting", name: "Blacklight Blue Fluorescent", model: "BLB Tube 18W", qty: 1, watts: 18, va: 18, notes: "Blacklight-blue UV fluorescent tube" }
];

// Category icons mapping
const categoryIcons = {
    "Sound System": "🔊",
    "Lighting": "💡",
    "Computer": "💻",
    "Networking": "🌐",
    "Other": "🔧"
};

// App state
const state = {
    currentDevice: null,
    currentPlug: null,
    currentUPS: null,
    assignments: {},
    nextDeviceId: 19,
    nextUPSId: 2,
    upsUnits: [
        {
            id: 1,
            label: "UPS 1",
            capacity: { watts: 1400, va: 2000 },
            plugs: Array(8).fill().map((_, i) => ({
                id: i + 1,
                devices: [],
                totalWatts: 0,
                totalVA: 0
            })),
            totalWatts: 0,
            totalVA: 0
        }
    ],
    viewMode: 'grid' // 'grid' or 'list'
};

// DOM elements
const devicesContainer = document.getElementById('devices-container');
const upsContainer = document.getElementById('ups-container');
const totalDevicesEl = document.getElementById('total-devices');
const totalUPSEl = document.getElementById('total-ups');
const totalPowerEl = document.getElementById('total-power');
const deviceModal = document.getElementById('device-modal');
const quantityModal = document.getElementById('quantity-modal');
const modalDeviceName = document.getElementById('modal-device-name');
const quantityInput = document.getElementById('quantity');
const assignBtn = document.getElementById('assign-btn');
const cancelBtn = document.getElementById('cancel-btn');
const addDeviceBtn = document.getElementById('add-device-btn');
const addDeviceModalBtn = document.getElementById('add-device-modal-btn');
const addUPSBtn = document.getElementById('add-ups-btn');
const saveBtn = document.getElementById('save-btn');
const resetBtn = document.getElementById('reset-btn');
const selectionInfo = document.getElementById('selection-info');
const selectedDeviceName = document.getElementById('selected-device-name');
const gridViewBtn = document.getElementById('grid-view-btn');
const listViewBtn = document.getElementById('list-view-btn');

// Initialize the application
function init() {
    renderDeviceLibrary();
    renderUPSUnits();
    setupEventListeners();
    updateStats();
}

// Render device library
function renderDeviceLibrary() {
    devicesContainer.innerHTML = '';
    devicesContainer.className = 'devices-container';
    
    if (state.viewMode === 'list') {
        devicesContainer.classList.add('compact-list');
    }
    
    if (deviceData.length === 0) {
        devicesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-server"></i>
                <h3>No Devices Found</h3>
                <p>Add your first device to get started</p>
            </div>
        `;
        return;
    }
    
    deviceData.forEach(device => {
        const deviceCard = document.createElement('div');
        deviceCard.className = 'device-card';
        if (state.currentDevice === device.id) {
            deviceCard.classList.add('selected');
        }
        deviceCard.dataset.deviceId = device.id;
        
        if (state.viewMode === 'list') {
            deviceCard.innerHTML = `
                <div class="device-icon">${categoryIcons[device.category] || '📱'}</div>
                <div class="device-info">
                    <div class="device-name">${device.name}</div>
                    <div class="device-power">${device.watts}W / ${device.va}VA</div>
                </div>
                <div class="remove-device" data-device-id="${device.id}">
                    <i class="fas fa-times"></i>
                </div>
            `;
        } else {
            deviceCard.innerHTML = `
                <div class="device-icon">${categoryIcons[device.category] || '📱'}</div>
                <div class="device-name">${device.name}</div>
                <div class="device-model">${device.model}</div>
                <div class="device-power">${device.watts}W / ${device.va}VA</div>
                <div class="device-category">${device.category}</div>
                <div class="remove-device" data-device-id="${device.id}">
                    <i class="fas fa-times"></i>
                </div>
            `;
        }
        
        devicesContainer.appendChild(deviceCard);
    });
    
    updateStats();
}

// Render UPS units
function renderUPSUnits() {
    upsContainer.innerHTML = '';
    
    if (state.upsUnits.length === 0) {
        upsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-plug"></i>
                <h3>No UPS Units</h3>
                <p>Add your first UPS unit to get started</p>
            </div>
        `;
        return;
    }
    
    state.upsUnits.forEach(ups => {
        const upsBox = document.createElement('div');
        upsBox.className = 'ups-box';
        upsBox.dataset.upsId = ups.id;
        
        // Create plug rows
        let plugRowsHTML = '';
        
        // First row: plugs 1-4 (3 red + 1 white)
        plugRowsHTML += `
            <div class="plugs-container">
                <div class="plug-row">
                    <div class="plug-group">
                        <div class="plug red" data-plug-id="1" data-ups-id="${ups.id}">
                            <div class="plug-label">Plug 1</div>
                            <div class="plug-assignments" data-plug-assignment="1" data-ups-id="${ups.id}"></div>
                            <div class="plug-total" data-plug-load="1" data-ups-id="${ups.id}">0W</div>
                        </div>
                        <div class="plug red" data-plug-id="2" data-ups-id="${ups.id}">
                            <div class="plug-label">Plug 2</div>
                            <div class="plug-assignments" data-plug-assignment="2" data-ups-id="${ups.id}"></div>
                            <div class="plug-total" data-plug-load="2" data-ups-id="${ups.id}">0W</div>
                        </div>
                        <div class="plug red" data-plug-id="3" data-ups-id="${ups.id}">
                            <div class="plug-label">Plug 3</div>
                            <div class="plug-assignments" data-plug-assignment="3" data-ups-id="${ups.id}"></div>
                            <div class="plug-total" data-plug-load="3" data-ups-id="${ups.id}">0W</div>
                        </div>
                        <div class="plug white" data-plug-id="4" data-ups-id="${ups.id}">
                            <div class="plug-label">Plug 4</div>
                            <div class="plug-assignments" data-plug-assignment="4" data-ups-id="${ups.id}"></div>
                            <div class="plug-total" data-plug-load="4" data-ups-id="${ups.id}">0W</div>
                        </div>
                    </div>
                </div>
                
                <div class="plug-row">
                    <div class="plug-group">
                        <div class="plug red" data-plug-id="5" data-ups-id="${ups.id}">
                            <div class="plug-label">Plug 5</div>
                            <div class="plug-assignments" data-plug-assignment="5" data-ups-id="${ups.id}"></div>
                            <div class="plug-total" data-plug-load="5" data-ups-id="${ups.id}">0W</div>
                        </div>
                        <div class="plug red" data-plug-id="6" data-ups-id="${ups.id}">
                            <div class="plug-label">Plug 6</div>
                            <div class="plug-assignments" data-plug-assignment="6" data-ups-id="${ups.id}"></div>
                            <div class="plug-total" data-plug-load="6" data-ups-id="${ups.id}">0W</div>
                        </div>
                        <div class="plug red" data-plug-id="7" data-ups-id="${ups.id}">
                            <div class="plug-label">Plug 7</div>
                            <div class="plug-assignments" data-plug-assignment="7" data-ups-id="${ups.id}"></div>
                            <div class="plug-total" data-plug-load="7" data-ups-id="${ups.id}">0W</div>
                        </div>
                        <div class="plug white" data-plug-id="8" data-ups-id="${ups.id}">
                            <div class="plug-label">Plug 8</div>
                            <div class="plug-assignments" data-plug-assignment="8" data-ups-id="${ups.id}"></div>
                            <div class="plug-total" data-plug-load="8" data-ups-id="${ups.id}">0W</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        upsBox.innerHTML = `
            <div class="remove-ups" data-ups-id="${ups.id}">
                <i class="fas fa-trash-alt"></i>
            </div>
            <div class="ups-header">
                <div class="ups-title">
                    <i class="fas fa-plug"></i> ${ups.label}
                </div>
                <div class="ups-capacity">${ups.capacity.watts}W / ${ups.capacity.va}VA</div>
            </div>
            
            <div class="ups-total" id="ups-total-${ups.id}">
                Total Load: <span id="total-watts-${ups.id}">0</span>W / 
                <span id="total-va-${ups.id}">0</span>VA
            </div>
            
            ${plugRowsHTML}
            
            <button class="btn btn-warning" data-ups-id="${ups.id}" onclick="resetUPS(${ups.id})">
                <i class="fas fa-sync-alt"></i> Reset UPS
            </button>
        `;
        
        upsContainer.appendChild(upsBox);
    });
    
    // Render assignments
    state.upsUnits.forEach(ups => {
        ups.plugs.forEach(plug => {
            updatePlugDisplay(ups.id, plug.id);
        });
        updateTotalLoad(ups.id);
    });
    
    updateStats();
}

// Setup event listeners
function setupEventListeners() {
    // Add device button
    addDeviceBtn.addEventListener('click', () => {
        document.getElementById('device-name').value = '';
        document.getElementById('device-watts').value = '';
        document.getElementById('device-va').value = '';
        document.getElementById('device-notes').value = '';
        deviceModal.style.display = 'flex';
    });
    
    // Close modals
    document.getElementById('close-device-modal').addEventListener('click', () => {
        deviceModal.style.display = 'none';
    });
    
    document.getElementById('cancel-device-modal-btn').addEventListener('click', () => {
        deviceModal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        quantityModal.style.display = 'none';
    });
    
    // Add device from modal
    addDeviceModalBtn.addEventListener('click', addNewDevice);
    
    // Assign device to plug
    assignBtn.addEventListener('click', assignDevice);
    
    // Add UPS
    addUPSBtn.addEventListener('click', addNewUPS);
    
    // Save configuration
    saveBtn.addEventListener('click', saveConfiguration);
    
    // Reset all
    resetBtn.addEventListener('click', resetAll);
    
    // Remove device
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-device')) {
            const deviceId = parseInt(e.target.closest('.remove-device').dataset.deviceId);
            removeDevice(deviceId);
        }
        
        if (e.target.closest('.remove-ups')) {
            const upsId = parseInt(e.target.closest('.remove-ups').dataset.upsId);
            removeUPS(upsId);
        }
    });
    
    // Device selection
    document.addEventListener('click', function(e) {
        const deviceCard = e.target.closest('.device-card');
        if (deviceCard) {
            const deviceId = parseInt(deviceCard.dataset.deviceId);
            selectDevice(deviceId);
        }
        
        const plug = e.target.closest('.plug');
        if (plug && state.currentDevice) {
            const plugId = parseInt(plug.dataset.plugId);
            const upsId = parseInt(plug.dataset.upsId);
            assignToPlug(upsId, plugId);
        }
    });
    
    // View mode toggle
    gridViewBtn.addEventListener('click', () => {
        state.viewMode = 'grid';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        renderDeviceLibrary();
    });
    
    listViewBtn.addEventListener('click', () => {
        state.viewMode = 'list';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        renderDeviceLibrary();
    });
}

// Select a device
function selectDevice(deviceId) {
    state.currentDevice = deviceId;
    renderDeviceLibrary();
    
    // Update selection info
    const device = deviceData.find(d => d.id === deviceId);
    if (device) {
        document.getElementById('selected-device-name').textContent = device.name;
        selectionInfo.style.display = 'flex';
    }
}

// Assign to plug
function assignToPlug(upsId, plugId) {
    if (!state.currentDevice) {
        alert('Please select a device first');
        return;
    }
    
    state.currentPlug = plugId;
    state.currentUPS = upsId;
    
    // Show quantity modal
    const device = deviceData.find(d => d.id === state.currentDevice);
    modalDeviceName.textContent = device.name;
    quantityInput.value = 1;
    quantityModal.style.display = 'flex';
}

// Assign device to plug
function assignDevice() {
    const quantity = parseInt(quantityInput.value);
    const deviceId = state.currentDevice;
    const plugId = state.currentPlug;
    const upsId = state.currentUPS;
    
    if (!deviceId || !plugId || !upsId || quantity < 1 || quantity > 10) {
        quantityModal.style.display = 'none';
        return;
    }
    
    // Find the device data
    const device = deviceData.find(d => d.id === deviceId);
    if (!device) return;
    
    // Find the UPS and plug
    const ups = state.upsUnits.find(u => u.id === upsId);
    if (!ups) return;
    
    const plug = ups.plugs.find(p => p.id === plugId);
    if (!plug) return;
    
    // Check if device already exists on this plug
    const existingDevice = plug.devices.find(d => d.deviceId === deviceId);
    
    if (existingDevice) {
        // Update quantity
        existingDevice.quantity += quantity;
        existingDevice.totalWatts = existingDevice.quantity * device.watts;
        existingDevice.totalVA = existingDevice.quantity * device.va;
    } else {
        // Add new device to plug
        plug.devices.push({
            deviceId: device.id,
            name: device.name,
            quantity: quantity,
            totalWatts: device.watts * quantity,
            totalVA: device.va * quantity
        });
    }
    
    // Update plug totals
    plug.totalWatts = plug.devices.reduce((sum, d) => sum + d.totalWatts, 0);
    plug.totalVA = plug.devices.reduce((sum, d) => sum + d.totalVA, 0);
    
    // Update UPS totals
    ups.totalWatts = ups.plugs.reduce((sum, p) => sum + p.totalWatts, 0);
    ups.totalVA = ups.plugs.reduce((sum, p) => sum + p.totalVA, 0);
    
    // Update UI
    updatePlugDisplay(upsId, plugId);
    updateTotalLoad(upsId);
    
    // Hide modal
    quantityModal.style.display = 'none';
    updateStats();
}

// Update plug display
function updatePlugDisplay(upsId, plugId) {
    const ups = state.upsUnits.find(u => u.id === upsId);
    if (!ups) return;
    
    const plug = ups.plugs.find(p => p.id === plugId);
    if (!plug) return;
    
    const plugAssignment = document.querySelector(`.plug-assignments[data-plug-assignment="${plugId}"][data-ups-id="${upsId}"]`);
    const plugTotal = document.querySelector(`.plug-total[data-plug-load="${plugId}"][data-ups-id="${upsId}"]`);
    const plugElement = document.querySelector(`.plug[data-plug-id="${plugId}"][data-ups-id="${upsId}"]`);
    
    // Update assignments
    plugAssignment.innerHTML = '';
    if (plug.devices.length === 0) {
        plugAssignment.innerHTML = '<div class="assigned-item"><span>Empty</span></div>';
    } else {
        plug.devices.forEach(device => {
            const deviceEl = document.createElement('div');
            deviceEl.className = 'assigned-item';
            deviceEl.innerHTML = `
                <span class="assigned-device">${device.name}</span>
                <span class="assigned-quantity">x${device.quantity}</span>
            `;
            plugAssignment.appendChild(deviceEl);
        });
    }
    
    // Update total
    plugTotal.textContent = `${plug.totalWatts}W`;
    
    // Check for plug overload (over 300W)
    if (plug.totalWatts > 300) {
        plugElement.classList.add('plug-overload');
    } else {
        plugElement.classList.remove('plug-overload');
    }
}

// Update total load for UPS
function updateTotalLoad(upsId) {
    const ups = state.upsUnits.find(u => u.id === upsId);
    if (!ups) return;
    
    const totalWattsEl = document.getElementById(`total-watts-${upsId}`);
    const totalVAEl = document.getElementById(`total-va-${upsId}`);
    const upsTotalEl = document.getElementById(`ups-total-${upsId}`);
    
    if (totalWattsEl) totalWattsEl.textContent = ups.totalWatts;
    if (totalVAEl) totalVAEl.textContent = ups.totalVA;
    
    // Update UPS status
    upsTotalEl.classList.remove('ups-warning', 'ups-overload');
    
    if (ups.totalWatts > 1200) {
        upsTotalEl.classList.add('ups-overload');
    } else if (ups.totalWatts > 1000) {
        upsTotalEl.classList.add('ups-warning');
    }
}

// Add new device
function addNewDevice() {
    const name = document.getElementById('device-name').value.trim();
    const category = document.getElementById('device-category').value;
    const watts = parseInt(document.getElementById('device-watts').value);
    const va = parseInt(document.getElementById('device-va').value);
    const notes = document.getElementById('device-notes').value.trim();
    
    if (!name || isNaN(watts) || isNaN(va)) {
        alert('Please fill in all required fields with valid values');
        return;
    }
    
    const newDevice = {
        id: state.nextDeviceId++,
        category,
        name,
        model: '',
        qty: 1,
        watts,
        va,
        notes
    };
    
    deviceData.push(newDevice);
    renderDeviceLibrary();
    deviceModal.style.display = 'none';
}

// Remove device
function removeDevice(deviceId) {
    if (confirm('Are you sure you want to remove this device?')) {
        deviceData = deviceData.filter(d => d.id !== deviceId);
        renderDeviceLibrary();
    }
}

// Add new UPS
function addNewUPS() {
    const newUPS = {
        id: state.nextUPSId++,
        label: `UPS ${state.nextUPSId - 1}`,
        capacity: { watts: 1400, va: 2000 },
        plugs: Array(8).fill().map((_, i) => ({
            id: i + 1,
            devices: [],
            totalWatts: 0,
            totalVA: 0
        })),
        totalWatts: 0,
        totalVA: 0
    };
    
    state.upsUnits.push(newUPS);
    renderUPSUnits();
}

// Remove UPS
function removeUPS(upsId) {
    if (state.upsUnits.length <= 1) {
        alert('You need at least one UPS unit');
        return;
    }
    
    if (confirm('Are you sure you want to remove this UPS?')) {
        state.upsUnits = state.upsUnits.filter(u => u.id !== upsId);
        renderUPSUnits();
    }
}

// Reset UPS
window.resetUPS = function(upsId) {
    const ups = state.upsUnits.find(u => u.id === upsId);
    if (!ups) return;
    
    ups.plugs.forEach(plug => {
        plug.devices = [];
        plug.totalWatts = 0;
        plug.totalVA = 0;
    });
    
    ups.totalWatts = 0;
    ups.totalVA = 0;
    
    // Update UI
    ups.plugs.forEach(plug => {
        updatePlugDisplay(upsId, plug.id);
    });
    updateTotalLoad(upsId);
    updateStats();
}

// Reset everything
function resetAll() {
    if (confirm('Are you sure you want to reset everything?')) {
        state.upsUnits = [
            {
                id: 1,
                label: "UPS 1",
                capacity: { watts: 1400, va: 2000 },
                plugs: Array(8).fill().map((_, i) => ({
                    id: i + 1,
                    devices: [],
                    totalWatts: 0,
                    totalVA: 0
                })),
                totalWatts: 0,
                totalVA: 0
            }
        ];
        
        state.nextUPSId = 2;
        state.currentDevice = null;
        selectionInfo.style.display = 'none';
        renderDeviceLibrary();
        renderUPSUnits();
        updateStats();
    }
}

// Save configuration
function saveConfiguration() {
    const config = {
        devices: deviceData,
        upsUnits: state.upsUnits,
        nextDeviceId: state.nextDeviceId,
        nextUPSId: state.nextUPSId
    };
    
    localStorage.setItem('upsConfig', JSON.stringify(config));
    alert('Configuration saved successfully!');
}

// Update stats
function updateStats() {
    totalDevicesEl.textContent = deviceData.length;
    totalUPSEl.textContent = state.upsUnits.length;
    
    // Calculate total power
    let totalPower = 0;
    state.upsUnits.forEach(ups => {
        totalPower += ups.totalWatts;
    });
    totalPowerEl.textContent = totalPower;
}

// Initialize app on load
document.addEventListener('DOMContentLoaded', init);
