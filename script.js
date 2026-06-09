/**
 * Magical Birthday Surprise Site Logic
 * Adheres strictly to safe DOM manipulation rules (no innerHTML).
 */

// --- Global UI State & Constants ---
const CORRECT_DATE = "09/06";
let activeScreen = "verify";
let audioContext = null;
let musicPlaying = false;
let synthIntervalId = null;

// Statically loaded image paths only

// --- DOM References ---
const screenVerify = document.getElementById("screen-verify");
const screenSecurity = document.getElementById("screen-security");
const screenLock = document.getElementById("screen-lock");
const screenGift3 = document.getElementById("screen-gift3");
const screenGift5 = document.getElementById("screen-gift5");

// Enforce initial screen flow at startup:
// Show ONLY screen-verify, hide all others.
function initStartupScreens() {
  screenVerify.classList.remove("hidden");
  screenSecurity.classList.add("hidden");
  screenLock.classList.add("hidden");
  screenGift3.classList.add("hidden");
  screenGift5.classList.add("hidden");
}
initStartupScreens();

const lockPanel = document.getElementById("lock-panel");
const lockDateInput = document.getElementById("lock-date-input");
const lockErrorMsg = document.getElementById("lock-error-msg");
const magicalLock = document.getElementById("magical-lock");
const lockShackle = document.getElementById("lock-shackle");

// Page 3 Card Elements
const giftCard1 = document.getElementById("gift-card-1");
const giftCard2 = document.getElementById("gift-card-2");
const giftCard3 = document.getElementById("gift-card-3");
const btnCard1Complete = document.getElementById("btn-card1-complete");
const btnCard2Complete = document.getElementById("btn-card2-complete");
const btnCard3Complete = document.getElementById("btn-card3-complete");
const finalActionContainer = document.getElementById("final-action-container");
const btnGift3Continue = document.getElementById("btn-gift3-continue");

// Lightbox DOM Elements
const lightboxModal = document.getElementById("lightbox-modal");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");

const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const btnGoAway = document.getElementById("btn-go-away");
const musicToggleBtn = document.getElementById("music-toggle-btn");

// Lightbox close events
lightboxClose.addEventListener("click", () => {
  lightboxModal.classList.remove("active");
});
lightboxModal.addEventListener("click", (e) => {
  if (e.target === lightboxModal) {
    lightboxModal.classList.remove("active");
  }
});

// --- Screen Flow Logic ---
btnNo.addEventListener("click", () => {
  transitionScreens(screenVerify, screenSecurity);
  activeScreen = "security";
});

btnGoAway.addEventListener("click", () => {
  transitionScreens(screenSecurity, screenVerify);
  activeScreen = "verify";
});

btnYes.addEventListener("click", () => {
  // Start music on user gesture
  initAndStartMusic();
  
  // Cross-fade: Fade in lock screen immediately while zooming out verify screen
  screenLock.classList.remove("hidden");
  screenVerify.classList.add("zoom-out-fade");
  
  setTimeout(() => {
    screenVerify.classList.add("hidden");
    screenVerify.classList.remove("zoom-out-fade");
    activeScreen = "lock";
    lockDateInput.focus();
  }, 600);
});

function transitionScreens(fromScreen, toScreen) {
  fromScreen.classList.add("hidden");
  toScreen.classList.remove("hidden");
}

// --- Date Input Formatter & Lock Code Validation ---
lockDateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});

lockDateInput.addEventListener("input", (e) => {
  // Clear error on new input
  lockErrorMsg.classList.remove("show");

  let inputVal = e.target.value;
  // Strip non-numbers
  inputVal = inputVal.replace(/[^0-9]/g, "");

  // Format with /
  if (inputVal.length > 2) {
    inputVal = inputVal.substring(0, 2) + "/" + inputVal.substring(2, 4);
  }

  e.target.value = inputVal;

  // Validate only when fully entered (5 chars: DD/MM)
  if (e.target.value.length === 5) {
    validateLockCode(e.target.value);
  }
});

