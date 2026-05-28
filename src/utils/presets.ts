import { CinemagraphConfig } from '../types';

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: Partial<CinemagraphConfig>;
  resourceIndexOverrides?: { [key: string]: number }; // overrides for resource states
}

export const PRESETS: Preset[] = [
  {
    id: 'calme',
    name: "Approche calme",
    description: "Vent léger, poussière retombée. Visibilité maximale pour l'arrivée sur zone.",
    config: {
      windSpeed: 0.6,
      dustDensity: 25,
      flickerRate: 0.2,
      headlightIntensity: 0.4,
      scannerPulseSpeed: 0.5,
      hazeBreathingSpeed: 0.6,
      environmentFilter: 'normal',
      visualRadioGlitch: 0.0,
      visualEmFlashes: false,
      visualHoundShadows: false,
      visualAletheiaOverlay: false,
      audioWindVolume: 0.15,
      audioHumVolume: 0.20,
      audioRadioVolume: 0.05,
      audioScannerVolume: 0.1,
      audioStormVolume: 0.0,
      audioRadioSilence: false
    },
    resourceIndexOverrides: {
      integrity: 0, // Stable
      energy: 0,    // Stable
      signal: 0,    // Stable
      visibility: 0, // Stable
      tempest: 0,   // Stable
      data: 0,      // Stable mais non sécurisées
      survivor: 0,  // Inconnu
      calm: 0       // Stable
    }
  },
  {
    id: 'delta6',
    name: "Site Delta-6",
    description: "État nominal du site Delta-6. Vent standard de Tau Ceti IV et brouillard ferrique standard.",
    config: {
      windSpeed: 1.0,
      dustDensity: 110,
      flickerRate: 1.0,
      headlightIntensity: 0.8,
      scannerPulseSpeed: 1.0,
      hazeBreathingSpeed: 1.0,
      environmentFilter: 'dust',
      visualRadioGlitch: 0.1,
      visualEmFlashes: false,
      visualHoundShadows: false,
      visualAletheiaOverlay: false,
      audioWindVolume: 0.45,
      audioHumVolume: 0.40,
      audioRadioVolume: 0.15,
      audioScannerVolume: 0.35,
      audioStormVolume: 0.1,
      audioRadioSilence: false
    },
    resourceIndexOverrides: {
      integrity: 0,
      energy: 0,
      signal: 1, // Dégradé
      visibility: 1, // Dégradé
      tempest: 1, // Dégradé
      data: 0,
      survivor: 0,
      calm: 0
    }
  },
  {
    id: 'scanner',
    name: "Scanner actif",
    description: "Le scanner géologique tourne à plein régime, émettant des ondes sub-bass lourdes sous la surface.",
    config: {
      windSpeed: 1.2,
      dustDensity: 130,
      flickerRate: 1.1,
      headlightIntensity: 0.7,
      scannerPulseSpeed: 2.8,
      hazeBreathingSpeed: 1.4,
      environmentFilter: 'scanner',
      visualRadioGlitch: 0.2,
      visualEmFlashes: false,
      visualHoundShadows: false,
      visualAletheiaOverlay: false,
      audioWindVolume: 0.45,
      audioHumVolume: 0.85,
      audioRadioVolume: 0.20,
      audioScannerVolume: 0.80,
      audioStormVolume: 0.15,
      audioRadioSilence: false
    },
    resourceIndexOverrides: {
      integrity: 0,
      energy: 1, // Dégradé (pompe l'énergie)
      signal: 1,
      visibility: 1,
      tempest: 1,
      data: 0,
      survivor: 0,
      calm: 0
    }
  },
  {
    id: 'signal',
    name: "Signal instable",
    description: "Perturbations magnétiques importantes. Les caméras s'affolent, la radio gresille intensément.",
    config: {
      windSpeed: 1.4,
      dustDensity: 160,
      flickerRate: 2.2,
      headlightIntensity: 0.5,
      scannerPulseSpeed: 1.5,
      hazeBreathingSpeed: 1.1,
      environmentFilter: 'signal',
      visualRadioGlitch: 0.65,
      visualEmFlashes: false,
      visualHoundShadows: false,
      visualAletheiaOverlay: false,
      audioWindVolume: 0.50,
      audioHumVolume: 0.50,
      audioRadioVolume: 0.75,
      audioScannerVolume: 0.40,
      audioStormVolume: 0.3,
      audioRadioSilence: false
    },
    resourceIndexOverrides: {
      integrity: 0,
      energy: 0,
      signal: 2, // Critique
      visibility: 1,
      tempest: 1,
      data: 1, // Dégradé
      survivor: 0,
      calm: 1 // Dégradé
    }
  },
  {
    id: 'hounds',
    name: "Hounds proches",
    description: "Des ombres indistinctes frôlent la périphérie des projecteurs. Le système Aletheia s'emballe.",
    config: {
      windSpeed: 0.8,
      dustDensity: 120,
      flickerRate: 2.5,
      headlightIntensity: 0.9,
      scannerPulseSpeed: 0.4,
      hazeBreathingSpeed: 1.8,
      environmentFilter: 'hounds',
      visualRadioGlitch: 0.35,
      visualEmFlashes: false,
      visualHoundShadows: true,
      visualAletheiaOverlay: true,
      audioWindVolume: 0.35,
      audioHumVolume: 0.75,
      audioRadioVolume: 0.45,
      audioScannerVolume: 0.15,
      audioStormVolume: 0.2,
      audioRadioSilence: false
    },
    resourceIndexOverrides: {
      integrity: 1, // Dégradé
      energy: 1,
      signal: 2, // Critique
      visibility: 2, // Critique
      tempest: 1,
      data: 1,
      survivor: 2, // Dégradé
      calm: 2 // Critique
    }
  },
  {
    id: 'tempete',
    name: "Tempête EM",
    description: "Une tempête électromagnétique frappe le site Delta-6. Décharges électriques à travers l'atmosphère de fer.",
    config: {
      windSpeed: 2.8,
      dustDensity: 290,
      flickerRate: 2.8,
      headlightIntensity: 0.3,
      scannerPulseSpeed: 0.2,
      hazeBreathingSpeed: 2.2,
      environmentFilter: 'storm',
      visualRadioGlitch: 0.90,
      visualEmFlashes: true,
      visualHoundShadows: false,
      visualAletheiaOverlay: false,
      audioWindVolume: 0.95,
      audioHumVolume: 0.60,
      audioRadioVolume: 0.90,
      audioScannerVolume: 0.05,
      audioStormVolume: 0.95,
      audioRadioSilence: false
    },
    resourceIndexOverrides: {
      integrity: 1,
      energy: 2, // Critique
      signal: 3, // Perdu
      visibility: 3, // Perdu
      tempest: 2, // Critique
      data: 2, // Critique
      survivor: 4, // Perdu (Inconnu/Perdu)
      calm: 2 // Critique
    }
  },
  {
    id: 'extraction',
    name: "Extraction",
    description: "Le moment critique. Les balises d'extraction s'allument alors que la structure tremble sous l'effet du vent.",
    config: {
      windSpeed: 2.4,
      dustDensity: 250,
      flickerRate: 1.8,
      headlightIntensity: 1.3,
      scannerPulseSpeed: 1.8,
      hazeBreathingSpeed: 2.0,
      environmentFilter: 'extraction',
      visualRadioGlitch: 0.50,
      visualEmFlashes: true,
      visualHoundShadows: true,
      visualAletheiaOverlay: true,
      audioWindVolume: 0.80,
      audioHumVolume: 0.90,
      audioRadioVolume: 0.60,
      audioScannerVolume: 0.50,
      audioStormVolume: 0.75,
      audioRadioSilence: false
    },
    resourceIndexOverrides: {
      integrity: 2, // Critique
      energy: 2, // Critique
      signal: 2, // Critique
      visibility: 2, // Critique
      tempest: 3, // Perdu (tempête là)
      data: 0, // Sauvegardées
      survivor: 1, // Trouvé/Stable
      calm: 3 // Perdu (Panique)
    }
  },
  {
    id: 'silence',
    name: "Silence radio",
    description: "Coupure complète des transmissions. Seul le bruit résiduel s'échappe de la carcasse métallique.",
    config: {
      windSpeed: 0.5,
      dustDensity: 40,
      flickerRate: 0.0,
      headlightIntensity: 0.0,
      scannerPulseSpeed: 0.0,
      hazeBreathingSpeed: 0.3,
      environmentFilter: 'silence',
      visualRadioGlitch: 0.0,
      visualEmFlashes: false,
      visualHoundShadows: false,
      visualAletheiaOverlay: false,
      audioWindVolume: 0.0,
      audioHumVolume: 0.0,
      audioRadioVolume: 0.0,
      audioScannerVolume: 0.0,
      audioStormVolume: 0.0,
      audioRadioSilence: true
    },
    resourceIndexOverrides: {
      integrity: 3, // Perdu
      energy: 3, // Perdu
      signal: 3, // Perdu
      visibility: 3, // Perdu
      tempest: 3, // Perdu
      data: 3, // Perdu
      survivor: 4, // Perdu
      calm: 3 // Perdu
    }
  }
];
