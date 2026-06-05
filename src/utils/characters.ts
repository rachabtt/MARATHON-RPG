import type { TransmissionType } from "../types";

const portraitModules = import.meta.glob("../assets/portraits/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const houndModules = import.meta.glob("../assets/hounds/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export interface CharacterProfile {
  id: string;
  label: string;
  role: string;
  portrait?: string;
  portraitExpectedPath?: string;
  style: string;
  voiceTone: string;
}

function portrait(path: string): string | undefined {
  return portraitModules[`../assets/portraits/${path}`];
}

function houndImage(path: string): string | undefined {
  return houndModules[`../assets/hounds/${path}`];
}

export const CHARACTER_PROFILES: Partial<Record<TransmissionType, CharacterProfile>> = {
  rowe: {
    id: "rowe",
    label: "COMMANDER ELIAS ROWE",
    role: "COMMANDEMENT UESC",
    portrait: portrait("rowe.png"),
    portraitExpectedPath: "src/assets/portraits/rowe.png",
    style: "transmission commandement UESC, vert CRT et orange sobre",
    voiceTone: "sec, fatigué, professionnel",
  },
  aletheia: {
    id: "aletheia",
    label: "ALETHEIA",
    role: "ASSISTANCE COLONIALE",
    portrait: portrait("aletheia.png"),
    portraitExpectedPath: "src/assets/portraits/aletheia.png",
    style: "hologramme IA calme, cyan-vert administratif",
    voiceTone: "calme, rassurante, jamais agressive",
  },
  velen: {
    id: "velen",
    label: "DR ISAAC VELEN",
    role: "SURVIVANT DELTA-6",
    portrait: portrait("velen.png"),
    portraitExpectedPath: "src/assets/portraits/velen.png",
    style: "signal faible, transmission détériorée, humain éprouvé",
    voiceTone: "bas, hésitant, épuisé",
  },
  delta6_log: {
    id: "delta6_log",
    label: "LOG DELTA-6",
    role: "ENREGISTREMENT CORROMPU",
    style: "carte audio, spectrogramme, parasites",
    voiceTone: "glitch audio, souffle, fragments",
  },
  unknown_radio: {
    id: "unknown_radio",
    label: "RADIO INCONNUE",
    role: "SOURCE NON CLASSÉE",
    style: "minimal, sombre, waveform instable",
    voiceTone: "burst court, silence",
  },
  hound: {
    id: "hound",
    label: "HOUND CONTACT",
    role: "FAUNE HOSTILE / SIGNAL ÉLECTRONIQUE",
    portrait: houndImage("hound-profile.png"),
    portraitExpectedPath: "src/assets/hounds/hound-profile.png",
    style: "fiche menace UESC, silhouette, warning orange",
    voiceTone: "pas de voix, frottements et souffle",
  },
};

export function getCharacterProfile(id: TransmissionType): CharacterProfile {
  return CHARACTER_PROFILES[id] ?? {
    id,
    label: id.toUpperCase(),
    role: "SOURCE SYSTÈME UESC",
    style: "interface transmission UESC",
    voiceTone: "neutre",
  };
}

export function getMissingCharacterAssets(): string[] {
  return Object.values(CHARACTER_PROFILES)
    .filter((profile) => profile.portraitExpectedPath && !profile.portrait)
    .map((profile) => profile.portraitExpectedPath!);
}
