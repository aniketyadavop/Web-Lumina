/**
 * Chitrkaari Pixel Bugs Engine
 * Crawling pixel-art insects roaming across the site with autonomous wandering,
 * leg-walking cycles, cursor-scurry avoidance, and squashing feedback!
 */

class PixelBugEngine {
  constructor(containerId = 'bug-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'bug-container';
      document.body.appendChild(this.container);
    }
    
    this.bugs = [];
    this.squashedCount = 0;
    this.mouseX = -1000;
    this.mouseY = -1000;
    
    // SVG pixel bug definitions
    this.bugTypes = [
      {
        name: 'ladybug',
        color: '#FF2A55',
        svg: `<svg width="24" height="24" viewBox="0 0 16 16" fill="none" shape-rendering="crispEdges">
          <!-- Antennae -->
          <rect x="5" y="0" width="1" height="2" fill="#000"/>
          <rect x="10" y="0" width="1" height="2" fill="#000"/>
          <!-- Head -->
          <rect x="6" y="2" width="4" height="2" fill="#111"/>
          <rect x="7" y="2" width="1" height="1" fill="#fff"/>
          <rect x="9" y="2" width="1" height="1" fill="#fff"/>
          <!-- Body Shell -->
          <rect x="4" y="4" width="8" height="8" fill="#FF2A55"/>
          <rect x="5" y="3" width="6" height="1" fill="#FF2A55"/>
          <rect x="5" y="12" width="6" height="1" fill="#FF2A55"/>
          <!-- Black Spots -->
          <rect x="5" y="5" width="2" height="2" fill="#000"/>
          <rect x="9" y="5" width="2" height="2" fill="#000"/>
          <rect x="7" y="4" width="2" height="8" fill="#000"/>
          <rect x="5" y="9" width="2" height="2" fill="#000"/>
          <rect x="9" y="9" width="2" height="2" fill="#000"/>
          <!-- Legs (Animated via CSS classes) -->
          <g class="legs-left">
            <rect x="2" y="4" width="2" height="1" fill="#111"/>
            <rect x="1" y="5" width="1" height="2" fill="#111"/>
            <rect x="2" y="8" width="2" height="1" fill="#111"/>
            <rect x="1" y="9" width="1" height="2" fill="#111"/>
            <rect x="2" y="11" width="2" height="1" fill="#111"/>
            <rect x="1" y="12" width="1" height="2" fill="#111"/>
          </g>
          <g class="legs-right">
            <rect x="12" y="4" width="2" height="1" fill="#111"/>
            <rect x="14" y="5" width="1" height="2" fill="#111"/>
            <rect x="12" y="8" width="2" height="1" fill="#111"/>
            <rect x="14" y="9" width="1" height="2" fill="#111"/>
            <rect x="12" y="11" width="2" height="1" fill="#111"/>
            <rect x="14" y="12" width="1" height="2" fill="#111"/>
          </g>
        </svg>`
      },
      {
        name: 'beetle',
        color: '#2A1FE0',
        svg: `<svg width="24" height="24" viewBox="0 0 16 16" fill="none" shape-rendering="crispEdges">
          <!-- Mandibles -->
          <rect x="5" y="0" width="1" height="3" fill="#FFE600"/>
          <rect x="10" y="0" width="1" height="3" fill="#FFE600"/>
          <!-- Head -->
          <rect x="6" y="2" width="4" height="3" fill="#111"/>
          <rect x="6" y="2" width="1" height="1" fill="#00F0FF"/>
          <rect x="9" y="2" width="1" height="1" fill="#00F0FF"/>
          <!-- Carapace -->
          <rect x="4" y="5" width="8" height="9" fill="#2A1FE0"/>
          <rect x="5" y="6" width="6" height="7" fill="#00F0FF"/>
          <rect x="7" y="5" width="2" height="9" fill="#FFE600"/>
          <!-- Legs -->
          <g class="legs-left">
            <rect x="2" y="4" width="2" height="1" fill="#111"/>
            <rect x="1" y="4" width="1" height="3" fill="#111"/>
            <rect x="2" y="8" width="2" height="1" fill="#111"/>
            <rect x="1" y="8" width="1" height="3" fill="#111"/>
            <rect x="2" y="12" width="2" height="1" fill="#111"/>
            <rect x="1" y="12" width="1" height="3" fill="#111"/>
          </g>
          <g class="legs-right">
            <rect x="12" y="4" width="2" height="1" fill="#111"/>
            <rect x="14" y="4" width="1" height="3" fill="#111"/>
            <rect x="12" y="8" width="2" height="1" fill="#111"/>
            <rect x="14" y="8" width="1" height="3" fill="#111"/>
            <rect x="12" y="12" width="2" height="1" fill="#111"/>
            <rect x="14" y="12" width="1" height="3" fill="#111"/>
          </g>
        </svg>`
      },
      {
        name: 'spider',
        color: '#9D00FF',
        svg: `<svg width="26" height="26" viewBox="0 0 16 16" fill="none" shape-rendering="crispEdges">
          <!-- Eyes -->
          <rect x="7" y="3" width="1" height="1" fill="#FF4FB8"/>
          <rect x="9" y="3" width="1" height="1" fill="#FF4FB8"/>
          <rect x="6" y="4" width="1" height="1" fill="#FF4FB8"/>
          <rect x="10" y="4" width="1" height="1" fill="#FF4FB8"/>
          <!-- Spider Body -->
          <rect x="6" y="5" width="4" height="3" fill="#1A1A24"/>
          <rect x="5" y="8" width="6" height="6" fill="#9D00FF"/>
          <rect x="7" y="10" width="2" height="2" fill="#FF4FB8"/>
          <!-- Spider Legs -->
          <g class="legs-left">
            <rect x="2" y="2" width="4" height="1" fill="#9D00FF"/>
            <rect x="1" y="3" width="1" height="3" fill="#9D00FF"/>
            <rect x="2" y="6" width="4" height="1" fill="#9D00FF"/>
            <rect x="0" y="7" width="2" height="2" fill="#9D00FF"/>
            <rect x="2" y="9" width="4" height="1" fill="#9D00FF"/>
            <rect x="1" y="10" width="1" height="3" fill="#9D00FF"/>
            <rect x="2" y="12" width="4" height="1" fill="#9D00FF"/>
            <rect x="0" y="13" width="2" height="2" fill="#9D00FF"/>
          </g>
          <g class="legs-right">
            <rect x="10" y="2" width="4" height="1" fill="#9D00FF"/>
            <rect x="14" y="3" width="1" height="3" fill="#9D00FF"/>
            <rect x="10" y="6" width="4" height="1" fill="#9D00FF"/>
            <rect x="14" y="7" width="2" height="2" fill="#9D00FF"/>
            <rect x="10" y="9" width="4" height="1" fill="#9D00FF"/>
            <rect x="14" y="10" width="1" height="3" fill="#9D00FF"/>
            <rect x="10" y="12" width="4" height="1" fill="#9D00FF"/>
            <rect x="14" y="13" width="2" height="2" fill="#9D00FF"/>
          </g>
        </svg>`
      },
      {
        name: 'glitch',
        color: '#39FF14',
        svg: `<svg width="24" height="24" viewBox="0 0 16 16" fill="none" shape-rendering="crispEdges">
          <!-- Antennas -->
          <rect x="4" y="0" width="2" height="2" fill="#39FF14"/>
          <rect x="10" y="0" width="2" height="2" fill="#39FF14"/>
          <!-- Body segments -->
          <rect x="6" y="2" width="4" height="3" fill="#000"/>
          <rect x="5" y="5" width="6" height="3" fill="#39FF14"/>
          <rect x="4" y="8" width="8" height="4" fill="#000"/>
          <rect x="6" y="9" width="4" height="2" fill="#FFE600"/>
          <rect x="5" y="12" width="6" height="3" fill="#39FF14"/>
          <!-- Fast Legs -->
          <g class="legs-left">
            <rect x="2" y="4" width="3" height="1" fill="#000"/>
            <rect x="1" y="8" width="3" height="1" fill="#000"/>
            <rect x="2" y="12" width="3" height="1" fill="#000"/>
          </g>
          <g class="legs-right">
            <rect x="11" y="4" width="3" height="1" fill="#000"/>
            <rect x="12" y="8" width="3" height="1" fill="#000"/>
            <rect x="11" y="12" width="3" height="1" fill="#000"/>
          </g>
        </svg>`
      }
    ];

