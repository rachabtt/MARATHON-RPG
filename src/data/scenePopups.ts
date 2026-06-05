import type { ActiveTransmission } from "../types";

export type ScenePopupVariant = "portrait" | "log" | "alert" | "system" | "full" | "compact";

export type ScenePopupConfig = {
  sceneId: string;
  popup?: {
    profileId: string;
    message: string;
    variant?: ScenePopupVariant;
    autoShow?: boolean;
    durationMs?: number;
  };
};

export const scenePopups: ScenePopupConfig[] = [
  {
    sceneId: "intro_aletheia",
    popup: {
      profileId: "aletheia",
      message: "Bienvenue sur Tau Ceti IV.",
      variant: "portrait",
      autoShow: true,
      durationMs: 8000,
    },
  },
  {
    sceneId: "briefing_rowe",
    popup: {
      profileId: "rowe",
      message: "Delta-6 ne répond plus depuis six heures. Vous récupérez l’équipe, les données et le rover.",
      variant: "portrait",
      autoShow: true,
      durationMs: 10000,
    },
  },
  {
    sceneId: "anomalie_radio",
    popup: {
      profileId: "radio_signal",
      message: "INTERFÉRENCE LOCALE DÉTECTÉE",
      variant: "system",
      autoShow: true,
      durationMs: 6500,
    },
  },
  {
    sceneId: "approche_arches_noires",
    popup: {
      profileId: "archive_log",
      message: "Latence radio variable. Échos multiples. Source non confirmée.",
      variant: "log",
      autoShow: true,
      durationMs: 8000,
    },
  },
  {
    sceneId: "arrivee_delta6",
    popup: {
      profileId: "archive_log",
      message: "Relevé actif. Données instables. Retour géologique incohérent.",
      variant: "log",
      autoShow: true,
      durationMs: 8000,
    },
  },
  {
    sceneId: "scanner_actif",
    popup: {
      profileId: "archive_log",
      message: "Vous entendez ça ? Coupez le scanner. Coupez—",
      variant: "log",
      autoShow: true,
      durationMs: 9000,
    },
  },
  {
    sceneId: "contact_hound",
    popup: {
      profileId: "hounds",
      message: "LOW PROFILE CONTACT // RANGE UNKNOWN",
      variant: "alert",
      autoShow: true,
      durationMs: 5000,
    },
  },
  {
    sceneId: "survivant_velen",
    popup: {
      profileId: "velen",
      message: "La radio ne répétait pas. Elle répondait.",
      variant: "portrait",
      autoShow: true,
      durationMs: 9000,
    },
  },
  {
    sceneId: "tempete_em",
    popup: {
      profileId: "em_storm",
      message: "EM FRONT DETECTED",
      variant: "alert",
      autoShow: true,
      durationMs: 5000,
    },
  },
  {
    sceneId: "extraction",
    popup: {
      profileId: "rowe",
      message: "Fenêtre de retour réduite. Rentrez maintenant.",
      variant: "portrait",
      autoShow: true,
      durationMs: 8000,
    },
  },
];

export function getScenePopup(sceneId?: string | null): ScenePopupConfig["popup"] | undefined {
  if (!sceneId) return undefined;
  return scenePopups.find((entry) => entry.sceneId === sceneId)?.popup;
}

export function createScenePopupTransmission(sceneId: string): ActiveTransmission | null {
  const popup = getScenePopup(sceneId);
  if (!popup?.autoShow) return null;
  const now = Date.now();
  return {
    id: `${sceneId}-${popup.profileId}-${now}`,
    beatId: sceneId,
    type: "system",
    profileId: popup.profileId,
    variant: popup.variant ?? "system",
    speaker: popup.profileId,
    sourceRole: "SCENE POPUP",
    sourceType: "system",
    message: popup.message,
    signalQuality: popup.variant === "alert" ? "critique" : popup.variant === "log" ? "dégradé" : "clair",
    startedAt: now,
    durationMs: popup.durationMs ?? 8000,
  };
}
