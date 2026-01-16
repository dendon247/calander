let currentDate = new Date();
// Data Structure: { "YYYY-M-D": [{text: "Meeting", color: "#hex"}, {...}] }
let events = JSON.parse(localStorage.getItem('calendar_v3_data')) || {};
let activeDateKey = "";
let editIndex = null; // Tracks index if we are editing an entry

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Set Month Label
    document.getElementById('monthDisplay').innerText = 
        currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Logic for Grid Alignment
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDayDate = new Date(year, month + 1, 0).getDate();

    // Previous month padding
    for (let i = 0; i < firstDayIndex; i++) {
        const div = document.createElement('div');
        div.classList.add('day');
        grid.appendChild(div);
    }

    // Days of month
    for (let i = 1; i <= lastDayDate; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        const dateKey = `${year}-${month + 1}-${i}`;

        // Highlight today's date
        if (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            dayDiv.classList.add('today');
        }

        dayDiv.innerHTML = `<strong>${i}</strong>`;

        // Display event tags on calendar
        if (events[dateKey]) {
            events[dateKey].forEach(entry => {
                const tag = document.createElement('div');
                tag.classList.add('event-text');
                tag.innerText = entry.text;
                tag.style.backgroundColor = entry.color;
                dayDiv.appendChild(tag);
            });
        }

        dayDiv.onclick = () => openModal(dateKey, i);
        grid.appendChild(dayDiv);
    }
}

function openModal(key, dayNum) {
    activeDateKey = key;
    document.getElementById('selectedDateText').innerText = 
        `${currentDate.toLocaleString('default', { month: 'short' })} ${dayNum}`;
    resetForm();
    updateModalList();
    document.getElementById('modal').style.display = 'flex';
}

function updateModalList() {
    const list = document.getElementById('entriesList');
    list.innerHTML = "";
    const dayEntries = events[activeDateKey] || [];

    if (dayEntries.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:#94a3b8; font-size:0.85rem; padding:10px;">No plans yet.</p>`;
        return;
    }

    dayEntries.forEach((entry, index) => {
        const item = document.createElement('div');
        item.classList.add('modal-entry-item');
        item.innerHTML = `
            <div class="entry-content" style="border-left: 4px solid ${entry.color}; padding-left: 10px;">
                ${entry.text}
            </div>
            <div class="entry-controls">
                <button class="edit-btn" onclick="startEdit(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function startEdit(index) {
    editIndex = index;
    const entry = events[activeDateKey][index];
    
    document.getElementById('entryInput').value = entry.text;
    document.getElementById('entryColor').value = entry.color;
    document.getElementById('formTitle').innerText = "Editing Entry";
    document.getElementById('saveBtn').innerText = "Update Entry";
    document.getElementById('cancelEditBtn').style.display = "inline-block";
}

function resetForm() {
    editIndex = null;
    document.getElementById('entryInput').value = "";
    document.getElementById('entryColor').value = "#2563eb";
    document.getElementById('formTitle').innerText = "Add New Entry";
    document.getElementById('saveBtn').innerText = "Add to Day";
    document.getElementById('cancelEditBtn').style.display = "none";
}

function saveEntry() {
    const text = document.getElementById('entryInput').value.trim();
    const color = document.getElementById('entryColor').value;

    if (!text) return;

    if (!events[activeDateKey]) events[activeDateKey] = [];

    if (editIndex !== null) {
        // Mode: Update
        events[activeDateKey][editIndex] = { text, color };
    } else {
        // Mode: Create
        events[activeDateKey].push({ text, color });
    }

    localStorage.setItem('calendar_v3_data', JSON.stringify(events));
    resetForm();
    updateModalList();
    renderCalendar();
}

function deleteEntry(index) {
    events[activeDateKey].splice(index, 1);
    // If no entries left for this date, clean up the key
    if (events[activeDateKey].length === 0) delete events[activeDateKey];
    
    localStorage.setItem('calendar_v3_data', JSON.stringify(events));
    updateModalList();
    renderCalendar();
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function changeMonth(step) {
    currentDate.setMonth(currentDate.getMonth() + step);
    renderCalendar();
}

// Start
renderCalendar();