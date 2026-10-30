// ═══════════════════════════════════════════════════
// ENZO.DEV — Script v3.0 (streaming-app shell)
// The portfolio reads like an artist page: projects are the Popular
// tracks, the career is the Discography, and the record that's
// playing tints the whole app.
// ═══════════════════════════════════════════════════

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileQuery = window.matchMedia('(max-width: 767px)');
const wideQuery = window.matchMedia('(min-width: 1280px)');
const DEFAULT_TITLE = document.title;

function t(key) {
    const active = translations[currentLang] || translations.en;
    return active[key] !== undefined ? active[key] : (translations.en[key] || '');
}

function pick(value) {
    if (!value) return '';
    return value[currentLang] || value.en || '';
}

function stripTags(html) {
    return String(html || '').replace(/<[^>]*>/g, '');
}

// ── CV Download Feedback ──
function checkCV(e) {
    const btn = e.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>DOWNLOADED ✓</span>';
    setTimeout(() => btn.innerHTML = originalText, 2000);
}

// ── Toast: the little white confirmation above the player ──
const toast = document.getElementById('sp-toast');
let toastTimer = null;

function showToast(message) {
    if (!toast || !message) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

// ── Records: what's playing is also the theme ──
const songs = [
    {
        id: 'oxygen',
        title: "Oxygen",
        artist: "Porch Light",
        file: "assets/songs/Porch_light_-_Oxygen_(SkySound.cc).mp3",
        cover: "assets/albumCovers/oxygenPorchLight.jpg",
        heroBg: "assets/backgrounds/catwhaleshark.jpg",
        mood: { en: 'deep blue', pt: 'azul profundo' },
        easterEgg: {
            en: "Oxygen mode: quiet blue focus.",
            pt: "Modo Oxygen: foco azul e tranquilo."
        },
        consoleMsg: ["color: #7aa9d8; font-size: 13px; font-weight: bold;", "Porch Light / Oxygen theme loaded."],
        theme: {
            accent: "122 169 216",
            tint: "45 74 112",
            heat: [
                "rgba(255,255,255,0.06)",
                "rgba(122,169,216,0.22)",
                "rgba(122,169,216,0.4)",
                "rgba(122,169,216,0.66)",
                "rgba(235,247,255,0.95)"
            ]
        }
    },
    {
        id: 'deftones',
        title: "Change (In the House of Flies)",
        artist: "Deftones",
        file: "assets/songs/Deftones - Change (In the House of Flies).mp3",
        cover: "assets/albumCovers/DeftonesCover.jpg",
        heroBg: "assets/backgrounds/black_and_white.jpg",
        mood: { en: 'ink on bone', pt: 'tinta no osso' },
        easterEgg: {
            en: "Change mode: clean lines, no noise.",
            pt: "Modo Change: linhas limpas, sem ruído."
        },
        consoleMsg: ["color: #111111; font-size: 13px; font-weight: bold;", "Deftones / Change theme loaded."],
        theme: {
            accent: "236 236 230",
            tint: "92 92 88",
            heat: [
                "rgba(255,255,255,0.06)",
                "rgba(255,255,255,0.18)",
                "rgba(255,255,255,0.36)",
                "rgba(255,255,255,0.62)",
                "rgba(255,255,255,0.94)"
            ]
        }
    }
];

let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isSeeking = false;
const audioPlayer = new Audio();
// Don't pull a 4–7 MB track on page load; fetch it when the visitor actually hits play.
audioPlayer.preload = 'none';
audioPlayer.volume = 0.4;

const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const albumArt = document.getElementById('album-art');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const progressRange = document.getElementById('progress-range');
const progressLine = document.getElementById('progress-bar');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const volumeRange = document.getElementById('volume-range');
const muteBtn = document.getElementById('mute-btn');
const npToggle = document.getElementById('np-toggle');
const heroBg = document.getElementById('sp-hero-bg');

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const whole = Math.floor(seconds);
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function setRangeFill(range, ratio) {
    if (range) range.style.setProperty('--fill', `${Math.max(0, Math.min(1, ratio)) * 100}%`);
}

function setPlayingState(playing) {
    isPlaying = playing;
    document.body.classList.toggle('is-playing', playing);
    const label = playing ? t('sp.pause') : t('sp.play');
    document.querySelectorAll('[data-sp-play], #play-btn').forEach(button => button.setAttribute('aria-label', label));
    syncLibraryPlayback();
}

function playAudio() {
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
        playPromise.then(() => setPlayingState(true)).catch(() => setPlayingState(false));
    } else {
        setPlayingState(true);
    }
}

function pauseAudio() {
    audioPlayer.pause();
    setPlayingState(false);
}

function togglePlay() {
    if (isPlaying) pauseAudio();
    else playAudio();
}

// ── Theme: accent + tint come from the record ──
let themeLoadedOnce = false;
let themeSwitchTimer = null;

function applyRecordTheme(song) {
    if (themeLoadedOnce) {
        document.body.classList.add('theme-switching');
        clearTimeout(themeSwitchTimer);
        themeSwitchTimer = setTimeout(() => document.body.classList.remove('theme-switching'), 600);
    }
    themeLoadedOnce = true;

    const root = document.documentElement;
    root.style.setProperty('--accent-rgb', song.theme.accent);
    root.style.setProperty('--tint-rgb', song.theme.tint);
    song.theme.heat.forEach((value, level) => root.style.setProperty(`--heat-${level}`, value));
    document.body.dataset.musicTheme = song.id;
    updateFavicon(`rgb(${song.theme.accent})`);
}

function swapHeroBackground(src, animate) {
    if (!heroBg) return;
    if (!animate || prefersReducedMotion) {
        heroBg.style.backgroundImage = `url('${src}')`;
        return;
    }
    // Crossfade: preload, fade out, swap, fade back in
    const swap = () => {
        heroBg.style.backgroundImage = `url('${src}')`;
        heroBg.style.opacity = '';
    };
    const img = new Image();
    heroBg.style.opacity = '0';
    img.onload = () => setTimeout(swap, 300);
    img.onerror = swap;
    img.src = src;
}

function renderNowPlaying() {
    const song = songs[currentSongIndex];
    const next = songs[(currentSongIndex + 1) % songs.length];

    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    albumArt.style.backgroundImage = `url('${song.cover}')`;

    const set = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    set('np-title', song.title);
    set('np-artist', song.artist);
    set('np-mood', pick(song.mood));
    set('np-egg', pick(song.easterEgg));
    set('np-next-title', next.title);
    set('np-next-artist', next.artist);

    const npCover = document.getElementById('np-cover');
    if (npCover) {
        npCover.src = song.cover;
        npCover.alt = `${song.title} by ${song.artist}, album cover`;
    }
    const npNextCover = document.getElementById('np-next-cover');
    if (npNextCover) npNextCover.src = next.cover;

    syncLikeButtons();
}

function loadSong(index, { announce = false } = {}) {
    currentSongIndex = (index + songs.length) % songs.length;
    const song = songs[currentSongIndex];
    const isSwitch = themeLoadedOnce;

    audioPlayer.src = song.file;
    progressRange.value = 0;
    setRangeFill(progressRange, 0);
    if (progressLine) progressLine.style.width = '0%';
    timeCurrent.textContent = '0:00';
    timeTotal.textContent = '0:00';

    swapHeroBackground(song.heroBg, isSwitch);
    applyRecordTheme(song);
    renderNowPlaying();
    localStorage.setItem('jukebox-side', String(currentSongIndex));
    syncLibraryPlayback();

    if (announce) {
        showToast(pick(song.easterEgg));
        console.log(`%c${song.consoleMsg[1]}`, song.consoleMsg[0]);
    }
}

function playSong(index) {
    loadSong(index, { announce: index !== currentSongIndex || !isPlaying });
    playAudio();
}

function nextSong() {
    const nextIndex = isShuffle
        ? Math.floor(Math.random() * songs.length)
        : currentSongIndex + 1;
    playSong(nextIndex);
}

function prevSong() {
    // Like any player: past the first few seconds, "previous" restarts the track
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
        return;
    }
    playSong(currentSongIndex - 1);
}

// Flip the record: swaps the theme, keeps the music state as-is
function flipRecord() {
    loadSong(currentSongIndex + 1, { announce: true });
    if (isPlaying) playAudio();
}

