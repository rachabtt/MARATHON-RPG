import React from 'react';
import {
  defaultMissionScene,
  getMissionSceneById,
  missionScenes,
  type MissionScene,
} from '../data/missionScenes';

type Props = {
  sceneId?: string | null;
  onChangeSceneId?: (id: string) => void;
};

export default function DirectorGuidePanel({ sceneId, onChangeSceneId }: Props) {
  const scene: MissionScene = getMissionSceneById(sceneId) ?? defaultMissionScene;

  const tensionColor = scene.tensionLevel === 'CALME' ? 'text-emerald-400 border-emerald-600' : scene.tensionLevel === 'TENSION' ? 'text-amber-400 border-amber-600' : 'text-red-400 border-red-600';

  return (
    <div className={`bg-black/60 border ${tensionColor} rounded p-3 font-mono text-stone-200 select-none` }>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider text-stone-400">CONDUITE MJ</div>
        <div className="text-[10px] uppercase text-stone-500">M01 / SOL ROUGE / DIRECTOR</div>
      </div>

      <div className="text-[11px] uppercase text-stone-300 mb-1">SCÈNE ACTIVE</div>
      <div className="text-sm font-semibold mb-2">{scene.label}</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <div>
          <div className="text-[11px] uppercase text-stone-300 mb-1">LIEU</div>
          <div className="text-sm">{scene.location}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase text-stone-300 mb-1">AMBIANCE RECOMMANDÉE</div>
          <div className="text-sm">{scene.recommendedMood}</div>
        </div>
      </div>

      <div className="text-[11px] uppercase text-stone-300 mb-1">OBJECTIF MJ</div>
      <div className="text-sm mb-2">{scene.gmObjective}</div>

      <div className="text-[11px] uppercase text-stone-300 mb-1">PROCHAINE PRESSION</div>
      <div className="text-sm mb-2">{scene.nextPressure}</div>

      <div className="text-[11px] uppercase text-stone-300 mb-1">TENSION</div>
      <div className={`inline-block px-2 py-1 rounded text-sm font-bold ${scene.tensionLevel === 'CALME' ? 'bg-emerald-900 text-emerald-300' : scene.tensionLevel === 'TENSION' ? 'bg-amber-900 text-amber-300' : 'bg-red-900 text-red-300'}`}>{scene.tensionLevel}</div>

      {onChangeSceneId && (
        <div className="mt-3 text-xs text-stone-400">
          <label className="mr-2">Changer :</label>
          <select className="bg-stone-900 text-stone-200 p-1 rounded" value={scene.id} onChange={(e) => onChangeSceneId(e.target.value)}>
            {missionScenes.map((missionScene) => (
              <option key={missionScene.id} value={missionScene.id}>{missionScene.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
