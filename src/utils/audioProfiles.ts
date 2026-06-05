import type { LocationId } from "./locations";
import type { MissionAudioConfig } from "../types/missionSchema";

export interface AudioProfile {
  windFilterHz: number;
  windQ: number;
  windGain: number;
  humGain: number;
  radioGain: number;
  stormGain: number;
  houndsGain: number;
}

export type ResolvedWindIntensity = "none" | "veryLow" | "low" | "medium" | "mediumHigh" | "high";
export type ResolvedProfileLevel = "none" | "veryLow" | "low" | "subtle" | "medium" | "high";

export interface ResolvedAudioProfile extends AudioProfile {
  normalizedLocationId: string;
  normalizedMoodId: string;
  normalizedSceneId?: string;
  windIntensity: ResolvedWindIntensity;
  particles: ResolvedProfileLevel;
  silence: boolean;
  radioNoise: ResolvedProfileLevel;
  lowFrequencyHum: ResolvedProfileLevel;
  scannerHum: ResolvedProfileLevel;
  emInstability: ResolvedProfileLevel;
  audioWindVolumeMax: number;
  audioStormVolumeMax: number;
  audioRadioVolumeMax: number;
  audioHumVolumeMax: number;
  visualWindSpeedMax: number;
  visualParticleDensityMax: number;
}

export type ResolvedAudioProfileInput = {
  locationId?: LocationId | string | null;
  moodId?: string | null;
  sceneId?: string | null;
  isStormActive?: boolean;
  missionAudio?: MissionAudioConfig;
};

function normalizeLocationId(locationId?: LocationId | string | null): string {
  return (locationId ?? "delta6").replace(/-/g, "_");
}

function normalizeMoodId(moodId?: string | null): string {
  const normalized = (moodId ?? "normal").replace(/_/g, "-");
  if (normalized === "signal-instable") return "signal";
  if (normalized === "tempete" || normalized === "tempete-em") return "storm";
  if (normalized === "calme") return "normal";
  if (normalized === "tension") return "dust";
  return normalized;
}

function normalizeSceneId(sceneId?: string | null): string | undefined {
  if (!sceneId) return undefined;
  const normalized = sceneId.replace(/_/g, "-");
  if (normalized === "finale-terminal" || normalized === "final-terminal") return "finale-terminal";
  return normalized;
}

function getMissionAudioProfileOverride(
  missionAudio: MissionAudioConfig | undefined,
  source: "location" | "mood" | "scene",
  id: string | undefined
): Partial<ResolvedAudioProfile> {
  if (!missionAudio || !id) return {};
  if (source === "location") return (missionAudio.locationProfiles?.[id] ?? {}) as Partial<ResolvedAudioProfile>;
  if (source === "mood") return (missionAudio.moodProfiles?.[id] ?? {}) as Partial<ResolvedAudioProfile>;
  return (missionAudio.sceneOverrides?.[id] ?? {}) as Partial<ResolvedAudioProfile>;
}

export function getAudioProfile(locationId: LocationId | string | undefined): AudioProfile {
  switch (normalizeLocationId(locationId)) {
    case "new_carthage":
      return {
        windFilterHz: 240,
        windQ: 0.9,
        windGain: 0.28,
        humGain: 0.86,
        radioGain: 0.82,
        stormGain: 0.55,
        houndsGain: 0.75,
      };
    case "red_plains":
      return {
        windFilterHz: 520,
        windQ: 1.15,
        windGain: 1.22,
        humGain: 0.58,
        radioGain: 1.18,
        stormGain: 1.1,
        houndsGain: 0.85,
      };
    case "black_arches":
      return {
        windFilterHz: 180,
        windQ: 0.7,
        windGain: 0.08,
        humGain: 0.92,
        radioGain: 0.82,
        stormGain: 1.0,
        houndsGain: 1.32,
      };
    case "delta6":
    default:
      return {
        windFilterHz: 420,
        windQ: 1.9,
        windGain: 1.0,
        humGain: 0.68,
        radioGain: 1.2,
        stormGain: 1.2,
        houndsGain: 1.1,
      };
  }
}

