// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

// --- Loader Animation ---
const initLoader = () => {
    const tl = gsap.timeline();
    
    // Simulate loading progress
    let progress = 0;
    const progressEl = document.getElementById('progress');
    const loaderBar = document.getElementById('loader-bar');
    
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if(progress > 100) progress = 100;
        progressEl.innerText = progress + '%';
        loaderBar.style.width = progress + '%';
        
        if(progress === 100) {
            clearInterval(interval);
            // Trigger exit animation
             setTimeout(() => {
                tl.to("#loader", {
                    yPercent: -100,
                    duration: 1,
                    ease: "power4.inOut",
                    onComplete: () => {
                        document.getElementById('loader').style.display = 'none';
                        initScrollAnimations(); // Start page animations
                    }
                });
             }, 500);
        }
    }, 150);
};

// Safety Fallback for loader
window.addEventListener('load', initLoader);
setTimeout(() => {
    if(document.getElementById('loader').offsetHeight > 0) {
        initLoader();
    }
}, 4000);


// --- Custom Cursor Logic ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

// Use gsap quickTo for performance
const xToDot = gsap.quickTo(cursorDot, "x", {duration: 0.1, ease: "power3"});
const yToDot = gsap.quickTo(cursorDot, "y", {duration: 0.1, ease: "power3"});
const xToRing = gsap.quickTo(cursorRing, "x", {duration: 0.3, ease: "power3"});
const yToRing = gsap.quickTo(cursorRing, "y", {duration: 0.3, ease: "power3"});

window.addEventListener('mousemove', (e) => {
    xToDot(e.clientX);
    yToDot(e.clientY);
    xToRing(e.clientX);
    yToRing(e.clientY);
});

// Hover Effects for Cursor
const hoverTriggers = document.querySelectorAll('.hover-trigger, a, button, .project-img');
hoverTriggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
    });
    trigger.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });
});


// --- Falling Petals Generation ---
function createPetals() {
    const container = document.getElementById('petals-container');
    const petalCount = 30; // Number of petals
    
    for(let i = 0; i < petalCount; i++) {
        const petal = document.createElement('span');
        petal.classList.add('petal');
        // Randomize positions
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDelay = Math.random() * 5 + 's';
        petal.style.animationDuration = (Math.random() * 10 + 5) + 's';
        container.appendChild(petal);
    }
}
createPetals();

