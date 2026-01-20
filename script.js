let viewDate = new Date();
let db = JSON.parse(localStorage.getItem('calendar_v5_db')) || {};
let theme = localStorage.getItem('cal_theme') || 'space';
let activeKey = "";

const imgSets = {
    space: ["https://images.unsplash.com/photo-1462331940025-496dfbfc7564","https://images.unsplash.com/photo-1446776811953-b23d57bd21aa","https://images.unsplash.com/photo-1614728894747-a83421e2b9c9","https://images.unsplash.com/photo-1454789548928-9efd52dc4031","https://images.unsplash.com/photo-1464802686167-b939a6910659","https://images.unsplash.com/photo-1614732414444-096e5f1122d5","https://images.unsplash.com/photo-1506318137071-a8e063b4b67d","https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3","https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6","https://images.unsplash.com/photo-1543722530-d2c3201371e7","https://images.unsplash.com/photo-1538370910416-06ad66473bb6","https://images.unsplash.com/photo-1502134249126-9f3755a50d78"],
    dogs: ["https://images.unsplash.com/photo-1548199973-03cce0bbc87b","https://images.unsplash.com/photo-1517849845537-4d257902454a","https://images.unsplash.com/photo-1537151608828-ea2b11777ee8","https://images.unsplash.com/photo-1534361960057-19889db9621e","https://images.unsplash.com/photo-1583511655857-d19b40a7a54e","https://images.unsplash.com/photo-1561037404-61cd46aa615b","https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a","https://images.unsplash.com/photo-1516734212186-a967f81ad0d7","https://images.unsplash.com/photo-1543466835-00a7907e9de1","https://images.unsplash.com/photo-1558121324-5a4014739da1","https://images.unsplash.com/photo-1583337130417-3346a1be7dee","https://images.unsplash.com/photo-1513284004010-096739f72740"],
    nature: ["https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05","https://images.unsplash.com/photo-1441974231531-c6227db76b6e","https://images.unsplash.com/photo-1501854140801-50d01698950b","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b","https://images.unsplash.com/photo-1447752875215-b2761acb3c5d","https://images.unsplash.com/photo-1433086566089-f70a6613a7ad","https://images.unsplash.com/photo-1472214103451-9374bd1c798e","https://images.unsplash.com/photo-1500673922987-e212871fec22","https://images.unsplash.com/photo-1490730141103-6cac27aaab94","https://images.unsplash.com/photo-1511497584788-876760111969","https://images.unsplash.com/photo-1505765050516-f72dcac9c70f","https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07"]
};

const kbKeys = ["1","2","3","4","5","6","7","8","9","0","Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","DEL","Z","X","C","V","B","N","M",",",".","SPC"];

function render() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = "";
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    
    document.getElementById('monthBanner').style.backgroundImage = `url('${imgSets[theme][m]}')`;
    document.getElementById('monthDisplay').innerText = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    for(let i=0; i<firstDay; i++) {
        const div = document.createElement('div');
        div.className = 'day-cell blank';
        grid.appendChild(div);
    }

    for(let i=1; i<=daysInMonth; i++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        const key = `${y}-${m+1}-${i}`;
        
        if(i === new Date().getDate() && m === new Date().getMonth() && y === new Date().getFullYear()) cell.classList.add('today');
        cell.innerHTML = `<strong>${i}</strong>`;
        
        if(db[key]) {
            db[key].forEach(ev => {
                const b = document.createElement('div');
                b.className = 'badge';
                b.style.backgroundColor = ev.color;
                b.innerText = ev.text;
                cell.appendChild(b);
            });
        }
        cell.onclick = () => openModal(key);
        grid.appendChild(cell);
    }
}

function initKB() {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = "";
    kbKeys.forEach(k => {
        const div = document.createElement('div');
        div.className = 'k-key';
        div.innerText = k;
        div.onclick = (e) => {
            e.stopPropagation();
            const inp = document.getElementById('entryInput');
            if(k === "DEL") inp.value = inp.value.slice(0,-1);
            else if(k === "SPC") inp.value += " ";
            else if(inp.value.length < 30) inp.value += k;
        };
        kb.appendChild(div);
    });
}

