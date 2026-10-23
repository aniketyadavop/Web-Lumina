/**
 * Chitrkaari Web Audio Engine
 * Pure synthesized 8-bit retro sound effects and chiptune music.
 * Zero external audio files required.
 */

class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.rainNode = null;
    this.rainGain = null;
    this.musicTimer = null;
    this.isPlayingMusic = false;
    this.currentTrack = 0;
    this.musicTempo = 135;
    this.noteStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.rainGain) this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.stopMusic();
    } else {
      if (this.rainGain) this.rainGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // UI Hover blip
  playHover() {
    if (this.isMuted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  // Button click retro thud/beep
  playClick() {
    if (this.isMuted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // Start Experience Fanfare
  playStartFanfare() {
    if (this.isMuted) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.12);
      });
    } catch (e) {}
  }

  // Bug squashed pop / crunch
  playSquash() {
    if (this.isMuted) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      // High pitch squish pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.07);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);

      // Noise pop
      this.playNoise(0.05, 0.08);
    } catch (e) {}
  }

  playNoise(duration = 0.05, volume = 0.05) {
    if (this.isMuted) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // Synthesized gentle ambient rain background
  startRainAudio() {
    if (this.rainNode) return;
    try {
      this.init();
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      // Pink-ish noise for rain
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      this.rainNode = this.ctx.createBufferSource();
      this.rainNode.buffer = buffer;
      this.rainNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 850;

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, this.ctx.currentTime);

      this.rainNode.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.ctx.destination);
      this.rainNode.start();
    } catch (e) {}
  }

  stopRainAudio() {
    if (this.rainNode) {
      try {
        this.rainNode.stop();
        this.rainNode.disconnect();
      } catch (e) {}
      this.rainNode = null;
      this.rainGain = null;
    }
  }

  // Synthesized deep rolling thunder rumble
  playThunder() {
    if (this.isMuted) return;
    try {
      this.init();
      const duration = 2.4;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        last = (last + (Math.random() * 2 - 1) * 0.05) / 1.05;
        data[i] = last * 3.8;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // 8-bit Meme Soundboard triggers
  playMemeSound(type) {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    switch (type) {
      case 'bruh': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(95, now + 0.35);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'damage': {
        // Emotional damage chime
        [350, 420, 280, 210].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(f, now + i * 0.09);
          gain.gain.setValueAtTime(0.12, now + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.15);
        });
        break;
      }
      case 'aura': {
        // Level up ascending arpeggio
        [330, 440, 554, 659, 880, 1108].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.14, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.18);
        });
        break;
      }
      case 'skibidi': {
        // Funny rapid frequency modulation
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        for (let i = 0; i < 6; i++) {
          osc.frequency.setValueAtTime(i % 2 === 0 ? 600 : 350, now + i * 0.05);
        }
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'viva': {
        // Dramatic survival chord
        [196, 246.94, 293.66, 392.00].forEach((f) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);
        });
        break;
      }
      case 'attendance': {
        // 75% Win triumph fanfare
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          gain.gain.setValueAtTime(0.1, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.22);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.22);
        });
        break;
      }
      default:
        this.playClick();
    }
  }

  // 8-bit Chiptune Music Generator for Music Tab
  startMusic(trackIndex = 0) {
    this.stopMusic();
    this.init();
    this.isPlayingMusic = true;
    this.currentTrack = trackIndex;
    this.noteStep = 0;

    // Track patterns (Melody frequencies & drum beats)
    const tracks = [
      {
        name: "8:30 AM Lab Hyperpop",
        bpm: 140,
        notes: [523.25, 0, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.00, 523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 0],
        bass:  [130.81, 0, 130.81, 0, 164.81, 0, 164.81, 0, 110.00, 0, 110.00, 0, 146.83, 0, 146.83, 0]
      },
      {
        name: "Canteen Chai Phonk Drive",
        bpm: 150,
        notes: [392.00, 392.00, 440.00, 466.16, 523.25, 466.16, 440.00, 392.00, 349.23, 392.00, 440.00, 349.23, 311.13, 349.23, 392.00, 0],
        bass:  [98.00, 98.00, 0, 98.00, 116.54, 0, 116.54, 0, 87.31, 0, 87.31, 0, 77.78, 0, 77.78, 0]
      },
      {
        name: "Midnight Viva Exam Lo-Fi",
        bpm: 95,
        notes: [440.00, 0, 523.25, 0, 659.25, 587.33, 523.25, 0, 392.00, 0, 440.00, 0, 523.25, 493.88, 440.00, 0],
        bass:  [110.00, 0, 0, 110.00, 130.81, 0, 0, 130.81, 98.00, 0, 0, 98.00, 110.00, 0, 0, 110.00]
      },
      {
        name: "Hostel Terrace Stargazing 8-Bit",
        bpm: 120,
        notes: [659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 659.25, 0, 523.25, 659.25, 783.99, 659.25, 523.25, 493.88, 523.25, 0],
        bass:  [164.81, 0, 164.81, 0, 146.83, 0, 146.83, 0, 130.81, 0, 130.81, 0, 123.47, 0, 123.47, 0]
      }
    ];

    const currentData = tracks[trackIndex % tracks.length];
    const stepDurationMs = (60 / currentData.bpm / 4) * 1000;

    const tick = () => {
      if (!this.isPlayingMusic) return;
      if (!this.isMuted) {
        const step = this.noteStep % currentData.notes.length;
        const noteFreq = currentData.notes[step];
        const bassFreq = currentData.bass[step];
        const now = this.ctx.currentTime;

        // Lead synth (square wave)
        if (noteFreq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(noteFreq, now);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + stepDurationMs / 1000 * 0.9);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + stepDurationMs / 1000 * 0.9);
        }

        // Bass synth (triangle)
        if (bassFreq > 0) {
          const bOsc = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bOsc.type = 'triangle';
          bOsc.frequency.setValueAtTime(bassFreq, now);
          bGain.gain.setValueAtTime(0.1, now);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + stepDurationMs / 1000 * 0.85);
          bOsc.connect(bGain);
          bGain.connect(this.ctx.destination);
          bOsc.start(now);
          bOsc.stop(now + stepDurationMs / 1000 * 0.85);
        }

        // Drum beat (kick on 0, 8; snare/noise on 4, 12; hi-hat on every odd step)
        if (step % 8 === 0) {
          // Kick
          const kOsc = this.ctx.createOscillator();
          const kGain = this.ctx.createGain();
          kOsc.frequency.setValueAtTime(140, now);
          kOsc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
          kGain.gain.setValueAtTime(0.2, now);
          kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          kOsc.connect(kGain);
          kGain.connect(this.ctx.destination);
          kOsc.start(now);
          kOsc.stop(now + 0.08);
        } else if (step % 4 === 0) {
          // Snare noise
          this.playNoise(0.04, 0.06);
        }
      }

      this.noteStep++;
      // Dispatch equalizer event for UI visualizer bars
      window.dispatchEvent(new CustomEvent('music-beat', { 
        detail: { 
          step: this.noteStep, 
          track: this.currentTrack,
          intensity: (this.noteStep % 4 === 0 ? 1.0 : 0.6)
        } 
      }));

      this.musicTimer = setTimeout(tick, stepDurationMs);
    };

    tick();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    window.dispatchEvent(new CustomEvent('music-stop'));
  }
}

// Global audio singleton
window.retroAudio = new RetroAudioEngine();
