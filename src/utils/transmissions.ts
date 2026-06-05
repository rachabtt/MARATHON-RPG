import type { ActiveTransmission, TransmissionType } from "../types";
import { getCharacterProfile } from "./characters";
import { getTransmissionProfile } from "../data/transmissionProfiles";

export interface TransmissionSpeaker {
  id: TransmissionType;
  label: string;
  role: string;
  sourceType: "command" | "ai" | "field" | "log" | "unknown" | "system";
  accentColor: "orange" | "emerald" | "amber" | "red" | "cyan" | "gray";
  signalQuality: ActiveTransmission["signalQuality"];
  portraitPath?: string;
  messages: string[];
}

export const TRANSMISSION_SPEAKERS: Record<TransmissionType, TransmissionSpeaker> = {
  rowe: {
    id: "rowe",
    label: "COMMANDER ELIAS ROWE",
    role: "COMMANDEMENT UESC",
    sourceType: "command",
    accentColor: "orange",
    signalQuality: "clair",
    portraitPath: getCharacterProfile("rowe").portrait,
    messages: [
      "Delta-6 ne répond plus depuis six heures.",
      "Vous récupérez l’équipe, les données et le rover.",
      "Pas de héros. Pas de théorie bizarre.",
    ],
  },
  aletheia: {
    id: "aletheia",
    label: "ALETHEIA",
    role: "IA D'ASSISTANCE COLONIALE",
    sourceType: "ai",
    accentColor: "cyan",
    signalQuality: "clair",
    portraitPath: getCharacterProfile("aletheia").portrait,
    messages: [
      "Bienvenue sur Tau Ceti IV.",
      "Interférence locale détectée.",
      "Certaines données semblent corrompues.",
    ],
  },
  velen: {
    id: "velen",
    label: "DR ISAAC VELEN",
    role: "SURVIVANT DELTA-6",
    sourceType: "field",
    accentColor: "amber",
    signalQuality: "critique",
    portraitPath: getCharacterProfile("velen").portrait,
    messages: [
      "On a entendu quelque chose.",
      "La radio ne répétait pas. Elle répondait.",
      "Je veux rentrer.",
    ],
  },
  delta6_log: {
    id: "delta6_log",
    label: "DELTA-6 FIELD LOG",
    role: "ARCHIVE AUDIO CORROMPUE",
    sourceType: "log",
    accentColor: "emerald",
    signalQuality: "dégradé",
    messages: [
      "Vous entendez ça ?",
      "Coupez le scanner. Coupez—",
      "Signal return invalid.",
    ],
  },
  unknown_radio: {
    id: "unknown_radio",
    label: "MAINTENANCE TERMINAL",
    role: "LOCAL SYSTEM OUTPUT",
    sourceType: "unknown",
    accentColor: "emerald",
    signalQuality: "critique",
    messages: ["Signal HOLLOW détecté."],
  },
  hound: {
    id: "hound",
    label: "UESC THREAT TELEMETRY",
    role: "CONTACT HOSTILE NON CONFIRMÉ",
    sourceType: "unknown",
    accentColor: "red",
    signalQuality: "critique",
    messages: [
      "HOSTILE MOTION DETECTED",
      "LOW PROFILE CONTACT // RANGE UNKNOWN",
      "ACTIVE DEVICE TARGETED",
    ],
  },
  rover_system: {
    id: "rover_system",
    label: "ROVER SYSTEM",
    role: "MOBILITY / HULL / POWER",
    sourceType: "system",
    accentColor: "amber",
    signalQuality: "dégradé",
    messages: [
      "ROVER HULL IMPACT",
      "POWER BUS DEGRADED",
      "MOBILITY WARNING",
    ],
  },
  scanner_delta6: {
    id: "scanner_delta6",
    label: "DELTA-6 SCANNER",
    role: "GEOLOGICAL SURVEY UNIT",
    sourceType: "system",
    accentColor: "emerald",
    signalQuality: "dégradé",
    messages: [
      "SURVEY RETURN DEGRADED",
      "DATA PACKAGE UNSECURED",
      "SCAN INTEGRITY LOW",
    ],
  },
  em_storm: {
    id: "em_storm",
    label: "EM STORM WARNING",
    role: "ENVIRONMENTAL HAZARD",
    sourceType: "system",
    accentColor: "red",
    signalQuality: "critique",
    messages: [
      "EM FRONT DETECTED",
      "VISIBILITY CRITICAL",
      "SIGNAL RADIO CRITICAL",
    ],
  },
  terminal: {
    id: "terminal",
    label: "MAINTENANCE TERMINAL",
    role: "LOCAL SYSTEM OUTPUT",
    sourceType: "system",
    accentColor: "emerald",
    signalQuality: "critique",
    messages: ["Signal HOLLOW détecté."],
  },
  system: {
    id: "system",
    label: "UESC SYSTEM",
    role: "MISSION TELEMETRY",
    sourceType: "system",
    accentColor: "gray",
    signalQuality: "clair",
    messages: ["SYSTEM NOTICE"],
  },
};

function getDefaultVariant(type: TransmissionType): ActiveTransmission["variant"] {
  if (type === "delta6_log") return "log";
  if (type === "hound" || type === "rover_system" || type === "em_storm") return "alert";
  if (type === "scanner_delta6" || type === "terminal" || type === "system" || type === "unknown_radio") return "system";
  return "portrait";
}

export function createMissionTransmission(type: TransmissionType): ActiveTransmission {
  const speaker = TRANSMISSION_SPEAKERS[type] ?? TRANSMISSION_SPEAKERS.system;
  const profile = getTransmissionProfile(type);
  const message = speaker.messages[Math.floor(Math.random() * speaker.messages.length)];

  return {
    id: `${type}-${Date.now()}`,
    type,
    profileId: profile.id,
    variant: getDefaultVariant(type),
    speaker: speaker.label,
    sourceRole: speaker.role,
    sourceType: speaker.sourceType,
    message,
    signalQuality: speaker.signalQuality,
    startedAt: Date.now(),
    durationMs: type === "hound" || type === "rover_system" || type === "em_storm" ? 4500 : type === "delta6_log" ? 9000 : 6200,
  };
}
