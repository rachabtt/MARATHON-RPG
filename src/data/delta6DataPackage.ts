export type Delta6DataStatus =
  | "non_secure"
  | "transfer"
  | "partial"
  | "corrupted"
  | "secured"
  | "lost";

export type Delta6DataTone = "amber" | "green" | "red";

export interface Delta6DataPackageStateConfig {
  title: "DATA PACKAGE DELTA-6";
  label: string;
  statusLabel: string;
  integrity: number;
  tone: Delta6DataTone;
  signalTrace: "DEGRADED" | "ACTIVE" | "LOST";
  resourceIndex: number;
  meta: [string, string, string];
}

export const DELTA6_DATA_PACKAGE_STATES: Record<Delta6DataStatus, Delta6DataPackageStateConfig> = {
  non_secure: {
    title: "DATA PACKAGE DELTA-6",
    label: "NON SÉCURISÉES",
    statusLabel: "STATUS: NON SÉCURISÉ",
    integrity: 42,
    tone: "amber",
    signalTrace: "DEGRADED",
    resourceIndex: 0,
    meta: ["BUFFER: OPEN", "RECOVERY: PENDING", "SIGNAL: DEGRADED"]
  },
  transfer: {
    title: "DATA PACKAGE DELTA-6",
    label: "TRANSFERT EN COURS",
    statusLabel: "TRANSFER: IN PROGRESS",
    integrity: 67,
    tone: "green",
    signalTrace: "ACTIVE",
    resourceIndex: 1,
    meta: ["UPLINK: ACTIVE", "BUFFER: SYNC", "CHECKSUM: RUNNING"]
  },
  partial: {
    title: "DATA PACKAGE DELTA-6",
    label: "PARTIELLES",
    statusLabel: "STATUS: PARTIAL",
    integrity: 54,
    tone: "amber",
    signalTrace: "DEGRADED",
    resourceIndex: 1,
    meta: ["RECOVERY: PARTIAL", "BLOCKS: MISSING", "SIGNAL: UNSTABLE"]
  },
  corrupted: {
    title: "DATA PACKAGE DELTA-6",
    label: "CORROMPUES",
    statusLabel: "STATUS: CORRUPTED",
    integrity: 28,
    tone: "red",
    signalTrace: "DEGRADED",
    resourceIndex: 2,
    meta: ["CRC: FAIL", "BLOCKS: DAMAGED", "REVIEW: REQUIRED"]
  },
  secured: {
    title: "DATA PACKAGE DELTA-6",
    label: "SÉCURISÉES",
    statusLabel: "STATUS: SECURED",
    integrity: 96,
    tone: "green",
    signalTrace: "ACTIVE",
    resourceIndex: 0,
    meta: ["CHECKSUM: VERIFIED", "ARCHIVE: LOCKED", "RECOVERY: COMPLETE"]
  },
  lost: {
    title: "DATA PACKAGE DELTA-6",
    label: "PERDUES",
    statusLabel: "STATUS: LOST",
    integrity: 4,
    tone: "red",
    signalTrace: "LOST",
    resourceIndex: 3,
    meta: ["RECOVERY: FAILED", "SIGNAL: LOST", "ARCHIVE: EMPTY"]
  }
};

export function getDelta6DataPackageState(status: Delta6DataStatus | undefined): Delta6DataPackageStateConfig {
  return DELTA6_DATA_PACKAGE_STATES[status ?? "non_secure"] ?? DELTA6_DATA_PACKAGE_STATES.non_secure;
}
