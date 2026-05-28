/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TelemetryLog, AtmosphereReading } from '../types';

export const CREW_LOGS = [
  {
    timestamp: "M01 / H-06:12",
    sender: "Delta-6 // Dr Isaac Velen",
    msg: "Relevé géologique actif près des Black Arches. Les basses fréquences sont instables, mais rien ne justifie encore l’arrêt de mission."
  },
  {
    timestamp: "M01 / H-05:44",
    sender: "Delta-6 // Mara Quell",
    msg: "Le rover tire à gauche. Poussière dans les articulations de roue. Je peux stabiliser, mais pas si le scanner continue à pomper l’énergie."
  },
  {
    timestamp: "M01 / H-05:18",
    sender: "Delta-6 // Sung Patel",
    msg: "Drone de reconnaissance lancé. Retour vidéo brouillé entre les arches. Je reçois des duplications de signal, probablement une latence radio."
  },
  {
    timestamp: "M01 / H-04:59",
    sender: "Delta-6 // Nima Ortez",
    msg: "Les relevés de profondeur ne correspondent pas aux modèles. Cavité possible, mais la géométrie ne tient pas. Demande vérification manuelle."
  },
  {
    timestamp: "M01 / H-04:41",
    sender: "Delta-6 // Journal audio corrompu",
    msg: "Vous entendez ça ? Coupez le scanner. Coupez—"
  }
];

export const ATMOSPHERE_BASE: AtmosphereReading = {
  pressure: 89.2,
  o2: 1.2,
  n2: 74.5,
  co2: 21.3,
  ar: 2.8,
  temp: -12.4
};

const LOG_MESSAGES_TEMPLATES: { source: TelemetryLog['source']; message: string; status: TelemetryLog['status'] }[] = [
  { source: "ENVIRONNEMENT", message: "Poussière ferrique en suspension. Visibilité réduite.", status: "nominal" },
  { source: "COMMS", message: "Latence radio variable. Écho de transmission non classé.", status: "info" },
  { source: "ROVER D-6", message: "Énergie instable. Roue gauche partiellement bloquée.", status: "warning" },
  { source: "SCANNER", message: "Retour géologique incohérent. Profondeur non confirmée.", status: "info" },
  { source: "ANTENNE RELAIS", message: "Orientation instable. Signal New Carthage dégradé.", status: "warning" },
  { source: "SÉCURITÉ", message: "Mouvement bas détecté entre les arches. Classification impossible.", status: "alert" },
  { source: "ALETHEIA", message: "Interférence locale détectée.", status: "alert" },
  { source: "MÉTÉO", message: "Front EM en approche. Fenêtre d’extraction réduite.", status: "warning" }
];

export function generateProceduralLog(index: number): TelemetryLog {
  const template = LOG_MESSAGES_TEMPLATES[index % LOG_MESSAGES_TEMPLATES.length];
  
  // Format current simulated timestamp
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  return {
    timestamp: timeStr,
    source: template.source,
    message: template.message,
    status: template.status
  };
}
