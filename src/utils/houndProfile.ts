import type { LocationId } from "./locations";

export type HoundVariant = "distant_silhouette" | "low_shadow" | "equipment_reflection";

export interface HoundVisualProfile {
  variant: HoundVariant;
  opacity: number;
  blurPx: number;
  scale: number;
  durationMs: number;
  showOnlyOnBurst: boolean;
}

export function getHoundVisualProfile(locationId: LocationId | string | undefined): HoundVisualProfile {
  switch (locationId) {
    case "red_plains":
      return {
        variant: "distant_silhouette",
        opacity: 0.42,
        blurPx: 8,
        scale: 0.72,
        durationMs: 1600,
        showOnlyOnBurst: false,
      };
    case "black_arches":
      return {
        variant: "low_shadow",
        opacity: 0.58,
        blurPx: 12,
        scale: 0.92,
        durationMs: 1400,
        showOnlyOnBurst: false,
      };
    case "delta6":
      return {
        variant: "equipment_reflection",
        opacity: 0.54,
        blurPx: 9,
        scale: 0.82,
        durationMs: 1500,
        showOnlyOnBurst: false,
      };
    case "new_carthage":
    default:
      return {
        variant: "low_shadow",
        opacity: 0.22,
        blurPx: 16,
        scale: 0.65,
        durationMs: 1100,
        showOnlyOnBurst: true,
      };
  }
}
