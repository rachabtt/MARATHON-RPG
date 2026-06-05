/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import Cinemagraph from './components/Cinemagraph';
import HUD from './components/HUD';
import TransmissionOverlay from './components/TransmissionOverlay';
import Delta6DataPackagePanel from './components/Delta6DataPackagePanel';
import HoundAlertOverlay from './components/HoundAlertOverlay';
import HollowFinalTerminal from './components/HollowFinalTerminal';
import GmReaderPanel from './components/control/GmReaderPanel';
import AletheiaTerminalDisplay from './components/display/AletheiaTerminalDisplay';
import BootIntroVideo from './components/display/BootIntroVideo';
import BootScreenDisplay from './components/display/BootScreenDisplay';
import TacticalLargeMapDisplay from './components/display/TacticalLargeMapDisplay';
import TacticalMiniMapDisplay from './components/display/TacticalMiniMapDisplay';
import PlayerView from './components/player/PlayerView';
import type { CharacterEquipmentState, CinemagraphConfig, PlayerCharacterId, QuickEffectType, TransmissionType, SquadMember } from './types';
import { SciFiAudioEngine } from './utils/audioEngine';
import { 
  type AletheiaTerminalMessageSource,
  getStoredState, 
  saveStoredState, 
  ResourceState, 
  MissionControlState,
  INITIAL_MISSION_STATE,
  deriveConfigFromState,
  subscribeToStateBroadcast,
  broadcastStateChange,
  applyPreset,
  activateEmStorm,
  setEmStormSeverity,
  exitEmStorm,
  setDataPackageStatus,
  setDataPackageVisible,
  type DataPackageStatus,
  type EmStormSeverity,
  type PlayerIntelDelivery,
  type PlayerIntelRecipient
} from './utils/syncState';
import { getLocationById, LOCATIONS, resolveLocationVisual, type LocationId } from './utils/locations';
import { getResolvedAudioProfile } from './utils/audioProfiles';
import { getLocationEffectProfile } from './utils/locationEffects';
import {
  connectNetworkSync,
  networkClientId,
  sendNetworkState,
  type NetworkSyncStatus
} from './utils/networkSync';
import { createMissionTransmission } from './utils/transmissions';
import { getStoryBeat, type StoryAmbience } from './utils/storyBeats';
import { getHoundAction, type HoundActionId } from './data/houndActions';
import { getMissionSceneById } from './data/missionScenes';
import type { MissionPlayerIntel } from './types/missionSchema';
import { getGmScriptSceneIdForStoryBeat } from './data/mission01GmScript';
import { createScenePopupTransmission } from './data/scenePopups';
import { applyTokenSceneVisibility } from './utils/tokenSceneVisibility';
import {
  mergeTacticalRuntimeTokens,
  missionTokensToTacticalMapTokens
} from './utils/missionTacticalMap';
import { getHoundVisualProfile } from './utils/houndProfile';
import HoundOverlay from './components/HoundOverlay';
import SquadOverlay from './components/SquadOverlay';
import TacticalMapPanel from './components/control/TacticalMapPanel';
import SquadControlPanel from './components/control/SquadControlPanel';
import PLAYER_CHARACTERS from './utils/playerCharacters';
import { createInitialPlayerEquipmentState } from './data/playerCharacters';
import { useMission } from './context/MissionProvider';
import { 
  Volume2, 
  Radio, 
  Terminal, 
  Compass, 
  Sparkles, 
  Layers, 
  Play, 
  Tv,
  Eye,
  Sliders,
  VolumeX,
  AlertTriangle,
  Maximize2,
  Minimize2,
  UserRound
} from 'lucide-react';

const UESC_ROVER_TOKEN_ID = 'rover-uesc';

function toPlayerIntelDeliveryTone(tone: MissionPlayerIntel['tone']): PlayerIntelDelivery['tone'] {
  if (tone === 'uneasy' || tone === 'procedural' || tone === 'urgent') {
    return tone;
  }

  return 'neutral';
}

function clampTacticalPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function getDisembarkPosition(rover: { x: number; y: number }, index: number) {
  const offsets = [
    { x: -3.2, y: -2.4 },
    { x: 3.2, y: -2.4 },
    { x: -3.2, y: 2.4 },
    { x: 3.2, y: 2.4 },
    { x: 0, y: -4 },
    { x: 0, y: 4 },
    { x: -4.2, y: 0 },
    { x: 4.2, y: 0 }
  ];
  const offset = offsets[index % offsets.length];

  return {
    x: clampTacticalPercent(rover.x + offset.x),
    y: clampTacticalPercent(rover.y + offset.y)
  };
}

// Simple custom router hook supporting path and hash navigation
function useRoute() {
  const [route, setRoute] = useState<'home' | 'display' | 'control' | 'player'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/display' || hash === '#/display') return 'display';
    if (path === '/control' || hash === '#/control') return 'control';
    if (path === '/player' || hash === '#/player') return 'player';
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
      } else if (path === '/player' || hash === '#/player') {
        setRoute('player');
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

  const navigate = (to: 'home' | 'display' | 'control' | 'player') => {
    const path = to === 'home' ? '/' : `/${to}`;
    window.history.pushState(null, '', path);
    setRoute(to);
  };

  return { route, navigate };
}

