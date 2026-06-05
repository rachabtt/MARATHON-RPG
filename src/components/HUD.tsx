/**
 * HUD (MJ control) — simplified and reordered for Mission 01 workflow
 */
import { useMemo, useState } from 'react';
import { VolumeX, Power } from 'lucide-react';
import { CinemagraphConfig } from '../types';
import {
  type AletheiaTerminalMessageSource,
  type AletheiaTerminalState,
  DATA_PACKAGE_STATUS_META,
  getDataPackageMeta,
  ResourceState,
  type DataPackageState,
  type DataPackageStatus,
  type EmStormSeverity,
  type HoundAlertState,
  type MissionTelemetryState
} from '../utils/syncState';
import type { LocationId, LocationInfo } from '../utils/locations';
import { useMission } from '../context/MissionProvider';
import DirectorGuidePanel from './DirectorGuidePanel';
import AletheiaTerminalControl from './control/AletheiaTerminalControl';
import PlayerIntelControlPanel from './control/PlayerIntelControlPanel';
import { type HoundActionId } from '../data/houndActions';
import type { MissionPlayerIntel } from '../types/missionSchema';
import type { PlayerIntelDelivery, PlayerIntelRecipient } from '../utils/syncState';

const SHOW_DIRECTOR_GUIDE_PANEL = false;

interface HUDProps {
  config: CinemagraphConfig;
  onChangeConfig: (newConfig: CinemagraphConfig) => void;
  onRefreshLoop: () => void;
  resources: ResourceState[];
  onChangeResources: (newResources: ResourceState[]) => void;
  activePresetId: string;
  onChangePresetId: (id: string) => void;
  emStorm?: {
    active: boolean;
    severity: EmStormSeverity;
  };
  missionTelemetry?: MissionTelemetryState;
  onActivateEmStorm?: () => void;
  onSetEmStormSeverity?: (severity: EmStormSeverity) => void;
  onExitEmStorm?: () => void;
  dataPackage?: DataPackageState;
  onSetDataPackageStatus?: (status: DataPackageStatus) => void;
  onToggleDataPackageVisibility?: () => void;
  activeLocation: LocationId;
  locations: LocationInfo[];
  onChangeLocation: (location: LocationId) => void;
  networkSyncStatus: string;
  onHoundAction?: (actionId: HoundActionId) => void;
  houndAlert?: HoundAlertState | null;
  onResetMission?: () => void;
  onSceneShortcut: (sceneId: string) => void;
  activeDirectorSceneId?: string | null;
  onChangeDirectorSceneId?: (sceneId: string) => void;
  selectedSquadIds: string[];
  sentPlayerIntelDeliveries: PlayerIntelDelivery[];
  onSendPlayerIntel: (intel: MissionPlayerIntel, recipients: PlayerIntelRecipient[]) => void;
  onClearPlayerIntel: () => void;
  newCarthageLoopVariant?: 'base' | 'workers' | 'rover_pass' | 'ship_takeoff' | 'easter_egg';
  newCarthageLoopCounts?: { ship_takeoff: number; easter_egg: number };
  onChangeNewCarthageLoopVariant?: (variant: 'base' | 'workers' | 'rover_pass' | 'ship_takeoff' | 'easter_egg') => void;
  aletheiaTerminal: AletheiaTerminalState;
  onSendAletheiaMessage: (text: string, source?: AletheiaTerminalMessageSource) => void;
  onClearAletheiaTerminal: () => void;
  onGlitchAletheiaSignal: () => void;
  onToggleAletheiaNoSignal: () => void;
}

