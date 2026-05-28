import type { ActiveTransmission, TransmissionType } from "../types";

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
    portraitPath: undefined,
    messages: [
      "Vous avez vos ordres.",
      "Récupérez l’équipe et revenez.",
      "Pas de théorie bizarre sur les canaux publics.",
    ],
  },
  aletheia: {
    id: "aletheia",
    label: "ALETHEIA",
    role: "ASSISTANCE COLONIALE",
    sourceType: "ai",
    accentColor: "emerald",
    signalQuality: "clair",
    portraitPath: undefined,
    messages: [
      "Interférence locale détectée.",
      "Aucune source hostile confirmée.",
      "Votre sécurité est prioritaire.",
      "Je recommande de ne pas extrapoler.",
    ],
  },
  survivor: {
    id: "survivor",
    label: "DR ISAAC VELEN",
    role: "SURVIVANT DELTA-6",
    sourceType: "field",
    accentColor: "amber",
    signalQuality: "critique",
    portraitPath: undefined,
    messages: [
      "Coupez le scanner.",
      "On a entendu quelque chose.",
      "Je veux rentrer.",
    ],
  },
  log_delta6: {
    id: "log_delta6",
    label: "LOG DELTA-6",
    role: "ENREGISTREMENT CORROMPU",
    sourceType: "log",
    accentColor: "cyan",
    signalQuality: "dégradé",
    messages: [
      "Relevé actif. Données instables.",
      "Transmission corrompue.",
      "Retour géologique incohérent.",
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
