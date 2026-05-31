// ═══════════════════════════════════════════════════
// ENZO.DEV — Script v2.0
// ═══════════════════════════════════════════════════

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Loader ──
const initLoader = () => {
    const tl = gsap.timeline();
    let progress = 0;
    const progressEl = document.getElementById('progress');
    const loaderBar = document.getElementById('loader-bar');
    
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 12) + 5;
        if (progress > 100) progress = 100;
        progressEl.innerText = String(progress).padStart(3, '0');
        loaderBar.style.width = progress + '%';
        
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                tl.to("#loader", {
                    yPercent: -100,
                    duration: 0.8,
                    ease: "power4.inOut",
                    onComplete: () => {
                        document.getElementById('loader').style.display = 'none';
                        initScrollAnimations();
                    }
                });
            }, 400);
        }
    }, 80);
};

window.addEventListener('load', initLoader);
setTimeout(() => {
    if (document.getElementById('loader') && document.getElementById('loader').offsetHeight > 0) {
        initLoader();
    }
}, 4000);

// ── Custom Cursor ──
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing) {
    const xToDot = gsap.quickTo(cursorDot, "x", { duration: 0.1, ease: "power3" });
    const yToDot = gsap.quickTo(cursorDot, "y", { duration: 0.1, ease: "power3" });
    const xToRing = gsap.quickTo(cursorRing, "x", { duration: 0.3, ease: "power3" });
    const yToRing = gsap.quickTo(cursorRing, "y", { duration: 0.3, ease: "power3" });

    window.addEventListener('mousemove', (e) => {
        xToDot(e.clientX);
        yToDot(e.clientY);
        xToRing(e.clientX);
        yToRing(e.clientY);
    });

    const hoverTriggers = document.querySelectorAll('.hover-trigger, a, button');
    hoverTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        trigger.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
}

// ── Falling Petals ──
function createPetals() {
    if (prefersReducedMotion) return;
    const container = document.getElementById('petals-container');
    if (!container) return;
    const petalCount = 20;
    
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('span');
        petal.classList.add('petal');
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDelay = Math.random() * 8 + 's';
        petal.style.animationDuration = (Math.random() * 10 + 8) + 's';
        container.appendChild(petal);
    }
}
createPetals();

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
    btn.innerHTML = '<span>DOWNLOADING...</span> <i class="fas fa-spinner fa-spin text-xs"></i>';
    setTimeout(() => {
        btn.innerHTML = '<span>DOWNLOADED ✓</span>';
        setTimeout(() => btn.innerHTML = originalText, 2000);
    }, 1000);
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

function loadSong(index) {
    const song = songs[index];
    songTitle.innerText = song.title;
    artistName.innerText = song.artist;
    albumArt.style.backgroundImage = song.cover;
    albumArt.style.backgroundSize = "cover";
    audioPlayer.src = song.file;

    if (heroBg) {
        heroBg.style.backgroundImage = `url('${song.heroBg}')`;
    }

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

loadSong(currentSongIndex);

const tryAutoplay = () => {
    audioPlayer.volume = 0.4;
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            const icon = playBtn.querySelector('i');
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            musicCard.classList.remove('paused');
        }).catch(() => {
            isPlaying = false;
            const icon = playBtn.querySelector('i');
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            musicCard.classList.add('paused');
        });
    }
};

tryAutoplay();

