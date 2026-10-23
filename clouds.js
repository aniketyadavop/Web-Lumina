/**
 * Chitrkaari Pixel Clouds Engine
 * Drifts pixel art clouds seamlessly from left to right across the sky
 */

class PixelCloudsEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.clouds = [];
    this.cloudSvgs = [
      // Cloud Shape 1: Classic puffy pixel cloud
      `<svg width="128" height="64" viewBox="0 0 32 16" fill="currentColor" shape-rendering="crispEdges">
        <rect x="8" y="2" width="12" height="2"/>
        <rect x="6" y="4" width="18" height="2"/>
        <rect x="4" y="6" width="24" height="2"/>
        <rect x="2" y="8" width="28" height="2"/>
        <rect x="0" y="10" width="32" height="4"/>
        <rect x="2" y="14" width="28" height="2"/>
      </svg>`,
      // Cloud Shape 2: Long wispy pixel cloud
      `<svg width="180" height="54" viewBox="0 0 45 14" fill="currentColor" shape-rendering="crispEdges">
        <rect x="14" y="2" width="16" height="2"/>
        <rect x="8" y="4" width="28" height="2"/>
        <rect x="4" y="6" width="36" height="2"/>
        <rect x="0" y="8" width="45" height="4"/>
        <rect x="2" y="12" width="41" height="2"/>
      </svg>`,
      // Cloud Shape 3: Small compact cloud
      `<svg width="96" height="48" viewBox="0 0 24 12" fill="currentColor" shape-rendering="crispEdges">
        <rect x="6" y="2" width="10" height="2"/>
        <rect x="4" y="4" width="14" height="2"/>
        <rect x="2" y="6" width="18" height="2"/>
        <rect x="0" y="8" width="24" height="2"/>
        <rect x="2" y="10" width="20" height="2"/>
      </svg>`,
      // Cloud Shape 4: Giant fluffy cumulus
      `<svg width="220" height="88" viewBox="0 0 44 18" fill="currentColor" shape-rendering="crispEdges">
        <rect x="16" y="2" width="12" height="2"/>
        <rect x="12" y="4" width="20" height="2"/>
        <rect x="8" y="6" width="28" height="2"/>
        <rect x="4" y="8" width="34" height="2"/>
        <rect x="2" y="10" width="40" height="4"/>
        <rect x="0" y="14" width="44" height="2"/>
        <rect x="4" y="16" width="36" height="2"/>
      </svg>`
    ];

    this.init();
  }

  init() {
    const numClouds = 9;
    const screenW = window.innerWidth;

    for (let i = 0; i < numClouds; i++) {
      const el = document.createElement('div');
      el.className = 'pixel-cloud';
      const shapeIdx = i % this.cloudSvgs.length;
      el.innerHTML = this.cloudSvgs[shapeIdx];

      // Random attributes
      const scale = 0.8 + Math.random() * 0.9;
      const speed = 0.35 + Math.random() * 0.75; // Left to right
      const opacity = 0.65 + Math.random() * 0.35;
      const y = 15 + Math.random() * 160; // Top sky region
      // Distribute evenly along width at first
      const x = (screenW / numClouds) * i + (Math.random() * 80 - 40);

      // Dark stormy clouds palette for thunderstorm
      const stormColors = ['#1d2130', '#262c3f', '#323950', '#1c1f2b'];
      const stormColor = stormColors[i % stormColors.length];

      el.style.position = 'absolute';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = `scale(${scale})`;
      el.style.color = stormColor;
      el.style.opacity = opacity;
      el.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.6))';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '3';
      el.style.imageRendering = 'pixelated';

      this.container.appendChild(el);

      this.clouds.push({
        el: el,
        x: x,
        y: y,
        speed: speed,
        scale: scale,
        width: 240 * scale
      });
    }

    this.animate();
  }

  animate() {
    const screenW = window.innerWidth;
    
    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      // Move strictly from LEFT to RIGHT
      c.x += c.speed;

      // Wrap around when past right side
      if (c.x > screenW + 50) {
        c.x = -c.width - Math.random() * 80;
        c.y = 15 + Math.random() * 160;
        c.el.style.top = `${c.y}px`;
      }

      c.el.style.left = `${c.x}px`;
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.PixelCloudsEngine = PixelCloudsEngine;
