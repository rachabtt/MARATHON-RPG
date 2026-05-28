import type { LocationId } from "./locations";

export interface AudioProfile {
  windFilterHz: number;
  windQ: number;
  windGain: number;
  humGain: number;
  radioGain: number;
  stormGain: number;
  houndsGain: number;
}

export function getAudioProfile(locationId: LocationId | string | undefined): AudioProfile {
  switch (locationId) {
    case "new_carthage":
      return {
        windFilterHz: 320,
        windQ: 1.6,
        windGain: 0.72,
        humGain: 0.72,
        radioGain: 1.08,
        stormGain: 0.78,
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
        windFilterHz: 760,
        windQ: 2.4,
        windGain: 0.92,
        humGain: 0.62,
        radioGain: 1.36,
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
