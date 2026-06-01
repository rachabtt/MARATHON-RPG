/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ActiveTransmission, CinemagraphConfig, QuickEffect, SquadOverlayState, TelemetryLog } from '../types';
import type { LocationId } from './locations';
import { getLocationEffectProfile } from './locationEffects';
import { DEFAULT_SQUAD_OVERLAY } from './playerCharacters';

export interface ResourceState {
  id: string;
  name: string;
  states: string[];
  colors: ('emerald' | 'amber' | 'red' | 'stone')[];
  index: number;
}

export interface MissionControlState {
  activeSceneMode: 'normal' | 'dust' | 'scanner' | 'signal' | 'hounds' | 'storm' | 'extraction' | 'silence';
  activeLocation: LocationId;
  resources: ResourceState[];
  effects: {
    dust: number;      // 0, 1, 2, 3
    glitch: number;    // 0, 1, 2, 3
    scanner: number;   // 0, 1, 2, 3
    headlight: number; // 0, 1, 2, 3
    hounds: number;    // 0, 1, 2, 3
    em: number;        // 0, 1, 2, 3
  };
  audio: {
    enabled: boolean;
    windVolume: number;
    radioVolume: number;
    scannerVolume: number;
    humVolume: number;
    stormVolume: number;
    houndsVolume: number;
    radioSilence: boolean;
  };
  displayOptions: {
    screenBlack: boolean;
    activePresetId: string;
    activeTransmission: ActiveTransmission | null;
    newCarthageLoopVariant?: "base" | "workers" | "rover_pass" | "ship_takeoff" | "easter_egg";
    newCarthageLoopCounts?: {
      ship_takeoff: number;
      easter_egg: number;
    };
    // Automation and transition helpers for M01
    newCarthagePhaseStartedAt?: number | null;
    newCarthageLastAutoLoopAt?: number | null;
    newCarthageAutoStep?: number;
    newCarthageLastManualLoopAt?: number | null;
    redPlainsVisualVariant?: 'wide' | 'pov';
    redPlainsTransitionStartedAt?: number | null;
  };
  interventionOptions: {
    showPortrait: boolean;
    showText: boolean;
    playAudio: boolean;
  };
  squadOverlay: SquadOverlayState;
  squad: {
    selectedIds: string[];
    locked: boolean;
  };
  transientEffects: TransientEffectsState;
  quickEffect: QuickEffect | null;
  logs: TelemetryLog[];
}

export const INITIAL_RESOURCES: ResourceState[] = [
  {
    id: 'integrity',
    name: "Intégrité rover",
    states: ["Stable", "Dégradé", "Critique", "Perdu"],
    colors: ["emerald", "amber", "red", "stone"],
    index: 0
  },
  {
    id: 'energy',
    name: "Énergie rover",
    states: ["Stable", "Dégradé", "Critique", "Perdu"],
    colors: ["emerald", "amber", "red", "stone"],
    index: 0
  },
  {
    id: 'signal',
    name: "Signal radio",
    states: ["Stable", "Dégradé", "Critique", "Perdu"],
    colors: ["emerald", "amber", "red", "stone"],
    index: 1
  },
  {
    id: 'visibility',
    name: "Visibilité",
    states: ["Stable", "Dégradé", "Critique", "Perdu"],
    colors: ["emerald", "amber", "red", "stone"],
    index: 1
  },
  {
    id: 'tempest',
    name: "Temps avant tempête",
    states: ["Stable", "Dégradé", "Critique", "Perdu"],
    colors: ["emerald", "amber", "red", "stone"],
    index: 1
  },
  {
    id: 'data',
    name: "Données Delta-6",
    states: ["Stable mais non sécurisées", "Dégradé", "Critique", "Perdu"],
    colors: ["emerald", "amber", "red", "stone"],
    index: 0
  },
  {
    id: 'survivor',
    name: "Survivant Delta-6",
    states: ["Inconnu", "Stable", "Dégradé", "Critique", "Perdu"],
    colors: ["stone", "emerald", "amber", "red", "stone"],
    index: 0
  },
  {
    id: 'calm',
    name: "Calme du groupe",
    states: ["Stable", "Dégradé", "Critique", "Perdu"],
    colors: ["emerald", "amber", "red", "stone"],
    index: 0
  }
];

