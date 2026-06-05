export type HoundActionId =
  | "motion_detected"
  | "hound_near"
  | "device_targeted"
  | "rover_impact"
  | "pack_approach"
  | "contact_lost";

export type HoundActionTone = "warning" | "critical" | "lost";

export type HoundAction = {
  id: HoundActionId;
  controlLabel: string;
  displayMessage: string;
  tone: HoundActionTone;
  durationMs: number;
  shouldSetHounds?: boolean;
  shouldGlitch?: boolean;
  shouldImpact?: boolean;
};

export const HOUND_ACTIONS: HoundAction[] = [
  {
    id: "motion_detected",
    controlLabel: "MOUVEMENT DÉTECTÉ",
    displayMessage: "HOSTILE MOTION DETECTED",
    tone: "warning",
    durationMs: 4000,
    shouldGlitch: true
  },
  {
    id: "hound_near",
    controlLabel: "HOUND PROCHE",
    displayMessage: "LOW PROFILE CONTACT // RANGE UNKNOWN",
    tone: "warning",
    durationMs: 4500,
    shouldSetHounds: true,
    shouldGlitch: true
  },
  {
    id: "device_targeted",
    controlLabel: "DRONE/RADIO CIBLÉ",
    displayMessage: "ACTIVE DEVICE TARGETED",
    tone: "critical",
    durationMs: 4500,
    shouldSetHounds: true,
    shouldGlitch: true
  },
  {
    id: "rover_impact",
    controlLabel: "IMPACT ROVER",
    displayMessage: "EXTERNAL IMPACT // ROVER HULL",
    tone: "critical",
    durationMs: 4500,
    shouldImpact: true
  },
  {
    id: "pack_approach",
    controlLabel: "MEUTE EN APPROCHE",
    displayMessage: "MULTIPLE CONTACTS // EM RESPONSE",
    tone: "critical",
    durationMs: 5000,
    shouldSetHounds: true,
    shouldGlitch: true
  },
  {
    id: "contact_lost",
    controlLabel: "CONTACT PERDU",
    displayMessage: "CONTACT LOST",
    tone: "lost",
    durationMs: 3500,
    shouldGlitch: false
  }
];

export function getHoundAction(id: HoundActionId): HoundAction {
  return HOUND_ACTIONS.find((action) => action.id === id) ?? HOUND_ACTIONS[0];
}
