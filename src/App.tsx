/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import Cinemagraph from './components/Cinemagraph';
import HUD from './components/HUD';
import { CinemagraphConfig } from './types';
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

import tauCetiBase from './assets/images/tau_ceti_base_1779960769896.png';

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
  
  const audioEngineRef = useRef<SciFiAudioEngine | null>(null);

  // Initialize Web Audio Engine
  useEffect(() => {
    audioEngineRef.current = new SciFiAudioEngine();
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

  // Sync Audio Engine values dynamically matching active route configuration
  const currentConfig = deriveConfigFromState(state);
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
        currentConfig.audioStormVolume
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
    currentConfig.audioStormVolume
  ]);

  // Handle local state modifiers using the serializable state patterns
  const handleUpdateConfig = (newConfig: CinemagraphConfig) => {
    const payload: MissionControlState = { 
      ...state, 
      activeSceneMode: newConfig.environmentFilter,
      audio: {
        enabled: newConfig.audioEnabled,
        windVolume: newConfig.audioWindVolume,
        radioVolume: newConfig.audioRadioVolume,
        scannerVolume: newConfig.audioScannerVolume,
        humVolume: newConfig.audioHumVolume,
        stormVolume: newConfig.audioStormVolume,
        radioSilence: newConfig.audioRadioSilence
      },
      displayOptions: {
        ...state.displayOptions,
        screenBlack: newConfig.screenBlack
      }
    };
    setState(payload);
    saveStoredState(payload);
    broadcastStateChange(payload);
  };

  const handleUpdateResources = (newResources: ResourceState[]) => {
    const payload = { ...state, resources: newResources };
    setState(payload);
    saveStoredState(payload);
    broadcastStateChange(payload);
  };

  const handleUpdatePresetId = (id: string) => {
    const payload = applyPreset(state, id);
    setState(payload);
    saveStoredState(payload);
    broadcastStateChange(payload);
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
            imageUrl={tauCetiBase}
            onFlickerSound={handleRoverFlickerSound}
            onScannerSound={handleScannerPulseSound}
          />
          
          {/* Subtle Overlay HUD layout featuring discrete terrain logs and stats */}
          <div className="absolute top-[8%] left-[4%] pointer-events-none flex flex-col gap-1 text-[10px] text-stone-400 font-mono tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-30 opacity-90">
            <div className="flex items-center gap-1.5 font-bold text-white text-[11px] border-b border-stone-800/40 pb-1 mb-1">
              <span className="w-1.5 h-3 bg-orange-500 rounded-sm inline-block" />
              MISSION 01 // SOL ROUGE
            </div>
            <span>SITE SURVEY : DELTA-6</span>
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

          {/* Quick exit shortcut overlay (visible briefly on hover/movement only, for desktop window controls) */}
          <div className="absolute bottom-5 left-[50%] -translate-x-[50%] opacity-0 hover:opacity-85 transition-all duration-200 z-55">
            <button 
              onClick={() => navigate('home')}
              className="py-1.5 px-3 rounded bg-stone-900/90 border border-stone-700/60 font-mono text-[10px] text-stone-400 hover:text-white uppercase tracking-widest cursor-pointer"
            >
              [ RETOUR AU SÉLECTEUR DE ROUTE ]
            </button>
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
                imageUrl={tauCetiBase}
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
