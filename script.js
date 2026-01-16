let currentViewDate = new Date();
let eventDB = JSON.parse(localStorage.getItem('theme_cal_events')) || {};
let activeTheme = localStorage.getItem('user_theme') || 'space';
let activeDayKey = "";
let editingIdx = null;

const themes = {
    space: [
        "https://images.unsplash.com/photo-1462331940025-496dfbfc7564", // Jan
        "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa", // Feb
        "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9", // Mar
        "https://images.unsplash.com/photo-1454789548928-9efd52dc4031", // Apr
        "https://images.unsplash.com/photo-1464802686167-b939a6910659", // May
        "https://images.unsplash.com/photo-1614732414444-096e5f1122d5", // Jun
        "https://images.unsplash.com/photo-1506318137071-a8e063b4b67d", // Jul
        "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3", // Aug
        "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6", // Sep
        "https://images.unsplash.com/photo-1543722530-d2c3201371e7", // Oct
        "https://images.unsplash.com/photo-1538370910416-06ad66473bb6", // Nov
        "https://images.unsplash.com/photo-1502134249126-9f3755a50d78"  // Dec
    ],
    dogs: [
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
        "https://images.unsplash.com/photo-1517849845537-4d257902454a",
        "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8",
        "https://images.unsplash.com/photo-1534361960057-19889db9621e",
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
        "https://images.unsplash.com/photo-1561037404-61cd46aa615b",
        "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a",
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7",
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
        "https://images.unsplash.com/photo-1558121324-5a4014739da1",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee",
        "https://images.unsplash.com/photo-1513284004010-096739f72740"
    ],
    nature: [
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
        "https://images.unsplash.com/photo-1501854140801-50d01698950b",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d",
        "https://images.unsplash.com/photo-1433086566089-f70a6613a7ad",
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
        "https://images.unsplash.com/photo-1500673922987-e212871fec22",
        "https://images.unsplash.com/photo-1490730141103-6cac27aaab94",
        "https://images.unsplash.com/photo-1511497584788-876760111969",
        "https://images.unsplash.com/photo-1505765050516-f72dcac9c70f",
        "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07"
    ]
};

function render() {
    const grid = document.getElementById('calendarGrid');
    const banner = document.getElementById('monthBanner');
    grid.innerHTML = "";
    
    const y = currentViewDate.getFullYear();
    const m = currentViewDate.getMonth();

    // Apply selected theme image
    banner.style.backgroundImage = `url('${themes[activeTheme][m]}')`;

    document.getElementById('monthDisplay').innerText = 
        currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(y, m, 1).getDay();
    const daysCount = new Date(y, m + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(Object.assign(document.createElement('div'), {className: 'day'}));
    }

    for (let i = 1; i <= daysCount; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        const key = `${y}-${m + 1}-${i}`;
        
        if (i === new Date().getDate() && m === new Date().getMonth() && y === new Date().getFullYear()) {
            dayDiv.classList.add('today');
        }

        dayDiv.innerHTML = `<strong>${i}</strong>`;
        
        if (eventDB[key]) {
            eventDB[key].forEach(ev => {
                const b = document.createElement('div');
                b.className = 'event-badge';
                b.innerText = ev.text;
                b.style.backgroundColor = ev.color;
                dayDiv.appendChild(b);
            });
        }
        dayDiv.onclick = () => openModal(key, i);
        grid.appendChild(dayDiv);
    }
}

function updateTheme() {
    activeTheme = document.getElementById('themePicker').value;
    localStorage.setItem('user_theme', activeTheme);
    render();
}

function openModal(key, num) {
    activeDayKey = key;
    document.getElementById('selectedDateText').innerText = 
        currentViewDate.toLocaleString('default', { month: 'short' }) + " " + num;
    resetForm();
    updateList();
    document.getElementById('modal').style.display = 'flex';
}

function updateList() {
    const container = document.getElementById('entriesList');
    container.innerHTML = "";
    (eventDB[activeDayKey] || []).forEach((ev, idx) => {
        const div = document.createElement('div');
        div.className = 'entry-item';
        div.style.borderLeftColor = ev.color;
        div.innerHTML = `<span style="flex:1">${ev.text}</span>
            <button onclick="startEdit(${idx})" style="color:var(--accent); border:none; background:none; cursor:pointer; font-size:0.8rem">Edit</button>
            <button onclick="deleteEntry(${idx})" style="color:#f87171; border:none; background:none; cursor:pointer; font-size:0.8rem">Del</button>`;
        container.appendChild(div);
    });
}

function saveEntry() {
    const txt = document.getElementById('entryInput').value.trim();
    const clr = document.getElementById('entryColor').value;
    if (!txt) return;

    if (!eventDB[activeDayKey]) eventDB[activeDayKey] = [];
    if (editingIdx !== null) eventDB[activeDayKey][editingIdx] = { text: txt, color: clr };
    else eventDB[activeDayKey].push({ text: txt, color: clr });

    saveAndRefresh();
    resetForm();
    updateList();
}

function startEdit(idx) {
    editingIdx = idx;
    const ev = eventDB[activeDayKey][idx];
    document.getElementById('entryInput').value = ev.text;
    document.getElementById('entryColor').value = ev.color;
    document.getElementById('formTitle').innerText = "Edit Plan";
    document.getElementById('saveBtn').innerText = "Update";
    document.getElementById('cancelEditBtn').style.display = "inline-block";
}

function deleteEntry(idx) {
    eventDB[activeDayKey].splice(idx, 1);
    if (eventDB[activeDayKey].length === 0) delete eventDB[activeDayKey];
    saveAndRefresh();
    updateList();
}

function saveAndRefresh() {
    localStorage.setItem('theme_cal_events', JSON.stringify(eventDB));
    render();
}

function resetForm() {
    editingIdx = null;
    document.getElementById('entryInput').value = "";
    document.getElementById('formTitle').innerText = "Add New Entry";
    document.getElementById('saveBtn').innerText = "Save";
    document.getElementById('cancelEditBtn').style.display = "none";
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }
function changeMonth(s) { currentViewDate.setMonth(currentViewDate.getMonth() + s); render(); }

function exportData() {
    const blob = new Blob([JSON.stringify(eventDB)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `calendar-backup.json`;
    a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        eventDB = JSON.parse(event.target.result);
        saveAndRefresh();
    };
    reader.readAsText(e.target.files[0]);
}

// Init theme picker value on load
document.getElementById('themePicker').value = activeTheme;
render();