function openModal(key) {
    activeKey = key;
    document.getElementById('selectedDateText').innerText = "Stardate: " + key;
    document.getElementById('entryInput').value = "";
    updateEntries();
    document.getElementById('modal-overlay').style.display = 'flex';
}

function updateEntries() {
    const list = document.getElementById('entriesList');
    list.innerHTML = "";
    if(db[activeKey]) {
        db[activeKey].forEach((ev, idx) => {
            const row = document.createElement('div');
            row.style.cssText = `display:flex; justify-content:space-between; background:#000; padding:8px; margin-bottom:5px; border-left:4px solid ${ev.color}; border-radius:4px; font-size:0.9rem;`;
            row.innerHTML = `<span>${ev.text}</span><button onclick="delEntry(${idx})" style="color:red; background:none; border:none; cursor:pointer;">X</button>`;
            list.appendChild(row);
        });
    }
}

function saveEntry() {
    const txt = document.getElementById('entryInput').value.trim();
    if(!txt) return;
    if(!db[activeKey]) db[activeKey] = [];
    db[activeKey].push({ text: txt, color: document.getElementById('entryColor').value });
    localStorage.setItem('calendar_v5_db', JSON.stringify(db));
    render(); updateEntries(); document.getElementById('entryInput').value = "";
}

function delEntry(idx) {
    db[activeKey].splice(idx, 1);
    if(db[activeKey].length === 0) delete db[activeKey];
    localStorage.setItem('calendar_v5_db', JSON.stringify(db));
    render(); updateEntries();
}

function updateTheme() {
    theme = document.getElementById('themePicker').value;
    localStorage.setItem('cal_theme', theme);
    render();
}

function changeMonth(dir) { viewDate.setMonth(viewDate.getMonth() + dir); render(); }
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const a = document.createElement('a');
    a.href = dataStr; a.download = `calendar_backup_${activeKey || 'full'}.json`;
    a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        db = JSON.parse(event.target.result);
        localStorage.setItem('calendar_v5_db', JSON.stringify(db));
        render();
    };
    reader.readAsText(e.target.files[0]);
}