export const INITIAL_MISSION_STATE: MissionControlState = {
  activeSceneMode: 'normal',
  activeLocation: 'delta6',
  resources: INITIAL_RESOURCES,
  effects: {
    dust: 1,
    glitch: 0,
    scanner: 0,
    headlight: 2,
    hounds: 0,
    em: 0
  },
  audio: {
    enabled: false,
    windVolume: 0.45,
    radioVolume: 0.15,
    scannerVolume: 0.35,
    humVolume: 0.26,
    stormVolume: 0.10,
    houndsVolume: 0.0,
    radioSilence: false
  },
  displayOptions: {
    screenBlack: false,
    activePresetId: 'delta6',
    activeTransmission: null,
    newCarthageLoopVariant: 'workers',
    newCarthageLoopCounts: {
      ship_takeoff: 0,
      easter_egg: 0
    },
    newCarthagePhaseStartedAt: null,
    newCarthageLastAutoLoopAt: null,
    newCarthageAutoStep: 0,
    redPlainsVisualVariant: 'wide',
    redPlainsTransitionStartedAt: null
  },
  interventionOptions: {
    showPortrait: true,
    showText: true,
    playAudio: true
  },
  squadOverlay: DEFAULT_SQUAD_OVERLAY,
  squad: {
    selectedIds: [],
    locked: false
  },
  transientEffects: {},
  quickEffect: null,
  logs: []
};

const STORAGE_KEY = 'm01_jdr_sol_rouge_mission_v7';
const SYNC_CHANNEL_NAME = 'uesc_sol_rouge_sync_channel';

// ─── LOCAL STORAGE FALLBACK AND LOADER ───
export function getStoredState(): MissionControlState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.resources && parsed.effects && parsed.audio) {
        if (!parsed.activeLocation) {
          parsed.activeLocation = 'delta6';
        }
        if (!('houndsVolume' in parsed.audio)) {
          parsed.audio.houndsVolume = 0;
        }
          if (!parsed.displayOptions) {
            parsed.displayOptions = {};
          }
          if (!parsed.displayOptions.activeTransmission) {
            parsed.displayOptions.activeTransmission = null;
          } else {
            parsed.displayOptions.activeTransmission.sourceRole ??= 'TRANSMISSION UESC';
            parsed.displayOptions.activeTransmission.sourceType ??= 'field';
          }

          // Migration for newCarthage loop options and red plains
          if (!('newCarthageLoopVariant' in parsed.displayOptions) || !parsed.displayOptions.newCarthageLoopVariant) {
            parsed.displayOptions.newCarthageLoopVariant = 'workers';
          }
          if (!('newCarthageLoopCounts' in parsed.displayOptions) || !parsed.displayOptions.newCarthageLoopCounts) {
            parsed.displayOptions.newCarthageLoopCounts = { ship_takeoff: 0, easter_egg: 0 };
          }
          if (!('newCarthagePhaseStartedAt' in parsed.displayOptions)) {
            parsed.displayOptions.newCarthagePhaseStartedAt = null;
          }
          if (!('newCarthageLastAutoLoopAt' in parsed.displayOptions)) {
            parsed.displayOptions.newCarthageLastAutoLoopAt = null;
          }
          if (!('newCarthageAutoStep' in parsed.displayOptions)) {
            parsed.displayOptions.newCarthageAutoStep = 0;
          }
          if (!('redPlainsVisualVariant' in parsed.displayOptions) || !parsed.displayOptions.redPlainsVisualVariant) {
            parsed.displayOptions.redPlainsVisualVariant = 'wide';
          }
          if (!('redPlainsTransitionStartedAt' in parsed.displayOptions)) {
            parsed.displayOptions.redPlainsTransitionStartedAt = null;
          }
        if (!('interventionOptions' in parsed)) {
          parsed.interventionOptions = {
            showPortrait: true,
            showText: true,
            playAudio: true
          };
        }
        if (!('squadOverlay' in parsed)) {
          parsed.squadOverlay = DEFAULT_SQUAD_OVERLAY;
        }
        if (!('squad' in parsed)) {
          parsed.squad = { selectedIds: [], locked: false };
        }
        if (!('transientEffects' in parsed)) {
          parsed.transientEffects = {};
        }
        if (!('quickEffect' in parsed)) {
          parsed.quickEffect = null;
        }
        return parsed as MissionControlState;
      }
    }
  } catch (e) {
    console.error('Failed to parse synchronized M01 MissionControlState', e);
  }
  return INITIAL_MISSION_STATE;
}

