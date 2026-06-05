import type {
  MissionAletheiaMessage,
  MissionAssetRef,
  MissionAudioConfig,
  MissionGmScriptScene,
  MissionLocation,
  MissionManifest,
  MissionMapConfig,
  MissionPlayerIntel,
  MissionResource,
  MissionScene,
  MissionToken,
  MissionTokenStatus,
  MissionTokenType,
  MissionTone
} from '../../types/missionSchema';
import { aletheiaMessageCategories } from '../../data/aletheiaMessages';
import { aletheiaSceneCategoryMap } from '../../data/aletheiaSceneMap';
import { mission01GmScript } from '../../data/mission01GmScript';
import { MISSION01_TACTICAL_TOKENS } from '../../data/mission01Tokens';
import { missionScenes } from '../../data/missionScenes';
import { scenePlayerIntel } from '../../data/scenePlayerIntel';
import { transmissionProfiles } from '../../data/transmissionProfiles';
import { LOCATIONS } from '../../utils/locations';
import { getAudioProfile } from '../../utils/audioProfiles';
import { INITIAL_RESOURCES } from '../../utils/syncState';

function getLocationIdFromSceneLocation(location: string): string {
  const normalized = location.toLowerCase();
  if (normalized.includes('plaines')) return 'red_plains';
  if (normalized.includes('arches')) return 'black_arches';
  if (normalized.includes('delta-6') || normalized.includes('delta6')) return 'delta6';
  return 'new_carthage';
}

function mapTokenType(type: string): MissionTokenType {
  if (type === 'pj') return 'player';
  if (type === 'pnj') return 'npc';
  if (type === 'hound') return 'creature';
  if (type === 'rover') return 'vehicle';
  return 'custom';
}

function mapTokenStatus(status: string): MissionTokenStatus {
  if (
    status === 'active' ||
    status === 'hidden' ||
    status === 'wounded' ||
    status === 'critical' ||
    status === 'dead' ||
    status === 'unknown'
  ) {
    return status;
  }
  return 'unknown';
}

function mapTone(tone: string | undefined): MissionTone {
  if (
    tone === 'neutral' ||
    tone === 'procedural' ||
    tone === 'uneasy' ||
    tone === 'urgent' ||
    tone === 'hostile' ||
    tone === 'calm'
  ) {
    return tone;
  }
  if (tone === 'warning' || tone === 'glitch') return 'uneasy';
  if (tone === 'reassuring') return 'calm';
  return 'neutral';
}

const manifestLocations: MissionLocation[] = LOCATIONS.map((location) => ({
  id: location.id,
  label: location.label,
  shortLabel: location.label,
  description: location.subtitle,
  role: location.subtitle,
  playerVisible: true,
  assetIds: {
    image: `${location.id}-image`,
    povImage: location.povImage ? `${location.id}-pov-image` : undefined,
    videoLoop: location.wideVideo ? `${location.id}-video-loop` : undefined
  },
  loopVariantAssetIds: location.loops
    ? Object.fromEntries(
        Object.entries(location.loops)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => [key, `new_carthage-${key}-loop`])
      )
    : undefined
}));

const manifestAssets: MissionAssetRef[] = [
  {
    id: 'mission01-map-image',
    kind: 'map',
    src: '/assets/maps/PLATEAU.png',
    label: 'Mission 01 Tactical Map',
    preload: true
  },
  {
    id: 'boot-video',
    kind: 'video',
    src: 'boot/BOOT.mp4',
    label: 'BOOT intro sequence',
    preload: true
  },
  ...LOCATIONS.flatMap<MissionAssetRef>((location) => {
    const assets: MissionAssetRef[] = [
      {
        id: `${location.id}-image`,
        kind: 'image',
        src: location.image,
        label: location.label,
        preload: true
      }
    ];

    if (location.povImage) {
      assets.push({
        id: `${location.id}-pov-image`,
        kind: 'image',
        src: location.povImage,
        label: `${location.label} POV`,
        preload: true
      });
    }

    if (location.houndImage) {
      assets.push({
        id: `${location.id}-hound-image`,
        kind: 'image',
        src: location.houndImage,
        label: `${location.label} Hound variant`,
        preload: true
      });
    }

    if (location.wideVideo) {
      assets.push({
        id: `${location.id}-video-loop`,
        kind: 'video',
        src: location.wideVideo,
        label: `${location.label} loop`,
        preload: true,
        loop: true
      });
    }

    if (location.loops) {
      Object.entries(location.loops).forEach(([key, src]) => {
        if (!src) return;
        assets.push({
          id: `new_carthage-${key}-loop`,
          kind: 'video',
          src,
          label: `New Carthage ${key}`,
          preload: true,
          loop: true
        });
      });
    }

    return assets;
  })
];