// --- Scroll Animations ---
function initScrollAnimations() {
    
    // Parallax Hero Background
    gsap.to("#hero-bg", {
        yPercent: 30,
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
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
        delay: 0.2
    });

    // Fade In Elements
    gsap.utils.toArray('.gs-fade-in').forEach(element => {
        gsap.to(element, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            delay: 0.8
        });
    });

    // Reveal Sections
    gsap.utils.toArray('.gs-reveal').forEach(element => {
        gsap.fromTo(element, 
            { y: 80, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Marquee Animation
    gsap.to(".marquee-content", {
        xPercent: -100,
        repeat: -1,
        duration: 25, // Slower for readability
        ease: "linear"
    });

    // --- Horizontal Scroll for Projects (Momentum Drag) ---
    const slider = document.getElementById('projects-wrapper');
    const track = document.getElementById('projects-track');
    const progressBar = document.getElementById('project-progress');
    const counter = document.getElementById('project-counter');
    const projectImages = document.querySelectorAll('.parallax-img');

    let isDown = false;
    let startX;
    let scrollLeft;
    let velX = 0;
    let momentumID;

    if (slider && track) {
        // Mouse Down
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active:cursor-grabbing');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            cancelAnimationFrame(momentumID);
        });

        // Mouse Leave
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active:cursor-grabbing');
            beginMomentumTracking();
        });

        // Mouse Up
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active:cursor-grabbing');
            beginMomentumTracking();
        });

        // Mouse Move
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            
            const prevScrollLeft = slider.scrollLeft;
            slider.scrollLeft = scrollLeft - walk;
            velX = slider.scrollLeft - prevScrollLeft;
            
            updateProjectUI();
        });

        // Touch Events for Mobile
        slider.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            cancelAnimationFrame(momentumID);
        });

        slider.addEventListener('touchend', () => {
            isDown = false;
            beginMomentumTracking();
        });

        slider.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            
            const prevScrollLeft = slider.scrollLeft;
            slider.scrollLeft = scrollLeft - walk;
            velX = slider.scrollLeft - prevScrollLeft;
            
            updateProjectUI();
        });

        // Momentum Loop
        function beginMomentumTracking() {
            cancelAnimationFrame(momentumID);
            momentumID = requestAnimationFrame(momentumLoop);
        }

        function momentumLoop() {
            slider.scrollLeft += velX;
            velX *= 0.95; // Friction

            if (Math.abs(velX) > 0.5) {
                updateProjectUI();
                momentumID = requestAnimationFrame(momentumLoop);
            }
        }

        // Update UI (Progress, Counter, Parallax)
        function updateProjectUI() {
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            const progress = slider.scrollLeft / maxScroll;
            
            // Update Progress Bar
            if(progressBar) progressBar.style.width = `${Math.min(Math.max(progress, 0), 1) * 100}%`;
            
            // Update Counter
            if(counter) {
                const totalProjects = 4;
                const current = Math.min(Math.ceil(progress * totalProjects), totalProjects);
                counter.innerText = `0${current <= 0 ? 1 : current}`;
            }

            // Parallax Effect
            projectImages.forEach(img => {
                const rect = img.parentElement.getBoundingClientRect();
                const viewWidth = window.innerWidth;
                
                if (rect.left < viewWidth && rect.right > 0) {
                    const percentage = (rect.left + rect.width) / (viewWidth + rect.width);
                    const move = (1 - percentage) * 100; 
                    img.style.objectPosition = `${move}% 50%`;
                }
            });
        }
        
        // Initial call
        updateProjectUI();
        
        // Listen to native scroll (e.g. trackpad)
        slider.addEventListener('scroll', updateProjectUI);
    }
    
     // Navbar Glass effect on scroll
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: {className: 'shadow-lg', targets: '#navbar'}
    });
}


// --- Back to Top Button Logic ---
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 0.5) {
        backToTopBtn.classList.remove('translate-y-20', 'opacity-0');
    } else {
        backToTopBtn.classList.add('translate-y-20', 'opacity-0');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// --- Mobile Menu Logic ---
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
        // Change hamburger to X
        menuBtn.innerHTML = '<i class="fas fa-times text-2xl"></i>';
    } else {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        mobileMenuBackdrop.classList.remove('opacity-100', 'pointer-events-auto');
        mobileMenuBackdrop.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
        // Change X back to hamburger
        menuBtn.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
    }
}

window.closeMobileMenu = function() {
    if (mobileMenuOpen) {
        toggleMobileMenu();
    }
}

menuBtn.addEventListener('click', toggleMobileMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));


// --- CV Download Fallback ---
function checkCV(e) {
    // Visual feedback
    const btn = e.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'DOWNLOADING... <i class="fas fa-spinner fa-spin"></i>';
    setTimeout(() => {
         btn.innerHTML = 'THANKS! <i class="fas fa-check"></i>';
         setTimeout(() => btn.innerHTML = originalText, 2000);
    }, 1000);
}

