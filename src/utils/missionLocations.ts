import type { MissionLocation } from '../types/missionSchema';
import type { LocationId, LocationInfo } from './locations';

const RUNTIME_LOCATION_IDS: LocationId[] = ['new_carthage', 'red_plains', 'black_arches', 'delta6'];

const LOCATION_ID_ALIASES: Record<string, LocationId> = {
  'new-carthage': 'new_carthage',
  new_carthage: 'new_carthage',
  'red-plains': 'red_plains',
  red_plains: 'red_plains',
  'black-arches': 'black_arches',
  black_arches: 'black_arches',
  'delta6-site': 'delta6',
  delta6_site: 'delta6',
  delta6: 'delta6'
};

function isLocationId(value: string): value is LocationId {
  return RUNTIME_LOCATION_IDS.includes(value as LocationId);
}

export function toRuntimeLocationId(locationId: string | undefined, fallback: LocationId = 'delta6'): LocationId {
  if (!locationId) return fallback;
  if (isLocationId(locationId)) return locationId;
  return LOCATION_ID_ALIASES[locationId] ?? fallback;
}

function getFallbackLocation(fallbackLocations: LocationInfo[], locationId: LocationId): LocationInfo {
  return fallbackLocations.find((location) => location.id === locationId)
    ?? fallbackLocations.find((location) => location.id === 'delta6')
    ?? fallbackLocations[0];
}

function getEmptyMissionLocation(): LocationInfo {
  return {
    id: 'delta6',
    label: 'AUCUN LIEU',
    subtitle: 'Mission sans lieux configurés',
    image: ''
  };
}

function getLoopVariants(
  location: MissionLocation,
  fallbackLocation: LocationInfo
): LocationInfo['loops'] {
  const loopVariants = location.loopVariants;
  if (!loopVariants) return fallbackLocation.loops;

  return {
    workers: loopVariants.workers,
    shipTakeoff: loopVariants.shipTakeoff,
    roverPass: loopVariants.roverPass,
    easterEgg: loopVariants.easterEgg
  };
}

export function missionLocationsToLocationInfos(
  missionLocations: MissionLocation[] = [],
  fallbackLocations: LocationInfo[]
): LocationInfo[] {
  if (missionLocations.length === 0) {
    return [];
  }

  return missionLocations.map((missionLocation) => {
    const runtimeLocationId = toRuntimeLocationId(missionLocation.runtimeLocationId ?? missionLocation.id);
    const fallbackLocation = getFallbackLocation(fallbackLocations, runtimeLocationId);

    return {
      id: runtimeLocationId,
      label: missionLocation.label,
      subtitle: missionLocation.description ?? missionLocation.role ?? fallbackLocation.subtitle,
      image: missionLocation.imagePath ?? missionLocation.displayBackground ?? fallbackLocation.image,
      wideVideo: missionLocation.videoLoop ?? fallbackLocation.wideVideo,
      povImage: missionLocation.povImagePath ?? fallbackLocation.povImage,
      houndImage: missionLocation.houndImagePath ?? fallbackLocation.houndImage,
      loops: getLoopVariants(missionLocation, fallbackLocation)
    };
  });
}

export function getMissionLocationById(
  locations: LocationInfo[],
  locationId: string | undefined
): LocationInfo {
  const runtimeLocationId = toRuntimeLocationId(locationId);
  return locations.find((location) => location.id === runtimeLocationId)
    ?? locations.find((location) => location.id === 'delta6')
    ?? locations[0]
    ?? getEmptyMissionLocation();
}