// Library / queue clicks: same record toggles, another one starts playing
function selectRecord(index) {
    if (index === currentSongIndex) {
        togglePlay();
        return;
    }
    playSong(index);
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

// ── Progress + volume ──
function updateProgress() {
    const { duration, currentTime } = audioPlayer;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const ratio = currentTime / duration;
    if (!isSeeking) {
        progressRange.value = Math.round(ratio * 1000);
        setRangeFill(progressRange, ratio);
        timeCurrent.textContent = formatTime(currentTime);
    }
    if (progressLine) progressLine.style.width = `${ratio * 100}%`;
}

function seekFromRange() {
    const ratio = Number(progressRange.value) / 1000;
    setRangeFill(progressRange, ratio);
    if (Number.isFinite(audioPlayer.duration)) {
        timeCurrent.textContent = formatTime(ratio * audioPlayer.duration);
    }
}

function commitSeek() {
    isSeeking = false;
    if (Number.isFinite(audioPlayer.duration)) {
        audioPlayer.currentTime = (Number(progressRange.value) / 1000) * audioPlayer.duration;
    }
}

let volumeBeforeMute = 0.4;

function setVolume(volume) {
    audioPlayer.volume = Math.max(0, Math.min(1, volume));
    volumeRange.value = Math.round(audioPlayer.volume * 100);
    setRangeFill(volumeRange, audioPlayer.volume);
    const icon = muteBtn.querySelector('i');
    icon.className = audioPlayer.volume === 0
        ? 'fas fa-volume-xmark'
        : audioPlayer.volume < 0.5 ? 'fas fa-volume-low' : 'fas fa-volume-high';
    muteBtn.setAttribute('aria-label', audioPlayer.volume === 0 ? t('sp.unmute') : t('sp.mute'));
}

function toggleMute() {
    if (audioPlayer.volume > 0) {
        volumeBeforeMute = audioPlayer.volume;
        setVolume(0);
    } else {
        setVolume(volumeBeforeMute || 0.4);
    }
}

audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatTime(audioPlayer.duration);
});
audioPlayer.addEventListener('ended', nextSong);
audioPlayer.addEventListener('error', () => {
    if (!audioPlayer.getAttribute('src')) return;
    console.error("Error loading audio:", audioPlayer.src);
    setPlayingState(false);
});

progressRange.addEventListener('pointerdown', () => { isSeeking = true; });
progressRange.addEventListener('input', () => { isSeeking = true; seekFromRange(); });
progressRange.addEventListener('change', commitSeek);
volumeRange.addEventListener('input', () => setVolume(Number(volumeRange.value) / 100));
muteBtn.addEventListener('click', toggleMute);

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
document.getElementById('theme-flip').addEventListener('click', flipRecord);
document.getElementById('np-next').addEventListener('click', () => playSong(currentSongIndex + 1));

shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.setAttribute('aria-pressed', String(isShuffle));
});

repeatBtn.addEventListener('click', () => {
    audioPlayer.loop = !audioPlayer.loop;
    repeatBtn.setAttribute('aria-pressed', String(audioPlayer.loop));
});

// Every big round play button on the page drives the same player
document.addEventListener('click', event => {
    if (event.target.closest('[data-sp-play]')) togglePlay();
});

// ── Liked Records ──
const likedRecords = new Set(JSON.parse(localStorage.getItem('sp-liked') || '[]'));

function syncLikeButtons() {
    const liked = likedRecords.has(songs[currentSongIndex].id);
    document.querySelectorAll('[data-sp-like]').forEach(button => {
        button.setAttribute('aria-pressed', String(liked));
        button.setAttribute('aria-label', liked ? t('sp.like.remove') : t('sp.like.add'));
    });
}

function toggleLike() {
    const id = songs[currentSongIndex].id;
    if (likedRecords.has(id)) {
        likedRecords.delete(id);
        showToast(t('sp.like.removed'));
    } else {
        likedRecords.add(id);
        showToast(t('sp.like.added'));
    }
    localStorage.setItem('sp-liked', JSON.stringify([...likedRecords]));
    syncLikeButtons();
}

document.querySelectorAll('[data-sp-like]').forEach(button => button.addEventListener('click', toggleLike));

// ── Now playing view ──
function setNowPlayingOpen(open) {
    document.body.classList.toggle('np-open', open);
    npToggle.setAttribute('aria-pressed', String(open));
    // Only the side-panel layout remembers the choice; the overlay/sheet always starts closed
    if (wideQuery.matches) localStorage.setItem('sp-np-open', open ? '1' : '0');
}

function initNowPlaying() {
    const saved = localStorage.getItem('sp-np-open');
    setNowPlayingOpen(wideQuery.matches && saved !== '0');
}

npToggle.addEventListener('click', () => setNowPlayingOpen(!document.body.classList.contains('np-open')));
document.getElementById('np-close').addEventListener('click', () => setNowPlayingOpen(false));
['album-art', 'sp-player-meta'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => setNowPlayingOpen(!document.body.classList.contains('np-open')));
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
        renderListeners(null);
        return;
    }

    const sum = contributions.reduce((acc, item) => acc + (Number(item.count) || 0), 0);
    const totalCount = heatmapData && heatmapData.total && typeof heatmapData.total.lastYear === 'number' ? heatmapData.total.lastYear : sum;
    const word = totalCount === 1
        ? (currentLang === 'pt' ? 'contribuição' : 'contribution')
        : (currentLang === 'pt' ? 'contribuições' : 'contributions');
    total.textContent = `${totalCount} ${word} · ${getContributionRange(contributions)}`;
    renderListeners(totalCount);
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

// ── Also on repeat: interests as round "artist" cards ──
const aboutInterests = [
    {
        id: 'lugia',
        art: { img: 'assets/icons/LugiaLittleIcon.png', rgb: '96 120 196' },
        label: { en: 'Lugia', pt: 'Lugia' },
        kind: { en: 'Fun fact', pt: 'Curiosidade' },
        text: {
            en: '<strong>Fav. Pokémon is Lugia.</strong> Psychic-type elegance and legendary rarity. Basically my design philosophy, but as a Pokémon.',
            pt: '<strong>Pokémon favorito é o Lugia.</strong> Elegância de tipo Psíquico e raridade lendária. Basicamente minha filosofia de design, só que em forma de Pokémon.'
        }
    },
    {
        id: 'hype-focus',
        art: { img: 'assets/icons/fish.svg', rgb: '38 112 150' },
        label: { en: 'Hype Focus', pt: 'Hype Focus' },
        kind: { en: 'Pokémon & sharks', pt: 'Pokémon e tubarões' },
        text: {
            en: '<strong>Pokemon and sharks</strong> are my main hype focus: <strong>Lugia</strong>, <strong>Gengar</strong>, and <strong>Arcanine</strong> for personality and style; <strong>whale sharks</strong> and <strong>hammerheads</strong> for calm scale, sharp silhouettes, and natural design energy.',
            pt: '<strong>Pokemon e tubarões</strong> são meu principal hype focus: <strong>Lugia</strong>, <strong>Gengar</strong> e <strong>Arcanine</strong> por personalidade e estilo; <strong>tubarões-baleia</strong> e <strong>tubarões-martelo</strong> por escala calma, silhuetas marcantes e energia de design natural.'
        }
    },
    {
        id: 'interests',
        art: { icon: 'fas fa-gamepad', rgb: '160 58 92' },
        label: { en: 'Games & anime', pt: 'Jogos e animes' },
        kind: { en: 'Interests', pt: 'Interesses' },
        text: {
            en: '<strong>Games and anime</strong> keep me close to strategy, pacing, and memorable worlds: <strong>Valorant</strong>, <strong>Elden Ring</strong>, <strong>Attack on Titan</strong>, <strong>Hunter x Hunter</strong>, and <strong>Code Geass</strong>.',
            pt: '<strong>Jogos e animes</strong> me mantêm perto de estratégia, ritmo e mundos memoráveis: <strong>Valorant</strong>, <strong>Elden Ring</strong>, <strong>Attack on Titan</strong>, <strong>Hunter x Hunter</strong> e <strong>Code Geass</strong>.'
        }
    },
    {
        id: 'learning',
        art: { icon: 'fas fa-language', rgb: '52 128 88' },
        label: { en: 'AI & Mandarin', pt: 'IA e mandarim' },
        kind: { en: 'Learning', pt: 'Aprendizado' },
        text: {
            en: '<strong>Current learning:</strong> building practical <strong>AI automations</strong> with <strong>Claude</strong> and <strong>Gemini</strong>, designing reusable skills, mapping workflow steps, and studying <strong>Chinese / Mandarin</strong> with consistency.',
            pt: '<strong>Aprendizado atual:</strong> criando <strong>automações práticas com IA</strong> usando <strong>Claude</strong> e <strong>Gemini</strong>, desenhando skills reutilizáveis, mapeando etapas de workflow e estudando <strong>chinês / mandarim</strong> com consistência.'
        }
    }
];

let activeAboutInterestId = 'hype-focus';

function roundArtMarkup(art) {
    const inner = art.img
        ? `<img src="${art.img}" alt="" loading="lazy" decoding="async">`
        : `<i class="${art.icon}" aria-hidden="true"></i>`;
    return `<span class="sp-round-art" style="--art: ${art.rgb};">${inner}</span>`;
}