    this.init();
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Mobile touch tracking so bugs scurry away from fingers & can be tapped
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      // Clear touch proximity when lifted
      setTimeout(() => {
        this.mouseX = -1000;
        this.mouseY = -1000;
      }, 300);
    });

    // Spawn initial swarm of 12 bugs crawling across the site
    this.spawnBugs(12);

    // Start movement loop
    this.animate();
  }

  spawnBugs(count = 5) {
    for (let i = 0; i < count; i++) {
      this.createBug();
    }
  }

  createBug() {
    const type = this.bugTypes[Math.floor(Math.random() * this.bugTypes.length)];
    const el = document.createElement('div');
    el.className = 'crawling-pixel-bug';
    el.innerHTML = type.svg;
    el.title = `Click to squash this ${type.name}!`;

    // Start near edge or random position
    const screenW = Math.max(window.innerWidth, 1000);
    const screenH = Math.max(window.innerHeight, 800);
    
    // Choose side to spawn from: top, bottom, left, right or interior
    const side = Math.floor(Math.random() * 5);
    let x, y;
    if (side === 0) { x = Math.random() * screenW; y = 10; }
    else if (side === 1) { x = Math.random() * screenW; y = screenH - 50; }
    else if (side === 2) { x = 10; y = Math.random() * screenH; }
    else if (side === 3) { x = screenW - 50; y = Math.random() * screenH; }
    else { x = Math.random() * screenW; y = Math.random() * screenH; }

    const angle = Math.random() * Math.PI * 2;
    const baseSpeed = 1.0 + Math.random() * 1.4;

    const bug = {
      el: el,
      type: type,
      x: x,
      y: y,
      angle: angle,
      targetAngle: angle,
      speed: baseSpeed,
      baseSpeed: baseSpeed,
      walkCycle: Math.random() * 10,
      pauseTimer: 0,
      isSquashed: false,
      turnTimer: 30 + Math.random() * 80
    };

    // Click and touch handlers for squashing!
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.squashBug(bug);
    });

    el.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      this.squashBug(bug);
    }, { passive: true });

    this.container.appendChild(el);
    this.bugs.push(bug);
    return bug;
  }

  squashBug(bug) {
    if (bug.isSquashed) return;
    bug.isSquashed = true;

    // Play squash audio
    if (window.retroAudio) {
      window.retroAudio.playSquash();
    }

    // Squash animation
    bug.el.classList.add('squashed');
    bug.el.style.pointerEvents = 'none';

    // Increment count
    this.squashedCount++;
    this.updateCounterUI();

    // Spawn floating "+50 AURA" popup
    this.spawnFloatingScore(bug.x, bug.y);

    // Spawn mini pixel confetti
    this.spawnConfetti(bug.x, bug.y, bug.type.color);

    // Remove after short delay, and respawn a fresh bug later
    setTimeout(() => {
      if (bug.el.parentNode) {
        bug.el.parentNode.removeChild(bug.el);
      }
      const idx = this.bugs.indexOf(bug);
      if (idx !== -1) {
        this.bugs.splice(idx, 1);
      }
      // Respawn after 7-10 seconds
      setTimeout(() => {
        this.createBug();
      }, 7000 + Math.random() * 4000);
    }, 1800);
  }

  spawnFloatingScore(x, y) {
    const pop = document.createElement('div');
    pop.className = 'bug-floating-score';
    const phrases = ['+50 AURA! 🐛', 'SQUASHED!', '+100 RIZZ', 'GEN-Z WIN!', 'PEST DOWN!'];
    pop.textContent = phrases[Math.floor(Math.random() * phrases.length)];
    pop.style.left = `${x - 20}px`;
    pop.style.top = `${y - 15}px`;
    document.body.appendChild(pop);

    setTimeout(() => {
      if (pop.parentNode) pop.parentNode.removeChild(pop);
    }, 1200);
  }

  spawnConfetti(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'bug-splat-particle';
      p.style.backgroundColor = color;
      p.style.left = `${x + 10}px`;
      p.style.top = `${y + 10}px`;
      const vx = (Math.random() - 0.5) * 60;
      const vy = (Math.random() - 0.5) * 60;
      p.style.setProperty('--vx', `${vx}px`);
      p.style.setProperty('--vy', `${vy}px`);
      document.body.appendChild(p);

      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 600);
    }
  }

  updateCounterUI() {
    const counters = document.querySelectorAll('.bug-counter-val');
    counters.forEach(c => {
      c.textContent = this.squashedCount;
    });
  }

  animate() {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    for (let i = 0; i < this.bugs.length; i++) {
      const b = this.bugs[i];
      if (b.isSquashed) continue;

      // Distance to mouse cursor
      const dxMouse = b.x - this.mouseX;
      const dyMouse = b.y - this.mouseY;
      const distMouse = Math.hypot(dxMouse, dyMouse);

      // Scurry away if cursor is near (< 95px)
      if (distMouse < 95) {
        // Direct panic run away from mouse
        b.targetAngle = Math.atan2(dyMouse, dxMouse);
        b.speed = b.baseSpeed * 3.4; // Frantic scamper speed!
        b.pauseTimer = 0;
      } else {
        b.speed = b.baseSpeed;
        
        // Random wandering behavior
        b.turnTimer--;
        if (b.turnTimer <= 0) {
          b.turnTimer = 40 + Math.random() * 90;
          if (Math.random() < 0.22) {
            // Brief pause to twitch antennae
            b.pauseTimer = 20 + Math.random() * 30;
          } else {
            // New random angle
            b.targetAngle += (Math.random() - 0.5) * 1.8;
          }
        }
      }

      // Smooth angle rotation
      let diff = b.targetAngle - b.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      b.angle += diff * 0.15;

      // Handle pause
      if (b.pauseTimer > 0) {
        b.pauseTimer--;
      } else {
        // Advance bug position
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;
        b.walkCycle += b.speed * 0.45;
      }

      // Screen boundary handling (steer back inside smoothly)
      const margin = 20;
      if (b.x < margin) {
        b.targetAngle = 0;
        b.x = margin;
      } else if (b.x > screenW - margin - 30) {
        b.targetAngle = Math.PI;
        b.x = screenW - margin - 30;
      }
      if (b.y < margin) {
        b.targetAngle = Math.PI / 2;
        b.y = margin;
      } else if (b.y > screenH - margin - 30) {
        b.targetAngle = -Math.PI / 2;
        b.y = screenH - margin - 30;
      }

      // Leg wiggle animation based on walk cycle
      const legOffset = Math.sin(b.walkCycle) * 3;
      const leftLegs = b.el.querySelector('.legs-left');
      const rightLegs = b.el.querySelector('.legs-right');
      if (leftLegs && rightLegs) {
        leftLegs.style.transform = `translateY(${legOffset}px)`;
        rightLegs.style.transform = `translateY(${-legOffset}px)`;
      }

      // SVG heading: 0 rad points DOWN/RIGHT according to SVG orientation
      // SVG is facing UP (y=0 is antennae). So rotation = (angle + 90 deg)
      const deg = (b.angle * 180 / Math.PI) + 90;
      b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${deg}deg)`;
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.PixelBugEngine = PixelBugEngine;
