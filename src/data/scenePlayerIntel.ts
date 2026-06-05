export type PlayerIntelType =
  | "cryo_dream"
  | "sensation"
  | "objective"
  | "uesc_notice"
  | "personal_prompt"
  | "environment";

export type PlayerIntelTarget =
  | "all"
  | "selected_player"
  | "role_security"
  | "role_engineer"
  | "role_medical"
  | "role_pilot"
  | "role_science"
  | "role_command"
  | "role_drone"
  | "role_logistics";

export type ScenePlayerIntel = {
  id: string;
  sceneId: string;
  title: string;
  type: PlayerIntelType;
  target: PlayerIntelTarget;
  text: string;
  tone: "neutral" | "uneasy" | "procedural" | "urgent";
};

export const scenePlayerIntel: ScenePlayerIntel[] = [
  {
    id: "cryo-dream-red-door",
    sceneId: "reveil-aletheia",
    title: "RÊVE CRYO",
    type: "cryo_dream",
    target: "selected_player",
    tone: "uneasy",
    text: "Tu te souviens d’une porte rouge sous la poussière. Elle n’avait ni poignée, ni mur autour d’elle.",
  },
  {
    id: "cryo-dream-voice-delay",
    sceneId: "reveil-aletheia",
    title: "RÊVE CRYO",
    type: "cryo_dream",
    target: "selected_player",
    tone: "uneasy",
    text: "Dans ton rêve, quelqu’un répétait tes phrases avant que tu les penses.",
  },
  {
    id: "cryo-dream-black-arches",
    sceneId: "reveil-aletheia",
    title: "RÊVE CRYO",
    type: "cryo_dream",
    target: "selected_player",
    tone: "uneasy",
    text: "Tu as rêvé de grandes arches noires sur une plaine rouge. Tu ne les avais jamais vues.",
  },
  {
    id: "cryo-sensation-cold-lungs",
    sceneId: "reveil-aletheia",
    title: "SENSATION AU RÉVEIL",
    type: "sensation",
    target: "all",
    tone: "neutral",
    text: "Tes poumons brûlent légèrement. Le personnel médical dit que c’est normal après le réveil cryogénique.",
  },
  {
    id: "briefing-objective-clear",
    sceneId: "briefing-rowe",
    title: "OBJECTIF ACTUEL",
    type: "objective",
    target: "all",
    tone: "procedural",
    text: "Localiser Delta-6. Récupérer survivants, données et matériel. Revenir avant dégradation météo.",
  },
  {
    id: "briefing-uesc-rumors",
    sceneId: "briefing-rowe",
    title: "NOTE UESC",
    type: "uesc_notice",
    target: "all",
    tone: "procedural",
    text: "Les communications non opérationnelles sont déconseillées. New Carthage reste fragile.",
  },
  {
    id: "prep-personal-item",
    sceneId: "preparation",
    title: "QUESTION PERSONNELLE",
    type: "personal_prompt",
    target: "all",
    tone: "neutral",
    text: "Quel objet personnel ton personnage vérifie-t-il avant de monter dans le rover ?",
  },
  {
    id: "prep-role-engineer",
    sceneId: "preparation",
    title: "RÉFLEXE TECHNIQUE",
    type: "personal_prompt",
    target: "role_engineer",
    tone: "neutral",
    text: "Le rover est fonctionnel, mais un voyant secondaire te semble mal calibré.",
  },
  {
    id: "red-plains-environment",
    sceneId: "traversee-plaines-rouges",
    title: "ENVIRONNEMENT",
    type: "environment",
    target: "all",
    tone: "neutral",
    text: "Les plaines rouges donnent une impression d’échelle impossible. New Carthage disparaît vite derrière la poussière.",
  },
  {
    id: "red-plains-pilot",
    sceneId: "traversee-plaines-rouges",
    title: "RÉFLEXE PILOTE",
    type: "personal_prompt",
    target: "role_pilot",
    tone: "neutral",
    text: "Le sol est plus irrégulier que prévu. Le rover tient, mais il faudra éviter les accélérations brusques.",
  },
  {
    id: "radio-anomaly-personal",
    sceneId: "anomalie-radio",
    title: "ANOMALIE RADIO",
    type: "sensation",
    target: "selected_player",
    tone: "uneasy",
    text: "Pendant une seconde, tu es certain d’avoir entendu ta propre voix avant d’avoir parlé.",
  },
  {
    id: "radio-anomaly-all",
    sceneId: "anomalie-radio",
    title: "CANAL UESC",
    type: "environment",
    target: "all",
    tone: "uneasy",
    text: "La radio grésille. Puis tout revient à la normale, trop vite.",
  },
  {
    id: "arches-silence",
    sceneId: "approche-arches-noires",
    title: "ENVIRONNEMENT",
    type: "environment",
    target: "all",
    tone: "uneasy",
    text: "Près des arches, le vent semble s’éteindre. Même les bruits du rover paraissent plus lointains.",
  },
  {
    id: "arches-science",
    sceneId: "approche-arches-noires",
    title: "INTUITION SCIENTIFIQUE",
    type: "personal_prompt",
    target: "role_science",
    tone: "uneasy",
    text: "La forme des arches peut être naturelle. Probablement. Mais leur surface absorbe la lumière d’une manière étrange.",
  },
  {
    id: "delta6-objective",
    sceneId: "arrivee-delta6",
    title: "OBJECTIF ACTUEL",
    type: "objective",
    target: "all",
    tone: "procedural",
    text: "Inspecter le rover Delta-6, sécuriser le périmètre, localiser les survivants éventuels, récupérer les données.",
  },
  {
    id: "delta6-security",
    sceneId: "arrivee-delta6",
    title: "RÉFLEXE SÉCURITÉ",
    type: "personal_prompt",
    target: "role_security",
    tone: "urgent",
    text: "Le site est trop ouvert. Trop silencieux. Si quelque chose approche, vous le verrez probablement trop tard.",
  },
  {
    id: "scanner-data",
    sceneId: "scanner-actif",
    title: "DATA PACKAGE DELTA-6",
    type: "objective",
    target: "all",
    tone: "procedural",
    text: "Les données sont instables. Les copier prendra du temps. Les abandonner évitera des risques.",
  },
  {
    id: "scanner-engineer",
    sceneId: "scanner-actif",
    title: "DIAGNOSTIC",
    type: "personal_prompt",
    target: "role_engineer",
    tone: "uneasy",
    text: "Ce n’est pas une corruption classique. Le fichier existe, mais certaines mesures semblent ne rien mesurer.",
  },
  {
    id: "hound-contact",
    sceneId: "contact-hound",
    title: "CONTACT",
    type: "environment",
    target: "all",
    tone: "urgent",
    text: "Mouvement bas dans la poussière. Rapide. Trop bas pour être humain.",
  },
  {
    id: "hound-drone",
    sceneId: "contact-hound",
    title: "SIGNAL DRONE",
    type: "personal_prompt",
    target: "role_drone",
    tone: "urgent",
    text: "Ton drone capte un contact une fraction de seconde avant que le signal ne se déforme.",
  },
  {
    id: "velen-medical",
    sceneId: "survivant-velen",
    title: "ÉTAT DU SURVIVANT",
    type: "personal_prompt",
    target: "role_medical",
    tone: "urgent",
    text: "Le survivant est en état de choc. Il est transportable, mais une pression excessive peut aggraver son état.",
  },
  {
    id: "velen-all",
    sceneId: "survivant-velen",
    title: "SURVIVANT",
    type: "environment",
    target: "all",
    tone: "uneasy",
    text: "Il ne semble pas surpris d’être retrouvé. Il évite seulement de regarder les arches.",
  },
  {
    id: "storm-objective",
    sceneId: "tempete-em",
    title: "ALERTE MÉTÉO",
    type: "objective",
    target: "all",
    tone: "urgent",
    text: "Front électromagnétique sur zone. Extraction immédiate recommandée.",
  },
  {
    id: "storm-sensation",
    sceneId: "tempete-em",
    title: "SENSATION",
    type: "sensation",
    target: "selected_player",
    tone: "uneasy",
    text: "Dans le souffle radio, tu crois entendre une question. Elle disparaît avant d’avoir du sens.",
  },
  {
    id: "extraction-objective",
    sceneId: "extraction",
    title: "OBJECTIF ACTUEL",
    type: "objective",
    target: "all",
    tone: "urgent",
    text: "Quitter le site. Protéger l’équipe. Sauver ce qui peut encore l’être.",
  },
  {
    id: "return-uesc",
    sceneId: "retour-new-carthage",
    title: "PROCÉDURE UESC",
    type: "uesc_notice",
    target: "all",
    tone: "procedural",
    text: "Débrief médical et opérationnel obligatoire avant retour en population générale.",
  },
  {
    id: "finale-mobile",
    sceneId: "finale-terminal",
    title: "TERMINAL LOCAL",
    type: "environment",
    target: "all",
    tone: "uneasy",
    text: "Une ligne apparaît sur un terminal de maintenance, puis disparaît. Personne ne semble l’avoir validée.",
  },
];

export function getPlayerIntelForScene(sceneId: string): ScenePlayerIntel[] {
  return scenePlayerIntel.filter((intel) => intel.sceneId === sceneId);
}

export function getPlayerIntelById(id: string): ScenePlayerIntel | undefined {
  return scenePlayerIntel.find((intel) => intel.id === id);
}
