/**
 * ========================================================
 * المشروع الإسلامي الشامل — App Logic Engine
 * Includes: Prayer Times, Quran (Search & Audio Recitation),
 * Qibla Compass, Modern Masbaha, Categorized Adhkar, PWA
 * ========================================================
 */

// Global App State
const state = {
    theme: localStorage.getItem('app_theme') || 'dark',
    activeTab: 'page-time',
    userLocation: { lat: 30.0444, long: 31.2357, city: 'القاهرة' }, // Default Cairo
    prayerData: null,
    countdownInterval: null,
    
    // Quran state
    surahsList: [],
    currentSurah: null,
    currentAyahs: [],
    activeAyahIndex: null,
    isPlayingSurah: false,
    audioInstance: new Audio(),
    
    // Qibla state
    qiblaDirection: 0,
    currentHeading: 0,
    smoothedAngle: 0,
    
    // Sabha state
    sabhaCount: parseInt(localStorage.getItem('sabha_count')) || 0,
    sabhaTotal: parseInt(localStorage.getItem('sabha_total')) || 0,
    sabhaColorIndex: parseInt(localStorage.getItem('sabha_color_idx')) || 0,
    sabhaDhikr: localStorage.getItem('sabha_dhikr') || 'سبحان الله',
    sabhaTarget: parseInt(localStorage.getItem('sabha_target')) || 33,
    sabhaSound: localStorage.getItem('sabha_sound') !== 'false'
};

// Available Masbaha Colors
const MASBAHA_COLORS = [
    { name: 'كحلي ملكي', color: '#1e3a4f' },
    { name: 'زمردي أندلسي', color: '#14532d' },
    { name: 'عنبري دافئ', color: '#78350f' },
    { name: 'عنابي فاخر', color: '#701a75' },
    { name: 'رمادي حجري', color: '#334155' },
    { name: 'أسود مذهّب', color: '#0f172a' }
];

// Comprehensive Adhkar Dataset
const ADHKAR_DATA = [
    {
        id: 1,
        category: 'sabah',
        categoryName: 'أذكار الصباح',
        text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
        count: 1,
        virtue: 'حفظ وبركة ليوم المسلم'
    },
    {
        id: 2,
        category: 'sabah',
        categoryName: 'أذكار الصباح',
        text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.',
        count: 1,
        virtue: 'شكر نعمة الصباح'
    },
    {
        id: 3,
        category: 'sabah',
        categoryName: 'أذكار الصباح',
        text: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.',
        count: 1,
        virtue: 'سيد الاستغفار — من قالها موقناً بها فمات دخل الجنة'
    },
    {
        id: 4,
        category: 'sabah',
        categoryName: 'أذكار الصباح',
        text: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
        count: 3,
        virtue: 'حماية من كل مكروه وضر'
    },
    {
        id: 5,
        category: 'masa',
        categoryName: 'أذكار المساء',
        text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
        count: 1,
        virtue: 'حفظ المسلم حتى يصبح'
    },
    {
        id: 6,
        category: 'masa',
        categoryName: 'أذكار المساء',
        text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
        count: 3,
        virtue: 'وقاية من كل سوء ولدغة وهامة'
    },
    {
        id: 7,
        category: 'salah',
        categoryName: 'أذكار بعد الصلاة',
        text: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ ذَا الْجَلاَلِ وَالإِكْرَامِ.',
        count: 1,
        virtue: 'سنة نبوية بعد الفراغ من الصلاة المكتوبة'
    },
    {
        id: 8,
        category: 'salah',
        categoryName: 'أذكار بعد الصلاة',
        text: 'سُبْحَانَ اللَّهِ (33) ، الْحَمْدُ لِلَّهِ (33) ، اللَّهُ أَكْبَرُ (33) ، وتَمَامُ الْمِائَةِ: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
        count: 33,
        virtue: 'تغفر خطاياه وإن كانت مثل زبد البحر'
    },
    {
        id: 9,
        category: 'tasbih',
        categoryName: 'تسابيح واستغفار',
        text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ.',
        count: 100,
        virtue: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن'
    },
    {
        id: 10,
        category: 'tasbih',
        categoryName: 'تسابيح واستغفار',
        text: 'لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ.',
        count: 30,
        virtue: 'كنز من كنوز الجنة'
    },
    {
        id: 11,
        category: 'tasbih',
        categoryName: 'تسابيح واستغفار',
        text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.',
        count: 10,
        virtue: 'من صلى عليّ صلاة صلى الله عليه بها عشراً'
    },
    {
        id: 12,
        category: 'tasbih',
        categoryName: 'تسابيح واستغفار',
        text: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.',
        count: 40,
        virtue: 'دعوة ذي النون لم يدع بها مسلم إلا استجاب الله له'
    }
];

// Audio context click sound
function playHapticSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.035);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.035);
    } catch(e) {}
}

// Haptic feedback wrapper
function triggerVibrate(pattern = 25) {
    if (navigator.vibrate) {
        try { navigator.vibrate(pattern); } catch(e) {}
    }
}

/* ========================================================
   INITIALIZATION
   ======================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSplash();
    initNavigation();
    
    // Auto-detect and initialize modules according to the current page
    if (document.getElementById('prayer-times-list')) {
        initGeolocationAndPrayers();
    }
    if (document.getElementById('mushaf-pages-track') || document.getElementById('open-drawer-btn') || document.getElementById('surah-select-dropdown')) {
        initQuran();
    }
    if (document.getElementById('compass-wrapper-el')) {
        initQibla();
    }
    if (document.getElementById('masbaha-interactive-dial')) {
        initSabha();
    }
    if (document.getElementById('adhkar-cards-container')) {
        initAdhkar();
    }
    
    initServiceWorker();
});

/* ========================================================
   SPLASH SCREEN
   ======================================================== */
function initSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.remove();
    }
}

/* ========================================================
   THEME TOGGLING
   ======================================================== */
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
    
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', state.theme);
            localStorage.setItem('app_theme', state.theme);
            updateThemeIcon();
        });
    }
}

