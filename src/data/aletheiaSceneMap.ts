import {
  aletheiaMessageCategories,
  type AletheiaMessageCategory,
} from "./aletheiaMessages";
import { getMissionSceneById } from "./missionScenes";

const FALLBACK_CONTEXTUAL_CATEGORY_IDS = ["departure", "refusal_evasion"];

export const aletheiaSceneCategoryMap: Record<string, string[]> = {
  "reveil-aletheia": ["departure", "medical", "refusal_evasion"],
  "briefing-rowe": ["departure", "refusal_evasion"],
  preparation: ["departure", "navigation"],
  "traversee-plaines-rouges": ["navigation", "radio_anomaly", "refusal_evasion"],
  "anomalie-radio": ["radio_anomaly", "glitch", "refusal_evasion"],
  "approche-arches-noires": ["navigation", "radio_anomaly", "hound_contact", "glitch"],
  "arrivee-delta6": ["delta6_data", "navigation", "hound_contact", "refusal_evasion"],
  "scanner-actif": ["delta6_data", "radio_anomaly", "glitch", "refusal_evasion"],
  "contact-hound": ["hound_contact", "storm", "medical"],
  "survivant-velen": ["medical", "delta6_data", "refusal_evasion"],
  "tempete-em": ["storm", "hound_contact", "glitch", "medical"],
  extraction: ["storm", "navigation", "medical", "hound_contact"],
  "retour-new-carthage": ["return", "delta6_data", "medical", "refusal_evasion"],
  "finale-terminal": ["glitch", "return"],
};

function getCanonicalSceneId(sceneId?: string | null): string | undefined {
  return getMissionSceneById(sceneId)?.id;
}

function getContextualCategoryIds(sceneId?: string | null): string[] {
  const canonicalSceneId = getCanonicalSceneId(sceneId);
  if (!canonicalSceneId) return FALLBACK_CONTEXTUAL_CATEGORY_IDS;
  return aletheiaSceneCategoryMap[canonicalSceneId] ?? FALLBACK_CONTEXTUAL_CATEGORY_IDS;
}

function getCategoriesByIds(categoryIds: string[]): AletheiaMessageCategory[] {
  const wantedIds = new Set(categoryIds);
  return aletheiaMessageCategories.filter((category) => wantedIds.has(category.id));
}

export function getAletheiaCategoriesForScene(sceneId?: string | null): AletheiaMessageCategory[] {
  return getCategoriesByIds(getContextualCategoryIds(sceneId));
}

export function getOtherAletheiaCategoriesForScene(sceneId?: string | null): AletheiaMessageCategory[] {
  const contextualIds = new Set(getContextualCategoryIds(sceneId));
  return aletheiaMessageCategories.filter((category) => !contextualIds.has(category.id));
}
