import type { TacticalMapToken } from '../types/tacticalMap';

export const MISSION01_TACTICAL_TOKENS: TacticalMapToken[] = [
  // Player characters
  {
    id: 'mara-voss',
    label: 'Mara Voss',
    shortLabel: 'MV',
    type: 'pj',
    x: 22,
    y: 28,
    visibleToPlayers: true,
    visibleInControl: true,
    inVehicle: false,
    status: 'active'
  },
  {
    id: 'ilyan-sato',
    label: 'Ilyan Sato',
    shortLabel: 'IS',
    type: 'pj',
    x: 24,
    y: 29,
    visibleToPlayers: true,
    visibleInControl: true,
    inVehicle: false,
    status: 'active'
  },
  {
    id: 'naima-keller',
    label: 'Dr Naïma Keller',
    shortLabel: 'NK',
    type: 'pj',
    x: 25,
    y: 30,
    visibleToPlayers: true,
    visibleInControl: true,
    inVehicle: false,
    status: 'active'
  },
  {
    id: 'kael-moreno',
    label: 'Kael Moreno',
    shortLabel: 'KM',
    type: 'pj',
    x: 23,
    y: 31,
    visibleToPlayers: true,
    visibleInControl: true,
    inVehicle: false,
    status: 'active'
  },
  {
    id: 'elara-nyx',
    label: 'Elara Nyx',
    shortLabel: 'EN',
    type: 'pj',
    x: 24,
    y: 32,
    visibleToPlayers: true,
    visibleInControl: true,
    inVehicle: false,
    status: 'active'
  },
  {
    id: 'dorian-vale',
    label: 'Dorian Vale',
    shortLabel: 'DV',
    type: 'pj',
    x: 22,
    y: 30,
    visibleToPlayers: true,
    visibleInControl: true,
    inVehicle: false,
    status: 'active'
  },
  {
    id: 'june-arendt',
    label: 'June Arendt',
    shortLabel: 'JA',
    type: 'pj',
    x: 25,
    y: 28,
    visibleToPlayers: true,
    visibleInControl: true,
    inVehicle: false,
    status: 'active'
  },
  {
    id: 'tomas-rehn',
    label: 'Tomas Rehn',
    shortLabel: 'TR',
    type: 'pj',
    x: 23,
    y: 29,
    visibleToPlayers: true,
    visibleInControl: true,
    inVehicle: false,
    status: 'active'
  },

  // NPCs
  {
    id: 'commander-rowe',
    label: 'Commander Rowe',
    shortLabel: 'ROWE',
    type: 'pnj',
    x: 20,
    y: 25,
    visibleToPlayers: false,
    visibleInControl: true,
    inVehicle: false,
    status: 'active'
  },
  {
    id: 'dr-velen',
    label: 'Dr Velen',
    shortLabel: 'VELEN',
    type: 'pnj',
    x: 72,
    y: 80,
    visibleToPlayers: false,
    visibleInControl: true,
    inVehicle: false,
    status: 'hidden'
  },

  // Hounds
  {
    id: 'hound-01',
    label: 'Hound 01',
    shortLabel: 'H1',
    type: 'hound',
    x: 70,
    y: 62,
    visibleToPlayers: false,
    visibleInControl: true,
    inVehicle: false,
    status: 'hidden'
  },
  {
    id: 'hound-02',
    label: 'Hound 02',
    shortLabel: 'H2',
    type: 'hound',
    x: 72,
    y: 65,
    visibleToPlayers: false,
    visibleInControl: true,
    inVehicle: false,
    status: 'hidden'
  },
  {
    id: 'hound-03',
    label: 'Hound 03',
    shortLabel: 'H3',
    type: 'hound',
    x: 74,
    y: 68,
    visibleToPlayers: false,
    visibleInControl: true,
    inVehicle: false,
    status: 'hidden'
  },
  {
    id: 'hound-alpha',
    label: 'Hound Alpha',
    shortLabel: 'HA',
    type: 'hound',
    x: 73,
    y: 70,
    visibleToPlayers: false,
    visibleInControl: true,
    inVehicle: false,
    status: 'hidden'
  },

  // Rovers
  {
    id: 'rover-uesc',
    label: 'Rover UESC',
    shortLabel: 'R-UESC',
    type: 'rover',
    x: 27,
    y: 34,
    visibleToPlayers: true,
    visibleInControl: true,
    inVehicle: false,
    status: 'active'
  },
  {
    id: 'rover-delta6',
    label: 'Rover Delta-6',
    shortLabel: 'R-D6',
    type: 'rover',
    x: 74,
    y: 82,
    visibleToPlayers: false,
    visibleInControl: true,
    inVehicle: false,
    status: 'unknown'
  }
];