function updateThemeIcon() {
    const iconContainer = document.getElementById('theme-icon-slot');
    if (!iconContainer) return;
    
    if (state.theme === 'dark') {
        // Moon icon
        iconContainer.innerHTML = `
            <svg class="koboyo-icon" viewBox="0 0 24 24">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
            </svg>
        `;
    } else {
        // Sun icon
        iconContainer.innerHTML = `
            <svg class="koboyo-icon" viewBox="0 0 24 24" style="color: #f59e0b;">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
    }
}

/* ========================================================
   BOTTOM NAVIGATION
   ======================================================== */
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
        // If it's a button with data-target on a single page, handle tab switching
        if (btn.tagName.toLowerCase() === 'button' && btn.hasAttribute('data-target')) {
            btn.addEventListener('click', () => {
                const targetPage = btn.getAttribute('data-target');
                switchTab(targetPage, btn);
            });
        }
    });
}

function switchTab(pageId, activeBtn) {
    state.activeTab = pageId;
    
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    
    // Show active page
    const targetSection = document.getElementById(pageId);
    if (targetSection) targetSection.classList.add('active');
    
    // Update active nav button
    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
    if (activeBtn) {
        activeBtn.classList.add('active');
    } else {
        const matchingBtn = document.querySelector(`.nav-tab-btn[data-target="${pageId}"]`);
        if (matchingBtn) matchingBtn.classList.add('active');
    }
    
    // Trigger lazy init per tab
    if (pageId === 'page-qibla') {
        initQibla();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ========================================================
   1. PRAYER TIMES ENGINE
   ======================================================== */
function initGeolocationAndPrayers() {
    // Set today's date in date picker
    const dateInput = document.getElementById('prayer-date-picker');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.addEventListener('change', (e) => {
            if (e.target.value) {
                fetchPrayerTimesByDate(e.target.value);
            }
        });
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                state.userLocation.lat = pos.coords.latitude;
                state.userLocation.long = pos.coords.longitude;
                fetchCityName(pos.coords.latitude, pos.coords.longitude);
                fetchPrayerTimes();
            },
            (err) => {
                console.log('Location denied, using default Cairo coordinates');
                updateLocationBadge('القاهرة، مصر (افتراضي)');
                fetchPrayerTimes();
            },
            { timeout: 7000 }
        );
    } else {
        updateLocationBadge('القاهرة، مصر (افتراضي)');
        fetchPrayerTimes();
    }
}

async function fetchCityName(lat, long) {
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=ar`);
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || 'موقعك الحالي';
        const country = data.countryName || '';
        state.userLocation.city = `${city}${country ? '، ' + country : ''}`;
        updateLocationBadge(state.userLocation.city);
    } catch(e) {
        updateLocationBadge('موقعك الحالي');
    }
}

function updateLocationBadge(text) {
    const badge = document.getElementById('user-location-text');
    if (badge) badge.innerText = text;
}

