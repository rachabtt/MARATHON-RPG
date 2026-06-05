/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getResolvedAudioProfile } from './audioProfiles';
import type { LocationId } from './locations';

export class SciFiAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  
  // Audio nodes for wind synthesis
  private windSource: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private stormSource: AudioBufferSourceNode | null = null;
  private stormFilter: BiquadFilterNode | null = null;
  private stormGain: GainNode | null = null;
  
  // Audio nodes for reactor hum
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private humFilter: BiquadFilterNode | null = null;
  private humGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  
  // Master gain
  private masterGain: GainNode | null = null;
  private windTargetGain = 0.04;
  private radioLevel = 0.1;
  private stormLevel = 0.1;
  private houndsLevel = 0;
  
  // Periodic wind sweep timer
  private lfoInterval: number | null = null;
  private radioInterval: number | null = null;
  private stormInterval: number | null = null;
  
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

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.004, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
    
    // Build white noise buffer
    const bufferSize = 2 * this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this.setupWind();
    this.setupReactorHum();
    this.setupStormBed();
    
    // Fade in master
    this.masterGain.gain.exponentialRampToValueAtTime(0.8, this.ctx.currentTime + 1.5);
    
    // Start wind modulation
    this.startModulation();
    this.startRadioArtifacts();
    this.startStormArtifacts();
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
    this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    
    // Connection: Source -> Filter -> Gain -> Master
    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    
    this.windSource.start(0);
  }

  private setupStormBed() {
    if (!this.ctx || !this.noiseBuffer || !this.masterGain) return;

    this.stormSource = this.ctx.createBufferSource();
    this.stormSource.buffer = this.noiseBuffer;
    this.stormSource.loop = true;

    this.stormFilter = this.ctx.createBiquadFilter();
    this.stormFilter.type = 'lowpass';
    this.stormFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.stormFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.stormGain = this.ctx.createGain();
    this.stormGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.stormSource.connect(this.stormFilter);
    this.stormFilter.connect(this.stormGain);
    this.stormGain.connect(this.masterGain);
    this.stormSource.start(0);
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
    this.humGain.gain.setValueAtTime(0.045, this.ctx.currentTime);
    
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
      
      // Slightly swell the sound with the wind sweep without overriding location/preset mix.
      const targetGain = this.windTargetGain * (0.78 + ((targetFreq - 220) / 400) * 0.42);
      
      this.windFilter.frequency.exponentialRampToValueAtTime(targetFreq, now + duration);
      this.windFilter.Q.linearRampToValueAtTime(targetQ, now + duration);
      this.windGain.gain.linearRampToValueAtTime(Math.max(0.0001, targetGain), now + duration);
      
      this.lfoInterval = window.setTimeout(modulate, duration * 1000);
    };
    
    modulate();
  }

  private startRadioArtifacts() {
    const tick = () => {
      if (this.radioLevel > 0.08) {
        this.triggerRadioTick(this.radioLevel);
      }
      this.radioInterval = window.setTimeout(tick, 900 + Math.random() * 2100);
    };
    tick();
  }

  private startStormArtifacts() {
    const tick = () => {
      if (this.stormLevel > 0.28 && Math.random() < this.stormLevel) {
        this.triggerElectricSnap(this.stormLevel * 0.55);
      }
      if (this.houndsLevel > 0.3 && Math.random() < this.houndsLevel * 0.35) {
        this.triggerHoundShadow();
      }
      this.stormInterval = window.setTimeout(tick, 1200 + Math.random() * 2600);
    };
    tick();
  }

  private createNoiseBurst(duration: number, gain: number, filterType: BiquadFilterType, frequency: number, q: number) {
    if (!this.ctx || !this.noiseBuffer || !this.masterGain || this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const burstGain = this.ctx.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, now);
    filter.Q.setValueAtTime(q, now);
    burstGain.gain.setValueAtTime(gain, now);
    burstGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(burstGain);
    burstGain.connect(this.masterGain);
    source.start(now);
    source.stop(now + duration + 0.02);
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
    chirpGain.gain.setValueAtTime(0.035, now);
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
    crackleGain.gain.setValueAtTime(0.028, now);
    crackleGain.gain.setValueAtTime(0.028, now + 0.02);
    crackleGain.gain.linearRampToValueAtTime(0.0001, now + 0.04);
    
    crackle.connect(crackleGain);
    crackleGain.connect(this.masterGain);
    
    crackle.start(now);
    crackle.stop(now + 0.05);
  }

  private triggerRadioTick(level: number) {
    this.createNoiseBurst(0.08 + Math.random() * 0.08, 0.035 * level, 'bandpass', 1300 + Math.random() * 900, 7);
  }

  private triggerElectricSnap(level: number) {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const snap = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    snap.type = 'sawtooth';
    snap.frequency.setValueAtTime(1800, now);
    snap.frequency.exponentialRampToValueAtTime(90, now + 0.11);
    gain.gain.setValueAtTime(0.08 * level, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    snap.connect(gain);
    gain.connect(this.masterGain);
    snap.start(now);
    snap.stop(now + 0.18);
    this.createNoiseBurst(0.22, 0.045 * level, 'highpass', 900, 1.6);
  }

  public triggerRadioGlitchBurst() {
    this.createNoiseBurst(0.50, 0.16, 'bandpass', 1500, 5.5);
    this.createNoiseBurst(0.24, 0.10, 'highpass', 2600, 2.5);
    this.createNoiseBurst(0.18, 0.07, 'bandpass', 720, 6);

    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;
    const chirp = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    chirp.type = 'square';
    chirp.frequency.setValueAtTime(1800, now);
    chirp.frequency.exponentialRampToValueAtTime(260, now + 0.18);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    chirp.connect(gain);
    gain.connect(this.masterGain);
    chirp.start(now);
    chirp.stop(now + 0.24);
  }

  public triggerRadioSilenceDropout() {
    this.createNoiseBurst(0.18, 0.08, 'highpass', 3200, 1.4);
    this.createNoiseBurst(0.58, 0.06, 'lowpass', 260, 0.8);

    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;
    const drop = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    drop.type = 'sawtooth';
    drop.frequency.setValueAtTime(720, now);
    drop.frequency.exponentialRampToValueAtTime(80, now + 0.28);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    drop.connect(gain);
    gain.connect(this.masterGain);
    drop.start(now);
    drop.stop(now + 0.36);
  }

  public triggerEmFlash() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.12, now);
    this.masterGain.gain.linearRampToValueAtTime(0.78, now + 0.22);
    this.triggerElectricSnap(1.2);
  }

  public triggerHoundShadow() {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const scrape = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    scrape.type = 'triangle';
    scrape.frequency.setValueAtTime(90, now);
    scrape.frequency.exponentialRampToValueAtTime(240, now + 0.18);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    scrape.connect(gain);
    gain.connect(this.masterGain);
    scrape.start(now);
    scrape.stop(now + 0.35);
    this.createNoiseBurst(0.18, 0.04, 'bandpass', 520, 3.2);
  }

  public triggerTransmissionOpen() {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const beep = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    beep.type = 'square';
    beep.frequency.setValueAtTime(880, now);
    beep.frequency.setValueAtTime(1320, now + 0.08);
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    beep.connect(gain);
    gain.connect(this.masterGain);
    beep.start(now);
    beep.stop(now + 0.24);
    this.createNoiseBurst(0.18, 0.035, 'bandpass', 1800, 4.2);
  }

  public updateVolumes(
    windVol: number,
    humVol: number,
    radioVol: number = 0.1,
    stormVol: number = 0.1,
    houndsVol: number = 0,
    locationId?: LocationId | string,
    environmentFilter?: string,
    sceneId?: string | null,
    isStormActive: boolean = false
  ) {
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const profile = getResolvedAudioProfile({
      locationId,
      moodId: environmentFilter,
      sceneId,
      isStormActive,
    });
    this.radioLevel = radioVol * profile.radioGain;
    this.stormLevel = stormVol * profile.stormGain;
    this.houndsLevel = houndsVol * profile.houndsGain;

    if (this.windFilter) {
      const stormLift = environmentFilter === 'storm' || environmentFilter === 'extraction' ? 180 : 0;
      this.windFilter.frequency.linearRampToValueAtTime(profile.windFilterHz + stormLift, now + 0.5);
      this.windFilter.Q.linearRampToValueAtTime(profile.windQ, now + 0.5);
    }
    if (this.windGain) {
      const totalWindAndStorm = Math.min(
        profile.audioWindVolumeMax,
        windVol * 0.20 * profile.windGain + stormVol * 0.30 * profile.stormGain
      );
      this.windTargetGain = totalWindAndStorm;
      this.windGain.gain.linearRampToValueAtTime(totalWindAndStorm, now + 0.3);
    }
    if (this.humGain) {
      const totalHum = Math.min(0.24, humVol * 0.12 * profile.humGain + stormVol * 0.06 + radioVol * 0.02);
      this.humGain.gain.linearRampToValueAtTime(totalHum, now + 0.3);
    }
    if (this.stormGain) {
      const stormBed = Math.min(0.42, stormVol * 0.34 * profile.stormGain);
      this.stormGain.gain.linearRampToValueAtTime(stormBed, now + 0.4);
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
    if (this.radioInterval) {
      clearTimeout(this.radioInterval);
    }
    if (this.stormInterval) {
      clearTimeout(this.stormInterval);
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
