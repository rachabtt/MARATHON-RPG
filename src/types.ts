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
  audioRadioSilence: boolean;      // True = silence radio simulé (coupe tout)
  screenBlack: boolean;            // Black screen override
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
