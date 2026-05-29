/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CinemagraphConfig, TelemetryLog, AtmosphereReading, TransmissionType, InterventionOptions, SquadOverlayState, SquadMember } from '../types';
import { PRESETS, Preset } from '../utils/presets';
import { ResourceState } from '../utils/syncState';
import { LOCATIONS, type LocationId } from '../utils/locations';
import type { NetworkSyncStatus } from '../utils/networkSync';
import { TRANSMISSION_SPEAKERS } from '../utils/transmissions';
import { STORY_BEATS } from '../utils/storyBeats';
// telemetryLogs not required for HUD core UI after removing advanced panel
import { 
  VolumeX,
  RefreshCw,
  Power,
  Volume2,
  Waves,
  Radio,
  Binary,
  Flame,
  Zap
} from 'lucide-react';

interface HUDProps {
  config: CinemagraphConfig;
  onChangeConfig: (newConfig: CinemagraphConfig) => void;
  onRefreshLoop: () => void;
  resources: ResourceState[];
  onChangeResources: (newResources: ResourceState[]) => void;
  activePresetId: string;
  onChangePresetId: (id: string) => void;
  activeLocation: LocationId;
  onChangeLocation: (location: LocationId) => void;
  networkSyncStatus: NetworkSyncStatus;
  onQuickAction: (actionId: string) => void;
  onTransmission: (type: TransmissionType) => void;
  interventionOptions: InterventionOptions;
  onToggleInterventionOption: (key: keyof InterventionOptions) => void;
  onClearTransmission: () => void;
  squadOverlay: SquadOverlayState;
  onToggleSquadOverlay: () => void;
  onSetSquadOverlayMode: (mode: SquadOverlayState['mode']) => void;
  onUpdateSquadMember: (memberId: string, changes: Partial<SquadMember>) => void;
  onMoveSquadMember: (memberId: string, direction: -1 | 1) => void;
  onResetTrackers?: () => void;
  onResetMission?: () => void;
  onSceneShortcut: (sceneId: string) => void;
}