export function saveStoredState(state: MissionControlState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Failed to write M01 state to localStorage', e);
  }
}

// ─── BROADCAST CHANNEL SUBSYSTEM (REAL-TIME TAB TO TAB SYNC) ───
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not initialized', e);
}

export function broadcastStateChange(state: MissionControlState) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(state);
    } catch (e) {
      console.warn('Failed to broadcast state over channel', e);
    }
  }
}

export function subscribeToStateBroadcast(callback: (state: MissionControlState) => void): () => void {
  if (!broadcastChannel) return () => {};
  
  const listener = (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object' && 'activeSceneMode' in event.data) {
      callback(event.data as MissionControlState);
    }
  };
  
  broadcastChannel.addEventListener('message', listener);
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', listener);
    }
  };
}

// ─── DERIVE VISUAL CONFIG ON-THE-FLY ───
export function deriveConfigFromState(state: MissionControlState): CinemagraphConfig {
  const resourceIndex = (id: string) => state.resources.find(resource => resource.id === id)?.index ?? 0;
  const signalStress = Math.max(0, resourceIndex('signal') - 1);
  const visibilityStress = Math.max(0, resourceIndex('visibility') - 1);
  const tempestStress = Math.max(0, resourceIndex('tempest') - 1);
  const energyStress = Math.max(0, resourceIndex('energy') - 1);
  const roverStress = Math.max(0, resourceIndex('integrity') - 1);
  const groupStress = Math.max(0, resourceIndex('calm') - 1);

  let dustVal = state.effects.dust === 0 ? 10 
    : state.effects.dust === 1 ? 90 
    : state.effects.dust === 2 ? 180 : 300;

  dustVal = Math.min(340, dustVal + visibilityStress * 35 + tempestStress * 22);

  let glitchVal = state.effects.glitch === 0 ? 0.0 
    : state.effects.glitch === 1 ? 0.25 
    : state.effects.glitch === 2 ? 0.60 : 0.95;

  glitchVal = Math.min(0.98, glitchVal + signalStress * 0.12 + tempestStress * 0.08);

  const scannerVal = state.effects.scanner === 0 ? 0.2 
    : state.effects.scanner === 1 ? 1.0 
    : state.effects.scanner === 2 ? 2.5 : 4.0;

  let headlightVal = state.effects.headlight === 0 ? 0.0 
    : state.effects.headlight === 1 ? 0.40 
    : state.effects.headlight === 2 ? 0.80 : 1.40;

  headlightVal = Math.max(0, headlightVal - energyStress * 0.16 + roverStress * 0.05);

  const houndsVal = state.effects.hounds > 0;
  const flickerVal = state.effects.hounds === 0 ? 1.0 
    : state.effects.hounds === 1 ? 1.2 
    : state.effects.hounds === 2 ? 1.8 : 2.8;

  const emVal = state.effects.em > 0;
  const breathingVal = state.effects.em === 0 ? 1.0 
    : state.effects.em === 1 ? 1.2 
    : state.effects.em === 2 ? 1.8 : 2.5;

  let windSpd = 1.0;
  if (state.activeSceneMode === 'storm') {
    windSpd = 2.8;
  } else if (state.activeSceneMode === 'extraction') {
    windSpd = 2.4;
  } else if (state.activeSceneMode === 'silence') {
    windSpd = 0.5;
  } else if (state.effects.dust > 1) {
    windSpd = 1.5;
  }

  const baseConfig: CinemagraphConfig = {
    windSpeed: windSpd,
    dustDensity: dustVal,
    dustColor: '#9c3f2d',
    flickerRate: Math.min(3.4, flickerVal + energyStress * 0.22 + groupStress * 0.12),
    headlightIntensity: headlightVal,
    scannerPulseSpeed: scannerVal,
    hazeBreathingSpeed: breathingVal,
    environmentFilter: state.activeSceneMode,
    activeLocation: state.activeLocation || 'delta6',
    quickEffect: state.quickEffect,
    audioEnabled: state.audio.enabled,
    audioWindVolume: state.audio.windVolume,
    audioHumVolume: state.audio.humVolume,
    telemetryActive: true,
    visualRadioGlitch: glitchVal,
    visualEmFlashes: emVal || tempestStress > 1,
    visualHoundShadows: houndsVal,
    visualAletheiaOverlay: state.effects.hounds > 1,
    audioRadioVolume: Math.min(1, state.audio.radioVolume + signalStress * 0.12),
    audioScannerVolume: state.audio.scannerVolume,
    audioStormVolume: Math.min(1, state.audio.stormVolume + tempestStress * 0.12 + roverStress * 0.04),
    audioHoundsVolume: Math.min(1, state.audio.houndsVolume + (houndsVal ? 0.22 : 0) + groupStress * 0.04),
    audioRadioSilence: state.audio.radioSilence,
    screenBlack: state.displayOptions.screenBlack
  };

  const locationProfile = getLocationEffectProfile(state.activeLocation, baseConfig);

  return {
    ...baseConfig,
    dustDensity: Math.min(360, baseConfig.dustDensity * locationProfile.particleDensity),
    windSpeed: Math.min(3.4, baseConfig.windSpeed * locationProfile.particleSpeed),
    flickerRate: Math.min(3.6, baseConfig.flickerRate / Math.max(0.45, locationProfile.lightStability)),
    scannerPulseSpeed: Math.min(4.2, baseConfig.scannerPulseSpeed * locationProfile.scannerBias),
    visualRadioGlitch: Math.min(0.98, baseConfig.visualRadioGlitch * locationProfile.radioBias),
    audioRadioVolume: Math.min(1, baseConfig.audioRadioVolume * locationProfile.radioBias),
    audioStormVolume: Math.min(1, baseConfig.audioStormVolume * locationProfile.stormBias)
  };
}

