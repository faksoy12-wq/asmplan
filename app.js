// app.js - ASM Çalışma Planı Etkileşimleri ve Mantık

// ---- 1. YAPILANDIRMA VE VERİLER ----
const MONTHS = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const HOLIDAYS = {
    2026: {
        '2026-01-01': { type: 'full' },
        '2026-03-19': { type: 'half' },
        '2026-03-20': { type: 'full' },
        '2026-03-21': { type: 'full' },
        '2026-03-22': { type: 'full' },
        '2026-04-23': { type: 'full' },
        '2026-05-01': { type: 'full' },
        '2026-05-19': { type: 'full' },
        '2026-05-26': { type: 'half' },
        '2026-05-27': { type: 'full' },
        '2026-05-28': { type: 'full' },
        '2026-05-29': { type: 'full' },
        '2026-05-30': { type: 'full' },
        '2026-07-15': { type: 'full' },
        '2026-08-30': { type: 'full' },
        '2026-10-28': { type: 'half' },
        '2026-10-29': { type: 'full' }
    },
    2027: {
        '2027-01-01': { type: 'full' },
        '2027-03-08': { type: 'half' },
        '2027-03-09': { type: 'full' },
        '2027-03-10': { type: 'full' },
        '2027-03-11': { type: 'full' },
        '2027-04-23': { type: 'full' },
        '2027-05-01': { type: 'full' },
        '2027-05-15': { type: 'half' },
        '2027-05-16': { type: 'full' },
        '2027-05-17': { type: 'full' },
        '2027-05-18': { type: 'full' },
        '2027-05-19': { type: 'full' },
        '2027-07-15': { type: 'full' },
        '2027-08-30': { type: 'full' },
        '2027-10-28': { type: 'half' },
        '2027-10-29': { type: 'full' }
    }
};

const DEFAULT_SETTINGS = {
    doc1: { name: 'Dr. Birinci', color: '#3B82F6', initial: 'B' },
    doc2: { name: 'Dr. İkinci', color: '#F43F5E', initial: 'İ' }
};

function loadLocalData(key, defaultVal) {
    try {
        const d = localStorage.getItem(key);
        return d ? JSON.parse(d) : defaultVal;
    } catch { return defaultVal; }
}

let appState = {
    settings: loadLocalData('asm_settings', DEFAULT_SETTINGS),
    assignments: loadLocalData('asm_assignments', {}), 
    selectedDate: null,
    activeMonth: null, // null = Yıl Görünümü
    activeYear: 2026
};

const calendarContainer = document.getElementById('calendarContainer');
const popover = document.getElementById('popover');

// Modals
const settingsOverlay = document.getElementById('settingsOverlay');
const settingsModal = document.getElementById('settingsModal');
const aboutModalOverlay = document.getElementById('aboutModalOverlay');
const aboutModal = document.getElementById('aboutModal');

// ---- 2. TAKVİM (YIL VE AY GÖRÜNÜMÜ RENDER) ----

function getDaysInMonth(month, year) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(month, year) {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
}

function render() {
    if (appState.activeMonth === null) {
        renderYearView();
    } else {
        renderMonthView(appState.activeMonth);
    }
}