// ── GitHub Activity Heatmap ──
const GITHUB_USER = 'ensinho';
const HEATMAP_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`;
let heatmapData = null;
let heatTooltip = null;

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
                cell.title = formatContributionText(day.iso, day.count);
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
        heatTooltip.textContent = formatContributionText(cell.dataset.date, cell.dataset.count);
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
const FEATURED_PROJECT_ROTATION_INTERVAL = 30 * 60 * 1000;

// Replace single-image entries with dedicated screenshot arrays as more project captures land.
const featuredProjects = [
    {
        id: 'pokemon-team-builder',
        title: 'Pokémon Team Builder',
        logo: {
            src: 'assets/icons/teamBuilderLogo.png',
            alt: 'Pokémon Team Builder logo'
        },
        description: {
            en: 'A competitive Pokémon workspace for <strong>building smarter teams</strong>, combining <strong>Pokédex search</strong>, <strong>type coverage analysis</strong>, saved teams, quick generators, and <em>Showdown-ready export</em>.',
            pt: 'Um workspace competitivo de Pokémon para <strong>montar equipes mais inteligentes</strong>, combinando <strong>busca na Pokédex</strong>, <strong>análise de cobertura de tipos</strong>, times salvos, geradores rápidos e <em>exportação pronta para o Showdown</em>.'
        },
        narrative: {
            en: {
                why: 'Built to turn a fan workflow into a polished product surface with clear decisions and fast iteration.',
                does: 'Lets players search, filter, save, share, analyze coverage, and export teams for battle planning.',
                problem: 'Team building often gets split across tools; this brings discovery, strategy, and persistence together.'
            },
            pt: {
                why: 'Criado para transformar um fluxo de fã em uma experiência de produto polida, com decisões claras e iteração rápida.',
                does: 'Permite buscar, filtrar, salvar, compartilhar, analisar cobertura e exportar times para planejamento de batalha.',
                problem: 'A montagem de times costuma ficar espalhada em várias ferramentas; aqui descoberta, estratégia e persistência ficam juntas.'
            }
        },
        technologies: ['React', 'JavaScript', 'Tailwind', 'Firebase', 'PokéAPI'],
        images: [
            {
                src: 'assets/projectCovers/pokemon/home.png',
                alt: 'Pokemon Team Builder home dashboard',
                fit: 'cover',
                position: 'center top'
            },
            {
                src: 'assets/projectCovers/pokemon/team-builder.png',
                alt: 'Pokemon Team Builder roster builder screen',
                fit: 'cover',
                position: 'center top'
            },
            {
                src: 'assets/projectCovers/pokemon/pokedex.png',
                alt: 'Pokemon Team Builder Pokedex screen',
                fit: 'cover',
                position: 'center top'
            },
            {
                src: 'assets/projectCovers/pokemon/generator.png',
                alt: 'Pokemon Team Builder round generator screen',
                fit: 'cover',
                position: 'center top'
            },
            {
                src: 'assets/projectCovers/pokemon/detail-charizard.png',
                alt: 'Pokemon Team Builder detail modal',
                fit: 'contain',
                position: 'center'
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
            en: 'An immersive learning platform for <strong>dinosaur research</strong>, combining a <strong>scientific catalog</strong>, fossil maps, timelines, multilingual content, Firebase data, and external image enrichment into an <em>editorial exploration experience</em>.',
            pt: 'Uma plataforma imersiva de aprendizado sobre <strong>pesquisa em dinossauros</strong>, combinando <strong>catálogo científico</strong>, mapas fósseis, linhas do tempo, conteúdo multilíngue, dados no Firebase e enriquecimento externo de imagens em uma <em>experiência editorial de exploração</em>.'
        },
        narrative: {
            en: {
                why: 'Built to make educational research feel visual, navigable, and alive instead of buried in static lists.',
                does: 'Organizes species, maps, timelines, quizzes, multilingual content, and enriched imagery into one learning flow.',
                problem: 'Prehistoric data can feel fragmented; the interface gives it context, pacing, and a reason to keep exploring.'
            },
            pt: {
                why: 'Criado para fazer pesquisa educacional parecer visual, navegável e viva em vez de presa em listas estáticas.',
                does: 'Organiza espécies, mapas, linhas do tempo, quizzes, conteúdo multilíngue e imagens enriquecidas em um fluxo de aprendizado.',
                problem: 'Dados pré-históricos podem parecer fragmentados; a interface dá contexto, ritmo e motivo para continuar explorando.'
            }
        },
        technologies: ['React', 'TypeScript', 'Tailwind', 'Firebase', 'Leaflet', 'i18next'],
        images: [
            {
                src: 'assets/projectCovers/dino/Home1.png',
                alt: 'Dino Library home screen',
                fit: 'cover'
            },
            {
                src: 'assets/projectCovers/dino/DinoCatalog.png',
                alt: 'Dino Library catalog screen',
                fit: 'cover'
            },
            {
                src: 'assets/projectCovers/dino/DinoDetail1.png',
                alt: 'Dino Library detail screen containing layered content and interactive elements',
                fit: 'cover'
            },
            {
                src: 'assets/projectCovers/dino/DinoDetail2.png',
                alt: 'Dino Library detail screen containing layered content and interactive elements',
                fit: 'cover'
            },
            {
                src: 'assets/projectCovers/dino/DinoMap.png',
                alt: 'Dino Library map screen with motion and layered content',
                fit: 'cover'
            },
            {
                src: 'assets/projectCovers/dino/Quiz.png',
                alt: 'Dino Library quiz screen',
                fit: 'cover'
            }
        ],
        links: {
            demo: 'https://dino-library.vercel.app/',
            github: 'https://github.com/ensinho/dino-library'
        }
    },
    {
        id: 'qassistant',
        title: 'QAssistant',
        logo: {
            src: 'assets/icons/qassistant-logo.png',
            alt: 'QAssistant logo'
        },
        description: {
            en: 'A VS Code extension for QA operations that turns selected commits into <strong>traceable validation packages</strong>, <strong>AI-assisted summaries</strong>, OpenProject tasks, testing prompts, and <em>reusable agent-ready project context</em>.',
            pt: 'Uma extensão do VS Code para operação de QA que transforma commits selecionados em <strong>pacotes rastreáveis de validação</strong>, <strong>resumos assistidos por IA</strong>, tarefas no OpenProject, prompts de teste e <em>contexto reutilizável pronto para agentes</em>.'
        },
        narrative: {
            en: {
                why: 'Built from a real QA handoff pain: commits need context, traceability, and repeatable validation.',
                does: 'Generates summaries, validation packages, testing context, OpenProject tasks, and agent-ready docs from selected commits.',
                problem: 'QA workflows lose time when evidence, tickets, and technical context live in separate places.'
            },
            pt: {
                why: 'Criado a partir de uma dor real de handoff de QA: commits precisam de contexto, rastreabilidade e validação repetível.',
                does: 'Gera resumos, pacotes de validação, contexto de testes, tarefas no OpenProject e docs para agentes a partir de commits selecionados.',
                problem: 'Fluxos de QA perdem tempo quando evidências, tarefas e contexto técnico ficam em lugares separados.'
            }
        },
        technologies: ['TypeScript', 'VS Code API', 'React', 'Vite', 'OpenProject', 'AI'],
        images: [
            {
                src: 'assets/projectCovers/qassistant/qassistant0.jpeg',
                alt: 'QAssistant dashboard with telemetry and validation actions',
                fit: 'contain',
                position: 'center top'
            },
            {
                src: 'assets/projectCovers/qassistant/QASSISTANT1.jpeg',
                alt: 'QAssistant guided onboarding setup screen',
                fit: 'contain',
                position: 'center top'
            },
            {
                src: 'assets/projectCovers/qassistant/qassistant2.jpeg',
                alt: 'QAssistant commit selection workflow for validation packages',
                fit: 'contain',
                position: 'center top'
            },
            {
                src: 'assets/projectCovers/qassistant/qassistant3.jpeg',
                alt: 'QAssistant tests and artifacts runner screen',
                fit: 'contain',
                position: 'center top'
            }
        ],
        links: {
            github: 'https://github.com/ensinho/QAssistant'
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
            en: 'A marine research platform for <strong>cataloging field collections</strong>, managing researchers, labs and vessels, tracking specimen metadata, and surfacing <em>collection trends through operational dashboards</em>.',
            pt: 'Uma plataforma de pesquisa marinha para <strong>catalogar coletas de campo</strong>, gerenciar pesquisadores, laboratórios e embarcações, rastrear metadados de espécimes e revelar <em>tendências de coleta em dashboards operacionais</em>.'
        },
        narrative: {
            en: {
                why: 'Built to support scientific collection work with structure, permissions, and clearer research visibility.',
                does: 'Catalogs collections, specimens, photos, laboratories, vessels, researchers, favorites, and dashboard metrics.',
                problem: 'Research records become harder to trust when metadata, people, and collection context are not connected.'
            },
            pt: {
                why: 'Criado para apoiar coletas científicas com estrutura, permissões e mais visibilidade para pesquisa.',
                does: 'Cataloga coletas, espécimes, fotos, laboratórios, embarcações, pesquisadores, favoritos e métricas em dashboards.',
                problem: 'Registros de pesquisa ficam difíceis de confiar quando metadados, pessoas e contexto da coleta não estão conectados.'
            }
        },
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Supabase', 'Tailwind'],
        images: [
            {
                src: 'assets/projectCovers/aqua/defaultCoverAqua.jpeg',
                alt: 'AquaCensus marine research dashboard cover',
                fit: 'contain',
                position: 'center'
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
    activeImageIndex: 0,
    rotationTimer: null
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
    if (!project || !project.logo || !project.logo.src) return '';

    const wrapperClass = variant === 'switcher' ? 'featured-project-switch-icon' : 'featured-project-logo-wrap';
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
        { label: activeTranslations['featuredWork.why'], text: narrative.why },
        { label: activeTranslations['featuredWork.does'], text: narrative.does },
        { label: activeTranslations['featuredWork.problem'], text: narrative.problem }
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

function renderFeaturedProjectStage() {
    const { stage } = getFeaturedProjectElements();
    if (!stage) return;

    const project = featuredProjects[featuredProjectState.activeProjectIndex];
    if (!project || !project.images || !project.images.length) {
        stage.innerHTML = '';
        return;
    }

    featuredProjectState.activeImageIndex = Math.min(featuredProjectState.activeImageIndex, project.images.length - 1);

    const activeImage = project.images[featuredProjectState.activeImageIndex];
    const hasMultipleImages = project.images.length > 1;
    const copy = getFeaturedProjectCopy();
    const linkMarkup = buildFeaturedProjectLinks(project);
    const narrativeMarkup = buildFeaturedProjectNarrative(project);
    const featuredFit = 'contain';
    const featuredPosition = activeImage.position || 'center';

    stage.innerHTML = `
        <div class="featured-project-layout">
            <div class="featured-project-media-shell ${hasMultipleImages ? '' : 'is-single-image'}">
                <div class="featured-project-primary">
                    <img class="featured-project-primary-image" src="${activeImage.src}" alt="${activeImage.alt}" style="--featured-fit: ${featuredFit}; --featured-position: ${featuredPosition};">
                    <button type="button" class="featured-project-expand-btn" data-featured-expand aria-label="${translations[currentLang]['featuredWork.expandImage'] || 'Expand image'}">
                        <i class="fas fa-up-right-and-down-left-from-center"></i>
                        <span>${translations[currentLang]['featuredWork.expandImage'] || 'Expand'}</span>
                    </button>
                </div>

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

            <div class="featured-project-panel">
                <div class="featured-project-panel-top">
                    <div class="featured-project-heading">
                        ${getFeaturedProjectLogoMarkup(project, 'panel')}
                        <div>
                            <p class="font-mono text-[11px] tracking-[0.22em] uppercase text-gray/65 mb-3">${String(featuredProjectState.activeProjectIndex + 1).padStart(2, '0')} / ${String(featuredProjects.length).padStart(2, '0')}</p>
                            <h3 class="featured-project-title">${project.title}</h3>
                        </div>
                    </div>
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

