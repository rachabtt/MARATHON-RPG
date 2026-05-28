import newCarthageImage from "../assets/locations/new-carthage.png";
import redPlainsImage from "../assets/locations/red-plains.png";
import blackArchesImage from "../assets/locations/black-arches.png";
import delta6Image from "../assets/locations/delta6-site.png";

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
}

export const LOCATIONS: LocationInfo[] = [
  {
    id: "new_carthage",
    label: "NEW CARTHAGE",
    subtitle: "Zone de départ / Colonie UESC",
    image: newCarthageImage,
  },
  {
    id: "red_plains",
    label: "PLAINES ROUGES",
    subtitle: "Traversée / Route vers Delta-6",
    image: redPlainsImage,
  },
  {
    id: "black_arches",
    label: "ARCHES NOIRES",
    subtitle: "Échos radio / Terrain instable",
    image: blackArchesImage,
  },
  {
    id: "delta6",
    label: "SITE DELTA-6",
    subtitle: "Site géologique abandonné",
    image: delta6Image,
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