function renderAboutInterests() {
    const buttons = document.getElementById('about-interest-buttons');
    const text = document.getElementById('about-interest-text');
    if (!buttons || !text) return;

    const activeInterest = aboutInterests.find(interest => interest.id === activeAboutInterestId) || aboutInterests[0];

    buttons.innerHTML = aboutInterests.map(interest => {
        const isActive = interest.id === activeInterest.id;
        return `
            <button type="button" class="sp-card is-round" role="tab" data-about-interest="${interest.id}" aria-selected="${isActive}">
                <span class="sp-card-cover">${roundArtMarkup(interest.art)}</span>
                <span class="sp-card-title">${pick(interest.label)}</span>
                <span class="sp-card-sub">${pick(interest.kind)}</span>
            </button>
        `;
    }).join('');

    text.innerHTML = pick(activeInterest.text);

    buttons.querySelectorAll('[data-about-interest]').forEach(button => {
        button.addEventListener('click', () => {
            activeAboutInterestId = button.dataset.aboutInterest;
            renderAboutInterests();
        });
    });
}

// ── Discography: one release per role. Text lives in translations (journey.role{n}.*) ──
// Release type follows the track count, like a real catalog: 1 = single, 2–3 = EP, 4+ = album.
const careerRoles = [
    { year: 2026, company: 'Colégio Christus', tracks: 5, mix: '80 155 245', short: { en: 'Engineer', pt: 'Engenheiro' }, current: true },
    { year: 2026, company: 'Colégio Christus', tracks: 3, mix: '141 103 171', short: { en: 'Lead', pt: 'Líder' } },
    { year: 2025, company: 'Colégio Christus', tracks: 2, mix: '232 17 91', short: { en: 'Fullstack', pt: 'Fullstack' } },
    { year: 2024, company: 'Colégio Christus', tracks: 1, mix: '188 89 0', short: { en: 'Intern', pt: 'Estágio' } }
];

function releaseType(role) {
    if (role.tracks >= 4) return t('sp.release.album');
    if (role.tracks >= 2) return t('sp.release.ep');
    return t('sp.release.single');
}

function mixCoverMarkup(role, extraClass = '') {
    return `
        <span class="sp-mix ${extraClass}" style="--mix: ${role.mix};">
            <span class="sp-mix-top">Christus</span>
            <span class="sp-mix-band"><span class="sp-mix-label">${pick(role.short)}</span><span class="sp-mix-num">${String(role.year).slice(2)}</span></span>
        </span>
    `;
}

function careerCardMarkup(role, index) {
    const sub = `${role.current ? `${t('sp.latest')} • ` : ''}${role.year} • ${releaseType(role)}`;
    return `
        <a class="sp-card" href="#/career/${index}">
            <span class="sp-card-cover">
                ${mixCoverMarkup(role)}
                <span class="sp-play-btn sp-card-play" aria-hidden="true"><i class="fas fa-play"></i></span>
            </span>
            <span class="sp-card-title">${t(`journey.role${index}`)}</span>
            <span class="sp-card-sub">${sub}</span>
        </a>
    `;
}

function renderDiscography() {
    const shelf = document.getElementById('sp-discography');
    if (!shelf) return;
    shelf.innerHTML = careerRoles.map(careerCardMarkup).join('');
}

