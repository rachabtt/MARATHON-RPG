import maraCard from '../assets/player cards/voss.png';
import ilyanCard from '../assets/player cards/sato.png';
import naimaCard from '../assets/player cards/keller.png';
import kaelCard from '../assets/player cards/moreno.png';
import elaraCard from '../assets/player cards/nyx.png';
import dorianCard from '../assets/player cards/vale.png';
import juneCard from '../assets/player cards/arendt.png';
import tomasCard from '../assets/player cards/rehn.png';

export type PlayerCharacter = {
  id: string;
  name: string;
  role: string;
  cardImage?: string;
  stats: {
    physique: number;
    technique: number;
    mental: number;
    presence: number;
  };
  equipment: string[];
  talent: {
    name: string;
    summary: string;
  };
  trackers: {
    stress: number;
    bruit: number;
    blessures: number;
  };
  status: string;
  visible: boolean;
  note?: string;
};

export const PLAYER_CHARACTERS: PlayerCharacter[] = [
  {
    id: 'mara-voss',
    name: 'Mara Voss',
    role: 'Sécurité coloniale',
    cardImage: maraCard,
    stats: { physique: 3, technique: 1, mental: 1, presence: 2 },
    equipment: ['pistolet UESC', 'matraque télescopique', 'lampe tactique', 'menottes magnétiques', 'gilet renforcé'],
    talent: { name: 'Interposition', summary: "prend +1 Stress pour donner avantage à un allié qu’elle protège" },
    trackers: { stress: 0, bruit: 0, blessures: 0 },
    status: 'OK',
    visible: true
  },
  {
    id: 'ilyan-sato',
    name: 'Ilyan Sato',
    role: 'Ingénieur systèmes',
    cardImage: ilyanCard,
    stats: { physique: 1, technique: 3, mental: 2, presence: 1 },
    equipment: ['kit de réparation', 'tablette diagnostic', 'câble universel', 'mini-drone d’inspection', 'batterie de secours'],
    talent: { name: 'Stabilisation d’urgence', summary: 'stabilise une ressource technique qui vient de passer Critique' },
    trackers: { stress: 0, bruit: 0, blessures: 0 },
    status: 'OK',
    visible: true
  },
  {
    id: 'naima-keller',
    name: 'Dr Naïma Keller',
    role: 'Médecin cryo',
    cardImage: naimaCard,
    stats: { physique: 1, technique: 1, mental: 3, presence: 2 },
    equipment: ['kit médical', 'injecteurs', 'scanner biométrique', 'calmants réglementés', 'patchs hémostatiques'],
    talent: { name: 'Stabiliser', summary: 'soigne ou stabilise quelqu’un et réduit aussi son Stress de 1' },
    trackers: { stress: 0, bruit: 0, blessures: 0 },
    status: 'OK',
    visible: true
  },
  {
    id: 'kael-moreno',
    name: 'Kael Moreno',
    role: 'Pilote EVA / Rover',
    cardImage: kaelCard,
    stats: { physique: 2, technique: 3, mental: 1, presence: 1 },
    equipment: ['interface rover', 'harnais EVA', 'grappin court', 'carte terrain', 'combinaison renforcée'],
    talent: { name: 'Conduite impossible', summary: "ignore le premier désavantage lié à la visibilité ou au terrain en pilotage dangereux" },
    trackers: { stress: 0, bruit: 0, blessures: 0 },
    status: 'OK',
    visible: true
  },
  {
    id: 'elara-nyx',
    name: 'Elara Nyx',
    role: 'Scientifique xéno-environnement',
    cardImage: elaraCard,
    stats: { physique: 1, technique: 2, mental: 3, presence: 1 },
    equipment: ['scanner bio', 'kit d’échantillonnage', 'spectromètre portable', 'balises de prélèvement', 'capsules stériles'],
    talent: { name: 'Hypothèse de terrain', summary: "pose une question précise au MJ sur une créature ou un phénomène naturel, même sur 7-9" },
    trackers: { stress: 0, bruit: 0, blessures: 0 },
    status: 'OK',
    visible: true
  },
  {
    id: 'dorian-vale',
    name: 'Dorian Vale',
    role: 'Agent UESC',
    cardImage: dorianCard,
    stats: { physique: 1, technique: 1, mental: 2, presence: 3 },
    equipment: ['accréditation UESC', 'canal radio prioritaire', 'pistolet compact', 'codes de mission limités', 'tablette admin sécurisée'],
    talent: { name: 'Ordre clair', summary: "donne avantage à un allié qui suit son ordre, mais prend +1 Stress" },
    trackers: { stress: 0, bruit: 0, blessures: 0 },
    status: 'OK',
    visible: true
  },
  {
    id: 'june-arendt',
    name: 'June Arendt',
    role: 'Opératrice drones',
    cardImage: juneCard,
    stats: { physique: 1, technique: 3, mental: 2, presence: 1 },
    equipment: ['drone léger', 'console de contrôle', 'caméra thermique', 'batterie de secours', 'module cartographie rapide'],
    talent: { name: 'Œil distant', summary: "son drone reconnaît une zone sans l’exposer directement ; perdre le drone lui inflige +1 Stress" },
    trackers: { stress: 0, bruit: 0, blessures: 0 },
    status: 'OK',
    visible: true
  },
  {
    id: 'tomas-rehn',
    name: 'Tomas Rehn',
    role: 'Logisticien colonial',
    cardImage: tomasCard,
    stats: { physique: 2, technique: 2, mental: 1, presence: 2 },
    equipment: ['manifeste de mission', 'transpondeurs', 'caisse d’urgence', 'outil de levage compact', 'inventaire semi-officiel'],
    talent: { name: 'Prévu dans le manifeste', summary: "relance une vérification logistique ou d’approvisionnement ; doit utiliser le second résultat" },
    trackers: { stress: 0, bruit: 0, blessures: 0 },
    status: 'OK',
    visible: true
  }
];

export default PLAYER_CHARACTERS;

// Compatibility export used by syncState and initial app state
import type { SquadOverlayState } from '../types';

export const DEFAULT_SQUAD_OVERLAY: SquadOverlayState = {
  visible: false,
  mode: 'compact',
  members: PLAYER_CHARACTERS.map((pc) => ({
    id: pc.id,
    visible: pc.visible,
    name: pc.name,
    role: pc.role,
    stats: {
      physique: pc.stats.physique,
      technique: pc.stats.technique,
      mental: pc.stats.mental,
      presence: pc.stats.presence
    },
    trackers: { stress: 0, bruit: 0, blessures: 0 },
    equipment: pc.equipment.slice(0, 3),
    status: pc.status,
    note: pc.note,
    portrait: pc.cardImage
  }))
};