let lockUnlocked = false;
function validateLockCode(code) {
  if (lockUnlocked) return;
  
  // Handle various formats if user managed to type them, like 09-06, 9/6, etc.
  const normalized = code.replace(/[^0-9]/g, "");
  
  if (normalized === "0906" || normalized === "96") {
    lockUnlocked = true;
    // Unlocked successfully!
    magicalLock.classList.add("unlocked");
    // Animate shackle upward / rotate
    lockShackle.setAttribute("transform", "translate(0, -15) rotate(-10 50 30)");
    
    // Light celebration effect (reduced by 75%)
    triggerFireworks();
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.65 }
    });
    
    // Add success header safely
    const successTitle = document.createElement("h2");
    successTitle.textContent = "Happy Birthday, Karthi ❤️";
    successTitle.style.color = "var(--light-purple)";
    successTitle.style.marginTop = "1.5rem";
    successTitle.style.animation = "boxFloat 3s infinite ease-in-out";
    
    // Avoid innerHTML: insert nodes securely
    lockPanel.appendChild(successTitle);
    
    lockDateInput.disabled = true;

    // Transition to Page 3 (Memory Gift Box) after 1.5 seconds
    setTimeout(() => {
      transitionScreens(screenLock, screenGift3);
      activeScreen = "gift3";
      initGift3Handlers();
    }, 1500);
  } else {
    // Lock shake & Error
    magicalLock.classList.add("lock-shake");
    lockErrorMsg.classList.add("show");
    
    setTimeout(() => {
      magicalLock.classList.remove("lock-shake");
    }, 500);
  }
}



// --- Magical Music Box Synthesizer (Web Audio API) ---
// Plays a dreamy, chime-like loop of Happy Birthday.
const BIRTHDAY_MELODY = [
  { note: 'G4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'C5', dur: 1 }, { note: 'B4', dur: 2 },
  { note: 'G4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'D5', dur: 1 }, { note: 'C5', dur: 2 },
  { note: 'G4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'G5', dur: 1 }, { note: 'E5', dur: 1 }, { note: 'C5', dur: 1 }, { note: 'B4', dur: 1 }, { note: 'A4', dur: 2 },
  { note: 'F5', dur: 0.5 }, { note: 'F5', dur: 0.5 }, { note: 'E5', dur: 1 }, { note: 'C5', dur: 1 }, { note: 'D5', dur: 1 }, { note: 'C5', dur: 2 }
];

const NOTE_FREQS = {
  'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
};

function initAndStartMusic() {
  if (musicPlaying) return;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  musicPlaying = true;
  musicToggleBtn.classList.add("playing");
  
  let noteIndex = 0;
  let nextNoteTime = audioContext.currentTime + 0.1;
  
  function playMelodyLoop() {
    if (!musicPlaying) return;
    
    const current = audioContext.currentTime;
    // Keep scheduling notes ahead
    while (nextNoteTime < current + 0.3) {
      const currentNote = BIRTHDAY_MELODY[noteIndex];
      playChimeNote(currentNote.note, nextNoteTime, currentNote.dur * 0.7);
      
      // Calculate next time
      nextNoteTime += currentNote.dur * 0.75; // slightly faster tempo
      noteIndex = (noteIndex + 1) % BIRTHDAY_MELODY.length;
    }
    
    synthIntervalId = setTimeout(playMelodyLoop, 100);
  }
  
  playMelodyLoop();
}

function playChimeNote(note, startTime, duration) {
  if (!audioContext || !NOTE_FREQS[note]) return;
  
  const osc1 = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  
  // Connect nodes
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Set oscillator properties for a music box sound (sine + triangle chime overlay)
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(NOTE_FREQS[note], startTime);
  
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(NOTE_FREQS[note] * 2, startTime); // One octave higher harmonic
  
  // Set Filter to make it mellow and warm
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1500, startTime);
  filter.Q.setValueAtTime(1, startTime);
  
  // Envelope (Pluck sound)
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.22, startTime + 0.03); // Quick attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Long decay
  
  // Start and stop
  osc1.start(startTime);
  osc1.stop(startTime + duration);
  osc2.start(startTime);
  osc2.stop(startTime + duration);
}

function stopMusic() {
  musicPlaying = false;
  musicToggleBtn.classList.remove("playing");
  if (synthIntervalId) {
    clearTimeout(synthIntervalId);
    synthIntervalId = null;
  }
}

musicToggleBtn.addEventListener("click", () => {
  if (musicPlaying) {
    stopMusic();
  } else {
    initAndStartMusic();
  }
});


// --- Canvas 1: Starry Sparkles Background ---
const bgCanvas = document.getElementById("bg-canvas");
const bgCtx = bgCanvas.getContext("2d");
let stars = [];

function resizeBgCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  initStars();
}

function initStars() {
  stars = [];
  const starCount = Math.floor((bgCanvas.width * bgCanvas.height) / 8000);
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      radius: Math.random() * 1.5 + 0.2,
      alpha: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      color: getRandomStarColor()
    });
  }
}

