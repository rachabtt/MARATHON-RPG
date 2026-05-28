/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import Cinemagraph from './components/Cinemagraph';
import HUD from './components/HUD';
import TransmissionOverlay from './components/TransmissionOverlay';
import type { CinemagraphConfig, QuickEffectType, TransmissionType } from './types';
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
import { getLocationById, LOCATIONS, type LocationId } from './utils/locations';
import {
  connectNetworkSync,
  networkClientId,
  sendNetworkState,
  type NetworkSyncStatus
} from './utils/networkSync';
import { createMissionTransmission } from './utils/transmissions';
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
    LOCATIONS.forEach((location) => {
      const image = new Image();
      image.src = location.image;
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
    if (!transmission || !audioEngineRef.current || !currentConfig.audioEnabled || currentConfig.audioRadioSilence) return;
    if (lastTransmissionIdRef.current === transmission.id) return;
    lastTransmissionIdRef.current = transmission.id;
    audioEngineRef.current.triggerTransmissionOpen();
  }, [state.displayOptions.activeTransmission, currentConfig.audioEnabled, currentConfig.audioRadioSilence]);

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
      payload = {
        ...payload,
        activeSceneMode: 'hounds',
        effects: { ...payload.effects, hounds: 3, headlight: Math.max(payload.effects.headlight, 2) },
        audio: { ...payload.audio, houndsVolume: Math.max(payload.audio.houndsVolume, 0.85) },
        displayOptions: { ...payload.displayOptions, activePresetId: 'hounds' }
      };
    }
    commitLocalState(payload);
  };

  const handleTransmission = (type: TransmissionType) => {
    const payload: MissionControlState = {
      ...state,
      displayOptions: {
        ...state.displayOptions,
        activeTransmission: createMissionTransmission(type)
      }
    };
    commitLocalState(payload);
  };

  const handleSceneShortcut = (sceneId: string) => {
    let payload: MissionControlState = state;

    const setLocationAndPreset = (location: LocationId, presetId: string) => {
      payload = applyPreset({ ...payload, activeLocation: location }, presetId);
    };

    switch (sceneId) {
      case 'depart_new_carthage':
        setLocationAndPreset('new_carthage', 'calme');
        break;
      case 'briefing_rowe':
        setLocationAndPreset('new_carthage', 'delta6');
        payload.displayOptions.activeTransmission = createMissionTransmission('rowe');
        break;
      case 'traversee':
        setLocationAndPreset('red_plains', 'delta6');
        payload.audio.radioVolume = Math.max(payload.audio.radioVolume, 0.22);
        break;
      case 'anomalie_radio':
        setLocationAndPreset('red_plains', 'signal');
        payload = triggerQuickEffect('glitch_radio', payload);
        break;
      case 'arches_noires':
        setLocationAndPreset('black_arches', 'signal');
        break;
      case 'site_delta6':
        setLocationAndPreset('delta6', 'delta6');
        break;
      case 'hounds_proches':
        setLocationAndPreset(state.activeLocation === 'black_arches' ? 'black_arches' : 'delta6', 'hounds');
        payload = triggerQuickEffect('ombre_hound', payload);
        break;
      case 'tempete_em':
        setLocationAndPreset(state.activeLocation === 'red_plains' ? 'red_plains' : 'delta6', 'tempete');
        payload = triggerQuickEffect('flash_em', payload);
        break;
      case 'extraction':
        setLocationAndPreset(state.activeLocation === 'red_plains' ? 'red_plains' : 'delta6', 'extraction');
        break;
      case 'retour_new_carthage':
        setLocationAndPreset('new_carthage', 'delta6');
        payload.displayOptions.activeTransmission = createMissionTransmission('aletheia');
        break;
    }

    commitLocalState(payload);
  };

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
            key={loopEpochKey}
            config={currentConfig}
            imageUrl={activeLocation.image}
            onFlickerSound={handleRoverFlickerSound}
            onScannerSound={handleScannerPulseSound}
          />
          <TransmissionOverlay transmission={state.displayOptions.activeTransmission} />
          
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
                imageUrl={activeLocation.image}
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
              onSceneShortcut={handleSceneShortcut}
            />
          </section>

        </main>

        {/* Minimal Footer */}
        <footer className="max-w-7xl w-full mx-auto border-t border-stone-850 pt-3 mt-5 flex justify-between items-center text-[10px] font-mono text-stone-600 uppercase select-none relative z-10">
          <span>UESC // CONNERIE DU SIGNAL ET DU ROVER // M01 CONTROLLER</span>
          <span>SOL ROUGE // ACCÈS MJ SÉCURISÉ</span>
        </footer>

      </div>
    );
  }

  return null;
}
