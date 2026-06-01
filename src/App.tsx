/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import Cinemagraph from './components/Cinemagraph';
import HUD from './components/HUD';
import TransmissionOverlay from './components/TransmissionOverlay';
import type { CinemagraphConfig, QuickEffectType, TransmissionType, SquadMember } from './types';
import { SciFiAudioEngine } from './utils/audioEngine';
import { 
  getStoredState, 
  saveStoredState, 
  ResourceState, 
  MissionControlState,
  INITIAL_MISSION_STATE,
  deriveConfigFromState,
  subscribeToStateBroadcast,
  broadcastStateChange,
  applyPreset
} from './utils/syncState';
import { getLocationById, LOCATIONS, resolveLocationVisual, type LocationId } from './utils/locations';
import {
  connectNetworkSync,
  networkClientId,
  sendNetworkState,
  type NetworkSyncStatus
} from './utils/networkSync';
import { createMissionTransmission } from './utils/transmissions';
import { getStoryBeat, createStoryBeatTransmission, type StoryAmbience } from './utils/storyBeats';
import { getHoundVisualProfile } from './utils/houndProfile';
import HoundOverlay from './components/HoundOverlay';
import SquadOverlay from './components/SquadOverlay';
import SquadSelector from './components/SquadSelector';
import PLAYER_CHARACTERS from './utils/playerCharacters';
import { 
  Shield, 
  Volume2, 
  Radio, 
  Terminal, 
  Compass, 
  Sparkles, 
  Monitor, 
  Layers, 
  Play, 
  Tv,
  Eye,
  Sliders,
  VolumeX,
  AlertTriangle
} from 'lucide-react';

// Simple custom router hook supporting path and hash navigation
function useRoute() {
  const [route, setRoute] = useState<'home' | 'display' | 'control'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/display' || hash === '#/display') return 'display';
    if (path === '/control' || hash === '#/control') return 'control';
    return 'home';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/display' || hash === '#/display') {
        setRoute('display');
      } else if (path === '/control' || hash === '#/control') {
        setRoute('control');
      } else {
        setRoute('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (to: 'home' | 'display' | 'control') => {
    const path = to === 'home' ? '/' : `/${to}`;
    window.history.pushState(null, '', path);
    setRoute(to);
  };

  return { route, navigate };
}

