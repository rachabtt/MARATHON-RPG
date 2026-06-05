import type {
  CharacterEquipmentState,
  PlayerCharacterEquipment,
  PlayerCharacterId,
  PlayerCharacterProfile
} from '../types';

import maraPortrait from '../assets/player cards/cropped/voss_cropped.png';
import ilyanPortrait from '../assets/player cards/cropped/sato_cropped.png';
import naimaPortrait from '../assets/player cards/cropped/keller_cropped.png';
import kaelPortrait from '../assets/player cards/cropped/moreno_cropped.png';
import elaraPortrait from '../assets/player cards/cropped/nyx_cropped.png';
import dorianPortrait from '../assets/player cards/cropped/vale_cropped.png';
import junePortrait from '../assets/player cards/cropped/arendt_cropped.png';
import tomasPortrait from '../assets/player cards/cropped/rehn_cropped.png';

const STANDARD_EQUIPMENT: PlayerCharacterEquipment[] = [];

function specializedEquipment(items: Array<[id: string, label: string]>): PlayerCharacterEquipment[] {
  return items.map(([id, label]) => ({
    id,
    label,
    category: 'specialized',
    visibleToPlayerDefault: true
  }));
}

export const PLAYER_CHARACTERS: PlayerCharacterProfile[] = [
  {
    id: 'mara_voss',
    name: 'Mara Voss',
    role: 'Sécurité coloniale',
    portraitSrc: maraPortrait,
    concept: 'Officier de sécurité UESC habituée aux périmètres instables et aux décisions rapides.',
    playstyle: 'Protéger le groupe, tenir une ligne, prendre les risques à la place des autres.',
    stats: { physique: 3, technique: 1, mental: 1, presence: 2 },
    specializedEquipment: specializedEquipment([
      ['pistolet_uesc', 'Pistolet UESC'],
      ['lampe_tactique', 'Lampe tactique'],
      ['menottes_magnetiques', 'Menottes magnétiques'],
      ['gilet_renforce', 'Gilet renforcé'],
      ['matraque_telescopique', 'Matraque télescopique']
    ]),
    standardEquipment: STANDARD_EQUIPMENT,
    talent: {
      name: 'Interposition',
      description: "Lorsqu'un allié à portée subit une attaque, vous pouvez vous interposer. Vous devenez la cible de l'attaque à la place de cet allié."
    },
    personalHook: "Vous savez que la sécurité d'une colonie se joue souvent avant que les alarmes ne sonnent.",
    playerQuestion: 'Qui dans le groupe avez-vous déjà dû protéger malgré ses propres choix ?'
  },
  {
    id: 'ilyan_sato',
    name: 'Ilyan Sato',
    role: 'Ingénieur systèmes',
    portraitSrc: ilyanPortrait,
    concept: 'Technicien UESC spécialisé dans les diagnostics, réparations rapides et systèmes de terrain.',
    playstyle: 'Stabiliser les ressources, comprendre les pannes, garder le matériel opérationnel.',
    stats: { physique: 1, technique: 3, mental: 2, presence: 1 },
    specializedEquipment: specializedEquipment([
      ['kit_reparation', 'Kit de réparation'],
      ['tablette_diagnostic', 'Tablette diagnostic'],
      ['cable_universel', 'Câble universel'],
      ['drone_inspection', 'Drone d’inspection'],
      ['batterie_secours', 'Batterie secours']
    ]),
    standardEquipment: STANDARD_EQUIPMENT,
    talent: {
      name: "Stabilisation d'urgence",
      description: 'Stabilise une ressource technique qui vient de passer Critique.'
    },
    personalHook: 'Vous avez confiance dans les procédures, mais pas dans les maintenances bâclées.',
    playerQuestion: 'Quel système du convoi refusez-vous de laisser tomber ?'
  },
  {
    id: 'naima_keller',
    name: 'Dr Naïma Keller',
    role: 'Médecin cryo',
    portraitSrc: naimaPortrait,
    concept: 'Médecin de colonie formée aux urgences, au réveil cryo et aux constantes instables.',
    playstyle: 'Maintenir les autres debout, réduire la panique, trier les urgences sous pression.',
    stats: { physique: 1, technique: 1, mental: 3, presence: 2 },
    specializedEquipment: specializedEquipment([
      ['medkit', 'Medkit'],
      ['injecteurs', 'Injecteurs'],
      ['scanner_biometrique', 'Scanner biométrique'],
      ['sedatifs', 'Sédatifs'],
      ['patchs_hemostatiques', 'Patchs hémostatiques']
    ]),
    standardEquipment: STANDARD_EQUIPMENT,
    talent: {
      name: 'Stabiliser',
      description: "Soigne ou stabilise quelqu'un et réduit aussi son Stress de 1."
    },
    personalHook: "Chaque réveil cryo laisse une trace, même quand les constantes disent le contraire.",
    playerQuestion: "Quel signe médical vous inquiète depuis le réveil de l'équipe ?"
  },
  {
    id: 'kael_moreno',
    name: 'Kael Moreno',
    role: 'Pilote EVA / Rover',
    portraitSrc: kaelPortrait,
    concept: 'Pilote de terrain à l’aise avec les sorties EVA, les reliefs hostiles et les véhicules lourds.',
    playstyle: 'Ouvrir la route, prendre les trajectoires difficiles, extraire le groupe quand le terrain se referme.',
    stats: { physique: 2, technique: 3, mental: 1, presence: 1 },
    specializedEquipment: specializedEquipment([
      ['interface_rover', 'Interface rover'],
      ['harnais_eva', 'Harnais EVA'],
      ['ligne_amarrage_courte', 'Ligne d’amarrage courte'],
      ['carte_terrain', 'Carte terrain'],
      ['articulations_renforcees', 'Articulations renforcées']
    ]),
    standardEquipment: STANDARD_EQUIPMENT,
    talent: {
      name: 'Conduite impossible',
      description: 'Ignore le premier désavantage lié à la visibilité ou au terrain en pilotage dangereux.'
    },
    personalHook: 'Vous mesurez les distances en risques, en angles morts et en marges de freinage.',
    playerQuestion: 'Quelle limite de sécurité avez-vous déjà franchie pour ramener quelqu’un ?'
  },
  {
    id: 'elara_nyx',
    name: 'Elara Nyx',
    role: 'Scientifique xéno-environnement',
    portraitSrc: elaraPortrait,
    concept: 'Scientifique de terrain spécialisée dans les échantillons, phénomènes naturels et biosignatures.',
    playstyle: 'Observer, formuler des hypothèses, transformer les détails étranges en informations utiles.',
    stats: { physique: 1, technique: 2, mental: 3, presence: 1 },
    specializedEquipment: specializedEquipment([
      ['bioscanner', 'Bioscanner'],
      ['kit_echantillonnage', 'Kit d’échantillonnage'],
      ['spectrometre_portable', 'Spectromètre portable'],
      ['balises_terrain', 'Balises de terrain'],
      ['capsules_steriles', 'Capsules stériles']
    ]),
    standardEquipment: STANDARD_EQUIPMENT,
    talent: {
      name: 'Hypothèse de terrain',
      description: 'Pose une question précise au MJ sur une créature ou un phénomène naturel, même sur 7-9.'
    },
    personalHook: "Vous êtes venue pour comprendre Tau Ceti IV, pas seulement pour y survivre.",
    playerQuestion: 'Quel détail du paysage martien vous semble impossible à ignorer ?'
  },
  {
    id: 'dorian_vale',
    name: 'Dorian Vale',
    role: 'Agent UESC',
    portraitSrc: dorianPortrait,
    concept: 'Représentant opérationnel UESC chargé de garder la mission lisible, légale et prioritaire.',
    playstyle: 'Coordonner, imposer un cap, obtenir l’obéissance quand la situation se brouille.',
    stats: { physique: 1, technique: 1, mental: 2, presence: 3 },
    specializedEquipment: specializedEquipment([
      ['accreditation_uesc', 'Accréditation UESC'],
      ['canal_radio_prioritaire', 'Canal radio prioritaire'],
      ['pistolet_compact', 'Pistolet compact'],
      ['codes_mission_limites', 'Codes de mission limités'],
      ['tablette_admin_securisee', 'Tablette admin sécurisée']
    ]),
    standardEquipment: STANDARD_EQUIPMENT,
    talent: {
      name: 'Ordre clair',
      description: 'Donne avantage à un allié qui suit son ordre, mais prend +1 Stress.'
    },
    personalHook: 'Vous savez que les rapports écrits après coup ne protègent personne sur le terrain.',
    playerQuestion: 'Quelle règle officielle êtes-vous prêt à plier pour que la mission revienne entière ?'
  },
  {
    id: 'june_arendt',
    name: 'June Arendt',
    role: 'Opératrice drones',
    portraitSrc: junePortrait,
    concept: 'Spécialiste drones et reconnaissance, efficace quand elle voit avant que le groupe avance.',
    playstyle: 'Explorer à distance, cartographier vite, détecter les signatures faibles avant le contact.',
    stats: { physique: 1, technique: 3, mental: 2, presence: 1 },
    specializedEquipment: specializedEquipment([
      ['drone_leger', 'Drone léger'],
      ['console_controle', 'Console de contrôle'],
      ['camera_thermique', 'Caméra thermique'],
      ['batterie_secours', 'Batterie secours'],
      ['module_cartographie_rapide', 'Module cartographie rapide']
    ]),
    standardEquipment: STANDARD_EQUIPMENT,
    talent: {
      name: 'Œil distant',
      description: "Son drone reconnaît une zone sans l'exposer directement ; perdre le drone lui inflige +1 Stress."
    },
    personalHook: 'Vous préférez perdre un signal que perdre une personne.',
    playerQuestion: "Qu'avez-vous déjà vu sur un retour caméra que vous n'avez jamais réussi à expliquer ?"
  },
  {
    id: 'tomas_rehn',
    name: 'Tomas Rehn',
    role: 'Logisticien colonial',
    portraitSrc: tomasPortrait,
    concept: 'Gestionnaire de matériel colonial, habitué aux inventaires incomplets et aux solutions improvisées.',
    playstyle: 'Trouver la pièce utile, compter ce qui reste, transformer une caisse oubliée en avantage.',
    stats: { physique: 2, technique: 2, mental: 1, presence: 2 },
    specializedEquipment: specializedEquipment([
      ['manifeste_mission', 'Manifeste de mission'],
      ['transpondeurs', 'Transpondeurs'],
      ['caisse_urgence', 'Caisse d’urgence'],
      ['outil_levage_compact', 'Outil de levage compact'],
      ['inventaire_semi_officiel', 'Inventaire semi-officiel']
    ]),
    standardEquipment: STANDARD_EQUIPMENT,
    talent: {
      name: 'Prévu dans le manifeste',
      description: "Relance une vérification logistique ou d'approvisionnement ; doit utiliser le second résultat."
    },
    personalHook: "Vous savez qu'une mission échoue rarement par manque de courage ; elle échoue par manque de pièces.",
    playerQuestion: 'Quel objet non prévu avez-vous glissé dans le chargement avant le départ ?'
  }
];

export function getPlayerCharacterById(id?: string | null): PlayerCharacterProfile | null {
  return PLAYER_CHARACTERS.find((character) => character.id === id) ?? null;
}

export function getAllPlayerCharacters(): PlayerCharacterProfile[] {
  return PLAYER_CHARACTERS;
}

export function createInitialPlayerEquipmentState(): Record<PlayerCharacterId, CharacterEquipmentState> {
  return PLAYER_CHARACTERS.reduce((state, character) => {
    const equipment = character.specializedEquipment.reduce<CharacterEquipmentState['equipment']>(
      (equipmentState, item) => ({
        ...equipmentState,
        [item.id]: {
          visible: item.visibleToPlayerDefault,
          used: false
        }
      }),
      {}
    );

    return {
      ...state,
      [character.id]: {
        characterId: character.id,
        equipment
      }
    };
  }, {} as Record<PlayerCharacterId, CharacterEquipmentState>);
}