async function fetchPrayerTimes() {
    renderPrayerLoading();
    const { lat, long } = state.userLocation;
    const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${long}&method=5`;
    
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.code === 200 && json.data) {
            renderPrayerTimes(json.data);
        } else {
            renderPrayerError('تعذر جلب المواقيت من الخادم');
        }
    } catch(err) {
        renderPrayerError('فشل الاتصال بالإنترنت لجلب مواقيت الصلاة');
    }
}

async function fetchPrayerTimesByDate(dateStr) {
    // dateStr format: YYYY-MM-DD -> convert to DD-MM-YYYY for Aladhan API
    renderPrayerLoading();
    const [year, month, day] = dateStr.split('-');
    const { lat, long } = state.userLocation;
    const formattedDate = `${day}-${month}-${year}`;
    const url = `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${lat}&longitude=${long}&method=5`;
    
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.code === 200 && json.data) {
            renderPrayerTimes(json.data);
        } else {
            renderPrayerError('تعذر جلب مواقيت التاريخ المحدد');
        }
    } catch(err) {
        renderPrayerError('فشل الاتصال بالإنترنت لجلب مواقيت التاريخ');
    }
}

function renderPrayerLoading() {
    const list = document.getElementById('prayer-times-list');
    if (list) {
        list.innerHTML = Array(6).fill(0).map(() => `
            <div class="skeleton-row-item">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="skeleton-shimmer skeleton-circle" style="width: 26px; height: 26px;"></span>
                    <span class="skeleton-shimmer skeleton-pill" style="width: 90px; height: 16px;"></span>
                </div>
                <span class="skeleton-shimmer skeleton-pill" style="width: 65px; height: 18px;"></span>
            </div>
        `).join('');
    }
}

function renderPrayerError(msg) {
    const list = document.getElementById('prayer-times-list');
    if (list) {
        list.innerHTML = `
            <div class="error-card">
                <p>${msg}</p>
                <button class="btn-pill" onclick="fetchPrayerTimes()">
                    <svg class="koboyo-icon icon-sm" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                    إعادة المحاولة
                </button>
            </div>
        `;
    }
}

function renderPrayerTimes(data) {
    state.prayerData = data;
    const timings = data.timings;
    const dateObj = data.date;
    
    // Hijri & Gregorian dates
    const hijriEl = document.getElementById('hijri-date-val');
    const gregEl = document.getElementById('gregorian-date-val');
    if (hijriEl && gregEl) {
        hijriEl.innerText = `${dateObj.hijri.day} ${dateObj.hijri.month.ar} ${dateObj.hijri.year} هـ`;
        gregEl.innerText = `${dateObj.gregorian.day} ${dateObj.gregorian.month.en} ${dateObj.gregorian.year} م`;
    }
    
    // Prayers configuration
    const prayers = [
        { key: 'Fajr', name: 'صلاة الفجر', time: timings.Fajr },
        { key: 'Sunrise', name: 'الشروق', time: timings.Sunrise },
        { key: 'Dhuhr', name: 'صلاة الظهر', time: timings.Dhuhr },
        { key: 'Asr', name: 'صلاة العصر', time: timings.Asr },
        { key: 'Maghrib', name: 'صلاة المغرب', time: timings.Maghrib },
        { key: 'Isha', name: 'صلاة العشاء', time: timings.Isha }
    ];
    
    const listContainer = document.getElementById('prayer-times-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = prayers.map(p => `
        <div class="prayer-time-item" id="prayer-item-${p.key}">
            <div class="prayer-name-group">
                <div class="prayer-icon-wrap">
                    <svg class="koboyo-icon" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9"></circle>
                        <polyline points="12 7 12 12 15 15"></polyline>
                    </svg>
                </div>
                <div class="prayer-title">${p.name}</div>
            </div>
            <div class="prayer-time-val">${formatTo12Hour(p.time)}</div>
        </div>
    `).join('');
    
    startNextPrayerCountdown(prayers);
}

function formatTo12Hour(time24) {
    if (!time24) return '';
    const cleanTime = time24.split(' ')[0];
    let [hours, minutes] = cleanTime.split(':').map(Number);
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
}

function startNextPrayerCountdown(prayers) {
    if (state.countdownInterval) clearInterval(state.countdownInterval);
    
    const updateCountdown = () => {
        const now = new Date();
        let nextPrayer = null;
        let minDiff = Infinity;
        
        prayers.forEach(p => {
            const [hours, minutes] = p.time.split(' ')[0].split(':').map(Number);
            const prayerDate = new Date();
            prayerDate.setHours(hours, minutes, 0, 0);
            
            let diff = prayerDate - now;
            // If prayer is already passed today, consider tomorrow's Fajr for next day
            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                nextPrayer = p;
            }
        });
        
        // If all prayers passed today, next is Fajr tomorrow
        if (!nextPrayer) {
            nextPrayer = prayers[0];
            const [hours, minutes] = nextPrayer.time.split(' ')[0].split(':').map(Number);
            const tomorrowFajr = new Date();
            tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
            tomorrowFajr.setHours(hours, minutes, 0, 0);
            minDiff = tomorrowFajr - now;
        }
        
        // Highlight active prayer item in list
        document.querySelectorAll('.prayer-time-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.getElementById(`prayer-item-${nextPrayer.key}`);
        if (activeItem) activeItem.classList.add('active');
        
        // Update countdown box
        const nameEl = document.getElementById('next-prayer-name');
        const timerEl = document.getElementById('next-prayer-timer');
        if (nameEl) nameEl.innerText = nextPrayer.name;
        
        if (timerEl && minDiff > 0) {
            const totalSecs = Math.floor(minDiff / 1000);
            const hrs = Math.floor(totalSecs / 3600);
            const mins = Math.floor((totalSecs % 3600) / 60);
            const secs = totalSecs % 60;
            timerEl.innerText = `${hrs < 10 ? '0'+hrs : hrs}:${mins < 10 ? '0'+mins : mins}:${secs < 10 ? '0'+secs : secs}`;
        }
    };
    
    updateCountdown();
    state.countdownInterval = setInterval(updateCountdown, 1000);
}

/* ========================================================
   2. QURAN MODULE (Swiper Pages, Side Drawer, Favorites, Audio)
   ======================================================== */

// Arabic Juz Names (1 to 30)
const JUZ_NAMES = [
    '',
    'الجزء الأول', 'الجزء الثاني', 'الجزء الثالث', 'الجزء الرابع', 'الجزء الخامس',
    'الجزء السادس', 'الجزء السابع', 'الجزء الثامن', 'الجزء التاسع', 'الجزء العاشر',
    'الجزء الحادي عشر', 'الجزء الثاني عشر', 'الجزء الثالث عشر', 'الجزء الرابع عشر', 'الجزء الخامس عشر',
    'الجزء السادس عشر', 'الجزء السابع عشر', 'الجزء الثامن عشر', 'الجزء التاسع عشر', 'الجزء العشرون',
    'الجزء الحادي والعشرون', 'الجزء الثاني والعشرون', 'الجزء الثالث والعشرون', 'الجزء الرابع والعشرون', 'الجزء الخامس والعشرون',
    'الجزء السادس والعشرون', 'الجزء السابع والعشرون', 'الجزء الثامن والعشرون', 'الجزء التاسع والعشرون (تبارك)', 'الجزء الثلاثون (عم)'
];

// Starting Juz map for all 114 Surahs
const SURAH_START_JUZ = [
    0,
    1, 1, 3, 4, 6, 7, 8, 9, 10, 11,
    11, 12, 13, 13, 14, 14, 15, 15, 16, 16,
    17, 17, 18, 18, 18, 19, 19, 20, 20, 21,
    21, 21, 21, 22, 22, 22, 23, 23, 23, 24,
    24, 25, 25, 25, 25, 26, 26, 26, 26, 26,
    26, 27, 27, 27, 27, 27, 27, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 29, 29, 29, 29,
    29, 29, 29, 29, 29, 29, 29, 30, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30, 30
];

// Format surah name cleanly to prevent duplicate 'سورة سورة'
function formatSurahName(name, withPrefix = true) {
    if (!name) return '';
    const clean = name.replace(/^س[\u064B-\u065F]*و[\u064B-\u065F]*ر[\u064B-\u065F]*[ةه][\u064B-\u065F]*\s*/, '').trim();
    return withPrefix ? `سورة ${clean}` : clean;
}

// Quran State Extension
state.surahPages = [];
state.currentPageIndex = 0;
let currentFilterType = 'all';
let currentFilterJuz = 'all';
let currentFilterQuery = '';

async function initQuran() {
    setupSideDrawer();
    setupMushafSwiperNavigation();
    setupAudioListeners();
    setupQuranSearch();
    await fetchSurahsList();
    checkContinueReading();
}

function setupSideDrawer() {
    const openBtn = document.getElementById('open-drawer-btn');
    const closeBtn = document.getElementById('drawer-close-btn');
    const overlay = document.getElementById('drawer-overlay');
    const drawer = document.getElementById('side-menu-drawer');
    const searchInput = document.getElementById('drawer-surah-search');
    const juzSelect = document.getElementById('drawer-juz-select');
    const pills = document.querySelectorAll('.drawer-pill-btn');
    const favToggleBtn = document.getElementById('toggle-favorite-btn');
    const topPlayBtn = document.getElementById('top-play-surah-btn');
    const drawerThemeToggle = document.getElementById('drawer-theme-toggle');

    const openDrawer = () => {
        if (drawer && overlay) {
            drawer.classList.add('open');
            overlay.classList.add('active');
            drawer.setAttribute('aria-hidden', 'false');
            updateDrawerCurrentRead();
            renderDrawerFavorites();
            renderDrawerSurahsList();
            searchInput?.focus();
        }
    };

    const closeDrawer = () => {
        if (drawer && overlay) {
            drawer.classList.remove('open');
            overlay.classList.remove('active');
            drawer.setAttribute('aria-hidden', 'true');
        }
    };

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });

    // Populate Juz Dropdown in Drawer
    if (juzSelect && juzSelect.options.length <= 1) {
        for (let i = 1; i <= 30; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${JUZ_NAMES[i]} (${i})`;
            juzSelect.appendChild(opt);
        }
    }

    if (juzSelect) {
        juzSelect.addEventListener('change', (e) => {
            currentFilterJuz = e.target.value;
            renderDrawerSurahsList();
        });
    }

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilterType = pill.getAttribute('data-filter') || 'all';
            renderDrawerSurahsList();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilterQuery = e.target.value.trim().toLowerCase();
            renderDrawerSurahsList();
        });
    }

    if (favToggleBtn) {
        favToggleBtn.addEventListener('click', () => {
            if (!state.currentSurah) return;
            toggleSurahFavorite(state.currentSurah.number);
        });
    }

    if (topPlayBtn) {
        topPlayBtn.addEventListener('click', togglePlaySurah);
    }

    if (drawerThemeToggle) {
        drawerThemeToggle.addEventListener('click', () => {
            toggleTheme();
            updateDrawerThemeLabel();
        });
        updateDrawerThemeLabel();
    }

    const readCard = document.getElementById('drawer-current-read-card');
    if (readCard) {
        readCard.addEventListener('click', () => {
            closeDrawer();
            const savedSurah = parseInt(localStorage.getItem('last_surah_num')) || 1;
            loadSurah(savedSurah);
        });
    }
}

function updateDrawerThemeLabel() {
    const label = document.getElementById('drawer-theme-btn-label');
    const nameEl = document.getElementById('drawer-theme-name');
    const isDark = state.theme === 'dark';
    if (label) label.innerText = isDark ? 'نهاري' : 'ليلي';
    if (nameEl) nameEl.innerText = isDark ? 'الوضع الليلي' : 'الوضع النهاري';
}

function updateDrawerCurrentRead() {
    const surahEl = document.getElementById('drawer-read-surah');
    const metaEl = document.getElementById('drawer-read-meta');
    if (state.currentSurah && surahEl && metaEl) {
        const juzVal = SURAH_START_JUZ[state.currentSurah.number] || 1;
        surahEl.innerText = formatSurahName(state.currentSurah.name);
        metaEl.innerText = `${JUZ_NAMES[juzVal]} • ${state.currentSurah.numberOfAyahs} آية`;
    }
}

function toggleSurahFavorite(surahNum) {
    let favs = JSON.parse(localStorage.getItem('quran_favorites') || '[]');
    const idx = favs.indexOf(surahNum);
    if (idx === -1) {
        favs.push(surahNum);
    } else {
        favs.splice(idx, 1);
    }
    localStorage.setItem('quran_favorites', JSON.stringify(favs));
    updateFavoriteButtonState();
    renderDrawerFavorites();
}