function getRandomStarColor() {
  const colors = [
    "rgba(255, 255, 255, ",
    "rgba(177, 159, 251, ", // Lavender
    "rgba(255, 101, 163, ", // Pink
    "rgba(255, 215, 0, "   // Gold
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function animateStars() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    s.alpha += s.twinkleSpeed;
    if (s.alpha > 1 || s.alpha < 0) {
      s.twinkleSpeed = -s.twinkleSpeed;
    }
    
    // Slow downward movement to give a dreamy vibe
    s.y += 0.08;
    if (s.y > bgCanvas.height) {
      s.y = 0;
      s.x = Math.random() * bgCanvas.width;
    }
    
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    bgCtx.fillStyle = s.color + Math.max(0, s.alpha) + ")";
    bgCtx.fill();
  }
  
  requestAnimationFrame(animateStars);
}

window.addEventListener("resize", resizeBgCanvas);
resizeBgCanvas();
animateStars();


// --- Canvas 2: Confetti & Fireworks ---
const celebCanvas = document.getElementById("celebration-canvas");
const celebCtx = celebCanvas.getContext("2d");
let celebActive = false;
let particles = [];
let fireworkTimers = [];

function resizeCelebCanvas() {
  celebCanvas.width = window.innerWidth;
  celebCanvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCelebCanvas);
resizeCelebCanvas();

class FireworkParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.gravity = 0.08;
    this.decay = Math.random() * 0.02 + 0.015;
    this.size = Math.random() * 2 + 1.5;
  }
  
  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }
  
  draw() {
    celebCtx.save();
    celebCtx.globalAlpha = Math.max(0, this.alpha);
    celebCtx.beginPath();
    celebCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    celebCtx.fillStyle = this.color;
    celebCtx.shadowBlur = 8;
    celebCtx.shadowColor = this.color;
    celebCtx.fill();
    celebCtx.restore();
  }
}

class Confetti {
  constructor() {
    this.x = Math.random() * celebCanvas.width;
    this.y = Math.random() * -100 - 10;
    this.size = Math.random() * 8 + 4;
    this.color = ["#ffd700", "#ff65a3", "#b19ffb", "#7f5feb", "#ffffff"][Math.floor(Math.random() * 5)];
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 4 - 2;
    this.vx = Math.random() * 2 - 1;
    this.vy = Math.random() * 2 + 2;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
  }
  
  draw() {
    celebCtx.save();
    celebCtx.translate(this.x, this.y);
    celebCtx.rotate((this.rotation * Math.PI) / 180);
    celebCtx.fillStyle = this.color;
    celebCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
    celebCtx.restore();
  }
}

function spawnFirework() {
  if (!celebActive) return;
  
  const sx = Math.random() * celebCanvas.width;
  const sy = Math.random() * (celebCanvas.height * 0.5);
  const colors = ["#ff65a3", "#ffd700", "#b19ffb", "#7f5feb", "#00ffff"];
  const selectedColor = colors[Math.floor(Math.random() * colors.length)];
  
  // Reduced firework particle count (by 73%)
  for (let i = 0; i < 12; i++) {
    particles.push(new FireworkParticle(sx, sy, selectedColor));
  }
  
  // Continuously spawn next firework at random intervals
  setTimeout(spawnFirework, Math.random() * 1000 + 800);
}

function triggerFireworks() {
  celebActive = true;
  celebCanvas.classList.add("active");
  
  // Spawn initial burst
  spawnFirework();
  spawnFirework();
  
  // Add confetti particles
  // Reduced initial confetti particles (by 75%)
  for (let i = 0; i < 20; i++) {
    particles.push(new Confetti());
  }
  
  function animateCelebration() {
    if (!celebActive) return;
    
    // Clear with slight trailing effect
    celebCtx.fillStyle = "rgba(9, 3, 20, 0.2)";
    celebCtx.fillRect(0, 0, celebCanvas.width, celebCanvas.height);
    
    // Periodically spawn new confetti to keep it active
    // Reduced background confetti spawn rate and cap
    if (Math.random() < 0.05 && particles.filter(p => p instanceof Confetti).length < 25) {
      particles.push(new Confetti());
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      
      // Remove dead particles
      if (p.alpha <= 0 || p.y > celebCanvas.height + 20) {
        particles.splice(i, 1);
      }
    }
    
    requestAnimationFrame(animateCelebration);
  }
  
  animateCelebration();
}




// --- Confetti Explosion Effect ---
function triggerConfettiExplosion() {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.65 },
    colors: ['#b19ffb', '#ff65a3', '#ffd700', '#ffffff', '#7f5feb']
  });

  // Staggered side bursts for a grand feel
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.85 },
      colors: ['#b19ffb', '#ff65a3', '#ffd700']
    });
  }, 250);
  
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.85 },
      colors: ['#b19ffb', '#ff65a3', '#ffd700']
    });
  }, 500);
}

// --- Page 3 & Page 4: Interactive Gift Boxes & Text Animations ---

