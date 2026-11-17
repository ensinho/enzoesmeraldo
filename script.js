// ═══════════════════════════════════════════════════
// ENZO.DEV — Script v2.0
// ═══════════════════════════════════════════════════

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsScrollTimeline = window.CSS && CSS.supports('animation-timeline: view()');

// ── Site start (called once the jukebox is dismissed) ──
// All motion is native CSS (see "Native motion" in styles.css). JS only flips a class
// and, on browsers without scroll-driven animations, falls back to a one-shot observer.
let siteStarted = false;
function startSite() {
    if (siteStarted) return;
    siteStarted = true;
    document.querySelectorAll('.hero-text-anim').forEach((el, i) => el.style.setProperty('--i', i));
    document.body.classList.add('site-started');
    initRevealFallback();
}

function initRevealFallback() {
    if (prefersReducedMotion || supportsScrollTimeline || !('IntersectionObserver' in window)) return;
    document.body.classList.add('reveal-fallback');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -12% 0px' });
    document.querySelectorAll('.gs-reveal').forEach(el => observer.observe(el));
}

// ── Navbar state + Back to Top (one rAF-throttled passive listener) ──
const navbar = document.getElementById('navbar');
const backToTopBtn = document.getElementById('back-to-top');
const heroSection = document.getElementById('hero');
const playerDock = document.getElementById('music-card');
let scrollTicking = false;
function syncScrollState() {
    scrollTicking = false;
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    if (backToTopBtn) backToTopBtn.classList.toggle('is-visible', y > window.innerHeight * 0.5);
    // The player sits as a full dock while the hero is on screen, and folds into the
    // compact wave pill once the hero is mostly scrolled away.
    if (playerDock && heroSection) {
        const heroEnd = heroSection.offsetHeight - window.innerHeight * 0.55;
        playerDock.classList.toggle('is-mini', y > Math.max(120, heroEnd));
    }
}
window.addEventListener('resize', () => requestAnimationFrame(syncScrollState), { passive: true });
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(syncScrollState);
}, { passive: true });
syncScrollState();
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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

// Waveforms are pre-computed from the two mp3s in assets/songs (ffmpeg → 112 loudness
// buckets), so the bars are the real shape of each track without fetching 5 MB on load.
const songWaves = [
    { duration: 186, wave: [0.14,0.14,0.14,0.14,0.14,0.14,0.14,0.18,0.2,0.26,0.19,0.22,0.21,0.25,0.19,0.59,0.53,0.49,0.55,0.45,0.64,0.5,0.76,0.74,0.85,0.19,0.93,0.98,0.72,0.37,0.86,0.82,0.73,0.77,1,0.85,0.79,0.81,0.92,0.77,0.88,0.87,0.91,0.79,0.57,0.8,0.73,0.68,0.81,0.83,0.82,0.95,0.65,0.84,0.79,0.91,0.75,0.85,0.81,0.75,0.75,0.72,0.66,0.79,0.87,0.87,0.9,0.88,0.88,0.81,0.81,0.9,0.88,0.77,0.48,0.82,0.72,0.72,0.79,0.86,0.87,0.86,0.7,0.17,0.19,0.14,0.17,0.18,0.21,0.14,0.77,0.86,0.61,0.78,0.85,0.8,0.79,0.9,0.88,0.72,0.82,0.86,0.8,0.79,0.84,0.84,0.6,0.73,0.24,0.14,0.14,0.16] },
    { duration: 300, wave: [0.14,0.14,0.14,0.21,0.19,0.33,0.58,0.65,0.62,0.62,0.74,0.74,0.62,0.71,0.64,0.8,0.72,0.89,0.74,0.72,0.76,0.88,0.7,0.61,0.7,0.79,0.7,0.47,0.7,0.69,0.87,0.75,0.66,0.67,0.75,0.55,0.73,0.59,0.85,0.92,0.74,0.92,0.77,0.83,0.65,0.9,0.83,0.71,0.85,0.64,1,0.79,0.96,0.91,0.76,0.92,0.63,0.2,0.4,0.47,0.61,0.48,0.33,0.37,0.68,0.64,0.32,0.46,0.84,0.95,0.88,0.97,0.94,0.74,0.92,0.82,0.9,0.71,0.77,0.96,0.73,0.96,0.76,0.92,0.86,0.72,0.94,0.85,0.91,0.86,0.79,0.72,0.74,0.84,0.66,0.92,0.69,0.69,0.6,0.74,0.67,0.81,0.71,0.74,0.75,0.64,0.45,0.33,0.36,0.14,0.14,0.14] }
];

let currentSongIndex = 0;
let isPlaying = false;
const audioPlayer = new Audio();
// Don't pull a 4–7 MB track on page load; fetch it when the visitor actually hits play.
audioPlayer.preload = 'none';
audioPlayer.volume = 0.4;

const musicCard = document.getElementById('music-card');
const albumArt = document.getElementById('album-art');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const heroBg = document.getElementById('hero-bg');
const waveEl = document.getElementById('player-wave');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const muteBtn = document.getElementById('mute-btn');
const volumeInput = document.getElementById('volume');

let easterEggTimeout = null;

function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

function songDuration() {
    return isFinite(audioPlayer.duration) && audioPlayer.duration > 0
        ? audioPlayer.duration
        : songWaves[currentSongIndex].duration;
}

// ── Waveform: three stacked copies of the same bars (base, hover preview, played) ──
function renderWave(index) {
    const bars = songWaves[index].wave;
    const step = 4;
    const rects = bars.map((v, i) => {
        const h = Math.max(3, v * 40);
        return `<rect x="${i * step + 0.8}" y="${(40 - h) / 2}" width="2.4" height="${h}" rx="1.2"/>`;
    }).join('');
    const svg = cls => `<svg class="${cls}" viewBox="0 0 ${bars.length * step} 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">${rects}</svg>`;
    waveEl.innerHTML = svg('player-wave-base') + svg('player-wave-hover') + svg('player-wave-fill') + '<span class="player-wave-head" aria-hidden="true"></span>';
}

function paintProgress() {
    const dur = songDuration();
    const pct = dur ? Math.min(100, (audioPlayer.currentTime / dur) * 100) : 0;
    waveEl.style.setProperty('--p', `${pct}%`);
    waveEl.setAttribute('aria-valuenow', String(Math.round(pct)));
    waveEl.setAttribute('aria-valuetext', `${formatTime(audioPlayer.currentTime)} of ${formatTime(dur)}`);
    timeCurrent.textContent = formatTime(audioPlayer.currentTime);
}

// rAF only while playing, so the fill glides instead of stepping 4× a second
let progressFrame = null;
function progressLoop() {
    paintProgress();
    progressFrame = isPlaying ? requestAnimationFrame(progressLoop) : null;
}

function setPlayingState(playing) {
    isPlaying = playing;
    const icon = playBtn.querySelector('i');
    icon.classList.toggle('fa-pause', playing);
    icon.classList.toggle('fa-play', !playing);
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    musicCard.classList.toggle('is-playing', playing);
    document.body.classList.toggle('is-music-playing', playing);
    if (playing && !progressFrame) progressFrame = requestAnimationFrame(progressLoop);
}

function playAudio() {
    const p = audioPlayer.play();
    setPlayingState(true);
    if (p !== undefined) p.catch(() => setPlayingState(false));
}

// ── Easter egg: the artist line briefly carries the record's note ──
function showEasterEgg(msgObj) {
    clearTimeout(easterEggTimeout);
    const song = songs[currentSongIndex];
    artistName.classList.add('is-note');
    artistName.textContent = msgObj[currentLang] || msgObj.en;
    easterEggTimeout = setTimeout(() => {
        artistName.classList.remove('is-note');
        artistName.textContent = song.artist;
    }, 4000);
}

// ── Theme veil: a brief accent wash that makes the flip feel like a moment ──
let themeLoadedOnce = false;
let themeSwitchTimer = null;
function flashThemeVeil() {
    document.body.classList.add('theme-switching');
    clearTimeout(themeSwitchTimer);
    themeSwitchTimer = setTimeout(() => document.body.classList.remove('theme-switching'), 600);
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
    clearTimeout(easterEggTimeout);
    artistName.classList.remove('is-note');
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    albumArt.style.backgroundImage = song.cover;
    albumArt.setAttribute('title', `${song.title} · ${song.artist}`);
    albumArt.setAttribute('aria-label', `${song.title} by ${song.artist}, album cover`);
    audioPlayer.src = song.file;
    renderWave(index);
    timeTotal.textContent = formatTime(songWaves[index].duration);
    paintProgress();

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
    if (isPlaying) {
        audioPlayer.pause();
        setPlayingState(false);
    } else {
        playAudio();
    }
}

function changeSong(delta) {
    currentSongIndex = (currentSongIndex + delta + songs.length) % songs.length;
    loadSong(currentSongIndex);
    playAudio();
    const song = songs[currentSongIndex];
    showEasterEgg(song.easterEgg);
    console.log(`%c${song.consoleMsg[1]}`, song.consoleMsg[0]);
}
function nextSong() { changeSong(1); }
function prevSong() {
    // Like any player: past the first seconds, "previous" restarts the track
    if (audioPlayer.currentTime > 4) {
        audioPlayer.currentTime = 0;
        paintProgress();
        return;
    }
    changeSong(-1);
}

