/**
 * Types pour la carte tactique de Mission 01 — SOL ROUGE.
 */

export type TacticalTokenType = 'pj' | 'pnj' | 'hound' | 'rover';
export type TacticalTokenStatus = 'active' | 'hidden' | 'wounded' | 'critical' | 'dead' | 'unknown';

export interface TacticalMapToken {
  id: string;
  label: string;
  shortLabel: string;
  type: TacticalTokenType;
  x: number; // pourcentage 0-100
  y: number; // pourcentage 0-100
  visibleToPlayers: boolean;
  manualVisibilityOverride?: boolean;
  visibleInControl: boolean;
  inVehicle: boolean;
  status: TacticalTokenStatus;
  sceneVisibility?: string[];
}
