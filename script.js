let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('multi_event_calendar')) || {};
let activeDateKey = "";

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('monthDisplay').innerText = 
        currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        div.classList.add('day');
        grid.appendChild(div);
    }

    // Days for current month
    for (let i = 1; i <= totalDays; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        const dateKey = `${year}-${month + 1}-${i}`;

        if (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            dayDiv.classList.add('today');
        }

        dayDiv.innerHTML = `<strong>${i}</strong>`;

        // Render multiple entries if they exist
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
    updateModalList();
    document.getElementById('modal').style.display = 'flex';
}

function updateModalList() {
    const list = document.getElementById('entriesList');
    list.innerHTML = "";
    const dayEntries = events[activeDateKey] || [];

    if (dayEntries.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:#a0aec0; font-size:0.8rem;">No entries for this day.</p>`;
    }

    dayEntries.forEach((entry, index) => {
        const item = document.createElement('div');
        item.classList.add('modal-entry-item');
        item.innerHTML = `
            <span style="border-left: 3px solid ${entry.color}; padding-left: 8px;">${entry.text}</span>
            <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
        `;
        list.appendChild(item);
    });
}

function saveEntry() {
    const textInput = document.getElementById('entryInput');
    const colorInput = document.getElementById('entryColor');

    if (textInput.value.trim()) {
        if (!events[activeDateKey]) events[activeDateKey] = [];
        
        events[activeDateKey].push({
            text: textInput.value.trim(),
            color: colorInput.value
        });

        localStorage.setItem('multi_event_calendar', JSON.stringify(events));
        textInput.value = "";
        updateModalList();
        renderCalendar();
    }
}

function deleteEntry(index) {
    events[activeDateKey].splice(index, 1);
    if (events[activeDateKey].length === 0) delete events[activeDateKey];
    
    localStorage.setItem('multi_event_calendar', JSON.stringify(events));
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

// Initial render
renderCalendar();