// ── Seeking on the waveform (pointer + keyboard) ──
function seekTo(ratio) {
    const dur = songDuration();
    ratio = Math.min(1, Math.max(0, ratio));
    try { audioPlayer.currentTime = ratio * dur; } catch (_) { /* metadata not loaded yet */ }
    if (!isPlaying) playAudio();
    paintProgress();
}
function waveRatio(e) {
    const r = waveEl.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
}
waveEl.addEventListener('click', e => seekTo(waveRatio(e)));
waveEl.addEventListener('pointermove', e => waveEl.style.setProperty('--h', `${Math.min(100, Math.max(0, waveRatio(e) * 100))}%`));
waveEl.addEventListener('pointerleave', () => waveEl.style.setProperty('--h', '0%'));
waveEl.addEventListener('keydown', e => {
    const jump = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
    if (jump === undefined && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    if (e.key === 'Home') return seekTo(0);
    if (e.key === 'End') return seekTo(0.999);
    seekTo((audioPlayer.currentTime + jump) / songDuration());
});

// ── Volume ──
let lastVolume = 0.4;
function syncVolumeUI() {
    const v = audioPlayer.muted ? 0 : audioPlayer.volume;
    volumeInput.value = String(v);
    volumeInput.style.setProperty('--v', `${v * 100}%`);
    muteBtn.querySelector('i').className = `fas ${v === 0 ? 'fa-volume-xmark' : v < 0.5 ? 'fa-volume-low' : 'fa-volume-high'}`;
    muteBtn.setAttribute('aria-label', v === 0 ? 'Unmute' : 'Mute');
}
volumeInput.addEventListener('input', () => {
    audioPlayer.muted = false;
    audioPlayer.volume = Number(volumeInput.value);
    if (audioPlayer.volume > 0) lastVolume = audioPlayer.volume;
    syncVolumeUI();
});
muteBtn.addEventListener('click', () => {
    if (audioPlayer.muted || audioPlayer.volume === 0) {
        audioPlayer.muted = false;
        audioPlayer.volume = lastVolume || 0.4;
    } else {
        audioPlayer.muted = true;
    }
    syncVolumeUI();
});
syncVolumeUI();

audioPlayer.addEventListener('ended', nextSong);
audioPlayer.addEventListener('timeupdate', () => { if (!isPlaying) paintProgress(); });
audioPlayer.addEventListener('loadedmetadata', () => { timeTotal.textContent = formatTime(audioPlayer.duration); });
// Keep the UI honest when the OS / headset pauses or resumes playback
audioPlayer.addEventListener('pause', () => { if (isPlaying && !audioPlayer.ended) setPlayingState(false); });
audioPlayer.addEventListener('play', () => { if (!isPlaying) setPlayingState(true); });
audioPlayer.addEventListener('error', () => {
    if (!audioPlayer.getAttribute('src')) return;
    console.error("Error loading audio:", audioPlayer.src);
    setPlayingState(false);
});

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);

