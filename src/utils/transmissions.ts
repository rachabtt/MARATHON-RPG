import type { ActiveTransmission, TransmissionType } from "../types";
import { getCharacterProfile } from "./characters";

export interface TransmissionSpeaker {
  id: TransmissionType;
  label: string;
  role: string;
  sourceType: "command" | "ai" | "field" | "log" | "unknown";
  accentColor: "orange" | "emerald" | "amber" | "red" | "cyan";
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
      "Delta-6 ne répond plus depuis six heures. Vous récupérez l’équipe, les données et le rover.",
    ],
  },
  aletheia: {
    id: "aletheia",
    label: "ALETHEIA",
    role: "ASSISTANCE COLONIALE",
    sourceType: "ai",
    accentColor: "emerald",
    signalQuality: "clair",
    portraitPath: getCharacterProfile("aletheia").portrait,
    messages: [
      "Interférence locale détectée. Aucune source hostile confirmée.",
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
      "Je veux rentrer. Il faut couper le scanner.",
    ],
  },
  delta6_log: {
    id: "delta6_log",
    label: "LOG DELTA-6",
    role: "ENREGISTREMENT CORROMPU",
    sourceType: "log",
    accentColor: "cyan",
    signalQuality: "dégradé",
    messages: [
      "Vous entendez ça ? Coupez le scanner. Coupez—",
    ],
  },
  unknown_radio: {
    id: "unknown_radio",
    label: "RADIO INCONNUE",
    role: "SOURCE NON IDENTIFIÉE",
    sourceType: "unknown",
    accentColor: "red",
    signalQuality: "critique",
    messages: ["Can you hear me?"],
  },
  hound: {
    id: "hound",
    label: "HOUND CONTACT",
    role: "FAUNE HOSTILE / SIGNAL ÉLECTRONIQUE",
    sourceType: "unknown",
    accentColor: "red",
    signalQuality: "critique",
    portraitPath: getCharacterProfile("hound").portrait,
    messages: [
      "CONTACT FAUNE // ÉMISSION ACTIVE DÉTECTÉE",
    ],
  },
};

export function createMissionTransmission(type: TransmissionType): ActiveTransmission {
  const speaker = TRANSMISSION_SPEAKERS[type];
  const message = speaker.messages[Math.floor(Math.random() * speaker.messages.length)];

  return {
    id: `${type}-${Date.now()}`,
    type,
    speaker: speaker.label,
    sourceRole: speaker.role,
    sourceType: speaker.sourceType,
    message,
    signalQuality: speaker.signalQuality,
    startedAt: Date.now(),
    durationMs: type === "unknown_radio" ? 4200 : 6200,
  };
}
