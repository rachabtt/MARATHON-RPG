import type { LocationId } from "./locations";
import type { CinemagraphConfig } from "../types";

export type AmbienceId = "calme" | "tension" | "signal" | "tempete" | "extraction" | "hounds";

export interface LocationEffectProfile {
  filter: string;
  haze: string;
  hazeOpacity: number;
  particleSpeed: number;
  particleDensity: number;
  particleDrift: number;
  vignetteOpacity: number;
  scanlineOpacity: number;
  ghostingOpacity: number;
  cameraShake: number;
  lightStability: number;
  scannerBias: number;
  radioBias: number;
  stormBias: number;
}

const BASE_PROFILE: LocationEffectProfile = {
  filter: "contrast(1.02) saturate(1.02)",
  haze: "linear-gradient(115deg, rgba(148, 51, 34, 0.10), rgba(64, 35, 28, 0.18) 55%, rgba(0, 0, 0, 0.10))",
  hazeOpacity: 0.16,
  particleSpeed: 1,
  particleDensity: 1,
  particleDrift: 0.08,
  vignetteOpacity: 0.22,
  scanlineOpacity: 0.24,
  ghostingOpacity: 0,
  cameraShake: 0,
  lightStability: 1,
  scannerBias: 1,
  radioBias: 1,
  stormBias: 1,
};

function ambienceFromConfig(config: CinemagraphConfig): AmbienceId {
  if (config.environmentFilter === "signal") return "signal";
  if (config.environmentFilter === "storm") return "tempete";
  if (config.environmentFilter === "extraction") return "extraction";
  if (config.environmentFilter === "hounds") return "hounds";
  if (config.environmentFilter === "dust" || config.environmentFilter === "scanner") return "tension";
  return "calme";
}

function mergeProfile(...profiles: Partial<LocationEffectProfile>[]): LocationEffectProfile {
  return Object.assign({}, BASE_PROFILE, ...profiles);
}