function renderYearView() {
    calendarContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    let html = '';
    
    for (let month = 0; month < 12; month++) {
        const delay = month * 0.05;
        let assignedCount = 0;
        
        Object.keys(appState.assignments).forEach(k => {
            if (k.startsWith(`${appState.activeYear}-${String(month + 1).padStart(2, '0')}`)) assignedCount++;
        });

        html += `
            <div onclick="app.setActiveMonth(${month})" class="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 border border-slate-200/60 month-card-enter hover:bg-white hover:shadow-xl md:hover:-translate-y-1 hover:border-blue-200 hover:ring-2 hover:ring-blue-50 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center text-center h-48 md:h-[13rem]" style="animation-delay: ${delay}s">
                <h3 class="text-2xl font-extrabold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">${MONTHS[month]}</h3>
                <p class="text-sm font-medium text-slate-500 mt-2">${assignedCount > 0 ? `<span class="bg-blue-100/50 text-blue-700 font-bold px-2 py-0.5 rounded-md">${assignedCount}</span> hekim atandı` : 'Henüz planlanmadı'}</p>
                <div class="mt-auto pt-4 md:pt-0 w-full md:w-auto flex justify-center">
                    <div class="w-full md:w-auto px-5 py-3 md:py-2.5 rounded-xl bg-slate-100/80 md:bg-transparent md:group-hover:bg-blue-50 text-slate-600 md:text-blue-600 group-hover:text-blue-600 text-[13px] font-bold opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-300 border border-slate-200/50 md:border-transparent md:group-hover:border-blue-100 flex items-center justify-center gap-1 active:scale-95">
                        <span class="md:hidden">Aç</span><span class="hidden md:inline">Takvimi Yönet</span> <i class="ph ph-arrow-right"></i>
                    </div>
                </div>
            </div>
        `;
    }
    calendarContainer.innerHTML = html;
}

function renderMonthView(month) {
    calendarContainer.className = "w-full max-w-5xl mx-auto mt-2";
    
    const daysInMonth = getDaysInMonth(month, appState.activeYear);
    const firstDay = getFirstDayOfMonth(month, appState.activeYear);
    
    let html = `
        <div class="animate-[slideUpFade_0.3s_ease-out] px-1 md:px-0">
            <div class="grid grid-cols-2 md:flex md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
                <button onclick="app.setActiveMonth(null)" class="flex justify-center md:items-center gap-1 md:gap-2 px-3 py-3.5 md:py-3 rounded-[1.25rem] bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:bg-white text-slate-600 font-semibold transition-all hover:-translate-x-1 active:scale-95 w-full md:w-auto">
                    <i class="ph ph-arrow-left text-xl md:text-lg"></i> 
                    <span class="text-[13px] md:text-base hidden sm:inline">${appState.activeYear} Yılına Dön</span>
                    <span class="text-[13px] sm:hidden">Geri Dön</span>
                </button>
                <button onclick="app.clearCurrentMonth()" class="flex justify-center md:items-center gap-1 md:gap-2 px-3 py-3.5 md:py-3 rounded-[1.25rem] bg-rose-50/90 backdrop-blur-md border border-rose-200 shadow-[0_2px_10px_-4px_rgba(244,63,94,0.1)] hover:shadow-lg hover:bg-rose-100 hover:border-rose-300 text-rose-600 font-semibold transition-all active:scale-95 group w-full md:w-auto">
                    <i class="ph ph-trash text-xl md:text-lg group-hover:-rotate-12 transition-transform"></i> 
                    <span class="text-[13px] md:text-base hidden sm:inline">Seçili Ayı Temizle</span>
                    <span class="text-[13px] sm:hidden">Temizle</span>
                </button>
            </div>
            <div class="bg-white/80 backdrop-blur-xl border border-white/60 p-5 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-shadow">
                <h2 class="text-3xl font-extrabold text-slate-800 mb-8 tracking-tight">${MONTHS[month]} <span class="text-blue-500/80 font-medium">${appState.activeYear}</span></h2>
                
                <div class="grid grid-cols-7 gap-2 md:gap-4 mb-3">
                    ${DAYS.map(d => `<div class="text-center text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider py-2">${d}</div>`).join('')}
                </div>
                <div class="grid grid-cols-7 gap-2 md:gap-4">
    `;

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="rounded-xl p-2 h-20 md:h-28"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${appState.activeYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(appState.activeYear, month, day);
        const dayOfWeek = (dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1);
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
        const holiday = HOLIDAYS[appState.activeYear][dateStr];
        
        let cellClass = "day-cell rounded-2xl border relative h-20 md:h-28 flex flex-col p-2 md:p-3 overflow-hidden ";
        let dayNumClass = "text-sm md:text-base font-bold z-10 ";
        let innerHtml = '';
        let onClickAttr = '';

        const isHalfDay = holiday && holiday.type === 'half';
        const isFullDayHoliday = holiday && holiday.type === 'full';
        
        const assignedDoc = appState.assignments[dateStr];
        if (assignedDoc && !isWeekend && !isFullDayHoliday) {
            const docInfo = appState.settings[assignedDoc];
            if (docInfo) {
                innerHtml += `
                    <div class="absolute bottom-2 right-2 w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-white animate-[slideUpFade_0.2s_ease_forwards] transform hover:scale-110 transition-transform doc-badge" style="background-color: ${docInfo.color}" title="${docInfo.name}">
                        ${docInfo.initial}
                    </div>
                `;
            }
        }

        if (isWeekend || isFullDayHoliday) {
            if (isFullDayHoliday) {
                cellClass += "bg-emerald-100/60 border-emerald-200 pointer-events-none"; 
                dayNumClass += "text-emerald-700/60 relative z-10"; 
                innerHtml += `<div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.15]"><i class="ph ph-tree-palm text-6xl text-emerald-600"></i></div>`;
            } else {
                cellClass += "bg-slate-50 border-slate-100 pointer-events-none"; 
                dayNumClass += "text-slate-300 relative z-10";
            }
        } else {
            cellClass += "bg-white border-slate-200/70 cursor-pointer interactive group shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]";
            dayNumClass += "text-slate-600 group-hover:text-blue-600 transition-colors relative z-10";
            
            if (isHalfDay) {
                cellClass += ' bg-gradient-to-br from-white from-80% to-emerald-100/50 hover:to-emerald-100 transition-all';
                innerHtml += `<div class="absolute top-2 right-2 text-emerald-500/50"><i class="ph ph-clock-countdown"></i></div>`;
            }

            onClickAttr = `onclick="app.openPopover('${dateStr}', event)"`;
        }

        html += `
            <div class="${cellClass}" id="cell-${dateStr}" ${onClickAttr}>
                <span class="${dayNumClass}">${day}</span>
                ${innerHtml}
            </div>
        `;
    }

    html += `</div></div></div>`;
    calendarContainer.innerHTML = html;
}

