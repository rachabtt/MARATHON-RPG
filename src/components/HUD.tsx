/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CinemagraphConfig, TelemetryLog, AtmosphereReading } from '../types';
import { PRESETS, Preset } from '../utils/presets';
import { ResourceState } from '../utils/syncState';
import { generateProceduralLog, CREW_LOGS, ATMOSPHERE_BASE } from '../utils/telemetryLogs';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  Eye, 
  Terminal, 
  FileText, 
  RefreshCw,
  Sliders,
  Power,
  Waves,
  Radio,
  Sparkles,
  Zap,
  Flame,
  Binary
} from 'lucide-react';

interface HUDProps {
  config: CinemagraphConfig;
  onChangeConfig: (newConfig: CinemagraphConfig) => void;
  onRefreshLoop: () => void;
  resources: ResourceState[];
  onChangeResources: (newResources: ResourceState[]) => void;
  activePresetId: string;
  onChangePresetId: (id: string) => void;
}

export default function HUD({ 
  config, 
  onChangeConfig, 
  onRefreshLoop,
  resources,
  onChangeResources,
  activePresetId,
  onChangePresetId
}: HUDProps) {
  const [activeTab, setActiveTab] = useState<'controls' | 'diagnostics' | 'crew_logs'>('controls');
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [atmosphere, setAtmosphere] = useState<AtmosphereReading>(ATMOSPHERE_BASE);
  const [logCounter, setLogCounter] = useState(0);

  // Synchronize dynamic procedurals logs
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

  // Safe handler to cycle resource states forward (left-click) & backward (right-click / long-press)
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

  const applyPresetMacro = (preset: Preset) => {
    onChangePresetId(preset.id);
    onChangeConfig({
      ...config,
      ...preset.config
    });

    if (preset.resourceIndexOverrides) {
      const updated = resources.map(res => {
        if (preset.resourceIndexOverrides && preset.resourceIndexOverrides[res.id] !== undefined) {
          return {
            ...res,
            index: preset.resourceIndexOverrides[res.id]
          };
        }
        return res;
      });
      onChangeResources(updated);
    }
  };

  const getModeLabel = (filter: string) => {
    switch (filter) {
      case 'normal': return 'Vue normale';
      case 'dust': return 'Poussière r.';
      case 'scanner': return 'Scanner act.';
      case 'signal': return 'Signal inst.';
      case 'hounds': return 'Hounds pr.';
      case 'storm': return 'Tempête EM';
      case 'extraction': return 'Extraction';
      case 'silence': return 'Silence rad.';
      default: return filter;
    }
  };

  // --- Ergonomic 0/1/2/3 Levels Mapping ---
  const getLevel = (type: 'dust' | 'glitch' | 'scanner' | 'headlight' | 'hounds' | 'em'): number => {
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
      case 'hounds':
        if (!config.visualHoundShadows) return 0;
        if (config.flickerRate <= 1.4) return 1;
        if (config.flickerRate <= 2.2) return 2;
        return 3;
      case 'em':
        if (!config.visualEmFlashes) return 0;
        if (config.hazeBreathingSpeed <= 1.4) return 1;
        if (config.hazeBreathingSpeed <= 2.0) return 2;
        return 3;
    }
  };

  const setLevel = (type: 'dust' | 'glitch' | 'scanner' | 'headlight' | 'hounds' | 'em', level: number) => {
    const changes: Partial<CinemagraphConfig> = {};
    switch (type) {
      case 'dust':
        changes.dustDensity = level === 0 ? 10 : level === 1 ? 90 : level === 2 ? 180 : 300;
        changes.environmentFilter = level === 0 ? 'normal' : 'dust';
        break;
      case 'glitch':
        changes.visualRadioGlitch = level === 0 ? 0.0 : level === 1 ? 0.25 : level === 2 ? 0.60 : 0.95;
        changes.audioRadioVolume = level === 0 ? 0.0 : level === 1 ? 0.20 : level === 2 ? 0.50 : 0.85;
        if (level > 1) changes.environmentFilter = 'signal';
        break;
      case 'scanner':
        changes.scannerPulseSpeed = level === 0 ? 0.2 : level === 1 ? 1.0 : level === 2 ? 2.5 : 4.0;
        if (level === 0) {
          changes.audioScannerVolume = 0.0;
        } else {
          changes.audioScannerVolume = level === 1 ? 0.25 : level === 2 ? 0.50 : 0.80;
          changes.environmentFilter = 'scanner';
        }
        break;
      case 'headlight':
        changes.headlightIntensity = level === 0 ? 0.0 : level === 1 ? 0.40 : level === 2 ? 0.80 : 1.40;
        break;
      case 'hounds':
        changes.visualHoundShadows = level > 0;
        changes.flickerRate = level === 0 ? 1.0 : level === 1 ? 1.2 : level === 2 ? 1.8 : 2.8;
        if (level > 0) changes.environmentFilter = 'hounds';
        break;
      case 'em':
        changes.visualEmFlashes = level > 0;
        changes.hazeBreathingSpeed = level === 0 ? 1.0 : level === 1 ? 1.2 : level === 2 ? 1.8 : 2.5;
        changes.audioStormVolume = level === 0 ? 0.0 : level === 1 ? 0.20 : level === 2 ? 0.50 : 0.85;
        if (level > 0) changes.environmentFilter = 'storm';
        break;
    }
    onChangeConfig({
      ...config,
      ...changes
    });
  };

  // --- Audio Toggles ---
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

  const isMasterOn = config.audioEnabled;
  const toggleMaster = () => updateSetting('audioEnabled', !isMasterOn);

  return (
    <div className="w-full bg-stone-950 border border-stone-900 rounded-lg p-3 sm:p-5 shadow-2xl font-mono text-stone-300 select-none">
      
      {/* Tab Navigation for MJ Console (Extremely lightweight) */}
      <div className="flex gap-1 mb-4 p-0.5 bg-stone-900 border border-stone-850 rounded">
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer rounded ${
            activeTab === 'controls' 
              ? 'bg-stone-950 text-emerald-400 border border-stone-850 font-bold' 
              : 'text-stone-500 hover:text-stone-300'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 inline mr-1" />
          TÉLÉCOMMANDE
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer rounded ${
            activeTab === 'diagnostics' 
              ? 'bg-stone-950 text-emerald-400 border border-stone-850 font-bold' 
              : 'text-stone-500 hover:text-stone-300'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 inline mr-1" />
          CAPT. TÉLÉM.
        </button>
        <button
          onClick={() => setActiveTab('crew_logs')}
          className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer rounded ${
            activeTab === 'crew_logs' 
              ? 'bg-stone-950 text-emerald-400 border border-stone-850 font-bold' 
              : 'text-stone-500 hover:text-stone-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5 inline mr-1" />
          LIAISON RECUP.
        </button>
      </div>

      {/* Primary Console Controller Dashboard */}
      {activeTab === 'controls' && (
        <div className="space-y-4">

          {/* 1. HEADER COMPACT (UESC Terminal style) */}
          <div className="bg-stone-900 border border-stone-850 p-3 rounded flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[12px] font-bold text-white tracking-[0.15em]">MISSION 01 // SOL ROUGE</span>
              </div>
              <div className="text-[10px] text-stone-500 tracking-wider flex items-center gap-1.5">
                <span>SITE DELTA-6</span>
                <span className="text-stone-700">|</span>
                <span>MODE: <strong className="text-orange-400 font-bold uppercase">{getModeLabel(config.environmentFilter)}</strong></span>
              </div>
            </div>

            <div className="flex gap-1.5">
              {/* Radio Silence Button */}
              <button
                onClick={() => updateSetting('audioRadioSilence', !config.audioRadioSilence)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 border rounded text-[10px] tracking-wider transition-all cursor-pointer ${
                  config.audioRadioSilence
                    ? 'border-red-600 bg-red-950/45 text-red-500 font-bold animate-pulse'
                    : 'border-stone-800 bg-stone-950/20 text-stone-500 hover:text-stone-300'
                }`}
                title="Silence radio instantané"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>SILENCE RADIO</span>
              </button>

              {/* Black Screen Button */}
              <button
                onClick={() => updateSetting('screenBlack', !config.screenBlack)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 border rounded text-[10px] tracking-wider transition-all cursor-pointer ${
                  config.screenBlack
                    ? 'border-orange-500 bg-orange-950/45 text-orange-400 font-bold'
                    : 'border-stone-800 bg-stone-950/20 text-stone-500 hover:text-stone-300'
                }`}
                title="Écran noir de tension pour les PJ"
              >
                <Power className="w-3.5 h-3.5" />
                <span>ÉCRAN NOIR</span>
              </button>
            </div>
          </div>

          {/* 2. PRESETS RAPIDES (Large Touch buttons) */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-900 pb-0.5 flex justify-between">
              <span>[02] PRESETS RAPIDES DE COMBAT</span>
              <span className="text-stone-700">MACROS SYNC</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'delta6', label: 'Site Delta-6', bgId: 'normal', desc: 'Calme nominal' },
                { id: 'scanner_actif', label: 'Scanner actif', bgId: 'scanner', desc: 'Sondage sol active' },
                { id: 'signal_instable', label: 'Signal instable', bgId: 'signal', desc: 'Perte synchronisation' },
                { id: 'hounds_proches', label: 'Hounds proches', bgId: 'hounds', desc: 'Activités anormales' },
                { id: 'tempete_em', label: 'Tempête EM', bgId: 'storm', desc: 'Décharge du réacteur' },
                { id: 'extraction', label: 'Extraction', bgId: 'extraction', desc: 'Évacuation prioritaire' },
              ].map((m) => {
                const preset = PRESETS.find(p => p.id === m.id);
                const isActive = activePresetId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => preset && applyPresetMacro(preset)}
                    className={`h-11 flex flex-col justify-center px-2.5 rounded border transition-all uppercase select-none cursor-pointer text-left ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-950/15 text-emerald-400 font-bold'
                        : 'border-stone-900 bg-stone-900/30 text-stone-550 hover:border-stone-800 hover:text-stone-300'
                    }`}
                  >
                    <span className="text-[10px] tracking-wide leading-none">{m.label}</span>
                    <span className="text-[7.5px] text-stone-600 mt-1 leading-none font-normal truncate max-w-full">
                      {preset?.description || m.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. RESSOURCES M01 (Click / Tap to toggle status) */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-900 pb-0.5 flex justify-between items-center">
              <span>[03] STATUTS RESSOURCES SYNC</span>
              <span className="text-[8px] text-stone-650">CLIC D. / LONG-P. POUR RECULER</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {resources.map((res) => {
                const currentState = res.states[res.index];
                const color = res.colors[res.index];
                
                let textClass = "text-stone-500";
                let borderClass = "border-stone-900 bg-stone-950/40 hover:border-stone-800";
                let dotClass = "bg-stone-800";

                if (color === 'emerald') {
                  textClass = "text-emerald-500 font-semibold";
                  borderClass = "border-emerald-950/60 bg-emerald-950/5 hover:border-emerald-900/40";
                  dotClass = "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]";
                } else if (color === 'amber') {
                  textClass = "text-amber-500 font-semibold";
                  borderClass = "border-amber-950/60 bg-amber-950/5 hover:border-amber-900/40";
                  dotClass = "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)]";
                } else if (color === 'red') {
                  textClass = "text-red-500 font-bold animate-pulse";
                  borderClass = "border-red-950/70 bg-red-950/10 hover:border-red-900/40";
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
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleResourceClick(res.id, false);
                    }}
                    className={`h-14 flex flex-col justify-between p-2 rounded transition-all cursor-pointer text-left border relative ${borderClass}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[8.5px] font-mono text-stone-500 uppercase tracking-wider truncate mr-1">
                        {res.name}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                    </div>
                    <div className="flex items-center justify-between w-full mt-1 border-t border-stone-900/40 pt-1">
                      <span className={`text-[9.5px] font-mono uppercase tracking-wide truncate ${textClass}`}>
                        {currentState}
                      </span>
                      <span className="text-[7.5px] text-stone-700">➔</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. EFFETS RAPIDES (Niveaux discrete tactile 0 / 1 / 2 / 3 selector grids) */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-900 pb-0.5">
              <span>[04] EFFETS RAPIDES ENVIRONNEMENTAUX</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { type: 'dust', label: 'Poussière rouge', icon: <Waves className="w-3.5 h-3.5 text-orange-500" /> },
                { type: 'glitch', label: 'Glitch radio', icon: <Radio className="w-3.5 h-3.5 text-orange-500" /> },
                { type: 'scanner', label: 'Scanner actif', icon: <Binary className="w-3.5 h-3.5 text-orange-500" /> },
                { type: 'headlight', label: 'Projecteurs rover', icon: <Power className="w-3.5 h-3.5 text-orange-500" /> },
                { type: 'hounds', label: 'Menace Hounds', icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
                { type: 'em', label: 'Flashes EM', icon: <Zap className="w-3.5 h-3.5 text-orange-500" /> },
              ].map((effect) => {
                const currentVal = getLevel(effect.type as any);
                return (
                  <div key={effect.type} className="flex items-center justify-between p-2 bg-stone-900/25 border border-stone-900 rounded">
                    <div className="flex items-center gap-2">
                      {effect.icon}
                      <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">{effect.label}</span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setLevel(effect.type as any, lvl)}
                          className={`w-7 h-7 rounded text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                            currentVal === lvl
                              ? 'bg-emerald-500 text-stone-950 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                              : 'bg-stone-950 border border-stone-850 hover:border-stone-700 text-stone-500'
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
          </div>

          {/* 5. AUDIO SYNTH CONTROLS (Ergonomic Toggles) */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 border-b border-stone-900 pb-0.5 flex justify-between">
              <span>[05] MIXER AUDIO TEMPS RÉEL</span>
              <button 
                onClick={toggleMaster}
                className={`px-2 py-0.5 border rounded text-[8px] font-mono tracking-wider ${
                  isMasterOn ? 'border-emerald-600 bg-emerald-900/20 text-emerald-400' : 'border-stone-800 text-stone-600'
                }`}
              >
                {isMasterOn ? 'SYNTH ON' : 'SYNTH OFF'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { label: 'Vent', active: isWindOn, toggle: toggleWind },
                { label: 'Radio', active: isRadioOn, toggle: toggleRadio },
                { label: 'Scanner', active: isScannerOn, toggle: toggleScanner },
                { label: 'Basse H.', active: isHumOn, toggle: toggleHum },
                { label: 'Tempête', active: isStormOn, toggle: toggleStorm },
                { label: 'Mute', active: config.audioRadioSilence, toggle: () => updateSetting('audioRadioSilence', !config.audioRadioSilence) },
              ].map((channel, i) => {
                const disableAll = !config.audioEnabled || (config.audioRadioSilence && channel.label !== 'Mute');
                return (
                  <button
                    key={i}
                    onClick={channel.toggle}
                    disabled={disableAll && channel.label !== 'Mute'}
                    className={`h-11 flex items-center justify-between px-3 rounded border font-mono text-[9.5px] tracking-wider transition-all select-none cursor-pointer uppercase ${
                      channel.active
                        ? 'border-emerald-500 bg-emerald-950/15 text-emerald-400 font-bold'
                        : 'border-stone-900 bg-stone-900/20 text-stone-550'
                    } disabled:opacity-20`}
                  >
                    <span>{channel.label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${channel.active ? 'bg-emerald-500 animate-pulse' : 'bg-stone-800'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time align utility */}
          <div className="flex justify-end pt-1">
            <button 
              onClick={onRefreshLoop}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded border border-stone-900 hover:border-stone-800 text-stone-550 hover:text-stone-300 transition-colors cursor-pointer text-[9px] font-mono"
            >
              <RefreshCw className="w-3 h-3 text-orange-500" />
              <span>RÉ-ALIGNER LA BOUCLE PJ</span>
            </button>
          </div>

        </div>
      )}

      {/* TÉLÉMÉTRIE CAPTEURS TAB (organically flowing telemetry logs) */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-stone-900 pb-1 font-mono text-[10px]">
            <span className="text-stone-400 font-bold uppercase">LOGS TÉLÉMÉTRIE CAPTEURS SOL ROUGE</span>
            <span className="text-emerald-500 animate-pulse">FLUX EN DIRECT // RELAIS D-6</span>
          </div>
          
          <div className="h-[260px] overflow-y-auto font-mono text-[10px] space-y-1.5 bg-stone-950 border border-stone-900 p-3 rounded">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-2.5 hover:bg-stone-900/30 py-0.5 rounded px-1 transition-colors">
                <span className="text-stone-600 select-none">[{log.timestamp}]</span>
                <span className={`w-20 font-bold truncate ${
                  log.source === 'ENVIRONNEMENT' || log.source === 'MÉTÉO' ? 'text-sky-500' :
                  log.source === 'ROVER D-6' ? 'text-amber-500' :
                  log.source === 'SCANNER' ? 'text-orange-500' :
                  log.source === 'COMMS' || log.source === 'ANTENNE' || log.source === 'ANTENNE RELAIS' ? 'text-indigo-400' :
                  log.source === 'SÉCURITÉ' || log.source === 'ALETHEIA' ? 'text-red-500 font-bold' : 'text-purple-400'
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

      {/* LOGS TRANSMISSIONS TAB (story transcription logs) */}
      {activeTab === 'crew_logs' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-900 pb-1 font-mono text-[10px]">
            <span className="text-stone-400 font-bold uppercase">
              TRANSCRIPTIONS CACHÉES DE L'ÉQUIPAGE
            </span>
          </div>

          <div className="h-[260px] overflow-y-auto space-y-2.5 pr-1 font-mono">
            {CREW_LOGS.map((rec, idx) => (
              <div key={idx} className="bg-stone-900/20 border border-stone-900 p-2.5 rounded text-[10px]">
                <div className="flex justify-between items-center border-b border-stone-950 pb-1 mb-1.5 font-bold">
                  <span className="text-orange-500">{rec.sender.toUpperCase()}</span>
                  <span className="text-stone-600 font-normal">{rec.timestamp}</span>
                </div>
                <p className="text-stone-400 leading-relaxed italic">
                  "{rec.msg}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