function updateFavoriteButtonState() {
    const favBtn = document.getElementById('toggle-favorite-btn');
    if (!favBtn || !state.currentSurah) return;
    const favs = JSON.parse(localStorage.getItem('quran_favorites') || '[]');
    const isFav = favs.includes(state.currentSurah.number);
    favBtn.classList.toggle('favorited', isFav);
}

function renderDrawerFavorites() {
    const list = document.getElementById('drawer-favorites-list');
    if (!list) return;

    let favs = JSON.parse(localStorage.getItem('quran_favorites') || '[]');
    if (favs.length === 0) {
        favs = [1, 2, 18, 36, 55, 67];
        localStorage.setItem('quran_favorites', JSON.stringify(favs));
    }

    if (!state.surahsList || state.surahsList.length === 0) return;

    list.innerHTML = favs.map(num => {
        const s = state.surahsList.find(item => item.number === num);
        if (!s) return '';
        return `
            <div class="drawer-fav-chip" onclick="loadSurahAndCloseDrawer(${s.number})">
                <svg class="koboyo-icon icon-xs" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>${formatSurahName(s.name)}</span>
            </div>
        `;
    }).join('');
}

function renderDrawerSurahsList() {
    const list = document.getElementById('drawer-surahs-list');
    if (!list || !state.surahsList || state.surahsList.length === 0) return;

    const filtered = state.surahsList.filter(s => {
        if (currentFilterQuery) {
            const cleanQuery = currentFilterQuery.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه');
            const cleanName = s.name.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').toLowerCase();
            const cleanEn = (s.englishName || '').toLowerCase();
            if (!cleanName.includes(cleanQuery) && !cleanEn.includes(cleanQuery)) {
                return false;
            }
        }
        if (currentFilterType !== 'all' && s.revelationType !== currentFilterType) {
            return false;
        }
        if (currentFilterJuz !== 'all') {
            const juzNum = parseInt(currentFilterJuz);
            const startJuz = SURAH_START_JUZ[s.number] || 1;
            if (startJuz !== juzNum) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 16px;">لا توجد نتائج مطابقة</div>';
        return;
    }

    list.innerHTML = filtered.map(s => {
        const revAr = s.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
        const juzVal = SURAH_START_JUZ[s.number] || 1;
        const isActive = state.currentSurah && state.currentSurah.number === s.number;
        return `
            <div class="drawer-surah-item ${isActive ? 'active' : ''}" onclick="loadSurahAndCloseDrawer(${s.number})">
                <span class="drawer-surah-item-name">${s.number}. ${formatSurahName(s.name)}</span>
                <span class="drawer-surah-item-meta">${revAr} • ج${juzVal}</span>
            </div>
        `;
    }).join('');
}

function loadSurahAndCloseDrawer(surahNumber) {
    const drawer = document.getElementById('side-menu-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    loadSurah(surahNumber);
}

function setupMushafSwiperNavigation() {
    const track = document.getElementById('mushaf-pages-track');
    const nextArrow = document.getElementById('page-next-arrow');
    const prevArrow = document.getElementById('page-prev-arrow');
    const pillNext = document.getElementById('pill-next-btn');
    const pillPrev = document.getElementById('pill-prev-btn');

    const goNext = () => {
        if (state.currentPageIndex < state.surahPages.length - 1) {
            goToMushafPage(state.currentPageIndex + 1);
        }
    };

    const goPrev = () => {
        if (state.currentPageIndex > 0) {
            goToMushafPage(state.currentPageIndex - 1);
        }
    };

    if (nextArrow) nextArrow.addEventListener('click', goNext);
    if (prevArrow) prevArrow.addEventListener('click', goPrev);
    if (pillNext) pillNext.addEventListener('click', goNext);
    if (pillPrev) pillPrev.addEventListener('click', goPrev);

    if (track) {
        let scrollTimeout;
        track.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                detectActiveMushafPage();
            }, 80);
        }, { passive: true });
    }
}

function goToMushafPage(pageIndex) {
    const track = document.getElementById('mushaf-pages-track');
    if (!track || !track.children[pageIndex]) return;

    state.currentPageIndex = pageIndex;
    track.children[pageIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    updateMushafPageUI();
}

function detectActiveMushafPage() {
    const track = document.getElementById('mushaf-pages-track');
    if (!track || track.children.length === 0) return;

    const trackCenter = track.getBoundingClientRect().left + track.offsetWidth / 2;
    let closestIndex = 0;
    let minDiff = Infinity;

    Array.from(track.children).forEach((child, idx) => {
        const rect = child.getBoundingClientRect();
        const childCenter = rect.left + rect.width / 2;
        const diff = Math.abs(trackCenter - childCenter);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
        }
    });

    state.currentPageIndex = closestIndex;
    updateMushafPageUI();
}

function updateMushafPageUI() {
    const counter = document.getElementById('mushaf-page-counter');
    const total = state.surahPages.length || 1;
    const current = (state.currentPageIndex || 0) + 1;

    if (counter) {
        counter.innerText = `صفحة ${current} من ${total}`;
    }

    const nextArrow = document.getElementById('page-next-arrow');
    const prevArrow = document.getElementById('page-prev-arrow');
    const pillNext = document.getElementById('pill-next-btn');
    const pillPrev = document.getElementById('pill-prev-btn');

    const isFirst = state.currentPageIndex <= 0;
    const isLast = state.currentPageIndex >= total - 1;

    if (prevArrow) prevArrow.disabled = isFirst;
    if (pillPrev) pillPrev.disabled = isFirst;
    if (nextArrow) nextArrow.disabled = isLast;
    if (pillNext) pillNext.disabled = isLast;
}

async function fetchSurahsList() {
    try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await res.json();
        if (data.code === 200 && data.data) {
            state.surahsList = data.data;
            renderDrawerFavorites();
            renderDrawerSurahsList();

            // Load saved or default to Al-Fatiha
            const savedSurah = parseInt(localStorage.getItem('last_surah_num')) || 1;
            loadSurah(savedSurah);
        }
    } catch(e) {
        console.error('Failed to load surahs list', e);
    }
}

async function loadSurah(surahNumber, targetAyahNumber = null) {
    const track = document.getElementById('mushaf-pages-track');
    
    // Stop current audio
    stopAudio();
    
    if (track) {
        track.innerHTML = `
            <div class="mushaf-page-card skeleton-page">
                <div class="skeleton-shimmer skeleton-pill" style="width: 40%; height: 26px; margin: 0 auto 24px;"></div>
                <div class="skeleton-shimmer skeleton-pill" style="width: 95%; height: 18px; margin-bottom: 14px;"></div>
                <div class="skeleton-shimmer skeleton-pill" style="width: 90%; height: 18px; margin-bottom: 14px;"></div>
                <div class="skeleton-shimmer skeleton-pill" style="width: 85%; height: 18px; margin-bottom: 14px;"></div>
                <div class="skeleton-shimmer skeleton-pill" style="width: 80%; height: 18px;"></div>
            </div>
        `;
    }
    
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
        const json = await res.json();
        if (json.code === 200 && json.data) {
            state.currentSurah = json.data;
            state.currentAyahs = json.data.ayahs;
            
            // Save to last read
            localStorage.setItem('last_surah_num', surahNumber);
            localStorage.setItem('last_surah_name', json.data.name);
            updateContinueReadingBanner(json.data.name, targetAyahNumber || 1);
            
            // Update minimal header
            updateMinimalHeader(json.data);
            updateFavoriteButtonState();
            updateDrawerCurrentRead();
            
            // Render Mushaf pages with horizontal swiper
            renderMushafPages(json.data, targetAyahNumber);
        }
    } catch(e) {
        if (track) {
            track.innerHTML = `
                <div class="error-card" style="margin: 40px auto; max-width: 400px;">
                    <p>فشل جلب الآيات، يرجى التحقق من اتصالك بالإنترنت.</p>
                    <button class="btn-pill" onclick="loadSurah(${surahNumber})">إعادة المحاولة</button>
                </div>
            `;
        }
    }
}

