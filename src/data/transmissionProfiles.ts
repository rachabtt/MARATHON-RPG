import aletheiaPortrait from "../assets/interventions/aletheia.png";
import houndsPortrait from "../assets/interventions/hounds.png";
import rowePortrait from "../assets/interventions/rowe.png";
import velenPortrait from "../assets/interventions/velen.png";

export type TransmissionKind =
  | "ai"
  | "command"
  | "survivor"
  | "log"
  | "hound"
  | "rover"
  | "scanner"
  | "storm"
  | "terminal"
  | "system";

export type TransmissionTone =
  | "cyan"
  | "amber"
  | "green"
  | "red"
  | "white"
  | "violet"
  | "gray";

export type TransmissionProfile = {
  id: string;
  kind: TransmissionKind;
  speakerName: string;
  speakerRole: string;
  accent: TransmissionTone;
  channelLabel: string;
  signalLabel: string;
  transmissionLabel: string;
  portraitSrc?: string;
  icon?: string;
  showPortrait: boolean;
};

const interventionPortraits = {
  aletheia: aletheiaPortrait,
  rowe: rowePortrait,
  velen: velenPortrait,
  hounds: houndsPortrait,
};

const interventionPortrait = (id: keyof typeof interventionPortraits) => interventionPortraits[id];