export function getResolvedAudioProfile({
  locationId,
  moodId,
  sceneId,
  isStormActive = false,
  missionAudio,
}: ResolvedAudioProfileInput): ResolvedAudioProfile {
  const normalizedLocationId = normalizeLocationId(locationId);
  const normalizedMoodId = normalizeMoodId(moodId);
  const normalizedSceneId = normalizeSceneId(sceneId);
  const base = getAudioProfile(normalizedLocationId);

  let resolved: ResolvedAudioProfile = {
    ...base,
    normalizedLocationId,
    normalizedMoodId,
    normalizedSceneId,
    windIntensity: "medium",
    particles: "medium",
    silence: false,
    radioNoise: "low",
    lowFrequencyHum: "subtle",
    scannerHum: "none",
    emInstability: "none",
    audioWindVolumeMax: 0.42,
    audioStormVolumeMax: 0.32,
    audioRadioVolumeMax: 0.55,
    audioHumVolumeMax: 0.32,
    visualWindSpeedMax: 1.5,
    visualParticleDensityMax: 180,
  };

  if (normalizedLocationId === "new_carthage") {
    resolved = {
      ...resolved,
      windIntensity: "low",
      particles: "low",
      radioNoise: "low",
      lowFrequencyHum: "medium",
      audioWindVolumeMax: 0.12,
      audioStormVolumeMax: 0.08,
      audioRadioVolumeMax: 0.24,
      audioHumVolumeMax: 0.34,
      visualWindSpeedMax: 0.42,
      visualParticleDensityMax: 44,
    };
  } else if (normalizedLocationId === "red_plains") {
    resolved = {
      ...resolved,
      windIntensity: "medium",
      particles: "medium",
      radioNoise: "medium",
      audioWindVolumeMax: 0.48,
      audioStormVolumeMax: 0.38,
      visualWindSpeedMax: 1.85,
      visualParticleDensityMax: 220,
    };
  } else if (normalizedLocationId === "black_arches") {
    resolved = {
      ...resolved,
      windIntensity: "veryLow",
      particles: "veryLow",
      silence: true,
      radioNoise: "subtle",
      lowFrequencyHum: "veryLow",
      audioWindVolumeMax: 0.025,
      audioStormVolumeMax: 0.025,
      audioRadioVolumeMax: 0.22,
      audioHumVolumeMax: 0.22,
      visualWindSpeedMax: 0.14,
      visualParticleDensityMax: 28,
    };
  } else if (normalizedLocationId === "delta6") {
    resolved = {
      ...resolved,
      windIntensity: "low",
      particles: "low",
      scannerHum: "medium",
      radioNoise: "medium",
      audioWindVolumeMax: 0.24,
      audioStormVolumeMax: 0.18,
      audioRadioVolumeMax: 0.50,
      visualWindSpeedMax: 0.95,
      visualParticleDensityMax: 120,
    };
  }

  if (normalizedMoodId === "signal") {
    const signalWindCaps: Record<string, { audio: number; visual: number; particles: number; storm: number }> = {
      new_carthage: { audio: 0.08, visual: 0.32, particles: 34, storm: 0.03 },
      red_plains: { audio: 0.32, visual: 1.35, particles: 170, storm: 0.16 },
      black_arches: { audio: 0.02, visual: 0.12, particles: 24, storm: 0.015 },
      delta6: { audio: 0.20, visual: 0.85, particles: 110, storm: 0.12 },
    };
    const cap = signalWindCaps[normalizedLocationId] ?? signalWindCaps.delta6;

    resolved = {
      ...resolved,
      radioNoise: normalizedLocationId === "black_arches" ? "subtle" : "medium",
      emInstability: "subtle",
      audioWindVolumeMax: Math.min(resolved.audioWindVolumeMax, cap.audio),
      visualWindSpeedMax: Math.min(resolved.visualWindSpeedMax, cap.visual),
      visualParticleDensityMax: Math.min(resolved.visualParticleDensityMax, cap.particles),
      audioRadioVolumeMax: Math.min(resolved.audioRadioVolumeMax, normalizedLocationId === "black_arches" ? 0.20 : 0.50),
      audioStormVolumeMax: Math.min(resolved.audioStormVolumeMax, cap.storm),
    };
  }

  if (normalizedMoodId === "scanner") {
    resolved = {
      ...resolved,
      scannerHum: "medium",
      audioWindVolumeMax: Math.min(resolved.audioWindVolumeMax, 0.26),
      audioStormVolumeMax: Math.min(resolved.audioStormVolumeMax, 0.18),
    };
  }

  if (normalizedMoodId === "extraction") {
    resolved = {
      ...resolved,
      windIntensity: isStormActive ? "high" : "mediumHigh",
      particles: isStormActive ? "high" : "medium",
      emInstability: isStormActive ? "high" : "medium",
      audioWindVolumeMax: isStormActive ? 0.74 : 0.46,
      audioStormVolumeMax: isStormActive ? 0.74 : 0.42,
      visualWindSpeedMax: isStormActive ? 3.4 : 2.2,
      visualParticleDensityMax: isStormActive ? 360 : 260,
    };
  }

  if (normalizedMoodId === "storm" || isStormActive) {
    resolved = {
      ...resolved,
      windIntensity: "high",
      particles: "high",
      radioNoise: "high",
      emInstability: "high",
      silence: false,
      audioWindVolumeMax: 0.74,
      audioStormVolumeMax: 0.74,
      audioRadioVolumeMax: 0.92,
      visualWindSpeedMax: 3.4,
      visualParticleDensityMax: 360,
    };
  }

  resolved = {
    ...resolved,
    ...getMissionAudioProfileOverride(missionAudio, "location", normalizedLocationId),
    ...getMissionAudioProfileOverride(missionAudio, "mood", normalizedMoodId),
    ...getMissionAudioProfileOverride(missionAudio, "scene", normalizedSceneId),
  };

  if (normalizedMoodId === "signal") {
    const signalWindCaps: Record<string, { audio: number; visual: number; particles: number; storm: number }> = {
      new_carthage: { audio: 0.08, visual: 0.32, particles: 34, storm: 0.03 },
      red_plains: { audio: 0.32, visual: 1.35, particles: 170, storm: 0.16 },
      black_arches: { audio: 0.02, visual: 0.12, particles: 24, storm: 0.015 },
      delta6: { audio: 0.20, visual: 0.85, particles: 110, storm: 0.12 },
    };
    const cap = signalWindCaps[normalizedLocationId] ?? signalWindCaps.delta6;

    resolved = {
      ...resolved,
      radioNoise: normalizedLocationId === "black_arches" ? "subtle" : "medium",
      emInstability: "subtle",
      audioWindVolumeMax: Math.min(resolved.audioWindVolumeMax, cap.audio),
      visualWindSpeedMax: Math.min(resolved.visualWindSpeedMax, cap.visual),
      visualParticleDensityMax: Math.min(resolved.visualParticleDensityMax, cap.particles),
      audioRadioVolumeMax: Math.min(resolved.audioRadioVolumeMax, normalizedLocationId === "black_arches" ? 0.20 : 0.50),
      audioStormVolumeMax: Math.min(resolved.audioStormVolumeMax, cap.storm),
    };
  }

  if (normalizedMoodId === "storm" || isStormActive) {
    resolved = {
      ...resolved,
      windIntensity: "high",
      particles: "high",
      radioNoise: "high",
      emInstability: "high",
      silence: false,
      audioWindVolumeMax: Math.max(resolved.audioWindVolumeMax, 0.74),
      audioStormVolumeMax: Math.max(resolved.audioStormVolumeMax, 0.74),
      audioRadioVolumeMax: Math.max(resolved.audioRadioVolumeMax, 0.92),
      visualWindSpeedMax: Math.max(resolved.visualWindSpeedMax, 3.4),
      visualParticleDensityMax: Math.max(resolved.visualParticleDensityMax, 360),
    };
  }

  if (normalizedLocationId === "black_arches" && normalizedMoodId !== "storm" && !isStormActive) {
    resolved = {
      ...resolved,
      windIntensity: "veryLow",
      particles: "veryLow",
      silence: true,
      windGain: Math.min(resolved.windGain, 0.04),
      stormGain: Math.min(resolved.stormGain, 0.08),
      audioWindVolumeMax: Math.min(resolved.audioWindVolumeMax, 0.02),
      audioStormVolumeMax: Math.min(resolved.audioStormVolumeMax, 0.015),
      visualWindSpeedMax: Math.min(resolved.visualWindSpeedMax, 0.12),
      visualParticleDensityMax: Math.min(resolved.visualParticleDensityMax, 24),
    };
  }

  if (normalizedLocationId === "new_carthage" && normalizedMoodId !== "storm" && !isStormActive) {
    resolved = {
      ...resolved,
      windIntensity: resolved.windIntensity === "none" ? "none" : "low",
      windGain: Math.min(resolved.windGain, 0.22),
      stormGain: Math.min(resolved.stormGain, 0.18),
      audioWindVolumeMax: Math.min(resolved.audioWindVolumeMax, 0.10),
      audioStormVolumeMax: Math.min(resolved.audioStormVolumeMax, 0.04),
      visualWindSpeedMax: Math.min(resolved.visualWindSpeedMax, 0.36),
      visualParticleDensityMax: Math.min(resolved.visualParticleDensityMax, 38),
    };
  }

  if (normalizedSceneId === "finale-terminal") {
    resolved = {
      ...resolved,
      windIntensity: "none",
      particles: "none",
      silence: true,
      radioNoise: "veryLow",
      lowFrequencyHum: "subtle",
      emInstability: "veryLow",
      windGain: 0,
      stormGain: 0,
      audioWindVolumeMax: 0,
      audioStormVolumeMax: 0,
      audioRadioVolumeMax: 0.08,
      visualWindSpeedMax: 0,
      visualParticleDensityMax: 0,
    };
  }

  return resolved;
}