// Olay Yalnızca İlgili DOM Hücresini Günceller (Sayfa Yenilenmez, Flicker Yapmaz)
function updateCellDOM(dateStr) {
    const cell = document.getElementById('cell-' + dateStr);
    if (!cell) return;
    
    const existing = cell.querySelector('.doc-badge');
    if (existing) existing.remove();
    
    const assignedDoc = appState.assignments[dateStr];
    if (assignedDoc) {
        const docInfo = appState.settings[assignedDoc];
        if (docInfo) {
            const badge = document.createElement('div');
            badge.className = "absolute bottom-2 right-2 w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-white animate-[slideUpFade_0.2s_ease_forwards] transform hover:scale-110 transition-transform doc-badge";
            badge.style.backgroundColor = docInfo.color;
            badge.title = docInfo.name;
            badge.textContent = docInfo.initial;
            cell.appendChild(badge);
        }
    }
}

// ---- 3. POPOVER VE STATE KONTROLÜ ----

function setYear(y) {
    appState.activeYear = y;
    appState.activeMonth = null;
    appState.selectedDate = null;
    closePopover();
    
    const y2026Btn = document.getElementById('year2026Btn');
    const y2027Btn = document.getElementById('year2027Btn');
    
    const activeClass = "px-3 py-0.5 rounded text-[11px] md:text-xs font-bold transition-all bg-white shadow-sm text-blue-600";
    const inactiveClass = "px-3 py-0.5 rounded text-[11px] md:text-xs font-medium text-slate-500 hover:text-slate-700 transition-all";

    if(y === 2026) {
        y2026Btn.className = activeClass;
        y2027Btn.className = inactiveClass;
    } else {
        y2027Btn.className = activeClass;
        y2026Btn.className = inactiveClass;
    }
    render();
}