export const transmissionProfiles: Record<string, TransmissionProfile> = {
  aletheia: {
    id: "aletheia",
    kind: "ai",
    speakerName: "ALETHEIA",
    speakerRole: "IA D'ASSISTANCE COLONIALE",
    accent: "cyan",
    channelLabel: "A2 • COLONIAL NET",
    signalLabel: "SIGNAL STABLE",
    transmissionLabel: "TRANSMISSION ENTRANTE",
    portraitSrc: interventionPortrait("aletheia"),
    icon: "A2",
    showPortrait: true,
  },
  rowe: {
    id: "rowe",
    kind: "command",
    speakerName: "COMMANDER ELIAS ROWE",
    speakerRole: "COMMANDEMENT UESC",
    accent: "amber",
    channelLabel: "COMMAND NET",
    signalLabel: "SIGNAL STABLE",
    transmissionLabel: "TRANSMISSION ENTRANTE",
    portraitSrc: interventionPortrait("rowe"),
    icon: "CMD",
    showPortrait: true,
  },
  velen: {
    id: "velen",
    kind: "survivor",
    speakerName: "DR ISAAC VELEN",
    speakerRole: "SURVIVANT DELTA-6",
    accent: "white",
    channelLabel: "MEDICAL / FIELD CHANNEL",
    signalLabel: "SIGNAL INSTABLE",
    transmissionLabel: "SIGNAL LOCAL",
    portraitSrc: interventionPortrait("velen"),
    icon: "D6",
    showPortrait: true,
  },
  delta6_log: {
    id: "delta6_log",
    kind: "log",
    speakerName: "DELTA-6 FIELD LOG",
    speakerRole: "ARCHIVE AUDIO CORROMPUE",
    accent: "green",
    channelLabel: "RECOVERY CHANNEL D6",
    signalLabel: "SIGNAL DEGRADED",
    transmissionLabel: "LOG RECOVERED",
    icon: "D6",
    showPortrait: false,
  },
  archive_log: {
    id: "archive_log",
    kind: "log",
    speakerName: "DELTA-6 FIELD LOG",
    speakerRole: "ARCHIVE AUDIO CORROMPUE",
    accent: "green",
    channelLabel: "RECOVERY CHANNEL D6",
    signalLabel: "SIGNAL DEGRADED",
    transmissionLabel: "LOG RECOVERED",
    icon: "D6",
    showPortrait: false,
  },
  radio_signal: {
    id: "radio_signal",
    kind: "system",
    speakerName: "SIGNAL RADIO UESC",
    speakerRole: "CANAL LOCAL DÉGRADÉ",
    accent: "cyan",
    channelLabel: "FIELD COMMS",
    signalLabel: "SIGNAL INSTABLE",
    transmissionLabel: "INTERFÉRENCE RADIO",
    icon: "SIG",
    showPortrait: false,
  },
  hounds: {
    id: "hounds",
    kind: "hound",
    speakerName: "UESC THREAT TELEMETRY",
    speakerRole: "CONTACT HOSTILE NON CONFIRMÉ",
    accent: "red",
    channelLabel: "SENSOR NET",
    signalLabel: "EM TRACE UNSTABLE",
    transmissionLabel: "THREAT ALERT",
    portraitSrc: interventionPortrait("hounds"),
    icon: "THR",
    showPortrait: true,
  },
  hound_contact: {
    id: "hound_contact",
    kind: "hound",
    speakerName: "UESC THREAT TELEMETRY",
    speakerRole: "CONTACT HOSTILE NON CONFIRMÉ",
    accent: "red",
    channelLabel: "SENSOR NET",
    signalLabel: "EM TRACE UNSTABLE",
    transmissionLabel: "THREAT ALERT",
    portraitSrc: interventionPortrait("hounds"),
    icon: "THR",
    showPortrait: true,
  },
  rover_system: {
    id: "rover_system",
    kind: "rover",
    speakerName: "ROVER SYSTEM",
    speakerRole: "MOBILITY / HULL / POWER",
    accent: "amber",
    channelLabel: "ROVER BUS",
    signalLabel: "LOCAL LINK",
    transmissionLabel: "SYSTEM WARNING",
    icon: "RVR",
    showPortrait: false,
  },
  scanner_delta6: {
    id: "scanner_delta6",
    kind: "scanner",
    speakerName: "DELTA-6 SCANNER",
    speakerRole: "GEOLOGICAL SURVEY UNIT",
    accent: "green",
    channelLabel: "SURVEY CHANNEL",
    signalLabel: "RETURN DEGRADED",
    transmissionLabel: "SCAN RESULT",
    icon: "SCN",
    showPortrait: false,
  },
  em_storm: {
    id: "em_storm",
    kind: "storm",
    speakerName: "EM STORM WARNING",
    speakerRole: "ENVIRONMENTAL HAZARD",
    accent: "red",
    channelLabel: "WEATHER / EMERGENCY",
    signalLabel: "SIGNAL CRITICAL",
    transmissionLabel: "PRIORITY ALERT",
    icon: "EM",
    showPortrait: false,
  },
  terminal: {
    id: "terminal",
    kind: "terminal",
    speakerName: "MAINTENANCE TERMINAL",
    speakerRole: "LOCAL SYSTEM OUTPUT",
    accent: "green",
    channelLabel: "LOCAL NODE",
    signalLabel: "UNKNOWN SOURCE",
    transmissionLabel: "SYSTEM MESSAGE",
    icon: "TRM",
    showPortrait: false,
  },
  system: {
    id: "system",
    kind: "system",
    speakerName: "UESC SYSTEM",
    speakerRole: "MISSION TELEMETRY",
    accent: "gray",
    channelLabel: "MISSION BUS",
    signalLabel: "LOCAL",
    transmissionLabel: "SYSTEM NOTICE",
    icon: "SYS",
    showPortrait: false,
  },
  system_fallback: {
    id: "system_fallback",
    kind: "system",
    speakerName: "UESC SYSTEM",
    speakerRole: "MISSION TELEMETRY",
    accent: "gray",
    channelLabel: "MISSION BUS",
    signalLabel: "LOCAL",
    transmissionLabel: "SYSTEM NOTICE",
    icon: "SYS",
    showPortrait: false,
  },
  unknown_radio: {
    id: "unknown_radio",
    kind: "terminal",
    speakerName: "MAINTENANCE TERMINAL",
    speakerRole: "LOCAL SYSTEM OUTPUT",
    accent: "green",
    channelLabel: "LOCAL NODE",
    signalLabel: "UNKNOWN SOURCE",
    transmissionLabel: "SYSTEM MESSAGE",
    icon: "TRM",
    showPortrait: false,
  },
  hound: {
    id: "hound",
    kind: "hound",
    speakerName: "UESC THREAT TELEMETRY",
    speakerRole: "CONTACT HOSTILE NON CONFIRMÉ",
    accent: "red",
    channelLabel: "SENSOR NET",
    signalLabel: "EM TRACE UNSTABLE",
    transmissionLabel: "THREAT ALERT",
    portraitSrc: interventionPortrait("hounds"),
    icon: "THR",
    showPortrait: true,
  },
};

export const fallbackTransmissionProfile = transmissionProfiles.system_fallback;

export function getTransmissionProfile(profileId?: string | null): TransmissionProfile {
  if (!profileId) return fallbackTransmissionProfile;
  return transmissionProfiles[profileId] ?? fallbackTransmissionProfile;
}
