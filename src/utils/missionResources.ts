import type { MissionResource } from '../types/missionSchema';
import type { ResourceState } from './syncState';

type ResourceColor = ResourceState['colors'][number];

const MISSION_RESOURCE_RUNTIME_IDS: Record<string, string> = {
  'signal-radio': 'signal',
  visibilite: 'visibility',
  'activite-em': 'tempest',
  'donnees-delta6': 'data',
  'rover-uesc': 'integrity',
  'rover-delta6': 'energy',
  'survivant-delta6': 'survivor',
  'calme-groupe': 'calm'
};

function toRuntimeResourceId(resourceId: string): string {
  return MISSION_RESOURCE_RUNTIME_IDS[resourceId] ?? resourceId;
}

function toResourceColor(color: string | undefined, severity: string | undefined): ResourceColor {
  if (color === 'emerald' || color === 'amber' || color === 'red' || color === 'stone') return color;
  if (color === 'orange') return 'amber';

  if (severity === 'stable') return 'emerald';
  if (severity === 'degraded') return 'amber';
  if (severity === 'critical') return 'red';
  return 'stone';
}

function getInitialStateIndex(resource: MissionResource): number {
  const initialStateId = resource.initialStateId;
  const initialStateLabel = resource.initialState?.toLowerCase();
  const initialIndex = resource.states.findIndex((state) => (
    state.id === initialStateId ||
    (initialStateLabel ? state.label.toLowerCase() === initialStateLabel : false)
  ));

  return initialIndex >= 0 ? initialIndex : 0;
}

export function missionResourcesToResourceStates(resources: MissionResource[] = []): ResourceState[] {
  return [...resources]
    .sort((first, second) => (first.displayOrder ?? 0) - (second.displayOrder ?? 0))
    .filter((resource) => resource.states.length > 0)
    .map((resource) => ({
      id: toRuntimeResourceId(resource.id),
      name: resource.displayLabel ?? resource.label,
      states: resource.states.map((state) => state.label),
      colors: resource.states.map((state) => toResourceColor(state.color, state.severity)),
      index: getInitialStateIndex(resource)
    }));
}

export function mergeMissionRuntimeResources(
  initialResources: ResourceState[],
  runtimeResources: ResourceState[] | undefined
): ResourceState[] {
  const runtimeById = new Map((runtimeResources ?? []).map((resource) => [resource.id, resource]));

  return initialResources.map((initialResource) => {
    const runtimeResource = runtimeById.get(initialResource.id);
    if (!runtimeResource) return { ...initialResource };

    return {
      ...initialResource,
      index: typeof runtimeResource.index === 'number'
        ? Math.max(0, Math.min(initialResource.states.length - 1, runtimeResource.index))
        : initialResource.index
    };
  });
}
