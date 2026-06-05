import { getMissionSceneById } from '../data/missionScenes';
import type { TacticalMapToken } from '../types/tacticalMap';

type VisibilityTarget = boolean | 'keep';
type VisibilityRule = Record<string, VisibilityTarget>;

const HOUND_IDS = ['hound-01', 'hound-02', 'hound-03', 'hound-alpha'];
const PLAYER_SAFE_SCENES = new Set([
  'reveil-aletheia',
  'briefing-rowe',
  'preparation',
  'traversee-plaines-rouges',
  'approche-arches-noires',
  'arrivee-delta6',
  'scanner-actif',
  'contact-hound',
  'survivant-velen',
  'retour-new-carthage',
]);
const PRESERVE_SCENES = new Set([
  'anomalie-radio',
  'tempete-em',
  'extraction',
  'finale-terminal',
]);

function hideHounds(rule: VisibilityRule): VisibilityRule {
  return HOUND_IDS.reduce<VisibilityRule>(
    (nextRule, houndId) => ({ ...nextRule, [houndId]: false }),
    rule
  );
}

function getSceneRule(sceneId: string, tokens: TacticalMapToken[]): VisibilityRule | null {
  const currentVisibility = (tokenId: string) =>
    tokens.find((token) => token.id === tokenId)?.visibleToPlayers ?? false;
  const visibleOnlyIfManual = (tokenId: string) => {
    const token = tokens.find((candidate) => candidate.id === tokenId);
    return Boolean(token?.visibleToPlayers && token.manualVisibilityOverride);
  };

  switch (sceneId) {
    case 'reveil-aletheia':
      return hideHounds({
        'rover-uesc': true,
        'commander-rowe': false,
        'dr-velen': false,
        'rover-delta6': false,
      });
    case 'briefing-rowe':
      return hideHounds({
        'commander-rowe': true,
        'rover-uesc': true,
        'dr-velen': false,
        'rover-delta6': false,
      });
    case 'preparation':
      return hideHounds({
        'commander-rowe': true,
        'rover-uesc': true,
        'dr-velen': false,
        'rover-delta6': false,
      });
    case 'traversee-plaines-rouges':
      return hideHounds({
        'rover-uesc': true,
        'commander-rowe': false,
        'dr-velen': false,
        'rover-delta6': false,
      });
    case 'approche-arches-noires':
      return hideHounds({
        'rover-uesc': true,
        'dr-velen': false,
      });
    case 'arrivee-delta6':
    case 'scanner-actif':
      return hideHounds({
        'rover-uesc': true,
        'rover-delta6': true,
        'dr-velen': false,
      });
    case 'contact-hound':
      return {
        'rover-uesc': true,
        'rover-delta6': currentVisibility('rover-delta6'),
        'hound-01': true,
        'hound-02': true,
        'hound-03': false,
        'hound-alpha': false,
        'dr-velen': visibleOnlyIfManual('dr-velen'),
      };
    case 'survivant-velen':
      return {
        'dr-velen': true,
        'rover-uesc': true,
        'rover-delta6': true,
      };
    case 'retour-new-carthage':
      return hideHounds({
        'commander-rowe': true,
        'dr-velen': currentVisibility('dr-velen'),
      });
    default:
      return null;
  }
}

export function applyTokenSceneVisibility(
  tokens: TacticalMapToken[],
  sceneId: string | null | undefined,
  selectedSquadIds: string[] = []
): TacticalMapToken[] {
  const canonicalSceneId = getMissionSceneById(sceneId)?.id;
  if (!canonicalSceneId || PRESERVE_SCENES.has(canonicalSceneId)) {
    return tokens;
  }

  const sceneRule = getSceneRule(canonicalSceneId, tokens);
  if (!sceneRule) return tokens;

  const selectedSquadSet = new Set(selectedSquadIds);

  return tokens.map((token) => {
    if (token.manualVisibilityOverride) return token;

    if (token.type === 'pj') {
      if (!PLAYER_SAFE_SCENES.has(canonicalSceneId)) return token;
      return {
        ...token,
        visibleToPlayers: selectedSquadSet.has(token.id),
      };
    }

    const target = sceneRule[token.id];
    if (typeof target !== 'boolean') return token;

    return {
      ...token,
      visibleToPlayers: target,
    };
  });
}