function updateMinimalHeader(surah) {
    const titleEl = document.getElementById('top-surah-name');
    const juzEl = document.getElementById('top-juz-name');
    const revEl = document.getElementById('top-revelation-type');

    const startJuz = surah.ayahs && surah.ayahs[0] ? surah.ayahs[0].juz : (SURAH_START_JUZ[surah.number] || 1);
    const endJuz = surah.ayahs && surah.ayahs.length ? surah.ayahs[surah.ayahs.length - 1].juz : startJuz;

    let juzLabel = JUZ_NAMES[startJuz] || `الجزء ${startJuz}`;
    if (startJuz !== endJuz) {
        juzLabel = `${JUZ_NAMES[startJuz]} إلى ${JUZ_NAMES[endJuz]}`;
    }

    if (titleEl) titleEl.innerText = formatSurahName(surah.name);
    if (juzEl) juzEl.innerText = juzLabel;
    if (revEl) revEl.innerText = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
}

function renderMushafPages(surah, targetAyahNumber) {
    const track = document.getElementById('mushaf-pages-track');
    if (!track) return;

    // Group ayahs by authentic Madinah Mushaf page (ayah.page)
    const pagesMap = {};
    surah.ayahs.forEach((ayah, globalIdx) => {
        const pageNum = ayah.page || 1;
        if (!pagesMap[pageNum]) pagesMap[pageNum] = [];
        pagesMap[pageNum].push({ ...ayah, globalIdx });
    });

    const pageNumbers = Object.keys(pagesMap).map(Number).sort((a, b) => a - b);
    state.surahPages = pageNumbers;
    state.currentPageIndex = 0;

    const startJuz = surah.ayahs && surah.ayahs[0] ? surah.ayahs[0].juz : (SURAH_START_JUZ[surah.number] || 1);
    const revText = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';

    let html = '';
    pageNumbers.forEach((pNum, pIdx) => {
        const pageAyahs = pagesMap[pNum];
        const isFirstPageOfSurah = (pIdx === 0);
        const juzOfFirstAyah = pageAyahs[0].juz || startJuz;
        const juzLabel = JUZ_NAMES[juzOfFirstAyah] || `الجزء ${juzOfFirstAyah}`;

        html += `
            <article class="mushaf-page-card" id="mushaf-page-${pNum}" data-page-index="${pIdx}">
                <div class="mushaf-page-card-header">
                    <span>${formatSurahName(surah.name)}</span>
                    <span>${juzLabel}</span>
                    <span>${revText}</span>
                </div>
        `;

        // Bismillah Banner on first page (except At-Tawbah and Al-Fatiha)
        if (isFirstPageOfSurah && surah.number !== 1 && surah.number !== 9) {
            html += `<div class="bismillah-banner">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>`;
        }

        html += `<div class="mushaf-page-text">`;
        pageAyahs.forEach(ayah => {
            let text = ayah.text;
            if (surah.number !== 1 && ayah.numberInSurah === 1) {
                text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', '').trim();
            }

            html += `
                <span class="ayah-span" id="ayah-span-${ayah.numberInSurah}" data-index="${ayah.globalIdx}" data-page-index="${pIdx}">
                    ${text}
                    <button class="ayah-badge-btn" onclick="playSingleAyah(${ayah.globalIdx})" title="استمع للآية ${ayah.numberInSurah}">
                        <svg class="koboyo-icon icon-sm" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        <span>${ayah.numberInSurah}</span>
                    </button>
                </span>
            `;
        });
        html += `</div>`;

        html += `
                <div class="mushaf-page-card-footer">
                    - ${pNum} -
                </div>
            </article>
        `;
    });

    track.innerHTML = html;
    updateMushafPageUI();

    // Scroll to target ayah or page 0
    if (targetAyahNumber) {
        setTimeout(() => {
            const targetEl = document.getElementById(`ayah-span-${targetAyahNumber}`);
            if (targetEl) {
                const targetPageIdx = parseInt(targetEl.getAttribute('data-page-index')) || 0;
                goToMushafPage(targetPageIdx);
                targetEl.classList.add('playing');
                setTimeout(() => targetEl.classList.remove('playing'), 3000);
            }
        }, 300);
    } else {
        // Scroll track back to start
        track.scrollTo({ left: 0, behavior: 'instant' });
    }
}

function setupAudioListeners() {
    const playBtn = document.getElementById('dock-play-btn');
    const prevBtn = document.getElementById('dock-prev-ayah-btn');
    const nextBtn = document.getElementById('dock-next-ayah-btn');
    const closeBtn = document.getElementById('dock-close-btn');
    const scrubberTrack = document.getElementById('dock-scrubber-track');

    if (playBtn) playBtn.addEventListener('click', toggleDockPlayPause);
    if (prevBtn) prevBtn.addEventListener('click', playPreviousAyah);
    if (nextBtn) nextBtn.addEventListener('click', playNextAyah);
    if (closeBtn) closeBtn.addEventListener('click', stopAudio);

    if (scrubberTrack) {
        scrubberTrack.addEventListener('click', (e) => {
            const rect = scrubberTrack.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (state.audioInstance.duration) {
                state.audioInstance.currentTime = clickPos * state.audioInstance.duration;
            }
        });
    }

    state.audioInstance.addEventListener('timeupdate', () => {
        const cur = state.audioInstance.currentTime || 0;
        const dur = state.audioInstance.duration || 0;
        const pct = dur > 0 ? (cur / dur) * 100 : 0;

        const fill = document.getElementById('dock-scrubber-fill');
        const elapsed = document.getElementById('dock-time-elapsed');
        const total = document.getElementById('dock-time-duration');

        if (fill) fill.style.width = `${pct}%`;
        if (elapsed) elapsed.innerText = formatAudioTime(cur);
        if (total && dur > 0) total.innerText = formatAudioTime(dur);
    });

    state.audioInstance.addEventListener('ended', () => {
        if (state.isPlayingSurah) {
            // Next ayah in surah
            if (state.activeAyahIndex !== null && state.activeAyahIndex + 1 < state.currentAyahs.length) {
                playAyahAtIndex(state.activeAyahIndex + 1);
            } else {
                stopAudio();
            }
        } else {
            stopAudio();
        }
    });

    state.audioInstance.addEventListener('error', () => {
        console.error('Audio stream error');
        stopAudio();
    });
}

