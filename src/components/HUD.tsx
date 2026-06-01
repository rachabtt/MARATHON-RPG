/**
 * HUD (MJ control) — simplified and reordered for Mission 01 workflow
 */
import { useState } from 'react';
import CharacterPortraitCrop from './CharacterPortraitCrop';
import { Zap, Waves, Plus, VolumeX, Power } from 'lucide-react';
import { CinemagraphConfig, InterventionOptions, SquadOverlayState, SquadMember } from '../types';
import { ResourceState } from '../utils/syncState';
import { LOCATIONS, type LocationId } from '../utils/locations';
import { STORY_BEATS } from '../utils/storyBeats';

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
  networkSyncStatus: string;
  onQuickAction: (actionId: string) => void;
  onTransmission: (type: string) => void;
  interventionOptions: InterventionOptions;
  onToggleInterventionOption: (key: keyof InterventionOptions) => void;
  onClearTransmission: () => void;
  squadOverlay: SquadOverlayState;
  onToggleSquadOverlay: () => void;
  onSetSquadOverlayMode: (mode: SquadOverlayState['mode']) => void;
  onUpdateSquadMember: (memberId: string, changes: Partial<SquadMember>) => void;
  onUpdateSquadTracker?: (memberId: string, trackerKey: 'stress'|'bruit'|'blessures', delta: number) => void;
  onMoveSquadMember: (memberId: string, direction: -1 | 1) => void;
  onResetMission?: () => void;
  onModifySquad?: () => void;
  onSceneShortcut: (sceneId: string) => void;
  newCarthageLoopVariant?: 'base' | 'workers' | 'rover_pass' | 'ship_takeoff' | 'easter_egg';
  newCarthageLoopCounts?: { ship_takeoff: number; easter_egg: number };
  onChangeNewCarthageLoopVariant?: (variant: 'base' | 'workers' | 'rover_pass' | 'ship_takeoff' | 'easter_egg') => void;
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
  onUpdateSquadMember,
  onUpdateSquadTracker,
  onMoveSquadMember,
  onResetMission,
  onModifySquad,
  onSceneShortcut
  , newCarthageLoopVariant, newCarthageLoopCounts, onChangeNewCarthageLoopVariant
}: HUDProps) {
  const [locStatus, setLocStatus] = useState<Record<string,'loading'|'loaded'|'error'>>({});

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

  const computeAutoStatus = (trackers?: { stress?: number; bruit?: number; blessures?: number }) => {
    const s = trackers?.stress ?? 0;
    const b = trackers?.bruit ?? 0;
    const bl = trackers?.blessures ?? 0;
    if (bl >= 3) return 'CRITIQUE';
    if (bl >= 1) return 'BLESSÉ';
    if (s >= 5) return 'STRESS MAX';
    if (b >= 5) return 'BRUIT MAX';
    return 'OK';
  };

  const updateSetting = <K extends keyof CinemagraphConfig>(key: K, value: CinemagraphConfig[K]) => {
    onChangeConfig({ ...config, [key]: value });
  };

  return (
    <div className="app-hud w-full bg-stone-950 border border-stone-900 rounded-lg p-3 sm:p-5 shadow-2xl font-mono text-stone-300 select-none">

      {/* Header */}
      <div className="bg-stone-900 border border-stone-850 p-3 rounded flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"/> <strong className="uppercase text-white tracking-wider">MISSION 01 // SOL ROUGE</strong></div>
          <div className="text-xs text-stone-400 mt-1">Site: <strong className="text-orange-400">{LOCATIONS.find(l=>l.id===activeLocation)?.label}</strong> • Sync: <strong className="font-bold">{networkSyncStatus}</strong></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onResetMission && onResetMission()} className="px-3 py-1 border rounded text-sm">RESET SESSION</button>
          <button onClick={() => updateSetting('audioRadioSilence', !config.audioRadioSilence)} className={`px-3 py-1 border rounded ${config.audioRadioSilence ? 'bg-red-700/70 border-red-600 text-white' : ''}`}> <VolumeX className="w-4 h-4 inline"/> {config.audioRadioSilence ? 'SILENCE RADIO ON' : 'SILENCE RADIO'}</button>
          <button onClick={() => updateSetting('screenBlack', !config.screenBlack)} className={`px-3 py-1 border rounded ${config.screenBlack ? 'bg-red-700/70 border-red-600 text-white' : ''}`}> <Power className="w-4 h-4 inline"/> {config.screenBlack ? 'ÉCRAN NOIR ON' : 'ÉCRAN NOIR'}</button>
        </div>
      </div>

      {/* Escouade (first) */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm uppercase tracking-wider font-mono text-stone-400">Escouade PJ</div>
          <div className="flex gap-2">
            <button onClick={onToggleSquadOverlay} className="px-3 py-1 border rounded">{squadOverlay.visible ? 'Masquer Escouade' : 'Afficher Escouade'}</button>
            <button onClick={() => onModifySquad && onModifySquad()} className="px-3 py-1 border rounded">Rechoisir Escouade</button>
          </div>
        </div>

        {squadOverlay.members.length > 0 && (
          <div className="flex flex-col gap-2">
            {squadOverlay.members.slice(0,3).map((m) => (
              <div key={m.id} className="p-3 bg-stone-900 border rounded flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded overflow-hidden bg-stone-800 flex items-center justify-center">
                      <CharacterPortraitCrop src={(m as any).portrait} alt={m.name} size={48} cropSettings={(m as any).portraitCrop} />
                    </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-tight whitespace-normal break-words">{m.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center text-xs text-stone-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div className="text-[10px] text-stone-400 uppercase">STRESS</div>
                    <div className="mt-1 flex items-center gap-1">
                      <button onClick={() => onUpdateSquadTracker && onUpdateSquadTracker(m.id, 'stress', -1)} className="px-2 py-1 border rounded">-</button>
                      <div className="px-2">{((m as any).trackers?.stress)||0}</div>
                      <button onClick={() => onUpdateSquadTracker && onUpdateSquadTracker(m.id, 'stress', 1)} className="px-2 py-1 border rounded">+</button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-xs text-stone-300">
                    <Waves className="w-4 h-4 text-sky-400" />
                    <div className="text-[10px] text-stone-400 uppercase">BRUIT</div>
                    <div className="mt-1 flex items-center gap-1">
                      <button onClick={() => onUpdateSquadTracker && onUpdateSquadTracker(m.id, 'bruit', -1)} className="px-2 py-1 border rounded">-</button>
                      <div className="px-2">{((m as any).trackers?.bruit)||0}</div>
                      <button onClick={() => onUpdateSquadTracker && onUpdateSquadTracker(m.id, 'bruit', 1)} className="px-2 py-1 border rounded">+</button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-xs text-stone-300">
                    <Plus className="w-4 h-4 text-orange-400" />
                    <div className="text-[10px] text-stone-400 uppercase">BLESSURES</div>
                    <div className="mt-1 flex items-center gap-1">
                      <button onClick={() => onUpdateSquadTracker && onUpdateSquadTracker(m.id, 'blessures', -1)} className="px-2 py-1 border rounded">-</button>
                      <div className="px-2">{((m as any).trackers?.blessures)||0}</div>
                      <button onClick={() => onUpdateSquadTracker && onUpdateSquadTracker(m.id, 'blessures', 1)} className="px-2 py-1 border rounded">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lieux */}
      <div className="space-y-2 mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">Lieux Mission 01</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LOCATIONS.map((loc) => {
            const active = loc.id === activeLocation;
            return (
              <button key={loc.id} onClick={() => onChangeLocation(loc.id)} className={`p-2 text-left border rounded ${active? 'border-orange-500 bg-orange-950/10':''}`}>
                <div className="text-sm font-bold">{loc.label}</div>
                <div className="text-xs text-stone-400">{loc.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Carthage loops controls (only in New Carthage) */}
      {activeLocation === 'new_carthage' && (
        <div className="space-y-2 mb-4">
          <div className="text-xs uppercase tracking-wider text-stone-500">Loops New Carthage</div>
          <div className="flex gap-2 flex-wrap">
            {/* Workers loop is implicit/always-on; do not present a button for it */}
            <button onClick={() => onChangeNewCarthageLoopVariant && onChangeNewCarthageLoopVariant('rover_pass')} className={`px-2 py-1 border rounded text-sm ${newCarthageLoopVariant==='rover_pass' ? 'bg-orange-950/10 border-orange-500':''}`}>ROVER PASS</button>
            {(() => {
              const shipCount = newCarthageLoopCounts?.ship_takeoff || 0;
              return (
                <button disabled={shipCount >= 2} onClick={() => onChangeNewCarthageLoopVariant && onChangeNewCarthageLoopVariant('ship_takeoff')} className={`px-2 py-1 border rounded text-sm ${newCarthageLoopVariant==='ship_takeoff' ? 'bg-orange-950/10 border-orange-500':''} ${shipCount>=2 ? 'opacity-50 cursor-not-allowed':''}`}>
                  SHIP TAKEOFF {shipCount>0 && (<span className="ml-2 text-[11px]">{shipCount}/2</span>)}{shipCount>=2 && (<span className="ml-2 text-[11px]">MAX</span>)}
                </button>
              );
            })()}

            {(() => {
              const eggCount = newCarthageLoopCounts?.easter_egg || 0;
              return (
                <button disabled={eggCount >= 2} onClick={() => onChangeNewCarthageLoopVariant && onChangeNewCarthageLoopVariant('easter_egg')} className={`px-2 py-1 border rounded text-sm ${newCarthageLoopVariant==='easter_egg' ? 'bg-orange-950/10 border-orange-500':''} ${eggCount>=2 ? 'opacity-50 cursor-not-allowed':''}`}>
                  EASTER EGG {eggCount>0 && (<span className="ml-2 text-[11px]">{eggCount}/2</span>)}{eggCount>=2 && (<span className="ml-2 text-[11px]">MAX</span>)}
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* Red Plains visual override */}
      {activeLocation === 'red_plains' && (
        <div className="space-y-2 mb-4">
          <div className="text-xs uppercase tracking-wider text-stone-500">PLAINES ROUGES - Vue</div>
          <div className="flex gap-2">
            <button onClick={() => onRefreshLoop()} className="px-2 py-1 border rounded text-sm">(refresh)</button>
            <button onClick={() => onSceneShortcut('traversee')} className="px-2 py-1 border rounded text-sm">VUE LARGE</button>
            <button onClick={() => onSceneShortcut('anomalie_radio')} className="px-2 py-1 border rounded text-sm">POV ROVER</button>
          </div>
        </div>
      )}

      {/* Ambiances */}
      <div className="space-y-2 mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">Ambiances</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'calme', label: 'CALME' },
            { id: 'delta6', label: 'TENSION' },
            { id: 'signal', label: 'SIGNAL INSTABLE' },
            { id: 'tempete', label: 'TEMPÊTE EM' },
            { id: 'extraction', label: 'EXTRACTION' }
          ].map((a) => (
            <button key={a.id} onClick={() => onChangePresetId(a.id)} className="px-2 py-1 border rounded text-sm">{a.label}</button>
          ))}
        </div>
      </div>

      {/* Scenes */}
      <div className="space-y-2 mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">Scènes M01</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STORY_BEATS.map((beat) => (
            <button key={beat.id} onClick={() => onSceneShortcut(beat.id)} className="px-2 py-1 border rounded text-sm">{beat.label}</button>
          ))}
        </div>
      </div>

      {/* Ressources */}
      <div className="space-y-2 mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">Ressources</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {resources.map((res) => (
            <button key={res.id} onClick={() => {
              const next = res.index + 1 >= res.states.length ? 0 : res.index + 1;
              const updated = resources.map(r => r.id === res.id ? { ...r, index: next } : r);
              onChangeResources(updated);
            }} className="p-2 border rounded text-left">
              <div className="text-sm font-bold">{getShortResourceName(res.id)}</div>
              <div className="text-xs text-stone-400">{res.states[res.index]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="space-y-2 mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">Actions rapides</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button onClick={() => onQuickAction('glitch_radio')} className="px-2 py-1 border rounded">Glitch Radio</button>
          <button onClick={() => onQuickAction('flash_em')} className="px-2 py-1 border rounded">Flash EM</button>
          <button onClick={() => onQuickAction('ombre_hound')} className="px-2 py-1 border rounded">CONTACT HOUND</button>
          <button onClick={() => onQuickAction('intervention')} className="px-2 py-1 border rounded">Intervention</button>
          <button onClick={() => onQuickAction('reset_calme')} className="px-2 py-1 border rounded">Reset Calme</button>
        </div>
      </div>

      {/* Audio controls (simplified) */}
      <div className="space-y-2 mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">Audio</div>
        <div className="flex gap-2">
          <button onClick={() => updateSetting('audioEnabled', !config.audioEnabled)} className={`px-2 py-1 border rounded ${config.audioEnabled ? 'bg-orange-950/10 border-orange-500' : ''}`}>Audio {config.audioEnabled? 'On':'Off'}</button>
        </div>
      </div>

    </div>
  );
}
