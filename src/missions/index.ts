import type { MissionManifest } from '../types/missionSchema';
import { mission01Manifest } from './mission-01-sol-rouge/missionManifest';

export const mission02ColdStorageManifest: MissionManifest = {
  schemaVersion: '1.0.0',
  metadata: {
    id: 'mission-02-cold-storage',
    title: 'COLD STORAGE',
    season: 'FIRST SOIL',
    number: 2,
    missionNumber: '02',
    locale: 'fr-FR',
    tags: ['MARATHON', 'UESC']
  },
  assetsBasePath: '/missions/mission-02-cold-storage/assets',
  assets: [],
  bootSequence: {
    id: 'mission02-boot',
    enabled: false,
    initialPhase: 'mission_live'
  },
  locations: [],
  scenes: [],
  resources: [],
  tokens: [],
  npcs: [],
  aletheia: {
    categories: [],
    sceneMap: {},
    fallbackCategoryIds: []
  },
  aletheiaCategories: [],
  aletheiaMessages: [],
  gmScript: [],
  gmScriptScenes: [],
  playerIntel: []
};

export const availableMissions: MissionManifest[] = [
  mission01Manifest,
  mission02ColdStorageManifest
];

export function getMissionManifestById(id: string): MissionManifest | undefined {
  return availableMissions.find((mission) => mission.metadata.id === id);
}

export const defaultMissionManifest = mission01Manifest;