// ─── STATE MANIPULATION FUNCTIONS (PURE & PREDICTABLE) ───

export function setSceneMode(state: MissionControlState, modeId: MissionControlState['activeSceneMode']): MissionControlState {
  const changes: Partial<MissionControlState['effects']> = {};
  if (modeId === 'normal') {
    changes.dust = 0;
  } else if (modeId === 'dust') {
    changes.dust = 1;
  } else if (modeId === 'scanner') {
    changes.dust = 2;
    changes.scanner = 3;
  } else if (modeId === 'signal') {
    changes.glitch = 2;
  } else if (modeId === 'hounds') {
    changes.hounds = 2;
  } else if (modeId === 'storm') {
    changes.em = 3;
    changes.dust = 3;
  } else if (modeId === 'extraction') {
    changes.dust = 3;
    changes.em = 2;
    changes.hounds = 2;
  } else if (modeId === 'silence') {
    changes.dust = 0;
    changes.glitch = 0;
    changes.scanner = 0;
    changes.headlight = 0;
    changes.hounds = 0;
    changes.em = 0;
  }

  return {
    ...state,
    activeSceneMode: modeId,
    effects: {
      ...state.effects,
      ...changes
    }
  };
}

export function applyPreset(state: MissionControlState, presetId: string): MissionControlState {
  let mode: MissionControlState['activeSceneMode'] = 'normal';
  let dustLvl = 1;
  let glitchLvl = 0;
  let scannerLvl = 0;
  let headlightLvl = 2;
  let houndsLvl = 0;
  let emLvl = 0;

  const audioEnabled = state.audio.enabled;
  let windVol = 0.45;
  let radioVol = 0.15;
  let scannerVol = 0.35;
  let humVol = 0.26;
  let stormVol = 0.10;
  let houndsVol = 0.0;
  let silence = false;

  switch (presetId) {
    case 'calme':
      mode = 'normal';
      dustLvl = 0;
      glitchLvl = 0;
      scannerLvl = 0;
      headlightLvl = 1;
      houndsLvl = 0;
      emLvl = 0;
      windVol = 0.15;
      radioVol = 0.05;
      scannerVol = 0.1;
      humVol = 0.13;
      stormVol = 0.0;
      houndsVol = 0.0;
      break;
    case 'delta6':
      mode = 'dust';
      dustLvl = 1;
      glitchLvl = 1;
      scannerLvl = 1;
      headlightLvl = 2;
      houndsLvl = 0;
      emLvl = 0;
      windVol = 0.45;
      radioVol = 0.15;
      scannerVol = 0.35;
      humVol = 0.26;
      stormVol = 0.10;
      houndsVol = 0.0;
      break;
    case 'scanner':
    case 'scanner_actif':
      mode = 'scanner';
      dustLvl = 2;
      glitchLvl = 1;
      scannerLvl = 3;
      headlightLvl = 2;
      houndsLvl = 0;
      emLvl = 0;
      windVol = 0.45;
      radioVol = 0.20;
      scannerVol = 0.80;
      humVol = 0.45;
      stormVol = 0.15;
      houndsVol = 0.0;
      break;
    case 'signal':
    case 'signal_instable':
      mode = 'signal';
      dustLvl = 2;
      glitchLvl = 2;
      scannerLvl = 1;
      headlightLvl = 1;
      houndsLvl = 0;
      emLvl = 0;
      windVol = 0.50;
      radioVol = 0.75;
      scannerVol = 0.40;
      humVol = 0.32;
      stormVol = 0.30;
      houndsVol = 0.05;
      break;
    case 'hounds':
    case 'hounds_proches':
      mode = 'hounds';
      dustLvl = 2;
      glitchLvl = 1;
      scannerLvl = 0;
      headlightLvl = 2;
      houndsLvl = 2;
      emLvl = 0;
      windVol = 0.35;
      radioVol = 0.45;
      scannerVol = 0.15;
      humVol = 0.38;
      stormVol = 0.20;
      houndsVol = 0.75;
      break;
    case 'tempete':
    case 'tempete_em':
      mode = 'storm';
      dustLvl = 3;
      glitchLvl = 3;
      scannerLvl = 0;
      headlightLvl = 1;
      houndsLvl = 0;
      emLvl = 3;
      windVol = 0.95;
      radioVol = 0.90;
      scannerVol = 0.05;
      humVol = 0.36;
      stormVol = 0.95;
      houndsVol = 0.08;
      break;
    case 'extraction':
      mode = 'extraction';
      dustLvl = 3;
      glitchLvl = 2;
      scannerLvl = 2;
      headlightLvl = 3;
      houndsLvl = 2;
      emLvl = 2;
      windVol = 0.80;
      radioVol = 0.60;
      scannerVol = 0.50;
      humVol = 0.42;
      stormVol = 0.75;
      houndsVol = 0.45;
      break;
    case 'silence':
      mode = 'silence';
      dustLvl = 0;
      glitchLvl = 0;
      scannerLvl = 0;
      headlightLvl = 0;
      houndsLvl = 0;
      emLvl = 0;
      windVol = 0.0;
      radioVol = 0.0;
      scannerVol = 0.0;
      humVol = 0.0;
      stormVol = 0.0;
      houndsVol = 0.0;
      silence = true;
      break;
  }

  const newResources = state.resources.map(res => {
    switch (presetId) {
      case 'calme':
        return { ...res, index: 0 };
      case 'delta6':
        if (res.id === 'signal' || res.id === 'visibility' || res.id === 'tempest') {
          return { ...res, index: 1 };
        }
        return { ...res, index: 0 };
      case 'scanner':
      case 'scanner_actif':
        if (res.id === 'energy') return { ...res, index: 1 };
        if (res.id === 'signal' || res.id === 'visibility' || res.id === 'tempest') return { ...res, index: 1 };
        return { ...res, index: 0 };
      case 'signal':
      case 'signal_instable':
        if (res.id === 'signal') return { ...res, index: 2 };
        if (res.id === 'data' || res.id === 'calm') return { ...res, index: 1 };
        if (res.id === 'visibility' || res.id === 'tempest') return { ...res, index: 1 };
        return { ...res, index: 0 };
      case 'hounds':
      case 'hounds_proches':
        if (res.id === 'integrity' || res.id === 'energy' || res.id === 'tempest') return { ...res, index: 1 };
        if (res.id === 'signal' || res.id === 'visibility' || res.id === 'survivor' || res.id === 'calm') return { ...res, index: 2 };
        return { ...res, index: 0 };
      case 'tempete':
      case 'tempete_em':
        if (res.id === 'integrity' || res.id === 'calm') return { ...res, index: 1 };
        if (res.id === 'energy' || res.id === 'tempest' || res.id === 'data') return { ...res, index: 2 };
        if (res.id === 'signal' || res.id === 'visibility') return { ...res, index: 3 };
        if (res.id === 'survivor') return { ...res, index: 4 };
        return { ...res, index: 0 };
      case 'extraction':
        if (res.id === 'integrity' || res.id === 'energy' || res.id === 'signal' || res.id === 'visibility') return { ...res, index: 2 };
        if (res.id === 'tempest' || res.id === 'calm') return { ...res, index: 3 };
        if (res.id === 'survivor') return { ...res, index: 1 };
        if (res.id === 'data') return { ...res, index: 0 };
        return { ...res, index: 0 };
      case 'silence':
        if (res.id === 'survivor') return { ...res, index: 4 };
        return { ...res, index: 3 };
    }
    return res;
  });

  return {
    ...state,
    activeSceneMode: mode,
    resources: newResources,
    effects: {
      dust: dustLvl,
      glitch: glitchLvl,
      scanner: scannerLvl,
      headlight: headlightLvl,
      hounds: houndsLvl,
      em: emLvl
    },
    audio: {
      enabled: audioEnabled,
      windVolume: windVol,
      radioVolume: radioVol,
      scannerVolume: scannerVol,
      humVolume: humVol,
      stormVolume: stormVol,
      houndsVolume: houndsVol,
      radioSilence: silence
    },
    displayOptions: {
      ...state.displayOptions,
      activePresetId: presetId
    },
    quickEffect: presetId === 'calme' ? null : state.quickEffect
  };
}