function playPreviousAyah() {
    if (state.activeAyahIndex !== null && state.activeAyahIndex > 0) {
        playAyahAtIndex(state.activeAyahIndex - 1);
    }
}

function playNextAyah() {
    if (state.activeAyahIndex !== null && state.activeAyahIndex + 1 < state.currentAyahs.length) {
        playAyahAtIndex(state.activeAyahIndex + 1);
    }
}

function showMobileAudioDock(surahName, ayahNum) {
    const dock = document.getElementById('mobile-audio-dock');
    if (!dock) return;
    dock.style.display = 'block';
    document.body.classList.add('audio-dock-open');

    const surahLabel = document.getElementById('dock-surah-label');
    const ayahLabel = document.getElementById('dock-ayah-label');
    if (surahLabel) surahLabel.innerText = formatSurahName(surahName);
    if (ayahLabel) ayahLabel.innerText = `الآية ${ayahNum}`;
}

function toggleDockPlayPause() {
    if (state.audioInstance.paused) {
        if (state.activeAyahIndex === null) {
            togglePlaySurah();
        } else {
            state.audioInstance.play().catch(e => console.log('Autoplay error', e));
            updatePlayBtnIcon(true);
        }
    } else {
        state.audioInstance.pause();
        updatePlayBtnIcon(false);
    }
}

function togglePlaySurah() {
    if (state.isPlayingSurah) {
        stopAudio();
    } else {
        if (!state.currentAyahs || state.currentAyahs.length === 0) return;
        state.isPlayingSurah = true;
        playAyahAtIndex(0);
        updatePlayBtnIcon(true);
    }
}

function playSingleAyah(index) {
    state.isPlayingSurah = false;
    playAyahAtIndex(index);
    updatePlayBtnIcon(true);
}

function playAyahAtIndex(index) {
    if (!state.currentAyahs || !state.currentAyahs[index]) return;

    state.activeAyahIndex = index;
    const ayah = state.currentAyahs[index];

    // Clear previous playing spans
    document.querySelectorAll('.ayah-span').forEach(s => s.classList.remove('playing'));

    // Highlight current playing span and smooth scroll to center on mobile
    const activeSpan = document.getElementById(`ayah-span-${ayah.numberInSurah}`);
    if (activeSpan) {
        activeSpan.classList.add('playing');
        activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // If on another Mushaf page, navigate to that page
        const pageIdx = parseInt(activeSpan.getAttribute('data-page-index'));
        if (!isNaN(pageIdx) && pageIdx !== state.currentPageIndex) {
            goToMushafPage(pageIdx);
        }
    }

    // Audio stream URL (Mishary Alafasy CDN)
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    state.audioInstance.src = audioUrl;
    state.audioInstance.play().catch(e => console.log('Audio autoplay prevented'));

    showMobileAudioDock(state.currentSurah.name, ayah.numberInSurah);
    updatePlayBtnIcon(true);
}

function stopAudio() {
    state.audioInstance.pause();
    state.audioInstance.currentTime = 0;
    state.isPlayingSurah = false;
    state.activeAyahIndex = null;

    document.querySelectorAll('.ayah-span').forEach(s => s.classList.remove('playing'));
    updatePlayBtnIcon(false);

    const fill = document.getElementById('dock-scrubber-fill');
    if (fill) fill.style.width = '0%';

    const elapsed = document.getElementById('dock-time-elapsed');
    if (elapsed) elapsed.innerText = '00:00';

    const dock = document.getElementById('mobile-audio-dock');
    if (dock) dock.style.display = 'none';
    document.body.classList.remove('audio-dock-open');
}

function updatePlayBtnIcon(isPlaying) {
    const dockPlayIcon = document.getElementById('dock-play-icon');
    const topPlayIcon = document.getElementById('top-play-icon');
    const heroBtnLabel = document.getElementById('surah-hero-listen-label');
    const heroPlayIcon = document.getElementById('surah-hero-play-icon');

    if (isPlaying) {
        if (dockPlayIcon) {
            dockPlayIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
        }
        if (topPlayIcon) {
            topPlayIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
        }
        if (heroPlayIcon) {
            heroPlayIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
        }
        if (heroBtnLabel) heroBtnLabel.innerText = 'إيقاف التلاوة';
    } else {
        if (dockPlayIcon) {
            dockPlayIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
        }
        if (topPlayIcon) {
            topPlayIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
        }
        if (heroPlayIcon) {
            heroPlayIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
        }
        if (heroBtnLabel) heroBtnLabel.innerText = 'استماع للسورة كاملة';
    }
}

function formatAudioTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

/* --- Search Ayahs Engine --- */
function setupQuranSearch() {
    const searchInput = document.getElementById('quran-search-input');
    const clearBtn = document.getElementById('quran-search-clear');
    let debounceTimer = null;
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';
        
        clearTimeout(debounceTimer);
        if (query.length < 2) {
            renderSearchEmptyPrompt();
            return;
        }
        
        debounceTimer = setTimeout(() => {
            performQuranSearch(query);
        }, 500);
    });
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            renderSearchEmptyPrompt();
        });
    }
}

