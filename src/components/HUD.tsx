/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CinemagraphConfig, TelemetryLog, AtmosphereReading, TransmissionType } from '../types';
import { PRESETS, Preset } from '../utils/presets';
import { ResourceState } from '../utils/syncState';
import { LOCATIONS, type LocationId } from '../utils/locations';
import type { NetworkSyncStatus } from '../utils/networkSync';
import { TRANSMISSION_SPEAKERS } from '../utils/transmissions';
import { generateProceduralLog, CREW_LOGS, ATMOSPHERE_BASE } from '../utils/telemetryLogs';
import { 
  VolumeX, 
  RefreshCw,
  Power,
  ChevronDown,
  ChevronUp,
  Volume2,
  Sliders,
  Terminal,
  FileText,
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
  onSceneShortcut
}: HUDProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activeAdvancedTab, setActiveAdvancedTab] = useState<'levels' | 'diagnostics' | 'crew_logs'>('levels');
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [atmosphere, setAtmosphere] = useState<AtmosphereReading>(ATMOSPHERE_BASE);
  const [logCounter, setLogCounter] = useState(0);
  const [locationImageStatus, setLocationImageStatus] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  // Synchronise dynamic sensor logs in background (cached under Advanced)
  useEffect(() => {
    const initialLogs: TelemetryLog[] = [];
    for (let i = 0; i < 6; i++) {
      initialLogs.unshift(generateProceduralLog(i));
    }
    setLogs(initialLogs);
    setLogCounter(6);

    const interval = setInterval(() => {
      setLogCounter((prev) => {
        const next = prev + 1;
        const newLog = generateProceduralLog(next);
        setLogs((current) => [newLog, ...current.slice(0, 49)]);
        
        setAtmosphere((currentAtm) => {
          const change = (Math.random() - 0.5) * 0.15;
          return {
            ...currentAtm,
            pressure: parseFloat((ATMOSPHERE_BASE.pressure + change * 0.5).toFixed(2)),
            temp: parseFloat((ATMOSPHERE_BASE.temp + change * 2.0).toFixed(1))
          };
        });
        
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {[
            { type: 'rowe', label: 'ROWE' },
            { type: 'aletheia', label: 'ALETHEIA' },
            { type: 'survivor', label: 'SURVIVANT' },
            { type: 'log_delta6', label: 'LOG D-6' },
            { type: 'unknown_radio', label: 'RADIO ?' }
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => onTransmission(item.type as TransmissionType)}
              className="h-8 px-2 rounded border border-stone-900 bg-stone-950/35 text-stone-500 hover:text-sky-400 hover:border-sky-900/70 text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer"
            >
              {item.label}
            </button>
          ))}
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
          {[
            { id: 'depart_new_carthage', label: 'DÉPART NC' },
            { id: 'briefing_rowe', label: 'BRIEFING ROWE' },
            { id: 'traversee', label: 'TRAVERSÉE' },
            { id: 'anomalie_radio', label: 'ANOMALIE RADIO' },
            { id: 'arches_noires', label: 'ARCHES NOIRES' },
            { id: 'site_delta6', label: 'SITE DELTA-6' },
            { id: 'hounds_proches', label: 'HOUNDS PROCHES' },
            { id: 'tempete_em', label: 'TEMPÊTE EM' },
            { id: 'extraction', label: 'EXTRACTION' },
            { id: 'retour_new_carthage', label: 'RETOUR NC' }
          ].map((scene) => (
            <button
              key={scene.id}
              onClick={() => onSceneShortcut(scene.id)}
              className="h-9 px-2 rounded border border-stone-900 bg-stone-900/25 text-stone-500 hover:text-orange-400 hover:border-orange-900/60 text-[8.5px] font-bold tracking-wide uppercase transition-all cursor-pointer"
            >
              {scene.label}
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

      {/* 8. BLOC AVANCÉ */}
      <div className="mt-6 border border-stone-900 bg-stone-900/20 rounded">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-stone-500 hover:text-stone-300 transition-colors text-[10px] font-bold tracking-widest uppercase cursor-pointer"
        >
          <span>[07] PARAMÈTRES AVANCÉS</span>
          {isAdvancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isAdvancedOpen && (
          <div className="border-t border-stone-900 p-4 space-y-4">
            
            {/* Advanced Navigation Tabs */}
            <div className="flex gap-2 p-0.5 bg-stone-950 border border-stone-900 rounded">
              {[
                { type: 'levels', label: 'INTENSITÉS DISCRÈTES', icon: <Sliders className="w-3 h-3" /> },
                { type: 'diagnostics', label: 'TÉLÉMÉTRIE SENSEURS', icon: <Terminal className="w-3 h-3" /> },
                { type: 'crew_logs', label: 'TRANSCRIPTIONS SOL ROUGE', icon: <FileText className="w-3 h-3" /> }
              ].map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => setActiveAdvancedTab(tab.type as any)}
                  className={`flex-1 py-1 flex items-center justify-center gap-1.5 text-[9px] font-bold tracking-wide transition-all cursor-pointer rounded ${
                    activeAdvancedTab === tab.type
                      ? 'bg-stone-900 text-emerald-400 font-bold border border-stone-800'
                      : 'text-stone-600 hover:text-stone-400'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Advanced Sub-Tab Content: Discrete 0-3 sliders */}
            {activeAdvancedTab === 'levels' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { type: 'dust', label: 'Intensité poussière', icon: <Waves className="w-3.5 h-3.5 text-blue-500" /> },
                  { type: 'glitch', label: 'Intensité glitch', icon: <Radio className="w-3.5 h-3.5 text-purple-500" /> },
                  { type: 'scanner', label: 'Intensité scanner', icon: <Binary className="w-3.5 h-3.5 text-orange-500" /> },
                  { type: 'headlight', label: 'Intensité phares', icon: <Power className="w-3.5 h-3.5 text-yellow-500" /> },
                  { type: 'volume', label: 'Volume global', icon: <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> },
                ].map((effect) => {
                  const currentVal = getLevel(effect.type as any);
                  return (
                    <div key={effect.type} className="flex items-center justify-between p-2.5 bg-stone-950 border border-stone-900 rounded">
                      <div className="flex items-center gap-2">
                        {effect.icon}
                        <span className="text-[9.5px] font-bold text-stone-400 uppercase tracking-wide">{effect.label}</span>
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setLevel(effect.type as any, lvl)}
                            className={`w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                              currentVal === lvl
                                ? 'bg-emerald-500 text-stone-950 shadow-[0_0_5px_rgba(16,185,129,0.3)]'
                                : 'bg-stone-900 border border-stone-800 text-stone-600 hover:border-stone-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Advanced Sub-Tab Content: diagnostics log stream */}
            {activeAdvancedTab === 'diagnostics' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center font-mono text-[9px] pb-1 border-b border-stone-900 text-stone-500">
                  <span>FLUX DE CAPTEURS EN DIRECT // SATELLITE RELAIS-6</span>
                  <span className="text-emerald-500 animate-pulse">● ÉCOUTE</span>
                </div>
                <div className="h-[180px] overflow-y-auto font-mono text-[9px] space-y-1 bg-stone-950 border border-stone-900 p-2.5 rounded">
                  {logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 hover:bg-stone-900/20 py-0.5 px-1 rounded">
                      <span className="text-stone-600 select-none">[{log.timestamp}]</span>
                      <span className={`w-20 font-bold truncate ${
                        log.source === 'ENVIRONNEMENT' || log.source === 'MÉTÉO' ? 'text-sky-500' :
                        log.source === 'ROVER D-6' ? 'text-amber-500' :
                        log.source === 'SCANNER' ? 'text-orange-500' :
                        log.source === 'ALETHEIA' || log.source === 'SÉCURITÉ' ? 'text-red-500' : 'text-purple-400'
                      }`}>
                        {log.source}:
                      </span>
                      <span className={`flex-1 ${
                        log.status === 'warning' ? 'text-yellow-400' :
                        log.status === 'alert' ? 'text-red-500 font-bold animate-pulse' : 'text-stone-400'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Sub-Tab Content: crew transcripts */}
            {activeAdvancedTab === 'crew_logs' && (
              <div className="space-y-2">
                <div className="font-mono text-[9px] pb-1 border-b border-stone-900 text-stone-500 uppercase">
                  TRANSCRIPTIONS CACHÉES DE L'ÉQUIPAGE
                </div>
                <div className="h-[180px] overflow-y-auto space-y-2 bg-stone-950 border border-stone-900 p-2.5 rounded">
                  {CREW_LOGS.map((rec, idx) => (
                    <div key={idx} className="border-b border-stone-900 last:border-0 pb-2 mb-2 last:pb-0 last:mb-0 text-[9px]">
                      <div className="flex justify-between items-center font-bold mb-1">
                        <span className="text-orange-500">{rec.sender.toUpperCase()}</span>
                        <span className="text-stone-600">{rec.timestamp}</span>
                      </div>
                      <p className="text-stone-400 leading-relaxed italic animate-pulse">
                        "{rec.msg}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Synchronisation Loop Realignment Trigger */}
            <div className="flex justify-between items-center border-t border-stone-900 pt-3">
              <span className="text-[8px] text-stone-600">UESC EXPEDITION COORD. 0x40D6</span>
              <button 
                onClick={onRefreshLoop}
                className="flex items-center gap-1 py-1 px-2.5 rounded border border-stone-900 hover:border-stone-800 text-stone-500 hover:text-stone-300 transition-colors cursor-pointer text-[9px] font-mono uppercase font-bold"
              >
                <RefreshCw className="w-3 h-3 text-orange-500" />
                <span>RÉ-ALIGNER LA BOUCLE PJ</span>
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
