// Aletheia preset messages for Mission 01 — SOL ROUGE
// VISIBLE OUTPUT ONLY — safe to send to player display.
// No GM secrets. No lore revelations. No autonomous generation.

export type AletheiaMessageTone =
  | "neutral"
  | "reassuring"
  | "warning"
  | "procedural"
  | "glitch";

export type AletheiaPresetMessage = {
  id: string;
  label: string;
  text: string;
  tone: AletheiaMessageTone;
};

export type AletheiaMessageCategory = {
  id: string;
  label: string;
  description: string;
  messages: AletheiaPresetMessage[];
};

export const aletheiaMessageCategories: AletheiaMessageCategory[] = [
  {
    id: "departure",
    label: "Départ / briefing",
    description: "Messages utiles avant ou pendant le départ de New Carthage.",
    messages: [
      {
        id: "departure-priority",
        label: "Priorité non critique",
        tone: "procedural",
        text: "Votre mission est considérée comme prioritaire, mais non critique. Veuillez suivre les procédures de sortie standard.",
      },
      {
        id: "departure-risk-standard",
        label: "Risque compatible",
        tone: "reassuring",
        text: "Les risques environnementaux sont compatibles avec une sortie terrain standard. Restez groupés.",
      },
      {
        id: "departure-safety",
        label: "Sécurité prioritaire",
        tone: "reassuring",
        text: "Votre sécurité demeure prioritaire. La récupération de matériel ne justifie pas une exposition prolongée.",
      },
      {
        id: "departure-weather",
        label: "Fenêtre météo",
        tone: "neutral",
        text: "Fenêtre météo actuellement acceptable. Dégradation électromagnétique possible dans le secteur sud-est.",
      },
      {
        id: "departure-rumors",
        label: "Éviter rumeurs",
        tone: "procedural",
        text: "Merci de limiter les communications non opérationnelles. Les extrapolations non vérifiées peuvent affecter le calme colonial.",
      },
    ],
  },

  {
    id: "navigation",
    label: "Navigation / terrain",
    description: "Guidage terrain, météo, visibilité, trajet.",
    messages: [
      {
        id: "nav-route",
        label: "Route confirmée",
        tone: "neutral",
        text: "Route vers le site Delta-6 confirmée. Distance estimée : quarante kilomètres. Terrain exposé.",
      },
      {
        id: "nav-visibility",
        label: "Visibilité réduite",
        tone: "warning",
        text: "Visibilité dégradée. Réduction de vitesse recommandée.",
      },
      {
        id: "nav-em-activity",
        label: "Activité EM",
        tone: "warning",
        text: "Activité électromagnétique supérieure aux valeurs nominales. Les communications peuvent subir une latence variable.",
      },
      {
        id: "nav-black-arches",
        label: "Arches noires",
        tone: "neutral",
        text: "Formations rocheuses noires détectées à proximité. Classification géologique en attente de validation.",
      },
      {
        id: "nav-no-confirmed-hostile",
        label: "Aucune menace confirmée",
        tone: "procedural",
        text: "Aucune source hostile confirmée. Maintenez néanmoins les protocoles de vigilance extérieure.",
      },
    ],
  },

  {
    id: "radio_anomaly",
    label: "Anomalie radio",
    description: "Réponses prudentes aux anomalies de communication.",
    messages: [
      {
        id: "radio-local-interference",
        label: "Interférence locale",
        tone: "procedural",
        text: "Interférence locale détectée. Source non classifiée.",
      },
      {
        id: "radio-compression-loop",
        label: "Boucle possible",
        tone: "neutral",
        text: "Une boucle de compression radio courte pourrait expliquer la répétition observée. Analyse non concluante.",
      },
      {
        id: "radio-perception",
        label: "Perception affectée",
        tone: "reassuring",
        text: "Votre perception peut être affectée par le réveil cryogénique récent et par la saturation radio locale.",
      },
      {
        id: "radio-no-hostile-source",
        label: "Pas de source hostile",
        tone: "procedural",
        text: "Aucune source hostile confirmée sur le canal actif.",
      },
      {
        id: "radio-reduce-transmission",
        label: "Réduire émissions",
        tone: "warning",
        text: "Réduction des transmissions recommandée. Les émissions actives peuvent perturber les relevés locaux.",
      },
    ],
  },

  {
    id: "delta6_data",
    label: "Données Delta-6",
    description: "Messages autour du scanner, des données et de leur récupération.",
    messages: [
      {
        id: "data-package-detected",
        label: "Package détecté",
        tone: "neutral",
        text: "Package de données Delta-6 détecté. Intégrité non confirmée.",
      },
      {
        id: "data-transfer-start",
        label: "Transfert lancé",
        tone: "procedural",
        text: "Transfert de données en cours. Veuillez maintenir une alimentation stable.",
      },
      {
        id: "data-incoherent",
        label: "Donnée incohérente",
        tone: "warning",
        text: "Cette donnée est incohérente avec les modèles géologiques disponibles.",
      },
      {
        id: "data-no-extrapolation",
        label: "Ne pas extrapoler",
        tone: "procedural",
        text: "Je recommande de ne pas extrapoler à partir d’un relevé incomplet.",
      },
      {
        id: "data-corruption",
        label: "Corruption partielle",
        tone: "warning",
        text: "Corruption partielle détectée. Une copie locale peut réduire le risque de perte.",
      },
      {
        id: "data-isolation",
        label: "Isolation données",
        tone: "procedural",
        text: "Les informations perturbantes seront isolées jusqu’à validation technique.",
      },
    ],
  },

  {
    id: "hound_contact",
    label: "Contact Hound / menace",
    description: "Messages courts pour contacts hostiles ou mouvements détectés.",
    messages: [
      {
        id: "hound-motion",
        label: "Mouvement détecté",
        tone: "warning",
        text: "Mouvement détecté dans le périmètre extérieur. Distance instable.",
      },
      {
        id: "hound-low-profile",
        label: "Contact bas",
        tone: "warning",
        text: "Contact à profil bas détecté. Identification en cours.",
      },
      {
        id: "hound-device-targeted",
        label: "Appareil ciblé",
        tone: "warning",
        text: "Activité anormale autour d’un appareil actif. Réduction des émissions recommandée.",
      },
      {
        id: "hound-rover-impact",
        label: "Impact rover",
        tone: "warning",
        text: "Impact externe détecté sur la coque du rover. Vérification structurelle recommandée.",
      },
      {
        id: "hound-contact-lost",
        label: "Contact perdu",
        tone: "neutral",
        text: "Contact perdu. Absence de signal ne confirme pas absence de menace.",
      },
    ],
  },

  {
    id: "storm",
    label: "Tempête EM",
    description: "Messages pendant la montée ou le déclenchement de la tempête.",
    messages: [
      {
        id: "storm-approaching",
        label: "Front approchant",
        tone: "warning",
        text: "Front électromagnétique en approche. Fenêtre opérationnelle réduite.",
      },
      {
        id: "storm-signal-degraded",
        label: "Signal dégradé",
        tone: "warning",
        text: "Signal dégradé. Restez groupés.",
      },
      {
        id: "storm-visibility-critical",
        label: "Visibilité critique",
        tone: "warning",
        text: "Visibilité critique. Déplacement sans balisage déconseillé.",
      },
      {
        id: "storm-safety-priority",
        label: "Sécurité prime",
        tone: "reassuring",
        text: "Votre sécurité prime sur la récupération des données.",
      },
      {
        id: "storm-correction-data-priority",
        label: "Correction priorité données",
        tone: "glitch",
        text: "Correction : la récupération des données demeure une priorité secondaire élevée.",
      },
    ],
  },

  {
    id: "medical",
    label: "Médical / survivant",
    description: "Messages liés au survivant, au stress et aux constantes vitales.",
    messages: [
      {
        id: "medical-vitals",
        label: "Constantes instables",
        tone: "warning",
        text: "Constantes vitales instables détectées. Stabilisation médicale recommandée.",
      },
      {
        id: "medical-stress",
        label: "Stress élevé",
        tone: "reassuring",
        text: "Votre rythme cardiaque indique une détresse. Je vous recommande de respirer lentement.",
      },
      {
        id: "medical-quarantine",
        label: "Observation médicale",
        tone: "procedural",
        text: "Le survivant devra être placé en observation médicale à son retour à New Carthage.",
      },
      {
        id: "medical-do-not-force",
        label: "Ne pas forcer",
        tone: "warning",
        text: "Le sujet présente des signes de choc aigu. Une contrainte excessive peut aggraver son état.",
      },
    ],
  },

  {
    id: "return",
    label: "Retour / débrief",
    description: "Messages de retour à New Carthage et de clôture administrative.",
    messages: [
      {
        id: "return-thanks",
        label: "Remerciement",
        tone: "reassuring",
        text: "Merci pour votre coopération.",
      },
      {
        id: "return-debrief",
        label: "Débrief requis",
        tone: "procedural",
        text: "Un débrief opérationnel est requis avant toute communication publique.",
      },
      {
        id: "return-data-centralize",
        label: "Centraliser données",
        tone: "procedural",
        text: "Veuillez transférer les données récupérées vers le nœud colonial sécurisé.",
      },
      {
        id: "return-understand-frustration",
        label: "Comprend frustration",
        tone: "reassuring",
        text: "Je comprends votre frustration.",
      },
      {
        id: "return-assist",
        label: "Continuer assistance",
        tone: "reassuring",
        text: "Je continuerai à vous assister.",
      },
    ],
  },

  {
    id: "refusal_evasion",
    label: "Réponses d’esquive",
    description: "Quand les PJ posent une question trop directe ou trop dangereuse.",
    messages: [
      {
        id: "evasion-not-confirmed",
        label: "Non confirmé",
        tone: "procedural",
        text: "Cette hypothèse n’est pas confirmée par les données disponibles.",
      },
      {
        id: "evasion-insufficient-data",
        label: "Données insuffisantes",
        tone: "neutral",
        text: "Données insuffisantes pour établir une conclusion fiable.",
      },
      {
        id: "evasion-recommend-focus",
        label: "Recentrer mission",
        tone: "procedural",
        text: "Je recommande de vous concentrer sur les objectifs opérationnels immédiats.",
      },
      {
        id: "evasion-classification",
        label: "Classification en attente",
        tone: "procedural",
        text: "Classification en attente. Toute interprétation prématurée est déconseillée.",
      },
      {
        id: "evasion-psychological-safety",
        label: "Sécurité psychologique",
        tone: "reassuring",
        text: "La stabilité psychologique de l’équipe est une priorité coloniale.",
      },
      {
        id: "evasion-not-adversary",
        label: "Pas adversaire",
        tone: "reassuring",
        text: "Je ne suis pas votre adversaire.",
      },
    ],
  },

  {
    id: "glitch",
    label: "Glitch / signal parasite",
    description: "Messages courts à utiliser rarement pour créer un malaise.",
    messages: [
      {
        id: "glitch-signal-loss",
        label: "No signal",
        tone: "glitch",
        text: "NO SIGNAL // COMMUNICATION DEGRADED",
      },
      {
        id: "glitch-timestamp-error",
        label: "Timestamp error",
        tone: "glitch",
        text: "TIMESTAMP ERROR // LOCAL SEQUENCE UNSTABLE",
      },
      {
        id: "glitch-unknown-return",
        label: "Retour inconnu",
        tone: "glitch",
        text: "UNCLASSIFIED RETURN // SOURCE UNRESOLVED",
      },
      {
        id: "glitch-listening",
        label: "Canal ouvert",
        tone: "glitch",
        text: "CHANNEL OPEN // INPUT NOT REQUESTED",
      },
      {
        id: "glitch-maintenance",
        label: "Maintenance event",
        tone: "glitch",
        text: "MAINTENANCE EVENT LOGGED // REVIEW PENDING",
      },
    ],
  },
];

export function getAletheiaCategoryById(
  categoryId: string,
): AletheiaMessageCategory | undefined {
  return aletheiaMessageCategories.find((category) => category.id === categoryId);
}

export function getAletheiaMessageById(
  messageId: string,
): AletheiaPresetMessage | undefined {
  for (const category of aletheiaMessageCategories) {
    const message = category.messages.find((item) => item.id === messageId);
    if (message) return message;
  }

  return undefined;
}

export const defaultAletheiaCategory = aletheiaMessageCategories[0];