let gift3Initialized = false;
function initGift3Handlers() {
  if (gift3Initialized) return;
  gift3Initialized = true;

  // DOM Elements for cards
  const giftCard1 = document.getElementById("gift-card-1");
  const giftCard2 = document.getElementById("gift-card-2");
  const giftCard3 = document.getElementById("gift-card-3");

  const btnCard1Complete = document.getElementById("btn-card1-complete");
  const btnCard2Complete = document.getElementById("btn-card2-complete");
  const btnCard3Complete = document.getElementById("btn-card3-complete");

  const finalActionContainer = document.getElementById("final-action-container");
  const btnGift3Continue = document.getElementById("btn-gift3-continue");

  // Function to setup zoom on card images
  function setupImageZoom(cardEl, title) {
    const img = cardEl.querySelector(".card-img");
    if (img) {
      img.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent flipping card back
        lightboxImg.src = img.src;
        lightboxCaption.textContent = title;
        lightboxModal.classList.add("active");
      });
    }
  }

  setupImageZoom(giftCard1, "Talktime Memories");
  setupImageZoom(giftCard3, "Little Karthi");

  // Setup click to flip
  function setupCardFlip(cardEl) {
    cardEl.addEventListener("click", () => {
      if (!cardEl.classList.contains("locked") && !cardEl.classList.contains("flipped")) {
        cardEl.classList.add("flipped");
        // Play soft chime sound when opening
        playSoftGiftSound();
        triggerMagicalParticles(cardEl);
      }
    });
  }

  setupCardFlip(giftCard1);
  setupCardFlip(giftCard2);
  setupCardFlip(giftCard3);

  // Complete buttons logic
  btnCard1Complete.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent click event on card
    giftCard2.classList.remove("locked");
    const status = giftCard2.querySelector(".card-status");
    if (status) status.textContent = "Tap to Open 🎁";
    const lockOverlay = giftCard2.querySelector(".card-lock-overlay");
    if (lockOverlay) lockOverlay.remove();
  });

  btnCard2Complete.addEventListener("click", (e) => {
    e.stopPropagation();
    giftCard3.classList.remove("locked");
    const status = giftCard3.querySelector(".card-status");
    if (status) status.textContent = "Tap to Open 🎁";
    const lockOverlay = giftCard3.querySelector(".card-lock-overlay");
    if (lockOverlay) lockOverlay.remove();
  });

  btnCard3Complete.addEventListener("click", (e) => {
    e.stopPropagation();
    finalActionContainer.classList.remove("hidden");
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  });

  btnGift3Continue.addEventListener("click", () => {
    transitionScreens(screenGift3, screenGift5);
    activeScreen = "gift5";
  });
}

// --- Utilities for Chimes, Typewriter & Particles ---

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function typeWriter(text, element, speed) {
  return new Promise((resolve) => {
    let i = 0;
    element.textContent = "";
    element.classList.add("typing");
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        element.classList.remove("typing");
        resolve();
      }
    }
    type();
  });
}

function playGiftOpenSound() {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Major chord
  notes.forEach((freq, idx) => {
    playChimeNoteAtTime(freq, now + idx * 0.08, 0.6);
  });
}

function playSoftGiftSound() {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const notes = [329.63, 392.00, 493.88, 587.33]; // E minor chord
  notes.forEach((freq, idx) => {
    playChimeNoteAtTime(freq, now + idx * 0.14, 0.9, 'triangle');
  });
}

function playChimeNoteAtTime(freq, startTime, duration, type = 'sine') {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.18, startTime + 0.04);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function triggerMagicalParticles(anchor) {
  const rect = anchor.getBoundingClientRect();
  const parent = anchor.parentElement;
  const parentRect = parent.getBoundingClientRect();
  
  const containerX = rect.left + rect.width / 2 - parentRect.left;
  const containerY = rect.top + rect.height / 2 - parentRect.top;

  const colors = ['#b19ffb', '#ff65a3', '#ffd700', '#00ffff', '#ffffff'];

  for (let i = 0; i < 45; i++) {
    const p = document.createElement("div");
    p.className = "magical-particle";
    const size = Math.random() * 8 + 4;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = `${containerX}px`;
    p.style.top = `${containerY}px`;
    p.style.opacity = "1";
    parent.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 8 + 3;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    let posX = containerX;
    let posY = containerY;
    let opacity = 1;

    function animate() {
      posX += vx;
      posY += vy;
      opacity -= 0.02;
      p.style.left = `${posX}px`;
      p.style.top = `${posY}px`;
      p.style.opacity = opacity;

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        p.remove();
      }
    }
    requestAnimationFrame(animate);
  }
}