// ── Featured Projects Spotlight ──
// Order is deliberate: lead with the live product (and its demo reel), then the most professional artifact, then the NDA flagship.
const featuredProjects = [
    {
        id: 'pokemon-team-builder',
        tint: '176 52 64',
        title: 'Pokémon Team Builder',
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
        tint: '64 84 168',
        title: 'QAssistant',
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
        tint: '36 110 100',
        title: 'AI Medical Platform',
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
        tint: '150 104 48',
        title: 'Dino Library',
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
        tint: '28 104 138',
        title: 'AquaCensus',
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

const featuredProjectState = {
    activeProjectIndex: 0,
    activeImageIndex: 0
};

function getFeaturedProjectCopy() {
    const activeTranslations = translations[currentLang] || translations.en;
    return {
        stack: activeTranslations['featuredWork.stack'],
        links: activeTranslations['featuredWork.links'],
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

// The case study body under a project page's header: gallery, narrative, stack, links, deep dive
function renderFeaturedProjectStage() {
    const stage = document.getElementById('featured-project-stage');
    if (!stage) return;

    const project = featuredProjects[featuredProjectState.activeProjectIndex];
    if (!project || (!project.locked && (!project.images || !project.images.length))) {
        stage.innerHTML = '';
        return;
    }

    const copy = getFeaturedProjectCopy();

    stage.innerHTML = `
        <div class="featured-project-layout">
            ${buildFeaturedProjectMedia(project)}

            <div class="featured-project-panel">
                <p class="featured-project-description">${getFeaturedProjectDescription(project)}</p>

                ${buildFeaturedProjectNarrative(project)}

                <div class="featured-project-section">
                    <p class="featured-project-section-label">${copy.stack}</p>
                    <div class="featured-project-tech">
                        ${project.technologies.map(technology => `<span class="project-tag">${technology}</span>`).join('')}
                    </div>
                </div>

                ${buildFeaturedProjectLinks(project)}
            </div>
        </div>
        ${buildFeaturedProjectDeepDive(project)}
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

    watchFeaturedVideo(stage.querySelector('video.featured-project-primary-image'));
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

function selectFeaturedImage(index) {
    const project = featuredProjects[featuredProjectState.activeProjectIndex];
    if (!project || !project.images || index < 0 || index >= project.images.length) return;

    featuredProjectState.activeImageIndex = index;
    renderFeaturedProjectStage();
}

// ── Translation System ──
const translations = {
    en: {
        // Hero
        "hero.available": "Open to work",
        "hero.location": "Fortaleza, BR",
        "hero.headline1": "I build interfaces",
        "hero.headline2": "for messy work.",
        "hero.resume": "DOWNLOAD CV",
        "hero.role": "Fullstack Engineer · Tech Lead",
        // About
        "about.label": "About",
        "about.description": "I went from <strong>intern to project leader in 21 months</strong>, and honestly I think it's because I treat the interface as the product, not the paint job. Whether it's an AI platform helping doctors make clinical calls or a VS Code extension that packs commits into QA evidence, the job is the same: <strong>find the part of the workflow everyone quietly hates, and make it obvious</strong>.",
        "about.bio2": "I've led a team, handling architecture, the design system, Git strategy and mentoring, and I never stopped <strong>shipping every week</strong>. My workflow is <strong>AI-native</strong>: Claude Code, custom agents and skills that take me from spec to tests to pull request review.",
        "about.avatarJoke": "btw, that's me",
        "about.interests.title": "Outside the editor",
        "about.current.label": "Currently Building",
        "about.current.desc": "<strong>Exitus Gestor</strong>, across the whole stack. That means a PostgreSQL data model, a Spring Boot domain layer split with Domain-Driven Design and Angular on the front, with TDD, Flyway migrations and <strong>Claude Code agents</strong> helping out.",
        "about.current.status": "In active development",
        // Work
        "featuredWork.stack": "Tech Stack",
        "featuredWork.links": "Project Links",
        "featuredWork.screens": "screens",
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
        "journey.role0": "Fullstack Engineer",
        "journey.date0": "Jul. 2026 to Present",
        "journey.status0": "Current · Angular + Spring Boot",
        "journey.desc0": "Structuring <strong>Exitus Gestor</strong> end to end, so the data model, back-end and interface are all <strong>speaking the same domain language</strong>. Domain-Driven Design, TDD and an <strong>AI-native workflow</strong> keep it that way.",
        "journey.role0.item1": "<strong>Structure Exitus Gestor across the whole stack</strong>: PostgreSQL data model, Spring Boot domain layer, and Angular applications integrated with its RESTful APIs",
        "journey.role0.item2": "<strong>Apply Domain-Driven Design</strong> to split the platform into services with explicit boundaries and contracts, so each one evolves and deploys without coupling",
        "journey.role0.item3": "<strong>Drive Test-Driven Development</strong>, with business rules explicit and covered by tests from day one",
        "journey.role0.item4": "Version every schema change with <strong>Flyway migrations</strong>, making database evolution reproducible across environments",
        "journey.role0.item5": "<strong>Build agentic development workflows with Claude Code</strong>, with custom agents, skills and automated flows from spec to tests, and automate pull request review with AI",
        "journey.role1": "Project Leader",
        "journey.date1": "Jan. 2026 to Jun. 2026",
        "journey.status1": "Completed · React + Node.js + PostgreSQL",
        "journey.desc1": "Promoted <strong>within the same company</strong> to <strong>Project Leader</strong>, owning an AI-assisted medical platform end to end: <strong>team, architecture and delivery</strong>, from vision to deployment.",
        "journey.role1.item1": "<strong>Led the end-to-end development</strong> of an AI-assisted medical platform for clinical decision support, including AI automations for consultations and development routines",
        "journey.role1.item2": "<strong>Architected the fullstack solution</strong> (data model, Node.js services and React front-end) for scalability, performance and maintainability",
        "journey.role1.item3": "<strong>Mentored the team</strong> on Git workflows, code reviews, clean code, and design patterns",
        "journey.role2": "FullStack Developer",
        "journey.date2": "Jan. 2025 to Dec. 2025",
        "journey.status2": "Completed · Angular + Spring Boot",
        "journey.desc2": "Advanced <strong>within the same company</strong> to a <strong>FullStack Developer</strong> role, owning the Exitus educational system across front-end, back-end, and database.",
        "journey.role2.item1": "<strong>Developed the Exitus educational system end-to-end</strong>, across front-end, back-end, and database",
        "journey.role2.item2": "<strong>Integrated AI services</strong> for automated question validation and built webhook integrations with cloud deployment management",
        "journey.role3": "FullStack Intern",
        "journey.date3": "Apr. 2024 to Dec. 2024",
        "journey.status3": "Completed · Angular + Spring Boot",
        "journey.desc3": "Started out as a <strong>FullStack Intern</strong>. That's the base that turned into project leadership 21 months later.",
        "journey.role3.item1": "<strong>Built Exitus features</strong> with Angular and TypeScript on the front and Spring Boot on the back, focusing on usability and accessibility",
        // Footer
        "footer.label": "Get In Touch",
        "footer.title1": "Let's build something",
        "footer.title2": "people actually use.",
        "footer.copyright": "&copy; 2026 Enzo Esmeraldo",
        "footer.credits": "Recorded in Fortaleza, BR. Mixed in VS Code.",
        // Heatmap / Tech
        "contrib.label": "Contribution Activity",
        "contrib.less": "Less",
        "contrib.more": "More",
        "tech.label": "Core Stack",
        // Music
        "music.hint": "Flip the record and the theme follows",
        // Streaming shell
        "sp.skip": "Skip to content",
        "sp.home": "Home",
        "sp.search": "Search",
        "sp.search.placeholder": "What do you want to see?",
        "sp.search.browse": "Browse all",
        "sp.library": "Your Library",
        "sp.library.collapse": "Collapse Your Library",
        "sp.library.expand": "Expand Your Library",
        "sp.library.create": "Start a project with me",
        "sp.library.createShort": "Create",
        "sp.library.filter": "Search in Your Library",
        "sp.library.recents": "Recents",
        "sp.library.empty": "Nothing in your library matches that.",
        "sp.chip.projects": "Projects",
        "sp.chip.career": "Career",
        "sp.chip.records": "Records",
        "sp.type.artist": "Artist",
        "sp.type.song": "Song",
        "sp.type.project": "Project",
        "sp.type.caseStudy": "Case study",
        "sp.release.album": "Album",
        "sp.release.ep": "EP",
        "sp.release.single": "Single",
        "sp.latest": "Latest release",
        "sp.badge.live": "Live",
        "sp.verified": "Verified Engineer",
        "sp.play": "Play",
        "sp.pause": "Pause",
        "sp.prev": "Previous",
        "sp.next": "Next",
        "sp.shuffle": "Shuffle",
        "sp.repeat.btn": "Repeat",
        "sp.mute": "Mute",
        "sp.unmute": "Unmute",
        "sp.follow": "Follow",
        "sp.share": "Copy link",
        "sp.copyLink": "Copy link to profile",
        "sp.copied": "Link copied to clipboard",
        "sp.openSite": "Open website",
        "sp.popular": "Popular",
        "sp.pick": "Artist pick",
        "sp.discography": "Discography",
        "sp.showAll": "Show all",
        "sp.repeat": "Also on repeat",
        "sp.tour": "On tour",
        "sp.tour.remote": "Remote-friendly",
        "sp.tour.cta": "Get in touch",
        "sp.tour.connect": "Connect",
        "sp.tour.setlist": "See the setlist",
        "sp.footer.downloads": "Downloads",
        "sp.listeners": "contributions in the last year",
        "sp.np.title": "Now playing",
        "sp.np.open": "Open Now playing view",
        "sp.np.why": "The record is the theme",
        "sp.np.next": "Next in queue",
        "sp.np.credits": "Credits",
        "sp.close": "Close",
        "sp.credits.design": "Design, code, everything",
        "sp.credits.built": "Built with",
        "sp.credits.session": "Session musician",
        "sp.like.add": "Save to Liked Records",
        "sp.like.remove": "Remove from Liked Records",
        "sp.like.added": "Added to Liked Records",
        "sp.like.removed": "Removed from Liked Records",
        "sp.screen": "screen",
        "sp.achievement": "achievement",
        "sp.achievements": "achievements",
        "sp.title": "Title",
        "sp.more.by": "More by Enzo Esmeraldo",
        "sp.more.releases": "More releases",
        "sp.browse": "Browse all",
        "sp.topResult": "Top result",
        "sp.noResults": "No results found for",
        "sp.noResults.hint": "Check the spelling, or try a technology like React or Spring Boot."
    },
    pt: {
        // Hero
        "hero.available": "Aberto a trabalho",
        "hero.location": "Fortaleza, BR",
        "hero.headline1": "Eu construo interfaces",
        "hero.headline2": "para trabalho bagunçado.",
        "hero.resume": "BAIXAR CV",
        "hero.role": "Engenheiro Fullstack · Tech Lead",
        // About
        "about.label": "Sobre",
        "about.description": "Fui de <strong>estagiário a líder de projeto em 21 meses</strong>, e sinceramente acho que é porque trato a interface como o produto, não como a pintura. Seja uma plataforma de IA ajudando médicos em decisões clínicas ou uma extensão do VS Code que empacota commits em evidência de QA, o trabalho é o mesmo: <strong>achar a parte do fluxo que todo mundo odeia em silêncio e deixar ela óbvia</strong>.",
        "about.bio2": "Já liderei um time, cuidando de arquitetura, design system, estratégia de Git e mentoria, e nunca parei de <strong>entregar toda semana</strong>. Meu workflow é <strong>AI-native</strong>: Claude Code, agentes customizados e skills que me levam da spec aos testes até a revisão de pull request.",
        "about.avatarJoke": "e sim, esse sou eu",
        "about.interests.title": "Fora do editor",
        "about.current.label": "Em Desenvolvimento",
        "about.current.desc": "<strong>Exitus Gestor</strong>, na stack inteira. Isso inclui modelo de dados em PostgreSQL, camada de domínio em Spring Boot dividida com Domain-Driven Design e Angular no front, com TDD, migrations Flyway e <strong>agentes do Claude Code</strong> ajudando no caminho.",
        "about.current.status": "Em desenvolvimento ativo",
        // Work
        "featuredWork.stack": "Tecnologias",
        "featuredWork.links": "Links do Projeto",
        "featuredWork.screens": "telas",
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
        "journey.role0": "Engenheiro Fullstack",
        "journey.date0": "Jul. 2026 até hoje",
        "journey.status0": "Atual · Angular + Spring Boot",
        "journey.desc0": "Estruturando o <strong>Exitus Gestor</strong> de ponta a ponta, pra que modelo de dados, back-end e interface <strong>falem a mesma língua de domínio</strong>. Domain-Driven Design, TDD e um <strong>workflow AI-native</strong> mantêm tudo assim.",
        "journey.role0.item1": "<strong>Estruturo o Exitus Gestor na stack inteira</strong>: modelo de dados em PostgreSQL, camada de domínio em Spring Boot e aplicações Angular integradas às suas APIs RESTful",
        "journey.role0.item2": "<strong>Aplico Domain-Driven Design</strong> para dividir a plataforma em serviços com fronteiras e contratos explícitos, para que cada um evolua e faça deploy sem acoplamento",
        "journey.role0.item3": "<strong>Conduzo Test-Driven Development</strong>, com regras de negócio explícitas e cobertas por testes desde o primeiro dia",
        "journey.role0.item4": "Versiono cada mudança de schema com <strong>migrations Flyway</strong>, tornando a evolução do banco reproduzível entre ambientes",
        "journey.role0.item5": "<strong>Construo workflows agênticos de desenvolvimento com Claude Code</strong>, com agentes customizados, skills e fluxos automatizados da spec aos testes, e automatizo a revisão de pull requests com IA",
        "journey.role1": "Líder de Projeto",
        "journey.date1": "Jan. 2026 a Jun. 2026",
        "journey.status1": "Concluído · React + Node.js + PostgreSQL",
        "journey.desc1": "Promovido <strong>dentro da mesma empresa</strong> a <strong>Líder de Projeto</strong>, responsável por uma plataforma médica assistida por IA de ponta a ponta: <strong>time, arquitetura e entrega</strong>, da visão ao deploy.",
        "journey.role1.item1": "<strong>Liderei o desenvolvimento completo</strong> de uma plataforma médica assistida por IA para apoio à decisão clínica, incluindo automações com IA para consultas e rotinas de desenvolvimento",
        "journey.role1.item2": "<strong>Arquitetei a solução fullstack</strong> (modelo de dados, serviços em Node.js e front-end em React) com foco em escalabilidade, desempenho e manutenibilidade",
        "journey.role1.item3": "<strong>Mentorei o time</strong> em fluxos Git, code review, clean code e design patterns",
        "journey.role2": "Desenvolvedor FullStack",
        "journey.date2": "Jan. 2025 a Dez. 2025",
        "journey.status2": "Concluído · Angular + Spring Boot",
        "journey.desc2": "Avancei <strong>dentro da mesma empresa</strong> para o papel de <strong>Desenvolvedor FullStack</strong>, responsável pelo sistema educacional Exitus no front-end, back-end e banco de dados.",
        "journey.role2.item1": "<strong>Desenvolvi o sistema educacional Exitus de ponta a ponta</strong>, no front-end, back-end e banco de dados",
        "journey.role2.item2": "<strong>Integrei serviços de IA</strong> para validação automática de questões e construí integrações via webhooks com gerenciamento de deploy em nuvem",
        "journey.role3": "Estagiário FullStack",
        "journey.date3": "Abr. 2024 a Dez. 2024",
        "journey.status3": "Concluído · Angular + Spring Boot",
        "journey.desc3": "Comecei como <strong>Estagiário FullStack</strong>. Foi essa base que virou liderança de projeto 21 meses depois.",
        "journey.role3.item1": "<strong>Construí funcionalidades do Exitus</strong> com Angular e TypeScript no front e Spring Boot no back, com foco em usabilidade e acessibilidade",
        // Footer
        "footer.label": "Entre em Contato",
        "footer.title1": "Vamos construir algo",
        "footer.title2": "que as pessoas realmente usem.",
        "footer.copyright": "&copy; 2026 Enzo Esmeraldo",
        "footer.credits": "Gravado em Fortaleza, BR. Mixado no VS Code.",
        // Heatmap / Tech
        "contrib.label": "Atividade de Contribuição",
        "contrib.less": "Menos",
        "contrib.more": "Mais",
        "tech.label": "Stack Principal",
        // Music
        "music.hint": "Vire o disco e o tema acompanha",
        // Streaming shell
        "sp.skip": "Pular para o conteúdo",
        "sp.home": "Início",
        "sp.search": "Buscar",
        "sp.search.placeholder": "O que você quer ver?",
        "sp.search.browse": "Navegar por tudo",
        "sp.library": "Sua Biblioteca",
        "sp.library.collapse": "Recolher Sua Biblioteca",
        "sp.library.expand": "Expandir Sua Biblioteca",
        "sp.library.create": "Começar um projeto comigo",
        "sp.library.createShort": "Criar",
        "sp.library.filter": "Buscar em Sua Biblioteca",
        "sp.library.recents": "Recentes",
        "sp.library.empty": "Nada na sua biblioteca combina com isso.",
        "sp.chip.projects": "Projetos",
        "sp.chip.career": "Carreira",
        "sp.chip.records": "Discos",
        "sp.type.artist": "Artista",
        "sp.type.song": "Música",
        "sp.type.project": "Projeto",
        "sp.type.caseStudy": "Estudo de caso",
        "sp.release.album": "Álbum",
        "sp.release.ep": "EP",
        "sp.release.single": "Single",
        "sp.latest": "Lançamento mais recente",
        "sp.badge.live": "No ar",
        "sp.verified": "Engenheiro verificado",
        "sp.play": "Tocar",
        "sp.pause": "Pausar",
        "sp.prev": "Anterior",
        "sp.next": "Próxima",
        "sp.shuffle": "Aleatório",
        "sp.repeat.btn": "Repetir",
        "sp.mute": "Silenciar",
        "sp.unmute": "Ativar som",
        "sp.follow": "Seguir",
        "sp.share": "Copiar link",
        "sp.copyLink": "Copiar link do perfil",
        "sp.copied": "Link copiado",
        "sp.openSite": "Abrir site",
        "sp.popular": "Populares",
        "sp.pick": "Escolha do artista",
        "sp.discography": "Discografia",
        "sp.showAll": "Mostrar tudo",
        "sp.repeat": "Também no repeat",
        "sp.tour": "Em turnê",
        "sp.tour.remote": "Aberto a remoto",
        "sp.tour.cta": "Falar comigo",
        "sp.tour.connect": "Conectar",
        "sp.tour.setlist": "Ver o setlist",
        "sp.footer.downloads": "Downloads",
        "sp.listeners": "contribuições no último ano",
        "sp.np.title": "Tocando agora",
        "sp.np.open": "Abrir Tocando agora",
        "sp.np.why": "O disco é o tema",
        "sp.np.next": "Próxima na fila",
        "sp.np.credits": "Créditos",
        "sp.close": "Fechar",
        "sp.credits.design": "Design, código, tudo",
        "sp.credits.built": "Feito com",
        "sp.credits.session": "Músico de estúdio",
        "sp.like.add": "Salvar em Discos Curtidos",
        "sp.like.remove": "Remover de Discos Curtidos",
        "sp.like.added": "Adicionado aos Discos Curtidos",
        "sp.like.removed": "Removido dos Discos Curtidos",
        "sp.screen": "tela",
        "sp.achievement": "conquista",
        "sp.achievements": "conquistas",
        "sp.title": "Título",
        "sp.more.by": "Mais de Enzo Esmeraldo",
        "sp.more.releases": "Mais lançamentos",
        "sp.browse": "Navegar por tudo",
        "sp.topResult": "Melhor resultado",
        "sp.noResults": "Nenhum resultado para",
        "sp.noResults.hint": "Confira a grafia ou tente uma tecnologia como React ou Spring Boot."
    }
};

// ═══════════════════════════════════════════════════
// App shell: library, artist page lists, routes, search
// ═══════════════════════════════════════════════════
const mainEl = document.getElementById('sp-main');
const homeView = document.getElementById('view-home');
const pageView = document.getElementById('view-page');
const stickyTitle = document.getElementById('sp-main-sticky-title');
const searchInput = document.getElementById('sp-search-input');
const libraryList = document.getElementById('sp-library-list');
const libraryChips = document.getElementById('sp-library-chips');
const libraryFilterInput = document.getElementById('sp-library-filter');

let currentRoute = { name: 'home' };

function normalizeText(value) {
    return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function playButtonMarkup(sizeClass) {
    return `
        <button type="button" class="sp-play-btn ${sizeClass}" data-sp-play aria-label="${isPlaying ? t('sp.pause') : t('sp.play')}">
            <i class="fas fa-play sp-when-paused"></i><i class="fas fa-pause sp-when-playing"></i>
        </button>
    `;
}

function cvHref() {
    return currentLang === 'pt' ? 'assets/cv/CV_ENZO_ESMERALDO_LÍDER_FULLSTACK_PT.pdf' : 'assets/cv/CV_ENZO_ESMERALDO_FULLSTACK_EN.pdf';
}

// ── Project presentation helpers ──
function projectHost(project) {
    const url = project.links && (project.links.demo || project.links.marketplace);
    if (!url) return '';
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

function projectMeta(project) {
    return project.status ? pick(project.status) : projectHost(project);
}

function projectScreens(project) {
    const count = (project.images || []).length;
    if (!count) return '';
    return `${count} ${count === 1 ? t('sp.screen') : t('featuredWork.screens')}`;
}

function projectBadge(project) {
    if (project.locked) return '<span class="sp-badge">NDA</span>';
    if (project.links && (project.links.demo || project.links.marketplace)) return `<span class="sp-badge is-live">${t('sp.badge.live')}</span>`;
    return '';
}

function projectThumbMarkup(project, extraClass = '') {
    if (project.locked) {
        return `<span class="sp-thumb is-locked ${extraClass}"><i class="fas fa-lock"></i></span>`;
    }
    return `
        <span class="sp-thumb is-logo ${extraClass}" style="--thumb-rgb: ${project.tint};">
            <img src="${project.logo.src}" alt="" loading="lazy" decoding="async">
        </span>
    `;
}

function projectRowMarkup(project, index) {
    return `
        <li>
            <a class="sp-row ${routeKey(currentRoute) === `project:${project.id}` ? 'is-active' : ''}" href="#/project/${project.id}">
                <span class="sp-row-index" aria-hidden="true"><span class="sp-row-num">${index + 1}</span><i class="fas fa-play sp-row-hover"></i></span>
                <span class="sp-row-main">
                    ${projectThumbMarkup(project)}
                    <span class="sp-row-text">
                        <span class="sp-row-title">${project.title}</span>
                        <span class="sp-row-sub">${projectBadge(project)}${project.technologies.slice(0, 3).join(', ')}</span>
                    </span>
                </span>
                <span class="sp-row-meta">${projectMeta(project)}</span>
                <span class="sp-row-dur">${projectScreens(project) || '—'}</span>
            </a>
        </li>
    `;
}

function projectCardMarkup(project) {
    return `
        <a class="sp-card" href="#/project/${project.id}">
            <span class="sp-card-cover">
                ${projectThumbMarkup(project, 'is-cover')}
                <span class="sp-play-btn sp-card-play" aria-hidden="true"><i class="fas fa-play"></i></span>
            </span>
            <span class="sp-card-title">${project.title}</span>
            <span class="sp-card-sub">${projectMeta(project) || project.technologies.slice(0, 2).join(', ')}</span>
        </a>
    `;
}

function renderPopular() {
    const list = document.getElementById('sp-popular-list');
    if (!list) return;
    list.innerHTML = featuredProjects.map(projectRowMarkup).join('');
}

// ── Your Library ──
const libraryFilters = ['projects', 'career', 'records'];
let activeLibraryFilter = null;

function getLibraryItems() {
    return [
        {
            kind: 'artist',
            key: 'home',
            href: '#/',
            pinned: true,
            title: 'Enzo Esmeraldo',
            sub: t('sp.type.artist'),
            thumb: '<span class="sp-thumb is-round"><img src="assets/EnzoGym3.jpeg" alt=""></span>'
        },
        ...featuredProjects.map(project => ({
            kind: 'projects',
            key: `project:${project.id}`,
            href: `#/project/${project.id}`,
            title: project.title,
            sub: `${t('sp.type.project')} • ${project.technologies.slice(0, 2).join(', ')}`,
            thumb: projectThumbMarkup(project)
        })),
        ...careerRoles.map((role, index) => ({
            kind: 'career',
            key: `career:${index}`,
            href: `#/career/${index}`,
            title: t(`journey.role${index}`),
            sub: `${releaseType(role)} • ${role.year}`,
            thumb: `<span class="sp-thumb">${mixCoverMarkup(role, 'sp-mix-thumb')}</span>`
        })),
        ...songs.map((song, index) => ({
            kind: 'records',
            key: `record:${index}`,
            record: index,
            title: song.title,
            sub: `${t('sp.type.song')} • ${song.artist}`,
            thumb: `<span class="sp-thumb"><img src="${song.cover}" alt=""></span>`
        }))
    ];
}

