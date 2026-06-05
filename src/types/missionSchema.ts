/**
 * Generic mission schema types.
 * These describe mission content without binding the app to a specific mission.
 */

export type MissionAssetKind = 'image' | 'video' | 'audio' | 'map' | 'portrait' | 'ui' | 'other';
export type MissionVisibility = 'gm_only' | 'players' | 'all';
export type MissionTone = 'neutral' | 'procedural' | 'uneasy' | 'urgent' | 'hostile' | 'calm';
export type MissionAletheiaTone = MissionTone | 'reassuring' | 'warning' | 'glitch';
export type MissionTokenType = 'player' | 'npc' | 'creature' | 'vehicle' | 'objective' | 'hazard' | 'custom';
export type MissionTokenStatus = 'active' | 'hidden' | 'wounded' | 'critical' | 'dead' | 'unknown';
export type MissionPlayerIntelTarget = 'all' | 'selected_player' | `role_${string}` | `character_${string}`;
export type MissionBootPhase = 'boot_idle' | 'boot_launching' | 'intro_playing' | 'mission_live';

export interface MissionManifest {
  schemaVersion: string;
  metadata: MissionMetadata;
  assetsBasePath?: string;
  assets: MissionAssetRef[];
  bootSequence?: MissionBootSequence;
  locations: MissionLocation[];
  scenes: MissionScene[];
  resources: MissionResource[];
  tokens: MissionToken[];
  npcs: MissionNpc[];
  aletheia?: MissionAletheiaConfig;
  aletheiaCategories?: MissionAletheiaCategory[];
  aletheiaMessages?: MissionAletheiaMessage[];
  gmScript?: MissionGmScriptScene[];
  gmScriptScenes?: MissionGmScriptScene[];
  playerIntel?: MissionPlayerIntel[];
  map?: MissionMapConfig;
  audio?: MissionAudioConfig;
  initialSceneId?: string;
  initialLocationId?: string;
}

export interface MissionMetadata {
  id: string;
  title: string;
  season?: string;
  number?: number;
  subtitle?: string;
  missionNumber?: string;
  description?: string;
  author?: string;
  version?: string;
  locale?: string;
  tags?: string[];
}

export interface MissionAssetRef {
  id: string;
  kind: MissionAssetKind;
  src: string;
  label?: string;
  alt?: string;
  mimeType?: string;
  preload?: boolean;
  loop?: boolean;
  durationMs?: number;
  variants?: Record<string, string>;
}

export interface MissionScene {
  id: string;
  label: string;
  shortLabel?: string;
  locationId: string;
  order?: number;
  phase?: string;
  summary?: string;
  playerSummary?: string;
  gmSummary?: string;
  ambienceId?: string;
  resourceStateChanges?: Record<string, string>;
  tokenVisibility?: Record<string, boolean | 'keep'>;
  transmissionIds?: string[];
  aletheiaMessageIds?: string[];
  playerIntelIds?: string[];
  gmScriptSceneId?: string;
  nextSceneIds?: string[];
  display?: {
    showTacticalMap?: boolean;
    screenBlack?: boolean;
    overlayIds?: string[];
  };
  control?: {
    quickActionIds?: string[];
    highlightedResourceIds?: string[];
  };
}

export interface MissionLocation {
  id: string;
  runtimeLocationId?: string;
  label: string;
  shortLabel?: string;
  description?: string;
  role?: string;
  playerVisible?: boolean;
  displayBackground?: string;
  imagePath?: string;
  videoLoop?: string;
  povImagePath?: string;
  houndImagePath?: string;
  loopVariants?: Record<string, string>;
  assetIds?: {
    image?: string;
    povImage?: string;
    videoLoop?: string;
    audioBed?: string;
  };
  loopVariantAssetIds?: Record<string, string>;
  defaultAmbienceId?: string;
}

export interface MissionResource {
  id: string;
  label: string;
  displayLabel?: string;
  description?: string;
  initialState?: string;
  initialStateId: string;
  visibleToPlayers?: boolean;
  displayOrder?: number;
  states: Array<{
    id: string;
    label: string;
    severity?: 'stable' | 'degraded' | 'critical' | 'lost';
    color?: 'emerald' | 'amber' | 'orange' | 'red' | 'stone';
    playerLabel?: string;
  }>;
}