function setActiveMonth(monthIndex) {
    appState.activeMonth = monthIndex;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openPopover(dateStr, event) {
    event.stopPropagation();
    appState.selectedDate = dateStr;
    updatePopoverUI();
    
    const cell = event.currentTarget;
    const rect = cell.getBoundingClientRect();
    
    // Anlamsız yerlerde çıkmaması için pencere scroll ve viewport hesabı yapıyoruz
    const popHeight = 150;
    const popWidth = 180;
    
    let pLeft = rect.left + window.scrollX;
    let pTop = rect.bottom + window.scrollY + 8; // Hücrenin hemen altına hizala
    
    // Sağdan taşıyorsa
    if (pLeft + popWidth > window.innerWidth + window.scrollX) {
        pLeft = rect.right + window.scrollX - popWidth;
    }
    
    // Alttan taşıyorsa, hücrenin üstüne al
    if (pTop + popHeight > window.innerHeight + window.scrollY) {
        pTop = rect.top + window.scrollY - popHeight - 8;
    }
    
    popover.style.top = `${pTop}px`;
    popover.style.left = `${pLeft}px`;
    
    popover.classList.remove('hidden');
    requestAnimationFrame(() => {
        popover.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
    });
}

function closePopover() {
    popover.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
    setTimeout(() => { popover.classList.add('hidden'); }, 150);
}

function updatePopoverUI() {
    const s = appState.settings;
    document.getElementById('popDoc1Name').textContent = s.doc1.name;
    document.getElementById('popDoc1Avatar').textContent = s.doc1.initial;
    document.getElementById('popDoc1Avatar').style.backgroundColor = s.doc1.color;
    
    document.getElementById('popDoc2Name').textContent = s.doc2.name;
    document.getElementById('popDoc2Avatar').textContent = s.doc2.initial;
    document.getElementById('popDoc2Avatar').style.backgroundColor = s.doc2.color;
}

// Popover Atama İslem (Sıfır Ekran Yenilemesi)
document.querySelectorAll('.doctor-select').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!appState.selectedDate) return;
        
        const docId = btn.closest('.doctor-select').getAttribute('data-doc');
        
        if (docId === 'clear') {
            delete appState.assignments[appState.selectedDate];
        } else {
            appState.assignments[appState.selectedDate] = 'doc' + docId;
        }
        
        saveAssignments();
        updateCellDOM(appState.selectedDate); // Full re-render yerine sadece balonu güncelle (Flicker engellendi)
        closePopover();
    });
});

document.addEventListener('click', (e) => {
    if (!popover.contains(e.target) && !e.target.closest('.day-cell')) {
        closePopover();
    }
});

// ---- 4. HAKKINDA & AYARLAR MODAL ----

// Hakkında
function openAbout() {
    aboutModalOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
        aboutModalOverlay.classList.remove('opacity-0', 'pointer-events-none');
        aboutModal.classList.remove('opacity-0', 'scale-95');
        aboutModal.classList.add('scale-100');
    });
}

function closeAbout() {
    aboutModalOverlay.classList.add('opacity-0', 'pointer-events-none');
    aboutModal.classList.remove('scale-100');
    aboutModal.classList.add('opacity-0', 'scale-95');
    setTimeout(() => { aboutModalOverlay.classList.add('hidden'); }, 300);
}

document.getElementById('aboutBtn').addEventListener('click', openAbout);
document.getElementById('closeAboutBtn').addEventListener('click', closeAbout);

