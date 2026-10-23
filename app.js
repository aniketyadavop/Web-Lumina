/**
 * Chitrkaari Main Application Controller
 * Handles gate transition, tabs, pixel art drawing canvas,
 * avatar stylist, meme generator, soundboard, and stream simulator.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Engines
  const rainEngine = new PixelRainEngine('rain-canvas');
  const cloudsEngine = new PixelCloudsEngine('clouds-container');
  const bugEngine = new PixelBugEngine('bug-container');
  window.bugEngine = bugEngine;

  // 2. Audio & First Interaction
  let audioStarted = false;
  const startAudioOnFirstClick = () => {
    if (!audioStarted) {
      audioStarted = true;
      if (window.retroAudio) {
        window.retroAudio.init();
        window.retroAudio.startRainAudio();
      }
      window.removeEventListener('click', startAudioOnFirstClick);
    }
  };
  window.addEventListener('click', startAudioOnFirstClick, { once: true });

  // Sound Toggle
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (window.retroAudio) {
        const isMuted = window.retroAudio.toggleMute();
        soundIcon.textContent = isMuted ? '🔇' : '🔊';
        soundToggleBtn.classList.toggle('muted', isMuted);
      }
    });
  }

  // CRT Scanlines Toggle
  const crtToggleBtn = document.getElementById('crt-toggle-btn');
  if (crtToggleBtn) {
    crtToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('crt-active');
      if (window.retroAudio) window.retroAudio.playClick();
    });
  }

  // Add retro hover & click sound to buttons
  document.querySelectorAll('button, .clickable, .tab-btn, .color-swatch, .playlist-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.retroAudio) window.retroAudio.playHover();
    });
    el.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playClick();
    });
  });

  // 3. START BUTTON: Transition from Landing Gate to Main App
  const startBtn = document.getElementById('start-experience-btn');
  const landingGate = document.getElementById('landing-gate');
  const pixelShutter = document.getElementById('pixel-shutter');
  const returnGateBtn = document.getElementById('return-gate-btn');

  // Build 100 shutter blocks for retro grid wipe transition
  if (pixelShutter) {
    for (let i = 0; i < 100; i++) {
      const b = document.createElement('div');
      b.className = 'shutter-block';
      b.style.transitionDelay = `${(i % 10 * 0.02) + (Math.floor(i / 10) * 0.02)}s`;
      pixelShutter.appendChild(b);
    }
  }

  if (startBtn && landingGate) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.retroAudio) {
        window.retroAudio.playStartFanfare();
        window.retroAudio.stopRainAudio();
      }

      // Shutter transition
      if (pixelShutter) pixelShutter.classList.add('shutter-active');

      setTimeout(() => {
        landingGate.classList.add('gate-hidden');
        window.scrollTo({ top: 0, behavior: 'instant' });

        setTimeout(() => {
          if (pixelShutter) pixelShutter.classList.remove('shutter-active');
          // Spawn extra bugs to populate main site
          if (bugEngine) bugEngine.spawnBugs(6);
        }, 350);
      }, 500);
    });
  }

  // Return to Gate Button
  if (returnGateBtn && landingGate) {
    returnGateBtn.addEventListener('click', () => {
      if (window.retroAudio) {
        window.retroAudio.playClick();
        window.retroAudio.startRainAudio();
      }
      landingGate.classList.remove('gate-hidden');
    });
  }

  // Thunderstorm Lightning Flash Controller
  const lightningOverlay = document.getElementById('lightning-overlay');
  function triggerLightning() {
    if (!lightningOverlay) return;
    if (landingGate && landingGate.classList.contains('gate-hidden')) {
      setTimeout(triggerLightning, 3000);
      return;
    }

    // Realistic double-flicker lightning strike
    lightningOverlay.style.opacity = '0.75';
    setTimeout(() => {
      lightningOverlay.style.opacity = '0.15';
      setTimeout(() => {
        lightningOverlay.style.opacity = '0.9';
        if (window.retroAudio) {
          window.retroAudio.playThunder();
        }
        setTimeout(() => {
          lightningOverlay.style.opacity = '0';
        }, 120);
      }, 70);
    }, 60);

    // Schedule next strike between 4.5s and 9s
    const nextInterval = 4500 + Math.random() * 4500;
    setTimeout(triggerLightning, nextInterval);
  }
  setTimeout(triggerLightning, 2000);

  // Spawn More Bugs Button
  const spawnBugsBtn = document.getElementById('spawn-bugs-btn');
  if (spawnBugsBtn) {
    spawnBugsBtn.addEventListener('click', () => {
      if (bugEngine) {
        bugEngine.spawnBugs(5);
        if (window.retroAudio) window.retroAudio.playMemeSound('aura');
      }
    });
  }

  // 4. TAB NAVIGATION SYSTEM
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active-tab'));
      tabPanels.forEach(p => p.classList.remove('active-panel'));

      btn.classList.add('active-tab');
      const targetPanel = document.getElementById(`tab-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.add('active-panel');
      }
    });
  });

  // 5. TAB 1: MUSIC // 8-BIT BOOMBOX & SYNTHESIZER
  const tracks = [
    { title: "8:30 AM Lab Hyperpop", artist: "DCE Chiptune Guild", bpm: "140 BPM", tag: "HYPERPOP" },
    { title: "Canteen Chai Phonk Drive", artist: "DJ Backbencher", bpm: "150 BPM", tag: "PHONK" },
    { title: "Midnight Viva Exam Lo-Fi", artist: "Hostel Room 404", bpm: "95 BPM", tag: "LO-FI" },
    { title: "Hostel Terrace Stargazing 8-Bit", artist: "ByteBeats DCE", bpm: "120 BPM", tag: "SYNTH" }
  ];

  let currentTrackIdx = 0;
  let isPlayingTrack = false;

  const playPauseBtn = document.getElementById('music-play-btn');
  const nextTrackBtn = document.getElementById('music-next-btn');
  const prevTrackBtn = document.getElementById('music-prev-btn');
  const nowPlayingTitle = document.getElementById('track-title-display');
  const nowPlayingArtist = document.getElementById('track-artist-display');
  const cassetteBox = document.querySelector('.cassette-player-box');
  const playlistItems = document.querySelectorAll('.playlist-item');

  function updateTrackUI(idx) {
    currentTrackIdx = idx;
    const track = tracks[idx];
    if (nowPlayingTitle) nowPlayingTitle.textContent = track.title;
    if (nowPlayingArtist) nowPlayingArtist.textContent = `${track.artist} // ${track.bpm}`;

    playlistItems.forEach((item, i) => {
      item.classList.toggle('active-track', i === idx);
    });
  }

  function togglePlayTrack() {
    if (!isPlayingTrack) {
      isPlayingTrack = true;
      if (playPauseBtn) playPauseBtn.textContent = '⏸ PAUSE';
      if (cassetteBox) cassetteBox.classList.add('playing-music');
      if (window.retroAudio) window.retroAudio.startMusic(currentTrackIdx);
    } else {
      isPlayingTrack = false;
      if (playPauseBtn) playPauseBtn.textContent = '▶ PLAY';
      if (cassetteBox) cassetteBox.classList.remove('playing-music');
      if (window.retroAudio) window.retroAudio.stopMusic();
    }
  }

  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayTrack);
  if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', () => {
      currentTrackIdx = (currentTrackIdx + 1) % tracks.length;
      updateTrackUI(currentTrackIdx);
      if (isPlayingTrack && window.retroAudio) {
        window.retroAudio.startMusic(currentTrackIdx);
      }
    });
  }
  if (prevTrackBtn) {
    prevTrackBtn.addEventListener('click', () => {
      currentTrackIdx = (currentTrackIdx - 1 + tracks.length) % tracks.length;
      updateTrackUI(currentTrackIdx);
      if (isPlayingTrack && window.retroAudio) {
        window.retroAudio.startMusic(currentTrackIdx);
      }
    });
  }

  playlistItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      updateTrackUI(i);
      if (!isPlayingTrack) {
        togglePlayTrack();
      } else if (window.retroAudio) {
        window.retroAudio.startMusic(i);
      }
    });
  });

  // 6. TAB 2: ART // 16x16 INTERACTIVE PIXEL PAINTPAD
  const pixelGrid = document.getElementById('pixel-canvas');
  let selectedColor = '#2A1FE0';
  let isDrawing = false;
  let activeTool = 'draw'; // 'draw', 'erase'

  // Initialize 16x16 grid cells
  if (pixelGrid) {
    pixelGrid.innerHTML = '';
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const cell = document.createElement('div');
        cell.className = 'pixel-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        
        cell.addEventListener('mousedown', (e) => {
          isDrawing = true;
          applyColor(cell);
        });

        cell.addEventListener('mouseenter', () => {
          if (isDrawing) applyColor(cell);
        });

        pixelGrid.appendChild(cell);
      }
    }

    window.addEventListener('mouseup', () => { isDrawing = false; });
  }

  function applyColor(cell) {
    if (activeTool === 'erase') {
      cell.style.backgroundColor = '#FFFFFF';
    } else {
      cell.style.backgroundColor = selectedColor;
    }
  }

  // Color Swatches
  const swatches = document.querySelectorAll('.color-swatch');
  swatches.forEach(s => {
    s.addEventListener('click', () => {
      swatches.forEach(sw => sw.classList.remove('active-color'));
      s.classList.add('active-color');
      selectedColor = s.getAttribute('data-color');
      activeTool = 'draw';
    });
  });

  const toolPencil = document.getElementById('tool-pencil');
  const toolEraser = document.getElementById('tool-eraser');
  const toolClear = document.getElementById('tool-clear');
  const toolDownload = document.getElementById('tool-download');

  if (toolPencil) {
    toolPencil.addEventListener('click', () => {
      activeTool = 'draw';
      toolPencil.classList.add('pixel-btn-blue');
      if (toolEraser) toolEraser.classList.remove('pixel-btn-blue');
    });
  }

  if (toolEraser) {
    toolEraser.addEventListener('click', () => {
      activeTool = 'erase';
      toolEraser.classList.add('pixel-btn-blue');
      if (toolPencil) toolPencil.classList.remove('pixel-btn-blue');
    });
  }

  if (toolClear && pixelGrid) {
    toolClear.addEventListener('click', () => {
      pixelGrid.querySelectorAll('.pixel-cell').forEach(c => {
        c.style.backgroundColor = '#FFFFFF';
      });
      if (window.retroAudio) window.retroAudio.playMemeSound('bruh');
    });
  }

  if (toolDownload && pixelGrid) {
    toolDownload.addEventListener('click', () => {
      // Render to hidden canvas and trigger download
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const cells = pixelGrid.querySelectorAll('.pixel-cell');
      cells.forEach(cell => {
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        ctx.fillStyle = cell.style.backgroundColor || '#FFFFFF';
        ctx.fillRect(c * 16, r * 16, 16, 16);
      });

      const link = document.createElement('a');
      link.download = 'chitrkaari_pixel_art.png';
      link.href = canvas.toDataURL();
      link.click();
      if (window.retroAudio) window.retroAudio.playMemeSound('aura');
    });
  }

  // 7. TAB 3: FASHION // AVATAR STYLIST & DRIP METER
  const headwearOptions = [
    { name: "Cyber Neon Visor", color: "#00F0FF", type: "visor" },
    { name: "Y2K Fluffy Beanie", color: "#FF4FB8", type: "beanie" },
    { name: "DCE Bucket Hat", color: "#2A1FE0", type: "bucket" },
    { name: "Backwards Cap", color: "#FFE600", type: "cap" }
  ];

  const topOptions = [
    { name: "Oversized DCE Hoodie", color: "#2A1FE0", detail: "HOODIE" },
    { name: "Cyber Acid Wash Tee", color: "#39FF14", detail: "TEE" },
    { name: "Vintage Leather Trench", color: "#1F1F2B", detail: "TRENCH" },
    { name: "Y2K Star Graphic Mesh", color: "#FF4FB8", detail: "MESH" }
  ];

  const bottomOptions = [
    { name: "Baggy Cargo Pants", color: "#424254" },
    { name: "Distressed Skater Denim", color: "#5A72A0" },
    { name: "Parachute Cyber Pants", color: "#111118" },
    { name: "Neon Stripe Trackers", color: "#00F0FF" }
  ];

  const shoesOptions = [
    { name: "Chunky Pixel Kicks", color: "#FFFFFF" },
    { name: "Doc Martens 8-Eyelet", color: "#181820" },
    { name: "Crocs in Turbo Mode", color: "#39FF14" },
    { name: "Cyber High Tops", color: "#FF4FB8" }
  ];

  let currentFit = { head: 0, top: 0, bottom: 0, shoes: 0 };

  const avatarDisplay = document.getElementById('avatar-display');
  const headLabel = document.getElementById('head-label');
  const topLabel = document.getElementById('top-label');
  const bottomLabel = document.getElementById('bottom-label');
  const shoesLabel = document.getElementById('shoes-label');
  const dripScoreText = document.getElementById('drip-score-text');

  function renderAvatar() {
    if (headLabel) headLabel.textContent = headwearOptions[currentFit.head].name;
    if (topLabel) topLabel.textContent = topOptions[currentFit.top].name;
    if (bottomLabel) bottomLabel.textContent = bottomOptions[currentFit.bottom].name;
    if (shoesLabel) shoesLabel.textContent = shoesOptions[currentFit.shoes].name;

    const headColor = headwearOptions[currentFit.head].color;
    const topColor = topOptions[currentFit.top].color;
    const bottomColor = bottomOptions[currentFit.bottom].color;
    const shoesColor = shoesOptions[currentFit.shoes].color;

    if (avatarDisplay) {
      avatarDisplay.innerHTML = `
        <svg width="180" height="240" viewBox="0 0 32 40" shape-rendering="crispEdges">
          <!-- Background glow -->
          <rect x="2" y="2" width="28" height="36" fill="#F8F8FC"/>
          
          <!-- Shadow -->
          <rect x="8" y="37" width="16" height="2" fill="#D0D0DC"/>

          <!-- Head & Skin -->
          <rect x="12" y="8" width="8" height="8" fill="#F7D0B2"/>
          <rect x="13" y="11" width="2" height="2" fill="#111"/>
          <rect x="17" y="11" width="2" height="2" fill="#111"/>
          <rect x="14" y="14" width="4" height="1" fill="#D37E63"/>

          <!-- Selected Headwear -->
          <rect x="10" y="6" width="12" height="4" fill="${headColor}"/>
          <rect x="9" y="8" width="14" height="2" fill="${headColor}"/>

          <!-- Selected Top (Torso & Arms) -->
          <rect x="8" y="16" width="16" height="10" fill="${topColor}"/>
          <rect x="6" y="16" width="3" height="8" fill="${topColor}"/>
          <rect x="23" y="16" width="3" height="8" fill="${topColor}"/>
          <!-- Hands -->
          <rect x="6" y="24" width="3" height="2" fill="#F7D0B2"/>
          <rect x="23" y="24" width="3" height="2" fill="#F7D0B2"/>

          <!-- Selected Bottom (Legs) -->
          <rect x="9" y="26" width="6" height="9" fill="${bottomColor}"/>
          <rect x="17" y="26" width="6" height="9" fill="${bottomColor}"/>

          <!-- Selected Shoes -->
          <rect x="8" y="35" width="7" height="3" fill="${shoesColor}"/>
          <rect x="17" y="35" width="7" height="3" fill="${shoesColor}"/>
        </svg>
      `;
    }
  }

  // Cycle buttons for Avatar
  document.querySelectorAll('.fit-cycle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = btn.dataset.slot;
      const dir = parseInt(btn.dataset.dir, 10);
      if (slot === 'head') {
        currentFit.head = (currentFit.head + dir + headwearOptions.length) % headwearOptions.length;
      } else if (slot === 'top') {
        currentFit.top = (currentFit.top + dir + topOptions.length) % topOptions.length;
      } else if (slot === 'bottom') {
        currentFit.bottom = (currentFit.bottom + dir + bottomOptions.length) % bottomOptions.length;
      } else if (slot === 'shoes') {
        currentFit.shoes = (currentFit.shoes + dir + shoesOptions.length) % shoesOptions.length;
      }
      renderAvatar();
    });
  });

  const rateDripBtn = document.getElementById('rate-drip-btn');
  if (rateDripBtn) {
    rateDripBtn.addEventListener('click', () => {
      const phrases = [
        "🔥 100/100 MAXIMUM RIZZ // The entire canteen turned around!",
        "⚡ 105/100 AURA OVERFLOW // Professor marked you present instantly!",
        "✨ 99/100 PURE Y2K ENERGY // Unstoppable campus drip!",
        "💎 96/100 CERTIFIED FRESH // Campus street style verified!"
      ];
      const randomMsg = phrases[Math.floor(Math.random() * phrases.length)];
      if (dripScoreText) dripScoreText.textContent = randomMsg;
      if (window.retroAudio) window.retroAudio.playMemeSound('aura');
    });
  }

  renderAvatar();

  // 8. TAB 4: MEME // SOUNDBOARD & MEME GENERATOR
  document.querySelectorAll('.sound-pad-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sound = btn.dataset.sound;
      if (window.retroAudio) {
        window.retroAudio.playMemeSound(sound);
      }
    });
  });

  // Meme Generator
  const memeTopInput = document.getElementById('meme-top-input');
  const memeBottomInput = document.getElementById('meme-bottom-input');
  const memeTopDisplay = document.getElementById('meme-top-display');
  const memeBottomDisplay = document.getElementById('meme-bottom-display');
  const memeTemplateSelect = document.getElementById('meme-template-select');
  const memeImageCanvas = document.getElementById('meme-image-holder');

  const memeTemplates = [
    {
      name: "75% Attendance Cat",
      bg: "#2A1FE0",
      svg: `<svg width="120" height="120" viewBox="0 0 16 16" shape-rendering="crispEdges">
        <rect x="4" y="2" width="2" height="3" fill="#FFE600"/>
        <rect x="10" y="2" width="2" height="3" fill="#FFE600"/>
        <rect x="4" y="5" width="8" height="6" fill="#FFE600"/>
        <rect x="5" y="7" width="2" height="2" fill="#000"/>
        <rect x="9" y="7" width="2" height="2" fill="#000"/>
        <rect x="7" y="9" width="2" height="1" fill="#FF4FB8"/>
      </svg>`
    },
    {
      name: "3 AM Coding Viva",
      bg: "#111118",
      svg: `<svg width="120" height="120" viewBox="0 0 16 16" shape-rendering="crispEdges">
        <rect x="2" y="2" width="12" height="9" fill="#00F0FF"/>
        <rect x="3" y="3" width="10" height="7" fill="#000"/>
        <rect x="5" y="5" width="6" height="1" fill="#39FF14"/>
        <rect x="5" y="7" width="4" height="1" fill="#39FF14"/>
        <rect x="6" y="11" width="4" height="2" fill="#888"/>
        <rect x="4" y="13" width="8" height="1" fill="#888"/>
      </svg>`
    },
    {
      name: "Canteen Samosa Stare",
      bg: "#FF4FB8",
      svg: `<svg width="120" height="120" viewBox="0 0 16 16" shape-rendering="crispEdges">
        <polygon points="8,2 2,13 14,13" fill="#FFE600"/>
        <circle cx="8" cy="8" r="1" fill="#C44B00"/>
      </svg>`
    }
  ];

  function updateMemeTemplate() {
    const idx = parseInt(memeTemplateSelect ? memeTemplateSelect.value : 0, 10);
    const tmpl = memeTemplates[idx];
    if (memeImageCanvas) {
      memeImageCanvas.style.backgroundColor = tmpl.bg;
      memeImageCanvas.innerHTML = tmpl.svg;
    }
  }

  if (memeTemplateSelect) {
    memeTemplateSelect.addEventListener('change', updateMemeTemplate);
    updateMemeTemplate();
  }

  if (memeTopInput && memeTopDisplay) {
    memeTopInput.addEventListener('input', () => {
      memeTopDisplay.textContent = memeTopInput.value.toUpperCase() || 'WHEN 8:30 AM CLASS';
    });
  }

  if (memeBottomInput && memeBottomDisplay) {
    memeBottomInput.addEventListener('input', () => {
      memeBottomDisplay.textContent = memeBottomInput.value.toUpperCase() || 'BUT ATTENDANCE IS MANDATORY';
    });
  }

  // Meme Upvotes
  document.querySelectorAll('.meme-vote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const countSpan = btn.querySelector('.vote-count');
      if (countSpan) {
        let count = parseInt(countSpan.textContent, 10);
        countSpan.textContent = count + 1;
        btn.style.borderColor = '#FF4FB8';
        if (window.retroAudio) window.retroAudio.playHover();
      }
    });
  });

  // 9. TAB 5: INTERNET TRENDS // AURA CALCULATOR & STREAM
  const auraCheckboxes = document.querySelectorAll('.aura-check');
  const auraScoreTotal = document.getElementById('aura-score-total');
  const auraRankBadge = document.getElementById('aura-rank-badge');

  function calculateAura() {
    let score = 2500; // Base campus aura
    auraCheckboxes.forEach(cb => {
      if (cb.checked) {
        score += parseInt(cb.dataset.aura, 10);
      }
    });

    if (auraScoreTotal) auraScoreTotal.textContent = score.toLocaleString();

    let rank = "CAMPUS CITIZEN";
    if (score >= 6000) rank = "👑 SIGMA CAMPUS OVERLORD";
    else if (score >= 4000) rank = "🔥 DRIP ICON OF THE YEAR";
    else if (score >= 2500) rank = "✨ CHILL VIBES ONLY";
    else if (score >= 1000) rank = "💀 ATTENDANCE ON LIFE SUPPORT";
    else rank = "📉 SEVERE AURA DEFICIT";

    if (auraRankBadge) auraRankBadge.textContent = rank;
  }

  auraCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      calculateAura();
      if (window.retroAudio) window.retroAudio.playClick();
    });
  });

  calculateAura();

  // Simulated NPC Live Stream Feed
  const chatFeed = document.getElementById('stream-chat-feed');
  const chatMessages = [
    { user: "dce_backbencher", text: "Bro whose phone is that on full volume in lab 💀" },
    { user: "chai_sipper99", text: "Canteen samosa is fresh right now go go go!!" },
    { user: "pixel_samurai", text: "Chitrkaari dropped new drip let's goooo" },
    { user: "attendance_bot", text: "WARNING: You need 3 more classes for 75%" },
    { user: "viva_survivor", text: "Professor asked binary search tree and I said yes" },
    { user: "hyper_poppin", text: "Track 2 phonk beat goes crazy on the speakers" },
    { user: "hostel_ghost", text: "Who took my maggie from the pantry 😡" }
  ];

  if (chatFeed) {
    let msgIdx = 0;
    setInterval(() => {
      const msg = chatMessages[msgIdx % chatMessages.length];
      msgIdx++;

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.innerHTML = `<span class="username">@${msg.user}:</span> ${msg.text}`;
      chatFeed.appendChild(bubble);

      // Keep max 15 messages
      if (chatFeed.children.length > 15) {
        chatFeed.removeChild(chatFeed.children[0]);
      }

      chatFeed.scrollTop = chatFeed.scrollHeight;
    }, 2800);
  }

  // User chat message input
  const streamChatInput = document.getElementById('stream-chat-input');
  if (streamChatInput && chatFeed) {
    streamChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && streamChatInput.value.trim()) {
        const text = streamChatInput.value.trim();
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        const userSpan = document.createElement('span');
        userSpan.className = 'username';
        userSpan.textContent = '@you: ';
        bubble.appendChild(userSpan);
        bubble.appendChild(document.createTextNode(text));
        chatFeed.appendChild(bubble);
        streamChatInput.value = '';
        chatFeed.scrollTop = chatFeed.scrollHeight;
        if (window.retroAudio) window.retroAudio.playClick();
      }
    });
  }

  // Send Stream Heart
  const sendHeartBtn = document.getElementById('stream-heart-btn');
  if (sendHeartBtn) {
    sendHeartBtn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playHover();
      for (let i = 0; i < 4; i++) {
        const heart = document.createElement('div');
        heart.className = 'bug-floating-score';
        heart.textContent = '❤️';
        heart.style.left = `${window.innerWidth * 0.7 + (Math.random() * 80 - 40)}px`;
        heart.style.top = `${window.innerHeight * 0.65}px`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
      }
    });
  }

  // Live 24-hr Pixel Clock
  const clockEl = document.getElementById('pixel-clock');
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${h}:${m}:${s} IST`;
  }
  setInterval(updateClock, 1000);
  updateClock();
});