export default function HUD({ 
  config, 
  onChangeConfig, 
  onRefreshLoop,
  resources,
  onChangeResources,
  activePresetId,
  onChangePresetId,
  activeLocation,
  onChangeLocation,
  networkSyncStatus,
  onQuickAction,
  onTransmission,
  interventionOptions,
  onToggleInterventionOption,
  onClearTransmission,
  squadOverlay,
  onToggleSquadOverlay,
  onSetSquadOverlayMode,
  onMoveSquadMember,
  onSceneShortcut
}: HUDProps) {
  const [locationImageStatus, setLocationImageStatus] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  const updateSetting = <K extends keyof CinemagraphConfig>(key: K, value: CinemagraphConfig[K]) => {
    onChangeConfig({
      ...config,
      [key]: value
    });
  };

  const handleResourceClick = (resId: string, forward: boolean = true) => {
    const updated = resources.map(res => {
      if (res.id === resId) {
        let nextIndex = forward ? res.index + 1 : res.index - 1;
        if (nextIndex >= res.states.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = res.states.length - 1;
        return {
          ...res,
          index: nextIndex
        };
      }
      return res;
    });
    onChangeResources(updated);
  };

  const applyPresetMacro = (presetId: string) => {
    onChangePresetId(presetId);
  };

  const getModeLabel = (filter: string) => {
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

  const getAmbianceLabel = (presetId: string) => {
    switch (presetId) {
      case 'calme': return 'CALME';
      case 'delta6': return 'TENSION';
      case 'signal': return 'SIGNAL INSTABLE';
      case 'tempete': return 'TEMPÊTE EM';
      case 'extraction': return 'EXTRACTION';
      case 'silence': return 'SILENCE RADIO';
      case 'scanner': return 'SCANNER ACTIF';
      case 'hounds': return 'HOUNDS PROCHES';
      default: return getModeLabel(config.environmentFilter);
    }
  };

  const activeLocationInfo = LOCATIONS.find((location) => location.id === activeLocation) ?? LOCATIONS[3];

  const getShortResourceName = (id: string) => {
    switch (id) {
      case 'integrity': return 'Rover';
      case 'energy': return 'Énergie';
      case 'signal': return 'Radio';
      case 'visibility': return 'Visibilité';
      case 'tempest': return 'Tempête';
      case 'data': return 'Données';
      case 'survivor': return 'Survivant';
      case 'calm': return 'Groupe';
      default: return id;
    }
  };

  // --- Simple Level Mappings for Advanced Panel ---
  const getLevel = (type: 'dust' | 'glitch' | 'scanner' | 'headlight' | 'volume'): number => {
    switch (type) {
      case 'dust':
        if (config.dustDensity <= 20) return 0;
        if (config.dustDensity <= 100) return 1;
        if (config.dustDensity <= 200) return 2;
        return 3;
      case 'glitch':
        if (config.visualRadioGlitch <= 0.05) return 0;
        if (config.visualRadioGlitch <= 0.35) return 1;
        if (config.visualRadioGlitch <= 0.70) return 2;
        return 3;
      case 'scanner':
        if (config.scannerPulseSpeed <= 0.4) return 0;
        if (config.scannerPulseSpeed <= 1.5) return 1;
        if (config.scannerPulseSpeed <= 3.0) return 2;
        return 3;
      case 'headlight':
        if (config.headlightIntensity <= 0.1) return 0;
        if (config.headlightIntensity <= 0.5) return 1;
        if (config.headlightIntensity <= 1.0) return 2;
        return 3;
      case 'volume':
        if (!config.audioEnabled) return 0;
        if (config.audioWindVolume <= 0.25) return 1;
        if (config.audioWindVolume <= 0.60) return 2;
        return 3;
    }
  };

  const setLevel = (type: 'dust' | 'glitch' | 'scanner' | 'headlight' | 'volume', level: number) => {
    const changes: Partial<CinemagraphConfig> = {};
    switch (type) {
      case 'dust':
        changes.dustDensity = level === 0 ? 10 : level === 1 ? 90 : level === 2 ? 180 : 300;
        break;
      case 'glitch':
        changes.visualRadioGlitch = level === 0 ? 0.0 : level === 1 ? 0.25 : level === 2 ? 0.60 : 0.95;
        changes.audioRadioVolume = level === 0 ? 0.0 : level === 1 ? 0.20 : level === 2 ? 0.50 : 0.85;
        break;
      case 'scanner':
        changes.scannerPulseSpeed = level === 0 ? 0.2 : level === 1 ? 1.0 : level === 2 ? 2.5 : 4.0;
        if (level === 0) changes.audioScannerVolume = 0.0;
        else changes.audioScannerVolume = level === 1 ? 0.25 : level === 2 ? 0.50 : 0.80;
        break;
      case 'headlight':
        changes.headlightIntensity = level === 0 ? 0.0 : level === 1 ? 0.40 : level === 2 ? 0.80 : 1.40;
        break;
      case 'volume':
        if (level === 0) {
          changes.audioEnabled = false;
        } else {
          changes.audioEnabled = true;
          const multi = level === 1 ? 0.25 : level === 2 ? 0.55 : 0.90;
          changes.audioWindVolume = 0.50 * multi;
          changes.audioHumVolume = 0.40 * multi;
          changes.audioRadioVolume = 0.30 * multi;
          changes.audioStormVolume = 0.45 * multi;
        }
        break;
    }
    onChangeConfig({
      ...config,
      ...changes
    });
  };

  const interventionOptionButtons: Array<{ key: keyof InterventionOptions; label: string; active: boolean }> = [
    { key: 'showPortrait', label: 'PORTRAIT', active: interventionOptions.showPortrait },
    { key: 'showText', label: 'TEXTE', active: interventionOptions.showText },
    { key: 'playAudio', label: 'AUDIO', active: interventionOptions.playAudio }
  ];

  const SQUAD_STATUS_OPTIONS = ['OK', 'BLESSÉ', 'ÉPUISÉ', 'ISOLÉ', 'RADIO COUPÉE', 'INCONSCIENT', 'KO'];

  const updateSquadMember = (memberId: string, changes: Partial<SquadMember>) => {
    onUpdateSquadMember(memberId, changes);
  };

  const handleToggleMemberVisibility = (memberId: string, currentVisibility: boolean) => {
    updateSquadMember(memberId, { visible: !currentVisibility });
  };

  const handleStatusChange = (memberId: string, status: string) => {
    updateSquadMember(memberId, { status });
  };

  const handleEquipmentChange = (memberId: string, equipment: string) => {
    updateSquadMember(memberId, { equipment: [equipment] });
  };

  const handleNoteChange = (memberId: string, note: string) => {
    updateSquadMember(memberId, { note });
  };

  const handleStatValueChange = (member: SquadMember, statKey: string, value: string) => {
    updateSquadMember(member.id, {
      stats: {
        ...member.stats,
        [statKey]: value
      }
    });
  };

  // --- Clean Audio Mixer States ---
  const isMasterOn = config.audioEnabled;
  const toggleMaster = () => updateSetting('audioEnabled', !isMasterOn);

  const isWindOn = config.audioWindVolume > 0.05;
  const toggleWind = () => updateSetting('audioWindVolume', isWindOn ? 0.0 : 0.45);

  const isRadioOn = config.audioRadioVolume > 0.05;
  const toggleRadio = () => updateSetting('audioRadioVolume', isRadioOn ? 0.0 : 0.35);

  const isScannerOn = config.audioScannerVolume > 0.05;
  const toggleScanner = () => updateSetting('audioScannerVolume', isScannerOn ? 0.0 : 0.35);

  const isHumOn = config.audioHumVolume > 0.05;
  const toggleHum = () => updateSetting('audioHumVolume', isHumOn ? 0.0 : 0.40);

  const isStormOn = config.audioStormVolume > 0.05;
  const toggleStorm = () => updateSetting('audioStormVolume', isStormOn ? 0.0 : 0.50);

  const isHoundsOn = config.audioHoundsVolume > 0.05;
  const toggleHounds = () => updateSetting('audioHoundsVolume', isHoundsOn ? 0.0 : 0.45);

  return (
    <div className="w-full bg-stone-950 border border-stone-900 rounded-lg p-3 sm:p-5 shadow-2xl font-mono text-stone-300 select-none">
      
      {/* 1. HEADER COMPACT */}
      <div className="bg-stone-900 border border-stone-850 p-3 rounded flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[12px] font-bold text-white tracking-[0.15em]">MISSION 01 // SOL ROUGE</span>
          </div>
          <div className="text-[10px] text-stone-500 tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>SITE ACTIF : <strong className="text-orange-400 font-bold uppercase">{activeLocationInfo.label}</strong></span>
            <span className="text-stone-700">|</span>
            <span>AMBIANCE ACTIVE : <strong className="text-emerald-400 font-bold uppercase">{getAmbianceLabel(activePresetId)}</strong></span>
            <span className="text-stone-700">|</span>
            <span>
              SYNC RÉSEAU : <strong className={`font-bold uppercase ${
                networkSyncStatus === 'connected' ? 'text-emerald-400' : 'text-amber-500'
              }`}>
                {networkSyncStatus === 'connected' ? 'CONNECTÉ' : 'DÉCONNECTÉ'}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex gap-1.5">
          {/* SILENCE RADIO BUTTON */}
          <button
            onClick={() => updateSetting('audioRadioSilence', !config.audioRadioSilence)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 border rounded text-[10px] tracking-wider transition-all cursor-pointer ${
              config.audioRadioSilence
                ? 'border-red-600 bg-red-950/45 text-red-500 font-bold animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.2)]'
                : 'border-stone-850 bg-stone-950/20 text-stone-500 hover:text-stone-300'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>SILENCE RADIO</span>
          </button>

          {/* ÉCRAN NOIR BUTTON */}
          <button
            onClick={() => updateSetting('screenBlack', !config.screenBlack)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 border rounded text-[10px] tracking-wider transition-all cursor-pointer ${
              config.screenBlack
                ? 'border-orange-500 bg-orange-950/45 text-orange-400 font-bold shadow-[0_0_6px_rgba(245,158,11,0.2)]'
                : 'border-stone-850 bg-stone-950/20 text-stone-500 hover:text-stone-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>ÉCRAN NOIR</span>
          </button>
        </div>
      </div>

      {/* 2. BLOC LIEUX */}
      <div className="space-y-1.5 mb-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-850 pb-1 flex justify-between items-center">
          <span>LIEUX DE LA MISSION 01 (CARTES VISUELLES MJ)</span>
          <span className="text-[9px] text-stone-600">MISSION 01</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {LOCATIONS.map((loc) => {
            const isActive = activeLocation === loc.id;
            return (
              <button
                key={loc.id}
                id={`location-card-${loc.id}`}
                onClick={() => onChangeLocation(loc.id)}
                className={`group flex flex-col rounded overflow-hidden border text-left transition-all duration-300 select-none cursor-pointer ${
                  isActive
                    ? 'border-orange-500 bg-orange-950/25 ring-1 ring-orange-500/30'
                    : 'border-stone-900 bg-stone-900/30 hover:border-stone-800'
                }`}
                style={{
                  boxShadow: isActive ? '0 0 12px rgba(245, 158, 11, 0.15)' : 'none'
                }}
              >
                {/* Thumbnail Frame */}
                <div className="h-14 sm:h-16 w-full relative overflow-hidden bg-stone-950 border-b border-stone-900/60 flex items-center justify-center">
                  {locationImageStatus[loc.id] === 'error' ? (
                    <div className="w-full h-full flex items-center justify-center bg-black text-[8px] text-rose-500 font-mono tracking-widest uppercase text-center px-2">
                      IMAGE MANQUANTE
                    </div>
                  ) : (
                    <img
                      src={loc.image}
                      alt={loc.label}
                      onLoad={() => setLocationImageStatus(prev => ({ ...prev, [loc.id]: 'loaded' }))}
                      onError={() => {
                        setLocationImageStatus(prev => ({ ...prev, [loc.id]: 'error' }));
                      }}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        isActive ? 'opacity-90 saturate-[1.15]' : 'opacity-45 grayscale group-hover:opacity-75 group-hover:grayscale-0'
                      }`}
                    />
                  )}
                  {/* Blinking indicator LED */}
                  {isActive && (
                    <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                    </span>
                  )}
                </div>

                {/* Information */}
                <div className="p-2 flex flex-col justify-between flex-1 min-h-[54px] bg-stone-950/40">
                  <div>
                    <span className={`text-[10px] tracking-wider font-bold block ${isActive ? 'text-orange-400' : 'text-stone-400 group-hover:text-stone-200'}`}>
                      {loc.label}
                    </span>
                    <span className="text-[8px] text-stone-500 block leading-tight mt-0.5">
                      {loc.subtitle}
                    </span>
                    {/* Discrete debug indicator */}
                    <div className="mt-1.5 flex items-center gap-1.5 border-t border-stone-900/45 pt-1">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        locationImageStatus[loc.id] === 'loaded' 
                          ? 'bg-emerald-500' 
                          : locationImageStatus[loc.id] === 'error' 
                          ? 'bg-rose-500 animate-pulse' 
                          : 'bg-stone-600'
                      }`} />
                      <span className={`text-[7px] font-mono tracking-wider uppercase ${
                        locationImageStatus[loc.id] === 'loaded' 
                          ? 'text-emerald-500/80 font-semibold' 
                          : locationImageStatus[loc.id] === 'error' 
                          ? 'text-rose-500/80 animate-pulse font-semibold' 
                          : 'text-stone-500'
                      }`}>
                        {locationImageStatus[loc.id] === 'loaded' && 'image loaded'}
                        {locationImageStatus[loc.id] === 'error' && 'image missing'}
                        {!locationImageStatus[loc.id] && 'loading...'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BLOC AMBIANCES */}
      <div className="space-y-1.5 mb-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-850 pb-1">
          AMBIANCES ACTIVES
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {[
            { id: 'calme', label: 'CALME' },
            { id: 'delta6', label: 'TENSION' },
            { id: 'signal', label: 'SIGNAL INSTABLE' },
            { id: 'tempete', label: 'TEMPÊTE EM' },
            { id: 'extraction', label: 'EXTRACTION' }
          ].map((scene) => {
            const isActive = activePresetId === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => applyPresetMacro(scene.id)}
                className={`h-11 px-2.5 rounded border transition-all uppercase select-none cursor-pointer text-center flex flex-col justify-center items-center text-[10px] tracking-wider ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                    : 'border-stone-900 bg-stone-900/40 text-stone-500 hover:border-stone-800 hover:text-stone-300'
                }`}
              >
                {scene.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. BLOC RESSOURCES */}
      <div className="space-y-1.5 mb-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-850 pb-1">
          RESSOURCES DE L'ÉCURIE
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {resources.map((res) => {
            const currentState = res.states[res.index];
            const color = res.colors[res.index];
            
            let textClass = "text-stone-500";
            let borderClass = "border-stone-900 bg-stone-950/40 hover:border-stone-850";
            let dotClass = "bg-stone-800";

            if (color === 'emerald') {
              textClass = "text-emerald-500 font-bold";
              borderClass = "border-emerald-950/60 bg-emerald-950/10 hover:border-emerald-900/40";
              dotClass = "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]";
            } else if (color === 'amber') {
              textClass = "text-amber-500 font-bold";
              borderClass = "border-amber-950/60 bg-amber-950/10 hover:border-amber-900/40";
              dotClass = "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)]";
            } else if (color === 'red') {
              textClass = "text-red-500 font-extrabold animate-pulse";
              borderClass = "border-red-950/70 bg-red-950/15 hover:border-red-900/40";
              dotClass = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse";
            } else if (color === 'stone') {
              textClass = "text-stone-600";
              borderClass = "border-stone-950 bg-stone-950/10 hover:border-stone-900";
              dotClass = "bg-stone-700";
            }

            return (
              <button
                key={res.id}
                onClick={() => handleResourceClick(res.id, true)}
                className={`h-14 flex flex-col justify-between p-2 rounded transition-all cursor-pointer text-left border relative ${borderClass}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider truncate">
                    {getShortResourceName(res.id)}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                </div>
                <div className="flex items-center justify-between w-full mt-1 border-t border-stone-900/40 pt-1 text-[9.5px] uppercase tracking-wide truncate">
                  <span className={textClass}>
                    {currentState}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. BLOC ACTIONS RAPIDES */}
      <div className="space-y-1.5 mb-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-850 pb-1">
          ACTIONS RAPIDES
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-1.5">
          {[
            { id: 'glitch_radio', label: 'GLITCH RADIO', color: 'hover:border-purple-500 hover:text-purple-400' },
            { id: 'flash_em', label: 'FLASH EM', color: 'hover:border-amber-500 hover:text-amber-400' },
            { id: 'ombre_hound', label: 'OMBRE HOUND', color: 'hover:border-red-500 hover:text-red-400' },
            { id: 'intervention', label: 'INTERVENTION', color: 'hover:border-sky-500 hover:text-sky-400' },
            { id: 'reset_calme', label: 'RESET CALME', color: 'hover:border-emerald-500 hover:text-emerald-400' }
          ].map((action) => (
            <button
              key={action.id}
              onClick={() => onQuickAction(action.id)}
              className={`h-11 px-3 rounded border border-stone-900 bg-stone-900/30 text-stone-400 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center ${action.color}`}
            >
              {action.label}
            </button>
          ))}
        </div>
        

        <div className="space-y-1.5 mb-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-850 pb-1 flex items-center justify-between">
            <span>ESCOUADE PJ</span>
            <button
              onClick={onToggleSquadOverlay}
              className={`h-10 text-[12px] font-bold uppercase tracking-wider px-3 rounded border transition-all ${
                squadOverlay.visible
                  ? 'border-emerald-500 bg-emerald-600/12 text-emerald-300'
                  : 'border-stone-900 bg-stone-900/20 text-stone-200 hover:border-stone-800 hover:text-stone-300'
              }`}
            >
              {squadOverlay.visible ? 'MASQUER ESCOUADE' : 'AFFICHER ESCOUADE'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {([
              { mode: 'compact' as const, label: 'COMPACT' },
              { mode: 'detail' as const, label: 'DÉTAIL' }
            ]).map((option) => (
              <button
                key={option.mode}
                onClick={() => onSetSquadOverlayMode(option.mode)}
                className={`h-10 rounded border text-[9px] font-bold tracking-wider uppercase transition-all ${
                  squadOverlay.mode === option.mode
                    ? 'border-emerald-500 bg-emerald-950/15 text-emerald-300'
                    : 'border-stone-900 bg-stone-900/20 text-stone-500 hover:border-stone-800 hover:text-stone-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {squadOverlay.members.map((member) => (
              <div key={member.id} className="rounded-2xl border border-stone-900/80 bg-stone-950/85 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white truncate">{member.name}</div>
                    <div className="text-[8.5px] uppercase tracking-[0.2em] text-stone-500 truncate">{member.role}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleMemberVisibility(member.id, member.visible)}
                      className={`h-10 px-3 rounded border text-[12px] font-semibold uppercase tracking-[0.2em] transition-all ${
                        member.visible
                          ? 'border-emerald-500 bg-emerald-600/12 text-emerald-300'
                          : 'border-stone-700 bg-stone-900/20 text-stone-400 hover:border-stone-600 hover:text-stone-300'
                      }`}
                    >
                      {member.visible ? 'VISIBLE' : 'MASQUÉ'}
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="block text-[9px] uppercase tracking-[0.24em] text-stone-400">
                    STATUT
                    <select
                      value={member.status}
                      onChange={(event) => handleStatusChange(member.id, event.target.value)}
                      className="mt-1 w-full rounded border border-stone-800 bg-stone-900 px-2 py-1 text-[10px] text-white"
                    >
                      {SQUAD_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>

                  <div className="flex flex-col gap-2">
                    <div className="text-[9px] uppercase tracking-[0.22em] text-stone-400">Trackers</div>
                    <div className="flex gap-2">
                      {['stress','bruit','blessures'].map((t) => (
                        <div key={t} className="rounded-2xl border border-stone-800/80 bg-stone-950/70 p-2 text-center w-1/3">
                          <div className="flex items-center justify-center gap-2">
                            {t === 'stress' ? <Zap className="w-4 h-4 text-amber-400" /> : t === 'bruit' ? <Waves className="w-4 h-4 text-sky-400" /> : <div className="text-orange-400">✚</div>}
                            <div className="text-[9px] text-stone-400 uppercase">{t.toUpperCase()}</div>
                          </div>
                          <div className="mt-1 flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                const trackers = { ...(member as any).trackers || { stress:0, bruit:0, blessures:0 } };
                                trackers[t] = Math.max(0, (trackers as any)[t] - 1);
                                updateSquadMember(member.id, { trackers });
                              }}
                              className="px-3 py-2 rounded border border-stone-800 text-sm"
                            >-</button>
                            <div className="w-8 text-white font-bold text-sm">{((member as any).trackers && (member as any).trackers[t]) ?? 0}</div>
                            <button
                              onClick={() => {
                                const trackers = { ...(member as any).trackers || { stress:0, bruit:0, blessures:0 } };
                                const max = t === 'blessures' ? 3 : 5;
                                trackers[t] = Math.min(max, ((trackers as any)[t] || 0) + 1);
                                updateSquadMember(member.id, { trackers });
                              }}
                              className="px-3 py-2 rounded border border-stone-800 text-sm"
                            >+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSetSquadOverlayMode('detail');
                    }}
                    className="px-3 py-2 rounded bg-sky-700 text-white text-[12px]"
                  >
                    FOCUS PJ
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onResetTrackers && onResetTrackers()}
              className="px-3 py-2 rounded bg-stone-800 text-stone-200 text-[12px]"
            >
              REMETTRE JAUGES PJ À ZÉRO
            </button>
            <button
              onClick={() => onResetMission && onResetMission()}
              className="px-3 py-2 rounded bg-red-700 text-white text-[12px] ml-auto"
            >
              RÉINITIALISER PARTIE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[72px_1fr] gap-2 rounded border border-stone-900 bg-stone-950/30 p-2">
          <div className="relative h-14 rounded border border-stone-800 bg-stone-950 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.32)_50%)] bg-[size:100%_4px] opacity-60" />
            <div className="absolute left-1/2 top-[42%] w-7 h-9 -translate-x-1/2 -translate-y-1/2 rounded-t-full bg-stone-600/35" />
            <div className="absolute left-2 right-2 bottom-2 h-1 bg-orange-400/55" />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="text-[9px] text-stone-500 uppercase tracking-widest">APERÇU INTERVENTION</div>
            <div className="text-[10px] text-stone-300 uppercase tracking-wider truncate">
              {TRANSMISSION_SPEAKERS.rowe.label} / {TRANSMISSION_SPEAKERS.rowe.role}
            </div>
            <div className="text-[9px] text-stone-600 mt-1">
              Carte tactique UESC avec silhouette, waveform et qualité signal.
            </div>
          </div>
        </div>
      </div>

      {/* 6. SCÈNES M01 */}
      <div className="space-y-1.5 mb-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-850 pb-1">
          SCÈNES M01
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {STORY_BEATS.map((beat) => (
            <button
              key={beat.id}
              onClick={() => onSceneShortcut(beat.id)}
              className="h-9 px-2 rounded border border-stone-900 bg-stone-900/25 text-stone-500 hover:text-orange-400 hover:border-orange-900/60 text-[8.5px] font-bold tracking-wide uppercase transition-all cursor-pointer"
            >
              {beat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 7. BLOC AUDIO */}
      <div className="space-y-1.5 mb-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-850 pb-1 flex justify-between items-center">
          <span>AUDIO MIXER</span>
          <button 
            onClick={toggleMaster}
            className={`px-2 py-0.5 border rounded text-[8px] font-mono tracking-wider transition-all cursor-pointer ${
              isMasterOn 
                ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400 font-bold' 
                : 'border-stone-800 text-stone-600'
            }`}
          >
            {isMasterOn ? 'AUDIO ON' : 'AUDIO OFF'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
          {[
            { label: 'AUDIO ON/OFF', active: isMasterOn, toggle: toggleMaster },
            { label: 'VENT', active: isWindOn, toggle: toggleWind },
            { label: 'RADIO', active: isRadioOn, toggle: toggleRadio },
            { label: 'BASSE', active: isHumOn, toggle: toggleHum },
            { label: 'TEMPÊTE', active: isStormOn, toggle: toggleStorm },
            { label: 'HOUNDS', active: isHoundsOn, toggle: toggleHounds }
          ].map((ch, idx) => {
            // Master button acts special, other channels get disabled state if master is off
            const disabledState = !isMasterOn && idx !== 0;
            return (
              <button
                key={idx}
                onClick={ch.toggle}
                disabled={disabledState}
                className={`h-11 flex items-center justify-between px-3 rounded border font-mono text-[9.5px] tracking-wider transition-all select-none cursor-pointer uppercase ${
                  ch.active
                    ? 'border-emerald-500 bg-emerald-950/15 text-emerald-400 font-bold shadow-[0_0_6px_rgba(16,185,129,0.1)]'
                    : 'border-stone-900 bg-stone-900/20 text-stone-500'
                } disabled:opacity-20`}
              >
                <span>{ch.label}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${ch.active && !disabledState ? 'bg-emerald-500 animate-pulse' : 'bg-stone-800'}`} />
              </button>
            );
          })}
        </div>
      </div>

      

    </div>
  );
}
