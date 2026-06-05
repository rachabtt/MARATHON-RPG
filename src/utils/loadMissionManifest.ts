import type { MissionManifest } from '../types/missionSchema';
import { mission01Manifest } from '../missions/mission-01-sol-rouge/missionManifest';

const FALLBACK_MISSION_ID = 'mission-01-sol-rouge';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function logMissionLoaderInfo(message: string, details?: unknown) {
  if (!import.meta.env.DEV) return;
  if (details === undefined) {
    console.info(`[mission-loader] ${message}`);
    return;
  }
  console.info(`[mission-loader] ${message}`, details);
}

function logMissionLoaderWarning(message: string, details?: unknown) {
  if (!import.meta.env.DEV) return;
  if (details === undefined) {
    console.warn(`[mission-loader] ${message}`);
    return;
  }
  console.warn(`[mission-loader] ${message}`, details);
}

export function getMissionJsonPath(missionId: string): string {
  return `/missions/${encodeURIComponent(missionId)}/mission.json`;
}

export function validateMissionManifest(data: unknown): MissionManifest {
  if (!isRecord(data)) {
    throw new Error('Mission manifest must be a JSON object.');
  }

  const metadata = data.metadata;
  if (!isRecord(metadata)) {
    throw new Error('Mission manifest is missing metadata.');
  }

  if (typeof metadata.id !== 'string' || metadata.id.trim().length === 0) {
    throw new Error('Mission manifest is missing metadata.id.');
  }

  if (typeof metadata.title !== 'string' || metadata.title.trim().length === 0) {
    throw new Error('Mission manifest is missing metadata.title.');
  }

  if (typeof data.assetsBasePath !== 'string' || data.assetsBasePath.trim().length === 0) {
    throw new Error('Mission manifest is missing assetsBasePath.');
  }

  if (!Array.isArray(data.scenes)) {
    throw new Error('Mission manifest is missing scenes array.');
  }

  return data as MissionManifest;
}

export async function loadMissionManifest(missionId: string): Promise<MissionManifest> {
  const missionJsonPath = getMissionJsonPath(missionId);

  try {
    const response = await fetch(missionJsonPath);
    if (!response.ok) {
      throw new Error(`Mission JSON request failed with HTTP ${response.status}.`);
    }

    const data = await response.json();
    const manifest = validateMissionManifest(data);
    logMissionLoaderInfo('JSON mission loaded', {
      missionId: manifest.metadata.id,
      path: missionJsonPath
    });
    return manifest;
  } catch (error) {
    logMissionLoaderWarning('validation error or JSON load failure', {
      missionId,
      path: missionJsonPath,
      error
    });

    if (missionId === FALLBACK_MISSION_ID) {
      logMissionLoaderInfo('fallback mission manifest used', {
        missionId: mission01Manifest.metadata.id
      });
      return mission01Manifest;
    }

    throw error;
  }
}