function selectFeaturedProject(index, options = {}) {
    if (!featuredProjects.length) return;

    const { resetTimer = true } = options;
    const normalizedIndex = (index + featuredProjects.length) % featuredProjects.length;

    featuredProjectState.activeProjectIndex = normalizedIndex;
    featuredProjectState.activeImageIndex = 0;
    renderFeaturedProjects();

    if (resetTimer) {
        scheduleFeaturedProjectRotation();
    }
}

function selectFeaturedImage(index) {
    const project = featuredProjects[featuredProjectState.activeProjectIndex];
    if (!project || !project.images || index < 0 || index >= project.images.length) return;

    featuredProjectState.activeImageIndex = index;
    renderFeaturedProjectStage();
}

function scheduleFeaturedProjectRotation() {
    window.clearTimeout(featuredProjectState.rotationTimer);

    if (featuredProjects.length <= 1) return;

    featuredProjectState.rotationTimer = window.setTimeout(() => {
        selectFeaturedProject(featuredProjectState.activeProjectIndex + 1, { resetTimer: false });
        scheduleFeaturedProjectRotation();
    }, FEATURED_PROJECT_ROTATION_INTERVAL);
}

function initFeaturedProjects() {
    const { switcher, stage } = getFeaturedProjectElements();
    if (!switcher || !stage) return;

    renderFeaturedProjects();
    scheduleFeaturedProjectRotation();
}