export default function App() {
  const { route, navigate } = useRoute();
  const [state, setState] = useState<MissionControlState>(getStoredState);
  
  // Independent local audio and boot states per device context
  const [displayBooted, setDisplayBooted] = useState(false);
  const [controlBooted, setControlBooted] = useState(false);
  const [loopEpochKey, setLoopEpochKey] = useState(0);
  const [networkSyncStatus, setNetworkSyncStatus] = useState<NetworkSyncStatus>('disconnected');
  
  const audioEngineRef = useRef<SciFiAudioEngine | null>(null);
  const lastQuickEffectIdRef = useRef<string>('');
  const lastTransmissionIdRef = useRef<string>('');

  // Initialize Web Audio Engine
  useEffect(() => {
    audioEngineRef.current = new SciFiAudioEngine();
    // Preload images and videos where available (non-fatal if video absent)
    LOCATIONS.forEach((location) => {
      const img = new Image();
      img.src = location.image;
      if (location.povImage) {
        const p = new Image(); p.src = location.povImage;
      }
      if (location.houndImage) {
        const h = new Image(); h.src = location.houndImage;
      }
      if (location.loops) {
        Object.values(location.loops).forEach((lp) => {
          if (lp) {
            const v = document.createElement('video');
            v.preload = 'auto';
            v.src = lp;
          }
        });
      }
    });
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.destroy();
      }
    };
  }, []);

  // Multi-tab synchronization listener supporting standard LocalStorage and real-time BroadcastChannel
  useEffect(() => {
    const handleStorageChange = () => {
      const freshState = getStoredState();
      setState(freshState);
    };
    window.addEventListener('storage', handleStorageChange);

    const unsubscribe = subscribeToStateBroadcast((receivedState) => {
      setState(receivedState);
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  // Network synchronization for phone/tablet control to remote display over local Wi-Fi.
  useEffect(() => {
    return connectNetworkSync((remoteState, source) => {
      if (source === networkClientId) return;

      setState(remoteState);
      saveStoredState(remoteState);
    }, setNetworkSyncStatus);
  }, []);

  // Sync Audio Engine values dynamically matching active route configuration
  const currentConfig = deriveConfigFromState(state);
  const activeLocation = getLocationById(state.activeLocation);
  const isAudioBooted = (route === 'display' && displayBooted) || (route === 'control' && controlBooted);
  const activeVisual = resolveLocationVisual(activeLocation, currentConfig, state.displayOptions);

  useEffect(() => {
    if (!audioEngineRef.current) return;
    
    if (isAudioBooted && currentConfig.audioEnabled && !currentConfig.audioRadioSilence) {
      audioEngineRef.current.init();
      audioEngineRef.current.setMute(false);
      
      // Update dynamic channels: wind volume, reactor volume, radio crackles, storm levels
      audioEngineRef.current.updateVolumes(
        currentConfig.audioWindVolume, 
        currentConfig.audioHumVolume, 
        currentConfig.audioRadioVolume, 
        currentConfig.audioStormVolume,
        currentConfig.audioHoundsVolume,
        currentConfig.activeLocation,
        currentConfig.environmentFilter
      );
    } else {
      audioEngineRef.current.setMute(true);
    }
  }, [
    isAudioBooted,
    currentConfig.audioEnabled, 
    currentConfig.audioRadioSilence,
    currentConfig.audioWindVolume, 
    currentConfig.audioHumVolume,
    currentConfig.audioRadioVolume,
    currentConfig.audioStormVolume,
    currentConfig.audioHoundsVolume,
    currentConfig.activeLocation,
    currentConfig.environmentFilter
  ]);

  useEffect(() => {
    const quickEffect = currentConfig.quickEffect;
    if (!quickEffect || !audioEngineRef.current || !currentConfig.audioEnabled || currentConfig.audioRadioSilence) return;

    const effectId = `${quickEffect.type}-${quickEffect.startedAt}`;
    if (lastQuickEffectIdRef.current === effectId) return;
    lastQuickEffectIdRef.current = effectId;

    if (quickEffect.type === 'glitch_radio') {
      audioEngineRef.current.triggerRadioGlitchBurst();
    } else if (quickEffect.type === 'flash_em') {
      audioEngineRef.current.triggerEmFlash();
    } else if (quickEffect.type === 'ombre_hound') {
      audioEngineRef.current.triggerHoundShadow();
    }
  }, [currentConfig.quickEffect, currentConfig.audioEnabled, currentConfig.audioRadioSilence]);

  useEffect(() => {
    const transmission = state.displayOptions.activeTransmission;
    if (
      !transmission ||
      !audioEngineRef.current ||
      !currentConfig.audioEnabled ||
      currentConfig.audioRadioSilence ||
      !state.interventionOptions.playAudio
    ) return;
    if (lastTransmissionIdRef.current === transmission.id) return;
    lastTransmissionIdRef.current = transmission.id;
    audioEngineRef.current.triggerTransmissionOpen();
  }, [state.displayOptions.activeTransmission, currentConfig.audioEnabled, currentConfig.audioRadioSilence, state.interventionOptions.playAudio]);

  useEffect(() => {
    const houndState = state.transientEffects?.hound;
    if (!houndState || !houndState.active) return;
    const elapsed = Date.now() - houndState.startedAt;
    if (elapsed <= houndState.durationMs) return;

    const payload: MissionControlState = {
      ...state,
      transientEffects: {
        ...state.transientEffects,
        hound: undefined
      }
    };
    commitLocalState(payload);
  }, [state.transientEffects?.hound]);

  const commitLocalState = (payload: MissionControlState) => {
    setState(payload);
    saveStoredState(payload);

    const sentOverNetwork = sendNetworkState(payload);
    if (!sentOverNetwork) {
      broadcastStateChange(payload);
    }
  };

  // Handle local state modifiers using the serializable state patterns
  const handleUpdateConfig = (newConfig: CinemagraphConfig) => {
    const payload: MissionControlState = { 
      ...state, 
      activeSceneMode: newConfig.environmentFilter,
      activeLocation: newConfig.activeLocation || state.activeLocation || 'delta6',
      audio: {
        enabled: newConfig.audioEnabled,
        windVolume: newConfig.audioWindVolume,
        radioVolume: newConfig.audioRadioVolume,
        scannerVolume: newConfig.audioScannerVolume,
        humVolume: newConfig.audioHumVolume,
        stormVolume: newConfig.audioStormVolume,
        houndsVolume: newConfig.audioHoundsVolume,
        radioSilence: newConfig.audioRadioSilence
      },
      displayOptions: {
        ...state.displayOptions,
        screenBlack: newConfig.screenBlack
      }
    };
    commitLocalState(payload);
  };

  const handleUpdateResources = (newResources: ResourceState[]) => {
    const payload = { ...state, resources: newResources };
    commitLocalState(payload);
  };

  const handleUpdatePresetId = (id: string) => {
    const payload = applyPreset(state, id);
    commitLocalState(payload);
  };

  const handleUpdateLocation = (location: LocationId) => {
    const payload = { ...state, activeLocation: location };
    commitLocalState(payload);
  };

  const handleToggleSquadOverlay = () => {
    const payload: MissionControlState = {
      ...state,
      squadOverlay: {
        ...state.squadOverlay,
        visible: !state.squadOverlay.visible
      }
    };
    commitLocalState(payload);
  };

  const handleSetSquadOverlayMode = (mode: 'compact' | 'detail') => {
    const payload: MissionControlState = {
      ...state,
      squadOverlay: {
        ...state.squadOverlay,
        mode
      }
    };
    commitLocalState(payload);
  };

  const handleUpdateSquadMember = (memberId: string, changes: Partial<SquadMember>) => {
    const payload: MissionControlState = {
      ...state,
      squadOverlay: {
        ...state.squadOverlay,
        members: state.squadOverlay.members.map((member) =>
          member.id === memberId
            ? { ...member, ...changes }
            : member
        )
      }
    };
    commitLocalState(payload);
  };

  const handleUpdateSquadTracker = (memberId: string, trackerKey: 'stress'|'bruit'|'blessures', delta: number) => {
    const members = [...state.squadOverlay.members];
    const max = trackerKey === 'blessures' ? 3 : 5;
    let found = false;
    const updated = members.map((m) => {
      if (m.id === memberId) {
        found = true;
        const trackers = { ...(m.trackers || { stress:0, bruit:0, blessures:0 }) } as any;
        trackers[trackerKey] = Math.max(0, Math.min(max, (trackers[trackerKey] || 0) + delta));
        return { ...m, trackers };
      }
      return m;
    });

    // If not found but character is selected, create minimal member entry
    if (!found) {
      const pc = PLAYER_CHARACTERS.find(p => p.id === memberId);
        if (pc && (state.squad.selectedIds || []).includes(memberId)) {
        const trackers: any = { stress:0, bruit:0, blessures:0 };
        trackers[trackerKey] = Math.max(0, Math.min(max, (trackers[trackerKey] || 0) + delta));
        updated.push({
          id: pc.id,
          visible: true,
          name: pc.name,
          role: pc.role,
          stats: { physique: pc.stats.physique, technique: pc.stats.technique, mental: pc.stats.mental, presence: pc.stats.presence },
          trackers,
          equipment: pc.equipment.slice(0,3),
          status: pc.status,
          note: pc.note,
            portrait: pc.portrait ?? pc.cardImage,
            portraitCrop: pc.portrait ? { x: 0, y: 0, width: 100, height: 100 } : pc.portraitCrop
        } as any);
      }
    }

    const payload: MissionControlState = {
      ...state,
      squadOverlay: {
        ...state.squadOverlay,
        members: updated
      }
    };
    commitLocalState(payload);
  };

  const handleMoveSquadMember = (memberId: string, direction: -1 | 1) => {
    const members = [...state.squadOverlay.members];
    const currentIndex = members.findIndex((member) => member.id === memberId);
    if (currentIndex === -1) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    [members[currentIndex], members[targetIndex]] = [members[targetIndex], members[currentIndex]];
    const payload: MissionControlState = {
      ...state,
      squadOverlay: {
        ...state.squadOverlay,
        members
      }
    };
    commitLocalState(payload);
  };

  // Squad selection handlers
  const handleSelectSquadCharacter = (id: string) => {
    if (state.squad.locked) return;
    const selected = new Set(state.squad.selectedIds || []);
    if (selected.size >= 3) return;
    selected.add(id);
    const payload: MissionControlState = { ...state, squad: { ...state.squad, selectedIds: Array.from(selected) } };
    commitLocalState(payload);
  };

  const handleDeselectSquadCharacter = (id: string) => {
    if (state.squad.locked) return;
    const selected = (state.squad.selectedIds || []).filter((s) => s !== id);
    const payload: MissionControlState = { ...state, squad: { ...state.squad, selectedIds: selected } };
    commitLocalState(payload);
  };

  const handleValidateSquad = () => {
    const ids = state.squad.selectedIds || [];
    if (ids.length !== 3) return;
    // Build squadOverlay members from PLAYER_CHARACTERS
    const members = PLAYER_CHARACTERS.filter((pc) => ids.includes(pc.id)).map((pc) => ({
      id: pc.id,
      visible: true,
      name: pc.name,
      role: pc.role,
      stats: {
        physique: pc.stats.physique,
        technique: pc.stats.technique,
        mental: pc.stats.mental,
        presence: pc.stats.presence
      },
      trackers: { stress: 0, bruit: 0, blessures: 0 },
      equipment: pc.equipment.slice(0, 3),
      status: pc.status,
      note: pc.note,
      portrait: pc.portrait ?? pc.cardImage,
      portraitCrop: pc.portrait ? undefined : pc.portraitCrop
    }));

    const payload: MissionControlState = {
      ...state,
      squad: { selectedIds: ids, locked: true },
      squadOverlay: {
        ...state.squadOverlay,
        visible: true,
        members
      }
    };
    commitLocalState(payload);
  };

  const handleResetSquad = () => {
    if (state.squad.locked) {
      const confirmReset = window.confirm('L\'escouade est verrouillée. Confirmer la réinitialisation et rechoix de l\'escouade ?');
      if (!confirmReset) return;
    }
    const payload: MissionControlState = { ...state, squad: { selectedIds: [], locked: false }, squadOverlay: { ...state.squadOverlay, visible: false } };
    commitLocalState(payload);
  };

  const handleModifySquad = () => {
    if (!state.squad.locked) return;
    const confirmChange = window.confirm('Rechoisir l\'escouade ? Les PJ affichés seront retirés de l\'écran.');
    if (!confirmChange) return;
    const payload: MissionControlState = {
      ...state,
      squad: { selectedIds: [], locked: false },
      squadOverlay: { ...state.squadOverlay, visible: false, members: [] }
    };
    commitLocalState(payload);
  };

  

  const handleResetMission = () => {
    const confirmReset = window.confirm("Réinitialiser la session M01 ?");
    if (!confirmReset) return;
    const payload: MissionControlState = {
      ...INITIAL_MISSION_STATE,
      audio: { ...INITIAL_MISSION_STATE.audio, enabled: state.audio.enabled },
      displayOptions: {
        ...INITIAL_MISSION_STATE.displayOptions,
        newCarthageLoopVariant: 'workers',
        newCarthageLoopCounts: { ship_takeoff: 0, easter_egg: 0 },
        redPlainsVisualVariant: 'wide',
        redPlainsTransitionStartedAt: null,
        screenBlack: false,
        activeTransmission: null
      },
      quickEffect: null,
      effects: { ...INITIAL_MISSION_STATE.effects, hounds: 0 },
      transientEffects: {}
    };
    commitLocalState(payload);
  };

  // Handle one-shot video completion for New Carthage loops
  const handleVisualOneShotComplete = () => {
    const loc = state.activeLocation;
    if (loc !== 'new_carthage') return;
    const currentVariant = state.displayOptions?.newCarthageLoopVariant || 'workers';
    if (currentVariant === 'ship_takeoff' || currentVariant === 'easter_egg' || currentVariant === 'rover_pass') {
      const payload: MissionControlState = {
        ...state,
        displayOptions: {
          ...state.displayOptions,
          newCarthageLoopVariant: 'workers'
        }
      };
      commitLocalState(payload);
    }
  };

  const handleNewCarthageLoopVariant = (variant: 'base' | 'workers' | 'rover_pass' | 'ship_takeoff' | 'easter_egg') => {
    const counts = state.displayOptions?.newCarthageLoopCounts || { ship_takeoff: 0, easter_egg: 0 };
    const payload: MissionControlState = { ...state };

    if (variant === 'ship_takeoff') {
      if ((counts.ship_takeoff || 0) >= 2) return;
      payload.displayOptions = {
        ...state.displayOptions,
        newCarthageLoopVariant: 'ship_takeoff',
        newCarthageLoopCounts: { ...counts, ship_takeoff: (counts.ship_takeoff || 0) + 1 },
        newCarthageLastManualLoopAt: Date.now()
      };
      commitLocalState(payload);
      return;
    }

    if (variant === 'easter_egg') {
      if ((counts.easter_egg || 0) >= 2) return;
      payload.displayOptions = {
        ...state.displayOptions,
        newCarthageLoopVariant: 'easter_egg',
        newCarthageLoopCounts: { ...counts, easter_egg: (counts.easter_egg || 0) + 1 },
        newCarthageLastManualLoopAt: Date.now()
      };
      commitLocalState(payload);
      return;
    }

    // base, workers, rover_pass always allowed; rover_pass is a one-shot but not counter-limited
    payload.displayOptions = { ...state.displayOptions, newCarthageLoopVariant: variant, newCarthageLastManualLoopAt: Date.now() };
    commitLocalState(payload);
  };

  // Auto-fallback: return to workers after 11s when a one-shot is active (control only)
  useEffect(() => {
    if (route !== 'control') return;
    if (state.activeLocation !== 'new_carthage') return;
    const variant = state.displayOptions?.newCarthageLoopVariant || 'workers';
    if (variant === 'workers' || variant === 'base') return;

    const timer = setTimeout(() => {
      const payload: MissionControlState = {
        ...state,
        displayOptions: {
          ...state.displayOptions,
          newCarthageLoopVariant: 'workers'
        }
      };
      commitLocalState(payload);
    }, 11000);

    return () => clearTimeout(timer);
  }, [route, state.activeLocation, state.displayOptions?.newCarthageLoopVariant]);

  // New Carthage automated timeline (control-only)
  useEffect(() => {
    if (route !== 'control') return;
    if (state.activeLocation !== 'new_carthage') return;
    if (state.displayOptions?.screenBlack) return;

    // init phase start if missing
    if (!state.displayOptions?.newCarthagePhaseStartedAt) {
      const payload: MissionControlState = {
        ...state,
        displayOptions: {
          ...state.displayOptions,
          newCarthagePhaseStartedAt: Date.now(),
          newCarthageAutoStep: 0
        }
      };
      commitLocalState(payload);
      return;
    }

    const startedAt = state.displayOptions.newCarthagePhaseStartedAt || Date.now();
    const lastManual = state.displayOptions.newCarthageLastManualLoopAt || 0;
    const now = Date.now();
    if (now - lastManual < 25000) return; // pause auto for 25s after manual

    const timeline = [
      { t: 90_000, variant: 'rover_pass' },
      { t: 180_000, variant: 'workers' },
      { t: 270_000, variant: 'ship_takeoff' },
      { t: 390_000, variant: 'workers' },
      { t: 480_000, variant: 'rover_pass' },
      { t: 560_000, variant: 'easter_egg' },
      { t: 620_000, variant: 'workers' }
    ];

    const elapsed = now - startedAt;
    const currentStep = state.displayOptions.newCarthageAutoStep || 0;

    for (let i = currentStep; i < timeline.length; i++) {
      const step = timeline[i];
      if (elapsed >= step.t) {
        // trigger now
        const variant = step.variant as any;
        const payload: MissionControlState = {
          ...state,
          displayOptions: {
            ...state.displayOptions,
            newCarthageLoopVariant: variant,
            newCarthageLastAutoLoopAt: Date.now(),
            newCarthageAutoStep: i + 1
          }
        };
        // counters for ship/easter
        if (variant === 'ship_takeoff') {
          payload.displayOptions.newCarthageLoopCounts = { ...state.displayOptions.newCarthageLoopCounts, ship_takeoff: (state.displayOptions.newCarthageLoopCounts?.ship_takeoff || 0) + 1 };
        }
        if (variant === 'easter_egg') {
          payload.displayOptions.newCarthageLoopCounts = { ...state.displayOptions.newCarthageLoopCounts, easter_egg: (state.displayOptions.newCarthageLoopCounts?.easter_egg || 0) + 1 };
        }
        commitLocalState(payload);
      } else {
        const remaining = step.t - elapsed;
        const to = setTimeout(() => setLoopEpochKey(k => k + 1), remaining + 50);
        return () => clearTimeout(to);
      }
    }

  }, [route, state.activeLocation, state.displayOptions?.newCarthagePhaseStartedAt, state.displayOptions?.newCarthageAutoStep, state.displayOptions?.newCarthageLastManualLoopAt, state.displayOptions?.screenBlack, loopEpochKey]);

  const triggerQuickEffect = (type: QuickEffectType, baseState: MissionControlState = state): MissionControlState => ({
    ...baseState,
    quickEffect: {
      type,
      startedAt: Date.now(),
      durationMs: type === 'flash_em' ? 900 : type === 'glitch_radio' ? 1800 : 2200
    }
  });

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'reset_calme') {
      const payload: MissionControlState = {
        ...state,
        activeSceneMode: 'normal',
        effects: {
          ...state.effects,
          dust: 0,
          glitch: 0,
          scanner: 0,
          headlight: 1,
          hounds: 0,
          em: 0
        },
        audio: {
          ...state.audio,
          windVolume: 0.15,
          radioVolume: 0.08,
          scannerVolume: 0.05,
          humVolume: 0.12,
          stormVolume: 0,
          houndsVolume: 0
        },
        displayOptions: {
          ...state.displayOptions,
          activePresetId: 'calme',
          activeTransmission: null
        },
        quickEffect: null
      };
      commitLocalState(payload);
      return;
    }

    if (actionId === 'intervention') {
      const payload: MissionControlState = {
        ...state,
        displayOptions: {
          ...state.displayOptions,
          activeTransmission: createMissionTransmission('rowe')
        }
      };
      commitLocalState(payload);
      return;
    }

    const quickEffectType = actionId as QuickEffectType;
    let payload = triggerQuickEffect(quickEffectType);
    if (quickEffectType === 'glitch_radio') {
      payload = {
        ...payload,
        activeSceneMode: 'signal',
        effects: { ...payload.effects, glitch: 3 },
        audio: { ...payload.audio, radioVolume: Math.max(payload.audio.radioVolume, 0.85) },
        displayOptions: { ...payload.displayOptions, activePresetId: 'signal' }
      };
    } else if (quickEffectType === 'flash_em') {
      payload = {
        ...payload,
        effects: { ...payload.effects, em: 3, glitch: Math.max(payload.effects.glitch, 2) },
        audio: { ...payload.audio, stormVolume: Math.max(payload.audio.stormVolume, 0.85), radioVolume: Math.max(payload.audio.radioVolume, 0.55) }
      };
    } else if (quickEffectType === 'ombre_hound') {
      // Gentle hound contact mode: do not over-darken the scene
      payload = {
        ...payload,
        activeSceneMode: 'hounds',
        effects: { ...payload.effects, hounds: 1 },
        audio: { ...payload.audio, houndsVolume: Math.max(payload.audio.houndsVolume, 0.6) },
        displayOptions: { ...payload.displayOptions, activePresetId: 'hounds' }
      };
    }
    commitLocalState(payload);
  };

  const handleStopTransmission = () => {
    const payload: MissionControlState = {
      ...state,
      displayOptions: {
        ...state.displayOptions,
        activeTransmission: null
      },
      transientEffects: {
        ...state.transientEffects,
        hound: undefined
      }
    };
    commitLocalState(payload);
  };

  const handleToggleInterventionOption = (key: keyof MissionControlState['interventionOptions']) => {
    const payload: MissionControlState = {
      ...state,
      interventionOptions: {
        ...state.interventionOptions,
        [key]: !state.interventionOptions[key]
      }
    };
    commitLocalState(payload);
  };

  const handleTransmission = (type: TransmissionType) => {
    const payload: MissionControlState = {
      ...state,
      displayOptions: {
        ...state.displayOptions,
        activeTransmission: createMissionTransmission(type)
      },
      transientEffects: type === 'hound'
        ? {
            ...state.transientEffects,
            hound: {
              active: true,
              ...getHoundVisualProfile(state.activeLocation),
              startedAt: Date.now(),
              durationMs: getHoundVisualProfile(state.activeLocation).durationMs
            }
          }
        : {
            ...state.transientEffects,
            hound: undefined
          }
    };

    commitLocalState(payload);

    if (type === 'hound' && audioEngineRef.current && currentConfig.audioEnabled && state.interventionOptions.playAudio && !currentConfig.audioRadioSilence) {
      audioEngineRef.current.triggerHoundShadow();
    }
  };

  const handleSceneShortcut = (sceneId: string) => {
    const beat = getStoryBeat(sceneId);
    if (!beat) return;

    if (beat.requiresConfirmation && !window.confirm('CONFIRMER LANCEMENT DE LA SCÈNE FINALE ?')) {
      return;
    }

    const ambiencePresetMap: Record<StoryAmbience, string> = {
      calme: 'calme',
      tension: 'delta6',
      signal: 'signal',
      tempete: 'tempete',
      extraction: 'extraction'
    };

    // Base payload with preset
    let payload: MissionControlState = applyPreset(
      { ...state, activeLocation: beat.location },
      ambiencePresetMap[beat.ambience]
    );

    // Special handling for Red Plains scenes: control visual variant and transition timers
    if (beat.id === 'traversee') {
      payload = {
        ...payload,
        activeLocation: 'red_plains',
        displayOptions: {
          ...payload.displayOptions,
          redPlainsVisualVariant: 'wide',
          redPlainsTransitionStartedAt: Date.now()
        }
      };
    }
    // Scenes that should force POV on Red Plains
    if (['anomalie_radio', 'tempete_em', 'extraction'].includes(beat.id)) {
      payload = {
        ...payload,
        activeLocation: 'red_plains',
        displayOptions: {
          ...payload.displayOptions,
          redPlainsVisualVariant: 'pov',
          redPlainsTransitionStartedAt: Date.now()
        }
      };
    }

    if (beat.quickAction === 'glitch_radio' || beat.quickAction === 'flash_em') {
      payload = triggerQuickEffect(beat.quickAction, payload);
    } else if (beat.quickAction === 'HOUND') {
      payload = triggerQuickEffect('ombre_hound', payload);
    }

    payload.displayOptions.activeTransmission = createStoryBeatTransmission(beat);
    commitLocalState(payload);
  };

  // Red Plains wide -> POV automatic transition (control-only)
  useEffect(() => {
    if (route !== 'control') return;
    if (state.activeLocation !== 'red_plains') return;
    const variant = state.displayOptions?.redPlainsVisualVariant;
    const started = state.displayOptions?.redPlainsTransitionStartedAt;
    if (variant !== 'wide' || !started) return;

    const elapsed = Date.now() - started;
    const timeoutMs = Math.max(0, 12_000 - elapsed);
    if (timeoutMs <= 0) {
      const payload: MissionControlState = {
        ...state,
        displayOptions: {
          ...state.displayOptions,
          redPlainsVisualVariant: 'pov',
          redPlainsTransitionStartedAt: null
        }
      };
      commitLocalState(payload);
      return;
    }

    const to = setTimeout(() => {
      const payload: MissionControlState = {
        ...state,
        displayOptions: {
          ...state.displayOptions,
          redPlainsVisualVariant: 'pov',
          redPlainsTransitionStartedAt: null
        }
      };
      commitLocalState(payload);
    }, timeoutMs + 50);

    return () => clearTimeout(to);
  }, [route, state.activeLocation, state.displayOptions?.redPlainsVisualVariant, state.displayOptions?.redPlainsTransitionStartedAt]);
  const handleResetLoopEpoch = () => {
    setLoopEpochKey(prev => prev + 1);
  };

  // Sound triggers forwarded from the child canvas loop
  const handleRoverFlickerSound = () => {
    if (audioEngineRef.current && currentConfig.audioEnabled && !currentConfig.audioRadioSilence) {
      audioEngineRef.current.triggerHeadlightFlickerBeep();
    }
  };

  const handleScannerPulseSound = () => {
    if (audioEngineRef.current && currentConfig.audioEnabled && !currentConfig.audioRadioSilence) {
      audioEngineRef.current.triggerScannerChirp();
    }
  };

  // Extract current dynamic tags for display HUD overlay (derived from shared state resources)
  const signalResource = state.resources.find(r => r.id === 'signal');
  const visibilityResource = state.resources.find(r => r.id === 'visibility');

  const signalLabel = signalResource ? signalResource.states[signalResource.index] : 'Inconnu';
  const visibilityLabel = visibilityResource ? visibilityResource.states[visibilityResource.index] : 'Inconnu';
  
  const getEmLabel = () => {
    if (currentConfig.visualEmFlashes) return 'CRITIQUE (TEMPÊTE)';
    if (currentConfig.visualRadioGlitch > 0.6) return 'SATURE INTERFÉRENCES';
    return 'NOMINALE';
  };

  const getDisplayModeLabel = (filter: string) => {
    switch (filter) {
      case 'normal': return 'CALME';
      case 'dust': return 'SITE DELTA-6';
      case 'scanner': return 'SCANNER ACTIF';
      case 'signal': return 'SIGNAL INSTABLE';
      case 'hounds': return 'HOUNDS PROCHES';
      case 'storm': return 'TEMPÊTE EM';
      case 'extraction': return 'EXTRACTION';
      case 'silence': return 'SILENCE RADIO';
      default: return String(filter).toUpperCase();
    }
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  /*                      VIEW 1: CHOICE HOMEPAGE                   */
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  if (route === 'home') {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center px-4 py-8 select-none font-mono relative overflow-hidden">
        {/* Cinematic CRT scanner meshes */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,31,18,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90.1deg,rgba(16,185,129,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,6px_100%] opacity-35 pointer-events-none" />
        
        <div className="max-w-2xl w-full bg-stone-900 border border-stone-850 rounded-xl p-8 shadow-2xl relative z-10 flex flex-col items-center">
          
          <div className="w-16 h-16 rounded-full border border-dashed border-orange-500 flex items-center justify-center text-orange-500 mb-6 bg-orange-950/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>

          <h1 className="text-white text-base font-bold tracking-[0.25em] uppercase text-center mb-2">
            MARATHON JDR // MISSION 01
          </h1>
          <p className="text-stone-500 text-xs uppercase tracking-widest text-center border-b border-stone-850 pb-5 w-full mb-6">
            LALIMENTATION DU COMPTE RENDU EN DIRECT // SOL ROUGE
          </p>

          <div className="text-stone-400 text-xs leading-relaxed space-y-4 mb-8">
            <p>
              Bienvenue sur l'infrastructure de liaison de la mission **M01 : SOL ROUGE**. 
              Afin de maximiser l'immersion des joueurs durant vos sessions de jeu de rôle, la console propose une architecture en double écran synchronisée :
            </p>
            <div className="pl-3 border-l border-orange-500/35 space-y-2 py-1">
              <p>
                🎥 <strong className="text-stone-200">Écran Joueur (/display) :</strong> Conçu pour être affiché plein écran sur un écran géant, une TV ou un moniteur secondaire. Aucun bouton ou spoiler n'est visible. L'atmosphère visuelle et sonore réagit en temps réel aux décisions du MJ.
              </p>
              <p>
                🎛️ <strong className="text-stone-200">Console MJ (/control) :</strong> À ouvrir sur votre téléphone, tablette ou ordinateur portable. Contrôlez instantanément les événements, ajustez précisément les sliders météo et mettez à jour la grille des ressources.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <button
              onClick={() => navigate('display')}
              className="flex flex-col items-center gap-3 p-5 rounded-lg border border-stone-800 bg-stone-950/40 hover:border-orange-500/50 hover:bg-stone-900/40 transition-all text-center cursor-pointer group"
            >
              <Tv className="w-8 h-8 text-stone-400 group-hover:text-orange-400 transition-colors" />
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">ÉCRAN JOUEUR</span>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest mt-1 block">/display [TV / PROJECTEUR]</span>
              </div>
            </button>

            <button
              onClick={() => navigate('control')}
              className="flex flex-col items-center gap-3 p-5 rounded-lg border border-stone-800 bg-stone-950/40 hover:border-orange-500/50 hover:bg-stone-900/40 transition-all text-center cursor-pointer group"
            >
              <Sliders className="w-8 h-8 text-stone-400 group-hover:text-orange-400 transition-colors" />
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">CONSOLE CONTRÔLE MJ</span>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest mt-1 block">/control [TÉLÉPHONE / TABLETTE]</span>
              </div>
            </button>
          </div>

          <p className="text-[9px] text-stone-600 tracking-widest mt-8 uppercase">
            CONNEXION PARALLÈLE SANS FIL SYNCHRONISÉE LOCALEMENT
          </p>
        </div>
      </div>
    );
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  /*                      VIEW 2: IMMERSIVE PLAYER DISPLAY          */
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  if (route === 'display') {
    if (!displayBooted) {
      return (
        <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center px-4 select-none font-mono relative">
          <div className="max-w-md w-full bg-stone-900 border border-stone-850 p-6 rounded-lg text-center shadow-2xl relative z-10">
            <Radio className="w-10 h-10 text-orange-500 mx-auto mb-4 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold block mb-1">
              PROTCOLE SOL ROUGE M01
            </span>
            <h2 className="text-white text-sm font-bold tracking-widest mb-4">LIAISON JOUEURS</h2>
            
            <p className="text-stone-400 text-xs leading-relaxed mb-6">
              Veuillez autoriser l'initialisation de l'affichage passif et du synthétiseur de l'atmosphère de Tau Ceti IV.
            </p>

            <button
              onClick={() => setDisplayBooted(true)}
              className="w-full py-3 px-5 rounded bg-orange-600 hover:bg-orange-500 active:bg-orange-600 text-white font-bold text-xs tracking-widest uppercase cursor-pointer shadow-md transition-all border border-orange-500/40"
            >
              ACTIVER L'AFFICHAGE IMMERSIF
            </button>
          </div>
          <div className="absolute inset-0 bg-stone-950 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-10 pointer-events-none" />
        </div>
      );
    }

    return (
      <div 
        id="player-passive-screen" 
        className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-0 overflow-hidden font-mono relative select-none"
      >
        {/* Full-width container to maximize visual containment on standard 16:9 displays */}
        <div className="w-full max-w-7xl mx-auto aspect-video relative rounded-none border-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.95)]">
          
          {/* Main Landscape Cinemagraph Loop */}
          <Cinemagraph 
            key={`${loopEpochKey}-${activeVisual.src}-${activeVisual.variant}`}
            config={currentConfig}
            visual={activeVisual}
            onOneShotComplete={handleVisualOneShotComplete}
            onFlickerSound={handleRoverFlickerSound}
            onScannerSound={handleScannerPulseSound}
          />
          <HoundOverlay effect={state.transientEffects?.hound} locationId={state.activeLocation} />
          <TransmissionOverlay 
            transmission={state.displayOptions.activeTransmission}
            showPortrait={state.interventionOptions.showPortrait}
            showText={state.interventionOptions.showText}
            showAudio={state.interventionOptions.playAudio}
            onStop={handleStopTransmission}
          />
          <SquadOverlay overlay={state.squadOverlay} />
          
          {/* Subtle Overlay HUD layout featuring discrete terrain logs and stats */}
          <div className="absolute top-[8%] left-[4%] pointer-events-none flex flex-col gap-1 text-[10px] text-stone-400 font-mono tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-30 opacity-90">
            <div className="flex items-center gap-1.5 font-bold text-white text-[11px] border-b border-stone-800/40 pb-1 mb-1">
              <span className="w-1.5 h-3 bg-orange-500 rounded-sm inline-block" />
              MISSION 01 // SOL ROUGE
            </div>
            <span>SITE : {activeLocation.label}</span>
            <span>SECTEUR : {activeLocation.subtitle}</span>
            <span>MODE : <strong className="text-orange-400 font-bold">{getDisplayModeLabel(currentConfig.environmentFilter)}</strong></span>
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              CONNEXION TERRAIN ACTIVE
            </div>
          </div>

          {/* Dynamic Small Overlays as requested by user representing live sensors */}
          <div className="absolute top-[8%] right-[4%] pointer-events-none flex flex-col gap-1.5 text-[9px] text-stone-400 font-mono tracking-wider uppercase bg-black/45 border border-stone-900 px-3 py-2 rounded-md backdrop-blur-xs z-30 shadow-md">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-stone-500">SIGNAL RADIO :</span>
              <span className={`font-semibold ${
                signalLabel.includes('Stable') ? 'text-emerald-400' :
                signalLabel.includes('Dégradé') ? 'text-amber-500' : 'text-red-500 font-bold'
              }`}>
                {signalLabel}
              </span>
            </div>
            
            <div className="flex items-center gap-2 justify-between">
              <span className="text-stone-500">VISIBILITÉ :</span>
              <span className={`font-semibold ${
                visibilityLabel.includes('Stable') ? 'text-emerald-400' :
                visibilityLabel.includes('Dégradé') ? 'text-amber-500' : 'text-red-500 font-bold'
              }`}>
                {visibilityLabel}
              </span>
            </div>

            <div className="flex items-center gap-2 justify-between">
              <span className="text-stone-500">ACTIVITÉ EM :</span>
              <span className={`font-bold ${currentConfig.visualEmFlashes ? 'text-red-500 animate-pulse' : 'text-stone-300'}`}>
                {getEmLabel()}
              </span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  /*                      VIEW 3: GM CONTROL WORKSTATION            */
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  if (route === 'control') {
    if (!controlBooted) {
      return (
        <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center px-4 select-none font-mono relative">
          <div className="max-w-md w-full bg-stone-900 border border-stone-850 p-6 rounded-lg text-center shadow-2xl relative z-10">
            <Terminal className="w-10 h-10 text-orange-500 mx-auto mb-4 animate-spin-slow" />
            <span className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold block mb-1">
              CONTRÔLE ADMINISTRATEUR UESC
            </span>
            <h2 className="text-white text-sm font-bold tracking-widest mb-4">CHARGEMENT DE LA CONSOLE MJ</h2>
            
            <p className="text-stone-400 text-xs leading-relaxed mb-6">
              M01 SOL ROUGE : Liaison de synchronisation prête pour le directeur de jeu.
            </p>

            <button
              onClick={() => setControlBooted(true)}
              className="w-full py-3 px-5 rounded bg-orange-600 hover:bg-orange-500 active:bg-orange-600 text-white font-bold text-xs tracking-widest uppercase cursor-pointer shadow-md transition-all border border-orange-500/40"
            >
              INITIALISER LE POSTE DE COMMANDE
            </button>
          </div>
          <div className="absolute inset-0 bg-stone-950 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-10 pointer-events-none" />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-4 md:p-6 font-sans selection:bg-orange-500/30 selection:text-orange-200">
        
        {/* Visual scanlines backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,31,18,0.06)_0%,rgba(0,0,0,0)_100%)] pointer-events-none" />
        
        {/* Header diagnostic panel */}
        <header className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-stone-850 pb-3 mb-4 select-none relative z-10">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            <div>
              <h1 className="text-xs font-mono font-bold tracking-[0.2em] text-white uppercase flex items-center gap-1.5">
                UESC TELEMETRY COMMAND // SITE D-6
              </h1>
              <span className="text-[10px] text-stone-500 font-mono tracking-widest">
                LIAISON MJ SYNCHRONISÉE : SOL RECOVERY A1
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('home')}
              className="text-[10px] font-mono py-1 px-2 border border-stone-800 bg-stone-900 rounded text-stone-400 hover:text-white hover:border-stone-700 transition-all cursor-pointer"
            >
              SÉLECTEUR DE ROUTE
            </button>
          </div>
        </header>

        {/* Console layout */}
        <main className="max-w-7xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start relative z-10">
          
          {/* Left panel: player loop feed (reduced visual context so MJ can monitor state changes) */}
          <section className="hidden lg:flex lg:col-span-4 flex-col gap-4">
            <div className="bg-stone-900 border border-stone-850/80 rounded-xl p-3 shadow-lg">
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
                <Monitor className="w-3 h-3 text-orange-400" />
                Vérification du retour PJ (/display)
              </span>
              <Cinemagraph 
                key={loopEpochKey}
                config={currentConfig}
                visual={resolveLocationVisual(activeLocation, currentConfig, state.displayOptions)}
              />
              <div className="mt-2.5 p-2 bg-stone-950/65 border border-stone-850 rounded text-[10px] font-mono text-stone-500 leading-normal">
                Cette vignette montre une copie miniature de ce que voient vos joueurs. Toutes vos modifications ci-contre se propagent instantanément sur leur écran.
              </div>
            </div>

            {/* JDR Session Note helper */}
            <div className="bg-stone-900/40 border border-stone-850 rounded-xl p-4 flex gap-3 items-start">
              <Shield className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold font-mono text-stone-300 uppercase tracking-widest">Aide de jeu</h4>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  Lancez le mode <strong className="text-stone-400">/display</strong> sur votre second écran (TV ou projeteur) et utilisez ce panneau sur votre tablette ou smartphone pour rythmer tranquillement votre session.
                </p>
              </div>
            </div>
          </section>

          {/* Right panel: dynamic 4-block HUD controls */}
          <section className="lg:col-span-8 w-full">
            {!state.squad.locked && (
              <SquadSelector
                squad={state.squad}
                onSelect={handleSelectSquadCharacter}
                onDeselect={handleDeselectSquadCharacter}
                onValidate={handleValidateSquad}
                onReset={handleResetSquad}
                onModify={handleModifySquad}
              />
            )}

            <HUD 
              config={currentConfig} 
              onChangeConfig={handleUpdateConfig} 
              onRefreshLoop={handleResetLoopEpoch}
              resources={state.resources}
              onChangeResources={handleUpdateResources}
              activePresetId={state.displayOptions.activePresetId}
              onChangePresetId={handleUpdatePresetId}
              activeLocation={state.activeLocation || 'delta6'}
              onChangeLocation={handleUpdateLocation}
              networkSyncStatus={networkSyncStatus}
              onQuickAction={handleQuickAction}
              onTransmission={handleTransmission}
              interventionOptions={state.interventionOptions}
              onToggleInterventionOption={handleToggleInterventionOption}
              onClearTransmission={handleStopTransmission}
              squadOverlay={state.squadOverlay}
              onToggleSquadOverlay={handleToggleSquadOverlay}
              onSetSquadOverlayMode={handleSetSquadOverlayMode}
              onUpdateSquadMember={handleUpdateSquadMember}
              onUpdateSquadTracker={handleUpdateSquadTracker}
              onMoveSquadMember={handleMoveSquadMember}
              onResetMission={handleResetMission}
              onModifySquad={handleModifySquad}
              onSceneShortcut={handleSceneShortcut}
              newCarthageLoopVariant={state.displayOptions?.newCarthageLoopVariant}
              newCarthageLoopCounts={state.displayOptions?.newCarthageLoopCounts}
              onChangeNewCarthageLoopVariant={handleNewCarthageLoopVariant}
            />
          </section>

        </main>

        {/* Minimal Footer */}
        <footer className="max-w-7xl w-full mx-auto border-t border-stone-850 pt-3 mt-5 flex justify-between items-center text-[10px] font-mono text-stone-600 uppercase select-none relative z-10">
          <span>UESC // NEW CARTHAGE FIELD CONTROL // M01 SOL ROUGE // ACCÈS MJ SÉCURISÉ</span>
          <span>SOL ROUGE // ACCÈS MJ SÉCURISÉ</span>
        </footer>

      </div>
    );
  }

  return null;
}
