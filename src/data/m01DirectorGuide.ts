export type DirectorTension = "CALME" | "TENSION" | "CRITIQUE";

export type DirectorGuideEntry = {
  sceneId: string;
  sceneLabel: string;
  objective: string;
  nextPressure: string;
  tension: DirectorTension;
};

export const M01_DIRECTOR_GUIDE: Record<string, DirectorGuideEntry> = {
  // Accept both canonical beats and human-friendly aliases
  depart_new_carthage: {
    sceneId: 'depart_new_carthage',
    sceneLabel: 'DÉPART — NEW CARTHAGE',
    objective: "Installer la colonie, laisser les PJ choisir leur équipement, puis pousser vers le départ.",
    nextPressure: "Ordre UESC, météo qui se dégrade, impatience de Rowe.",
    tension: 'CALME'
  },
  intro_aletheia: {
    sceneId: 'intro_aletheia',
    sceneLabel: 'DÉPART — NEW CARTHAGE',
    objective: "Installer la colonie, laisser les PJ choisir leur équipement, puis pousser vers le départ.",
    nextPressure: "Ordre UESC, météo qui se dégrade, impatience de Rowe.",
    tension: 'CALME'
  },
  briefing_rowe: {
    sceneId: 'briefing_rowe',
    sceneLabel: 'BRIEFING — ROWE',
    objective: "Donner une mission claire : survivants, données, rover. Garder le ton rationnel.",
    nextPressure: "Question insistante des PJ ou anomalie de télémétrie minimale.",
    tension: 'CALME'
  },
  traversee: {
    sceneId: 'traversee',
    sceneLabel: 'TRAVERSÉE — PLAINES ROUGES',
    objective: "Faire sentir l’échelle de Tau Ceti IV et le trajet en rover.",
    nextPressure: "Visibilité ↓, trace de Hound ou signal Delta-6 faible.",
    tension: 'TENSION'
  },
  anomalie_radio: {
    sceneId: 'anomalie_radio',
    sceneLabel: 'ANOMALIE — RADIO',
    objective: "Faire entendre une phrase trop tôt, sans expliquer. Rester sec et crédible.",
    nextPressure: "Bruit +1, Signal radio ↓ ou question technique sans réponse claire.",
    tension: 'TENSION'
  },
  approche_arches_noires: {
    sceneId: 'approche_arches_noires',
    sceneLabel: 'APPROCHE — ARCHES NOIRES',
    objective: "Installer l’étrangeté des arches sans les transformer en temple alien.",
    nextPressure: "Échos radio, traces au sol, mouvement lointain.",
    tension: 'TENSION'
  },
  arches_noires: {
    sceneId: 'approche_arches_noires',
    sceneLabel: 'APPROCHE — ARCHES NOIRES',
    objective: "Installer l’étrangeté des arches sans les transformer en temple alien.",
    nextPressure: "Échos radio, traces au sol, mouvement lointain.",
    tension: 'TENSION'
  },
  contact_hound: {
    sceneId: 'contact_hound',
    sceneLabel: 'CONTACT — HOUNDS',
    objective: "Montrer que la technologie attire la menace. Garder le combat lisible.",
    nextPressure: "Contact Hound, équipement ciblé, scanner/radio attaqué.",
    tension: 'CRITIQUE'
  },
  hounds_proches: {
    sceneId: 'contact_hound',
    sceneLabel: 'CONTACT — HOUNDS',
    objective: "Montrer que la technologie attire la menace. Garder le combat lisible.",
    nextPressure: "Contact Hound, équipement ciblé, scanner/radio attaqué.",
    tension: 'CRITIQUE'
  },
  site_delta6: {
    sceneId: 'arrivee_delta6',
    sceneLabel: 'ARRIVÉE — DELTA-6',
    objective: "Laisser fouiller 2-3 éléments, puis déclencher une pression si scanner/radio actif.",
    nextPressure: "Temps avant tempête ↓ ou Contact Hound.",
    tension: 'TENSION'
  },
  arrivee_delta6: {
    sceneId: 'arrivee_delta6',
    sceneLabel: 'ARRIVÉE — DELTA-6',
    objective: "Laisser fouiller 2-3 éléments, puis déclencher une pression si scanner/radio actif.",
    nextPressure: "Temps avant tempête ↓ ou Contact Hound.",
    tension: 'TENSION'
  },
  scanner_actif: {
    sceneId: 'scanner_actif',
    sceneLabel: 'DELTA-6 — SCANNER ACTIF',
    objective: "Mettre l’accent sur les données incohérentes et le risque d’attirer quelque chose.",
    nextPressure: "Données instables, Hound attiré, Signal radio ↓.",
    tension: 'TENSION'
  },
  tempete_em: {
    sceneId: 'tempete_em',
    sceneLabel: 'TEMPÊTE EM',
    objective: "Forcer des choix rapides : données, survivant, rover, sécurité.",
    nextPressure: "Visibilité Critique, radio Perdue, rover Dégradé.",
    tension: 'CRITIQUE'
  },
  extraction: {
    sceneId: 'extraction',
    sceneLabel: 'EXTRACTION',
    objective: "Accélérer. Les PJ ne doivent probablement pas tout sauver.",
    nextPressure: "Rover Critique, Hound sur la coque, survivant en crise.",
    tension: 'CRITIQUE'
  },
  retour_new_carthage: {
    sceneId: 'retour_new_carthage',
    sceneLabel: 'RETOUR — NEW CARTHAGE',
    objective: "Ramener au calme administratif. Faire sentir que la colonie absorbe l’horreur.",
    nextPressure: "Débrief Rowe, filtrage des données, silence gênant.",
    tension: 'TENSION'
  },
  retour_new_carthage_alt: {
    sceneId: 'retour_new_carthage',
    sceneLabel: 'RETOUR — NEW CARTHAGE',
    objective: "Ramener au calme administratif. Faire sentir que la colonie absorbe l’horreur.",
    nextPressure: "Débrief Rowe, filtrage des données, silence gênant.",
    tension: 'TENSION'
  },
  final_terminal: {
    sceneId: 'finale_terminal',
    sceneLabel: 'TERMINAL FINAL',
    objective: "Afficher uniquement si le MJ déclenche explicitement la fin.",
    nextPressure: "Écran noir ou retour au calme.",
    tension: 'CRITIQUE'
  }
};

const DEFAULT_ENTRY: DirectorGuideEntry = {
  sceneId: 'depart_new_carthage',
  sceneLabel: 'DÉPART — NEW CARTHAGE',
  objective: "Garder le rythme et préparer la traversée.",
  nextPressure: "Météo, signal instable.",
  tension: 'CALME'
};

export function getDirectorGuideEntry(sceneId?: string | null): DirectorGuideEntry {
  if (!sceneId) return DEFAULT_ENTRY;
  return M01_DIRECTOR_GUIDE[sceneId] ?? DEFAULT_ENTRY;
}