const manifestScenes: MissionScene[] = missionScenes.map((scene, index) => ({
  id: scene.id,
  label: scene.label,
  shortLabel: scene.shortLabel,
  locationId: getLocationIdFromSceneLocation(scene.location),
  order: index + 1,
  phase: scene.tensionLevel,
  summary: scene.displayHint,
  gmSummary: scene.gmObjective,
  ambienceId: scene.recommendedMood,
  playerIntelIds: scenePlayerIntel
    .filter((intel) => intel.sceneId === scene.id)
    .map((intel) => intel.id),
  gmScriptSceneId: mission01GmScript.some((scriptScene) => scriptScene.id === scene.id)
    ? scene.id
    : undefined,
  display: {
    overlayIds: []
  }
}));

const manifestResources: MissionResource[] = INITIAL_RESOURCES.map((resource, resourceIndex) => ({
  id: resource.id,
  label: resource.name,
  initialStateId: `state-${resource.index}`,
  visibleToPlayers: true,
  displayOrder: resourceIndex + 1,
  states: resource.states.map((label, stateIndex) => ({
    id: `state-${stateIndex}`,
    label,
    severity: stateIndex === 0
      ? 'stable'
      : stateIndex === 1
        ? 'degraded'
        : stateIndex === 2
          ? 'critical'
          : 'lost',
    color: resource.colors[stateIndex]
  }))
}));

const manifestTokens: MissionToken[] = MISSION01_TACTICAL_TOKENS.map((token) => ({
  id: token.id,
  label: token.label,
  shortLabel: token.shortLabel,
  type: mapTokenType(token.type),
  x: token.x,
  y: token.y,
  visibleToPlayers: token.visibleToPlayers,
  visibleInControl: token.visibleInControl,
  status: mapTokenStatus(token.status),
  sceneVisibility: token.sceneVisibility,
  vehicleId: token.inVehicle ? 'rover-uesc' : null,
  metadata: {
    sourceType: token.type,
    inVehicle: token.inVehicle
  }
}));

const manifestAletheiaMessages: MissionAletheiaMessage[] = aletheiaMessageCategories.flatMap((category) =>
  category.messages.map((message) => ({
    id: message.id,
    categoryId: category.id,
    label: message.label,
    text: message.text,
    tone: mapTone(message.tone),
    visibility: 'all'
  }))
);

const manifestAletheiaCategories = aletheiaMessageCategories.map((category, index) => ({
  id: category.id,
  label: category.label,
  description: category.description,
  displayOrder: index + 1,
  messages: category.messages.map((message) => ({
    id: message.id,
    categoryId: category.id,
    label: message.label,
    text: message.text,
    tone: message.tone,
    visibility: 'all' as const
  }))
}));

const manifestGmScriptScenes: MissionGmScriptScene[] = mission01GmScript.map((scene) => ({
  id: scene.id,
  sceneId: scene.id,
  title: scene.title,
  summary: scene.sceneFunction,
  readAloud: scene.readAloud,
  gmOnlyNotes: scene.secretNotes,
  beats: [
    ...scene.gmObjective.map((text, index) => ({
      id: `${scene.id}-objective-${index + 1}`,
      label: `Objectif MJ ${index + 1}`,
      text,
      type: 'setup' as const
    })),
    ...scene.visibleInfo.map((text, index) => ({
      id: `${scene.id}-visible-${index + 1}`,
      label: `Info visible ${index + 1}`,
      text,
      type: 'note' as const
    })),
    ...scene.possibleComplications.map((text, index) => ({
      id: `${scene.id}-complication-${index + 1}`,
      label: `Complication ${index + 1}`,
      text,
      type: 'pressure' as const
    })),
    ...scene.controlSuggestions.map((text, index) => ({
      id: `${scene.id}-control-${index + 1}`,
      label: `Contrôle ${index + 1}`,
      text,
      type: 'prompt' as const
    }))
  ]
}));

