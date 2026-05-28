/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CinemagraphConfig, TelemetryLog } from '../types';

export interface ResourceState {
  id: string;
  name: string;
  states: string[];
  colors: ('emerald' | 'amber' | 'red' | 'stone')[];
  index: number;
}

export interface MissionControlState {
  activeSceneMode: 'normal' | 'dust' | 'scanner' | 'signal' | 'hounds' | 'storm' | 'extraction' | 'silence';
  activeLocation: 'new_carthage' | 'red_plains' | 'black_arches' | 'delta6';
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
    radioSilence: boolean;
  };
  displayOptions: {
    screenBlack: boolean;
    activePresetId: string;
  };
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
    humVolume: 0.40,
    stormVolume: 0.10,
    radioSilence: false
  },
  displayOptions: {
    screenBlack: false,
    activePresetId: 'delta6'
  },
  logs: []
};

const STORAGE_KEY = 'm01_jdr_sol_rouge_mission_v3';
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
  const dustVal = state.effects.dust === 0 ? 10 
    : state.effects.dust === 1 ? 90 
    : state.effects.dust === 2 ? 180 : 300;

  const glitchVal = state.effects.glitch === 0 ? 0.0 
    : state.effects.glitch === 1 ? 0.25 
    : state.effects.glitch === 2 ? 0.60 : 0.95;

  const scannerVal = state.effects.scanner === 0 ? 0.2 
    : state.effects.scanner === 1 ? 1.0 
    : state.effects.scanner === 2 ? 2.5 : 4.0;

  const headlightVal = state.effects.headlight === 0 ? 0.0 
    : state.effects.headlight === 1 ? 0.40 
    : state.effects.headlight === 2 ? 0.80 : 1.40;

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

  return {
    windSpeed: windSpd,
    dustDensity: dustVal,
    dustColor: '#9c3f2d',
    flickerRate: flickerVal,
    headlightIntensity: headlightVal,
    scannerPulseSpeed: scannerVal,
    hazeBreathingSpeed: breathingVal,
    environmentFilter: state.activeSceneMode,
    activeLocation: state.activeLocation || 'delta6',
    audioEnabled: state.audio.enabled,
    audioWindVolume: state.audio.windVolume,
    audioHumVolume: state.audio.humVolume,
    telemetryActive: true,
    visualRadioGlitch: glitchVal,
    visualEmFlashes: emVal,
    visualHoundShadows: houndsVal,
    visualAletheiaOverlay: state.effects.hounds > 1,
    audioRadioVolume: state.audio.radioVolume,
    audioScannerVolume: state.audio.scannerVolume,
    audioStormVolume: state.audio.stormVolume,
    audioRadioSilence: state.audio.radioSilence,
    screenBlack: state.displayOptions.screenBlack
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
  let humVol = 0.40;
  let stormVol = 0.10;
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
      humVol = 0.20;
      stormVol = 0.0;
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
      humVol = 0.40;
      stormVol = 0.10;
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
      humVol = 0.85;
      stormVol = 0.15;
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
      humVol = 0.50;
      stormVol = 0.30;
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
      humVol = 0.75;
      stormVol = 0.20;
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
      humVol = 0.60;
      stormVol = 0.95;
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
      humVol = 0.90;
      stormVol = 0.75;
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
      radioSilence: silence
    },
    displayOptions: {
      ...state.displayOptions,
      activePresetId: presetId
    }
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
