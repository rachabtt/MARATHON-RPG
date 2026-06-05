import ncBaseImage from "../assets/locations/nc-base.png";
import delta6Image from "../assets/locations/delta6.png";
import redPlainsImage from "../assets/locations/red-plains.png";
import redPlainsPovImage from "../assets/locations/red-plains-pov.png";
import redPlainsWideLoop from "../assets/locations/loops/red-plains-wide-loop.mp4";
import blackArchesPovImage from "../assets/locations/black-arches-pov.png";
import blackArchesPovHoundImage from "../assets/locations/black-arches-pov-hound.png";

import type { CinemagraphConfig } from "../types";

// Discover available loop videos in the loops folder without failing when some are absent
const loopModules = import.meta.glob('../assets/locations/loops/*.{mp4,webm}', { eager: true, query: '?url', import: 'default' }) as Record<string,string>;
const LOOP_BY_NAME: Record<string,string> = {};
Object.keys(loopModules).forEach((p) => {
  const name = p.split('/').pop() || p;
  LOOP_BY_NAME[name] = loopModules[p];
});

export type LocationId =
  | "new_carthage"
  | "red_plains"
  | "black_arches"
  | "delta6";

export interface LocationInfo {
  id: LocationId;
  label: string;
  subtitle: string;
  image: string;
  wideVideo?: string;
  povImage?: string;
  houndImage?: string;
  loops?: {
    workers?: string;
    shipTakeoff?: string;
    roverPass?: string;
    easterEgg?: string;
  };
}

export const LOCATIONS: LocationInfo[] = [
  {
    id: "new_carthage",
    label: "NEW CARTHAGE",
    subtitle: "Colonie principale / staging UESC",
    image: ncBaseImage,
    loops: {
      workers: LOOP_BY_NAME['nc-workers-loop.mp4'],
      shipTakeoff: LOOP_BY_NAME['nc-ship-takeoff.mp4'],
      roverPass: LOOP_BY_NAME['nc-rover-pass.mp4'],
      easterEgg: LOOP_BY_NAME['nc-easter-egg.mp4']
    }
  },
  {
    id: "red_plains",
    label: "PLAINES ROUGES",
    subtitle: "Transit rover / route Delta-6",
    image: redPlainsImage,
    wideVideo: redPlainsWideLoop,
    povImage: redPlainsPovImage
  },
  {
    id: "black_arches",
    label: "ARCHES NOIRES",
    subtitle: "POV rover / échos radio",
    image: blackArchesPovImage,
    houndImage: blackArchesPovHoundImage
  },
  {
    id: "delta6",
    label: "SITE DELTA-6",
    subtitle: "Site géologique abandonné",
    image: delta6Image,
    wideVideo: LOOP_BY_NAME['delta6-loop.mp4'],
  },
];

export function getLocationById(
  id: LocationId | string | undefined
): LocationInfo {
  return (
    LOCATIONS.find((location) => location.id === id) ??
    LOCATIONS.find((location) => location.id === "delta6")!
  );
}

export function resolveLocationVisual(location: LocationInfo, config: CinemagraphConfig, displayOptions?: any) {
  // Defaults
  const result = {
    src: location.image,
    type: 'image' as const,
    label: location.label,
    variant: 'base',
    loop: false,
    oneShot: false,
  };

  // Black Arches: prefer explicit hound image when hound effects active
  if (location.id === 'black_arches') {
    const houndActive = config.visualHoundShadows === true || config.environmentFilter === 'hounds' || config.quickEffect?.type === 'ombre_hound';
    if (houndActive && location.houndImage) {
      result.src = location.houndImage;
      result.variant = 'hound';
      result.type = 'image';
      return result;
    }
    return result;
  }

  // Red Plains: honor explicit override, otherwise prefer POV for certain filters
  if (location.id === 'red_plains') {
    const override = displayOptions?.redPlainsVisualVariant;
    if (override === 'pov' && location.povImage) {
      result.src = location.povImage;
      result.variant = 'pov';
      return result;
    }
    if (override === 'wide') {
      result.src = location.wideVideo ?? location.image;
      result.type = location.wideVideo ? 'video' : 'image';
      result.variant = 'wide';
      result.loop = Boolean(location.wideVideo);
      return result;
    }
    const usePov = ['dust', 'signal', 'storm', 'extraction'].includes(String(config.environmentFilter));
    if (usePov && location.povImage) {
      result.src = location.povImage;
      result.variant = 'pov';
      return result;
    }
    result.src = location.wideVideo ?? location.image;
    result.type = location.wideVideo ? 'video' : 'image';
    result.variant = 'wide';
    result.loop = Boolean(location.wideVideo);
    return result;
  }

  if (location.id === 'delta6') {
    result.src = location.wideVideo ?? location.image;
    result.type = location.wideVideo ? 'video' : 'image';
    result.variant = location.wideVideo ? 'loop' : 'base';
    result.loop = Boolean(location.wideVideo);
    return result;
  }

  // New Carthage: choose based on displayOptions variant and available loops
  if (location.id === 'new_carthage') {
    const variant = displayOptions?.newCarthageLoopVariant || 'workers';
    result.variant = variant;
    const loops = location.loops || {};

    if (variant === 'base') return result;

    if (variant === 'workers' && loops.workers) {
      return { ...result, src: loops.workers, type: 'video' as const, loop: true, oneShot: false };
    }

    if (variant === 'rover_pass' && loops.roverPass) {
      // Rover pass should be a one-shot visual
      return { ...result, src: loops.roverPass, type: 'video' as const, loop: false, oneShot: true };
    }

    if (variant === 'ship_takeoff' && loops.shipTakeoff) {
      return { ...result, src: loops.shipTakeoff, type: 'video' as const, loop: false, oneShot: true };
    }

    if (variant === 'easter_egg' && loops.easterEgg) {
      return { ...result, src: loops.easterEgg, type: 'video' as const, loop: false, oneShot: true };
    }

    // fallback to base image
    return result;
  }

  return result;
}