function renderLibrary() {
    libraryChips.innerHTML = libraryFilters.map(id => `
        <button type="button" class="sp-chip" data-library-filter="${id}" aria-pressed="${activeLibraryFilter === id}">${t(`sp.chip.${id}`)}</button>
    `).join('');

    const query = normalizeText(libraryFilterInput.value.trim());
    const items = getLibraryItems()
        .filter(item => !activeLibraryFilter || item.kind === activeLibraryFilter)
        .filter(item => !query || normalizeText(`${item.title} ${item.sub}`).includes(query));

    if (!items.length) {
        libraryList.innerHTML = `<li class="sp-lib-empty">${t('sp.library.empty')}</li>`;
        return;
    }

    const currentKey = routeKey(currentRoute);
    libraryList.innerHTML = items.map(item => {
        const isRecord = item.record !== undefined;
        const tag = isRecord ? 'button' : 'a';
        const target = isRecord ? `type="button" data-record="${item.record}"` : `href="${item.href}"`;
        return `
            <li>
                <${tag} class="sp-lib-item ${item.key === currentKey ? 'is-current' : ''}" ${target} title="${escapeHtml(item.title)}">
                    ${item.thumb}
                    <span class="sp-lib-copy">
                        <span class="sp-lib-title">${item.title}</span>
                        <span class="sp-lib-sub">${item.pinned ? '<i class="fas fa-thumbtack" aria-hidden="true"></i>' : ''}${item.sub}</span>
                    </span>
                    <span class="sp-lib-state" aria-hidden="true"></span>
                </${tag}>
            </li>
        `;
    }).join('');

    syncLibraryPlayback();
}

