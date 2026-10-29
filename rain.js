/**
 * Chitrkaari Pixel Rain Engine
 * Interactive heavy downpour that dynamically slants towards cursor position & velocity
 */

class PixelRainEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.drops = [];
    this.splashes = [];
    this.maxDrops = 380; // Heavy rain downpour
    
    // Slant & cursor tracking
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.lastMouseX = this.mouseX;
    this.mouseVx = 0;
    this.targetSlant = 0;
    this.currentSlant = 0;
    this.isMouseActive = false;
    this.mouseMoveTimeout = null;
    this.touchRipples = [];
    this.gyroEnabled = false;
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Populate initial drops
    for (let i = 0; i < this.maxDrops; i++) {
      this.drops.push(this.createDrop(true));
    }

    // Cursor tracking for directional rain
    window.addEventListener('mousemove', (e) => {
      this.isMouseActive = true;
      const vx = e.clientX - this.lastMouseX;
      this.mouseVx = vx;
      this.lastMouseX = e.clientX;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      // Calculate target slant:
      // Offset from screen center creates persistent tilt towards cursor side.
      // Mouse movement velocity adds dynamic whip/gust!
      const centerFactor = (e.clientX - this.width / 2) / (this.width / 2);
      const velocityFactor = Math.max(-15, Math.min(15, vx)) * 0.08;
      
      this.targetSlant = (centerFactor * 1.8) + velocityFactor;
      // Clamp between -2.5 and +2.5
      this.targetSlant = Math.max(-2.5, Math.min(2.5, this.targetSlant));

      clearTimeout(this.mouseMoveTimeout);
      this.mouseMoveTimeout = setTimeout(() => {
        // Return to center bias if stationary
        this.targetSlant = centerFactor * 1.5;
        this.mouseVx = 0;
      }, 150);
    });

    // Touch support for mobile/tablets with drag inertia & ripple spawn
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.isMouseActive = true;
        const touch = e.touches[0];
        this.lastMouseX = touch.clientX;
        this.mouseX = touch.clientX;
        this.mouseY = touch.clientY;
        this.createTouchRipple(touch.clientX, touch.clientY);
        this.createSplash(touch.clientX, touch.clientY, 5);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.isMouseActive = true;
        const touch = e.touches[0];
        const vx = touch.clientX - this.lastMouseX;
        this.mouseVx = vx;
        this.lastMouseX = touch.clientX;
        this.mouseX = touch.clientX;
        this.mouseY = touch.clientY;

        const centerFactor = (touch.clientX - this.width / 2) / (this.width / 2);
        const velocityFactor = Math.max(-18, Math.min(18, vx)) * 0.12;
        this.targetSlant = (centerFactor * 1.8) + velocityFactor;
        this.targetSlant = Math.max(-2.6, Math.min(2.6, this.targetSlant));

        // Occasional trail splash while dragging
        if (Math.random() < 0.3) {
          this.createSplash(touch.clientX, touch.clientY, 2);
        }

        clearTimeout(this.mouseMoveTimeout);
        this.mouseMoveTimeout = setTimeout(() => {
          this.targetSlant = centerFactor * 1.4;
          this.mouseVx = 0;
        }, 180);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      // Release touch gradually
      clearTimeout(this.mouseMoveTimeout);
      this.mouseMoveTimeout = setTimeout(() => {
        this.isMouseActive = false;
        this.targetSlant = 0;
      }, 500);
    });

    // Mobile Device Tilt / Gyroscope (DeviceOrientation API)
    this.initGyroscope();

    this.animate();
  }

  initGyroscope() {
    if (window.DeviceOrientationEvent) {
      const handleOrientation = (e) => {
        // gamma is left-to-right tilt in degrees [-90, 90]
        if (e.gamma !== null && e.gamma !== undefined) {
          this.gyroEnabled = true;
          // Scale -45 to +45 deg tilt into slant [-2.4, 2.4]
          const tiltFactor = Math.max(-45, Math.min(45, e.gamma)) / 45;
          // Blend with targetSlant when user isn't actively dragging
          if (!this.isMouseActive) {
            this.targetSlant = tiltFactor * 2.3;
          }
        }
      };

      // iOS 13+ requires user permission requested on user gesture
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        window.requestDeviceOrientationPermission = () => {
          DeviceOrientationEvent.requestPermission()
            .then(state => {
              if (state === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
              }
            })
            .catch(err => console.log('Gyro error:', err));
        };
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
  }

  createTouchRipple(x, y) {
    this.touchRipples.push({
      x: x,
      y: y,
      radius: 4,
      maxRadius: 42,
      alpha: 0.9,
      speed: 2.2
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx.imageSmoothingEnabled = false;
  }

  createDrop(randomY = false) {
    const layer = Math.random();
    return {
      x: Math.random() * (this.width + 400) - 200,
      y: randomY ? Math.random() * this.height : -30,
      length: 12 + Math.random() * 14 * (layer > 0.5 ? 1.2 : 0.8),
      speedY: 16 + Math.random() * 12 * (layer > 0.5 ? 1.3 : 0.9),
      thickness: layer > 0.7 ? 2 : 1,
      layer: layer, // 0 = bg, 1 = fg
      opacity: 0.35 + layer * 0.55
    };
  }

  createSplash(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      this.splashes.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 5 + (this.currentSlant * 1.2),
        vy: -(2 + Math.random() * 4),
        size: 2,
        alpha: 0.9,
        life: 0.85 + Math.random() * 0.15
      });
    }
  }

  animate() {
    // Smoothly interpolate slant towards target slant
    this.currentSlant += (this.targetSlant - this.currentSlant) * 0.08;

    // Clear frame
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render & update raindrops
    const dropCount = this.drops.length;
    for (let i = 0; i < dropCount; i++) {
      const drop = this.drops[i];

      // Slant horizontal shift per frame
      const dx = this.currentSlant * drop.speedY * 0.65;
      drop.x += dx;
      drop.y += drop.speedY;

      // Calculate tail offset
      const tailX = drop.x - (this.currentSlant * drop.length * 0.8);
      const tailY = drop.y - drop.length;

      // Color scheme: electric cyan/blue pixel tint
      const color = drop.layer > 0.7 
        ? `rgba(200, 235, 255, ${drop.opacity})` 
        : `rgba(130, 195, 255, ${drop.opacity})`;

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = drop.thickness;
      this.ctx.beginPath();
      // Draw pixel line
      this.ctx.moveTo(Math.floor(tailX), Math.floor(tailY));
      this.ctx.lineTo(Math.floor(drop.x), Math.floor(drop.y));
      this.ctx.stroke();

      // Check collision with cursor umbrella effect (distance < 35px)
      if (this.isMouseActive) {
        const distSq = (drop.x - this.mouseX) ** 2 + (drop.y - this.mouseY) ** 2;
        if (distSq < 1400) {
          this.createSplash(drop.x, drop.y, 2);
          // Respawn drop above
          this.drops[i] = this.createDrop(false);
          continue;
        }
      }

      // Check collision with bottom of screen (ground splash)
      if (drop.y >= this.height - 25) {
        if (Math.random() < 0.28) {
          this.createSplash(drop.x, this.height - 15 - Math.random() * 20, 2);
        }
        // Respawn above
        this.drops[i] = this.createDrop(false);
      } else if (drop.x < -250 || drop.x > this.width + 250) {
        // Out of horizontal bounds
        this.drops[i] = this.createDrop(false);
      }
    }

    // Render & update splashes
    for (let j = this.splashes.length - 1; j >= 0; j--) {
      const s = this.splashes[j];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.35; // Gravity
      s.alpha *= 0.88;

      if (s.alpha < 0.05) {
        this.splashes.splice(j, 1);
        continue;
      }

      this.ctx.fillStyle = `rgba(220, 245, 255, ${s.alpha})`;
      this.ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    }

    // Render & update interactive touch ripples
    for (let k = this.touchRipples.length - 1; k >= 0; k--) {
      const r = this.touchRipples[k];
      r.radius += r.speed;
      r.alpha *= 0.92;

      if (r.alpha < 0.04 || r.radius >= r.maxRadius) {
        this.touchRipples.splice(k, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.strokeStyle = `rgba(0, 255, 204, ${r.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(Math.floor(r.x), Math.floor(r.y), Math.floor(r.radius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.PixelRainEngine = PixelRainEngine;