export interface MissionToken {
  id: string;
  label: string;
  shortLabel: string;
  type: MissionTokenType;
  x: number;
  y: number;
  visibleToPlayers: boolean;
  visibleInControl: boolean;
  status: MissionTokenStatus;
  sceneVisibility?: string[];
  assetId?: string;
  roleId?: string;
  characterId?: string;
  vehicleId?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface MissionNpc {
  id: string;
  name: string;
  role: string;
  summary?: string;
  portraitAssetId?: string;
  transmissionProfileId?: string;
  playerVisible?: boolean;
  sceneIds?: string[];
  tags?: string[];
}

export interface MissionAletheiaCategory {
  id: string;
  label: string;
  description?: string;
  tone?: MissionAletheiaTone;
  displayOrder?: number;
  messages?: MissionAletheiaMessage[];
}

export interface MissionAletheiaMessage {
  id: string;
  categoryId?: string;
  label: string;
  text: string;
  tone?: MissionAletheiaTone;
  sceneIds?: string[];
  visibility?: MissionVisibility;
  audioAssetId?: string;
}

export interface MissionAletheiaConfig {
  categories: MissionAletheiaCategory[];
  sceneMap?: Record<string, string[]>;
  fallbackCategoryIds?: string[];
}

export interface MissionGmScriptScene {
  id: string;
  sceneId?: string;
  title: string;
  duration?: string;
  sceneFunction?: string;
  gmObjective?: string[];
  visibleInfo?: string[];
  possibleComplications?: string[];
  controlSuggestions?: string[];
  secretNotes?: string[];
  reminder?: string;
  summary?: string;
  beats?: Array<{
    id: string;
    label: string;
    text: string;
    type?: 'setup' | 'prompt' | 'pressure' | 'consequence' | 'transition' | 'note';
  }>;
  readAloud?: string[];
  gmOnlyNotes?: string[];
  nextSceneIds?: string[];
}

export interface MissionPlayerIntel {
  id: string;
  sceneId: string;
  title: string;
  type: 'cryo_dream' | 'sensation' | 'objective' | 'notice' | 'personal_prompt' | 'environment' | string;
  target: MissionPlayerIntelTarget;
  text: string;
  tone?: MissionTone;
  visibility?: 'send_manual_only' | 'auto_available';
}

export interface MissionMapConfig {
  id: string;
  title: string;
  assetId: string;
  imagePath?: string;
  coordinateSystem: {
    kind: 'percent' | 'pixel';
    width?: number;
    height?: number;
  };
  miniMapEnabled?: boolean;
  largeMapEnabled?: boolean;
  fogOfWarEnabled?: boolean;
  defaultVisibleTokenIds?: string[];
  layers?: Array<{
    id: string;
    label: string;
    assetId?: string;
    visibleToPlayers?: boolean;
  }>;
}

export interface MissionAudioConfig {
  defaultProfileId?: string;
  masterVolume?: number;
  locationProfiles?: Record<string, Partial<MissionAudioRuntimeProfile>>;
  moodProfiles?: Record<string, Partial<MissionAudioRuntimeProfile>>;
  sceneOverrides?: Record<string, Partial<MissionAudioRuntimeProfile>>;
  profiles: Array<{
    id: string;
    label: string;
    ambientAssetIds?: string[];
    loopAssetIds?: string[];
    oneShotAssetIds?: string[];
    volume?: number;
  }>;
  sceneProfileMap?: Record<string, string>;
  locationProfileMap?: Record<string, string>;
}

export interface MissionAudioRuntimeProfile {
  windFilterHz: number;
  windQ: number;
  windGain: number;
  humGain: number;
  radioGain: number;
  stormGain: number;
  houndsGain: number;
  windIntensity: string;
  particles: string;
  silence: boolean;
  radioNoise: string;
  lowFrequencyHum: string;
  scannerHum: string;
  emInstability: string;
  audioWindVolumeMax: number;
  audioStormVolumeMax: number;
  audioRadioVolumeMax: number;
  audioHumVolumeMax: number;
  visualWindSpeedMax: number;
  visualParticleDensityMax: number;
}

export interface MissionBootSequence {
  id: string;
  enabled: boolean;
  title?: string;
  subtitle?: string;
  initialPhase: MissionBootPhase;
  holdPercent?: number;
  bootLines?: string[];
  loadingLines?: string[];
  loadingLabel?: string;
  videoPath?: string;
  audioPath?: string;
  durationMs?: number;
  nextSceneId?: string;
  introVideoAssetId?: string;
  startSceneId?: string;
  startLocationId?: string;
  phaseLabels?: Partial<Record<MissionBootPhase, string>>;
}