/* Weather widget: uses geolocation, falls back to IP-based location, and queries Open-Meteo (no API key) */
function initWeather() {
    const el = document.getElementById('weather');
    if(!el) return;
    const cur = document.getElementById('weather-current');
    if(cur) cur.innerText = 'Loading...';
    if(navigator.geolocation) {
        let geoTimer = setTimeout(() => { geoTimer = null; fetchIPLocation(); }, 4000);
        navigator.geolocation.getCurrentPosition((p) => { if(geoTimer) { clearTimeout(geoTimer); geoTimer = null; } fetchWeather(p.coords.latitude, p.coords.longitude); }, (err) => { if(geoTimer) { clearTimeout(geoTimer); geoTimer = null; } fetchIPLocation(); }, {timeout:5000});
    } else {
        fetchIPLocation();
    }

    function fetchIPLocation() {
        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(d => {
                if(d && d.latitude && d.longitude) fetchWeather(d.latitude, d.longitude);
                else if(cur) cur.innerText = 'Location unavailable';
            }).catch(() => { if(cur) cur.innerText = 'Location unavailable'; });
    }

    function fetchWeather(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto`;
        fetch(url).then(r => r.json()).then(d => {
            if(d && d.current_weather) {
                const t = Math.round(d.current_weather.temperature);
                const w = Math.round(d.current_weather.windspeed);
                const code = d.current_weather.weathercode;
                const cur = document.getElementById('weather-current');
                const weekEl = document.getElementById('weather-weekly');
                if(cur) cur.innerText = `${weatherEmoji(code)} ${t}°F • ${w} mph`;

                // populate 7-day forecast
                if(weekEl && d.daily && d.daily.time) {
                    weekEl.innerHTML = '';
                    const days = d.daily.time.slice(0,3);
                    const tmax = d.daily.temperature_2m_max || [];
                    const tmin = d.daily.temperature_2m_min || [];
                    const wcodes = d.daily.weathercode || [];
                    days.forEach((dt, i) => {
                        const dayName = new Date(dt).toLocaleDateString(undefined, { weekday: 'short' });
                        const emoji = weatherEmoji(wcodes[i]);
                        const max = tmax[i] !== undefined ? Math.round(tmax[i]) : '--';
                        const min = tmin[i] !== undefined ? Math.round(tmin[i]) : '--';
                        const div = document.createElement('div');
                        div.className = 'weather-day';
                        div.innerHTML = `<div class="day-name">${dayName}</div><div class="day-emoji">${emoji}</div><div class="day-temp">${max}°/${min}°</div>`;
                        weekEl.appendChild(div);
                    });
                }
            } else {
                const cur = document.getElementById('weather-current');
                if(cur) cur.innerText = 'Weather N/A';
            }
        }).catch(() => {
            const cur = document.getElementById('weather-current');
            if(cur) cur.innerText = 'Weather unavailable';
        });
    }

    function weatherEmoji(code) {
        if(code === 0) return '☀️';
        if(code >= 1 && code <= 3) return '🌤️';
        if((code >= 45 && code <= 48) || (code >= 51 && code <= 57)) return '🌫️';
        if((code >= 61 && code <= 67) || (code >= 80 && code <= 86)) return '🌧️';
        if(code >= 71 && code <= 77) return '❄️';
        if(code >= 95 && code <= 99) return '⛈️';
        return '☁️';
    }
}

document.getElementById('themePicker').value = theme;
initKB();
render();
initWeather();
initQuote();

function initQuote() {
    const qEl = document.getElementById('quote-text');
    const btn = document.getElementById('refreshQuote');
    if(!qEl) return;
    const fallback = [
        "I put my phone in airplane mode, but it's still on the couch.",
        "I asked the calendar for a hint; it said 'date' night.",
        "Why don't scientists trust atoms? They make up everything — especially excuses.",
        "I'm on a whiskey diet. I've lost three days already.",
        "If we shouldn't eat at night, why is there a light in the fridge?"
    ];

    const storageKey = 'quote_of_day';
    const today = new Date().toISOString().slice(0,10);

    function displayQuote(item) {
        if(!item) return;
        // animate text change
        qEl.classList.remove('quote-animate');
        // force reflow
        void qEl.offsetWidth;
        qEl.innerText = item.author ? `${item.content} — ${item.author}` : item.content;
        qEl.classList.add('quote-animate');
        // ensure class removed after animation so it can re-run
        setTimeout(() => qEl.classList.remove('quote-animate'), 700);
    }

    function saveQuote(item) {
        try { localStorage.setItem(storageKey, JSON.stringify(item)); } catch(e) { /* ignore */ }
    }

    function fetchQuote(force = false) {
        // If not forcing, check storage first
        if(!force) {
            try {
                const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
                if(stored && stored.date === today) { displayQuote(stored); return; }
            } catch(e) { /* ignore parse error */ }
        }

        qEl.innerText = 'Loading funny quote...';
        fetch('https://api.quotable.io/random?tags=humor')
            .then(r => r.json())
            .then(d => {
                if(d && d.content) {
                    const item = { date: today, content: d.content, author: d.author };
                    saveQuote(item);
                    displayQuote(item);
                } else {
                    const text = fallback[Math.floor(Math.random()*fallback.length)];
                    const item = { date: today, content: text };
                    saveQuote(item);
                    displayQuote(item);
                }
            }).catch(() => {
                const text = fallback[Math.floor(Math.random()*fallback.length)];
                const item = { date: today, content: text };
                saveQuote(item);
                displayQuote(item);
            });
    }

    btn && btn.addEventListener('click', (e) => { e.stopPropagation(); fetchQuote(true); });
    fetchQuote(false);
}