function renderSearchEmptyPrompt() {
    const resultsContainer = document.getElementById('quran-search-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <svg class="koboyo-icon icon-xl" viewBox="0 0 24 24" style="margin-bottom: 12px; opacity: 0.5;">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p>اكتب كلمة أو آية للبحث في كافة سور القرآن الكريم</p>
            </div>
        `;
    }
}

async function performQuranSearch(query) {
    const resultsContainer = document.getElementById('quran-search-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="skeleton-adhkar-card">
            <div class="skeleton-shimmer skeleton-pill" style="width: 70%; height: 18px; margin-bottom: 10px;"></div>
            <div class="skeleton-shimmer skeleton-pill" style="width: 90%; height: 16px; margin-bottom: 10px;"></div>
            <div class="skeleton-shimmer skeleton-pill" style="width: 50%; height: 16px;"></div>
        </div>
    `;
    
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/ar`);
        const json = await res.json();
        
        if (json.code === 200 && json.data && json.data.matches && json.data.matches.length > 0) {
            const matches = json.data.matches;
            let html = `
                <div style="margin-bottom: 14px; font-size: 0.95rem; color: var(--accent-gold);">
                    تم العثور على <strong>${json.data.count}</strong> آية مطابقة:
                </div>
                <div class="search-results-list">
            `;
            
            matches.slice(0, 50).forEach(m => {
                // Highlight keyword
                const regex = new RegExp(`(${query})`, 'gi');
                const highlighted = m.text.replace(regex, '<mark style="background: rgba(229, 184, 105, 0.4); color: inherit; padding: 0 4px; border-radius: 4px;">$1</mark>');
                
                html += `
                    <div class="search-result-card">
                        <div class="result-header">
                            <div class="result-surah-info">
                                ${formatSurahName(m.surah.name)} — آية ${m.numberInSurah}
                            </div>
                            <div class="result-actions">
                                <button class="btn-pill" onclick="playSingleAyahAudioDirect(${m.number}, '${m.surah.name}', ${m.numberInSurah})">
                                    <svg class="koboyo-icon icon-sm" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    استماع
                                </button>
                                <button class="btn-pill" onclick="goToSurahFromSearch(${m.surah.number}, ${m.numberInSurah})">
                                    <svg class="koboyo-icon icon-sm" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                    الذهاب للسورة
                                </button>
                            </div>
                        </div>
                        <div class="result-text">${highlighted} ﴿${m.numberInSurah}﴾</div>
                    </div>
                `;
            });
            
            html += `</div>`;
            resultsContainer.innerHTML = html;
        } else {
            resultsContainer.innerHTML = `
                <div class="card-glass" style="text-align: center; padding: 40px 20px;">
                    <p style="color: var(--text-muted);">لم يتم العثور على آيات تحتوي على "${query}"</p>
                </div>
            `;
        }
    } catch(e) {
        resultsContainer.innerHTML = `
            <div class="error-card">
                <p>حدث خطأ أثناء البحث، يرجى التحقق من الاتصال بالإنترنت.</p>
            </div>
        `;
    }
}

function playSingleAyahAudioDirect(globalAyahNumber, surahName = '', ayahInSurah = '') {
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
    state.audioInstance.src = audioUrl;
    state.audioInstance.play().catch(e => console.log('Audio autoplay prevented'));
    showMobileAudioDock(surahName || 'القرآن الكريم', ayahInSurah || globalAyahNumber);
    updatePlayBtnIcon(true);
    triggerVibrate(20);
}

function goToSurahFromSearch(surahNum, ayahNum) {
    // Switch to read tab
    const readTabBtn = document.getElementById('tab-quran-read');
    if (readTabBtn) readTabBtn.click();
    
    // Load that surah and scroll to ayah
    loadSurah(surahNum, ayahNum);
}

/* --- Continue Reading Feature --- */
function checkContinueReading() {
    const surahNum = localStorage.getItem('last_surah_num');
    const surahName = localStorage.getItem('last_surah_name');
    if (surahNum && surahName) {
        updateContinueReadingBanner(surahName, 1);
    }
}

function updateContinueReadingBanner(surahName, ayahNum) {
    const banner = document.getElementById('continue-reading-container');
    if (banner) {
        banner.innerHTML = `
            <div class="continue-reading-pill" onclick="loadSurah(${localStorage.getItem('last_surah_num') || 1})">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg class="koboyo-icon" viewBox="0 0 24 24" style="color: var(--accent-gold);"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    <span>متابعة القراءة: <strong>${formatSurahName(surahName)}</strong></span>
                </div>
                <svg class="koboyo-icon icon-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </div>
        `;
    }
}

/* ========================================================
   3. QIBLA COMPASS ENGINE
   ======================================================== */
async function initQibla() {
    const { lat, long } = state.userLocation;
    const degreeEl = document.getElementById('qibla-angle-val');
    const startBtn = document.getElementById('qibla-permission-btn');
    
    try {
        const res = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${long}`);
        const json = await res.json();
        if (json.code === 200 && json.data) {
            state.qiblaDirection = json.data.direction;
            if (degreeEl) degreeEl.innerText = `${Math.round(state.qiblaDirection)}°`;
            
            // Check if device orientation permission is needed (iOS 13+)
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                if (startBtn) {
                    startBtn.style.display = 'inline-block';
                    startBtn.onclick = requestOrientationPermission;
                }
            } else {
                window.addEventListener('deviceorientation', handleOrientationEvent, true);
            }
            
            // Initial angle render
            renderCompass(state.qiblaDirection);
        }
    } catch(e) {
        console.error('Failed to get Qibla angle', e);
    }
}

function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(res => {
                if (res === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientationEvent, true);
                    const btn = document.getElementById('qibla-permission-btn');
                    if (btn) btn.style.display = 'none';
                }
            })
            .catch(console.error);
    }
}

function handleOrientationEvent(event) {
    let heading = 0;
    if (event.webkitCompassHeading) {
        heading = event.webkitCompassHeading; // iOS heading
    } else if (event.alpha !== null) {
        heading = 360 - event.alpha; // Android heading
    }
    
    state.currentHeading = heading;
    
    // Relative angle: how much needle needs to rotate
    const targetAngle = state.qiblaDirection - heading;
    
    // Smooth angle wrap-around
    let diff = targetAngle - state.smoothedAngle;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    state.smoothedAngle += diff;
    
    renderCompass(state.smoothedAngle);
}

function renderCompass(angle) {
    const needle = document.getElementById('compass-needle-el');
    const wrapper = document.getElementById('compass-wrapper-el');
    if (!needle) return;
    
    needle.style.transform = `rotate(${angle}deg)`;
    
    // Check if aligned with Kaaba (within 5 degrees tolerance)
    const norm = ((angle % 360) + 360) % 360;
    const isAligned = norm < 5 || norm > 355;
    
    if (isAligned) {
        needle.classList.add('aligned');
        if (wrapper) wrapper.classList.add('aligned');
        triggerVibrate(15);
    } else {
        needle.classList.remove('aligned');
        if (wrapper) wrapper.classList.remove('aligned');
    }
}

/* ========================================================
   4. DIGITAL MASBAHA ENGINE (Luxury Smart Tasbeeh)
   ======================================================== */
function initSabha() {
    renderSabhaUI();
    setupSabhaEvents();
    updateSoundBtnUI();
}

function setupSabhaEvents() {
    const dhikrSelector = document.getElementById('sabha-dhikr-list');
    
    // Quick Dhikr Buttons
    if (dhikrSelector) {
        const dhikrs = ['سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله', 'أستغفر الله', 'لا حول ولا قوة إلا بالله', 'اللهم صلِّ وسلم على نبينا محمد'];
        dhikrSelector.innerHTML = dhikrs.map(d => `
            <button class="dhikr-pill-btn ${d === state.sabhaDhikr ? 'active' : ''}" onclick="selectSabhaDhikr('${d}')">${d}</button>
        `).join('');
    }
}

function selectSabhaDhikr(dhikrText) {
    state.sabhaDhikr = dhikrText;
    localStorage.setItem('sabha_dhikr', dhikrText);
    
    document.querySelectorAll('.dhikr-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === dhikrText);
    });
    
    const label = document.getElementById('sabha-active-dhikr-name');
    if (label) label.innerText = dhikrText;
    
    triggerVibrate(20);
}

function setSabhaTarget(target) {
    state.sabhaTarget = target;
    localStorage.setItem('sabha_target', target);
    
    document.querySelectorAll('.target-pill-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.getAttribute('data-target')) === target);
    });
    
    const targetEl = document.getElementById('masbaha-target-stat');
    if (targetEl) targetEl.innerText = target === 0 ? 'حر ∞' : target;
    
    updateMasbahaProgress();
    triggerVibrate(15);
}

function handleMasbahaTap(event) {
    const surface = document.getElementById('masbaha-tap-surface');
    if (surface && event) {
        const rect = surface.getBoundingClientRect();
        const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : rect.left + rect.width / 2);
        const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : rect.top + rect.height / 2);
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'tap-ripple';
        ripple.style.width = '60px';
        ripple.style.height = '60px';
        ripple.style.left = `${x - 30}px`;
        ripple.style.top = `${y - 30}px`;
        surface.appendChild(ripple);
        setTimeout(() => ripple.remove(), 450);
    }
    
    incrementSabha();
}

