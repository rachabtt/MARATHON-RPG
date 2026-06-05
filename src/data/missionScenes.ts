export type MissionTensionLevel = "CALME" | "TENSION" | "CRITIQUE";

export type MissionScene = {
  id: string;
  label: string;
  shortLabel: string;
  location: string;
  recommendedMood: string;
  tensionLevel: MissionTensionLevel;
  gmObjective: string;
  nextPressure: string;
  displayHint?: string;
};

export const missionScenes: MissionScene[] = [
  {
    id: "reveil-aletheia",
    label: "RÉVEIL — ALETHEIA",
    shortLabel: "Réveil",
    location: "New Carthage / Cryobay",
    recommendedMood: "CALME",
    tensionLevel: "CALME",
    gmObjective:
      "Installer Tau Ceti IV, Aletheia et le réveil cryo. Faire présenter rapidement les PJ.",
    nextPressure:
      "Briefing Rowe. Glisser une première phrase administrative étrange si le rythme est lent.",
    displayHint:
      "Fond cryobay ou New Carthage calme. Pas encore de menace directe.",
  },
  {
    id: "briefing-rowe",
    label: "BRIEFING — ROWE",
    shortLabel: "Briefing",
    location: "New Carthage / Operations",
    recommendedMood: "CALME",
    tensionLevel: "CALME",
    gmObjective:
      "Donner une mission claire : localiser Delta-6, récupérer survivants, données et rover si possible.",
    nextPressure:
      "Choix d’équipement puis départ. Rappeler que l’UESC veut éviter les rumeurs.",
    displayHint:
      "Afficher New Carthage ou briefing UESC. Informations rationnelles uniquement.",
  },
  {
    id: "preparation",
    label: "PRÉPARATION — ÉQUIPEMENT",
    shortLabel: "Préparation",
    location: "New Carthage / Rover Bay",
    recommendedMood: "CALME",
    tensionLevel: "CALME",
    gmObjective:
      "Faire choisir 3 à 5 ressources utiles sans transformer la scène en inventaire interminable.",
    nextPressure:
      "Chaque équipement non choisi pourra devenir une complication plus tard.",
    displayHint:
      "Afficher escouade PJ ou New Carthage. Garder un ton opérationnel.",
  },
  {
    id: "traversee-plaines-rouges",
    label: "TRAVERSÉE — PLAINES ROUGES",
    shortLabel: "Traversée",
    location: "Plaines Rouges / Route Delta-6",
    recommendedMood: "CALME",
    tensionLevel: "TENSION",
    gmObjective:
      "Faire découvrir Tau Ceti IV : immensité, poussière rouge, horizon métallique, isolement.",
    nextPressure:
      "Baisser Visibilité ou Signal Radio d’un cran si les joueurs traînent ou ratent un jet.",
    displayHint:
      "Fond Plaines Rouges. État radio plutôt stable ou dégradé léger.",
  },
  {
    id: "anomalie-radio",
    label: "ANOMALIE RADIO",
    shortLabel: "Anomalie radio",
    location: "Plaines Rouges / Canal UESC",
    recommendedMood: "SIGNAL INSTABLE",
    tensionLevel: "TENSION",
    gmObjective:
      "Déclencher la phrase radio qui revient trop tôt. Ne pas expliquer. Laisser un silence.",
    nextPressure:
      "Signal Radio ↓, Stress +1 ou Bruit +1 pour le PJ concerné selon le ton voulu.",
    displayHint:
      "Afficher interférence locale / signal instable. Ne pas montrer HOLLOW ici.",
  },
  {
    id: "approche-arches-noires",
    label: "APPROCHE — ARCHES NOIRES",
    shortLabel: "Arches noires",
    location: "Black Arches / Approche Delta-6",
    recommendedMood: "SIGNAL INSTABLE",
    tensionLevel: "TENSION",
    gmObjective:
      "Faire basculer l’ambiance vers l’étrange sans rendre les arches explicitement artificielles.",
    nextPressure:
      "Échos radio, visibilité ↓, trace de Hound, ou mouvement dans la poussière.",
    displayHint:
      "Fond Arches Noires. Signal instable, activité EM dégradée.",
  },
  {
    id: "arrivee-delta6",
    label: "ARRIVÉE — DELTA-6",
    shortLabel: "Delta-6",
    location: "Site Delta-6 / Camp géologique abandonné",
    recommendedMood: "TENSION",
    tensionLevel: "TENSION",
    gmObjective:
      "Laisser les PJ inspecter le rover, le scanner, les traces, les caisses et les logs. Donner 2 à 4 indices.",
    nextPressure:
      "Si scanner, drone ou radio restent actifs : préparer Contact Hound ou Temps avant tempête ↓.",
    displayHint:
      "Fond Site Delta-6. Afficher état radio/visibilité dégradé.",
  },
  {
    id: "scanner-actif",
    label: "SCANNER ACTIF",
    shortLabel: "Scanner",
    location: "Site Delta-6 / Scanner géologique",
    recommendedMood: "SIGNAL INSTABLE",
    tensionLevel: "TENSION",
    gmObjective:
      "Faire des données Delta-6 un enjeu concret : récupérer, copier, sécuriser ou risquer la corruption.",
    nextPressure:
      "Afficher Data Package Delta-6. Données ↓, Signal Radio ↓ ou Hound attiré par activité active.",
    displayHint:
      "Afficher module DATA PACKAGE DELTA-6 si disponible.",
  },
  {
    id: "contact-hound",
    label: "CONTACT HOUND",
    shortLabel: "Hound",
    location: "Site Delta-6 / Périmètre extérieur",
    recommendedMood: "TENSION",
    tensionLevel: "CRITIQUE",
    gmObjective:
      "Créer une menace physique claire. Les Hounds ciblent d’abord les sources actives : drone, radio, lampe, rover.",
    nextPressure:
      "Blessure, Stress +1, équipement touché, ressource Rover/Radio/Drone ↓.",
    displayHint:
      "Overlay court de contact hostile. Ne pas trop montrer la créature.",
  },
  {
    id: "survivant-velen",
    label: "SURVIVANT — VELEN",
    shortLabel: "Survivant",
    location: "Site Delta-6 / Ravin ou rover",
    recommendedMood: "TENSION",
    tensionLevel: "TENSION",
    gmObjective:
      "Introduire le survivant comme enjeu humain et source d’indices fragmentaires. Il doit compliquer l’extraction.",
    nextPressure:
      "Survivant panique, Temps avant tempête ↓, choix entre données, survivant, rover ou sécurité.",
    displayHint:
      "Rester sobre. Pas de révélation claire. Ton médical / extraction.",
  },
  {
    id: "tempete-em",
    label: "TEMPÊTE EM",
    shortLabel: "Tempête",
    location: "Site Delta-6 / Front électromagnétique",
    recommendedMood: "TEMPÊTE EM",
    tensionLevel: "CRITIQUE",
    gmObjective:
      "Forcer une extraction avec coût. Les joueurs ne doivent probablement pas tout sauver facilement.",
    nextPressure:
      "Visibilité ↓, Radio ↓, Rover ↓, Données menacées, PJ isolé, Hound sur coque.",
    displayHint:
      "Activer mode Tempête EM global. Interface plus sombre, plus instable.",
  },
  {
    id: "extraction",
    label: "EXTRACTION",
    shortLabel: "Extraction",
    location: "Route Delta-6 / Retour New Carthage",
    recommendedMood: "EXTRACTION",
    tensionLevel: "CRITIQUE",
    gmObjective:
      "Faire trancher les priorités : survivant, données, rover, sécurité du groupe. Tout tenter doit coûter cher.",
    nextPressure:
      "Dernière complication : panne rover, radio perdue, visibilité perdue, blessure ou donnée corrompue.",
    displayHint:
      "Fond route/plaines ou tempête. Garder le rythme nerveux.",
  },
  {
    id: "retour-new-carthage",
    label: "RETOUR — NEW CARTHAGE",
    shortLabel: "Retour",
    location: "New Carthage / Débrief",
    recommendedMood: "CALME",
    tensionLevel: "TENSION",
    gmObjective:
      "Ramener le calme administratif. Faire le bilan : survivant, données, rover, blessures, anomalies.",
    nextPressure:
      "Aletheia ou l’UESC veulent centraliser les données. Installer la méfiance sans confirmer quoi que ce soit.",
    displayHint:
      "Fond New Carthage. Contraste fort avec le chaos extérieur.",
  },
  {
    id: "finale-terminal",
    label: "FINALE — TERMINAL",
    shortLabel: "Finale",
    location: "Terminal de maintenance / New Carthage",
    recommendedMood: "SIGNAL INSTABLE",
    tensionLevel: "CRITIQUE",
    gmObjective:
      "Clore sur une image froide et inquiétante. Ne répondre à aucune question de manière claire.",
    nextPressure:
      "Fin de session. Noter les soupçons des joueurs et les conséquences pour Mission 02.",
    displayHint:
      "Afficher écran final HOLLOW SIGNAL DETECTED / SOURCE: BELOW SURFACE.",
  },
];

const missionSceneAliases: Record<string, string> = {
  depart_new_carthage: "reveil-aletheia",
  intro_aletheia: "reveil-aletheia",
  briefing_rowe: "briefing-rowe",
  traversee: "traversee-plaines-rouges",
  anomalie_radio: "anomalie-radio",
  approche_arches_noires: "approche-arches-noires",
  arches_noires: "approche-arches-noires",
  arrivee_delta6: "arrivee-delta6",
  site_delta6: "arrivee-delta6",
  scanner_actif: "scanner-actif",
  contact_hound: "contact-hound",
  hounds_proches: "contact-hound",
  survivant_velen: "survivant-velen",
  tempete_em: "tempete-em",
  retour_new_carthage: "retour-new-carthage",
  finale_terminal: "finale-terminal",
  final_terminal: "finale-terminal",
};

export function getMissionSceneById(sceneId?: string | null): MissionScene | undefined {
  if (!sceneId) return undefined;
  const normalizedId = missionSceneAliases[sceneId] ?? sceneId;
  return missionScenes.find((scene) => scene.id === normalizedId);
}

export const defaultMissionScene = missionScenes[0];