export default function HUD({
  config,
  onChangeConfig,
  onRefreshLoop,
  resources,
  onChangeResources,
  activePresetId,
  onChangePresetId,
  emStorm,
  missionTelemetry,
  onActivateEmStorm,
  onSetEmStormSeverity,
  onExitEmStorm,
  dataPackage,
  onSetDataPackageStatus,
  onToggleDataPackageVisibility,
  activeLocation,
  locations,
  onChangeLocation,
  networkSyncStatus,
  onHoundAction,
  houndAlert,
  onResetMission,
  onSceneShortcut,
  activeDirectorSceneId,
  onChangeDirectorSceneId,
  selectedSquadIds,
  sentPlayerIntelDeliveries,
  onSendPlayerIntel,
  onClearPlayerIntel,
  newCarthageLoopVariant,
  newCarthageLoopCounts,
  onChangeNewCarthageLoopVariant,
  aletheiaTerminal,
  onSendAletheiaMessage,
  onClearAletheiaTerminal,
  onGlitchAletheiaSignal,
  onToggleAletheiaNoSignal
}: HUDProps) {
  const { currentMission } = useMission();
  const [locStatus, setLocStatus] = useState<Record<string,'loading'|'loaded'|'error'>>({});
  const stormActive = emStorm?.active === true;
  const stormSeverity = emStorm?.severity ?? 'critical';
  const dataPackageMeta = getDataPackageMeta(dataPackage?.status);
  const dataPackageVisible = dataPackage?.visible === true;
  const activeHoundAlert = houndAlert && Date.now() - houndAlert.createdAt < houndAlert.durationMs ? houndAlert.id : null;
  const controlScenes = useMemo(() => {
    return [...(currentMission.scenes ?? [])].sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
  }, [currentMission.scenes]);
  const missionTitle = `${currentMission.metadata.missionNumber ?? String(currentMission.metadata.number ?? '').padStart(2, '0')} // ${currentMission.metadata.title}`;

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

  const updateSetting = <K extends keyof CinemagraphConfig>(key: K, value: CinemagraphConfig[K]) => {
    onChangeConfig({ ...config, [key]: value });
  };

  return (
    <div className="app-hud w-full bg-stone-950 border border-stone-900 rounded-lg p-3 sm:p-5 shadow-2xl font-mono text-stone-300 select-none">

      {/* Header */}
      <div className="bg-stone-900 border border-stone-850 p-3 rounded flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"/> <strong className="uppercase text-white tracking-wider">{missionTitle}</strong></div>
          <div className="text-xs text-stone-400 mt-1">Site: <strong className="text-orange-400">{locations.find(l=>l.id===activeLocation)?.label ?? 'AUCUN LIEU'}</strong> • Sync: <strong className="font-bold">{networkSyncStatus}</strong></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onResetMission && onResetMission()} className="px-3 py-1 border rounded text-sm">RESET SESSION</button>
          <button onClick={() => updateSetting('audioRadioSilence', !config.audioRadioSilence)} className={`px-3 py-1 border rounded ${config.audioRadioSilence ? 'bg-red-700/70 border-red-600 text-white' : ''}`}> <VolumeX className="w-4 h-4 inline"/> {config.audioRadioSilence ? 'SILENCE RADIO ON' : 'SILENCE RADIO'}</button>
          <button onClick={() => updateSetting('screenBlack', !config.screenBlack)} className={`px-3 py-1 border rounded ${config.screenBlack ? 'bg-red-700/70 border-red-600 text-white' : ''}`}> <Power className="w-4 h-4 inline"/> {config.screenBlack ? 'ÉCRAN NOIR ON' : 'ÉCRAN NOIR'}</button>
        </div>
      </div>

      {/* Lieux */}
      <div className="space-y-2 mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">Lieux mission</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {locations.map((loc) => {
            const active = loc.id === activeLocation;
            return (
              <button key={loc.id} onClick={() => onChangeLocation(loc.id)} className={`p-2 text-left border rounded ${active? 'border-orange-500 bg-orange-950/10':''}`}>
                <div className="text-sm font-bold">{loc.label}</div>
                <div className="text-xs text-stone-400">{loc.subtitle}</div>
              </button>
            );
          })}
          {locations.length === 0 && (
            <div className="col-span-full rounded border border-stone-850 bg-stone-950/70 p-3 text-xs uppercase tracking-wider text-stone-500">
              Aucun lieu disponible
            </div>
          )}
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
                <button onClick={() => onChangeNewCarthageLoopVariant && onChangeNewCarthageLoopVariant('ship_takeoff')} className={`px-2 py-1 border rounded text-sm ${newCarthageLoopVariant==='ship_takeoff' ? 'bg-orange-950/10 border-orange-500':''}`}>
                  SHIP TAKEOFF {shipCount>0 && (<span className="ml-2 text-[11px]">AUTO {shipCount}/2</span>)}
                </button>
              );
            })()}

            {(() => {
              const eggCount = newCarthageLoopCounts?.easter_egg || 0;
              return (
                <button onClick={() => onChangeNewCarthageLoopVariant && onChangeNewCarthageLoopVariant('easter_egg')} className={`px-2 py-1 border rounded text-sm ${newCarthageLoopVariant==='easter_egg' ? 'bg-orange-950/10 border-orange-500':''}`}>
                  EASTER EGG {eggCount>0 && (<span className="ml-2 text-[11px]">AUTO {eggCount}/2</span>)}
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
          ].map((a) => {
            const active = a.id === 'tempete' ? stormActive : activePresetId === a.id;
            return (
              <button
                key={a.id}
                onClick={() => a.id === 'tempete' ? onActivateEmStorm?.() : onChangePresetId(a.id)}
                className={`px-2 py-1 border rounded text-sm ${active ? 'bg-orange-950/40 border-orange-500 text-orange-100' : ''} ${a.id === 'tempete' && stormActive ? 'bg-red-950/70 border-orange-500 text-orange-100 shadow-[0_0_18px_rgba(194,65,12,0.22)]' : ''}`}
              >
                {a.id === 'tempete' && stormActive ? 'TEMPÊTE EM ACTIVE' : a.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSetEmStormSeverity?.('critical')}
            className={`px-2 py-1 border rounded text-xs ${stormActive && stormSeverity === 'critical' ? 'bg-red-950/60 border-red-500 text-red-100' : 'text-stone-400 border-stone-800'}`}
          >
            CRITIQUE
          </button>
          <button
            onClick={() => onSetEmStormSeverity?.('lost')}
            className={`px-2 py-1 border rounded text-xs ${stormActive && stormSeverity === 'lost' ? 'bg-red-900/80 border-red-400 text-white' : 'text-stone-400 border-stone-800'}`}
          >
            PERDU
          </button>
          {stormActive && (
            <button
              onClick={() => onExitEmStorm?.()}
              className="px-2 py-1 border rounded text-xs border-stone-700 bg-stone-900 text-stone-200"
            >
              SORTIE TEMPÊTE
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-wider">
          <div className="border border-stone-850 bg-stone-950/60 rounded p-2">
            <div className="text-stone-500">Signal radio</div>
            <div className={`${missionTelemetry?.signalRadio === 'PERDU' || missionTelemetry?.signalRadio === 'CRITIQUE' ? 'text-red-400' : 'text-amber-400'} font-bold`}>{missionTelemetry?.signalRadio ?? 'DÉGRADÉ'}</div>
          </div>
          <div className="border border-stone-850 bg-stone-950/60 rounded p-2">
            <div className="text-stone-500">Visibilité</div>
            <div className={`${missionTelemetry?.visibility === 'PERDU' || missionTelemetry?.visibility === 'CRITIQUE' ? 'text-red-400' : 'text-amber-400'} font-bold`}>{missionTelemetry?.visibility ?? 'DÉGRADÉ'}</div>
          </div>
          <div className="border border-stone-850 bg-stone-950/60 rounded p-2">
            <div className="text-stone-500">Activité EM</div>
            <div className={`${missionTelemetry?.emActivity === 'CRITIQUE' ? 'text-red-400' : 'text-amber-400'} font-bold`}>{missionTelemetry?.emActivity ?? 'DÉGRADÉ'}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">Menaces / Incidents</div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onHoundAction?.('hound_near')}
            className={`px-2 py-1 border rounded text-sm ${activeHoundAlert ? 'bg-orange-950/35 border-orange-500 text-orange-100' : ''}`}
          >
            CONTACT HOUND
          </button>
          <button
            onClick={() => onHoundAction?.('contact_lost')}
            disabled={!activeHoundAlert}
            className={`px-2 py-1 border rounded text-sm ${activeHoundAlert ? 'border-stone-600 text-stone-200 hover:border-red-500 hover:text-red-200' : 'border-stone-800 text-stone-600 cursor-not-allowed'}`}
          >
            FIN CONTACT
          </button>
        </div>
      </div>

      {/* Scenes */}
      <div className="space-y-2 mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">Scènes mission</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {controlScenes.map((scene) => (
            <button key={scene.id} onClick={() => onSceneShortcut(scene.id)} className="px-2 py-1 border rounded text-sm">{scene.label}</button>
          ))}
          {controlScenes.length === 0 && (
            <div className="col-span-full rounded border border-stone-850 bg-stone-950/70 p-3 text-xs uppercase tracking-wider text-stone-500">
              Aucune scène disponible
            </div>
          )}
        </div>
      </div>

      <PlayerIntelControlPanel
        activeSceneId={activeDirectorSceneId}
        selectedSquadIds={selectedSquadIds}
        sentIntelDeliveries={sentPlayerIntelDeliveries}
        onSendIntel={onSendPlayerIntel}
        onClearSentIntel={onClearPlayerIntel}
      />

      <AletheiaTerminalControl
        terminal={aletheiaTerminal}
        activeSceneId={activeDirectorSceneId}
        onSendMessage={onSendAletheiaMessage}
        onClearTerminal={onClearAletheiaTerminal}
        onGlitchSignal={onGlitchAletheiaSignal}
        onToggleNoSignal={onToggleAletheiaNoSignal}
      />

        {/* CONDUITE MJ — director guidance (control only) */}
      {SHOW_DIRECTOR_GUIDE_PANEL && (
        <div className="space-y-2 mb-4">
          <DirectorGuidePanel sceneId={activeDirectorSceneId} onChangeSceneId={onChangeDirectorSceneId} />
        </div>
      )}

      {/* Données Delta-6 */}
      <div className="space-y-2 mb-4 border border-stone-850 bg-stone-950/70 rounded p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500">Données Delta-6</div>
            <div className="text-[11px] uppercase tracking-wider text-stone-300 mt-1">
              {dataPackageMeta.label} // Integrity {dataPackageMeta.integrity}% // Signal {dataPackageMeta.signalTrace}
            </div>
          </div>
          <button
            onClick={() => onToggleDataPackageVisibility?.()}
            className={`px-2 py-1 border rounded text-xs shrink-0 ${dataPackageVisible ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200' : 'border-stone-700 text-stone-300'}`}
          >
            {dataPackageVisible ? 'Masquer Data Package' : 'Afficher Data Package'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DATA_PACKAGE_STATUS_META.map((status) => {
            const active = status.id === dataPackageMeta.id;
            return (
              <button
                key={status.id}
                onClick={() => onSetDataPackageStatus?.(status.id)}
                className={`px-2 py-2 border rounded text-left text-xs uppercase tracking-wide ${active ? 'bg-orange-950/25 border-orange-500 text-orange-100' : 'border-stone-800 text-stone-400'}`}
              >
                <span className="block font-bold">{status.label}</span>
                <span className="block mt-1 text-[10px] text-stone-500">{status.integrity}% // {status.signalTrace}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ressources */}
      <div className="space-y-2 mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">Ressources</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
          {resources.length === 0 && (
            <div className="col-span-full rounded border border-stone-850 bg-stone-950/70 p-3 text-xs uppercase tracking-wider text-stone-500">
              Aucune ressource disponible
            </div>
          )}
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