function incrementSabha() {
    state.sabhaCount++;
    state.sabhaTotal++;
    
    localStorage.setItem('sabha_count', state.sabhaCount);
    localStorage.setItem('sabha_total', state.sabhaTotal);
    
    if (state.sabhaSound) {
        playHapticSound();
    }
    triggerVibrate(25);
    
    // Check if reached active target
    if (state.sabhaTarget > 0 && state.sabhaCount % state.sabhaTarget === 0) {
        showMilestoneToast(`ما شاء الله! أتممت ${state.sabhaTarget} تسبيحة `);
        triggerVibrate([50, 100, 50]);
    }
    
    renderSabhaUI();
}

function showMilestoneToast(msg) {
    const toast = document.getElementById('sabha-milestone-toast');
    const toastText = document.getElementById('milestone-toast-text');
    if (toast && toastText) {
        toastText.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }
}

function updateMasbahaProgress() {
    const ringFill = document.getElementById('masbaha-ring-fill');
    if (!ringFill) return;
    
    const circumference = 754; // 2 * PI * 120
    const target = state.sabhaTarget > 0 ? state.sabhaTarget : 33;
    const currentInLap = state.sabhaCount % target;
    const progress = state.sabhaTarget === 0 ? (state.sabhaCount % 33) / 33 : (currentInLap / target);
    const offset = circumference - (progress * circumference);
    
    ringFill.style.strokeDashoffset = offset;
}

function resetSabha() {
    state.sabhaCount = 0;
    localStorage.setItem('sabha_count', 0);
    triggerVibrate(40);
    renderSabhaUI();
}

function cycleSabhaColor() {
    state.sabhaColorIndex = (state.sabhaColorIndex + 1) % MASBAHA_COLORS.length;
    localStorage.setItem('sabha_color_idx', state.sabhaColorIndex);
    applySabhaColor();
    triggerVibrate(20);
}

function applySabhaColor() {
    const currentColor = MASBAHA_COLORS[state.sabhaColorIndex];
    document.documentElement.style.setProperty('--sabha-color', currentColor.color);
    const colorLabel = document.getElementById('sabha-color-name');
    const colorDot = document.getElementById('sabha-color-dot');
    if (colorLabel) colorLabel.innerText = currentColor.name;
    if (colorDot) colorDot.style.background = currentColor.color;
}

function toggleSabhaSound() {
    state.sabhaSound = !state.sabhaSound;
    localStorage.setItem('sabha_sound', state.sabhaSound);
    updateSoundBtnUI();
    triggerVibrate(20);
}

function updateSoundBtnUI() {
    const label = document.getElementById('sabha-sound-label');
    const icon = document.getElementById('sabha-sound-icon');
    if (!label || !icon) return;
    
    if (state.sabhaSound) {
        label.innerText = 'صوت';
        icon.innerHTML = `
            <svg class="koboyo-icon icon-sm" viewBox="0 0 24 24">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
        `;
    } else {
        label.innerText = 'صامت';
        icon.innerHTML = `
            <svg class="koboyo-icon icon-sm" viewBox="0 0 24 24" style="opacity: 0.6;">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
        `;
    }
}

function renderSabhaUI() {
    const digitEl = document.getElementById('masbaha-digit-display');
    const totalEl = document.getElementById('masbaha-total-stat');
    const lapEl = document.getElementById('masbaha-laps-stat');
    const lapsBadge = document.getElementById('masbaha-laps-count');
    const targetEl = document.getElementById('masbaha-target-stat');
    
    const target = state.sabhaTarget > 0 ? state.sabhaTarget : 33;
    const completedLaps = Math.floor(state.sabhaTotal / target);
    
    if (digitEl) digitEl.innerText = state.sabhaCount;
    if (totalEl) totalEl.innerText = state.sabhaTotal;
    if (lapEl) lapEl.innerText = completedLaps;
    if (lapsBadge) lapsBadge.innerText = completedLaps + 1;
    if (targetEl) targetEl.innerText = state.sabhaTarget === 0 ? 'حر ∞' : state.sabhaTarget;
    
    applySabhaColor();
    updateMasbahaProgress();
}

/* ========================================================
   5. ADHKAR ENGINE (Categorized Cards & Tap Counters)
   ======================================================== */
function initAdhkar() {
    setupAdhkarTabs();
    renderAdhkarList('all');
}

function setupAdhkarTabs() {
    const tabs = document.querySelectorAll('.adhkar-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.getAttribute('data-cat');
            renderAdhkarList(category);
        });
    });
}

function renderAdhkarList(category) {
    const container = document.getElementById('adhkar-cards-container');
    if (!container) return;
    
    const filtered = category === 'all' 
        ? ADHKAR_DATA 
        : ADHKAR_DATA.filter(d => d.category === category);
        
    container.innerHTML = filtered.map(item => {
        const currentCount = parseInt(localStorage.getItem(`adhkar_${item.id}`)) || 0;
        const isDone = currentCount >= item.count;
        
        return `
            <div class="dhikr-item-card ${isDone ? 'completed' : ''}" id="dhikr-card-${item.id}">
                <div class="dhikr-text">${item.text}</div>
                <div class="dhikr-footer">
                    <div class="dhikr-virtue"> ${item.virtue}</div>
                    <button class="dhikr-counter-btn ${isDone ? 'done' : ''}" id="dhikr-btn-${item.id}" onclick="tapDhikrCounter(${item.id}, ${item.count})">
                        ${isDone 
                            ? `<svg class="koboyo-icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> تم الذكر`
                            : `<svg class="koboyo-icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle></svg> ${currentCount} / ${item.count}`
                        }
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function tapDhikrCounter(id, targetCount) {
    let current = parseInt(localStorage.getItem(`adhkar_${id}`)) || 0;
    if (current < targetCount) {
        current++;
        localStorage.setItem(`adhkar_${id}`, current);
        playHapticSound();
        triggerVibrate(25);
    } else {
        // Reset count if tapped after completion
        current = 0;
        localStorage.setItem(`adhkar_${id}`, 0);
        triggerVibrate(15);
    }
    
    // Update card UI
    const card = document.getElementById(`dhikr-card-${id}`);
    const btn = document.getElementById(`dhikr-btn-${id}`);
    const isDone = current >= targetCount;
    
    if (card) card.classList.toggle('completed', isDone);
    if (btn) {
        btn.classList.toggle('done', isDone);
        btn.innerHTML = isDone
            ? `<svg class="koboyo-icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> تم الذكر`
            : `<svg class="koboyo-icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle></svg> ${current} / ${targetCount}`;
    }
}

/* ========================================================
   SERVICE WORKER & PWA REGISTRATION
   ======================================================== */
function initServiceWorker() {
    if ('caches' in window) {
        caches.keys().then(keys => {
            keys.forEach(key => {
                if (key !== 'islamic-app-v4') {
                    caches.delete(key);
                }
            });
        });
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => {
                    reg.update();
                    console.log('Service Worker registered successfully');
                })
                .catch(err => console.log('Service Worker registration skipped:', err));
        });
    }
}
