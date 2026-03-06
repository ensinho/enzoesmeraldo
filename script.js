// ═══════════════════════════════════════════════════
// ENZO.DEV — Script v2.0
// ═══════════════════════════════════════════════════

gsap.registerPlugin(ScrollTrigger);

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
        title: "505",
        artist: "Arctic Monkeys",
        file: "assets/songs/Arctic Monkeys- 505.mp3",
        cover: "url('assets/albumCovers/arcticCover.jpg')",
        heroBg: "assets/backgrounds/yellow.jpg",
        easterEgg: {
            en: "505 hits different at 5am, doesn't it?",
            pt: "505 bate diferente às 5 da manhã, né?"
        },
        consoleMsg: ["color: #c8ff00; font-size: 13px; font-weight: bold;", "Arctic Monkeys detected. Certified taste."],
        theme: {
            bg: "8 8 8",
            text: "255 255 255",
            accent: "200 255 0",
            secondary: "255 215 0",
            panel: "17 17 17",
            gray: "148 163 184"
        }
    },
    {
        title: "The Emptiness Machine",
        artist: "Linkin Park",
        file: "assets/songs/Linkin Park- The Emptiness Machine (2013venjix Edit).mp3",
        cover: "url('assets/albumCovers/linkinCover.jpg')",
        heroBg: "assets/backgrounds/pink.jpg",
        easterEgg: {
            en: "Hmm, you're into Linkin Park too?",
            pt: "Hmm, você curte Linkin Park também?"
        },
        consoleMsg: ["color: #ff00ff; font-size: 13px; font-weight: bold;", "Linkin Park mode activated. Raw energy unlocked."],
        theme: {
            bg: "8 8 8",
            text: "255 255 255",
            accent: "255 0 255",
            secondary: "255 105 180",
            panel: "17 17 17",
            gray: "148 163 184"
        }
    },
    {
        title: "City Walls",
        artist: "Twenty One Pilots",
        file: "assets/songs/twenty one pilots - City Walls.mp3",
        cover: "url('assets/albumCovers/twentyCover.png')",
        heroBg: "assets/backgrounds/red.jpg",
        easterEgg: {
            en: "Twenty One Pilots? We'd get along just fine.",
            pt: "Twenty One Pilots? A gente ia se dar muito bem."
        },
        consoleMsg: ["color: #ff3232; font-size: 13px; font-weight: bold;", "City Walls. Good choice for late-night coding."],
        theme: {
            bg: "8 8 8",
            text: "255 255 255",
            accent: "255 50 50",
            secondary: "180 0 0",
            panel: "17 17 17",
            gray: "148 163 184"
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
    } else {
        musicCollapsible.style.maxHeight = '80px';
        musicCollapsible.style.opacity = '1';
        collapseIcon.style.transform = 'rotate(0deg)';
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
        "hero.role": "Frontend Architect & Creative Developer",
        // About
        "about.label": "About Me",
        "about.title1": "Who I",
        "about.title2": "am.",
        "about.offCode": "About the Developer",
        "about.title": "Enzo Esmeraldo",
        "about.description": "Frontend-specialized developer who thrives on creative challenges. I transform complex ideas into intuitive, visually striking interfaces. Passionate about UI/UX, design systems, and crafting pixel-perfect experiences.",
        "about.bio2": "When I'm not writing code, I'm probably overthinking a design, grinding at the gym, or blasting some killer rock — always with an eye for detail.",
        "about.funfact.label": "Fun Fact",
        "about.funfact.title": "Fav. Pokémon is Lugia",
        "about.funfact.desc": "Psychic-type elegance, legendary rarity — basically my design philosophy wrapped in a Pokémon.",
        "about.numbers.label": "By the Numbers",
        "about.current.label": "Currently Building",
        "about.current.desc": "An AI-powered medical platform that helps doctors make better clinical decisions — leading the team, owning the architecture, and designing every pixel of the experience.",
        "about.current.status": "In active development",
        "about.stat1.label": "Years",
        "about.stat1.value": "2+",
        "about.stat2.label": "Projects",
        "about.stat2.value": "10+",
        "about.stat3.label": "Focus",
        "about.stat3.value": "Front-End",
        "about.stat4.label": "Graduation",
        "about.stat4.value": "2026",
        "about.stat5.label": "Fav. Pokémon",
        "about.stat5.value": "Lugia",
        "about.downloadCV": "DOWNLOAD CV",
        // Work
        "work.label": "Portfolio",
        "work.title1": "Selected",
        "work.title2": "Work.",
        "work.subtitle": "A curated selection of projects that showcase problem-solving through design and code.",
        "projects.dino.description": "An interactive educational platform exploring prehistoric life through immersive digital storytelling, dynamic content loading, and orchestrated animations.",
        "projects.teambuilder.description": "Strategic synergy calculator for competitive Pokémon players. Analyze type coverage, identify weaknesses, and build balanced teams.",
        "projects.uniforgym.description": "Native Android application for gym scheduling and workout tracking with user authentication and Material Design 3 components.",
        "projects.aquacensus.description": "Marine biology research and specimen cataloging system. Comprehensive database solution for tracking marine life data.",
        "projects.visitGithub": "Explore more on GitHub",
        // Journey
        "journey.subtitle": "Career Path",
        "journey.the": "Professional",
        "journey.title": "Journey.",
        "journey.role0": "Project Leader",
        "journey.date0": "Jan. 2026 — Present",
        "journey.status0": "Current · React + Node.js + PostgreSQL",
        "journey.desc0": "Promoted to Project Leader, spearheading the development of an AI-powered medical solution — leading the team, defining architecture, and owning the product from vision to deployment.",
        "journey.role0.item1": "Leading the end-to-end development of an AI-assisted medical platform that powers clinical decision-making for doctors",
        "journey.role0.item2": "Designing and owning the entire visual identity, component library, and UI/UX of the platform from scratch",
        "journey.role0.item3": "Architecting the full-stack solution with React, Node.js, and PostgreSQL, ensuring scalability and maintainability",
        "journey.role0.item4": "Managing version control strategy, Git workflows, and technical documentation across the team",
        "journey.role0.item5": "Mentoring team members on best practices, code quality standards, and modern development patterns",
        "journey.role0.item6": "Responsible for all project deliverables — from interface design to system architecture to deployment pipeline",
        "journey.role1": "FullStack Developer",
        "journey.date1": "Jan. 2025 — Dec. 2025",
        "journey.status1": "Completed · Angular + Spring",
        "journey.desc1": "Advanced to full developer role, taking ownership of system architecture, UI/UX decisions, and cross-team technical leadership.",
        "journey.readMore": "Read More",
        "journey.achievements": "Key Achievements",
        "journey.role1.item1": "Developed the Exitus system end-to-end, working on front-end, back-end, and databases, focusing on scalability and performance",
        "journey.role1.item2": "Designed the system's visual identity and created user interfaces, ensuring consistency in the user experience (UI/UX)",
        "journey.role1.item3": "Architected and implemented the front-end using Angular and TypeScript, applying best practices for componentization and responsiveness",
        "journey.role1.item4": "Assisted in defining and building the back-end architecture with Spring Boot, including database integrations and external services",
        "journey.role1.item5": "Implemented integrations with AI services, automating question validation and improving the educational experience",
        "journey.role1.item6": "Integrated webhooks and deployed cloud-based solutions (Source Cloud) for continuous system deployment and maintenance",
        "journey.role1.item7": "Worked under Agile Scrum methodology, actively participating in planning, reviews, and retrospectives",
        "journey.role2": "FullStack Intern",
        "journey.date2": "Apr. 2024 — Dec. 2024",
        "journey.status2": "Completed · Angular + Spring",
        "journey.desc2": "Started my professional journey as an intern, contributing to system development and learning industry best practices.",
        "journey.role2.item1": "Contributed to the development and improvement of Exitus system interfaces, focusing on usability and accessibility",
        "journey.role2.item2": "Assisted in creating user flows and interface design, collaborating closely with the UI/UX team",
        "journey.role2.item3": "Participated in front-end development using Angular, TypeScript, and CSS, and supported the back-end with Spring Boot",
        "journey.role2.item4": "Gained hands-on experience with full-stack development in a professional environment",
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
        "about.description": "Desenvolvedor especializado em Frontend que prospera em desafios criativos. Transformo ideias complexas em interfaces intuitivas e visualmente impactantes. Apaixonado por UI/UX, design systems e experiências pixel-perfect.",
        "about.bio2": "Quando não estou escrevendo código, provavelmente estou repensando um design, na academia ou ouvindo um rock bem maneiro — sempre com atenção aos detalhes.",
        "about.funfact.label": "Curiosidade",
        "about.funfact.title": "Pokémon Fav. é Lugia",
        "about.funfact.desc": "Elegância do tipo Psíquico, raridade lendária — basicamente minha filosofia de design em forma de Pokémon.",
        "about.numbers.label": "Em Números",
        "about.current.label": "Em Desenvolvimento",
        "about.current.desc": "Uma plataforma médica com IA que ajuda médicos a tomar melhores decisões clínicas — liderando a equipe, definindo a arquitetura e projetando cada pixel da experiência.",
        "about.current.status": "Em desenvolvimento ativo",
        "about.stat1.label": "Anos",
        "about.stat1.value": "2+",
        "about.stat2.label": "Projetos",
        "about.stat2.value": "10+",
        "about.stat3.label": "Foco",
        "about.stat3.value": "Front-End",
        "about.stat4.label": "Graduação",
        "about.stat4.value": "2026",
        "about.stat5.label": "Pokémon Fav.",
        "about.stat5.value": "Lugia",
        "about.downloadCV": "BAIXAR CV",
        // Work
        "work.label": "Portfólio",
        "work.title1": "Trabalhos",
        "work.title2": "Selecionados.",
        "work.subtitle": "Uma seleção curada de projetos que demonstram resolução de problemas através de design e código.",
        "projects.dino.description": "Uma plataforma educacional interativa explorando a vida pré-histórica através de narrativa digital imersiva, carregamento dinâmico de conteúdo e animações orquestradas.",
        "projects.teambuilder.description": "Calculadora estratégica de sinergia para jogadores competitivos de Pokémon. Analise cobertura de tipos, identifique fraquezas e monte times balanceados.",
        "projects.uniforgym.description": "Aplicativo Android nativo para agendamento de academia e acompanhamento de treinos com autenticação de usuário e Material Design 3.",
        "projects.aquacensus.description": "Sistema de pesquisa em biologia marinha e catalogação de espécimes. Solução completa de banco de dados para rastrear dados de vida marinha.",
        "projects.visitGithub": "Explore mais no GitHub",
        // Journey
        "journey.subtitle": "Trajetória Profissional",
        "journey.the": "Jornada",
        "journey.title": "Profissional.",
        "journey.role0": "Líder de Projeto",
        "journey.date0": "Jan. 2026 — Presente",
        "journey.status0": "Atual · React + Node.js + PostgreSQL",
        "journey.desc0": "Promovido a Líder de Projeto, liderando o desenvolvimento de uma solução médica com IA — conduzindo a equipe, definindo a arquitetura e sendo responsável pelo produto da concepção à entrega.",
        "journey.role0.item1": "Liderando o desenvolvimento completo de uma plataforma médica assistida por IA que apoia a tomada de decisões clínicas para médicos",
        "journey.role0.item2": "Projetando e sendo responsável por toda a identidade visual, biblioteca de componentes e UI/UX da plataforma do zero",
        "journey.role0.item3": "Arquitetando a solução full-stack com React, Node.js e PostgreSQL, garantindo escalabilidade e manutenibilidade",
        "journey.role0.item4": "Gerenciando a estratégia de versionamento, fluxos Git e documentação técnica da equipe",
        "journey.role0.item5": "Mentorando membros da equipe em boas práticas, padrões de qualidade de código e padrões modernos de desenvolvimento",
        "journey.role0.item6": "Responsável por todas as entregas do projeto — do design de interface à arquitetura do sistema ao pipeline de deploy",
        "journey.role1": "Desenvolvedor FullStack",
        "journey.date1": "Jan. 2025 — Dez. 2025",
        "journey.status1": "Concluído · Angular + Spring",
        "journey.desc1": "Avancei para desenvolvedor pleno, assumindo responsabilidades na arquitetura do sistema, decisões de UI/UX e liderança técnica.",
        "journey.readMore": "Ler Mais",
        "journey.achievements": "Principais Conquistas",
        "journey.role1.item1": "Desenvolvi o sistema Exitus de ponta a ponta, trabalhando no front-end, back-end e bancos de dados, focando em escalabilidade e desempenho",
        "journey.role1.item2": "Projetei a identidade visual do sistema e criei interfaces de usuário, garantindo consistência na experiência do usuário (UI/UX)",
        "journey.role1.item3": "Arquitetei e implementei o front-end usando Angular e TypeScript, aplicando melhores práticas de componentização e responsividade",
        "journey.role1.item4": "Auxiliei na definição e construção da arquitetura back-end com Spring Boot, incluindo integrações de banco de dados e serviços externos",
        "journey.role1.item5": "Implementei integrações com serviços de IA, automatizando a validação de questões e melhorando a experiência educacional",
        "journey.role1.item6": "Integrei webhooks e implantei soluções baseadas em nuvem (Source Cloud) para implantação e manutenção contínua do sistema",
        "journey.role1.item7": "Trabalhei sob a metodologia Agile Scrum, participando ativamente de planejamentos, revisões e retrospectivas",
        "journey.role2": "Estagiário FullStack",
        "journey.date2": "Abr. 2024 — Dez. 2024",
        "journey.status2": "Concluído · Angular + Spring",
        "journey.desc2": "Iniciei minha jornada profissional como estagiário, contribuindo para o desenvolvimento de sistemas e aprendendo as melhores práticas da indústria.",
        "journey.role2.item1": "Contribuí para o desenvolvimento e melhoria das interfaces do sistema Exitus, focando em usabilidade e acessibilidade",
        "journey.role2.item2": "Auxiliei na criação de fluxos de usuário e design de interface, colaborando estreitamente com a equipe de UI/UX",
        "journey.role2.item3": "Participei do desenvolvimento front-end usando Angular, TypeScript e CSS, e apoiei o back-end com Spring Boot",
        "journey.role2.item4": "Ganhei experiência prática com desenvolvimento full-stack em um ambiente profissional",
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
        // Music
        "music.hint": "Mude a música para trocar o tema"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;

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
