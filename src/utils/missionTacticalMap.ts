import type { MissionToken } from '../types/missionSchema';
import type { TacticalMapToken, TacticalTokenStatus, TacticalTokenType } from '../types/tacticalMap';

const TACTICAL_TOKEN_TYPES: TacticalTokenType[] = ['pj', 'pnj', 'hound', 'rover'];
const TACTICAL_TOKEN_STATUSES: TacticalTokenStatus[] = ['active', 'hidden', 'wounded', 'critical', 'dead', 'unknown'];

function clampPercent(value: unknown, fallback: number): number {
  return typeof value === 'number' ? Math.max(0, Math.min(100, value)) : fallback;
}

function isTacticalTokenType(value: unknown): value is TacticalTokenType {
  return typeof value === 'string' && TACTICAL_TOKEN_TYPES.includes(value as TacticalTokenType);
}

function isTacticalTokenStatus(value: unknown): value is TacticalTokenStatus {
  return typeof value === 'string' && TACTICAL_TOKEN_STATUSES.includes(value as TacticalTokenStatus);
}

function mapMissionTokenType(token: MissionToken): TacticalTokenType {
  const sourceType = token.metadata?.sourceType;
  if (isTacticalTokenType(sourceType)) return sourceType;

  if (token.type === 'player') return 'pj';
  if (token.type === 'npc') return 'pnj';
  if (token.type === 'creature') return 'hound';
  if (token.type === 'vehicle') return 'rover';
  return 'pnj';
}

function mapMissionTokenStatus(status: MissionToken['status']): TacticalTokenStatus {
  return isTacticalTokenStatus(status) ? status : 'unknown';
}

export function missionTokensToTacticalMapTokens(tokens: MissionToken[] = []): TacticalMapToken[] {
  return tokens.map((token) => {
    const tacticalType = mapMissionTokenType(token);
    const metadataInVehicle = token.metadata?.inVehicle;

    return {
      id: token.id,
      label: token.label,
      shortLabel: token.shortLabel,
      type: tacticalType,
      x: clampPercent(token.x, 50),
      y: clampPercent(token.y, 50),
      visibleToPlayers: token.visibleToPlayers,
      visibleInControl: token.visibleInControl,
      manualVisibilityOverride: false,
      inVehicle: tacticalType === 'pj' && (metadataInVehicle === true || Boolean(token.vehicleId)),
      status: mapMissionTokenStatus(token.status),
      sceneVisibility: token.sceneVisibility
    };
  });
}

export function sanitizeTacticalRuntimeTokens(value: unknown): TacticalMapToken[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((token): token is Partial<TacticalMapToken> => Boolean(token) && typeof token === 'object' && typeof token.id === 'string')
    .map((token) => {
      const fallbackType = isTacticalTokenType(token.type) ? token.type : 'pnj';

      return {
        id: token.id!,
        label: typeof token.label === 'string' ? token.label : token.id!,
        shortLabel: typeof token.shortLabel === 'string' ? token.shortLabel : token.id!,
        type: fallbackType,
        x: clampPercent(token.x, 50),
        y: clampPercent(token.y, 50),
        visibleToPlayers: typeof token.visibleToPlayers === 'boolean' ? token.visibleToPlayers : false,
        manualVisibilityOverride: typeof token.manualVisibilityOverride === 'boolean' ? token.manualVisibilityOverride : false,
        visibleInControl: typeof token.visibleInControl === 'boolean' ? token.visibleInControl : true,
        inVehicle: fallbackType === 'pj' && typeof token.inVehicle === 'boolean' ? token.inVehicle : false,
        status: isTacticalTokenStatus(token.status) ? token.status : 'unknown',
        sceneVisibility: Array.isArray(token.sceneVisibility)
          ? token.sceneVisibility.filter((sceneId): sceneId is string => typeof sceneId === 'string')
          : undefined
      };
    });
}

export function mergeTacticalRuntimeTokens(
  initialTokens: TacticalMapToken[],
  runtimeTokens: TacticalMapToken[] | undefined
): TacticalMapToken[] {
  const runtimeById = new Map((runtimeTokens ?? []).map((token) => [token.id, token]));

  return initialTokens.map((initialToken) => {
    const runtimeToken = runtimeById.get(initialToken.id);
    if (!runtimeToken) return { ...initialToken };

    return {
      ...initialToken,
      ...runtimeToken,
      x: clampPercent(runtimeToken.x, initialToken.x),
      y: clampPercent(runtimeToken.y, initialToken.y),
      visibleToPlayers: typeof runtimeToken.visibleToPlayers === 'boolean'
        ? runtimeToken.visibleToPlayers
        : initialToken.visibleToPlayers,
      manualVisibilityOverride: typeof runtimeToken.manualVisibilityOverride === 'boolean'
        ? runtimeToken.manualVisibilityOverride
        : false,
      visibleInControl: typeof runtimeToken.visibleInControl === 'boolean'
        ? runtimeToken.visibleInControl
        : initialToken.visibleInControl,
      inVehicle: initialToken.type === 'pj' && typeof runtimeToken.inVehicle === 'boolean'
        ? runtimeToken.inVehicle
        : false
    };
  });
}
