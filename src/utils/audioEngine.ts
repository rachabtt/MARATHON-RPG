/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class SciFiAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  
  // Audio nodes for wind synthesis
  private windSource: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  
  // Audio nodes for reactor hum
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private humFilter: BiquadFilterNode | null = null;
  private humGain: GainNode | null = null;
  
  // Master gain
  private masterGain: GainNode | null = null;
  
  // Periodic wind sweep timer
  private lfoInterval: number | null = null;
  
  constructor() {
    // Lazy initialisation on first user interaction
  }

  public init() {
    if (this.ctx) return;
    
    // Create AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported in this browser');
      return;
    }
    this.ctx = new AudioContextClass();
    
    // Create master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    
    // Build white noise buffer
    const bufferSize = 2 * this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this.setupWind();
    this.setupReactorHum();
    
    // Fade in master
    this.masterGain.gain.exponentialRampToValueAtTime(0.8, this.ctx.currentTime + 1.5);
    
    // Start wind modulation
    this.startModulation();
  }
  
  private setupWind() {
    if (!this.ctx || !this.noiseBuffer || !this.masterGain) return;
    
    // 1. Create looping source from noise buffer
    this.windSource = this.ctx.createBufferSource();
    this.windSource.buffer = this.noiseBuffer;
    this.windSource.loop = true;
    
    // 2. Filter: Bandpass filter to sculpt white noise into wind whistle
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(250, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);
    
    // 3. Gain
    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    
    // Connection: Source -> Filter -> Gain -> Master
    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    
    this.windSource.start(0);
  }
  
  private setupReactorHum() {
    if (!this.ctx || !this.masterGain) return;
    
    // Oscillator 1: Main low drone (55Hz, sub octave A)
    this.humOsc1 = this.ctx.createOscillator();
    this.humOsc1.type = 'sawtooth';
    this.humOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);
    
    // Oscillator 2: Slightly detuned drone (55.4Hz) to create organic beating
    this.humOsc2 = this.ctx.createOscillator();
    this.humOsc2.type = 'triangle';
    this.humOsc2.frequency.setValueAtTime(55.4, this.ctx.currentTime);
    
    // Lowpass filter to muffle detuned oscillators, giving a thick cavernous growl
    this.humFilter = this.ctx.createBiquadFilter();
    this.humFilter.type = 'lowpass';
    this.humFilter.frequency.setValueAtTime(110, this.ctx.currentTime);
    this.humFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);
    
    // Hum gain
    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    
    // Connections
    this.humOsc1.connect(this.humFilter);
    this.humOsc2.connect(this.humFilter);
    this.humFilter.connect(this.humGain);
    this.humGain.connect(this.masterGain);
    
    this.humOsc1.start(0);
    this.humOsc2.start(0);
  }
  
  private startModulation() {
    if (!this.ctx) return;
    
    // Gust modulation function using setTimeout / animation loop
    const modulate = () => {
      if (!this.ctx || !this.windFilter || !this.windGain) return;
      
      const now = this.ctx.currentTime;
      // Random frequency target for the wind peak (200Hz to 650Hz)
      const targetFreq = 220 + Math.random() * 400;
      // Stretched over 2 to 4 seconds
      const duration = 2.0 + Math.random() * 2.5;
      
      // Wind resonance shifts with frequency: higher frequency = slightly narrower band
      const targetQ = 1.5 + Math.random() * 2.0;
      
      // Slightly swell the sound with the wind sweep
      const baseGain = 0.08;
      const targetGain = baseGain + ((targetFreq - 220) / 400) * 0.12;
      
      this.windFilter.frequency.exponentialRampToValueAtTime(targetFreq, now + duration);
      this.windFilter.Q.linearRampToValueAtTime(targetQ, now + duration);
      this.windGain.gain.linearRampToValueAtTime(targetGain, now + duration);
      
      this.lfoInterval = window.setTimeout(modulate, duration * 1000);
    };
    
    modulate();
  }
  
  public triggerScannerChirp() {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;
    
    const now = this.ctx.currentTime;
    
    // Create oscillator for scanner chime
    const chirp = this.ctx.createOscillator();
    chirp.type = 'sine';
    chirp.frequency.setValueAtTime(1420, now); // Higher signal tone
    chirp.frequency.exponentialRampToValueAtTime(880, now + 0.15); // Slide down
    
    const chirpGain = this.ctx.createGain();
    chirpGain.gain.setValueAtTime(0.015, now);
    chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3); // Quick decay
    
    chirp.connect(chirpGain);
    chirpGain.connect(this.masterGain);
    
    chirp.start(now);
    chirp.stop(now + 0.35);
  }

  public triggerHeadlightFlickerBeep() {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;
    
    const now = this.ctx.currentTime;
    
    // Very quick static crackle/pop sound
    const crackle = this.ctx.createOscillator();
    crackle.type = 'triangle';
    crackle.frequency.setValueAtTime(150 + Math.random() * 200, now);
    
    const crackleGain = this.ctx.createGain();
    crackleGain.gain.setValueAtTime(0.012, now);
    crackleGain.gain.setValueAtTime(0.012, now + 0.02);
    crackleGain.gain.linearRampToValueAtTime(0.0001, now + 0.04);
    
    crackle.connect(crackleGain);
    crackleGain.connect(this.masterGain);
    
    crackle.start(now);
    crackle.stop(now + 0.05);
  }

  public updateVolumes(windVol: number, humVol: number, radioVol: number = 0.1, stormVol: number = 0.1) {
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    if (this.windGain) {
      // The eolian wind filter swells and behaves aggressively as storm level grows
      const totalWindAndStorm = Math.min(0.9, windVol * 0.25 + stormVol * 0.38);
      this.windGain.gain.linearRampToValueAtTime(totalWindAndStorm, now + 0.3);
    }
    if (this.humGain) {
      // Sub-bass growls expand with storm and interference patterns
      const totalHum = Math.min(0.9, humVol * 0.38 + stormVol * 0.22 + radioVol * 0.08);
      this.humGain.gain.linearRampToValueAtTime(totalHum, now + 0.3);
    }
  }

  public setMute(mute: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    if (mute) {
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
    } else {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.masterGain.gain.linearRampToValueAtTime(0.8, now + 0.5);
    }
  }
  
  public destroy() {
    if (this.lfoInterval) {
      clearTimeout(this.lfoInterval);
    }
    
    try {
      if (this.ctx) {
        this.ctx.close();
      }
    } catch(e) {
      console.error('Error closing audio context:', e);
    }
    
    this.ctx = null;
  }
}