// Ayarlar
function openSettings() {
    const s = appState.settings;
    document.getElementById('doc1Input').value = s.doc1.name;
    document.getElementById('doc1Color').value = s.doc1.color;
    document.getElementById('doc1ColorPreview').style.backgroundColor = s.doc1.color;
    
    document.getElementById('doc2Input').value = s.doc2.name;
    document.getElementById('doc2Color').value = s.doc2.color;
    document.getElementById('doc2ColorPreview').style.backgroundColor = s.doc2.color;
    
    settingsOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
        settingsOverlay.classList.remove('opacity-0', 'pointer-events-none');
        settingsModal.classList.remove('opacity-0', 'scale-95');
        settingsModal.classList.add('scale-100');
    });
}

function closeSettings() {
    settingsOverlay.classList.add('opacity-0', 'pointer-events-none');
    settingsModal.classList.remove('scale-100');
    settingsModal.classList.add('opacity-0', 'scale-95');
    setTimeout(() => { settingsOverlay.classList.add('hidden'); }, 300);
}

function saveSettings() {
    const s = appState.settings;
    s.doc1.name = document.getElementById('doc1Input').value || 'Hekim 1';
    s.doc1.color = document.getElementById('doc1Color').value;
    s.doc1.initial = s.doc1.name.charAt(0).toUpperCase() || 'H';
    
    s.doc2.name = document.getElementById('doc2Input').value || 'Hekim 2';
    s.doc2.color = document.getElementById('doc2Color').value;
    s.doc2.initial = s.doc2.name.charAt(0).toUpperCase() || 'H';
    
    localStorage.setItem('asm_settings', JSON.stringify(appState.settings));
    
    document.getElementById('doc1ColorStrip').style.backgroundColor = s.doc1.color;
    document.getElementById('doc2ColorStrip').style.backgroundColor = s.doc2.color;
    
    closeSettings();
    updatePopoverUI();
    render(); // Kart renkleri güncellenmesi için re-render gerekir
}

document.getElementById('settingsBtn').addEventListener('click', openSettings);
document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);
document.getElementById('cancelSettingsBtn').addEventListener('click', closeSettings);
document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

['doc1', 'doc2'].forEach(doc => {
    document.getElementById(`${doc}Color`).addEventListener('input', (e) => {
        document.getElementById(`${doc}ColorPreview`).style.backgroundColor = e.target.value;
    });
});

async function saveAssignments() {
    if (window.firestoreDB && window.fbSetDoc) {
        const d_ref = window.fbDoc(window.firestoreDB, "takvim", String(appState.activeYear));
        await window.fbSetDoc(d_ref, { assignments: appState.assignments }, { merge: true });
    } else {
        localStorage.setItem('asm_assignments', JSON.stringify(appState.assignments));
    }
}

function clearCurrentMonth() {
    if (appState.activeMonth === null) return;
    
    if (!confirm(`${MONTHS[appState.activeMonth]} ${appState.activeYear} için tüm nöbet planlamalarını silmek istediğinize emin misiniz?`)) return;

    const prefix = `${appState.activeYear}-${String(appState.activeMonth + 1).padStart(2, '0')}`;
    let clearedCount = 0;
    
    Object.keys(appState.assignments).forEach(dateStr => {
        if (dateStr.startsWith(prefix)) {
            delete appState.assignments[dateStr];
            clearedCount++;
        }
    });
    
    if (clearedCount > 0) {
        saveAssignments();
        render(); 
    }
}

// API Expose
window.app = {
    openPopover,
    setActiveMonth,
    setYear,
    clearCurrentMonth
};

// ---- İLK ÇALIŞTIRMA & FIREBASE ----

if (window.firestoreDB && window.fbOnSnapshot) {
    const d_ref = window.fbDoc(window.firestoreDB, "takvim", String(appState.activeYear));
    window.fbOnSnapshot(d_ref, (veriPaketi) => {
        if (veriPaketi.exists()) {
            const serverData = veriPaketi.data();
            if (serverData.assignments) {
                appState.assignments = serverData.assignments;
            }
        }
        updatePopoverUI();
        render();
    });
} else {
    updatePopoverUI();
    render();
}
