import type { ActiveTransmission, HoundVariant, QuickEffectType, TransmissionType } from "../types";
import type { LocationId } from "./locations";
import { createMissionTransmission } from "./transmissions";

const audioModules = import.meta.glob("../assets/audio/interventions/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export type BeatGroup = "Départ" | "Route" | "Delta-6" | "Menace" | "Retour";
export type StoryAmbience = "calme" | "tension" | "signal" | "tempete" | "extraction";

export interface StoryBeat {
  id: string;
  label: string;
  group: BeatGroup;
  location: LocationId;
  ambience: StoryAmbience;
  speaker: TransmissionType;
  message: string;
  audioFile: string;
  quickAction?: QuickEffectType | "HOUND";
  houndVariant?: HoundVariant;
  requiresConfirmation?: boolean;
}

export const STORY_BEATS: StoryBeat[] = [
  {
    id: "intro_aletheia",
    label: "RÉVEIL — ALETHEIA",
    group: "Départ",
    location: "new_carthage",
    ambience: "calme",
    speaker: "aletheia",
    message: "Bienvenue sur Tau Ceti IV. Le réveil s’est déroulé avec succès.",
    audioFile: "aletheia_welcome.mp3",
  },
  {
    id: "briefing_rowe",
    label: "BRIEFING — ROWE",
    group: "Départ",
    location: "new_carthage",
    ambience: "tension",
    speaker: "rowe",
    message: "Delta-6 ne répond plus depuis six heures. Vous récupérez l’équipe, les données et le rover.",
    audioFile: "rowe_briefing.mp3",
  },
  {
    id: "traversee",
    label: "TRAVERSÉE — PLAINES ROUGES",
    group: "Route",
    location: "red_plains",
    ambience: "tension",
    speaker: "rowe",
    message: "Gardez le canal ouvert. Revenez avant que la météo se ferme.",
    audioFile: "rowe_keep_channel.mp3",
  },
  {
    id: "anomalie_radio",
    label: "ANOMALIE RADIO",
    group: "Route",
    location: "red_plains",
    ambience: "signal",
    speaker: "aletheia",
    message: "Interférence locale détectée. Aucune source hostile confirmée.",
    quickAction: "glitch_radio",
    audioFile: "aletheia_interference.mp3",
  },
  {
    id: "approche_arches_noires",
    label: "APPROCHE — ARCHES NOIRES",
    group: "Route",
    location: "black_arches",
    ambience: "signal",
    speaker: "delta6_log",
    message: "Latence radio variable. Échos multiples. Source non confirmée.",
    audioFile: "delta6_echoes.mp3",
  },
  {
    id: "arrivee_delta6",
    label: "ARRIVÉE — DELTA-6",
    group: "Delta-6",
    location: "delta6",
    ambience: "tension",
    speaker: "delta6_log",
    message: "Relevé actif. Données instables. Retour géologique incohérent.",
    audioFile: "delta6_arrival_log.mp3",
  },
  {
    id: "scanner_actif",
    label: "SCANNER ACTIF",
    group: "Delta-6",
    location: "delta6",
    ambience: "signal",
    speaker: "delta6_log",
    message: "Vous entendez ça ? Coupez le scanner. Coupez—",
    quickAction: "glitch_radio",
    audioFile: "delta6_cut_scanner.mp3",
  },
  {
    id: "contact_hound",
    label: "CONTACT HOUND",
    group: "Menace",
    location: "delta6",
    ambience: "tension",
    speaker: "hound",
    message: "CONTACT FAUNE // ÉMISSION ACTIVE DÉTECTÉE",
    quickAction: "HOUND",
    houndVariant: "proche",
    audioFile: "hound_contact.mp3",
  },
  {
    id: "survivant_velen",
    label: "SURVIVANT — VELEN",
    group: "Delta-6",
    location: "delta6",
    ambience: "signal",
    speaker: "velen",
    message: "Je veux rentrer. Il faut couper le scanner.",
    audioFile: "velen_cut_scanner.mp3",
  },
  {
    id: "tempete_em",
    label: "TEMPÊTE EM",
    group: "Menace",
    location: "delta6",
    ambience: "tempete",
    speaker: "aletheia",
    message: "Signal dégradé. Restez groupés. Votre sécurité est prioritaire.",
    quickAction: "flash_em",
    audioFile: "aletheia_storm_warning.mp3",
  },
  {
    id: "extraction",
    label: "EXTRACTION",
    group: "Retour",
    location: "red_plains",
    ambience: "extraction",
    speaker: "rowe",
    message: "Fenêtre de retour réduite. Rentrez maintenant.",
    audioFile: "rowe_extract_now.mp3",
  },
  {
    id: "retour_new_carthage",
    label: "RETOUR — NEW CARTHAGE",
    group: "Retour",
    location: "new_carthage",
    ambience: "tension",
    speaker: "aletheia",
    message: "Certaines données récupérées semblent corrompues. Je recommande une mise en quarantaine.",
    audioFile: "aletheia_data_quarantine.mp3",
  },
  {
    id: "finale_terminal",
    label: "FINALE — TERMINAL",
    group: "Retour",
    location: "new_carthage",
    ambience: "signal",
    speaker: "unknown_radio",
    message: "HOLLOW SIGNAL DETECTED",
    audioFile: "finale_terminal.mp3",
    requiresConfirmation: true,
  },
];

export function getStoryBeat(id: string): StoryBeat | undefined {
  return STORY_BEATS.find((beat) => beat.id === id);
}

export function createStoryBeatTransmission(beat: StoryBeat): ActiveTransmission {
  const transmission = createMissionTransmission(beat.speaker);
  return {
    ...transmission,
    beatId: beat.id,
    message: beat.message,
    type: beat.speaker,
    startedAt: Date.now(),
    durationMs: transmission.durationMs,
  };
}

export function getStoryBeatAudioSrc(beat: StoryBeat): string | undefined {
  return audioModules[`../assets/audio/interventions/${beat.audioFile}`];
}

export function getMissingStoryBeatAudio(): string[] {
  return STORY_BEATS
    .filter((beat) => !getStoryBeatAudioSrc(beat))
    .map((beat) => `src/assets/audio/interventions/${beat.audioFile}`);
}
