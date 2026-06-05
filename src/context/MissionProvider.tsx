import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { MissionManifest } from '../types/missionSchema';
import {
  availableMissions,
  defaultMissionManifest,
  getMissionManifestById
} from '../missions';

type MissionContextValue = {
  currentMission: MissionManifest;
  currentMissionId: string;
  setCurrentMissionId: (missionId: string) => void;
  availableMissions: MissionManifest[];
};

const DEFAULT_MISSION_ID = 'mission-01-sol-rouge';

const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [currentMissionId, setCurrentMissionId] = useState(DEFAULT_MISSION_ID);
  const currentMission = getMissionManifestById(currentMissionId) ?? defaultMissionManifest;

  const value = useMemo<MissionContextValue>(() => ({
    currentMission,
    currentMissionId,
    setCurrentMissionId,
    availableMissions
  }), [currentMission, currentMissionId]);

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