// The playing record gets the accent title and a speaker icon, like any library
function syncLibraryPlayback() {
    if (!libraryList) return;
    libraryList.querySelectorAll('[data-record]').forEach(button => {
        const index = Number(button.dataset.record);
        const isCurrent = index === currentSongIndex;
        button.classList.toggle('is-playing', isCurrent);
        button.querySelector('.sp-lib-state').innerHTML = isCurrent && isPlaying ? '<i class="fas fa-volume-high"></i>' : '';
        button.setAttribute('aria-label', `${isCurrent && isPlaying ? t('sp.pause') : t('sp.play')}: ${songs[index].title}`);
    });
}

libraryChips.addEventListener('click', event => {
    const chip = event.target.closest('[data-library-filter]');
    if (!chip) return;
    activeLibraryFilter = activeLibraryFilter === chip.dataset.libraryFilter ? null : chip.dataset.libraryFilter;
    renderLibrary();
});

libraryFilterInput.addEventListener('input', renderLibrary);

libraryList.addEventListener('click', event => {
    const record = event.target.closest('[data-record]');
    if (record) selectRecord(Number(record.dataset.record));
    if (event.target.closest('.sp-lib-item')) setLibrarySheetOpen(false);
});

function setLibrarySheetOpen(open) {
    document.body.classList.toggle('lib-open', open);
    syncTabbar();
}

document.getElementById('sp-tab-library').addEventListener('click', () => {
    setLibrarySheetOpen(!document.body.classList.contains('lib-open'));
});
document.getElementById('sp-library-close').addEventListener('click', () => setLibrarySheetOpen(false));

// Desktop collapses to an icon rail; tablets start as the rail and expand
const tabletQuery = window.matchMedia('(max-width: 1023px)');
const libraryCollapseBtn = document.getElementById('sp-library-collapse');
libraryCollapseBtn.addEventListener('click', () => {
    if (mobileQuery.matches) return;
    let collapsed;
    if (tabletQuery.matches) {
        collapsed = !document.body.classList.toggle('lib-expanded');
    } else {
        collapsed = document.body.classList.toggle('lib-collapsed');
    }
    libraryCollapseBtn.setAttribute('aria-expanded', String(!collapsed));
    libraryCollapseBtn.setAttribute('aria-label', t(collapsed ? 'sp.library.expand' : 'sp.library.collapse'));
});

function syncTabbar() {
    const libraryOpen = document.body.classList.contains('lib-open');
    const activeTab = libraryOpen ? 'library' : currentRoute.name === 'search' ? 'search' : currentRoute.name === 'home' ? 'home' : '';
    document.querySelectorAll('.sp-tab').forEach(tab => tab.classList.toggle('is-active', tab.dataset.tab === activeTab));
}

// ── Routes: #/, #/project/:id, #/career/:index, #/search?q= (plain #anchors scroll the artist page) ──
function parseRoute(hash = window.location.hash) {
    if (!hash.startsWith('#/')) return { name: 'home', anchor: hash.slice(1) };
    const [path, query = ''] = hash.slice(2).split('?');
    const [section, param] = path.split('/');
    if (section === 'project' && param) return { name: 'project', id: decodeURIComponent(param) };
    if (section === 'career' && param !== undefined) return { name: 'career', index: Number(param) };
    if (section === 'search') return { name: 'search', query: new URLSearchParams(query).get('q') || '' };
    return { name: 'home' };
}

function routeKey(route) {
    if (route.name === 'project') return `project:${route.id}`;
    if (route.name === 'career') return `career:${route.index}`;
    return route.name;
}

function getScrollTop() {
    return mobileQuery.matches ? window.scrollY : mainEl.scrollTop;
}

function scrollMainTo(top) {
    if (mobileQuery.matches) window.scrollTo({ top });
    else mainEl.scrollTo({ top });
}

function setPageChrome(title, tint) {
    document.title = `${title} · Enzo Esmeraldo`;
    stickyTitle.textContent = title;
    if (tint) document.documentElement.style.setProperty('--page-tint-rgb', tint);
    else document.documentElement.style.removeProperty('--page-tint-rgb');
}

function renderRoute({ preserveScroll = false, force = false } = {}) {
    const previous = currentRoute;
    let route = parseRoute();
    if (force) pageView.innerHTML = '';

    const rendered = route.name !== 'home' && renderPage(route, previous);
    if (route.name !== 'home' && !rendered) route = { name: 'home' };
    currentRoute = route;

    const isHome = route.name === 'home';
    document.body.dataset.route = route.name;
    homeView.hidden = !isHome;
    pageView.hidden = isHome;

    if (isHome) {
        pageView.innerHTML = '';
        watchFeaturedVideo(null);
        document.title = DEFAULT_TITLE;
        stickyTitle.textContent = 'Enzo Esmeraldo';
        document.documentElement.style.removeProperty('--page-tint-rgb');
    }

    if (route.name !== 'search' && document.activeElement !== searchInput) searchInput.value = '';

    renderPopular();
    renderLibrary();
    setLibrarySheetOpen(false);

    if (!preserveScroll) {
        const anchor = isHome && route.anchor ? document.getElementById(route.anchor) : null;
        if (anchor) anchor.scrollIntoView({ block: 'start' });
        else scrollMainTo(0);
    }
    syncStickyHeader();
}

function renderPage(route, previous) {
    if (route.name === 'project') return renderProjectPage(route.id, previous);
    if (route.name === 'career') return renderCareerPage(route.index);
    if (route.name === 'search') return renderSearchPage(route.query, previous);
    return false;
}