// ── Translation System ──
const translations = {
    en: {
        // Nav
        "nav.about": "About",
        "nav.projects": "Work",
        "nav.journey": "Trajectory",
        "nav.skills": "Toolkit",
        "nav.contact": "Contact",
        // Hero
        "hero.available": "Available for Work",
        "hero.location": "Fortaleza, Brazil",
        "hero.description": "I architect <span class=\"text-accent font-medium\">scalable interfaces</span> and design systems that bridge engineering precision with creative expression. Specialized in <span class=\"text-accent font-medium\">Angular, React & Spring Boot</span>.",
        "hero.viewProjects": "VIEW SELECTED WORK",
        "hero.resume": "DOWNLOAD CV",
        "hero.scroll": "Scroll",
        "hero.role": "Fullstack Developer & Frontend enthusiast",
        // About
        "about.label": "About Me",
        "about.title1": "Who I",
        "about.title2": "am.",
        "about.offCode": "About the Developer",
        "about.title": "Enzo Esmeraldo",
        "about.description": "Fullstack Developer and Frontend enthusiast focused on <strong>front-end architecture</strong>, <strong>design systems</strong>, and interfaces that make complex workflows easier to use. I like building products where UI decisions, technical structure, and product value point in the same direction.",
        "about.bio2": "My current work connects product delivery with <strong>AI automation</strong>, agile routines, and tools that help teams move with more context and less friction.",
        "about.avatarJoke": "btw, that's me",
        "about.interests.label": "Interests",
        "about.interests.title": "Outside the editor",
        "about.funfact.label": "Fun Fact",
        "about.funfact.title": "Fav. Pokémon is Lugia",
        "about.funfact.desc": "Psychic-type elegance, legendary rarity — basically my design philosophy wrapped in a Pokémon.",
        "about.numbers.label": "By the Numbers",
        "about.current.label": "Currently Building",
        "about.current.desc": "An AI-powered medical platform that helps doctors make better clinical decisions — leading the team, owning the architecture, creating <strong>AI automations</strong>, and shaping <strong>agile development tools</strong> for the workflow around medical consultations.",
        "about.current.status": "In active development",
        "about.stat1.label": "Years",
        "about.stat1.value": "2+",
        "about.stat2.label": "Projects",
        "about.stat2.value": "10+",
        "about.stat3.label": "Focus",
        "about.stat3.value": "Frontend",
        "about.stat4.label": "Graduation",
        "about.stat4.value": "2027",
        "about.stat5.label": "Fav. Pokémon",
        "about.stat5.value": "Lugia",
        "about.downloadCV": "DOWNLOAD CV",
        // Work
        "work.label": "Portfolio",
        "work.title1": "My",
        "work.title2": "Work.",
        "work.subtitle": "Projects focused on turning complex workflows into usable products: QA traceability, scientific catalogs, interactive learning tools, and role-based mobile apps.",
        "featuredWork.label": "Featured Project",
        "featuredWork.subtitle": "A spotlighted case study with a presentation-style gallery, longer project context, and quick switching between featured builds.",
        "featuredWork.rotation": "Auto-rotates every 30 minutes",
        "featuredWork.stack": "Tech Stack",
        "featuredWork.links": "Project Links",
        "featuredWork.preview": "Project Preview",
        "featuredWork.screens": "screens",
        "featuredWork.singleView": "Single view",
        "featuredWork.viewGithub": "GitHub",
        "featuredWork.viewDemo": "Website",
        "featuredWork.viewCaseStudy": "Case Study",
        "featuredWork.expandImage": "Expand",
        "featuredWork.why": "Why",
        "featuredWork.does": "What it does",
        "featuredWork.problem": "Problem",
        "projects.dino.description": "Immersive dinosaur learning platform with a scientific catalog, fossil maps, timelines, multilingual content, Firebase data, and external image enrichment.",
        "projects.teambuilder.description": "Competitive Pokémon workspace with team persistence, Pokédex filters, type analysis, share links, favorites, generators, and Showdown export.",
        "projects.uniforgym.description": "Native Android gym platform for student and professor workflows, Firebase auth, workout assignment, QR-guided exercise videos, and training history.",
        "projects.aquacensus.description": "Marine research platform for field collections, researchers, laboratories, vessels, specimen metadata, and operational dashboards.",
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
        // Skills
        "skills.subtitle": "What I Work With",
        "skills.title1": "Tech",
        "skills.title2": "Arsenal.",
        "skills.frontend": "Frontend Architecture",
        "skills.backend": "Backend & Data",
        // Footer
        "footer.label": "Get In Touch",
        "footer.title1": "Let's build",
        "footer.title2": "something awsome.",
        "footer.copyright": "&copy; 2025 Enzo Esmeraldo",
        "footer.credits": "Crafted with <i class=\"fas fa-heart text-accent/40 animate-pulse text-[8px]\"></i> in Brazil",
        // Heatmap / Tech
        "contrib.label": "Contribution Activity",
        "contrib.less": "Less",
        "contrib.more": "More",
        "tech.label": "Core Stack",
        // Music
        "music.hint": "Change song to switch theme"
    },
    pt: {
        // Nav
        "nav.about": "Sobre",
        "nav.projects": "Trabalhos",
        "nav.journey": "Trajetória",
        "nav.skills": "Ferramentas",
        "nav.contact": "Contato",
        // Hero
        "hero.available": "Disponível para Trabalho",
        "hero.location": "Fortaleza, Brasil",
        "hero.description": "Eu projeto <span class=\"text-accent font-medium\">interfaces escaláveis</span> e design systems que unem precisão técnica com expressão criativa. Especializado em <span class=\"text-accent font-medium\">Angular, React & Spring Boot</span>.",
        "hero.viewProjects": "VER TRABALHOS",
        "hero.resume": "BAIXAR CV",
        "hero.scroll": "Role",
        "hero.role": "Arquiteto Frontend & Desenvolvedor Criativo",
        // About
        "about.label": "Sobre Mim",
        "about.title1": "Quem eu",
        "about.title2": "sou.",
        "about.offCode": "Sobre o Desenvolvedor",
        "about.title": "Enzo Esmeraldo",
        "about.description": "Desenvolvedor Fullstack e entusiasta de Frontend com foco em <strong>arquitetura front-end</strong>, <strong>design systems</strong> e interfaces que tornam fluxos complexos mais fáceis de usar. Gosto de construir produtos onde UI, estrutura técnica e valor de negócio apontam para a mesma direção.",
        "about.bio2": "Meu trabalho atual conecta entrega de produto com <strong>automação com IA</strong>, rotinas ágeis e ferramentas que ajudam equipes a trabalhar com mais contexto e menos atrito.",
        "about.avatarJoke": "e sim, esse sou eu",
        "about.interests.label": "Interesses",
        "about.interests.title": "Fora do editor",
        "about.funfact.label": "Curiosidade",
        "about.funfact.title": "Pokémon Fav. é Lugia",
        "about.funfact.desc": "Elegância do tipo Psíquico, raridade lendária — basicamente minha filosofia de design em forma de Pokémon.",
        "about.numbers.label": "Em Números",
        "about.current.label": "Em Desenvolvimento",
        "about.current.desc": "Uma plataforma médica com IA que ajuda médicos a tomar melhores decisões clínicas — liderando a equipe, definindo a arquitetura, criando <strong>automações com IA</strong> e moldando <strong>ferramentas para desenvolvimento ágil</strong> no fluxo de consultas médicas.",
        "about.current.status": "Em desenvolvimento ativo",
        "about.stat1.label": "Anos",
        "about.stat1.value": "2+",
        "about.stat2.label": "Projetos",
        "about.stat2.value": "10+",
        "about.stat3.label": "Foco",
        "about.stat3.value": "Front-End",
        "about.stat4.label": "Graduação",
        "about.stat4.value": "2027",
        "about.stat5.label": "Pokémon Fav.",
        "about.stat5.value": "Lugia",
        "about.downloadCV": "BAIXAR CV",
        // Work
        "work.label": "Portfólio",
        "work.title1": "Meu",
        "work.title2": "Trabalho.",
        "work.subtitle": "Projetos focados em transformar fluxos complexos em produtos utilizáveis: rastreabilidade de QA, catálogos científicos, ferramentas interativas de aprendizado e apps mobile com papéis claros.",
        "featuredWork.label": "Projeto em Destaque",
        "featuredWork.subtitle": "Um destaque com galeria em estilo apresentação, contexto maior do projeto e troca rápida entre projetos em destaque.",
        "featuredWork.rotation": "Troca automaticamente a cada 30 minutos",
        "featuredWork.stack": "Tecnologias",
        "featuredWork.links": "Links do Projeto",
        "featuredWork.preview": "Preview do Projeto",
        "featuredWork.screens": "telas",
        "featuredWork.singleView": "Visual único",
        "featuredWork.viewGithub": "GitHub",
        "featuredWork.viewDemo": "Website",
        "featuredWork.viewCaseStudy": "Case Study",
        "featuredWork.expandImage": "Expandir",
        "featuredWork.why": "Por quê",
        "featuredWork.does": "O que faz",
        "featuredWork.problem": "Problema",
        "projects.dino.description": "Plataforma imersiva de aprendizado sobre dinossauros com catálogo científico, mapas fósseis, linhas do tempo, conteúdo multilíngue, Firebase e enriquecimento externo de imagens.",
        "projects.teambuilder.description": "Workspace competitivo de Pokémon com persistência de times, filtros de Pokédex, análise de tipos, links de compartilhamento, favoritos, geradores e exportação para Showdown.",
        "projects.uniforgym.description": "Plataforma Android nativa para fluxos de alunos e professores, autenticação Firebase, atribuição de treinos, vídeos por QR code e histórico de treino.",
        "projects.aquacensus.description": "Plataforma de pesquisa marinha para coletas de campo, pesquisadores, laboratórios, embarcações, metadados de espécimes e dashboards operacionais.",
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
        // Skills
        "skills.subtitle": "Com o que trabalho",
        "skills.title1": "Arsenal",
        "skills.title2": "Tecnológico.",
        "skills.frontend": "Arquitetura Frontend",
        "skills.backend": "Backend & Dados",
        // Footer
        "footer.label": "Entre em Contato",
        "footer.title1": "Vamos construir",
        "footer.title2": "algo incrível.",
        "footer.copyright": "&copy; 2025 Enzo Esmeraldo",
        "footer.credits": "Criado com <i class=\"fas fa-heart text-accent/40 animate-pulse text-[8px]\"></i> no Brasil",
        // Heatmap / Tech
        "contrib.label": "Atividade de Contribuição",
        "contrib.less": "Menos",
        "contrib.more": "Mais",
        "tech.label": "Stack Principal",
        // Music
        "music.hint": "Mude a música para trocar o tema"
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
    }
});