// ── The Jukebox: first visit picks a record; the record is the theme. ──
// No autoplay — music only starts from the visitor's own click on a record.
const jukebox = document.getElementById('jukebox');


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
        playAudio();
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
    // { date: '2026-10-21', en: 'QAssistant v2 on the VS Code Marketplace', pt: 'QAssistant v2 no Marketplace do VS Code' },
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

                cell.title = formatContributionText(day.iso, day.count) + (cell.dataset.story ? ` · ${cell.dataset.story}` : '');
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
        const storySuffix = cell.dataset.story ? ` · ${cell.dataset.story}` : '';
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
// Order is deliberate: lead with the live product (and its demo reel), then the most professional artifact, then the NDA flagship.
const featuredProjects = [
    {
        id: 'pokemon-team-builder',
        title: 'Pokémon Team Builder',
        track: {
            sub: { en: 'pokemonbuilder.app · builder, calc and battle AI', pt: 'pokemonbuilder.app · builder, calc e IA de batalha' },
            tag: { en: 'live', pt: 'no ar' },
            stack: 'React · Firebase'
        },
        logo: {
            src: 'assets/icons/teamBuilderLogo.png',
            alt: 'Pokémon Team Builder logo'
        },
        description: {
            en: 'Competitive team building usually lives across five tabs: Pikalytics, a damage calc, Showdown, a spreadsheet and Discord. <strong>pokemonbuilder.app puts all of it in one place</strong>. You get a builder with live analysis, <strong>real ladder usage from 1M+ games</strong> (Smogon, VGCPastes, Pikalytics), tournament-winning teams, a full <strong>damage calculator</strong>, speed tiers, a <em>forum where shared teams import in one click</em>, and a daily <strong>battle against Cynthia driven by a battle AI I built</strong> on top of the Showdown engine.',
            pt: 'Montar time competitivo normalmente fica espalhado em cinco abas: Pikalytics, uma calc de dano, o Showdown, uma planilha e o Discord. O <strong>pokemonbuilder.app junta tudo num lugar só</strong>. Tem builder com análise ao vivo, <strong>uso real de ladder de mais de 1M de partidas</strong> (Smogon, VGCPastes, Pikalytics), times campeões de torneios, <strong>calculadora de dano</strong> completa, speed tiers, um <em>fórum onde qualquer time compartilhado importa em um clique</em> e uma <strong>batalha diária contra a Cynthia, movida por uma IA de batalha que eu construí</strong> em cima do motor do Showdown.'
        },
        narrative: {
            en: {
                problem: 'Going from "team idea" to "importable team" meant jumping between tools that don\'t talk to each other, and none of them knew what the meta was actually running.',
                decision: 'Make real data the spine, not a feature: monthly ladder usage, Smogon sets, and tournament teams feed the builder, so every suggestion is one click from a slot.',
                outcome: 'A live product with 15+ sections, EN/PT, light and dark themes, guest-to-cloud accounts and PWA install, where a tournament team becomes your editable draft in one click, and a daily AI battle gives people a reason to come back.'
            },
            pt: {
                problem: 'Sair da "ideia de time" até um "time importável" era pular entre ferramentas que não conversam entre si, e nenhuma delas sabia o que o meta estava jogando de verdade.',
                decision: 'Fazer dos dados reais a base, não uma feature: uso mensal de ladder, sets do Smogon e times de torneio alimentam o builder, então toda sugestão está a um clique de virar slot.',
                outcome: 'Um produto no ar com 15+ seções, EN/PT, tema claro e escuro, contas de convidado que sobem pra nuvem e instalação como PWA, onde um time de torneio vira seu rascunho editável em um clique, e uma batalha diária contra a IA dá motivo pra voltar todo dia.'
            }
        },
        technologies: ['React 19', 'Vite', 'Firebase', 'Vercel Functions', '@pkmn/sim', 'PWA', 'Smogon Data'],
        deepDive: {
            kicker: { en: 'Deep dive · Battle AI', pt: 'Deep dive · IA de batalha' },
            title: { en: 'Champion Challenge: a Cynthia that plays fair', pt: 'Desafio da Campeã: uma Cynthia que joga limpo' },
            teaser: {
                en: 'How the server-side AI picks Cynthia\'s move every turn: fog of war, a one-turn lookahead and a win-probability model trained from scratch.',
                pt: 'Como a IA no servidor escolhe o golpe da Cynthia a cada turno: névoa de guerra, um turno de lookahead e um modelo de chance de vitória treinado do zero.'
            },
            cta: { en: 'Read the algorithm breakdown', pt: 'Ler a análise do algoritmo' },
            intro: {
                en: 'Once a day you battle Cynthia, and a <strong>server-side AI</strong> picks her move every turn. It\'s not a brute-force search: it scores every legal option with explicit rules, simulates the best few one turn ahead, and judges those futures with a <strong>win-probability model I trained from scratch</strong>. She only knows what the battle has revealed, and she gets harder as the week goes on.',
                pt: 'Uma vez por dia você enfrenta a Cynthia, e uma <strong>IA no servidor</strong> escolhe o golpe dela a cada turno. Não é força bruta: ela pontua cada opção legal com regras explícitas, simula as melhores um turno à frente e avalia esses futuros com um <strong>modelo de chance de vitória que treinei do zero</strong>. Ela só sabe o que a batalha já revelou, e fica mais difícil ao longo da semana.'
            },
            pipeline: [
                { en: ['Fog of war', 'Builds a copy of the battle with only what was revealed. Hidden items, EVs and moves get neutral defaults, and a test proves your hidden info never changes her choice.'], pt: ['Névoa de guerra', 'Monta uma cópia da batalha só com o que foi revelado. Item, EVs e golpes escondidos viram padrões neutros, e um teste garante que sua info oculta nunca muda a escolha dela.'] },
                { en: ['Read the player', 'Predicts your move with a softmax over expected damage, and learns during the match how often you switch or repeat moves.'], pt: ['Ler o jogador', 'Prevê seu golpe com um softmax sobre o dano esperado e aprende, durante a partida, o quanto você troca ou repete golpes.'] },
                { en: ['Score every option', 'Pure evaluators (attack, setup, status, recovery, switch) score each move in "% of HP" points, using cached damage estimates from the simulator.'], pt: ['Pontuar cada opção', 'Avaliadores puros (ataque, setup, status, cura, troca) pontuam cada golpe em pontos de "% de HP", com estimativas de dano cacheadas do simulador.'] },
                { en: ['Look one turn ahead', 'On the hardest days: top 3–4 candidates × your 3 likeliest replies × 2 seeded samples, up to 24 simulated futures per turn.'], pt: ['Olhar um turno à frente', 'Nos dias mais difíceis: as 3–4 melhores opções × suas 3 respostas mais prováveis × 2 amostras com seed, até 24 futuros simulados por turno.'] },
                { en: ['Judge with M1', 'A logistic-regression win-chance model (no ML library) scores each future, and switches her to gamble mode below 25% or safe mode above 75%.'], pt: ['Julgar com o M1', 'Um modelo de regressão logística de chance de vitória (sem biblioteca de ML) avalia cada futuro e coloca ela em modo arriscado abaixo de 25% ou seguro acima de 75%.'] },
                { en: ['Decide, explain, replay', 'A weighted pick among the best few, from a seeded RNG. Same input, same move, and every decision stores a readable trace.'], pt: ['Decidir, explicar, reproduzir', 'Escolha ponderada entre as melhores, com RNG de seed. Mesma entrada, mesmo golpe, e toda decisão guarda um trace legível.'] }
            ],
            metrics: [
                { value: '24', en: 'simulated futures per turn, max', pt: 'futuros simulados por turno, no máximo' },
                { value: '21 ms', en: 'median decision on the hardest level (p95 37 ms)', pt: 'decisão mediana no nível mais difícil (p95 37 ms)' },
                { value: '75%', en: 'win-model accuracy, calibration error 0.029', pt: 'acerto do modelo de vitória, erro de calibração 0,029' },
                { value: '24.4k', en: 'training positions from 1,500 self-play battles', pt: 'posições de treino de 1.500 batalhas de autojogo' },
                { value: '0', en: 'illegal moves in the calibration arena', pt: 'jogadas ilegais na arena de calibração' },
                { value: '~1.2k', en: 'test cases in CI across the whole app', pt: 'casos de teste na CI no app inteiro' }
            ],
            difficulty: {
                label: { en: 'Cynthia\'s win rate vs a greedy bot, by weekday', pt: 'Vitórias da Cynthia contra um bot guloso, por dia da semana' },
                levels: [
                    { name: 'DP', days: { en: 'Mon–Tue', pt: 'seg–ter' }, rate: 43.8 },
                    { name: 'Platinum', days: { en: 'Wed–Thu', pt: 'qua–qui' }, rate: 61.3 },
                    { name: 'Rematch', days: { en: 'Fri–Sat', pt: 'sex–sáb' }, rate: 68.3 },
                    { name: 'World', days: { en: 'Sun', pt: 'dom' }, rate: 88.8 }
                ]
            },
            skills: {
                en: ['Game AI design', 'Hidden-information reasoning', 'Logistic regression from scratch', 'Model calibration', 'Self-play evaluation', 'Deterministic systems', 'Serverless on Vercel', 'Scenario & invariant testing'],
                pt: ['Design de IA para jogos', 'Raciocínio com informação oculta', 'Regressão logística do zero', 'Calibração de modelo', 'Avaliação por autojogo', 'Sistemas determinísticos', 'Serverless na Vercel', 'Testes de cenário e invariantes']
            },
            footnote: {
                en: '698 commits · 173 React components · win rates and timings from the AI design doc, measured over 80–120 games per level.',
                pt: '698 commits · 173 componentes React · taxas de vitória e tempos do design doc da IA, medidos em 80–120 partidas por nível.'
            }
        },
        images: [
            {
                type: 'video',
                src: 'assets/projectCovers/pokemon/demo.mp4',
                poster: 'assets/projectCovers/pokemon/demo-poster.jpg',
                alt: 'pokemonbuilder.app demo reel: building a team, live analysis, meta usage, and the damage calculator',
                caption: {
                    en: 'Demo reel: from an empty slot to a tournament-ready team, with live analysis, real usage data and the calc all in one product.',
                    pt: 'Demo reel: de um slot vazio a um time pronto pra torneio, com análise ao vivo, dados reais de uso e a calc tudo num produto só.'
                }
            },
            {
                src: 'assets/projectCovers/pokemon/live-home.webp',
                alt: 'pokemonbuilder.app home dashboard with partner Pokemon, streaks, daily guess, meta teams, and live community timeline',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Home: your partner Pokémon, streaks, the daily guess, the current VGC meta and a live community timeline.',
                    pt: 'Home: seu Pokémon parceiro, streaks, o palpite diário, o meta VGC atual e a timeline da comunidade ao vivo.'
                }
            },
            {
                src: 'assets/projectCovers/pokemon/live-builder.webp',
                alt: 'Team Builder with meta core suggestions, top meta picks, and always-on team analysis',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Builder: top meta picks ranked by real usage, with offensive and defensive analysis always in view.',
                    pt: 'Builder: top picks do meta ranqueados por uso real, com análise ofensiva e defensiva sempre à vista.'
                }
            },
            {
                src: 'assets/projectCovers/pokemon/live-meta-usage.webp',
                alt: 'Meta and Usage screen with ladder usage stats from over one million games, common pairs and trios',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Meta & Usage: 1,163,315 ladder games turned into usage ranks, common pairs and trios, pulled from Smogon, VGCPastes and Pikalytics.',
                    pt: 'Meta & Uso: 1.163.315 partidas de ladder viram ranks de uso, duplas e trios comuns, com dados do Smogon, VGCPastes e Pikalytics.'
                }
            },
            {
                src: 'assets/projectCovers/pokemon/live-tournaments.webp',
                alt: 'Tournaments screen with featured winning teams from real 2026 events and open-in-builder buttons',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Tournaments: real winning teams from PJCS, regionals and majors. Hit "Open in Builder" and any of them becomes your draft.',
                    pt: 'Torneios: times campeões de verdade do PJCS, regionais e majors. Clica em "Abrir no Builder" e qualquer um vira rascunho seu.'
                }
            },
            {
                src: 'assets/projectCovers/pokemon/live-damage-calc.webp',
                alt: 'Damage calculator with attacker and defender panels, field conditions, weather, terrain, and stat spreads',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Damage Calculator: the full field state, including weather, terrain, side modifiers, natures, IV/EV spreads and Tera.',
                    pt: 'Calculadora de Dano: o estado de campo completo, com clima, terreno, modificadores, natures, spreads de IV/EV e Tera.'
                }
            },
            {
                src: 'assets/projectCovers/pokemon/live-forum.webp',
                alt: 'Forum feed with topics and shared teams that can be imported into the builder in one click',
                fit: 'cover',
                position: 'center top',
                caption: {
                    en: 'Forum: teams live inside posts, so anyone can import one straight into their builder.',
                    pt: 'Fórum: os times ficam dentro dos posts, então qualquer um importa direto pro próprio builder.'
                }
            }
        ],
        links: {
            demo: 'https://pokemonbuilder.app/',
            github: 'https://github.com/ensinho/pokemonTeamBuilder'
        }
    },
    {
        id: 'qassistant',
        title: 'QAssistant',
        track: {
            sub: { en: 'the QA loop inside VS Code', pt: 'o ciclo de QA dentro do VS Code' },
            tag: { en: 'v2.0.1', pt: 'v2.0.1' },
            stack: 'TypeScript · VS Code API'
        },
        logo: {
            src: 'assets/icons/qassistant-logo.png',
            alt: 'QAssistant logo'
        },
        status: {
            en: 'v2.0.1 · VS Code Marketplace',
            pt: 'v2.0.1 · VS Code Marketplace'
        },
        description: {
            en: 'A <strong>VS Code extension</strong>, published on the Marketplace, that brings the QA loop into the editor: a <strong>live OpenProject feed</strong>, a terminal that launches <em>Claude Code, Gemini CLI or Aider</em> with the task\'s context already loaded, and a <strong>QA Runner</strong> that runs your shell checks and posts the report back to the ticket.',
            pt: 'Uma <strong>extensão do VS Code</strong>, publicada no Marketplace, que traz o ciclo de QA pra dentro do editor: <strong>feed do OpenProject em tempo real</strong>, um terminal que abre <em>Claude Code, Gemini CLI ou Aider</em> já com o contexto da tarefa carregado e um <strong>QA Runner</strong> que roda seus scripts de verificação e publica o relatório direto na tarefa.'
        },
        narrative: {
            en: {
                problem: 'Tickets lived in the browser, agents in the terminal, and test evidence in screenshots. Every task meant copying context between three places.',
                decision: 'v2 dropped the opinionated scaffolding and rebuilt around the ticket: live-synced tasks, agents that start with the spec loaded, and a runner that uses whatever .sh scripts the repo already has.',
                outcome: 'Pick a task, branch off as feat/OP-{id}-{slug}, run verify.sh, and the result lands on the ticket without leaving VS Code.'
            },
            pt: {
                problem: 'A tarefa ficava no navegador, o agente no terminal e a evidência de teste em screenshot. Toda task virava copiar contexto entre três lugares.',
                decision: 'A v2 removeu o scaffolding engessado e foi reconstruída em torno da tarefa: tarefas sincronizadas ao vivo, agentes que já abrem com a especificação carregada e um runner que usa os .sh que o repo já tem.',
                outcome: 'Escolhe a tarefa, abre a branch feat/OP-{id}-{slug}, roda o verify.sh e o resultado cai na tarefa, sem sair do VS Code.'
            }
        },
        technologies: ['TypeScript', 'VS Code API', 'React 19', 'Vite', 'OpenProject API v3', 'AI Agents', 'GitHub Actions'],
        images: [
            {
                src: 'assets/projectCovers/qassistant/screenshot-feed-clean.png',
                alt: 'QAssistant OpenProject task feed with status filters and compact cards',
                fit: 'contain',
                position: 'center top',
                caption: {
                    en: 'Live OpenProject feed: filter chips with counts, toasts when a status changes, and quick actions on every card.',
                    pt: 'Feed do OpenProject ao vivo: filtros com contador, toast quando o status muda e ações rápidas em cada card.'
                }
            },
            {
                src: 'assets/projectCovers/qassistant/screenshot-terminal-agents.png',
                alt: 'QAssistant agent terminal with branch creation and AI agent launchers',
                fit: 'contain',
                position: 'center top',
                caption: {
                    en: 'Agent terminal: start Claude Code, Gemini CLI or Aider with the task loaded, on a branch named after it.',
                    pt: 'Terminal de agentes: abre Claude Code, Gemini CLI ou Aider com a tarefa carregada, numa branch com o nome dela.'
                }
            },
            {
                src: 'assets/projectCovers/qassistant/screenshot-qa-runner.png',
                alt: 'QAssistant QA Runner discovering shell scripts and streaming logs',
                fit: 'contain',
                position: 'center top',
                caption: {
                    en: 'QA Runner: finds verify.sh / test.sh anywhere in the repo, streams the logs, and publishes the report to the task.',
                    pt: 'QA Runner: acha verify.sh / test.sh em qualquer lugar do repo, mostra o log ao vivo e publica o relatório na tarefa.'
                }
            }
        ],
        links: {
            marketplace: 'https://marketplace.visualstudio.com/items?itemName=EnzoEsmeraldo.qassistant-vscode',
            github: 'https://github.com/ensinho/QAssistant'
        }
    },
    {
        id: 'medical-platform',
        title: 'AI Medical Platform',
        track: {
            sub: { en: 'clinical decision support · tech lead', pt: 'apoio à decisão clínica · liderança técnica' },
            tag: { en: 'NDA', pt: 'NDA' },
            stack: 'React · PostgreSQL'
        },
        logo: null,
        locked: true,
        status: {
            en: 'NDA · Led Jan.–Jun. 2026',
            pt: 'NDA · Liderado jan.–jun. 2026'
        },
        description: {
            en: 'The project I led at Colégio Christus: an <strong>AI-assisted medical platform</strong> that supports doctors before, during, and after consultations. It\'s under NDA, so no screenshots, but here\'s what I can tell you.',
            pt: 'O projeto que liderei no Colégio Christus: uma <strong>plataforma médica assistida por IA</strong> que apoia médicos antes, durante e depois das consultas. Tá sob NDA, então sem screenshots, mas dá pra contar isso aqui.'
        },
        narrative: {
            en: {
                problem: 'Clinical decision-making runs on scattered records and zero tooling built for the consultation itself.',
                decision: 'Own the whole surface (design system, React front-end, Node/PostgreSQL back-end and AI automations) so the product speaks one language.',
                outcome: 'Promoted to project lead to run it: team, architecture, and delivery from vision to deployment.'
            },
            pt: {
                problem: 'A decisão clínica roda sobre registros espalhados e zero ferramentas pensadas para a própria consulta.',
                decision: 'Cuidar da superfície inteira (design system, front-end em React, back-end em Node/PostgreSQL e automações com IA) pra que o produto fale uma língua só.',
                outcome: 'Promovido a líder de projeto para tocá-lo: time, arquitetura e entrega da visão ao deploy.'
            }
        },
        technologies: ['React', 'Node.js', 'PostgreSQL', 'AI Automation'],
        images: [],
        links: {}
    },
    {
        id: 'dino-library',
        title: 'Dino Library',
        track: {
            sub: { en: 'a paleontology catalog in two languages', pt: 'catálogo de paleontologia em dois idiomas' },
            tag: { en: 'live', pt: 'no ar' },
            stack: 'React · Leaflet'
        },
        logo: {
            src: 'assets/icons/dinoLibraryLogo.png',
            alt: 'Dino Library logo'
        },
        description: {
            en: 'Paleontology online is either academic PDFs or kids\' content. <strong>Dino Library is the in-between</strong>: a scientific catalog with <strong>fossil maps, timelines, and quizzes</strong>, in two languages, with imagery pulled in from external APIs. It\'s meant to feel like an <em>editorial you explore</em>, not a database.',
            pt: 'Paleontologia online é ou PDF acadêmico ou conteúdo infantil. A <strong>Dino Library é o meio-termo</strong>: um catálogo científico com <strong>mapas fósseis, linhas do tempo e quizzes</strong>, em dois idiomas, com imagens puxadas de APIs externas. A ideia é parecer uma <em>revista pra explorar</em>, não um banco de dados.'
        },
        narrative: {
            en: {
                problem: 'Prehistoric data is fragmented and flat. It\'s built to be queried, not explored.',
                decision: 'An editorial layout (read, explore, drift) instead of a database UI (filter, sort, leave). The content is the retention mechanic.',
                outcome: 'A catalog people flip through like a magazine, and keep flipping.'
            },
            pt: {
                problem: 'Dados pré-históricos são fragmentados e sem graça. Foram feitos pra consultar, não pra explorar.',
                decision: 'Um layout editorial (ler, explorar, vagar) em vez de UI de banco de dados (filtrar, ordenar, sair). O conteúdo é a mecânica de retenção.',
                outcome: 'Um catálogo que as pessoas folheiam como revista, e continuam folheando.'
            }
        },
        technologies: ['React', 'TypeScript', 'Tailwind', 'Firebase', 'Leaflet', 'i18next'],
        images: [
            {
                src: 'assets/projectCovers/dino/Home1.webp',
                alt: 'Dino Library home screen',
                fit: 'contain',
                caption: {
                    en: 'Editorial home. The layout makes you want to wander, not search.',
                    pt: 'Home editorial. O layout dá vontade de passear, não de pesquisar.'
                }
            },
            {
                src: 'assets/projectCovers/dino/DinoCatalog.webp',
                alt: 'Dino Library catalog screen',
                fit: 'contain',
                caption: {
                    en: 'Catalog with scientific filters that stay readable for non-scientists.',
                    pt: 'Catálogo com filtros científicos que continuam legíveis para não-cientistas.'
                }
            },
            {
                src: 'assets/projectCovers/dino/DinoDetail1.webp',
                alt: 'Dino Library species detail screen',
                fit: 'contain',
                caption: {
                    en: 'Species pages layer facts, era, and habitat into one scroll.',
                    pt: 'Páginas de espécies sobrepõem fatos, era e habitat em um único scroll.'
                }
            },
            {
                src: 'assets/projectCovers/dino/DinoDetail2.webp',
                alt: 'Dino Library species detail screen, second view',
                fit: 'contain',
                caption: {
                    en: 'Detail continues: imagery enriched from external APIs keeps pages alive.',
                    pt: 'O detalhe continua: imagens enriquecidas por APIs externas mantêm as páginas vivas.'
                }
            },
            {
                src: 'assets/projectCovers/dino/DinoMap.webp',
                alt: 'Dino Library fossil map screen',
                fit: 'contain',
                caption: {
                    en: 'Fossil map with discoveries plotted where they were actually dug up.',
                    pt: 'Mapa fóssil com as descobertas marcadas onde foram escavadas de verdade.'
                }
            },
            {
                src: 'assets/projectCovers/dino/Quiz.webp',
                alt: 'Dino Library quiz screen',
                fit: 'contain',
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
        track: {
            sub: { en: 'marine field research, one ledger', pt: 'pesquisa marinha de campo num registro só' },
            tag: { en: 'live', pt: 'no ar' },
            stack: 'Node.js · Supabase'
        },
        logo: {
            src: 'assets/icons/fish.svg',
            alt: 'AquaCensus logo'
        },
        description: {
            en: 'Marine field research runs on paper forms and personal spreadsheets, so specimen metadata gets orphaned from the people, vessels, and labs that produced it. <strong>AquaCensus connects all of it</strong>: collections, researchers, permissions and <em>operational dashboards</em>.',
            pt: 'Pesquisa marinha de campo roda em formulário de papel e planilha pessoal, e os metadados dos espécimes ficam órfãos das pessoas, embarcações e laboratórios que os produziram. O <strong>AquaCensus conecta tudo</strong>: coletas, pesquisadores, permissões e <em>dashboards operacionais</em>.'
        },
        narrative: {
            en: {
                problem: 'Research records lose trust when metadata, people, and collection context are disconnected.',
                decision: 'Treat provenance as first-class data: who collected what, from which vessel, for which lab.',
                outcome: 'Field records a lab can actually audit, favorite, and report on.'
            },
            pt: {
                problem: 'Registros de pesquisa perdem confiança quando metadados, pessoas e contexto da coleta estão desconectados.',
                decision: 'Tratar a proveniência como dado de primeira classe: quem coletou o quê, de qual embarcação, pra qual laboratório.',
                outcome: 'Registros de campo que um laboratório consegue auditar, favoritar e reportar de verdade.'
            }
        },
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Supabase', 'Tailwind'],
        images: [
            {
                src: 'assets/projectCovers/aqua/defaultCoverAqua.jpeg',
                alt: 'AquaCensus login screen introducing the marine species catalog',
                fit: 'contain',
                position: 'center',
                caption: {
                    en: 'The front door: a clean login for a platform where collections, people and vessels share one ledger.',
                    pt: 'A porta de entrada: um login limpo pra uma plataforma onde coletas, pessoas e embarcações dividem um registro só.'
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
    marketplace: {
        icon: 'fas fa-puzzle-piece',
        className: 'is-primary',
        labelKey: 'featuredWork.viewMarketplace'
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
        viewMarketplace: activeTranslations['featuredWork.viewMarketplace'],
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




function buildFeaturedProjectLinks(project) {
    if (!project || !project.links) return '';

    const copy = getFeaturedProjectCopy();
    const orderedLinks = ['demo', 'marketplace', 'github', 'caseStudy']
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

function buildFeaturedProjectDeepDive(project) {
    const dive = project && project.deepDive;
    if (!dive) return '';
    const lang = currentLang === 'pt' ? 'pt' : 'en';
    const pick = value => (value && (value[lang] || value.en)) || '';

    const steps = dive.pipeline.map((step, index) => {
        const [title, text] = step[lang] || step.en;
        return `
            <li class="deep-dive-step">
                <span class="deep-dive-step-index">${String(index + 1).padStart(2, '0')}</span>
                <div>
                    <p class="deep-dive-step-title">${title}</p>
                    <p class="deep-dive-step-text">${text}</p>
                </div>
            </li>
        `;
    }).join('');

    const metrics = dive.metrics.map(metric => `
        <div class="deep-dive-metric">
            <span class="deep-dive-metric-value">${metric.value}</span>
            <span class="deep-dive-metric-label">${metric[lang] || metric.en}</span>
        </div>
    `).join('');

    const levels = dive.difficulty ? `
        <div class="deep-dive-difficulty">
            <p class="deep-dive-label">${pick(dive.difficulty.label)}</p>
            ${dive.difficulty.levels.map(level => `
                <div class="deep-dive-bar">
                    <span class="deep-dive-bar-name">${level.name} <em>${pick(level.days)}</em></span>
                    <span class="deep-dive-bar-track"><span class="deep-dive-bar-fill" style="--rate:${level.rate}%"></span></span>
                    <span class="deep-dive-bar-value">${level.rate.toFixed(1)}%</span>
                </div>
            `).join('')}
        </div>
    ` : '';

    return `
        <section class="deep-dive" aria-label="${pick(dive.kicker)}">
            <div class="deep-dive-head">
                <p class="deep-dive-label">${pick(dive.kicker)}</p>
                <h4 class="deep-dive-title">${pick(dive.title)}</h4>
                <p class="deep-dive-intro">${pick(dive.intro)}</p>
            </div>
            <div class="deep-dive-metrics">${metrics}</div>
            <div class="deep-dive-body">
                <ol class="deep-dive-pipeline">${steps}</ol>
                <div class="deep-dive-side">
                    ${levels}
                    <div>
                        <p class="deep-dive-label">Skills</p>
                        <div class="featured-project-tech">${(dive.skills[lang] || dive.skills.en).map(skill => `<span class="project-tag">${skill}</span>`).join('')}</div>
                    </div>
                </div>
            </div>
            <p class="deep-dive-footnote">${pick(dive.footnote)}</p>
        </section>
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
                <video id="featured-image-modal-video" controls playsinline hidden></video>
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
    const videoElement = modal.querySelector('#featured-image-modal-video');
    const titleElement = modal.querySelector('#featured-image-modal-title');
    const kickerElement = modal.querySelector('#featured-image-modal-kicker');
    const closeButton = modal.querySelector('.featured-image-modal-close');
    const isVideo = image.type === 'video';

    imageElement.hidden = isVideo;
    videoElement.hidden = !isVideo;
    if (isVideo) {
        imageElement.removeAttribute('src');
        videoElement.src = image.src;
        videoElement.poster = image.poster || '';
        videoElement.setAttribute('aria-label', image.alt);
        videoElement.play().catch(() => {});
    } else {
        imageElement.src = image.src;
        imageElement.alt = image.alt;
    }
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

    const videoElement = modal.querySelector('#featured-image-modal-video');
    if (videoElement) videoElement.pause();

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
    const featuredFit = activeImage.fit === 'contain' ? 'contain' : 'cover';
    const caption = activeImage.caption ? (activeImage.caption[currentLang] || activeImage.caption.en) : '';
    const isVideo = activeImage.type === 'video';

    // Reduced motion: no autoplay loop — the visitor starts the reel themselves.
    const primaryMedia = isVideo
        ? `<video class="featured-project-primary-image" src="${activeImage.src}" poster="${activeImage.poster || ''}" aria-label="${activeImage.alt}" ${prefersReducedMotion ? 'controls' : 'loop'} muted playsinline preload="none"></video>`
        : `<img class="featured-project-primary-image" src="${activeImage.src}" alt="${activeImage.alt}" decoding="async" style="--featured-fit: ${featuredFit}; --featured-position: ${featuredPosition};">`;

    // Screens that aren't 16:9 sit whole inside the frame, over a blurred copy of themselves
    const backdrop = !isVideo && featuredFit === 'contain'
        ? `<img class="featured-project-backdrop" src="${activeImage.src}" alt="" aria-hidden="true" decoding="async">`
        : '';

    return `
        <div class="featured-project-media-shell ${hasMultipleImages ? '' : 'is-single-image'}">
            <div class="featured-project-primary ${isVideo ? 'is-video' : ''} ${backdrop ? 'is-contained' : ''}">
                ${backdrop}
                ${primaryMedia}
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
                            aria-label="${image.type === 'video' ? (currentLang === 'pt' ? 'Vídeo demo' : 'Demo video') : `${currentLang === 'pt' ? 'Tela' : 'Screen'} ${index + 1}`}"
                        >
                            <span class="featured-project-thumb-index">${image.type === 'video' ? '<i class="fas fa-play"></i>' : String(index + 1).padStart(2, '0')}</span>
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}


// The demo reel only downloads and plays while it's actually on screen
let featuredVideoObserver = null;
function watchFeaturedVideo(video) {
    if (featuredVideoObserver) {
        featuredVideoObserver.disconnect();
        featuredVideoObserver = null;
    }
    if (!video || prefersReducedMotion) return;

    if (!('IntersectionObserver' in window)) {
        video.play().catch(() => {});
        return;
    }

    featuredVideoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.35 });
    featuredVideoObserver.observe(video);
}





const featuredProjectState = {
    activeProjectIndex: 0,
    activeImageIndex: 0,
    cuedIndex: 0
};

const pickLang = value => (value && (value[currentLang] || value.en)) || '';
const trackNumber = index => String(index + 1).padStart(2, '0');

// ── Tracklist: the projects as numbered tracks; a track opens its liner notes ──
function getTrackCover(project) {
    if (!project || project.locked || !project.images) return null;
    const still = project.images.find(image => image.type !== 'video');
    const reel = project.images.find(image => image.type === 'video');
    return still ? still.src : (reel && reel.poster) || null;
}

function renderTrackPreview() {
    const preview = document.getElementById('tracklist-preview');
    if (!preview) return;
    const project = featuredProjects[featuredProjectState.cuedIndex];
    const t = translations[currentLang] || translations.en;
    const cover = getTrackCover(project);
    preview.innerHTML = cover
        ? `<img src="${cover}" alt="" decoding="async">`
        : `<div class="tracklist-preview-locked"><i class="fas fa-lock"></i><span>${t['featuredWork.lockedTitle']}</span></div>`;
}

function cueTrack(index) {
    if (index === featuredProjectState.cuedIndex) return;
    featuredProjectState.cuedIndex = index;
    renderTracklist();
    const selected = document.querySelector(`#tracklist .track[data-track="${index}"]`);
    if (selected) selected.focus({ preventScroll: true });
}

function renderTracklist() {
    const list = document.getElementById('tracklist');
    if (!list) return;
    const t = translations[currentLang] || translations.en;
    list.innerHTML = featuredProjects.map((project, index) => {
        const selected = index === featuredProjectState.cuedIndex;
        return `
        <li class="track-row ${selected ? 'is-cued' : ''}">
            <button type="button" class="track" data-track="${index}" aria-pressed="${selected}">
                <span class="track-n" aria-hidden="true">
                    <span class="track-num">${trackNumber(index)}</span>
                    <span class="track-eq"><i></i><i></i><i></i></span>
                </span>
                <span class="track-main">
                    <span class="track-title">${project.title}</span>
                    <span class="track-sub">${pickLang(project.track.sub)}</span>
                </span>
                <span class="track-stack">${project.track.stack}</span>
                <span class="track-tag">${pickLang(project.track.tag)}</span>
            </button>
            ${selected ? `
            <button type="button" class="track-more" data-track-open="${index}" aria-haspopup="dialog">
                <span>${t['liner.open']}</span>
                <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </button>` : ''}
        </li>`;
    }).join('');

    list.querySelectorAll('.track').forEach(track => {
        track.addEventListener('click', () => cueTrack(Number(track.dataset.track)));
    });
    list.querySelectorAll('[data-track-open]').forEach(button => {
        button.addEventListener('click', () => openLiner(Number(button.dataset.trackOpen), button));
    });
    renderTrackPreview();
}

// ── Liner notes: one project in full, opened from the tracklist ──
let linerReturnFocus = null;

function ensureLinerModal() {
    let modal = document.getElementById('liner-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'liner-modal';
    modal.className = 'featured-image-modal liner-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="featured-image-modal-backdrop" data-liner-close></div>
        <div class="featured-image-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="liner-title">
            <div class="featured-image-modal-header liner-header">
                <div>
                    <p class="featured-image-modal-kicker" id="liner-kicker"></p>
                    <h3 class="liner-title" id="liner-title"></h3>
                </div>
                <button type="button" class="featured-image-modal-close" data-liner-close aria-label="Close">
                    <i class="fas fa-xmark" aria-hidden="true"></i>
                </button>
            </div>
            <div class="liner-body" id="liner-body"></div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-liner-close]').forEach(element => {
        element.addEventListener('click', closeLiner);
    });
    return modal;
}

function buildLiner(project) {
    const t = translations[currentLang] || translations.en;
    const credits = [
        [t['liner.production'], 'Enzo Esmeraldo'],
        [t['liner.stack'], project.technologies.join(' · ')],
        [t['liner.status'], project.status ? pickLang(project.status) : pickLang(project.track.tag)]
    ];
    const narrative = buildFeaturedProjectNarrative(project);
    const hidden = project.deepDive
        ? `<div class="liner-hidden"><p class="liner-hidden-label">${t['liner.hidden']}</p>${buildFeaturedProjectDeepDive(project)}</div>`
        : '';

    return `
        <div class="liner-grid">
            <div class="liner-media">${buildFeaturedProjectMedia(project)}</div>
            <div class="liner-panel">
                <p class="liner-desc">${getFeaturedProjectDescription(project)}</p>
                <dl class="liner-credits">
                    ${credits.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join('')}
                </dl>
                ${buildFeaturedProjectLinks(project)}
            </div>
        </div>
        ${narrative ? `<div class="liner-narrative">${narrative}</div>` : ''}
        ${hidden}
    `;
}

function renderLiner() {
    const modal = document.getElementById('liner-modal');
    if (!modal) return;
    const index = featuredProjectState.activeProjectIndex;
    const project = featuredProjects[index];
    const t = translations[currentLang] || translations.en;
    const body = modal.querySelector('#liner-body');
    const scroll = body.scrollTop;

    modal.querySelector('#liner-kicker').textContent = `${t['liner.track']} ${trackNumber(index)} · ${t['liner.notes']}`;
    modal.querySelector('#liner-title').textContent = project.title;
    modal.querySelector('.featured-image-modal-close').setAttribute('aria-label', t['liner.close']);
    body.innerHTML = buildLiner(project);
    body.scrollTop = scroll;

    body.querySelectorAll('[data-featured-image-index]').forEach(button => {
        button.addEventListener('click', () => selectFeaturedImage(Number(button.dataset.featuredImageIndex)));
    });
    const expandButton = body.querySelector('[data-featured-expand]');
    if (expandButton) expandButton.addEventListener('click', openFeaturedImageModal);
    watchFeaturedVideo(body.querySelector('video.featured-project-primary-image'));
}

function openLiner(index, trigger) {
    const modal = ensureLinerModal();
    featuredProjectState.activeProjectIndex = index;
    featuredProjectState.activeImageIndex = 0;
    modal.querySelector('#liner-body').scrollTop = 0;
    renderLiner();

    linerReturnFocus = trigger || document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('.featured-image-modal-close').focus();
}

function isLinerOpen() {
    const modal = document.getElementById('liner-modal');
    return !!(modal && modal.classList.contains('is-open'));
}

function closeLiner() {
    const modal = document.getElementById('liner-modal');
    if (!modal || !modal.classList.contains('is-open')) return;
    const video = modal.querySelector('video');
    if (video) video.pause();
    watchFeaturedVideo(null);
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (linerReturnFocus && document.contains(linerReturnFocus)) linerReturnFocus.focus();
    linerReturnFocus = null;
}

function renderFeaturedProjects() {
    renderTracklist();
    if (isLinerOpen()) renderLiner();
}

function selectFeaturedImage(index) {
    const project = featuredProjects[featuredProjectState.activeProjectIndex];
    if (!project || !project.images || index < 0 || index >= project.images.length) return;
    featuredProjectState.activeImageIndex = index;
    renderLiner();
}

function initFeaturedProjects() {
    renderTracklist();
}

// ── Discography: each career phase is a release; a sleeve opens its notes ──
function initDiscography() {
    const tabs = Array.from(document.querySelectorAll('.release-tab'));
    if (!tabs.length) return;

    const select = (tab, focus) => {
        tabs.forEach(other => {
            const active = other === tab;
            other.setAttribute('aria-selected', String(active));
            other.tabIndex = active ? 0 : -1;
            const panel = document.getElementById(other.getAttribute('aria-controls'));
            if (panel) panel.hidden = !active;
        });
        if (focus) tab.focus();
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(tab, false));
        tab.addEventListener('keydown', event => {
            const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
            let next = null;
            if (event.key in moves) next = tabs[(index + moves[event.key] + tabs.length) % tabs.length];
            if (event.key === 'Home') next = tabs[0];
            if (event.key === 'End') next = tabs[tabs.length - 1];
            if (!next) return;
            event.preventDefault();
            select(next, true);
        });
    });
    // On a phone the shelf scrolls sideways: start it on the current release
    const shelf = document.querySelector('.shelf');
    const current = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
    if (shelf && current && shelf.scrollWidth > shelf.clientWidth) {
        shelf.scrollLeft = current.offsetLeft - shelf.offsetLeft;
    }
}

// ── Translation System ──
const translations = {
    en: {
        "liner.open": "Liner notes",
        "rel.disc2": "Disc 2",
        "rel.disc1": "Disc 1",
        "rel.now.sub": "since Nov. 2026",
        "rel.now": "Out now",
        "rel.lead.sub": "medical AI and Exitus",
        "rel.lead": "Double album",
        "rel.lead.title": "Project<br>Lead",
        "rel.full.sub": "product end to end",
        "rel.intern.sub": "front and back",
        "rel.intern.title": "Intern",
        "rel.pet.sub": "outreach and olympiad",
        "rel.pet": "Demo",
        "liner.close": "Close",
        "liner.hidden": "Hidden track",
        "liner.status": "Status",
        "liner.stack": "Stack",
        "liner.production": "Production",
        "liner.notes": "Liner notes",
        "liner.track": "Track",
        "hero.lede": "I take workflows nobody likes opening, from the clinic to QA, and turn them into software people actually want to use.",
        "hero.years": "2024 to 2026",
        // Nav
        "nav.about": "About",
        "nav.projects": "Tracklist",
        "nav.journey": "Discography",
        "nav.contact": "Contact",
        // Hero
        "hero.available": "Dev III at Radix",
        "hero.location": "Fortaleza, BR",
        "hero.headline1": "I build interfaces",
        "hero.headline2": "for messy work.",
        "hero.description": "Doctors making calls under pressure. QA teams chasing commits. Researchers buried in field data. I like taking messy workflows like these and turning them into <span class=\"text-accent font-medium\">software people actually want to open</span>, from the database all the way to the screen, with AI helping along the way. <span class=\"text-text\">I started as an intern in 2024, led projects in 2026, and today I'm a Developer III at Radix.</span>",
        "hero.viewProjects": "Play the tracklist",
        "hero.resume": "Download CV",
        "hero.scroll": "Scroll",
        "hero.role": "Software Engineer · Full Stack",
        "hero.subrole": "Developer III @ Radix",
        "hero.tl1": "2024 · Intern",
        "hero.tl2": "2025 · Fullstack Dev",
        "hero.tl3": "2026 · Project Lead",
        "hero.tl4": "Now · Dev III @ Radix",
        // Jukebox
        "jukebox.kicker": "ENZO.DEV · THE JUKEBOX",
        "jukebox.title1": "Pick a record.",
        "jukebox.title2": "The record is the theme.",
        "jukebox.moodA": "deep blue",
        "jukebox.moodB": "ink on bone",
        "jukebox.skip": "skip, keep it quiet",
        // About
        "about.label": "About the artist",
        "about.title1": "The interface is",
        "about.title2": "the product.",
        "about.offCode": "About the Developer",
        "about.title": "Enzo Esmeraldo",
        "about.description": "I went from <strong>intern to project leader in 21 months</strong>, and honestly I think it's because I treat the interface as the product, not the paint job. Whether it's an AI platform helping doctors make clinical calls or a VS Code extension that packs commits into QA evidence, the job is the same: <strong>find the part of the workflow everyone quietly hates, and make it obvious</strong>.",
        "about.bio2": "I've led teams, handling architecture, the design system, Git strategy and mentoring, and I never stopped <strong>shipping every week</strong>. Today I'm a <strong>Developer III at Radix</strong>, with an <strong>AI-native</strong> workflow: Claude Code, custom agents and skills that take me from spec to tests to pull request review.",
        "about.avatarJoke": "btw, that's me",
        "about.interests.label": "Interests",
        "about.interests.title": "Outside the editor",
        "about.funfact.label": "Fun Fact",
        "about.funfact.title": "Fav. Pokémon is Lugia",
        "about.funfact.desc": "Psychic-type elegance and legendary rarity. Basically my design philosophy, but as a Pokémon.",
        "about.current.label": "Right Now",
        "about.current.desc": "Building <strong>full stack web apps, APIs and system integrations</strong>, with Clean Architecture, automated tests and CI/CD keeping it all scalable.",
        "about.current.status": "Since Nov. 2026 · Fortaleza",
        "about.downloadCV": "Download CV",
        // Work
        "work.label": "5 tracks · 2024 to 2026",
        "work.title1": "Track",
        "work.title2": "list.",
        "work.subtitle": "Every project here does the same thing: it takes work scattered across tabs, spreadsheets and stuff only one person knows, and gives it one clear interface.",
        "featuredWork.label": "Featured Project",
        "featuredWork.subtitle": "A spotlighted case study with a presentation-style gallery, longer project context, and quick switching between featured builds.",
        "featuredWork.stack": "Tech Stack",
        "featuredWork.links": "Project Links",
        "featuredWork.preview": "Project Preview",
        "featuredWork.screens": "screens",
        "featuredWork.singleView": "Single view",
        "featuredWork.viewGithub": "GitHub",
        "featuredWork.viewDemo": "Website",
        "featuredWork.viewMarketplace": "Marketplace",
        "featuredWork.viewCaseStudy": "Case Study",
        "featuredWork.expandImage": "Expand",
        "featuredWork.problem": "Problem",
        "featuredWork.decision": "Decision that mattered",
        "featuredWork.outcome": "Outcome",
        "featuredWork.lockedTitle": "Under NDA, so no screenshots",
        "featuredWork.lockedSub": "The work is real; the pixels are classified.",
        "projects.visitGithub": "Explore more on GitHub",
        // Journey
        "journey.subtitle": "2022 to now · 5 releases",
        "journey.more": "See 3 earlier roles",
        "journey.less": "Show fewer roles",
        "journey.role1.item1": "<strong>Owned the platform end to end</strong>, from architecture and technical decisions to implementation and delivery",
        "journey.role1.item2": "<strong>Set the architecture, standards and reusable components</strong>, with Domain-Driven Design, TDD and Flyway migrations",
        "journey.role1.item3": "<strong>Built authentication and authorization with Keycloak</strong>, plus integrations, data management and enterprise workflows",
        "journey.role1.item4": "<strong>Coordinated tasks, technical decisions and priorities</strong> with stakeholders and the development team",
        "journey.role1.item5": "<strong>Drove CI/CD, code quality, automated tests and security</strong>, with Claude Code agents helping from spec to pull request review",
        "journey.role1.item6": "<strong>Turned institutional requirements into technical solutions</strong> built for usability, maintainability and scale",
        "journey.role2.item1": "<strong>Architected the full stack solution</strong> (React, Node.js, PostgreSQL) for scalability, performance and easy maintenance",
        "journey.role2.item2": "<strong>Created the visual identity and component library</strong>, designing the UI/UX from scratch",
        "journey.role2.item3": "<strong>Built AI automations</strong> for consultations and for the team's development routines",
        "journey.role2.item4": "<strong>Ran the Git workflow and mentored the team</strong> on clean code, code review and design patterns",
        "journey.role3.item1": "<strong>Designed and built interfaces in Angular and TypeScript</strong> for an intuitive, responsive experience",
        "journey.role3.item2": "<strong>Helped define the system's visual identity</strong>, keeping it consistent with the company's values",
        "journey.role3.item3": "<strong>Wrote secure business logic in Java and Spring Boot</strong>, API integrations and faster relational database access",
        "journey.role3.item4": "<strong>Integrated AI services</strong> for automated question validation, plus webhooks for cloud deployment management",
        "journey.role4.item1": "<strong>Built Exitus features</strong> with Angular and TypeScript on the front and Spring Boot on the back",
        "journey.role4.item2": "<strong>Focused on usability and accessibility</strong> in the screens I shipped",
        "journey.role5": "Scholarship Holder",
        "journey.date5": "Aug. 2022 to Oct. 2023",
        "journey.desc5": "Part of <strong>PET Computação</strong>, the Computer Science tutorial education program at UFC, on the outreach team.",
        "journey.role5.item1": "<strong>Created educational posts</strong> about technology and the computer science world",
        "journey.role5.item2": "<strong>Helped organize the Ceará Informatics Olympiad</strong>, writing and running exams across programming levels",
        "about.lead": "Full stack by trade, interface first by habit. Here's the short version of who's behind the code.",
        "about.current.title": "Developer III at Radix",
        "journey.lead": "From PET Computação in 2022 to project leader in 2026, and now <strong>Developer III at Radix</strong>.",
        "journey.now": "Now",
        "journey.focus": "What I work on",
        "journey.before": "How I got here",
        "journey.role0": "Developer III",
        "journey.date0": "Nov. 2026 to Present",
        "journey.desc0": "Building and evolving software products at <strong>Radix</strong>, with a focus on <strong>software engineering, application development and systems integration</strong>.",
        "journey.role0.item1": "<strong>Full stack web applications</strong>, from the data layer to the screen",
        "journey.role0.item2": "<strong>Modern, componentized interfaces</strong> built to be reused",
        "journey.role0.item3": "<strong>Services, APIs and integrations</strong> between systems",
        "journey.role0.item4": "<strong>Relational and non-relational</strong> data modeling",
        "journey.role0.item5": "<strong>Clean Code, SOLID and Clean Architecture</strong> for solutions that scale",
        "journey.role0.item6": "<strong>Quality, tests and CI/CD</strong> with multidisciplinary teams, driven by business needs",
        "journey.role1": "Project Leader",
        "journey.date1": "Aug. 2026 to Nov. 2026",
        "journey.desc1": "Led the technical development of <strong>Exitus Gestor</strong>, an educational management platform that pulls the institution's administrative and academic workflows into one place.",
        "journey.role2": "Project Leader",
        "journey.date2": "Jan. 2026 to Aug. 2026",
        "journey.desc2": "Led the end-to-end technical development of an <strong>AI-powered medical platform</strong> for clinical decision support, owning <strong>team, architecture and delivery</strong>.",
        "journey.role3": "FullStack Developer",
        "journey.date3": "Jan. 2025 to Mar. 2026",
        "journey.desc3": "Worked across the whole of <strong>Exitus Educacional</strong>, from interfaces to business logic, and was <strong>promoted to Full Stack Developer 2</strong> in Oct. 2025.",
        "journey.role4": "FullStack Intern",
        "journey.date4": "Apr. 2024 to Dec. 2024",
        "journey.desc4": "Where it started: the base that turned into <strong>project leadership 21 months later</strong>.",
        "journey.the": "Disco",
        "journey.title": "graphy.",
        // Footer
        "footer.label": "Bonus track",
        "footer.title1": "Let's build something",
        "footer.title2": "people actually use.",
        "footer.copyright": "&copy; 2026 Enzo Esmeraldo",
        "footer.credits": "Crafted in Fortaleza, Brazil",
        // Heatmap / Tech
        "contrib.label": "Contribution activity",
        "contrib.less": "Less",
        "contrib.more": "More",
        "tech.label": "Core stack",
        // Music
        "music.hint": "Flip the record and the theme follows"
    },
    pt: {
        "liner.open": "Ver encarte",
        "rel.disc2": "Disco 2",
        "rel.disc1": "Disco 1",
        "rel.now.sub": "desde nov. 2026",
        "rel.now": "Lançamento atual",
        "rel.lead.sub": "IA médica e Exitus",
        "rel.lead": "Álbum duplo",
        "rel.lead.title": "Líder de<br>projeto",
        "rel.full.sub": "produto de ponta a ponta",
        "rel.intern.sub": "front e back",
        "rel.intern.title": "Estágio",
        "rel.pet.sub": "extensão e olimpíada",
        "rel.pet": "Demo",
        "liner.close": "Fechar",
        "liner.hidden": "Faixa escondida",
        "liner.status": "Status",
        "liner.stack": "Stack",
        "liner.production": "Produção",
        "liner.notes": "Encarte",
        "liner.track": "Faixa",
        "hero.lede": "Pego fluxos que ninguém gosta de abrir, da clínica ao QA, e transformo em software que as pessoas querem usar de verdade.",
        "hero.years": "2024 a 2026",
        // Nav
        "nav.about": "Sobre",
        "nav.projects": "Tracklist",
        "nav.journey": "Discografia",
        "nav.contact": "Contato",
        // Hero
        "hero.available": "Dev III na Radix",
        "hero.location": "Fortaleza, BR",
        "hero.headline1": "Eu construo interfaces",
        "hero.headline2": "para trabalho bagunçado.",
        "hero.description": "Médicos decidindo sob pressão. Times de QA correndo atrás de commits. Pesquisadores soterrados em dados de campo. Eu curto pegar fluxos bagunçados assim e transformar em <span class=\"text-accent font-medium\">software que as pessoas realmente querem abrir</span>, do banco de dados até a tela, com IA ajudando no caminho. <span class=\"text-text\">Entrei como estagiário em 2024, liderei projetos em 2026 e hoje sou Desenvolvedor III na Radix.</span>",
        "hero.viewProjects": "Ouvir os projetos",
        "hero.resume": "Baixar CV",
        "hero.scroll": "Role",
        "hero.role": "Engenheiro de Software · Full Stack",
        "hero.subrole": "Desenvolvedor III @ Radix",
        "hero.tl1": "2024 · Estágio",
        "hero.tl2": "2025 · Dev Fullstack",
        "hero.tl3": "2026 · Líder de Projeto",
        "hero.tl4": "Hoje · Dev III @ Radix",
        // Jukebox
        "jukebox.kicker": "ENZO.DEV · A JUKEBOX",
        "jukebox.title1": "Escolha um disco.",
        "jukebox.title2": "O disco é o tema.",
        "jukebox.moodA": "azul profundo",
        "jukebox.moodB": "tinta no osso",
        "jukebox.skip": "pular, sem som",
        // About
        "about.label": "Sobre o artista",
        "about.title1": "A interface é",
        "about.title2": "o produto.",
        "about.offCode": "Sobre o Desenvolvedor",
        "about.title": "Enzo Esmeraldo",
        "about.description": "Fui de <strong>estagiário a líder de projeto em 21 meses</strong>, e sinceramente acho que é porque trato a interface como o produto, não como a pintura. Seja uma plataforma de IA ajudando médicos em decisões clínicas ou uma extensão do VS Code que empacota commits em evidência de QA, o trabalho é o mesmo: <strong>achar a parte do fluxo que todo mundo odeia em silêncio e deixar ela óbvia</strong>.",
        "about.bio2": "Já liderei times, cuidando de arquitetura, design system, estratégia de Git e mentoria, e nunca parei de <strong>entregar toda semana</strong>. Hoje sou <strong>Desenvolvedor III na Radix</strong>, com um workflow <strong>AI-native</strong>: Claude Code, agentes customizados e skills que me levam da spec aos testes até a revisão de pull request.",
        "about.avatarJoke": "e sim, esse sou eu",
        "about.interests.label": "Interesses",
        "about.interests.title": "Fora do editor",
        "about.funfact.label": "Curiosidade",
        "about.funfact.title": "Pokémon Fav. é Lugia",
        "about.funfact.desc": "Elegância de tipo Psíquico e raridade lendária. Basicamente minha filosofia de design, só que em forma de Pokémon.",
        "about.current.label": "Agora",
        "about.current.desc": "Construindo <strong>aplicações web full stack, APIs e integrações entre sistemas</strong>, com Clean Architecture, testes automatizados e CI/CD mantendo tudo escalável.",
        "about.current.status": "Desde nov. 2026 · Fortaleza",
        "about.downloadCV": "Baixar CV",
        // Work
        "work.label": "5 faixas · 2024 a 2026",
        "work.title1": "Track",
        "work.title2": "list.",
        "work.subtitle": "Todo projeto aqui faz a mesma coisa: pega um trabalho espalhado em abas, planilhas e coisas que só uma pessoa sabe, e dá a ele uma interface clara.",
        "featuredWork.label": "Projeto em Destaque",
        "featuredWork.subtitle": "Um destaque com galeria em estilo apresentação, contexto maior do projeto e troca rápida entre projetos em destaque.",
        "featuredWork.stack": "Tecnologias",
        "featuredWork.links": "Links do Projeto",
        "featuredWork.preview": "Preview do Projeto",
        "featuredWork.screens": "telas",
        "featuredWork.singleView": "Visual único",
        "featuredWork.viewGithub": "GitHub",
        "featuredWork.viewDemo": "Website",
        "featuredWork.viewMarketplace": "Marketplace",
        "featuredWork.viewCaseStudy": "Case Study",
        "featuredWork.expandImage": "Expandir",
        "featuredWork.problem": "Problema",
        "featuredWork.decision": "Decisão que importou",
        "featuredWork.outcome": "Resultado",
        "featuredWork.lockedTitle": "Sob NDA, então sem screenshots",
        "featuredWork.lockedSub": "O trabalho é real; os pixels são confidenciais.",
        "projects.visitGithub": "Explore mais no GitHub",
        // Journey
        "journey.subtitle": "2022 até hoje · 5 lançamentos",
        "journey.more": "Ver mais 3 experiências",
        "journey.less": "Mostrar menos",
        "journey.role1.item1": "<strong>Fui dono da plataforma de ponta a ponta</strong>, da arquitetura e das decisões técnicas até a implementação e a entrega",
        "journey.role1.item2": "<strong>Defini arquitetura, padrões e componentes reutilizáveis</strong>, com Domain-Driven Design, TDD e migrations Flyway",
        "journey.role1.item3": "<strong>Construí autenticação e autorização com Keycloak</strong>, além de integrações, gestão de dados e fluxos corporativos",
        "journey.role1.item4": "<strong>Coordenei tarefas, decisões técnicas e prioridades</strong> com stakeholders e o time de desenvolvimento",
        "journey.role1.item5": "<strong>Puxei CI/CD, qualidade de código, testes automatizados e segurança</strong>, com agentes do Claude Code ajudando da spec à revisão de pull request",
        "journey.role1.item6": "<strong>Traduzi requisitos institucionais em soluções técnicas</strong> pensadas para usabilidade, manutenção e escala",
        "journey.role2.item1": "<strong>Arquitetei a solução full stack</strong> (React, Node.js, PostgreSQL) com foco em escalabilidade, desempenho e manutenção",
        "journey.role2.item2": "<strong>Criei a identidade visual e a biblioteca de componentes</strong>, desenhando a UI/UX do zero",
        "journey.role2.item3": "<strong>Construí automações com IA</strong> para as consultas e para as rotinas de desenvolvimento do time",
        "journey.role2.item4": "<strong>Conduzi o fluxo de Git e mentorei o time</strong> em clean code, code review e design patterns",
        "journey.role3.item1": "<strong>Projetei e construí interfaces em Angular e TypeScript</strong> para uma experiência intuitiva e responsiva",
        "journey.role3.item2": "<strong>Ajudei a definir a identidade visual do sistema</strong>, mantendo coerência com os valores da empresa",
        "journey.role3.item3": "<strong>Escrevi regras de negócio seguras em Java e Spring Boot</strong>, integrações de API e acesso otimizado ao banco relacional",
        "journey.role3.item4": "<strong>Integrei serviços de IA</strong> para validação automática de questões, além de webhooks para gerenciar deploy em nuvem",
        "journey.role4.item1": "<strong>Construí funcionalidades do Exitus</strong> com Angular e TypeScript no front e Spring Boot no back",
        "journey.role4.item2": "<strong>Foco em usabilidade e acessibilidade</strong> nas telas que entreguei",
        "journey.role5": "Bolsista",
        "journey.date5": "Ago. 2022 a Out. 2023",
        "journey.desc5": "Fiz parte do <strong>PET Computação</strong>, programa de educação tutorial de Ciência da Computação da UFC, no time de divulgação.",
        "journey.role5.item1": "<strong>Criei posts educativos</strong> sobre tecnologia e o mundo da computação",
        "journey.role5.item2": "<strong>Ajudei a organizar a Olimpíada Cearense de Informática</strong>, elaborando e aplicando provas de vários níveis de programação",
        "about.lead": "Full stack de ofício, interface primeiro por hábito. Aqui vai a versão curta de quem está por trás do código.",
        "about.current.title": "Desenvolvedor III na Radix",
        "journey.lead": "Do PET Computação em 2022 a líder de projeto em 2026, e hoje <strong>Desenvolvedor III na Radix</strong>.",
        "journey.now": "Agora",
        "journey.focus": "No que eu trabalho",
        "journey.before": "Como cheguei aqui",
        "journey.role0": "Desenvolvedor III",
        "journey.date0": "Nov. 2026 até hoje",
        "journey.desc0": "Desenvolvendo e evoluindo soluções tecnológicas na <strong>Radix</strong>, com foco em <strong>engenharia de software, construção de aplicações e integração de sistemas</strong>.",
        "journey.role0.item1": "<strong>Aplicações web full stack</strong>, da camada de dados até a tela",
        "journey.role0.item2": "<strong>Interfaces modernas e componentizadas</strong>, feitas pra reuso",
        "journey.role0.item3": "<strong>Serviços, APIs e integrações</strong> entre sistemas",
        "journey.role0.item4": "Modelagem de bancos <strong>relacionais e não relacionais</strong>",
        "journey.role0.item5": "<strong>Clean Code, SOLID e Clean Architecture</strong> em soluções escaláveis",
        "journey.role0.item6": "<strong>Qualidade, testes e CI/CD</strong> com times multidisciplinares, guiados pelo negócio",
        "journey.role1": "Líder de Projeto",
        "journey.date1": "Ago. 2026 a Nov. 2026",
        "journey.desc1": "Liderei o desenvolvimento técnico do <strong>Exitus Gestor</strong>, plataforma de gestão educacional que centraliza os fluxos administrativos e acadêmicos da instituição.",
        "journey.role2": "Líder de Projeto",
        "journey.date2": "Jan. 2026 a Ago. 2026",
        "journey.desc2": "Liderei de ponta a ponta o desenvolvimento técnico de uma <strong>plataforma médica com IA</strong> para apoio à decisão clínica, cuidando de <strong>time, arquitetura e entrega</strong>.",
        "journey.role3": "Desenvolvedor FullStack",
        "journey.date3": "Jan. 2025 a Mar. 2026",
        "journey.desc3": "Atuei no <strong>Exitus Educacional</strong> inteiro, das interfaces às regras de negócio, e fui <strong>promovido a Full Stack Developer 2</strong> em out. 2025.",
        "journey.role4": "Estagiário FullStack",
        "journey.date4": "Abr. 2024 a Dez. 2024",
        "journey.desc4": "Onde tudo começou: a base que virou <strong>liderança de projeto 21 meses depois</strong>.",
        "journey.the": "Disco",
        "journey.title": "grafia.",
        // Footer
        "footer.label": "Faixa bônus",
        "footer.title1": "Vamos construir algo",
        "footer.title2": "que as pessoas realmente usem.",
        "footer.copyright": "&copy; 2026 Enzo Esmeraldo",
        "footer.credits": "Feito em Fortaleza, Brasil",
        // Heatmap / Tech
        "contrib.label": "Atividade de contribuição",
        "contrib.less": "Menos",
        "contrib.more": "Mais",
        "tech.label": "Stack principal",
        // Music
        "music.hint": "Vire o disco e o tema acompanha"
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
    const cvFile = lang === 'pt' ? 'assets/cv/CV_ENZO_ESMERALDO_LÍDER_FULLSTACK_PT.pdf' : 'assets/cv/CV_ENZO_ESMERALDO_FULLSTACK_EN.pdf';
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

document.addEventListener('DOMContentLoaded', initDiscography);
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        const imageModal = document.getElementById('featured-image-modal');
        if (imageModal && imageModal.classList.contains('is-open')) {
            closeFeaturedImageModal();
        } else {
            closeLiner();
        }
        // Escape on the jukebox = the quiet skip
        if (document.getElementById('jukebox')) {
            chooseRecord(0, { withMusic: false });
        }
    }
});
