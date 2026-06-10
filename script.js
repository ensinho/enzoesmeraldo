// ═══════════════════════════════════════════════════
// ENZO.DEV — Script v2.0
// ═══════════════════════════════════════════════════

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Site start (called once the jukebox is dismissed) ──
let siteStarted = false;
function startSite() {
    if (siteStarted) return;
    siteStarted = true;
    initScrollAnimations();
}

// ── Scroll Animations ──
function initScrollAnimations() {
    if (prefersReducedMotion) {
        gsap.set(".hero-text-anim", { y: 0 });
        gsap.set(".gs-fade-in, .gs-reveal", { y: 0, opacity: 1 });
        window.addEventListener('scroll', () => {
            document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
        });
        return;
    }

    // Parallax Hero
    gsap.to("#hero-bg", {
        yPercent: 25,
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Hero Text Stagger
    gsap.to(".hero-text-anim", {
        y: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.1
    });

    // Fade In Elements
    gsap.utils.toArray('.gs-fade-in').forEach(element => {
        gsap.to(element, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            delay: 0.6
        });
    });

    // Reveal Sections
    gsap.utils.toArray('.gs-reveal').forEach(element => {
        gsap.fromTo(element,
            { y: 60, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 88%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Navbar scroll state
    ScrollTrigger.create({
        start: 'top -60',
        end: 99999,
        onEnter: () => document.getElementById('navbar').classList.add('scrolled'),
        onLeaveBack: () => document.getElementById('navbar').classList.remove('scrolled'),
    });
}

// ── Back to Top ──
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight * 0.5) {
            backToTopBtn.classList.remove('translate-y-20', 'opacity-0');
        } else {
            backToTopBtn.classList.add('translate-y-20', 'opacity-0');
        }
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ── Mobile Menu ──
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
const mobileLinks = document.querySelectorAll('.mobile-link');
let mobileMenuOpen = false;

function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    if (mobileMenuOpen) {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        mobileMenuBackdrop.classList.remove('opacity-0', 'pointer-events-none');
        mobileMenuBackdrop.classList.add('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = 'hidden';
        menuBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
    } else {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        mobileMenuBackdrop.classList.remove('opacity-100', 'pointer-events-auto');
        mobileMenuBackdrop.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
        menuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
    }
}

window.closeMobileMenu = function () {
    if (mobileMenuOpen) toggleMobileMenu();
};

if (menuBtn) menuBtn.addEventListener('click', toggleMobileMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

// ── CV Download Feedback ──
function checkCV(e) {
    const btn = e.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>DOWNLOADED ✓</span>';
    setTimeout(() => btn.innerHTML = originalText, 2000);
}

// ── Music Card ──
const songs = [
    {
        title: "Oxygen",
        artist: "Porch Light",
        file: "assets/songs/Porch_light_-_Oxygen_(SkySound.cc).mp3",
        cover: "url('assets/albumCovers/oxygenPorchLight.jpg')",
        heroBg: "assets/backgrounds/catwhaleshark.jpg",
        easterEgg: {
            en: "Oxygen mode: quiet blue focus.",
            pt: "Modo Oxygen: foco azul e tranquilo."
        },
        consoleMsg: ["color: #7aa9d8; font-size: 13px; font-weight: bold;", "Porch Light / Oxygen theme loaded."],
        theme: {
            bg: "5 13 25",
            text: "239 247 255",
            accent: "122 169 216",
            secondary: "71 102 139",
            panel: "10 22 39",
            gray: "147 166 188",
            heat: [
                "rgba(255,255,255,0.055)",
                "rgba(122,169,216,0.18)",
                "rgba(122,169,216,0.34)",
                "rgba(122,169,216,0.58)",
                "rgba(235,247,255,0.95)"
            ]
        }
    },
    {
        title: "Change (In the House of Flies)",
        artist: "Deftones",
        file: "assets/songs/Deftones - Change (In the House of Flies).mp3",
        cover: "url('assets/albumCovers/DeftonesCover.jpg')",
        heroBg: "assets/backgrounds/black_and_white.jpg",
        easterEgg: {
            en: "Change mode: clean lines, no noise.",
            pt: "Modo Change: linhas limpas, sem ruído."
        },
        consoleMsg: ["color: #111111; font-size: 13px; font-weight: bold;", "Deftones / Change theme loaded."],
        theme: {
            bg: "244 244 241",
            text: "10 10 10",
            accent: "10 10 10",
            secondary: "96 96 92",
            panel: "255 255 255",
            gray: "96 96 92",
            heat: [
                "rgba(10,10,10,0.055)",
                "rgba(10,10,10,0.16)",
                "rgba(10,10,10,0.34)",
                "rgba(10,10,10,0.62)",
                "rgba(10,10,10,0.94)"
            ]
        }
    }
];

let currentSongIndex = 0;
let isPlaying = false;
const audioPlayer = new Audio();

const musicCard = document.getElementById('music-card');
const albumArt = document.getElementById('album-art');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const equalizer = document.getElementById('equalizer');
const heroBg = document.getElementById('hero-bg');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const musicCollapsible = document.getElementById('music-collapsible');
const collapseIcon = document.getElementById('collapse-icon');
const musicEasterEgg = document.getElementById('music-easter-egg');

let isMusicCollapsed = false;
let easterEggTimeout = null;

// ── Music Collapse ──
function toggleMusicCollapse() {
    isMusicCollapsed = !isMusicCollapsed;
    if (isMusicCollapsed) {
        musicCollapsible.style.maxHeight = '0px';
        musicCollapsible.style.opacity = '0';
        collapseIcon.style.transform = 'rotate(180deg)';
        musicCard.classList.add('collapsed');
    } else {
        musicCollapsible.style.maxHeight = '80px';
        musicCollapsible.style.opacity = '1';
        collapseIcon.style.transform = 'rotate(0deg)';
        musicCard.classList.remove('collapsed');
    }
}

// ── Easter Egg: in-card message ──
function showEasterEgg(msgObj) {
    if (!musicEasterEgg) return;
    if (easterEggTimeout) clearTimeout(easterEggTimeout);

    const msg = msgObj[currentLang] || msgObj['en'];

    // Reset
    musicEasterEgg.style.maxHeight = '0';
    musicEasterEgg.style.color = 'rgba(var(--accent-rgb), 0)';
    musicEasterEgg.textContent = msg;

    // Fade in after tiny delay
    requestAnimationFrame(() => requestAnimationFrame(() => {
        musicEasterEgg.style.maxHeight = '30px';
        musicEasterEgg.style.color = 'rgba(var(--accent-rgb), 0.5)';
    }));

    // Fade out after 4s
    easterEggTimeout = setTimeout(() => {
        musicEasterEgg.style.color = 'rgba(var(--accent-rgb), 0)';
        setTimeout(() => { musicEasterEgg.style.maxHeight = '0'; }, 700);
    }, 4000);
}

// ── Theme veil: a brief accent wash that makes the flip feel like a moment ──
let themeLoadedOnce = false;
function flashThemeVeil() {
    if (prefersReducedMotion) return;
    let veil = document.querySelector('.theme-veil');
    if (!veil) {
        veil = document.createElement('div');
        veil.className = 'theme-veil';
        document.body.appendChild(veil);
    }
    veil.classList.remove('is-active');
    void veil.offsetWidth;
    veil.classList.add('is-active');
}

function loadSong(index) {
    const song = songs[index];
    const isThemeSwitch = themeLoadedOnce;
    songTitle.innerText = song.title;
    artistName.innerText = song.artist;
    albumArt.style.backgroundImage = song.cover;
    albumArt.style.backgroundSize = "cover";
    audioPlayer.src = song.file;

    if (heroBg) {
        if (!isThemeSwitch || prefersReducedMotion) {
            heroBg.style.backgroundImage = `url('${song.heroBg}')`;
        } else {
            // Crossfade: preload, fade out, swap, fade back to the class opacity
            const swap = () => {
                heroBg.style.backgroundImage = `url('${song.heroBg}')`;
                heroBg.style.opacity = '';
            };
            const img = new Image();
            heroBg.style.opacity = '0';
            img.onload = () => setTimeout(swap, 420);
            img.onerror = swap;
            img.src = song.heroBg;
        }
    }

    // Keep the nav flip control + storage in sync with whichever record is on
    document.querySelectorAll('.theme-flip-side').forEach(el => {
        el.textContent = index === 0 ? 'SIDE A' : 'SIDE B';
    });
    localStorage.setItem('jukebox-side', String(index));
    if (themeLoadedOnce) flashThemeVeil();
    themeLoadedOnce = true;

    const root = document.documentElement;
    root.style.setProperty('--bg-rgb', song.theme.bg);
    root.style.setProperty('--text-rgb', song.theme.text);
    root.style.setProperty('--accent-rgb', song.theme.accent);
    root.style.setProperty('--secondary-rgb', song.theme.secondary);
    root.style.setProperty('--panel-rgb', song.theme.panel);
    root.style.setProperty('--gray-rgb', song.theme.gray);
    root.style.setProperty('--heat-0', song.theme.heat[0]);
    root.style.setProperty('--heat-1', song.theme.heat[1]);
    root.style.setProperty('--heat-2', song.theme.heat[2]);
    root.style.setProperty('--heat-3', song.theme.heat[3]);
    root.style.setProperty('--heat-4', song.theme.heat[4]);
    document.body.dataset.musicTheme = song.artist === 'Deftones' ? 'deftones' : 'oxygen';

    updateFavicon(`rgb(${song.theme.accent})`);
}

function updateFavicon(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="${color}" d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
}

function togglePlay() {
    const icon = playBtn.querySelector('i');
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        musicCard.classList.add('paused');
    } else {
        audioPlayer.play();
        isPlaying = true;
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        musicCard.classList.remove('paused');
    }
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    audioPlayer.play();
    isPlaying = true;
    const icon = playBtn.querySelector('i');
    icon.classList.remove('fa-play');
    icon.classList.add('fa-pause');
    musicCard.classList.remove('paused');

    // Easter eggs
    const song = songs[currentSongIndex];
    showEasterEgg(song.easterEgg);
    console.log(`%c${song.consoleMsg[1]}`, song.consoleMsg[0]);
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    audioPlayer.play();
    isPlaying = true;
    const icon = playBtn.querySelector('i');
    icon.classList.remove('fa-play');
    icon.classList.add('fa-pause');
    musicCard.classList.remove('paused');

    // Easter eggs
    const song = songs[currentSongIndex];
    showEasterEgg(song.easterEgg);
    console.log(`%c${song.consoleMsg[1]}`, song.consoleMsg[0]);
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (isNaN(duration)) return;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
}

audioPlayer.addEventListener('ended', nextSong);
audioPlayer.addEventListener('timeupdate', updateProgress);
progressContainer.addEventListener('click', setProgress);

audioPlayer.addEventListener('error', (e) => {
    console.error("Error loading audio:", audioPlayer.src);
    const icon = playBtn.querySelector('i');
    icon.className = 'fas fa-exclamation-triangle text-red-500';
});

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);

// ── The Jukebox: first visit picks a record; the record is the theme. ──
// No autoplay — music only starts from the visitor's own click on a record.
const jukebox = document.getElementById('jukebox');

function setPlayingState(playing) {
    isPlaying = playing;
    const icon = playBtn.querySelector('i');
    icon.classList.toggle('fa-pause', playing);
    icon.classList.toggle('fa-play', !playing);
    musicCard.classList.toggle('paused', !playing);
}

function dismissJukebox(immediate = false) {
    if (!jukebox || !document.body.contains(jukebox)) {
        startSite();
        return;
    }
    if (immediate || prefersReducedMotion) {
        jukebox.remove();
        startSite();
        return;
    }
    jukebox.classList.add('is-leaving');
    setTimeout(() => {
        jukebox.remove();
        startSite();
    }, 750);
}

function chooseRecord(index, options = {}) {
    const { withMusic = true } = options;
    currentSongIndex = (index + songs.length) % songs.length;
    loadSong(currentSongIndex);

    if (withMusic) {
        audioPlayer.volume = 0.4;
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => setPlayingState(true)).catch(() => setPlayingState(false));
        }
    }

    dismissJukebox();
}

function initJukebox() {
    const savedSide = localStorage.getItem('jukebox-side');

    if (savedSide !== null) {
        // Returning visitor: apply their record quietly, skip the ceremony
        currentSongIndex = (Number(savedSide) || 0) % songs.length;
        loadSong(currentSongIndex);
        dismissJukebox(true);
        return;
    }

    // First visit: the overlay is the loader
    loadSong(currentSongIndex);
    localStorage.removeItem('jukebox-side'); // loadSong persisted a default; first pick should be deliberate

    if (!jukebox) {
        startSite();
        return;
    }

    jukebox.querySelectorAll('[data-jukebox-side]').forEach(button => {
        button.addEventListener('click', () => chooseRecord(Number(button.dataset.jukeboxSide)));
    });

    const skipBtn = document.getElementById('jukebox-skip');
    if (skipBtn) skipBtn.addEventListener('click', () => chooseRecord(0, { withMusic: false }));
}

initJukebox();

// ── Record flip (navbar): swaps theme, keeps the music state as-is ──
function flipRecord() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) audioPlayer.play();

    const song = songs[currentSongIndex];
    showEasterEgg(song.easterEgg);
    console.log(`%c${song.consoleMsg[1]}`, song.consoleMsg[0]);
}