function pageMetaMarkup(parts) {
    return `
        <p class="sp-page-meta">
            <img src="assets/EnzoGym3.jpeg" alt=""><strong>Enzo Esmeraldo</strong>
            ${parts.filter(Boolean).map(part => `<span class="sp-dot">${part}</span>`).join('')}
        </p>
    `;
}

// A project reads like a playlist: cover, title, then the case study as the "tracks"
function renderProjectPage(id, previous) {
    const index = featuredProjects.findIndex(project => project.id === id);
    if (index < 0) return false;

    const project = featuredProjects[index];
    const isSameProject = previous && previous.name === 'project' && previous.id === id;
    featuredProjectState.activeProjectIndex = index;
    if (!isSameProject) featuredProjectState.activeImageIndex = 0;

    const primaryUrl = project.links && (project.links.demo || project.links.marketplace);
    const cover = project.locked
        ? '<div class="sp-page-cover is-logo is-locked"><i class="fas fa-lock"></i></div>'
        : `<div class="sp-page-cover is-logo"><img src="${project.logo.src}" alt="${project.logo.alt}"></div>`;
    const primaryAction = primaryUrl
        ? `<a class="sp-play-btn sp-play-xl" href="${primaryUrl}" target="_blank" rel="noreferrer" aria-label="${t('sp.openSite')}" title="${t('sp.openSite')}"><i class="fas fa-arrow-up-right-from-square"></i></a>`
        : playButtonMarkup('sp-play-xl');
    const githubAction = project.links && project.links.github
        ? `<a class="sp-action-icon" href="${project.links.github}" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub"><i class="fab fa-github"></i></a>`
        : '';

    pageView.innerHTML = `
        <article class="sp-page">
            <header class="sp-page-head">
                ${cover}
                <div class="sp-page-titles">
                    <p class="sp-page-type">${t('sp.type.caseStudy')}</p>
                    <h1 class="sp-page-title">${project.title}</h1>
                    ${pageMetaMarkup([projectMeta(project), projectScreens(project)])}
                </div>
            </header>
            <div class="sp-page-body">
                <div class="sp-actionbar">
                    ${primaryAction}
                    ${githubAction}
                    <button type="button" class="sp-follow" data-sp-share>${t('sp.share')}</button>
                </div>
                <div id="featured-project-stage" class="featured-project-stage"></div>
                <section class="sp-section">
                    <div class="sp-section-head">
                        <h2 class="sp-section-title">${t('sp.more.by')}</h2>
                    </div>
                    <div class="sp-shelf">${featuredProjects.filter(other => other.id !== id).map(projectCardMarkup).join('')}</div>
                </section>
            </div>
        </article>
    `;

    setPageChrome(project.title, project.tint);
    renderFeaturedProjectStage();
    return true;
}

// A role reads like an album: the achievements are the tracklist
function renderCareerPage(index) {
    const role = careerRoles[index];
    if (!role) return false;

    const title = t(`journey.role${index}`);
    const trackWord = role.tracks === 1 ? t('sp.achievement') : t('sp.achievements');
    const tracks = Array.from({ length: role.tracks }, (_, item) => `
        <li class="sp-row is-text">
            <span class="sp-row-index">${item + 1}</span>
            <p class="sp-row-sentence">${t(`journey.role${index}.item${item + 1}`)}</p>
        </li>
    `).join('');

    pageView.innerHTML = `
        <article class="sp-page">
            <header class="sp-page-head">
                <div class="sp-page-cover">${mixCoverMarkup(role)}</div>
                <div class="sp-page-titles">
                    <p class="sp-page-type">${releaseType(role)}</p>
                    <h1 class="sp-page-title">${title}</h1>
                    ${pageMetaMarkup([role.company, t(`journey.date${index}`), `${role.tracks} ${trackWord}`])}
                </div>
            </header>
            <div class="sp-page-body">
                <div class="sp-actionbar">
                    ${playButtonMarkup('sp-play-xl')}
                    <a class="sp-action-icon" href="${cvHref()}" download aria-label="${stripTags(t('hero.resume'))}" title="${stripTags(t('hero.resume'))}"><i class="far fa-circle-down"></i></a>
                </div>
                <p class="sp-album-desc">${t(`journey.desc${index}`)}</p>
                <ol class="sp-tracklist">
                    <li class="sp-row is-text sp-tracklist-head" aria-hidden="true"><span class="sp-row-index">#</span><span>${t('sp.title')}</span></li>
                    ${tracks}
                </ol>
                <p class="sp-copyright">℗ ${role.year} ${role.company} · ${t(`journey.status${index}`)}</p>
                <section class="sp-section">
                    <div class="sp-section-head">
                        <h2 class="sp-section-title">${t('sp.more.releases')}</h2>
                        <a class="sp-show-all" href="#trajectory">${t('sp.showAll')}</a>
                    </div>
                    <div class="sp-shelf">${careerRoles.map((other, otherIndex) => otherIndex === index ? '' : careerCardMarkup(other, otherIndex)).join('')}</div>
                </section>
            </div>
        </article>
    `;

    setPageChrome(title, role.mix);
    return true;
}

// ── Search ──
const browseTiles = [
    { term: 'React', rgb: '39 133 106', img: `${TECH_ICON_BASE}/react.png` },
    { term: 'Angular', rgb: '186 23 61', img: `${TECH_ICON_BASE}/angular.png` },
    { term: 'Spring Boot', rgb: '71 125 149', img: `${TECH_ICON_BASE}/spring_boot.png` },
    { term: 'AI', label: { en: 'AI & agents', pt: 'IA e agentes' }, rgb: '141 103 171', icon: 'fas fa-robot' },
    { term: 'PostgreSQL', rgb: '30 50 100', img: `${TECH_ICON_BASE}/postgresql.png` },
    { term: 'TypeScript', rgb: '13 115 236', img: `${TECH_ICON_BASE}/typescript.png` },
    { term: 'Pokémon', rgb: '232 17 91', img: 'assets/icons/teamBuilderLogo.png' },
    { term: 'Christus', label: { en: 'Career', pt: 'Carreira' }, rgb: '188 89 0', icon: 'fas fa-briefcase' }
];