export default function App() {
  const { route, navigate } = useRoute();
  const { currentMission } = useMission();
  const [state, setState] = useState<MissionControlState>(getStoredState);
  
  // Independent local audio and boot states per device context
  const [displayBooted, setDisplayBooted] = useState(false);
  const [controlBooted, setControlBooted] = useState(false);
  const [loopEpochKey, setLoopEpochKey] = useState(0);
  const [networkSyncStatus, setNetworkSyncStatus] = useState<NetworkSyncStatus>('disconnected');
  const [gmReaderSceneId, setGmReaderSceneId] = useState('depart_new_carthage');
  const [controlPanelView, setControlPanelView] = useState<'gm' | 'map' | 'squad'>('gm');
  const [isDisplayFullscreen, setIsDisplayFullscreen] = useState(false);
  const [, setTransmissionOverlayEpoch] = useState(0);
  
  const audioEngineRef = useRef<SciFiAudioEngine | null>(null);
  const lastQuickEffectIdRef = useRef<string>('');
  const lastTransmissionIdRef = useRef<string>('');

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsDisplayFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleDisplayFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      const target = document.getElementById('player-passive-screen') ?? document.documentElement;
      await target.requestFullscreen();
    } catch (error) {
      console.warn('Fullscreen request failed', error);
    }
  };

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
      if (location.wideVideo) {
        const v = document.createElement('video');
        v.preload = 'auto';
        v.src = location.wideVideo;
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
  // For control route, never allow a full-screen black override to block the MJ UI.
  const visualConfig = route === 'control' ? { ...currentConfig, screenBlack: false } : currentConfig;
  const activeLocation = getLocationById(state.activeLocation);
  const isAudioBooted = (route === 'display' && displayBooted) || (route === 'control' && controlBooted);
  const activeVisual = resolveLocationVisual(activeLocation, visualConfig, state.displayOptions);
  const initialTacticalTokens = useMemo(
    () => missionTokensToTacticalMapTokens(currentMission.tokens ?? []),
    [currentMission.tokens]
  );
  const tacticalTokens = useMemo(
    () => mergeTacticalRuntimeTokens(initialTacticalTokens, state.tacticalTokens),
    [initialTacticalTokens, state.tacticalTokens]
  );
  const tacticalMapImagePath = currentMission.map?.imagePath ?? '/assets/maps/PLATEAU.png';
  const missionBootPhase = state.missionBoot?.phase ?? 'boot_idle';

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const resolvedAudioProfile = getResolvedAudioProfile({
      locationId: currentConfig.activeLocation,
      moodId: currentConfig.environmentFilter,
      sceneId: state.activeDirectorSceneId,
      isStormActive: currentConfig.emStormActive === true,
    });
    const resolvedLocationEffects = getLocationEffectProfile(currentConfig.activeLocation, currentConfig);

    console.log('[AUDIO PROFILE]', {
      sceneId: state.activeDirectorSceneId,
      locationId: currentConfig.activeLocation,
      moodId: currentConfig.environmentFilter,
      resolvedAudioProfile,
      resolvedLocationEffects,
      finalDisplayConfig: {
        windSpeed: currentConfig.windSpeed,
        dustDensity: currentConfig.dustDensity,
        audioWindVolume: currentConfig.audioWindVolume,
        audioStormVolume: currentConfig.audioStormVolume,
        audioRadioVolume: currentConfig.audioRadioVolume,
        audioHumVolume: currentConfig.audioHumVolume,
      },
    });
  }, [
    state.activeDirectorSceneId,
    currentConfig.activeLocation,
    currentConfig.environmentFilter,
    currentConfig.emStormActive,
    currentConfig.windSpeed,
    currentConfig.dustDensity,
    currentConfig.audioWindVolume,
    currentConfig.audioStormVolume,
    currentConfig.audioRadioVolume,
    currentConfig.audioHumVolume,
  ]);

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
        currentConfig.environmentFilter,
        state.activeDirectorSceneId,
        currentConfig.emStormActive === true
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
    currentConfig.environmentFilter,
    state.activeDirectorSceneId,
    currentConfig.emStormActive
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
    const transmission = state.displayOptions.activeTransmission;
    if (!transmission) return;

    const elapsed = Date.now() - transmission.startedAt;
    const remaining = transmission.durationMs - elapsed;
    if (remaining <= 0) {
      setTransmissionOverlayEpoch((current) => current + 1);
      return;
    }

    const timeout = window.setTimeout(() => {
      setTransmissionOverlayEpoch((current) => current + 1);
    }, remaining + 150);

    return () => window.clearTimeout(timeout);
  }, [state.displayOptions.activeTransmission]);

  useEffect(() => {
    if (route === 'player') return;
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
  }, [route, state.transientEffects?.hound]);

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
        screenBlack: newConfig.screenBlack,
        playerTacticalMapVisible: newConfig.screenBlack ? false : state.displayOptions.playerTacticalMapVisible
      }
    };
    commitLocalState(payload);
  };

  const handleUpdateResources = (newResources: ResourceState[]) => {
    const toTelemetryValue = (value: string) => {
      const normalized = value.toLowerCase();
      if (normalized.includes('perdu')) return 'PERDU' as const;
      if (normalized.includes('critique')) return 'CRITIQUE' as const;
      if (normalized.includes('dégradé')) return 'DÉGRADÉ' as const;
      return 'STABLE' as const;
    };
    const signal = newResources.find((resource) => resource.id === 'signal');
    const visibility = newResources.find((resource) => resource.id === 'visibility');
    const previousDataIndex = state.resources.find((resource) => resource.id === 'data')?.index;
    const nextDataIndex = newResources.find((resource) => resource.id === 'data')?.index;
    const dataStatusByResourceIndex: DataPackageStatus[] = ['non_secure', 'partial', 'corrupted', 'lost'];
    const dataPackageChanged = typeof nextDataIndex === 'number' && nextDataIndex !== previousDataIndex;
    const payload = {
      ...state,
      resources: newResources,
      dataPackage: dataPackageChanged
        ? {
            status: dataStatusByResourceIndex[nextDataIndex] ?? 'non_secure',
            visible: true,
            updatedAt: Date.now()
          }
        : state.dataPackage,
      missionTelemetry: state.emStorm?.active
        ? state.missionTelemetry
        : {
            signalRadio: signal ? toTelemetryValue(signal.states[signal.index]) : state.missionTelemetry?.signalRadio ?? 'DÉGRADÉ',
            visibility: visibility ? toTelemetryValue(visibility.states[visibility.index]) : state.missionTelemetry?.visibility ?? 'DÉGRADÉ',
            emActivity: state.missionTelemetry?.emActivity ?? 'DÉGRADÉ'
          }
    };
    commitLocalState(payload);
  };

  const handleSetDataPackageStatus = (status: DataPackageStatus) => {
    const payload = setDataPackageStatus(state, status);
    commitLocalState(payload);
  };

  const handleToggleDataPackageVisibility = () => {
    const payload = setDataPackageVisible(state, !(state.dataPackage?.visible ?? false));
    commitLocalState(payload);
  };

  const handleUpdatePresetId = (id: string) => {
    const now = Date.now();
    const baseState = id === 'calme' ? exitEmStorm(state) : state;
    let payload = applyPreset(baseState, id);

    if (id === 'calme') {
      payload = {
        ...payload,
        emStorm: { active: false, severity: 'critical' },
        aletheiaTerminal: {
          ...payload.aletheiaTerminal,
          glitchUntil: null
        }
      };
    }

    if (id === 'signal' || id === 'signal_instable') {
      payload = {
        ...payload,
        aletheiaTerminal: {
          ...payload.aletheiaTerminal,
          glitchUntil: now + 60 * 60 * 1000
        }
      };
    }

    commitLocalState(payload);
  };

  const handleActivateEmStorm = () => {
    const payload = {
      ...activateEmStorm(state, state.emStorm?.severity ?? 'critical'),
      aletheiaTerminal: {
        ...state.aletheiaTerminal,
        glitchUntil: Date.now() + 60 * 60 * 1000
      }
    };
    commitLocalState(payload);
  };

  const handleSetEmStormSeverity = (severity: EmStormSeverity) => {
    const payload = setEmStormSeverity(state, severity);
    commitLocalState(payload);
  };

  const handleExitEmStorm = () => {
    const payload = exitEmStorm(state);
    commitLocalState(payload);
  };

  const handleUpdateLocation = (location: LocationId) => {
    const payload = { ...state, activeLocation: location };
    commitLocalState(payload);
  };

  const handleSendAletheiaMessage = (
    text: string,
    source: AletheiaTerminalMessageSource = 'custom'
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = Date.now();
    // Manual GM-controlled terminal. No autonomous generation. Never send GM secrets to display.
    const payload: MissionControlState = {
      ...state,
      aletheiaTerminal: {
        active: true,
        noSignal: false,
        glitchUntil: null,
        messages: [
          ...state.aletheiaTerminal.messages,
          {
            id: `aletheia-${now}`,
            text: trimmed,
            createdAt: now,
            source
          }
        ].slice(-5)
      }
    };
    commitLocalState(payload);
  };

  const handleClearAletheiaTerminal = () => {
    const payload: MissionControlState = {
      ...state,
      aletheiaTerminal: {
        active: false,
        messages: [],
        glitchUntil: null,
        noSignal: false
      }
    };
    commitLocalState(payload);
  };

  const handleGlitchAletheiaSignal = () => {
    const glitchActive = Boolean(state.aletheiaTerminal.glitchUntil && state.aletheiaTerminal.glitchUntil > Date.now());

    if (!glitchActive && audioEngineRef.current && currentConfig.audioEnabled && !currentConfig.audioRadioSilence) {
      audioEngineRef.current.triggerRadioGlitchBurst();
    }

    const payload: MissionControlState = {
      ...state,
      aletheiaTerminal: {
        ...state.aletheiaTerminal,
        active: true,
        glitchUntil: glitchActive ? null : Date.now() + 60 * 60 * 1000
      }
    };
    commitLocalState(payload);
  };

  const handleToggleAletheiaNoSignal = () => {
    const nextNoSignal = !state.aletheiaTerminal.noSignal;

    if (nextNoSignal && audioEngineRef.current && currentConfig.audioEnabled) {
      audioEngineRef.current.triggerRadioSilenceDropout();
    }

    const payload: MissionControlState = {
      ...state,
      aletheiaTerminal: {
        ...state.aletheiaTerminal,
        active: true,
        noSignal: nextNoSignal
      }
    };
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

  const updateCharacterEquipmentState = (
    characterId: PlayerCharacterId,
    equipmentId: string,
    updateEquipment: (current: { visible: boolean; used: boolean }) => { visible: boolean; used: boolean }
  ) => {
    const initialEquipmentState = createInitialPlayerEquipmentState();
    const currentPlayerEquipmentState = state.playerEquipmentState ?? initialEquipmentState;
    const mergedPlayerEquipmentState = Object.values(initialEquipmentState).reduce<MissionControlState['playerEquipmentState']>(
      (equipmentState, initialCharacterState) => {
        const savedCharacterState = currentPlayerEquipmentState[initialCharacterState.characterId];
        const equipment = Object.entries(initialCharacterState.equipment).reduce<CharacterEquipmentState['equipment']>(
          (characterEquipment, [savedEquipmentId, initialItemState]) => {
            const savedItemState = savedCharacterState?.equipment?.[savedEquipmentId];

            return {
              ...characterEquipment,
              [savedEquipmentId]: {
                visible: typeof savedItemState?.visible === 'boolean'
                  ? savedItemState.visible
                  : initialItemState.visible,
                used: typeof savedItemState?.used === 'boolean'
                  ? savedItemState.used
                  : initialItemState.used
              }
            };
          },
          {}
        );

        return {
          ...equipmentState,
          [initialCharacterState.characterId]: {
            characterId: initialCharacterState.characterId,
            equipment
          }
        };
      },
      {} as MissionControlState['playerEquipmentState']
    );
    const initialCharacterState = initialEquipmentState[characterId];
    if (!initialCharacterState) return;

    const currentCharacterState = mergedPlayerEquipmentState[characterId] ?? initialCharacterState;
    const currentEquipment = Object.entries(initialCharacterState.equipment).reduce<CharacterEquipmentState['equipment']>(
      (characterEquipment, [savedEquipmentId, initialItemState]) => ({
        ...characterEquipment,
        [savedEquipmentId]: currentCharacterState.equipment[savedEquipmentId] ?? initialItemState
      }),
      {}
    );
    const currentItemState = currentEquipment[equipmentId];
    if (!currentItemState) return;

    const payload: MissionControlState = {
      ...state,
      playerEquipmentState: {
        ...mergedPlayerEquipmentState,
        [characterId]: {
          characterId,
          equipment: {
            ...currentEquipment,
            [equipmentId]: updateEquipment(currentItemState)
          }
        }
      }
    };
    commitLocalState(payload);
  };

  const toggleCharacterEquipmentVisible = (characterId: PlayerCharacterId, equipmentId: string) => {
    updateCharacterEquipmentState(characterId, equipmentId, (current) => ({
      ...current,
      visible: !current.visible
    }));
  };

  const toggleCharacterEquipmentUsed = (characterId: PlayerCharacterId, equipmentId: string) => {
    updateCharacterEquipmentState(characterId, equipmentId, (current) => ({
      ...current,
      used: !current.used
    }));
  };

  const handleSendPlayerIntel = (intel: MissionPlayerIntel, recipients: PlayerIntelRecipient[]) => {
    if (recipients.length === 0) return;

    const now = Date.now();
    const payload: MissionControlState = {
      ...state,
      playerIntelDeliveries: [
        ...(state.playerIntelDeliveries ?? []),
        {
          id: `player-intel-${intel.id}-${now}`,
          intelId: intel.id,
          sceneId: intel.sceneId,
          title: intel.title,
          type: intel.type,
          target: intel.target,
          text: intel.text,
          tone: toPlayerIntelDeliveryTone(intel.tone),
          recipients,
          sentAt: now
        }
      ].slice(-20)
    };
    commitLocalState(payload);
  };

  const handleClearPlayerIntel = () => {
    if ((state.playerIntelDeliveries ?? []).length === 0) return;
    const confirmed = window.confirm('Effacer toutes les infos joueur envoyées ?');
    if (!confirmed) return;

    const payload: MissionControlState = {
      ...state,
      playerIntelDeliveries: []
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

  const handleLaunchMission = () => {
    const confirmed = window.confirm('Lancer Mission 01 — SOL ROUGE sur le display ?');
    if (!confirmed) return;

    const now = Date.now();
    const payload: MissionControlState = {
      ...state,
      activeLocation: 'new_carthage',
      activeDirectorSceneId: state.activeDirectorSceneId ?? 'depart_new_carthage',
      missionBoot: {
        phase: 'boot_launching',
        launchedAt: now,
        introStartedAt: null,
        introCompletedAt: null
      },
      audio: {
        ...state.audio,
        radioSilence: false
      },
      displayOptions: {
        ...state.displayOptions,
        screenBlack: false,
        activeTransmission: null,
        newCarthageLoopVariant: 'workers'
      }
    };
    commitLocalState(payload);
  };

  const handleIntroStarted = () => {
    if (state.missionBoot?.phase === 'intro_playing' && state.missionBoot.introStartedAt) return;

    const now = Date.now();
    const payload: MissionControlState = {
      ...state,
      missionBoot: {
        phase: 'intro_playing',
        launchedAt: state.missionBoot?.launchedAt ?? now,
        introStartedAt: now,
        introCompletedAt: null
      }
    };
    commitLocalState(payload);
  };

  const handleIntroCompleted = () => {
    const now = Date.now();
    setDisplayBooted(true);

    const payload: MissionControlState = {
      ...state,
      activeLocation: 'new_carthage',
      activeDirectorSceneId: 'depart_new_carthage',
      missionBoot: {
        phase: 'mission_live',
        launchedAt: state.missionBoot?.launchedAt ?? now,
        introStartedAt: state.missionBoot?.introStartedAt ?? now,
        introCompletedAt: now
      },
      displayOptions: {
        ...state.displayOptions,
        screenBlack: false,
        newCarthageLoopVariant: 'workers'
      }
    };
    commitLocalState(payload);
  };

  const handleResetMission = () => {
    const confirmReset = window.confirm("Réinitialiser la session M01 ?");
    if (!confirmReset) return;
    const payload: MissionControlState = {
      ...INITIAL_MISSION_STATE,
      activeLocation: 'new_carthage',
      activeDirectorSceneId: 'depart_new_carthage',
      missionBoot: {
        phase: 'boot_idle',
        launchedAt: null,
        introStartedAt: null,
        introCompletedAt: null
      },
      audio: { ...INITIAL_MISSION_STATE.audio, enabled: state.audio.enabled, radioSilence: false },
      displayOptions: {
        ...INITIAL_MISSION_STATE.displayOptions,
        newCarthageLoopVariant: 'workers',
        newCarthageLoopCounts: { ship_takeoff: 0, easter_egg: 0 },
        redPlainsVisualVariant: 'wide',
        redPlainsTransitionStartedAt: null,
        screenBlack: false,
        playerTacticalMapVisible: false,
        activeTransmission: null
      },
      quickEffect: null,
      tacticalTokens: initialTacticalTokens.map((token) => ({ ...token })),
      playerEquipmentState: createInitialPlayerEquipmentState(),
      playerIntelDeliveries: [],
      playerSelectionResetAt: Date.now(),
      effects: { ...INITIAL_MISSION_STATE.effects, hounds: 0 },
      transientEffects: {}
    };
    commitLocalState(payload);
  };

  const handleUpdateTacticalTokenPosition = (tokenId: string, x: number, y: number) => {
    const payload: MissionControlState = {
      ...state,
      tacticalTokens: tacticalTokens.map((token) => (
        token.id === tokenId ? { ...token, x, y } : token
      ))
    };
    commitLocalState(payload);
  };

  const handleToggleTacticalTokenPlayerVisibility = (tokenId: string) => {
    const payload: MissionControlState = {
      ...state,
      tacticalTokens: tacticalTokens.map((token) => (
        token.id === tokenId
          ? { ...token, visibleToPlayers: !token.visibleToPlayers, manualVisibilityOverride: true }
          : token
      ))
    };
    commitLocalState(payload);
  };

  const handleToggleTacticalTokenControlVisibility = (tokenId: string) => {
    const payload: MissionControlState = {
      ...state,
      tacticalTokens: tacticalTokens.map((token) => (
        token.id === tokenId ? { ...token, visibleInControl: !token.visibleInControl } : token
      ))
    };
    commitLocalState(payload);
  };

  const handleResetTacticalTokenPositions = () => {
    const payload: MissionControlState = {
      ...state,
      tacticalTokens: tacticalTokens.map((token) => {
        const defaultToken = initialTacticalTokens.find((candidate) => candidate.id === token.id);
        return {
          ...token,
          x: defaultToken?.x ?? token.x,
          y: defaultToken?.y ?? token.y,
          inVehicle: false
        };
      })
    };
    commitLocalState(payload);
  };

  const setSelectedSquadVehicleState = (inVehicle: boolean, targetTokenId?: string) => {
    const selectedSquadIds = state.squad?.selectedIds ?? [];
    const selectedSquadSet = new Set(selectedSquadIds);
    const rover = tacticalTokens.find((token) => token.id === UESC_ROVER_TOKEN_ID);
    if (!rover) return;

    let disembarkIndex = 0;
    const payload: MissionControlState = {
      ...state,
      tacticalTokens: tacticalTokens.map((token) => {
        const isTargetedSquadPj = (
          token.type === 'pj' &&
          selectedSquadSet.has(token.id) &&
          (!targetTokenId || token.id === targetTokenId)
        );
        if (!isTargetedSquadPj) return token;

        if (inVehicle) {
          return { ...token, inVehicle: true };
        }

        const nextPosition = getDisembarkPosition(rover, disembarkIndex);
        disembarkIndex += 1;
        return {
          ...token,
          inVehicle: false,
          x: nextPosition.x,
          y: nextPosition.y
        };
      })
    };
    commitLocalState(payload);
  };

  const handleToggleTacticalTokenVehicle = (tokenId: string) => {
    const token = tacticalTokens.find((candidate) => candidate.id === tokenId);
    if (!token || token.type !== 'pj') return;
    if (!(state.squad?.selectedIds ?? []).includes(token.id)) return;

    setSelectedSquadVehicleState(!token.inVehicle, token.id);
  };

  const handleEmbarkSelectedSquad = () => {
    setSelectedSquadVehicleState(true);
  };

  const handleDisembarkSelectedSquad = () => {
    setSelectedSquadVehicleState(false);
  };

  const handleReapplySceneTokenVisibility = () => {
    const payload: MissionControlState = {
      ...state,
      tacticalTokens: applyTokenSceneVisibility(
        tacticalTokens,
        state.activeDirectorSceneId,
        state.squad?.selectedIds ?? []
      )
    };
    commitLocalState(payload);
  };

  const handleTogglePlayerTacticalMap = () => {
    const nextVisible = !(state.displayOptions.playerTacticalMapVisible ?? false);
    const payload: MissionControlState = {
      ...state,
      displayOptions: {
        ...state.displayOptions,
        playerTacticalMapVisible: nextVisible,
        screenBlack: nextVisible ? false : state.displayOptions.screenBlack
      }
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
    const payload: MissionControlState = { ...state };

    // Manual control is never counter-limited; counters only track automated plays.
    payload.displayOptions = { ...state.displayOptions, newCarthageLoopVariant: variant, newCarthageLastManualLoopAt: Date.now() };
    commitLocalState(payload);
    setLoopEpochKey(prev => prev + 1);
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
        const counts = state.displayOptions.newCarthageLoopCounts || { ship_takeoff: 0, easter_egg: 0 };
        const autoCountLimitReached =
          (variant === 'ship_takeoff' && (counts.ship_takeoff || 0) >= 2) ||
          (variant === 'easter_egg' && (counts.easter_egg || 0) >= 2);
        const payload: MissionControlState = {
          ...state,
          displayOptions: {
            ...state.displayOptions,
            newCarthageLoopVariant: autoCountLimitReached ? state.displayOptions.newCarthageLoopVariant : variant,
            newCarthageLastAutoLoopAt: Date.now(),
            newCarthageAutoStep: i + 1
          }
        };
        // Counters only apply to automated ship/easter plays. Manual buttons stay unlimited.
        if (!autoCountLimitReached && variant === 'ship_takeoff') {
          payload.displayOptions.newCarthageLoopCounts = { ...counts, ship_takeoff: (counts.ship_takeoff || 0) + 1 };
        }
        if (!autoCountLimitReached && variant === 'easter_egg') {
          payload.displayOptions.newCarthageLoopCounts = { ...counts, easter_egg: (counts.easter_egg || 0) + 1 };
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
        emStorm: { active: false, severity: 'critical' },
        missionTelemetry: {
          signalRadio: 'DÉGRADÉ',
          visibility: 'DÉGRADÉ',
          emActivity: 'DÉGRADÉ'
        },
        houndAlert: null,
        quickEffect: null
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

  const handleHoundAction = (actionId: HoundActionId) => {
    const action = getHoundAction(actionId);
    const now = Date.now();
    const shouldClearContact = action.id === 'contact_lost';
    const houndProfile = getHoundVisualProfile(state.activeLocation);

    let payload: MissionControlState = {
      ...state,
      activeSceneMode: shouldClearContact && state.activeSceneMode === 'hounds' ? 'normal' : state.activeSceneMode,
      houndAlert: shouldClearContact
        ? null
        : {
            id: action.id,
            label: action.controlLabel,
            message: action.displayMessage,
            tone: action.tone,
            createdAt: now,
            durationMs: action.durationMs
          },
      displayOptions: {
        ...state.displayOptions,
        activePresetId: shouldClearContact && state.displayOptions.activePresetId === 'hounds'
          ? 'delta6'
          : state.displayOptions.activePresetId
      },
      effects: {
        ...state.effects,
        hounds: shouldClearContact ? 0 : action.shouldSetHounds ? Math.max(state.effects.hounds, 1) : state.effects.hounds,
        glitch: action.shouldGlitch ? Math.max(state.effects.glitch, 1) : state.effects.glitch
      },
      transientEffects: shouldClearContact
        ? {
            ...state.transientEffects,
            hound: undefined
          }
        : (action.shouldSetHounds || action.shouldImpact)
          ? {
              ...state.transientEffects,
              hound: {
                active: true,
                ...houndProfile,
                startedAt: now,
                durationMs: Math.max(action.durationMs, houndProfile.durationMs)
              }
            }
          : state.transientEffects,
      quickEffect: shouldClearContact
        ? null
        : action.shouldSetHounds
          ? {
              type: 'ombre_hound',
              startedAt: now,
              durationMs: Math.min(action.durationMs, 2600)
            }
          : action.shouldGlitch
            ? {
                type: 'glitch_radio',
                startedAt: now,
                durationMs: Math.min(action.durationMs, 1600)
              }
            : state.quickEffect,
      audio: {
        ...state.audio,
        houndsVolume: action.shouldSetHounds ? Math.max(state.audio.houndsVolume, 0.45) : state.audio.houndsVolume,
        radioVolume: action.shouldGlitch ? Math.max(state.audio.radioVolume, 0.35) : state.audio.radioVolume
      }
    };

    if (action.shouldImpact) {
      payload = {
        ...payload,
        effects: {
          ...payload.effects,
          headlight: Math.max(payload.effects.headlight, 2)
        }
      };
    }

    commitLocalState(payload);

    if (
      (action.shouldSetHounds || action.shouldImpact) &&
      audioEngineRef.current &&
      currentConfig.audioEnabled &&
      !currentConfig.audioRadioSilence
    ) {
      audioEngineRef.current.triggerHoundShadow();
    }
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

    const shortcutLocation =
      beat.id === 'tempete_em'
        ? (state.activeLocation === 'red_plains' || state.activeLocation === 'delta6' ? state.activeLocation : 'delta6')
        : beat.location;

    // Base payload with preset
    let payload: MissionControlState = applyPreset(
      { ...state, activeLocation: shortcutLocation },
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
    if (['anomalie_radio', 'extraction'].includes(beat.id) || (beat.id === 'tempete_em' && payload.activeLocation === 'red_plains')) {
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

    if (beat.id === 'tempete_em') {
      payload = activateEmStorm(payload, 'critical');
    }

    if (beat.quickAction === 'glitch_radio' || beat.quickAction === 'flash_em') {
      payload = triggerQuickEffect(beat.quickAction, payload);
    } else if (beat.quickAction === 'HOUND') {
      payload = triggerQuickEffect('ombre_hound', payload);
    }

    const sceneTransmission = createScenePopupTransmission(beat.id);
    const aletheiaSceneMessage =
      sceneTransmission?.profileId === 'aletheia'
        ? sceneTransmission.message
        : beat.speaker === 'aletheia'
          ? beat.message
          : null;

    payload.displayOptions.activeTransmission =
      sceneTransmission?.profileId === 'aletheia' ? null : sceneTransmission;

    if (aletheiaSceneMessage) {
      const now = Date.now();
      payload = {
        ...payload,
        aletheiaTerminal: {
          active: true,
          noSignal: false,
          glitchUntil: beat.quickAction === 'glitch_radio'
            ? now + 60 * 1000
            : payload.aletheiaTerminal.glitchUntil,
          messages: [
            ...payload.aletheiaTerminal.messages,
            {
              id: `aletheia-scene-${beat.id}-${now}`,
              text: aletheiaSceneMessage,
              createdAt: now,
              source: 'system'
            }
          ].slice(-5)
        }
      };
    }

    if (beat.id === 'finale_terminal') {
      payload = {
        ...payload,
        houndAlert: null,
        quickEffect: null,
        transientEffects: {
          ...payload.transientEffects,
          hound: undefined
        },
        dataPackage: {
          status: payload.dataPackage?.status ?? state.dataPackage?.status ?? 'non_secure',
          visible: false,
          updatedAt: payload.dataPackage?.updatedAt ?? state.dataPackage?.updatedAt ?? null
        },
        squadOverlay: {
          ...payload.squadOverlay,
          visible: false
        },
        displayOptions: {
          ...payload.displayOptions,
          screenBlack: false
        }
      };
    }

	    // Update director guide active scene id for control-facing panel
	    payload.activeDirectorSceneId = beat.id as string;
    payload.tacticalTokens = applyTokenSceneVisibility(
      payload.tacticalTokens ?? tacticalTokens,
      beat.id,
      payload.squad?.selectedIds ?? []
    );
	    setGmReaderSceneId(getGmScriptSceneIdForStoryBeat(beat.id));
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

  const signalLabel = state.missionTelemetry?.signalRadio ?? (signalResource ? signalResource.states[signalResource.index].toUpperCase() : 'INCONNU');
  const visibilityLabel = state.missionTelemetry?.visibility ?? (visibilityResource ? visibilityResource.states[visibilityResource.index].toUpperCase() : 'INCONNU');
  
  const getEmLabel = () => {
    if (state.missionTelemetry?.emActivity) return state.missionTelemetry.emActivity;
    if (currentConfig.visualEmFlashes) return 'CRITIQUE (TEMPÊTE)';
    if (currentConfig.visualRadioGlitch > 0.6) return 'SATURE INTERFÉRENCES';
    return 'NOMINALE';
  };

  const getTelemetryTextClass = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes('stable')) return 'text-emerald-400';
    if (normalized.includes('dégradé')) return 'text-amber-500';
    if (normalized.includes('critique') || normalized.includes('perdu')) return 'text-red-500 font-bold';
    return 'text-stone-300';
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

  const activeMissionScene = getMissionSceneById(state.activeDirectorSceneId);
  const activeTransmission = state.displayOptions.activeTransmission;
  const isTransmissionOverlayVisible = Boolean(
    activeTransmission &&
    Date.now() - activeTransmission.startedAt <= activeTransmission.durationMs
  );
  const effectiveSquadOverlay = isTransmissionOverlayVisible
    ? { ...state.squadOverlay, visible: false }
    : state.squadOverlay;
  const isFinalTerminalActive = Boolean(
    activeMissionScene?.id === 'finale-terminal' ||
    activeTransmission?.beatId === 'finale_terminal'
  );

  const dataPackageDisplayEnabled = Boolean(
    !isFinalTerminalActive &&
    state.dataPackage?.visible &&
    (
      state.activeLocation === 'delta6' ||
      state.activeSceneMode === 'scanner' ||
      ['arrivee_delta6', 'scanner_actif', 'finale_terminal'].includes(state.activeDirectorSceneId ?? '')
    )
  );

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
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

            <button
              onClick={() => navigate('player')}
              className="flex flex-col items-center gap-3 p-5 rounded-lg border border-stone-800 bg-stone-950/40 hover:border-emerald-500/50 hover:bg-stone-900/40 transition-all text-center cursor-pointer group"
            >
              <UserRound className="w-8 h-8 text-stone-400 group-hover:text-emerald-400 transition-colors" />
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">FICHE JOUEUR</span>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest mt-1 block">/player [TÉLÉPHONE PJ]</span>
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
  /*                      VIEW 2B: PERSONAL PLAYER SHEET            */
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  if (route === 'player') {
    return <PlayerView state={state} />;
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
            <button
              onClick={handleToggleDisplayFullscreen}
              className="mt-3 w-full py-2.5 px-5 rounded border border-stone-700 bg-black/40 hover:border-orange-500/70 hover:text-orange-200 active:bg-stone-950 text-stone-300 font-bold text-[10px] tracking-widest uppercase cursor-pointer transition-all"
            >
              PASSER EN PLEIN ÉCRAN
            </button>
          </div>
          <div className="absolute inset-0 bg-stone-950 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-10 pointer-events-none" />
        </div>
      );
    }

    if (missionBootPhase === 'boot_idle' || missionBootPhase === 'boot_launching') {
      return (
        <BootScreenDisplay
          phase={missionBootPhase}
          launchedAt={state.missionBoot?.launchedAt}
          onReadyForIntro={handleIntroStarted}
        />
      );
    }

    if (missionBootPhase === 'intro_playing') {
      return (
        <BootIntroVideo
          onIntroStarted={handleIntroStarted}
          onIntroCompleted={handleIntroCompleted}
        />
      );
    }

    return (
      <div 
        id="player-passive-screen" 
        className="display-screen min-h-screen bg-black text-white flex flex-col justify-center items-center p-0 overflow-hidden font-mono relative select-none"
      >
        <button
          type="button"
          onClick={handleToggleDisplayFullscreen}
          className="absolute right-4 top-4 z-npc-card flex h-10 w-10 items-center justify-center border border-stone-700/70 bg-black/45 text-stone-400 opacity-35 transition hover:border-orange-400/70 hover:text-orange-200 hover:opacity-100"
          aria-label={isDisplayFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
          title={isDisplayFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
        >
          {isDisplayFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        {/* 16:9 display frame with a small horizontal safety margin for fullscreen TVs. */}
        <div className="w-[min(calc(100vw-48px),calc(100vh*16/9))] max-w-none mx-auto aspect-video relative rounded-none border-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.95)]">
          
          {isFinalTerminalActive && !state.displayOptions.screenBlack ? (
            <HollowFinalTerminal />
          ) : (
            <>
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
              {!state.displayOptions.screenBlack && (
                <HoundAlertOverlay
                  alert={state.houndAlert}
                  showCard={!state.displayOptions.activeTransmission}
                />
              )}
              <TransmissionOverlay 
                transmission={activeTransmission}
                showPortrait={state.interventionOptions.showPortrait}
                showText={state.interventionOptions.showText}
                showAudio={state.interventionOptions.playAudio}
                onStop={handleStopTransmission}
              />
              <SquadOverlay overlay={effectiveSquadOverlay} />
              <Delta6DataPackagePanel
                status={state.dataPackage?.status ?? 'non_secure'}
                visible={dataPackageDisplayEnabled}
                compact
              />
              {!state.displayOptions.screenBlack && (
                <AletheiaTerminalDisplay terminal={state.aletheiaTerminal} />
              )}
              
              {/* Subtle Overlay HUD layout featuring discrete terrain logs and stats */}
              <div className="display-status-overlay absolute pointer-events-none flex flex-col gap-1 text-[10px] 2xl:text-[11px] text-stone-400 font-mono tracking-widest uppercase bg-black/40 border border-stone-900/70 px-5 py-3 rounded-md backdrop-blur-[1px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-hud opacity-90 shadow-md">
                <div className="font-bold text-white text-[11px] border-b border-stone-800/40 pb-1 mb-1">
                  MISSION 01 // SOL ROUGE
                </div>
                <span>SITE : {activeLocation.label}</span>
                <span>SECTEUR : {activeLocation.subtitle}</span>
                <span>MODE : <strong className="text-orange-400 font-bold">{getDisplayModeLabel(currentConfig.environmentFilter)}</strong></span>
                <div className="text-emerald-400 font-medium">
                  CONNEXION TERRAIN ACTIVE
                </div>
              </div>

              <TacticalMiniMapDisplay
                tokens={tacticalTokens}
                mapImageSrc={tacticalMapImagePath}
                selectedSquadIds={state.squad?.selectedIds ?? []}
                signalLabel={signalLabel}
                visibilityLabel={visibilityLabel}
                emLabel={getEmLabel()}
                emActive={state.emStorm?.active}
                getTelemetryTextClass={getTelemetryTextClass}
              />
            </>
          )}

        </div>
        {!isFinalTerminalActive && !state.displayOptions.screenBlack && state.displayOptions.playerTacticalMapVisible && (
          <TacticalLargeMapDisplay
            tokens={tacticalTokens}
            mapImageSrc={tacticalMapImagePath}
            selectedSquadIds={state.squad?.selectedIds ?? []}
          />
        )}
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

    const filteredTacticalTokens = tacticalTokens.filter((t) => {
      if (!t.visibleInControl) return false;
      if (t.type === 'pj') {
        return state.squad?.selectedIds?.includes(t.id);
      }
      return true;
    });
    const selectedSquadTokenCount = filteredTacticalTokens.filter((token) => token.type === 'pj').length;
    const selectedSquadInVehicleCount = filteredTacticalTokens.filter((token) => token.type === 'pj' && token.inVehicle).length;
    const missionBootLabel = {
      boot_idle: 'BOOT EN ATTENTE',
      boot_launching: 'LANCEMENT',
      intro_playing: 'INTRO',
      mission_live: 'MISSION LIVE'
    }[missionBootPhase];

    return (
      <div className="h-screen overflow-hidden bg-stone-950 text-stone-100 flex flex-col p-4 md:p-6 font-sans selection:bg-orange-500/30 selection:text-orange-200">
        
        {/* Visual scanlines backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,31,18,0.06)_0%,rgba(0,0,0,0)_100%)] pointer-events-none" />
        
        {/* Header diagnostic panel */}
        <header className="w-full flex items-center justify-between border-b border-stone-850 pb-3 mb-3 select-none relative z-10 flex-shrink-0">
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
              type="button"
              onClick={handleLaunchMission}
              disabled={missionBootPhase !== 'boot_idle'}
              className={`text-[10px] font-mono py-1 px-2 rounded uppercase tracking-[0.18em] transition-all border ${
                missionBootPhase === 'boot_idle'
                  ? 'cursor-pointer border-emerald-500 bg-emerald-500/12 text-emerald-200 hover:bg-emerald-500/20'
                  : 'cursor-not-allowed border-stone-800 bg-stone-900 text-stone-500'
              }`}
              title={missionBootLabel}
            >
              {missionBootPhase === 'boot_idle' ? 'LANCER LA MISSION' : missionBootLabel}
            </button>
            <button
              type="button"
              onClick={handleTogglePlayerTacticalMap}
              className={`text-[10px] font-mono py-1 px-2 rounded uppercase tracking-[0.18em] transition-all cursor-pointer border ${
                state.displayOptions.playerTacticalMapVisible
                  ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:border-emerald-700'
              }`}
            >
              {state.displayOptions.playerTacticalMapVisible ? 'FERMER CARTE JOUEUR' : 'AFFICHER CARTE JOUEUR'}
            </button>
            <button
              type="button"
              onClick={() => setControlPanelView((current) => (current === 'squad' ? 'gm' : 'squad'))}
              className={`text-[10px] font-mono py-1 px-2 rounded uppercase tracking-[0.18em] transition-all cursor-pointer border ${controlPanelView === 'squad' ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:border-stone-700'}`}
            >
              ESCOUADE
            </button>
            <button
              type="button"
              onClick={() => setControlPanelView((current) => (current === 'map' ? 'gm' : 'map'))}
              className={`text-[10px] font-mono py-1 px-2 rounded uppercase tracking-[0.18em] transition-all cursor-pointer border ${controlPanelView === 'map' ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:border-stone-700'}`}
            >
              CARTE TACTIQUE
            </button>
          </div>
        </header>

        {/* Console layout */}
        <main className={`flex-1 min-h-0 overflow-hidden w-full flex flex-col lg:flex-row min-w-0 gap-5 relative z-10`}>
          {controlPanelView === 'gm' ? (
            <>
              <section className="lg:flex-1 lg:basis-0 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">
                <HUD 
                  config={currentConfig} 
                  onChangeConfig={handleUpdateConfig} 
                  onRefreshLoop={handleResetLoopEpoch}
                  resources={state.resources}
                  onChangeResources={handleUpdateResources}
                  activePresetId={state.displayOptions.activePresetId}
                  onChangePresetId={handleUpdatePresetId}
                  emStorm={state.emStorm}
                  missionTelemetry={state.missionTelemetry}
                  onActivateEmStorm={handleActivateEmStorm}
                  onSetEmStormSeverity={handleSetEmStormSeverity}
                  onExitEmStorm={handleExitEmStorm}
                  dataPackage={state.dataPackage}
                  onSetDataPackageStatus={handleSetDataPackageStatus}
                  onToggleDataPackageVisibility={handleToggleDataPackageVisibility}
                  activeLocation={state.activeLocation || 'delta6'}
                  onChangeLocation={handleUpdateLocation}
                  networkSyncStatus={networkSyncStatus}
                  onHoundAction={handleHoundAction}
                  houndAlert={state.houndAlert}
                  onResetMission={handleResetMission}
                  onSceneShortcut={handleSceneShortcut}
                  newCarthageLoopVariant={state.displayOptions?.newCarthageLoopVariant}
                  newCarthageLoopCounts={state.displayOptions?.newCarthageLoopCounts}
                  onChangeNewCarthageLoopVariant={handleNewCarthageLoopVariant}
                  activeDirectorSceneId={state.activeDirectorSceneId}
                  aletheiaTerminal={state.aletheiaTerminal}
                  onSendAletheiaMessage={handleSendAletheiaMessage}
                  onClearAletheiaTerminal={handleClearAletheiaTerminal}
                  onGlitchAletheiaSignal={handleGlitchAletheiaSignal}
                  onToggleAletheiaNoSignal={handleToggleAletheiaNoSignal}
                  selectedSquadIds={state.squad?.selectedIds ?? []}
                  sentPlayerIntelDeliveries={state.playerIntelDeliveries ?? []}
                  onSendPlayerIntel={handleSendPlayerIntel}
                  onClearPlayerIntel={handleClearPlayerIntel}
                  onChangeDirectorSceneId={(id: string) => {
                    const payload: MissionControlState = {
                      ...state,
                      activeDirectorSceneId: id,
                      tacticalTokens: applyTokenSceneVisibility(
                        tacticalTokens,
                        id,
                        state.squad?.selectedIds ?? []
                      )
                    };
                    commitLocalState(payload);
                  }}
                />
              </section>

              <section className="lg:flex-1 lg:basis-0 min-w-0 min-h-0 overflow-y-auto">
                <GmReaderPanel
                  activeSceneId={gmReaderSceneId}
                  onSelectScene={setGmReaderSceneId}
                />
              </section>
            </>
          ) : controlPanelView === 'squad' ? (
            <section className="flex-1 min-w-0 min-h-0">
              <SquadControlPanel
                squad={state.squad}
                squadOverlay={state.squadOverlay}
                playerEquipmentState={state.playerEquipmentState ?? createInitialPlayerEquipmentState()}
                onSelectSquadCharacter={handleSelectSquadCharacter}
                onDeselectSquadCharacter={handleDeselectSquadCharacter}
                onValidateSquad={handleValidateSquad}
                onResetSquad={handleResetSquad}
                onModifySquad={handleModifySquad}
                onToggleSquadOverlay={handleToggleSquadOverlay}
                onUpdateSquadTracker={handleUpdateSquadTracker}
                onToggleCharacterEquipmentVisible={toggleCharacterEquipmentVisible}
                onToggleCharacterEquipmentUsed={toggleCharacterEquipmentUsed}
              />
            </section>
          ) : (
            <>
              <section className="flex-1 min-w-0 min-h-0 flex">
                <TacticalMapPanel 
                  tokens={filteredTacticalTokens} 
                  mapImageSrc={tacticalMapImagePath}
                  onUpdateTokenPosition={handleUpdateTacticalTokenPosition}
                />
              </section>
              <section className="lg:w-[420px] min-w-0 min-h-0">
                <aside className="rounded-xl border border-stone-800/90 bg-stone-950/92 shadow-2xl shadow-black/35 p-4 text-stone-200 h-full flex flex-col overflow-y-auto">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-orange-400 mb-3">
                    ESPACE DE COMMANDE TACTIQUE
                  </div>

                  <button
                    onClick={handleResetTacticalTokenPositions}
                    className="w-full mb-3 text-[10px] px-3 py-2 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 uppercase tracking-widest transition-colors"
                  >
                    RÉINITIALISER POSITIONS
                  </button>
                  <button
                    onClick={handleReapplySceneTokenVisibility}
                    className="w-full mb-3 text-[10px] px-3 py-2 rounded bg-emerald-950/40 hover:bg-emerald-900/45 border border-emerald-800/70 text-emerald-200 uppercase tracking-widest transition-colors"
                  >
                    RÉAPPLIQUER VISIBILITÉ SCÈNE
                  </button>
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={handleEmbarkSelectedSquad}
                      disabled={selectedSquadTokenCount === 0 || selectedSquadInVehicleCount === selectedSquadTokenCount}
                      className={`text-[10px] px-3 py-2 rounded border uppercase tracking-widest transition-colors ${
                        selectedSquadTokenCount === 0 || selectedSquadInVehicleCount === selectedSquadTokenCount
                          ? 'cursor-not-allowed border-stone-850 bg-stone-900/40 text-stone-600'
                          : 'border-emerald-700 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/45'
                      }`}
                    >
                      EMBARQUER ESCOUADE
                    </button>
                    <button
                      onClick={handleDisembarkSelectedSquad}
                      disabled={selectedSquadInVehicleCount === 0}
                      className={`text-[10px] px-3 py-2 rounded border uppercase tracking-widest transition-colors ${
                        selectedSquadInVehicleCount === 0
                          ? 'cursor-not-allowed border-stone-850 bg-stone-900/40 text-stone-600'
                          : 'border-orange-800 bg-orange-950/30 text-orange-200 hover:bg-orange-900/35'
                      }`}
                    >
                      DÉBARQUER ESCOUADE
                    </button>
                  </div>

                  <div className="text-[12px] leading-relaxed text-stone-400 mb-3">
                    Contrôles tokens tactiques
                    {selectedSquadTokenCount > 0 && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-400">
                        {selectedSquadInVehicleCount}/{selectedSquadTokenCount} embarqué(s)
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <ul className="space-y-2">
                      {filteredTacticalTokens.map((t) => (
                        <li key={t.id} className="flex items-center justify-between bg-stone-900/40 border border-stone-800 rounded px-3 py-2">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-bold">{t.shortLabel}</div>
                            <div className="text-xs text-stone-400">{t.label}</div>
                            <div className="text-xs ml-2 px-2 py-1 rounded bg-stone-800 text-stone-300">{t.type}</div>
                            {t.type === 'pj' && t.inVehicle && (
                              <div className="text-[10px] ml-1 px-2 py-1 rounded border border-emerald-700/70 bg-emerald-950/30 text-emerald-300 uppercase tracking-wider">
                                EMBARQUÉ
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {t.type === 'pj' && (
                              <button
                                onClick={() => handleToggleTacticalTokenVehicle(t.id)}
                                className={`text-[11px] px-2 py-1 rounded uppercase ${
                                  t.inVehicle
                                    ? 'bg-orange-700 text-orange-50'
                                    : 'bg-emerald-700 text-black'
                                }`}
                              >
                                {t.inVehicle ? 'SORTIR' : 'DANS ROVER'}
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleTacticalTokenPlayerVisibility(t.id)}
                              className={`text-[11px] px-2 py-1 rounded ${t.visibleToPlayers ? 'bg-emerald-600 text-black' : 'bg-stone-800 text-stone-300'}`}
                            >
                              Joueurs: {t.visibleToPlayers ? 'ON' : 'OFF'}
                            </button>

                            <button
                              onClick={() => handleToggleTacticalTokenControlVisibility(t.id)}
                              className={`text-[11px] px-2 py-1 rounded ${t.visibleInControl ? 'bg-orange-600 text-black' : 'bg-stone-800 text-stone-300'}`}
                            >
                              Control: {t.visibleInControl ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </section>
            </>
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="w-full border-t border-stone-850 pt-3 flex justify-between items-center text-[10px] font-mono text-stone-600 uppercase select-none relative z-10 flex-shrink-0">
          <span>UESC // NEW CARTHAGE FIELD CONTROL // M01 SOL ROUGE // ACCÈS MJ SÉCURISÉ</span>
          <span>SOL ROUGE // ACCÈS MJ SÉCURISÉ</span>
        </footer>

      </div>
    );
  }

  return null;
}
