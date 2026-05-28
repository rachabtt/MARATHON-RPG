import type { LocationId } from "./locations";

export interface PointAnchor {
  x: number;
  y: number;
}

export interface LocationAnchors {
  skyGlow: PointAnchor;
  scannerPulse: PointAnchor;
  radioZone: PointAnchor;
  mirageBand: { y: number; height: number };
  lightSources: PointAnchor[];
  houndZones: {
    entry: PointAnchor;
    exit: PointAnchor;
    cover: PointAnchor;
  };
}

export const LOCATION_ANCHORS: Record<LocationId, LocationAnchors> = {
  new_carthage: {
    skyGlow: { x: 0.46, y: 0.14 },
    scannerPulse: { x: 0.58, y: 0.42 },
    radioZone: { x: 0.74, y: 0.28 },
    mirageBand: { y: 0.34, height: 0.16 },
    lightSources: [
      { x: 0.22, y: 0.18 },
      { x: 0.73, y: 0.20 },
    ],
    houndZones: {
      entry: { x: -0.12, y: 0.76 },
      exit: { x: 0.38, y: 0.79 },
      cover: { x: 0.28, y: 0.72 },
    },
  },
  red_plains: {
    skyGlow: { x: 0.52, y: 0.22 },
    scannerPulse: { x: 0.64, y: 0.48 },
    radioZone: { x: 0.70, y: 0.34 },
    mirageBand: { y: 0.38, height: 0.18 },
    lightSources: [
      { x: 0.18, y: 0.42 },
      { x: 0.78, y: 0.38 },
    ],
    houndZones: {
      entry: { x: -0.18, y: 0.62 },
      exit: { x: 1.12, y: 0.57 },
      cover: { x: 0.58, y: 0.60 },
    },
  },
  black_arches: {
    skyGlow: { x: 0.50, y: 0.12 },
    scannerPulse: { x: 0.58, y: 0.50 },
    radioZone: { x: 0.62, y: 0.30 },
    mirageBand: { y: 0.42, height: 0.22 },
    lightSources: [
      { x: 0.43, y: 0.22 },
      { x: 0.60, y: 0.24 },
    ],
    houndZones: {
      entry: { x: -0.08, y: 0.66 },
      exit: { x: 0.78, y: 0.62 },
      cover: { x: 0.52, y: 0.55 },
    },
  },
  delta6: {
    skyGlow: { x: 0.58, y: 0.18 },
    scannerPulse: { x: 0.63, y: 0.48 },
    radioZone: { x: 0.84, y: 0.24 },
    mirageBand: { y: 0.48, height: 0.12 },
    lightSources: [
      { x: 0.20, y: 0.58 },
      { x: 0.63, y: 0.48 },
      { x: 0.78, y: 0.42 },
    ],
    houndZones: {
      entry: { x: 0.98, y: 0.72 },
      exit: { x: 0.34, y: 0.70 },
      cover: { x: 0.54, y: 0.66 },
    },
  },
};

export function getLocationAnchors(locationId: LocationId | string | undefined): LocationAnchors {
  return LOCATION_ANCHORS[(locationId as LocationId) || "delta6"] ?? LOCATION_ANCHORS.delta6;
}