// Word-prefix match, accent-insensitive: "ai" finds "AI-assisted", not "maintain"
function matchesQuery(text, query) {
    const pattern = new RegExp(`(^|[^a-z0-9])${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    return pattern.test(normalizeText(stripTags(text)));
}

function searchPortfolio(rawQuery) {
    const query = normalizeText(rawQuery.trim());
    if (!query) return null;

    const projects = featuredProjects.filter(project => matchesQuery(
        [project.title, project.technologies.join(' '), getFeaturedProjectDescription(project), pick(project.status)].join(' '),
        query
    ));

    const roles = careerRoles
        .map((role, index) => ({ role, index }))
        .filter(({ role, index }) => matchesQuery([
            t(`journey.role${index}`),
            t(`journey.status${index}`),
            t(`journey.desc${index}`),
            role.company,
            ...Array.from({ length: role.tracks }, (_, item) => t(`journey.role${index}.item${item + 1}`))
        ].join(' '), query));

    const allTech = [...new Set([...techStack.map(tech => tech.name), ...featuredProjects.flatMap(project => project.technologies)])];
    const stack = allTech.filter(name => matchesQuery(name, query));

    return { projects, roles, stack };
}

function topResultMarkup(results) {
    const project = results.projects[0];
    if (project) {
        return `
            <a class="sp-top-result" href="#/project/${project.id}">
                ${projectThumbMarkup(project)}
                <div>
                    <p class="sp-top-result-title">${project.title}</p>
                    <p class="sp-top-result-sub"><span class="sp-type-pill">${t('sp.type.project')}</span>${projectMeta(project)}</p>
                </div>
                <span class="sp-play-btn sp-card-play" aria-hidden="true"><i class="fas fa-play"></i></span>
            </a>
        `;
    }
    const { role, index } = results.roles[0];
    return `
        <a class="sp-top-result" href="#/career/${index}">
            <span class="sp-thumb">${mixCoverMarkup(role, 'sp-mix-thumb')}</span>
            <div>
                <p class="sp-top-result-title">${t(`journey.role${index}`)}</p>
                <p class="sp-top-result-sub"><span class="sp-type-pill">${releaseType(role)}</span>${role.year}</p>
            </div>
            <span class="sp-play-btn sp-card-play" aria-hidden="true"><i class="fas fa-play"></i></span>
        </a>
    `;
}

function renderSearchResults(query) {
    const container = document.getElementById('sp-search-results');
    if (!container) return;

    const results = searchPortfolio(query);
    if (!results) {
        container.innerHTML = `
            <h2 class="sp-section-title">${t('sp.browse')}</h2>
            <div class="sp-browse">
                ${browseTiles.map(tile => `
                    <button type="button" class="sp-browse-tile" style="--tile: ${tile.rgb};" data-search-term="${tile.term}">
                        <span>${tile.label ? pick(tile.label) : tile.term}</span>
                        ${tile.img ? `<img src="${tile.img}" alt="" loading="lazy" decoding="async">` : `<i class="${tile.icon}" aria-hidden="true"></i>`}
                    </button>
                `).join('')}
            </div>
        `;
        return;
    }

    const { projects, roles, stack } = results;
    if (!projects.length && !roles.length && !stack.length) {
        container.innerHTML = `
            <div class="sp-empty">
                <h2>${t('sp.noResults')} “${escapeHtml(query)}”</h2>
                <p>${t('sp.noResults.hint')}</p>
            </div>
        `;
        return;
    }

    const hasTop = projects.length || roles.length;
    container.innerHTML = `
        ${hasTop ? `
            <div class="sp-results-top">
                <section>
                    <h2 class="sp-section-title">${t('sp.topResult')}</h2>
                    ${topResultMarkup(results)}
                </section>
                ${projects.length ? `
                    <section>
                        <h2 class="sp-section-title">${t('sp.chip.projects')}</h2>
                        <ol class="sp-tracklist">${projects.slice(0, 4).map(projectRowMarkup).join('')}</ol>
                    </section>
                ` : ''}
            </div>
        ` : ''}
        ${roles.length ? `
            <section class="sp-section">
                <h2 class="sp-section-title">${t('sp.chip.career')}</h2>
                <div class="sp-shelf is-grid">${roles.map(({ role, index }) => careerCardMarkup(role, index)).join('')}</div>
            </section>
        ` : ''}
        ${stack.length ? `
            <section class="sp-section">
                <h2 class="sp-section-title">Stack</h2>
                <div class="sp-stack-chips">${stack.map(name => `<button type="button" class="sp-chip" data-search-term="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join('')}</div>
            </section>
        ` : ''}
    `;
}

function renderSearchPage(query, previous) {
    // Keep the page (and the phone's inline search box) alive while typing; only results change
    if (previous.name !== 'search' || !document.getElementById('sp-search-results')) {
        pageView.innerHTML = `
            <div class="sp-search-page">
                <form class="sp-search sp-search-inline" role="search" data-inline-search>
                    <i class="fas fa-magnifying-glass sp-search-icon" aria-hidden="true"></i>
                    <input type="search" autocomplete="off" spellcheck="false" placeholder="${stripTags(t('sp.search.placeholder'))}" aria-label="${stripTags(t('sp.search.placeholder'))}">
                </form>
                <div id="sp-search-results"></div>
            </div>
        `;
        const inlineForm = pageView.querySelector('[data-inline-search]');
        inlineForm.addEventListener('submit', event => event.preventDefault());
        inlineForm.querySelector('input').addEventListener('input', event => runSearch(event.target.value));
    }

    const inlineInput = pageView.querySelector('[data-inline-search] input');
    if (inlineInput && document.activeElement !== inlineInput) inlineInput.value = query;
    if (document.activeElement !== searchInput) searchInput.value = query;

    renderSearchResults(query);
    setPageChrome(t('sp.search'), null);
    return true;
}

function runSearch(query) {
    const hash = query ? `#/search?q=${encodeURIComponent(query)}` : '#/search';
    if (currentRoute.name === 'search') {
        history.replaceState(null, '', hash);
        renderRoute({ preserveScroll: true });
    } else {
        window.location.hash = hash;
    }
}

function focusSearch() {
    if (!mobileQuery.matches) {
        searchInput.focus();
        return;
    }
    if (currentRoute.name !== 'search') window.location.hash = '#/search';
    requestAnimationFrame(() => {
        const inlineInput = pageView.querySelector('[data-inline-search] input');
        if (inlineInput) inlineInput.focus();
    });
}

document.getElementById('sp-search-form').addEventListener('submit', event => event.preventDefault());
searchInput.addEventListener('input', () => runSearch(searchInput.value));
// Like the real thing: focusing the search bar opens Browse
searchInput.addEventListener('focus', () => {
    if (currentRoute.name !== 'search') runSearch(searchInput.value);
});

pageView.addEventListener('click', event => {
    const term = event.target.closest('[data-search-term]');
    if (term) runSearch(term.dataset.searchTerm);
    if (event.target.closest('[data-sp-share]')) copyText(window.location.href);
});

// ── Sticky header inside the main view ──
let stickyTicking = false;
function syncStickyHeader() {
    const header = currentRoute.name === 'home'
        ? homeView.querySelector('.sp-artist-hero')
        : pageView.querySelector('.sp-page-head');
    const threshold = header ? header.offsetHeight - 72 : Infinity;
    mainEl.classList.toggle('is-stuck', getScrollTop() > threshold);
}

function onMainScroll() {
    if (stickyTicking) return;
    stickyTicking = true;
    requestAnimationFrame(() => {
        syncStickyHeader();
        stickyTicking = false;
    });
}

mainEl.addEventListener('scroll', onMainScroll, { passive: true });
window.addEventListener('scroll', onMainScroll, { passive: true });

// ── Small affordances: share, menus, skip link, home ──
function copyText(text) {
    if (!navigator.clipboard) {
        showToast(text);
        return;
    }
    navigator.clipboard.writeText(text)
        .then(() => showToast(t('sp.copied')))
        .catch(() => showToast(text));
}

function closeMenus() {
    document.querySelectorAll('details.sp-more[open]').forEach(menu => { menu.open = false; });
}

document.getElementById('sp-copy-link').addEventListener('click', () => {
    copyText(`${window.location.origin}${window.location.pathname}`);
    closeMenus();
});

document.addEventListener('click', event => {
    if (!event.target.closest('details.sp-more')) closeMenus();
});

document.querySelector('.sp-skip').addEventListener('click', event => {
    event.preventDefault();
    mainEl.focus();
});

// "#/" doesn't fire hashchange when it's already the hash: scroll home to the top instead
document.addEventListener('click', event => {
    const link = event.target.closest('a[href="#/"]');
    if (link && window.location.hash === '#/') {
        event.preventDefault();
        scrollMainTo(0);
    }
});

function renderTourDate() {
    const now = new Date();
    const locale = currentLang === 'pt' ? 'pt-BR' : 'en-US';
    document.getElementById('sp-tour-month').textContent = now.toLocaleDateString(locale, { month: 'short' }).replace('.', '');
    document.getElementById('sp-tour-day').textContent = String(now.getDate());
}

// "1,234 contributions in the last year" is this page's monthly-listeners line
function renderListeners(totalCount) {
    const locale = currentLang === 'pt' ? 'pt-BR' : 'en-US';
    const text = typeof totalCount === 'number'
        ? `${totalCount.toLocaleString(locale)} ${t('sp.listeners')}`
        : stripTags(t('hero.role'));
    ['sp-listeners', 'sp-about-listeners'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    });
}

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
        element.placeholder = stripTags(t(element.dataset.langPlaceholder));
    });
    document.querySelectorAll('[data-lang-aria]').forEach(element => {
        element.setAttribute('aria-label', stripTags(t(element.dataset.langAria)));
    });

    document.querySelectorAll('[data-cv]').forEach(link => {
        link.href = cvHref();
    });

    document.getElementById('current-lang').textContent = lang.toUpperCase();
    localStorage.setItem('preferred-lang', lang);

    renderNowPlaying();
    setPlayingState(isPlaying);
    setVolume(audioPlayer.volume);
    renderTourDate();
    renderDiscography();
    renderAboutInterests();
    renderHeatmap();
    renderRoute({ preserveScroll: true, force: true });
}

function toggleLanguage() {
    setLanguage(currentLang === 'en' ? 'pt' : 'en');
}

function initLanguage() {
    const savedLang = localStorage.getItem('preferred-lang');
    const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
    setLanguage(savedLang || browserLang);
    document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeFeaturedImageModal();
        closeMenus();
        setLibrarySheetOpen(false);
        // Only the overlay / phone sheet closes; the docked panel stays put
        if (!wideQuery.matches) setNowPlayingOpen(false);
        if (event.target === searchInput) searchInput.blur();
        return;
    }

    const isTyping = event.target.closest && event.target.closest('input, textarea, select, [contenteditable="true"]');
    if (isTyping) return;

    if (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        focusSearch();
        return;
    }

    // Space plays/pauses, unless it's already pressing a focused control
    if (event.code === 'Space' && !event.target.closest('button, a, summary, [role="tab"]')) {
        event.preventDefault();
        togglePlay();
    }
});

window.addEventListener('hashchange', () => renderRoute());
wideQuery.addEventListener('change', initNowPlaying);
mobileQuery.addEventListener('change', syncStickyHeader);

function initApp() {
    const savedSide = localStorage.getItem('jukebox-side');
    loadSong(savedSide !== null ? (Number(savedSide) || 0) : 0);
    setVolume(audioPlayer.volume);
    initNowPlaying();
    renderTechStack();
    initLanguage();
    initHeatmapTooltip();
    loadHeatmap();
}

initApp();
