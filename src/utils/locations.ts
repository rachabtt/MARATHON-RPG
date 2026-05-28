export interface LocationInfo {
  id: 'new_carthage' | 'red_plains' | 'black_arches' | 'delta6';
  label: string;
  subtitle: string;
  image: string;
}

export const LOCATIONS = [
  {
    id: "new_carthage",
    label: "NEW CARTHAGE",
    subtitle: "Zone de départ / Colonie UESC",
    image: "/assets/locations/new-carthage.png",
  },
  {
    id: "red_plains",
    label: "PLAINES ROUGES",
    subtitle: "Traversée / Route vers Delta-6",
    image: "/assets/locations/red-plains.png",
  },
  {
    id: "black_arches",
    label: "ARCHES NOIRES",
    subtitle: "Échos radio / Terrain instable",
    image: "/assets/locations/black-arches.png",
  },
  {
    id: "delta6",
    label: "SITE DELTA-6",
    subtitle: "Site géologique abandonné",
    image: "/assets/locations/delta6-site.png",
  },
] as const;