['theme-flip-desktop', 'theme-flip-mobile'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', flipRecord);
});

// ── GitHub Activity Heatmap ──
const GITHUB_USER = 'ensinho';
const HEATMAP_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`;
let heatmapData = null;
let heatTooltip = null;

// Annotate notable weeks with what actually shipped — turns the heatmap from
// decoration into proof-of-work. Dates are ISO (YYYY-MM-DD); fill these in as
// milestones land. Self-aware entries (e.g. "finals week — I'm a student") welcome.
const CONTRIB_STORIES = [
    // { date: '2026-01-12', en: 'QAssistant v1 shipped', pt: 'QAssistant v1 lançado' },
];

const PEAK_MARKER_COUNT = 3;

function getPeakDates(contributions) {
    return contributions
        .filter(item => Number(item.count) > 0)
        .sort((a, b) => Number(b.count) - Number(a.count))
        .slice(0, PEAK_MARKER_COUNT)
        .map(item => item.date);
}

const monthLabels = {
    en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    pt: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
};

const TECH_ICON_BASE = 'https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons';
const techStack = [

    { name: 'TypeScript', label: 'TS', icon: `${TECH_ICON_BASE}/typescript.png` },
    { name: 'JavaScript', label: 'JS', icon: `${TECH_ICON_BASE}/javascript.png` },
    { name: 'Tailwind CSS', label: 'Tailwind', icon: `${TECH_ICON_BASE}/tailwind_css.png` },
    { name: 'React', label: 'React', icon: `${TECH_ICON_BASE}/react.png` },
    { name: 'Angular', label: 'Angular', icon: `${TECH_ICON_BASE}/angular.png` },
    { name: 'Node.js', label: 'Node.js', icon: `${TECH_ICON_BASE}/node_js.png` },
    { name: 'Spring Boot', label: 'Spring Boot', icon: `${TECH_ICON_BASE}/spring_boot.png` },
    { name: 'PostgreSQL', label: 'PostgreSQL', icon: `${TECH_ICON_BASE}/postgresql.png` },
    { name: 'Google Cloud Platform', label: 'GCP', icon: `${TECH_ICON_BASE}/gcp.png` },
];

function countToLevel(count) {
    if (!count) return 0;
    if (count <= 3) return 1;
    if (count <= 8) return 2;
    if (count <= 15) return 3;
    return 4;
}

function buildEmptyWeeks() {
    return Array.from({ length: 52 }, () => Array.from({ length: 7 }, () => null));
}

function buildWeeks(contributions) {
    const days = contributions
        .map(item => ({
            date: new Date(`${item.date}T00:00:00`),
            iso: item.date,
            count: Number(item.count) || 0
        }))
        .sort((a, b) => a.date - b.date);

    if (!days.length) return buildEmptyWeeks();

    while (days[0] && days[0].date.getDay() !== 0) days.unshift(null);
    while (days.length % 7 !== 0) days.push(null);

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return weeks.slice(-52);
}

function formatContributionText(isoDate, count) {
    const locale = currentLang === 'pt' ? 'pt-BR' : 'en-US';
    const date = new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const word = Number(count) === 1
        ? (currentLang === 'pt' ? 'contribuição' : 'contribution')
        : (currentLang === 'pt' ? 'contribuições' : 'contributions');
    const empty = currentLang === 'pt' ? 'Nenhuma contribuição' : 'No contributions';
    return Number(count) > 0 ? `${count} ${word} · ${date}` : `${empty} · ${date}`;
}

function getContributionRange(contributions) {
    if (!contributions.length) return '';
    const first = new Date(`${contributions[0].date}T00:00:00`).getFullYear();
    const last = new Date(`${contributions[contributions.length - 1].date}T00:00:00`).getFullYear();
    return first === last ? String(first) : `${first}-${String(last).slice(2)}`;
}

function renderHeatmap() {
    const grid = document.getElementById('contrib-grid');
    const months = document.getElementById('contrib-months');
    const total = document.getElementById('contrib-total');
    if (!grid || !months || !total) return;

    const contributions = Array.isArray(heatmapData && heatmapData.contributions) ? heatmapData.contributions : [];
    const weeks = contributions.length ? buildWeeks(contributions) : buildEmptyWeeks();
    const gridFragment = document.createDocumentFragment();
    const monthsFragment = document.createDocumentFragment();
    let lastMonth = null;

    const peakDates = new Set(getPeakDates(contributions));
    const storyByDate = new Map(CONTRIB_STORIES.map(story => [story.date, story]));

    weeks.forEach((week, weekIndex) => {
        const visibleDay = week.find(Boolean);
        if (visibleDay && visibleDay.date.getMonth() !== lastMonth) {
            const label = document.createElement('span');
            label.textContent = monthLabels[currentLang][visibleDay.date.getMonth()];
            label.style.gridColumn = String(weekIndex + 1);
            monthsFragment.appendChild(label);
            lastMonth = visibleDay.date.getMonth();
        }

        week.forEach(day => {
            const cell = document.createElement('span');
            const level = day ? countToLevel(day.count) : 0;
            cell.className = 'heat-cell';
            cell.style.setProperty('--cell', `var(--heat-${level})`);
            cell.style.setProperty('--col', String(weekIndex));

            if (day) {
                cell.dataset.date = day.iso;
                cell.dataset.count = String(day.count);

                const story = storyByDate.get(day.iso);
                if (story) {
                    cell.classList.add('has-story');
                    cell.dataset.story = story[currentLang] || story.en;
                }
                if (peakDates.has(day.iso)) {
                    cell.classList.add('is-peak');
                }

                cell.title = formatContributionText(day.iso, day.count) + (cell.dataset.story ? ` — ${cell.dataset.story}` : '');
            } else {
                cell.dataset.empty = '1';
            }

            gridFragment.appendChild(cell);
        });
    });

    grid.replaceChildren(gridFragment);
    months.replaceChildren(monthsFragment);

    if (!contributions.length) {
        total.textContent = '-';
        return;
    }

    const sum = contributions.reduce((acc, item) => acc + (Number(item.count) || 0), 0);
    const totalCount = heatmapData && heatmapData.total && typeof heatmapData.total.lastYear === 'number' ? heatmapData.total.lastYear : sum;
    const word = totalCount === 1
        ? (currentLang === 'pt' ? 'contribuição' : 'contribution')
        : (currentLang === 'pt' ? 'contribuições' : 'contributions');
    total.textContent = `${totalCount} ${word} · ${getContributionRange(contributions)}`;
}

function initHeatmapTooltip() {
    const grid = document.getElementById('contrib-grid');
    if (!grid) return;

    heatTooltip = document.createElement('div');
    heatTooltip.className = 'heat-tooltip';
    document.body.appendChild(heatTooltip);

    const show = (cell) => {
        if (!cell || !cell.dataset.date) return;
        const rect = cell.getBoundingClientRect();
        const storySuffix = cell.dataset.story ? ` — ${cell.dataset.story}` : '';
        heatTooltip.textContent = formatContributionText(cell.dataset.date, cell.dataset.count) + storySuffix;
        heatTooltip.style.left = `${Math.min(window.innerWidth - 80, Math.max(80, rect.left + rect.width / 2))}px`;
        heatTooltip.style.top = `${Math.max(48, rect.top - 8)}px`;
        heatTooltip.classList.add('show');
    };

    const hide = () => heatTooltip.classList.remove('show');
    grid.addEventListener('mouseover', event => show(event.target.closest('.heat-cell')));
    grid.addEventListener('mouseout', hide);
    grid.addEventListener('mouseleave', hide);
}

function loadHeatmap() {
    renderHeatmap();
    fetch(HEATMAP_URL)
        .then(response => {
            if (!response.ok) throw new Error('Heatmap request failed');
            return response.json();
        })
        .then(data => {
            heatmapData = data;
            renderHeatmap();
        })
        .catch(() => {
            heatmapData = null;
            renderHeatmap();
        });
}

function renderTechStack() {
    const container = document.getElementById('tech-icons');
    if (!container) return;

    container.innerHTML = techStack.map((tech, index) => `
        <span class="tech-tile" style="--i:${index}" title="${tech.name}" aria-label="${tech.name}">
            <img src="${tech.icon}" alt="${tech.label}" loading="lazy" decoding="async">
        </span>
    `).join('');
}

// ── About Interest Chips ──
const aboutInterests = [
    {
        id: 'hype-focus',
        label: { en: 'Hype Focus', pt: 'Hype Focus' },
        text: {
            en: '<strong>Pokemon and sharks</strong> are my main hype focus: <strong>Lugia</strong>, <strong>Gengar</strong>, and <strong>Arcanine</strong> for personality and style; <strong>whale sharks</strong> and <strong>hammerheads</strong> for calm scale, sharp silhouettes, and natural design energy.',
            pt: '<strong>Pokemon e tubarões</strong> são meu principal hype focus: <strong>Lugia</strong>, <strong>Gengar</strong> e <strong>Arcanine</strong> por personalidade e estilo; <strong>tubarões-baleia</strong> e <strong>tubarões-martelo</strong> por escala calma, silhuetas marcantes e energia de design natural.'
        }
    },
    {
        id: 'interests',
        label: { en: 'Interests', pt: 'Interesses' },
        text: {
            en: '<strong>Games and anime</strong> keep me close to strategy, pacing, and memorable worlds: <strong>Valorant</strong>, <strong>Elden Ring</strong>, <strong>Attack on Titan</strong>, <strong>Hunter x Hunter</strong>, and <strong>Code Geass</strong>.',
            pt: '<strong>Jogos e animes</strong> me mantêm perto de estratégia, ritmo e mundos memoráveis: <strong>Valorant</strong>, <strong>Elden Ring</strong>, <strong>Attack on Titan</strong>, <strong>Hunter x Hunter</strong> e <strong>Code Geass</strong>.'
        }
    },
    {
        id: 'learning',
        label: { en: 'Learning', pt: 'Aprendizado' },
        text: {
            en: '<strong>Current learning:</strong> building practical <strong>AI automations</strong> with <strong>Claude</strong> and <strong>Gemini</strong>, designing reusable skills, mapping workflow steps, and studying <strong>Chinese / Mandarin</strong> with consistency.',
            pt: '<strong>Aprendizado atual:</strong> criando <strong>automações práticas com IA</strong> usando <strong>Claude</strong> e <strong>Gemini</strong>, desenhando skills reutilizáveis, mapeando etapas de workflow e estudando <strong>chinês / mandarim</strong> com consistência.'
        }
    }
];

let activeAboutInterestId = 'hype-focus';

function renderAboutInterests() {
    const buttons = document.getElementById('about-interest-buttons');
    const text = document.getElementById('about-interest-text');
    if (!buttons || !text) return;

    const activeInterest = aboutInterests.find(interest => interest.id === activeAboutInterestId) || aboutInterests[0];

    buttons.innerHTML = aboutInterests.map(interest => {
        const isActive = interest.id === activeInterest.id;
        return `
            <button
                type="button"
                class="about-interest-chip ${isActive ? 'is-active' : ''}"
                data-about-interest="${interest.id}"
                aria-pressed="${isActive}"
            >
                ${interest.label[currentLang] || interest.label.en}
            </button>
        `;
    }).join('');

    text.innerHTML = activeInterest.text[currentLang] || activeInterest.text.en;

    buttons.querySelectorAll('[data-about-interest]').forEach(button => {
        button.addEventListener('click', () => {
            activeAboutInterestId = button.dataset.aboutInterest;
            renderAboutInterests();
        });
    });
}

// ── Journey Expand/Collapse ──
function toggleJourney(id, btn) {
    const content = document.getElementById(id);
    const icon = btn.querySelector('i');
    const text = btn.querySelector('span');
    const isClosed = content.classList.contains('grid-rows-[0fr]');

    if (isClosed) {
        content.classList.remove('grid-rows-[0fr]', 'opacity-0');
        content.classList.add('grid-rows-[1fr]', 'opacity-100');
        text.textContent = currentLang === 'pt' ? 'Ler Menos' : 'Show Less';
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('grid-rows-[0fr]', 'opacity-0');
        content.classList.remove('grid-rows-[1fr]', 'opacity-100');
        text.textContent = currentLang === 'pt' ? 'Ler Mais' : 'Read More';
        icon.style.transform = 'rotate(0deg)';
    }
}

// ── Featured Projects Spotlight ──
// Order is deliberate: lead with the most professional artifact, then the NDA flagship.
const featuredProjects = [
    {
        id: 'qassistant',
        title: 'QAssistant',
        logo: {
            src: 'assets/icons/qassistant-logo.png',
            alt: 'QAssistant logo'
        },
        description: {
            en: 'QA handoffs died the same death every sprint: evidence in screenshots, context in someone\'s head, tickets somewhere else. QAssistant is a <strong>VS Code extension</strong> that turns selected commits into <strong>traceable validation packages</strong> — AI-written summaries, test prompts, OpenProject tasks, and <em>agent-ready context docs</em>.',
            pt: 'Os handoffs de QA morriam da mesma forma a cada sprint: evidência em screenshots, contexto na cabeça de alguém, tarefas em outro lugar. O QAssistant é uma <strong>extensão do VS Code</strong> que transforma commits selecionados em <strong>pacotes rastreáveis de validação</strong> — resumos escritos por IA, prompts de teste, tarefas no OpenProject e <em>docs de contexto prontos para agentes</em>.'
        },
        narrative: {
            en: {
                problem: 'Commits, evidence, and tickets lived in separate places, so every QA handoff was a back-and-forth thread.',
                decision: 'Generate agent-ready context, not just human summaries — the same package feeds the QA analyst and the automation that pre-checks the build.',
                outcome: 'A handoff that took a thread now takes one command, with traceability for free.'
            },
            pt: {
                problem: 'Commits, evidências e tarefas viviam em lugares separados — cada handoff de QA virava uma thread de ida e volta.',
                decision: 'Gerar contexto pronto para agentes, não só resumos humanos — o mesmo pacote alimenta o analista de QA e a automação que pré-valida a build.',
                outcome: 'Um handoff que custava uma thread agora custa um comando, com rastreabilidade de graça.'
            }
        },
        technologies: ['TypeScript', 'VS Code API', 'React', 'Vite', 'OpenProject', 'AI'],
        images: [
            {
                src: 'assets/projectCovers/qassistant/qassistant0.jpeg',
                alt: 'QAssistant dashboard with telemetry and validation actions',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Dashboard: telemetry and validation actions inside the editor — not another browser tab.',
                    pt: 'Dashboard: telemetria e ações de validação dentro do editor — não em mais uma aba do navegador.'
                }
            },
            {
                src: 'assets/projectCovers/qassistant/QASSISTANT1.jpeg',
                alt: 'QAssistant guided onboarding setup screen',
                fit: 'contain',
                position: 'center top',
                caption: {
                    en: 'Guided onboarding — zero-config start, built for QA folks who don\'t live in settings files.',
                    pt: 'Onboarding guiado — começa sem configuração, feito para quem não vive em arquivos de settings.'
                }
            },
            {
                src: 'assets/projectCovers/qassistant/qassistant2.jpeg',
                alt: 'QAssistant commit selection workflow for validation packages',
                fit: 'contain',
                position: 'center top',
                caption: {
                    en: 'Pick commits, get a traceable validation package — the core loop in one screen.',
                    pt: 'Selecione commits, receba um pacote de validação rastreável — o loop central em uma tela.'
                }
            },
            {
                src: 'assets/projectCovers/qassistant/qassistant3.jpeg',
                alt: 'QAssistant tests and artifacts runner screen',
                fit: 'contain',
                position: 'center top',
                caption: {
                    en: 'Test runner with artifacts attached straight to the evidence trail.',
                    pt: 'Runner de testes com artefatos anexados direto à trilha de evidências.'
                }
            }
        ],
        links: {
            github: 'https://github.com/ensinho/QAssistant'
        }
    },
    {
        id: 'medical-platform',
        title: 'AI Medical Platform',
        logo: null,
        locked: true,
        status: {
            en: 'NDA · In active development',
            pt: 'NDA · Em desenvolvimento ativo'
        },
        description: {
            en: 'The project I lead at Colégio Christus: an <strong>AI-assisted medical platform</strong> that supports doctors before, during, and after consultations. Under NDA — so no screenshots — but here\'s what I can tell you.',
            pt: 'O projeto que eu lidero no Colégio Christus: uma <strong>plataforma médica assistida por IA</strong> que apoia médicos antes, durante e depois das consultas. Sob NDA — então sem screenshots — mas aqui está o que posso contar.'
        },
        narrative: {
            en: {
                problem: 'Clinical decision-making runs on scattered records and zero tooling built for the consultation itself.',
                decision: 'Own the whole surface — design system, React front-end, Node/PostgreSQL back-end, AI automations — so the product speaks one language.',
                outcome: 'Promoted to project lead to run it: team, architecture, and delivery from vision to deployment.'
            },
            pt: {
                problem: 'A decisão clínica roda sobre registros espalhados e zero ferramentas pensadas para a própria consulta.',
                decision: 'Assumir a superfície inteira — design system, front-end em React, back-end em Node/PostgreSQL, automações com IA — para o produto falar uma língua só.',
                outcome: 'Promovido a líder de projeto para tocá-lo: time, arquitetura e entrega da visão ao deploy.'
            }
        },
        technologies: ['React', 'Node.js', 'PostgreSQL', 'AI Automation'],
        images: [],
        links: {}
    },
    {
        id: 'pokemon-team-builder',
        title: 'Pokémon Team Builder',
        logo: {
            src: 'assets/icons/teamBuilderLogo.png',
            alt: 'Pokémon Team Builder logo'
        },
        description: {
            en: 'Competitive team building lives across five tabs — a Pokédex site, a coverage calculator, Showdown, a spreadsheet, Discord. This workspace <strong>collapses it into one</strong>: a trainer dashboard, <strong>type-coverage analysis</strong>, a full Pokédex, memory quizzes, and <em>Showdown-ready export</em>.',
            pt: 'Montar times competitivos vive espalhado em cinco abas — um site de Pokédex, uma calculadora de cobertura, o Showdown, uma planilha, o Discord. Este workspace <strong>colapsa tudo em um</strong>: dashboard de treinador, <strong>análise de cobertura de tipos</strong>, Pokédex completa, quizzes de memória e <em>exportação pronta para o Showdown</em>.'
        },
        narrative: {
            en: {
                problem: 'The flow from "team idea" to "importable team" was scattered across tools that don\'t talk to each other.',
                decision: 'Team analysis lives beside the builder, always on — coverage is the question players are actually asking, so it never hides in a tab.',
                outcome: 'Zero-tab-switch flow from idea to battle-ready export.'
            },
            pt: {
                problem: 'O caminho de "ideia de time" até "time importável" estava espalhado em ferramentas que não conversam entre si.',
                decision: 'A análise do time vive ao lado do builder, sempre visível — cobertura é a pergunta que os jogadores realmente fazem, então ela nunca se esconde em uma aba.',
                outcome: 'Fluxo sem troca de aba, da ideia à exportação pronta para batalha.'
            }
        },
        technologies: ['React', 'JavaScript', 'Tailwind', 'Firebase', 'PokéAPI'],
        images: [
            {
                src: 'assets/projectCovers/pokemon/PokeHome.png',
                alt: 'Pokemon Team Builder home dashboard greeting the trainer with their active team',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Trainer dashboard — your active team and its identity greet you, not a menu.',
                    pt: 'Dashboard do treinador — seu time ativo e a identidade dele te recebem, não um menu.'
                }
            },
            {
                src: 'assets/projectCovers/pokemon/PokeTeamBuilder.png',
                alt: 'Team Builder screen with live offensive and defensive type analysis',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Builder with always-on team analysis — coverage and defensive gaps update as you slot each Pokémon.',
                    pt: 'Builder com análise sempre visível — cobertura e brechas defensivas atualizam a cada Pokémon no slot.'
                }
            },
            {
                src: 'assets/projectCovers/pokemon/Pokedex.png',
                alt: 'Pokedex screen with base stats, evolution line, and type defenses',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Pokédex detail: base stats, evolution line, and type defenses in one panel — no tab-hopping.',
                    pt: 'Detalhe da Pokédex: stats base, linha evolutiva e defesas de tipo em um painel — sem pular de aba.'
                }
            },
            {
                src: 'assets/projectCovers/pokemon/PokeQuiz.png',
                alt: 'Generation Quiz screen where players name every Pokemon from memory',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Generation Quiz — name every Pokémon from memory, generation by generation, against the clock.',
                    pt: 'Generation Quiz — nomeie cada Pokémon de memória, geração por geração, contra o relógio.'
                }
            }
        ],
        links: {
            demo: 'https://ensinho.github.io/pokemonTeamBuilder/',
            github: 'https://github.com/ensinho/pokemonTeamBuilder'
        }
    },
    {
        id: 'dino-library',
        title: 'Dino Library',
        logo: {
            src: 'assets/icons/dinoLibraryLogo.png',
            alt: 'Dino Library logo'
        },
        description: {
            en: 'Paleontology online is either academic PDFs or kids\' content. <strong>Dino Library is the in-between</strong>: a scientific catalog with <strong>fossil maps, timelines, and quizzes</strong>, in two languages, with imagery enriched from external APIs — an <em>editorial exploration experience</em>.',
            pt: 'Paleontologia online é ou PDF acadêmico ou conteúdo infantil. A <strong>Dino Library é o meio-termo</strong>: um catálogo científico com <strong>mapas fósseis, linhas do tempo e quizzes</strong>, em dois idiomas, com imagens enriquecidas por APIs externas — uma <em>experiência editorial de exploração</em>.'
        },
        narrative: {
            en: {
                problem: 'Prehistoric data is fragmented and flat — built to be queried, not explored.',
                decision: 'An editorial layout (read, explore, drift) instead of a database UI (filter, sort, leave). The content is the retention mechanic.',
                outcome: 'A catalog people browse like a magazine — and keep browsing.'
            },
            pt: {
                problem: 'Dados pré-históricos são fragmentados e planos — feitos para consultar, não para explorar.',
                decision: 'Um layout editorial (ler, explorar, vagar) em vez de UI de banco de dados (filtrar, ordenar, sair). O conteúdo é a mecânica de retenção.',
                outcome: 'Um catálogo que as pessoas folheiam como revista — e continuam folheando.'
            }
        },
        technologies: ['React', 'TypeScript', 'Tailwind', 'Firebase', 'Leaflet', 'i18next'],
        images: [
            {
                src: 'assets/projectCovers/dino/Home1.png',
                alt: 'Dino Library home screen',
                fit: 'cover',
                caption: {
                    en: 'Editorial home — the layout invites drift, not queries.',
                    pt: 'Home editorial — o layout convida a vagar, não a consultar.'
                }
            },
            {
                src: 'assets/projectCovers/dino/DinoCatalog.png',
                alt: 'Dino Library catalog screen',
                fit: 'cover',
                caption: {
                    en: 'Catalog with scientific filters that stay readable for non-scientists.',
                    pt: 'Catálogo com filtros científicos que continuam legíveis para não-cientistas.'
                }
            },
            {
                src: 'assets/projectCovers/dino/DinoDetail1.png',
                alt: 'Dino Library species detail screen',
                fit: 'cover',
                caption: {
                    en: 'Species pages layer facts, era, and habitat into one scroll.',
                    pt: 'Páginas de espécies sobrepõem fatos, era e habitat em um único scroll.'
                }
            },
            {
                src: 'assets/projectCovers/dino/DinoDetail2.png',
                alt: 'Dino Library species detail screen, second view',
                fit: 'cover',
                caption: {
                    en: 'Detail continues: imagery enriched from external APIs keeps pages alive.',
                    pt: 'O detalhe continua: imagens enriquecidas por APIs externas mantêm as páginas vivas.'
                }
            },
            {
                src: 'assets/projectCovers/dino/DinoMap.png',
                alt: 'Dino Library fossil map screen',
                fit: 'cover',
                caption: {
                    en: 'Fossil map — discoveries plotted where they were actually dug up.',
                    pt: 'Mapa fóssil — descobertas plotadas onde foram realmente escavadas.'
                }
            },
            {
                src: 'assets/projectCovers/dino/Quiz.png',
                alt: 'Dino Library quiz screen',
                fit: 'cover',
                caption: {
                    en: 'Quizzes close the loop from reading to remembering.',
                    pt: 'Quizzes fecham o ciclo entre ler e lembrar.'
                }
            }
        ],
        links: {
            demo: 'https://dino-library.vercel.app/',
            github: 'https://github.com/ensinho/dino-library'
        }
    },
    {
        id: 'aqua-census',
        title: 'AquaCensus',
        logo: {
            src: 'assets/icons/fish.svg',
            alt: 'AquaCensus logo'
        },
        description: {
            en: 'Marine field research runs on paper forms and personal spreadsheets, so specimen metadata gets orphaned from the people, vessels, and labs that produced it. <strong>AquaCensus connects all of it</strong> — collections, researchers, permissions, and <em>operational dashboards</em>.',
            pt: 'Pesquisa marinha de campo roda em formulários de papel e planilhas pessoais — os metadados de espécimes ficam órfãos das pessoas, embarcações e laboratórios que os produziram. O <strong>AquaCensus conecta tudo</strong> — coletas, pesquisadores, permissões e <em>dashboards operacionais</em>.'
        },
        narrative: {
            en: {
                problem: 'Research records lose trust when metadata, people, and collection context are disconnected.',
                decision: 'Model provenance as first-class data — who collected what, from which vessel, for which lab.',
                outcome: 'Field records a lab can actually audit, favorite, and report on.'
            },
            pt: {
                problem: 'Registros de pesquisa perdem confiança quando metadados, pessoas e contexto da coleta estão desconectados.',
                decision: 'Modelar proveniência como dado de primeira classe — quem coletou o quê, de qual embarcação, para qual laboratório.',
                outcome: 'Registros de campo que um laboratório consegue auditar, favoritar e reportar de verdade.'
            }
        },
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Supabase', 'Tailwind'],
        images: [
            {
                src: 'assets/projectCovers/aqua/defaultCoverAqua.jpeg',
                alt: 'AquaCensus marine research dashboard cover',
                fit: 'contain',
                position: 'center',
                caption: {
                    en: 'Operational dashboard — collections, people, and vessels in one ledger.',
                    pt: 'Dashboard operacional — coletas, pessoas e embarcações em um único registro.'
                }
            }
        ],
        links: {
            demo: 'https://pesquisa-maritima.vercel.app/',
            github: 'https://github.com/ensinho/pesquisaMaritima'
        }
    }
];

const featuredProjectLinks = {
    demo: {
        icon: 'fas fa-arrow-up-right-from-square',
        className: 'is-primary',
        labelKey: 'featuredWork.viewDemo'
    },
    github: {
        icon: 'fab fa-github',
        className: '',
        labelKey: 'featuredWork.viewGithub'
    },
    caseStudy: {
        icon: 'fas fa-file-lines',
        className: '',
        labelKey: 'featuredWork.viewCaseStudy'
    }
};

const featuredProjectState = {
    activeProjectIndex: 0,
    activeImageIndex: 0
};

function getFeaturedProjectElements() {
    return {
        switcher: document.getElementById('featured-project-switcher'),
        stage: document.getElementById('featured-project-stage')
    };
}

function getFeaturedProjectCopy() {
    const activeTranslations = translations[currentLang] || translations.en;
    return {
        stack: activeTranslations['featuredWork.stack'],
        links: activeTranslations['featuredWork.links'],
        preview: activeTranslations['featuredWork.preview'],
        screens: activeTranslations['featuredWork.screens'],
        singleView: activeTranslations['featuredWork.singleView'],
        viewDemo: activeTranslations['featuredWork.viewDemo'],
        viewGithub: activeTranslations['featuredWork.viewGithub'],
        viewCaseStudy: activeTranslations['featuredWork.viewCaseStudy']
    };
}

function getFeaturedProjectDescription(project) {
    if (!project || !project.description) return '';
    return project.description[currentLang] || project.description.en || '';
}

function getFeaturedProjectNarrative(project) {
    if (!project || !project.narrative) return null;
    return project.narrative[currentLang] || project.narrative.en || null;
}

function getFeaturedProjectLogoMarkup(project, variant) {
    const wrapperClass = variant === 'switcher' ? 'featured-project-switch-icon' : 'featured-project-logo-wrap';

    if (project && project.locked) {
        return `
            <span class="${wrapperClass} is-locked">
                <i class="fas fa-lock"></i>
            </span>
        `;
    }

    if (!project || !project.logo || !project.logo.src) return '';

    const imageClass = variant === 'switcher' ? 'featured-project-switch-logo' : 'featured-project-logo';

    return `
        <span class="${wrapperClass}">
            <img class="${imageClass}" src="${project.logo.src}" alt="${project.logo.alt}">
        </span>
    `;
}

function buildFeaturedProjectSwitcher() {
    return `
        <div class="featured-project-switcher" role="tablist" aria-label="Featured projects">
            ${featuredProjects.map((project, index) => {
        const isActive = index === featuredProjectState.activeProjectIndex;

        return `
            <button
                type="button"
                class="featured-project-switch-btn ${isActive ? 'is-active' : ''}"
                data-featured-project-index="${index}"
                aria-pressed="${isActive}"
            >
                ${getFeaturedProjectLogoMarkup(project, 'switcher')}
                <span class="featured-project-switch-copy">
                    <span class="featured-project-switch-title">${project.title}</span>
                </span>
            </button>
        `;
    }).join('')}
        </div>
    `;
}

function renderFeaturedProjectSwitcher() {
    const { switcher } = getFeaturedProjectElements();
    if (!switcher) return;

    switcher.innerHTML = buildFeaturedProjectSwitcher();

    switcher.querySelectorAll('[data-featured-project-index]').forEach(button => {
        button.addEventListener('click', () => {
            selectFeaturedProject(Number(button.dataset.featuredProjectIndex));
        });
    });
}

function buildFeaturedProjectLinks(project) {
    if (!project || !project.links) return '';

    const copy = getFeaturedProjectCopy();
    const orderedLinks = ['demo', 'github', 'caseStudy']
        .filter(type => project.links[type])
        .map(type => {
            const linkMeta = featuredProjectLinks[type];
            const label = copy[linkMeta.labelKey.replace('featuredWork.', '')] || translations[currentLang][linkMeta.labelKey];

            return `
                <a
                    href="${project.links[type]}"
                    target="_blank"
                    rel="noreferrer"
                    class="featured-project-link ${linkMeta.className}" 
                >
                    <i class="${linkMeta.icon} text-[12px]"></i>
                    <span>${label}</span>
                </a>
            `;
        });

    if (!orderedLinks.length) return '';

    return `
        <div class="featured-project-section">
            <p class="featured-project-section-label">${copy.links}</p>
            <div class="featured-project-link-list">${orderedLinks.join('')}</div>
        </div>
    `;
}

function buildFeaturedProjectNarrative(project) {
    const narrative = getFeaturedProjectNarrative(project);
    if (!narrative) return '';

    const activeTranslations = translations[currentLang] || translations.en;
    const items = [
        { label: activeTranslations['featuredWork.problem'], text: narrative.problem },
        { label: activeTranslations['featuredWork.decision'], text: narrative.decision },
        { label: activeTranslations['featuredWork.outcome'], text: narrative.outcome }
    ].filter(item => item.text);

    if (!items.length) return '';

    return `
        <div class="featured-project-narrative">
            ${items.map(item => `
                <div class="featured-project-narrative-item">
                    <span class="featured-project-narrative-label">${item.label}</span>
                    <p>${item.text}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function ensureFeaturedImageModal() {
    let modal = document.getElementById('featured-image-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'featured-image-modal';
    modal.className = 'featured-image-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="featured-image-modal-backdrop" data-featured-modal-close></div>
        <div class="featured-image-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="featured-image-modal-title">
            <div class="featured-image-modal-header">
                <div>
                    <p class="featured-image-modal-kicker" id="featured-image-modal-kicker"></p>
                    <h3 class="featured-image-modal-title" id="featured-image-modal-title"></h3>
                </div>
                <button type="button" class="featured-image-modal-close" data-featured-modal-close aria-label="Close image preview">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>
            <div class="featured-image-modal-media">
                <img id="featured-image-modal-img" src="" alt="">
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('[data-featured-modal-close]').forEach(element => {
        element.addEventListener('click', closeFeaturedImageModal);
    });

    return modal;
}

function openFeaturedImageModal() {
    const project = featuredProjects[featuredProjectState.activeProjectIndex];
    const image = project && project.images ? project.images[featuredProjectState.activeImageIndex] : null;
    if (!project || !image) return;

    const modal = ensureFeaturedImageModal();
    const imageElement = modal.querySelector('#featured-image-modal-img');
    const titleElement = modal.querySelector('#featured-image-modal-title');
    const kickerElement = modal.querySelector('#featured-image-modal-kicker');
    const closeButton = modal.querySelector('.featured-image-modal-close');

    imageElement.src = image.src;
    imageElement.alt = image.alt;
    titleElement.textContent = project.title;
    kickerElement.textContent = `${String(featuredProjectState.activeImageIndex + 1).padStart(2, '0')} / ${String(project.images.length).padStart(2, '0')}`;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    closeButton.focus();
}

function closeFeaturedImageModal() {
    const modal = document.getElementById('featured-image-modal');
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function buildFeaturedProjectMedia(project) {
    const activeTranslations = translations[currentLang] || translations.en;

    if (project.locked) {
        return `
            <div class="featured-project-media-shell is-single-image">
                <div class="featured-project-primary featured-project-locked" aria-label="${activeTranslations['featuredWork.lockedTitle']}">
                    <div class="featured-locked-bars" aria-hidden="true">
                        <span style="--w: 72%"></span>
                        <span style="--w: 54%"></span>
                        <span style="--w: 84%"></span>
                        <span style="--w: 38%"></span>
                        <span style="--w: 64%"></span>
                    </div>
                    <div class="featured-locked-inner">
                        <i class="fas fa-lock"></i>
                        <p class="featured-locked-title">${activeTranslations['featuredWork.lockedTitle']}</p>
                        <p class="featured-locked-sub">${activeTranslations['featuredWork.lockedSub']}</p>
                    </div>
                </div>
            </div>
        `;
    }

    featuredProjectState.activeImageIndex = Math.min(featuredProjectState.activeImageIndex, project.images.length - 1);

    const activeImage = project.images[featuredProjectState.activeImageIndex];
    const hasMultipleImages = project.images.length > 1;
    const featuredPosition = activeImage.position || 'center';
    const caption = activeImage.caption ? (activeImage.caption[currentLang] || activeImage.caption.en) : '';

    return `
        <div class="featured-project-media-shell ${hasMultipleImages ? '' : 'is-single-image'}">
            <div class="featured-project-primary">
                <img class="featured-project-primary-image" src="${activeImage.src}" alt="${activeImage.alt}" style="--featured-fit: cover; --featured-position: ${featuredPosition};">
                <button type="button" class="featured-project-expand-btn" data-featured-expand aria-label="${activeTranslations['featuredWork.expandImage'] || 'Expand image'}">
                    <i class="fas fa-up-right-and-down-left-from-center"></i>
                    <span>${activeTranslations['featuredWork.expandImage'] || 'Expand'}</span>
                </button>
            </div>

            ${caption ? `
                <p class="featured-project-caption">
                    <span class="featured-project-caption-index">${String(featuredProjectState.activeImageIndex + 1).padStart(2, '0')}</span>
                    <span>${caption}</span>
                </p>
            ` : ''}

            ${hasMultipleImages ? `
                <div class="featured-project-thumbs">
                    ${project.images.map((image, index) => `
                        <button
                            type="button"
                            class="featured-project-thumb ${index === featuredProjectState.activeImageIndex ? 'is-active' : ''}"
                            data-featured-image-index="${index}"
                            aria-pressed="${index === featuredProjectState.activeImageIndex}"
                        >
                            <span class="featured-project-thumb-index">${String(index + 1).padStart(2, '0')}</span>
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function renderFeaturedProjectStage() {
    const { stage } = getFeaturedProjectElements();
    if (!stage) return;

    const project = featuredProjects[featuredProjectState.activeProjectIndex];
    if (!project || (!project.locked && (!project.images || !project.images.length))) {
        stage.innerHTML = '';
        return;
    }

    const copy = getFeaturedProjectCopy();
    const linkMarkup = buildFeaturedProjectLinks(project);
    const narrativeMarkup = buildFeaturedProjectNarrative(project);
    const statusMarkup = project.status
        ? `<span class="featured-project-stat">${project.status[currentLang] || project.status.en}</span>`
        : '';

    stage.innerHTML = `
        <div class="featured-project-layout">
            ${buildFeaturedProjectMedia(project)}

            <div class="featured-project-panel">
                <div class="featured-project-panel-top">
                    <div class="featured-project-heading">
                        ${getFeaturedProjectLogoMarkup(project, 'panel')}
                        <div>
                            <p class="font-mono text-[11px] tracking-[0.22em] uppercase text-gray/65 mb-3">${String(featuredProjectState.activeProjectIndex + 1).padStart(2, '0')} / ${String(featuredProjects.length).padStart(2, '0')}</p>
                            <h3 class="featured-project-title">${project.title}</h3>
                        </div>
                    </div>
                    ${statusMarkup}
                </div>

                <p class="featured-project-description">${getFeaturedProjectDescription(project)}</p>

                ${narrativeMarkup}

                <div class="featured-project-section">
                    <p class="featured-project-section-label">${copy.stack}</p>
                    <div class="featured-project-tech">
                        ${project.technologies.map(technology => `<span class="project-tag">${technology}</span>`).join('')}
                    </div>
                </div>

                ${linkMarkup}
            </div>
        </div>
    `;

    stage.querySelectorAll('[data-featured-image-index]').forEach(button => {
        button.addEventListener('click', () => {
            selectFeaturedImage(Number(button.dataset.featuredImageIndex));
        });
    });

    const expandButton = stage.querySelector('[data-featured-expand]');
    if (expandButton) {
        expandButton.addEventListener('click', openFeaturedImageModal);
    }
}

function renderFeaturedProjects() {
    const { switcher, stage } = getFeaturedProjectElements();
    if (!switcher || !stage) return;

    renderFeaturedProjectSwitcher();
    renderFeaturedProjectStage();
}

function selectFeaturedProject(index) {
    if (!featuredProjects.length) return;

    const normalizedIndex = (index + featuredProjects.length) % featuredProjects.length;

    featuredProjectState.activeProjectIndex = normalizedIndex;
    featuredProjectState.activeImageIndex = 0;
    renderFeaturedProjects();
}

function selectFeaturedImage(index) {
    const project = featuredProjects[featuredProjectState.activeProjectIndex];
    if (!project || !project.images || index < 0 || index >= project.images.length) return;

    featuredProjectState.activeImageIndex = index;
    renderFeaturedProjectStage();
}

function initFeaturedProjects() {
    const { switcher, stage } = getFeaturedProjectElements();
    if (!switcher || !stage) return;

    renderFeaturedProjects();
}

// ── Translation System ──
const translations = {
    en: {
        // Nav
        "nav.about": "About",
        "nav.projects": "Work",
        "nav.journey": "Trajectory",
        "nav.contact": "Contact",
        // Hero
        "hero.available": "Open to work",
        "hero.location": "Fortaleza, BR",
        "hero.headline1": "I build interfaces",
        "hero.headline2": "for messy work.",
        "hero.description": "Doctors deciding under pressure. QA teams chasing commits. Researchers drowning in field data. I turn workflows like these into <span class=\"text-accent font-medium\">software people actually want to open</span> — frontend-led, fullstack, AI in the loop. <span class=\"text-text\">Started as the intern in 2024; leading the project in 2026.</span>",
        "hero.viewProjects": "VIEW SELECTED WORK",
        "hero.resume": "DOWNLOAD CV",
        "hero.scroll": "Scroll",
        "hero.role": "Project Lead · AI Medical Platform",
        "hero.subrole": "Project Lead @ Colégio Christus",
        "hero.tl1": "2024 · Intern",
        "hero.tl2": "2025 · Fullstack Dev",
        "hero.tl3": "2026 · Project Lead",
        // Jukebox
        "jukebox.kicker": "ENZO.DEV — THE JUKEBOX",
        "jukebox.title1": "Pick a record.",
        "jukebox.title2": "The record is the theme.",
        "jukebox.moodA": "deep blue",
        "jukebox.moodB": "ink on bone",
        "jukebox.skip": "skip — keep it quiet",
        // About
        "about.label": "About",
        "about.title1": "The interface is",
        "about.title2": "the product.",
        "about.offCode": "About the Developer",
        "about.title": "Enzo Esmeraldo",
        "about.description": "I went from <strong>intern to project leader in 21 months</strong>, and I think the reason is simple: I treat the interface as the product, not the paint. Whether it's an AI platform helping doctors make clinical decisions or a VS Code extension that packages commits into QA evidence, the job is the same — <strong>find the part of the workflow everyone quietly hates, and make it obvious</strong>.",
        "about.bio2": "I lead a team now — architecture, design system, Git strategy, mentoring. I still <strong>ship UI every week</strong>, because a lead who stops shipping stops being trusted.",
        "about.avatarJoke": "btw, that's me",
        "about.interests.label": "Interests",
        "about.interests.title": "Outside the editor",
        "about.funfact.label": "Fun Fact",
        "about.funfact.title": "Fav. Pokémon is Lugia",
        "about.funfact.desc": "Psychic-type elegance, legendary rarity — basically my design philosophy wrapped in a Pokémon.",
        "about.current.label": "Currently Building",
        "about.current.desc": "An AI-powered medical platform that helps doctors make better clinical decisions — team, architecture, design system, <strong>AI automations</strong>, all of it. Full detail in <a href=\"#work\" class=\"text-accent underline underline-offset-4\">Work</a>, minus what the NDA eats.",
        "about.current.status": "In active development",
        "about.downloadCV": "DOWNLOAD CV",
        // Work
        "work.label": "Portfolio",
        "work.title1": "My",
        "work.title2": "Work.",
        "work.subtitle": "Every project here is the same move: take work scattered across tabs, spreadsheets, and tribal knowledge — and give it one legible interface.",
        "featuredWork.label": "Featured Project",
        "featuredWork.subtitle": "A spotlighted case study with a presentation-style gallery, longer project context, and quick switching between featured builds.",
        "featuredWork.stack": "Tech Stack",
        "featuredWork.links": "Project Links",
        "featuredWork.preview": "Project Preview",
        "featuredWork.screens": "screens",
        "featuredWork.singleView": "Single view",
        "featuredWork.viewGithub": "GitHub",
        "featuredWork.viewDemo": "Website",
        "featuredWork.viewCaseStudy": "Case Study",
        "featuredWork.expandImage": "Expand",
        "featuredWork.problem": "Problem",
        "featuredWork.decision": "Decision that mattered",
        "featuredWork.outcome": "Outcome",
        "featuredWork.lockedTitle": "NDA — screenshots withheld",
        "featuredWork.lockedSub": "The work is real; the pixels are classified.",
        "projects.visitGithub": "Explore more on GitHub",
        // Journey
        "journey.subtitle": "Career Path",
        "journey.the": "Professional",
        "journey.title": "Journey.",
        "journey.role0": "Project Leader",
        "journey.date0": "Jan. 2026 — Present",
        "journey.status0": "Current · React + Node.js + PostgreSQL",
        "journey.desc0": "Promoted <strong>within the same company</strong> to <strong>Project Leader</strong>, evolving from hands-on delivery into <strong>team leadership</strong>, architecture direction, and product ownership from vision to deployment.",
        "journey.role0.item1": "<strong>Leading the end-to-end development</strong> of an AI-assisted medical platform that powers clinical decision-making for doctors",
        "journey.role0.item2": "<strong>Designing and owning</strong> the entire visual identity, component library, and UI/UX of the platform from scratch",
        "journey.role0.item3": "<strong>Architecting the full-stack solution</strong> with React, Node.js, and PostgreSQL, ensuring scalability and maintainability",
        "journey.role0.item4": "Managing version control strategy, Git workflows, and technical documentation across the team",
        "journey.role0.item5": "Mentoring team members on best practices, code quality standards, and modern development patterns",
        "journey.role0.item6": "Responsible for all project deliverables — from interface design to system architecture to deployment pipeline",
        "journey.role0.item7": "<strong>Creating and participating in AI automations and workflow design</strong> for medical consultations and agile development routines",
        "journey.role1": "FullStack Developer",
        "journey.date1": "Jan. 2025 — Dec. 2025",
        "journey.status1": "Completed · Angular + Spring",
        "journey.desc1": "Advanced <strong>within the same company</strong> to a <strong>FullStack Developer</strong> role, expanding that earlier foundation into <strong>system architecture</strong>, UI/UX decisions, and growing technical leadership.",
        "journey.readMore": "Read More",
        "journey.achievements": "Key Achievements",
        "journey.role1.item1": "<strong>Developed the Exitus system end-to-end</strong>, working on front-end, back-end, and databases, focusing on scalability and performance",
        "journey.role1.item2": "Designed the system's visual identity and created user interfaces, ensuring consistency in the user experience (UI/UX)",
        "journey.role1.item3": "<strong>Architected and implemented the front-end</strong> using Angular and TypeScript, applying best practices for componentization and responsiveness",
        "journey.role1.item4": "Assisted in defining and building the back-end architecture with Spring Boot, including database integrations and external services",
        "journey.role1.item5": "<strong>Implemented AI integrations</strong>, automating question validation and improving the educational experience",
        "journey.role1.item6": "Integrated webhooks and deployed cloud-based solutions (Source Cloud) for continuous system deployment and maintenance",
        "journey.role1.item7": "Worked under Agile Scrum methodology, actively participating in planning, reviews, and retrospectives",
        "journey.role2": "FullStack Intern",
        "journey.date2": "Apr. 2024 — Dec. 2024",
        "journey.status2": "Completed · Angular + Spring",
        "journey.desc2": "Started my professional journey as a <strong>FullStack Intern</strong>, contributing to system development and building the base that later evolved into broader engineering ownership.",
        "journey.role2.item1": "<strong>Contributed to the development and improvement</strong> of Exitus system interfaces, focusing on usability and accessibility",
        "journey.role2.item2": "Assisted in creating user flows and interface design, collaborating closely with the UI/UX team",
        "journey.role2.item3": "<strong>Participated in front-end development</strong> using Angular, TypeScript, and CSS, and supported the back-end with Spring Boot",
        "journey.role2.item4": "<strong>Gained hands-on experience</strong> with full-stack development in a professional environment",
        "journey.role2.item5": "Learned Agile development methodologies and team collaboration practices",
        // Footer
        "footer.label": "Get In Touch",
        "footer.title1": "Let's build something",
        "footer.title2": "people actually use.",
        "footer.copyright": "&copy; 2026 Enzo Esmeraldo",
        "footer.credits": "Crafted with <i class=\"fas fa-heart text-accent/40 animate-pulse text-[8px]\"></i> in Brazil",
        // Heatmap / Tech
        "contrib.label": "Contribution Activity",
        "contrib.less": "Less",
        "contrib.more": "More",
        "tech.label": "Core Stack",
        // Music
        "music.hint": "Flip the record — the theme follows"
    },
    pt: {
        // Nav
        "nav.about": "Sobre",
        "nav.projects": "Trabalhos",
        "nav.journey": "Trajetória",
        "nav.contact": "Contato",
        // Hero
        "hero.available": "Aberto a trabalho",
        "hero.location": "Fortaleza, BR",
        "hero.headline1": "Eu construo interfaces",
        "hero.headline2": "para trabalho bagunçado.",
        "hero.description": "Médicos decidindo sob pressão. Times de QA caçando commits. Pesquisadores afogados em dados de campo. Eu transformo fluxos assim em <span class=\"text-accent font-medium\">software que as pessoas realmente querem abrir</span> — frontend na frente, fullstack por inteiro, IA no circuito. <span class=\"text-text\">Entrei como estagiário em 2024; lidero o projeto em 2026.</span>",
        "hero.viewProjects": "VER TRABALHOS",
        "hero.resume": "BAIXAR CV",
        "hero.scroll": "Role",
        "hero.role": "Líder de Projeto · Plataforma Médica com IA",
        "hero.subrole": "Líder de Projeto @ Colégio Christus",
        "hero.tl1": "2024 · Estágio",
        "hero.tl2": "2025 · Dev Fullstack",
        "hero.tl3": "2026 · Líder de Projeto",
        // Jukebox
        "jukebox.kicker": "ENZO.DEV — A JUKEBOX",
        "jukebox.title1": "Escolha um disco.",
        "jukebox.title2": "O disco é o tema.",
        "jukebox.moodA": "azul profundo",
        "jukebox.moodB": "tinta no osso",
        "jukebox.skip": "pular — sem som",
        // About
        "about.label": "Sobre",
        "about.title1": "A interface é",
        "about.title2": "o produto.",
        "about.offCode": "Sobre o Desenvolvedor",
        "about.title": "Enzo Esmeraldo",
        "about.description": "Fui de <strong>estagiário a líder de projeto em 21 meses</strong>, e acho que o motivo é simples: trato a interface como o produto, não como a pintura. Seja uma plataforma de IA ajudando médicos em decisões clínicas ou uma extensão do VS Code que empacota commits em evidências de QA, o trabalho é o mesmo — <strong>encontrar a parte do fluxo que todo mundo odeia em silêncio e torná-la óbvia</strong>.",
        "about.bio2": "Hoje lidero um time — arquitetura, design system, estratégia de Git, mentoria. E continuo <strong>entregando UI toda semana</strong>, porque líder que para de entregar para de ser confiável.",
        "about.avatarJoke": "e sim, esse sou eu",
        "about.interests.label": "Interesses",
        "about.interests.title": "Fora do editor",
        "about.funfact.label": "Curiosidade",
        "about.funfact.title": "Pokémon Fav. é Lugia",
        "about.funfact.desc": "Elegância do tipo Psíquico, raridade lendária — basicamente minha filosofia de design em forma de Pokémon.",
        "about.current.label": "Em Desenvolvimento",
        "about.current.desc": "Uma plataforma médica com IA que ajuda médicos a tomar melhores decisões clínicas — time, arquitetura, design system, <strong>automações com IA</strong>, tudo. Detalhes em <a href=\"#work\" class=\"text-accent underline underline-offset-4\">Trabalhos</a>, menos o que o NDA come.",
        "about.current.status": "Em desenvolvimento ativo",
        "about.downloadCV": "BAIXAR CV",
        // Work
        "work.label": "Portfólio",
        "work.title1": "Meu",
        "work.title2": "Trabalho.",
        "work.subtitle": "Todo projeto aqui é o mesmo movimento: pegar trabalho espalhado em abas, planilhas e conhecimento tribal — e dar a ele uma interface legível.",
        "featuredWork.label": "Projeto em Destaque",
        "featuredWork.subtitle": "Um destaque com galeria em estilo apresentação, contexto maior do projeto e troca rápida entre projetos em destaque.",
        "featuredWork.stack": "Tecnologias",
        "featuredWork.links": "Links do Projeto",
        "featuredWork.preview": "Preview do Projeto",
        "featuredWork.screens": "telas",
        "featuredWork.singleView": "Visual único",
        "featuredWork.viewGithub": "GitHub",
        "featuredWork.viewDemo": "Website",
        "featuredWork.viewCaseStudy": "Case Study",
        "featuredWork.expandImage": "Expandir",
        "featuredWork.problem": "Problema",
        "featuredWork.decision": "Decisão que importou",
        "featuredWork.outcome": "Resultado",
        "featuredWork.lockedTitle": "NDA — screenshots retidos",
        "featuredWork.lockedSub": "O trabalho é real; os pixels são confidenciais.",
        "projects.visitGithub": "Explore mais no GitHub",
        // Journey
        "journey.subtitle": "Trajetória Profissional",
        "journey.the": "Jornada",
        "journey.title": "Profissional.",
        "journey.role0": "Líder de Projeto",
        "journey.date0": "Jan. 2026 — Presente",
        "journey.status0": "Atual · React + Node.js + PostgreSQL",
        "journey.desc0": "Promovido <strong>dentro da mesma empresa</strong> a <strong>Líder de Projeto</strong>, evoluindo da entrega hands-on para <strong>liderança de time</strong>, direção de arquitetura e responsabilidade pelo produto da visão até a entrega.",
        "journey.role0.item1": "<strong>Liderando o desenvolvimento completo</strong> de uma plataforma médica assistida por IA que apoia a tomada de decisões clínicas para médicos",
        "journey.role0.item2": "<strong>Projetando e sendo responsável</strong> por toda a identidade visual, biblioteca de componentes e UI/UX da plataforma do zero",
        "journey.role0.item3": "<strong>Arquitetando a solução full-stack</strong> com React, Node.js e PostgreSQL, garantindo escalabilidade e manutenibilidade",
        "journey.role0.item4": "Gerenciando a estratégia de versionamento, fluxos Git e documentação técnica da equipe",
        "journey.role0.item5": "Mentorando membros da equipe em boas práticas, padrões de qualidade de código e padrões modernos de desenvolvimento",
        "journey.role0.item6": "Responsável por todas as entregas do projeto — do design de interface à arquitetura do sistema ao pipeline de deploy",
        "journey.role0.item7": "<strong>Criando e participando de automações com IA e desenho de workflows</strong> para consultas médicas e rotinas de desenvolvimento ágil",
        "journey.role1": "Desenvolvedor FullStack",
        "journey.date1": "Jan. 2025 — Dez. 2025",
        "journey.status1": "Concluído · Angular + Spring",
        "journey.desc1": "Avancei <strong>dentro da mesma empresa</strong> para o papel de <strong>Desenvolvedor FullStack</strong>, ampliando aquela base inicial para <strong>arquitetura de sistema</strong>, decisões de UI/UX e liderança técnica crescente.",
        "journey.readMore": "Ler Mais",
        "journey.achievements": "Principais Conquistas",
        "journey.role1.item1": "<strong>Desenvolvi o sistema Exitus de ponta a ponta</strong>, trabalhando no front-end, back-end e bancos de dados, focando em escalabilidade e desempenho",
        "journey.role1.item2": "Projetei a identidade visual do sistema e criei interfaces de usuário, garantindo consistência na experiência do usuário (UI/UX)",
        "journey.role1.item3": "<strong>Arquitetei e implementei o front-end</strong> usando Angular e TypeScript, aplicando melhores práticas de componentização e responsividade",
        "journey.role1.item4": "Auxiliei na definição e construção da arquitetura back-end com Spring Boot, incluindo integrações de banco de dados e serviços externos",
        "journey.role1.item5": "<strong>Implementei integrações com IA</strong>, automatizando a validação de questões e melhorando a experiência educacional",
        "journey.role1.item6": "Integrei webhooks e implantei soluções baseadas em nuvem (Source Cloud) para implantação e manutenção contínua do sistema",
        "journey.role1.item7": "Trabalhei sob a metodologia Agile Scrum, participando ativamente de planejamentos, revisões e retrospectivas",
        "journey.role2": "Estagiário FullStack",
        "journey.date2": "Abr. 2024 — Dez. 2024",
        "journey.status2": "Concluído · Angular + Spring",
        "journey.desc2": "Iniciei minha jornada profissional como <strong>Estagiário FullStack</strong>, contribuindo para o desenvolvimento de sistemas e construindo a base que depois evoluiu para uma atuação técnica mais ampla.",
        "journey.role2.item1": "<strong>Contribuí para o desenvolvimento e melhoria</strong> das interfaces do sistema Exitus, focando em usabilidade e acessibilidade",
        "journey.role2.item2": "Auxiliei na criação de fluxos de usuário e design de interface, colaborando estreitamente com a equipe de UI/UX",
        "journey.role2.item3": "<strong>Participei do desenvolvimento front-end</strong> usando Angular, TypeScript e CSS, e apoiei o back-end com Spring Boot",
        "journey.role2.item4": "<strong>Ganhei experiência prática</strong> com desenvolvimento full-stack em um ambiente profissional",
        "journey.role2.item5": "Aprendi metodologias de desenvolvimento Ágil e práticas de colaboração em equipe",
        // Footer
        "footer.label": "Entre em Contato",
        "footer.title1": "Vamos construir algo",
        "footer.title2": "que as pessoas realmente usem.",
        "footer.copyright": "&copy; 2026 Enzo Esmeraldo",
        "footer.credits": "Criado com <i class=\"fas fa-heart text-accent/40 animate-pulse text-[8px]\"></i> no Brasil",
        // Heatmap / Tech
        "contrib.label": "Atividade de Contribuição",
        "contrib.less": "Menos",
        "contrib.more": "Mais",
        "tech.label": "Stack Principal",
        // Music
        "music.hint": "Vire o disco — o tema acompanha"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    // Update CV links
    const cvLinks = document.querySelectorAll('a[href*="cv"]');
    const cvFile = lang === 'pt' ? 'assets/cv/CV_ENZO_ESMERALDO_LÍDER_FULLSTACK_PT.pdf' : 'assets/cv/CV_ENZO_ESMERALDO_LEAD_FULLSTACK_EN.pdf';
    cvLinks.forEach(link => {
        link.href = cvFile;
    });

    // Update toggle buttons
    const desktopBtn = document.getElementById('current-lang-desktop');
    const mobileBtn = document.getElementById('current-lang-mobile');
    if (desktopBtn) desktopBtn.textContent = lang.toUpperCase();
    if (mobileBtn) mobileBtn.textContent = lang.toUpperCase();

    localStorage.setItem('preferred-lang', lang);

    renderFeaturedProjects();
    renderHeatmap();
    renderTechStack();
    renderAboutInterests();
}

function toggleLanguage() {
    const newLang = currentLang === 'en' ? 'pt' : 'en';
    setLanguage(newLang);
}

function initLanguage() {
    const savedLang = localStorage.getItem('preferred-lang');
    const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
    const initialLang = savedLang || browserLang;
    setLanguage(initialLang);

    const desktopToggle = document.getElementById('lang-toggle-desktop');
    const mobileToggle = document.getElementById('lang-toggle-mobile');
    if (desktopToggle) desktopToggle.addEventListener('click', toggleLanguage);
    if (mobileToggle) mobileToggle.addEventListener('click', toggleLanguage);
}

document.addEventListener('DOMContentLoaded', initLanguage);
document.addEventListener('DOMContentLoaded', initFeaturedProjects);
document.addEventListener('DOMContentLoaded', initHeatmapTooltip);
document.addEventListener('DOMContentLoaded', loadHeatmap);
document.addEventListener('DOMContentLoaded', renderTechStack);
document.addEventListener('DOMContentLoaded', renderAboutInterests);
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeFeaturedImageModal();
        // Escape on the jukebox = the quiet skip
        if (document.getElementById('jukebox')) {
            chooseRecord(0, { withMusic: false });
        }
    }
});