// --- Music Card Logic ---
const songs = [
        {
        title: "The Emptiness Machine",
        artist: "Linkin Park",
        file: "assets/songs/Linkin Park- The Emptiness Machine (2013venjix Edit).mp3",
        cover: "url('assets/albumCovers/linkinCover.jpg')",
        heroBg: "assets/backgrounds/pink.jpg",
        theme: {
            bg: "0 0 0",          // Black
            text: "255 255 255",  // White
            accent: "255 0 255",  // Pink
            secondary: "255 105 180", // Hot Pink
            panel: "20 20 20",    // Dark Grey
            gray: "128 128 128"
        }
    },
    {
        title: "City Walls",
        artist: "Twenty One Pilots",
        file: "assets/songs/twenty one pilots - City Walls.mp3",
        cover: "url('assets/albumCovers/twentyCover.png')",
        heroBg: "assets/backgrounds/red.jpg",
        theme: {
            bg: "0 0 0",          // Black
            text: "255 255 255",  // White
            accent: "255 0 0",    // Red
            secondary: "139 0 0", // Dark Red
            panel: "20 20 20",    // Dark Grey
            gray: "128 128 128"
        }
    },

    {
        title: "505",
        artist: "Arctic Monkeys",
        file: "assets/songs/Arctic Monkeys- 505.mp3",
        cover: "url('assets/albumCovers/arcticCover.jpg')",
        heroBg: "assets/backgrounds/yellow.jpg",
        theme: {
            bg: "0 0 0",          // Black
            text: "255 255 255",  // White
            accent: "255 255 0",  // Yellow
            secondary: "255 215 0", // Gold
            panel: "20 20 20",    // Dark Grey
            gray: "128 128 128"
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

function loadSong(index) {
    const song = songs[index];
    songTitle.innerText = song.title;
    artistName.innerText = song.artist;
    albumArt.style.backgroundImage = song.cover;
    albumArt.style.backgroundSize = "cover";
    
    audioPlayer.src = song.file;

    // Update Hero Background
    if (heroBg) {
        heroBg.style.backgroundImage = `url('${song.heroBg}')`;
    }
    
    // Update Theme
    const root = document.documentElement;
    root.style.setProperty('--bg-rgb', song.theme.bg);
    root.style.setProperty('--text-rgb', song.theme.text);
    root.style.setProperty('--accent-rgb', song.theme.accent);
    root.style.setProperty('--secondary-rgb', song.theme.secondary);
    root.style.setProperty('--panel-rgb', song.theme.panel);
    root.style.setProperty('--gray-rgb', song.theme.gray);

    // Update Favicon
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

// Auto-play next song when ended
audioPlayer.addEventListener('ended', nextSong);
audioPlayer.addEventListener('timeupdate', updateProgress);
progressContainer.addEventListener('click', setProgress);

// Error handling for audio
audioPlayer.addEventListener('error', (e) => {
    console.error("Error loading audio file:", audioPlayer.src);
    const icon = playBtn.querySelector('i');
    icon.className = 'fas fa-exclamation-triangle text-red-500';
});

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);

// Initialize and Autoplay Logic
loadSong(currentSongIndex);

// Attempt to play immediately (Autoplay)
const tryAutoplay = () => {
    audioPlayer.volume = 0.5; // Start at 50% volume
    const playPromise = audioPlayer.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // Autoplay started successfully
            isPlaying = true;
            const icon = playBtn.querySelector('i');
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            musicCard.classList.remove('paused');
        })
        .catch(error => {
            console.log("Autoplay prevented. Waiting for user interaction.");
            isPlaying = false;
            const icon = playBtn.querySelector('i');
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            musicCard.classList.add('paused');
        });
    }
};

tryAutoplay();

// --- Journey Expand/Collapse ---
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

