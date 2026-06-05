import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { MissionManifest } from '../types/missionSchema';
import {
  availableMissions,
  defaultMissionManifest,
  getMissionManifestById
} from '../missions';
import { loadMissionManifest } from '../utils/loadMissionManifest';

type MissionContextValue = {
  currentMission: MissionManifest;
  currentMissionId: string;
  setCurrentMissionId: (missionId: string) => void;
  availableMissions: MissionManifest[];
  isMissionLoading: boolean;
  missionLoadError?: Error;
};

const DEFAULT_MISSION_ID = 'mission-01-sol-rouge';

const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [currentMissionId, setCurrentMissionId] = useState(DEFAULT_MISSION_ID);
  const [currentMission, setCurrentMission] = useState<MissionManifest>(
    () => getMissionManifestById(DEFAULT_MISSION_ID) ?? defaultMissionManifest
  );
  const [isMissionLoading, setIsMissionLoading] = useState(false);
  const [missionLoadError, setMissionLoadError] = useState<Error | undefined>();

  useEffect(() => {
    let cancelled = false;
    const fallbackMission = getMissionManifestById(currentMissionId) ?? defaultMissionManifest;

    setCurrentMission(fallbackMission);
    setIsMissionLoading(true);
    setMissionLoadError(undefined);

    loadMissionManifest(currentMissionId)
      .then((loadedMission) => {
        if (cancelled) return;
        setCurrentMission(loadedMission);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setCurrentMission(fallbackMission);
        setMissionLoadError(error instanceof Error ? error : new Error(String(error)));
      })
      .finally(() => {
        if (cancelled) return;
        setIsMissionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentMissionId]);

  const value = useMemo<MissionContextValue>(() => ({
    currentMission,
    currentMissionId,
    setCurrentMissionId,
    availableMissions,
    isMissionLoading,
    missionLoadError
  }), [currentMission, currentMissionId, isMissionLoading, missionLoadError]);

  return (
    <MissionContext.Provider value={value}>
      {children}
    </MissionContext.Provider>
  );
}

export function useMission(): MissionContextValue {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider.');
  }

  return context;
}