const manifestPlayerIntel: MissionPlayerIntel[] = scenePlayerIntel.map((intel) => ({
  id: intel.id,
  sceneId: intel.sceneId,
  title: intel.title,
  type: intel.type,
  target: intel.target,
  text: intel.text,
  tone: mapTone(intel.tone),
  visibility: 'send_manual_only'
}));

const manifestMap: MissionMapConfig = {
  id: 'mission01-map',
  title: 'Mission 01 Tactical Map',
  assetId: 'mission01-map-image',
  imagePath: '/assets/maps/PLATEAU.png',
  coordinateSystem: {
    kind: 'percent'
  },
  miniMapEnabled: true,
  largeMapEnabled: true,
  defaultVisibleTokenIds: MISSION01_TACTICAL_TOKENS
    .filter((token) => token.visibleToPlayers)
    .map((token) => token.id)
};

const manifestAudio: MissionAudioConfig = {
  defaultProfileId: 'new_carthage',
  profiles: LOCATIONS.map((location) => {
    const profile = getAudioProfile(location.id);
    return {
      id: location.id,
      label: location.label,
      volume: Math.max(profile.windGain, profile.humGain, profile.radioGain, profile.stormGain, profile.houndsGain)
    };
  }),
  locationProfileMap: Object.fromEntries(LOCATIONS.map((location) => [location.id, location.id]))
};

export const mission01Manifest: MissionManifest = {
  schemaVersion: '1.0.0',
  metadata: {
    id: 'mission-01-sol-rouge',
    title: 'SOL ROUGE',
    season: 'FIRST SOIL',
    number: 1,
    missionNumber: '01',
    locale: 'fr-FR',
    tags: ['MARATHON', 'UESC', 'Tau Ceti IV']
  },
  assetsBasePath: '/missions/mission-01-sol-rouge/assets',
  assets: manifestAssets,
  bootSequence: {
    id: 'mission01-boot',
    enabled: true,
    initialPhase: 'boot_idle',
    holdPercent: 52,
    introVideoAssetId: 'boot-video',
    startSceneId: 'depart_new_carthage',
    startLocationId: 'new_carthage'
  },
  locations: manifestLocations,
  scenes: manifestScenes,
  resources: manifestResources,
  tokens: manifestTokens,
  npcs: [
    {
      id: 'aletheia',
      name: transmissionProfiles.aletheia.speakerName,
      role: transmissionProfiles.aletheia.speakerRole,
      transmissionProfileId: transmissionProfiles.aletheia.id,
      playerVisible: true,
      tags: ['ai', 'terminal']
    },
    {
      id: 'rowe',
      name: transmissionProfiles.rowe.speakerName,
      role: transmissionProfiles.rowe.speakerRole,
      transmissionProfileId: transmissionProfiles.rowe.id,
      playerVisible: true,
      tags: ['command']
    },
    {
      id: 'velen',
      name: transmissionProfiles.velen.speakerName,
      role: transmissionProfiles.velen.speakerRole,
      transmissionProfileId: transmissionProfiles.velen.id,
      playerVisible: true,
      tags: ['survivor', 'delta6']
    }
  ],
  aletheia: {
    categories: manifestAletheiaCategories,
    sceneMap: aletheiaSceneCategoryMap,
    fallbackCategoryIds: ['departure', 'refusal_evasion']
  },
  aletheiaCategories: manifestAletheiaCategories,
  aletheiaMessages: manifestAletheiaMessages,
  gmScript: mission01GmScript,
  gmScriptScenes: manifestGmScriptScenes,
  playerIntel: manifestPlayerIntel,
  map: manifestMap,
  audio: manifestAudio,
  initialSceneId: 'depart_new_carthage',
  initialLocationId: 'new_carthage'
};
