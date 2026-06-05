import type { MissionManifest } from '../types/missionSchema';
import { mission01Manifest } from './mission-01-sol-rouge/missionManifest';

export const availableMissions: MissionManifest[] = [
  mission01Manifest
];

export function getMissionManifestById(id: string): MissionManifest | undefined {
  return availableMissions.find((mission) => mission.metadata.id === id);
}

export const defaultMissionManifest = mission01Manifest;