export function getLocationEffectProfile(
  locationId: LocationId | string | undefined,
  config: CinemagraphConfig
): LocationEffectProfile {
  const ambience = ambienceFromConfig(config);

  const locationProfile: Record<LocationId, Partial<LocationEffectProfile>> = {
    new_carthage: {
      filter: "brightness(1.08) contrast(1.04) saturate(0.86) sepia(0.06)",
      haze: "linear-gradient(180deg, rgba(255, 180, 90, 0.08), rgba(25, 28, 26, 0.18) 68%, rgba(0, 0, 0, 0.08))",
      hazeOpacity: 0.12,
      particleSpeed: 0.30,
      particleDensity: 0.32,
      particleDrift: 0.012,
      vignetteOpacity: 0.14,
      scanlineOpacity: 0.18,
      lightStability: 1.18,
      radioBias: 0.75,
      stormBias: 0.8,
    },
    red_plains: {
      filter: "brightness(0.94) contrast(1.08) saturate(1.38) sepia(0.12)",
      haze: "linear-gradient(90deg, rgba(133, 44, 26, 0.22), rgba(190, 76, 42, 0.12), rgba(65, 33, 28, 0.25))",
      hazeOpacity: 0.22,
      particleSpeed: 1.25,
      particleDensity: 1.15,
      particleDrift: 0.015,
      vignetteOpacity: 0.25,
      cameraShake: 0.45,
      radioBias: 1.18,
    },
    black_arches: {
      filter: "brightness(0.88) contrast(1.22) saturate(0.86) sepia(0.06)",
      haze: "linear-gradient(180deg, rgba(104, 81, 68, 0.08), rgba(18, 18, 18, 0.18) 48%, rgba(0, 0, 0, 0.34) 100%)",
      hazeOpacity: 0.10,
      particleSpeed: 0.10,
      particleDensity: 0.22,
      particleDrift: 0.006,
      vignetteOpacity: 0.32,
      scanlineOpacity: 0.22,
      ghostingOpacity: 0.14,
      lightStability: 0.82,
      radioBias: 0.88,
    },
    delta6: {
      filter: "brightness(0.96) contrast(1.12) saturate(1.05) sepia(0.04)",
      haze: "linear-gradient(125deg, rgba(156, 63, 45, 0.14), rgba(28, 23, 20, 0.30) 58%, rgba(0, 0, 0, 0.14))",
      hazeOpacity: 0.24,
      particleSpeed: 1.05,
      particleDensity: 1.18,
      particleDrift: 0.07,
      vignetteOpacity: 0.28,
      scannerBias: 1.35,
      radioBias: 1.1,
      stormBias: 1.15,
    },
  };

  const ambienceProfile: Record<AmbienceId, Partial<LocationEffectProfile>> = {
    calme: {
      particleDensity: 0.7,
      scanlineOpacity: 0.16,
      ghostingOpacity: 0,
      cameraShake: 0,
      lightStability: 1.1,
    },
    tension: {
      filter: "contrast(1.08) brightness(0.93)",
      particleDensity: 1.2,
      particleSpeed: 1.18,
      vignetteOpacity: 0.34,
      scanlineOpacity: 0.28,
      cameraShake: 0.35,
      lightStability: 0.88,
      scannerBias: 1.15,
    },
    signal: {
      filter: "contrast(1.18) brightness(0.98) saturate(1.12)",
      scanlineOpacity: 0.46,
      ghostingOpacity: 0.24,
      cameraShake: 0.55,
      lightStability: 0.76,
      radioBias: 1.85,
    },
    tempete: {
      filter: "brightness(0.74) contrast(1.24) saturate(1.18)",
      hazeOpacity: 0.48,
      particleDensity: 2.2,
      particleSpeed: 2.4,
      vignetteOpacity: 0.46,
      scanlineOpacity: 0.52,
      cameraShake: 0.85,
      lightStability: 0.58,
      stormBias: 1.9,
    },
    extraction: {
      filter: "brightness(0.72) contrast(1.36) saturate(1.28) sepia(0.18)",
      hazeOpacity: 0.54,
      particleDensity: 2.4,
      particleSpeed: 2,
      vignetteOpacity: 0.52,
      scanlineOpacity: 0.42,
      ghostingOpacity: 0.12,
      cameraShake: 0.7,
      lightStability: 0.7,
      stormBias: 1.45,
    },
    hounds: {
      filter: "brightness(0.68) contrast(1.34) saturate(0.82)",
      vignetteOpacity: 0.56,
      ghostingOpacity: 0.18,
      cameraShake: 0.5,
      lightStability: 0.62,
      radioBias: 1.2,
    },
  };

  const loc = locationProfile[(locationId as LocationId) || "delta6"] ?? locationProfile.delta6;
  const amb = ambienceProfile[ambience];
  const merged = mergeProfile(loc, amb);
  merged.filter = `${loc.filter ?? BASE_PROFILE.filter} ${amb.filter ?? ""}`.trim();
  if (locationId === "new_carthage" && ambience !== "tempete" && ambience !== "extraction") {
    merged.particleSpeed = Math.min(merged.particleSpeed, ambience === "signal" ? 0.42 : 0.32);
    merged.particleDensity = Math.min(merged.particleDensity, ambience === "signal" ? 0.44 : 0.34);
    merged.cameraShake = Math.min(merged.cameraShake, 0.14);
    merged.hazeOpacity = Math.min(merged.hazeOpacity, 0.16);
  }
  if (locationId === "black_arches") {
    if (ambience !== "tempete" && ambience !== "extraction") {
      merged.particleSpeed = Math.min(merged.particleSpeed, ambience === "signal" ? 0.18 : 0.12);
      merged.particleDensity = Math.min(merged.particleDensity, ambience === "signal" ? 0.30 : 0.24);
      merged.cameraShake = Math.min(merged.cameraShake, ambience === "signal" ? 0.18 : 0.08);
      merged.radioBias = Math.min(merged.radioBias, 0.95);
    } else {
      merged.radioBias = Math.max(merged.radioBias, 1.0);
    }
    merged.vignetteOpacity = Math.min(merged.vignetteOpacity, ambience === "signal" || ambience === "hounds" ? 0.34 : 0.28);
    merged.hazeOpacity = Math.min(merged.hazeOpacity, ambience === "tempete" || ambience === "extraction" ? 0.36 : 0.25);
    merged.ghostingOpacity = Math.max(merged.ghostingOpacity, ambience === "signal" ? 0.22 : ambience === "tension" ? 0.14 : 0.1);
  }
  return merged;
}
