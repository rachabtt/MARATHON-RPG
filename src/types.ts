/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CinemagraphConfig {
  windSpeed: number;        // 0.5 to 3.0 (default 1.0)
  dustDensity: number;      // 10 to 300 (default 120)
  dustColor: string;        // hex or rgb (default #9c3f2d)
  flickerRate: number;      // 0.1 to 3.0 (default 1.0)
  headlightIntensity: number;// 0.0 to 1.5 (default 0.7)
  scannerPulseSpeed: number; // 0.2 to 4.0 (default 1.0)
  hazeBreathingSpeed: number;// 0.1 to 2.5 (default 1.0)
  environmentFilter: 'normal' | 'dust' | 'scanner' | 'signal' | 'hounds' | 'storm' | 'extraction' | 'silence';
  activeLocation?: 'new_carthage' | 'red_plains' | 'black_arches' | 'delta6';
  quickEffect?: QuickEffect | null;
  audioEnabled: boolean;
  audioWindVolume: number;   // 0.0 to 1.0
  audioHumVolume: number;    // 0.0 to 1.0
  telemetryActive: boolean;
  
  // Etape 2 additions
  visualRadioGlitch: number;       // 0.0 to 1.0
  visualEmFlashes: boolean;
  visualHoundShadows: boolean;
  visualAletheiaOverlay: boolean;
  audioRadioVolume: number;        // 0.0 to 1.0 (grésillement)
  audioScannerVolume: number;      // 0.0 to 1.0 (bip scanner)
  audioStormVolume: number;        // 0.0 to 1.0 (grondements météo)
  audioHoundsVolume: number;       // 0.0 to 1.0 (frottements/clics)
  audioRadioSilence: boolean;      // True = silence radio simulé (coupe tout)
  screenBlack: boolean;            // Black screen override
  emStormActive?: boolean;
  emStormSeverity?: 'critical' | 'lost';
}

export interface CinemagraphVisual {
  src: string;
  type: 'image' | 'video';
  label: string;
  variant: string;
  loop: boolean;
  oneShot: boolean;
}

export type QuickEffectType = 'glitch_radio' | 'flash_em' | 'ombre_hound';

export interface QuickEffect {
  type: QuickEffectType;
  startedAt: number;
  durationMs: number;
}

export type TransmissionType =
  | 'rowe'
  | 'aletheia'
  | 'velen'
  | 'delta6_log'
  | 'unknown_radio'
  | 'hound'
  | 'rover_system'
  | 'scanner_delta6'
  | 'em_storm'
  | 'terminal'
  | 'system';

export type HoundVariant = 'furtif' | 'proche' | 'equipement';

export interface ActiveTransmission {
  id: string;
  beatId?: string;
  type: TransmissionType;
  profileId?: string;
  variant?: 'portrait' | 'log' | 'alert' | 'system' | 'full' | 'compact';
  speaker: string;
  sourceRole: string;
  sourceType: "command" | "ai" | "field" | "log" | "unknown" | "system";
  message: string;
  audioSrc?: string;
  signalQuality: 'clair' | 'dégradé' | 'critique';
  startedAt: number;
  durationMs: number;
}

export interface InterventionOptions {
  showPortrait: boolean;
  showText: boolean;
  playAudio: boolean;
}

export interface InterventionState {
  activeBeatId?: string;
  speakerId?: TransmissionType;
  message?: string;
  visible: boolean;
  showPortrait: boolean;
  showText: boolean;
  playAudio: boolean;
  autoHide: boolean;
  durationMs: number;
  startedAt?: number;
}

export type SquadOverlayMode = 'compact' | 'detail';

export type PlayerCharacterId =
  | "mara_voss"
  | "ilyan_sato"
  | "naima_keller"
  | "kael_moreno"
  | "elara_nyx"
  | "dorian_vale"
  | "june_arendt"
  | "tomas_rehn";

export type CharacterStatKey = "physique" | "technique" | "mental" | "presence";

export type PlayerCharacterEquipment = {
  id: string;
  label: string;
  category: "standard" | "specialized" | "team";
  visibleToPlayerDefault: boolean;
};

export type PlayerCharacterProfile = {
  id: PlayerCharacterId;
  name: string;
  role: string;
  portraitSrc: string;
  concept: string;
  playstyle: string;
  stats: Record<CharacterStatKey, number>;
  specializedEquipment: PlayerCharacterEquipment[];
  standardEquipment: PlayerCharacterEquipment[];
  talent: {
    name: string;
    description: string;
  };
  personalHook: string;
  playerQuestion: string;
};

export type CharacterEquipmentState = {
  characterId: PlayerCharacterId;
  equipment: Record<string, {
    visible: boolean;
    used: boolean;
  }>;
};

export interface SquadMember {
  id: string;
  visible: boolean;
  name: string;
  role: string;
  stats: Record<string, string | number>;
  equipment: string[];
  trackers?: {
    stress: number;
    bruit: number;
    blessures: number;
  };
  status: string;
  note?: string;
  portrait?: string;
  portraitCrop?: { x: number; y: number; width: number; height: number };
}

export interface SquadOverlayState {
  visible: boolean;
  mode: SquadOverlayMode;
  members: SquadMember[];
}

export interface TransientEffectsState {
  hound?: {
    active: boolean;
    variant: HoundVariant;
    startedAt: number;
    durationMs: number;
  };
  glitchRadio?: {
    active: boolean;
    startedAt: number;
    durationMs: number;
  };
  flashEm?: {
    active: boolean;
    startedAt: number;
    durationMs: number;
  };
}

export type TelemetrySource = 'ENVIRONNEMENT' | 'COMMS' | 'ROVER D-6' | 'SCANNER' | 'ANTENNE' | 'ANTENNE RELAIS' | 'SÉCURITÉ' | 'ALETHEIA' | 'MÉTÉO';

export interface TelemetryLog {
  timestamp: string;
  source: TelemetrySource;
  message: string;
  status: 'info' | 'warning' | 'alert' | 'nominal';
}

export interface AtmosphereReading {
  pressure: number;
  o2: number;
  n2: number;
  co2: number;
  ar: number;
  temp: number;
}