// --- Translation Logic ---
const translations = {
    en: {
        "nav.projects": "Projects",
        "nav.journey": "Journey",
        "nav.about": "About",
        "nav.contact": "Contact",
        "hero.available": "Available for Work",
        "hero.location": "Brazil / Fortaleza, Ceará",
        "hero.description": "Full Stack Developer mastering <span class=\"text-neon font-medium\">Angular + Spring Boot</span>. Crafting scalable systems and <span class=\"text-sakura font-medium\">aesthetic interfaces</span> where code meets creativity.",
        "hero.viewProjects": "PROJECTS",
        "hero.resume": "RESUME",
        "hero.scroll": "Scroll to Explore",
        "projects.title": "Selected",
        "projects.works": "Works",
        "projects.description": "A collection of digital experiences, applications, and experiments crafted with precision and passion.",
        "projects.wantToSee": "Want to see",
        "projects.more": "More?",
        "projects.visitGithub": "VISIT MY GITHUB :3",
        "journey.subtitle": "Career Path",
        "journey.title": "Journey",
        "journey.role1": "FullStack Developer",
        "journey.date1": "Jan. 2025 - Present",
        "journey.status1": "Current Position | Angular + Spring",
        "journey.desc1": "Advanced to full developer role, taking on greater responsibilities in system architecture and leadership.",
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
        "journey.date2": "Apr. 2024 - Dec. 2024",
        "journey.status2": "Completed | Angular + Spring",
        "journey.desc2": "Started my professional journey as an intern, contributing to system development and learning industry best practices.",
        "journey.role2.item1": "Contributed to the development and improvement of Exitus system interfaces, focusing on usability and accessibility",
        "journey.role2.item2": "Assisted in creating user flows and interface design, collaborating closely with the UI/UX team",
        "journey.role2.item3": "Participated in front-end development using Angular, TypeScript, and CSS, and supported the back-end with Spring Boot",
        "journey.role2.item4": "Gained hands-on experience with full-stack development in a professional environment",
        "journey.role2.item5": "Learned Agile development methodologies and team collaboration practices",
        "about.offCode": "OFF CODE",
        "about.title1": "Just Keep",
        "about.title2": "Swimming",
        "about.description": "Beyond the code, I have a deep fascination with <span class=\"text-white font-medium\">Sharks</span> & <span class=\"text-white font-medium\">Pokémon</span>. Just like in development, I believe in constant evolution and adapting to the environment to survive and thrive.",
        "about.stat1.label": "Favorite Era",
        "about.stat1.value": "Gen 4 - Sinnoh",
        "about.stat2.label": "Spirit Animal",
        "about.stat2.value": "Hammerhead Shark",
        "about.stat3.label": "Main Framework",
        "about.stat3.value": "Angular and React",
        "about.stat4.label": "Graduation",
        "about.stat4.value": "2026.2",
        "about.downloadCV": "DOWNLOAD CV",
        "footer.title1": "Did you like it?",
        "footer.title2": "Let's",
        "footer.connect": "Connect",
        "footer.copyright": "&copy; 2025 Enzo Esmeraldo. All rights reserved.",
        "footer.credits": "Designed & Built with <i class=\"fas fa-heart text-sakura animate-pulse\"></i> in Brazil",
        "music.hint": "Change song to switch theme"
    },
    pt: {
        "nav.projects": "Projetos",
        "nav.journey": "Jornada",
        "nav.about": "Sobre",
        "nav.contact": "Contato",
        "hero.available": "Disponível para Trabalho",
        "hero.location": "Brasil / Fortaleza, Ceará",
        "hero.description": "Desenvolvedor Full Stack dominando <span class=\"text-neon font-medium\">Angular + Spring Boot</span>. Criando sistemas escaláveis e <span class=\"text-sakura font-medium\">interfaces estéticas</span> onde código encontra criatividade.",
        "hero.viewProjects": "PROJETOS",
        "hero.resume": "CURRÍCULO",
        "hero.scroll": "Role para Explorar",
        "projects.title": "Trabalhos",
        "projects.works": "Selecionados",
        "projects.description": "Uma coleção de experiências digitais, aplicações e experimentos criados com precisão e paixão.",
        "projects.wantToSee": "Quer ver",
        "projects.more": "Mais?",
        "projects.visitGithub": "VISITE O GITHUB",
        "journey.subtitle": "Trajetória Profissional",
        "journey.title": "Jornada",
        "journey.role1": "Desenvolvedor FullStack",
        "journey.date1": "Jan. 2025 - Presente",
        "journey.status1": "Cargo Atual | Angular + Spring",
        "journey.desc1": "Avancei para o cargo de desenvolvedor pleno, assumindo maiores responsabilidades na arquitetura do sistema e liderança.",
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
        "journey.date2": "Abr. 2024 - Dez. 2024",
        "journey.status2": "Concluído | Angular + Spring",
        "journey.desc2": "Iniciei minha jornada profissional como estagiário, contribuindo para o desenvolvimento de sistemas e aprendendo as melhores práticas da indústria.",
        "journey.role2.item1": "Contribuí para o desenvolvimento e melhoria das interfaces do sistema Exitus, focando em usabilidade e acessibilidade",
        "journey.role2.item2": "Auxiliei na criação de fluxos de usuário e design de interface, colaborando estreitamente com a equipe de UI/UX",
        "journey.role2.item3": "Participei do desenvolvimento front-end usando Angular, TypeScript e CSS, e apoiei o back-end com Spring Boot",
        "journey.role2.item4": "Ganhei experiência prática com desenvolvimento full-stack em um ambiente profissional",
        "journey.role2.item5": "Aprendi metodologias de desenvolvimento Ágil e práticas de colaboração em equipe",
        "about.offCode": "OFF CODE",
        "about.title1": "Continue a",
        "about.title2": "Nadar",
        "about.description": "Além do código, tenho um fascínio profundo por <span class=\"text-white font-medium\">Tubarões</span> & <span class=\"text-white font-medium\">Pokémon</span>. Assim como no desenvolvimento, acredito na evolução constante e adaptação ao ambiente para sobreviver e prosperar.",
        "about.stat1.label": "Era Favorita",
        "about.stat1.value": "Gen 4 - Sinnoh",
        "about.stat2.label": "Espírito Animal",
        "about.stat2.value": "Tubarão Martelo",
        "about.stat3.label": "Framework Principal",
        "about.stat3.value": "Angular e React",
        "about.stat4.label": "Graduação",
        "about.stat4.value": "2026.2",
        "about.downloadCV": "BAIXAR CV",
        "footer.title1": "Gostou?",
        "footer.title2": "Vamos nos",
        "footer.connect": "Conectar",
        "footer.copyright": "&copy; 2025 Enzo Esmeraldo. Todos os direitos reservados.",
        "footer.credits": "Projetado & Construído com <i class=\"fas fa-heart text-sakura animate-pulse\"></i> no Brasil",
        "music.hint": "Mude a música para trocar o tema"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    
    // Update Text Content
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    // Update CV Links
    const cvLinks = document.querySelectorAll('a[href*="cv"]');
    const cvFile = lang === 'pt' ? 'assets/cv/EnzoEsmeraldo_CV_PT.pdf' : 'assets/cv/EnzoEsmeraldo_CV_EN.pdf';
    cvLinks.forEach(link => {
        link.href = cvFile;
    });

    // Update Toggle Buttons
    const desktopBtn = document.getElementById('current-lang-desktop');
    const mobileBtn = document.getElementById('current-lang-mobile');
    
    if(desktopBtn) desktopBtn.textContent = lang.toUpperCase();
    if(mobileBtn) mobileBtn.textContent = lang.toUpperCase();

    // Save preference
    localStorage.setItem('preferred-lang', lang);
}

function toggleLanguage() {
    const newLang = currentLang === 'en' ? 'pt' : 'en';
    setLanguage(newLang);
}

// Initialize Language
function initLanguage() {
    const savedLang = localStorage.getItem('preferred-lang');
    const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
    const initialLang = savedLang || browserLang;
    
    setLanguage(initialLang);

    // Event Listeners
    const desktopToggle = document.getElementById('lang-toggle-desktop');
    const mobileToggle = document.getElementById('lang-toggle-mobile');

    if(desktopToggle) desktopToggle.addEventListener('click', toggleLanguage);
    if(mobileToggle) mobileToggle.addEventListener('click', toggleLanguage);
}

// Call init
document.addEventListener('DOMContentLoaded', initLanguage);