export function setResourceState(state: MissionControlState, resourceId: string, stateNameOrIndex: string | number): MissionControlState {
  return {
    ...state,
    resources: state.resources.map(res => {
      if (res.id === resourceId) {
        if (typeof stateNameOrIndex === 'number') {
          const idx = Math.max(0, Math.min(res.states.length - 1, stateNameOrIndex));
          return { ...res, index: idx };
        } else {
          const idx = res.states.findIndex(s => s.toLowerCase() === stateNameOrIndex.toLowerCase());
          if (idx !== -1) {
            return { ...res, index: idx };
          }
        }
      }
      return res;
    })
  };
}

export function cycleResourceState(state: MissionControlState, resourceId: string, forward: boolean = true): MissionControlState {
  return {
    ...state,
    resources: state.resources.map(res => {
      if (res.id === resourceId) {
        let nextIndex = forward ? res.index + 1 : res.index - 1;
        if (nextIndex >= res.states.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = res.states.length - 1;
        return { ...res, index: nextIndex };
      }
      return res;
    })
  };
}

export function setEffectLevel(state: MissionControlState, effectId: keyof MissionControlState['effects'], level: number): MissionControlState {
  const boundedLvl = Math.max(0, Math.min(3, level));
  const newEffects = {
    ...state.effects,
    [effectId]: boundedLvl
  };

  let derivedMode = state.activeSceneMode;
  if (effectId === 'dust' && boundedLvl > 0 && derivedMode === 'normal') {
    derivedMode = 'dust';
  } else if (effectId === 'glitch' && boundedLvl > 1 && derivedMode !== 'signal') {
    derivedMode = 'signal';
  } else if (effectId === 'scanner' && boundedLvl > 0 && derivedMode !== 'scanner') {
    derivedMode = 'scanner';
  } else if (effectId === 'hounds' && boundedLvl > 0 && derivedMode !== 'hounds') {
    derivedMode = 'hounds';
  } else if (effectId === 'em' && boundedLvl > 0 && derivedMode !== 'storm') {
    derivedMode = 'storm';
  }

  return {
    ...state,
    activeSceneMode: derivedMode,
    effects: newEffects
  };
}

export function toggleAudio(state: MissionControlState, audioId: keyof Omit<MissionControlState['audio'], 'enabled' | 'radioSilence'>): MissionControlState {
  const currentVal = state.audio[audioId] as number;
  const isCurrentlyActive = currentVal > 0.05;
  const toggledVal = isCurrentlyActive ? 0.0 : 0.45;

  return {
    ...state,
    audio: {
      ...state.audio,
      [audioId]: toggledVal
    }
  };
}

export function muteAllAudio(state: MissionControlState): MissionControlState {
  return {
    ...state,
    audio: {
      ...state.audio,
      radioSilence: true
    }
  };
}

export function blackoutDisplay(state: MissionControlState, forceBlack: boolean = true): MissionControlState {
  return {
    ...state,
    displayOptions: {
      ...state.displayOptions,
      screenBlack: forceBlack
    }
  };
}

export function resetToBase(state: MissionControlState): MissionControlState {
  return {
    ...INITIAL_MISSION_STATE,
    audio: {
      ...INITIAL_MISSION_STATE.audio,
      enabled: state.audio.enabled
    }
  };
}
