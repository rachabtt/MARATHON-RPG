// GM ONLY — never render this content in player display
import { useState } from 'react';
import { useMission } from '../../context/MissionProvider';
import type { MissionGmScriptScene } from '../../types/missionSchema';

type GmReaderPanelProps = {
  activeSceneId?: string | null;
  onSelectScene?: (sceneId: string) => void;
  className?: string;
};

type SceneListProps = {
  title: string;
  items: string[];
  tone?: 'normal' | 'amber' | 'red';
};

const gmScriptSceneAliases: Record<string, string> = {
  depart_new_carthage: 'reveil-aletheia',
  intro_aletheia: 'reveil-aletheia',
  reveil_aletheia: 'reveil-aletheia',
  'reveil-aletheia': 'reveil-aletheia',
  briefing_rowe: 'briefing-rowe',
  'briefing-rowe': 'briefing-rowe',
  preparation: 'preparation',
  traversee: 'traversee-plaines-rouges',
  traversee_plaines_rouges: 'traversee-plaines-rouges',
  'traversee-plaines-rouges': 'traversee-plaines-rouges',
  anomalie_radio: 'anomalie-radio',
  'anomalie-radio': 'anomalie-radio',
  approche_arches_noires: 'approche-arches-noires',
  'approche-arches-noires': 'approche-arches-noires',
  arches_noires: 'approche-arches-noires',
  arrivee_delta6: 'arrivee-delta6',
  'arrivee-delta6': 'arrivee-delta6',
  site_delta6: 'arrivee-delta6',
  scanner_actif: 'scanner-actif',
  'scanner-actif': 'scanner-actif',
  contact_hound: 'contact-hound',
  'contact-hound': 'contact-hound',
  survivant_velen: 'survivant-velen',
  'survivant-velen': 'survivant-velen',
  tempete_em: 'tempete-em',
  'tempete-em': 'tempete-em',
  extraction: 'extraction',
  retour_new_carthage: 'retour-new-carthage',
  'retour-new-carthage': 'retour-new-carthage',
  finale_terminal: 'finale-terminal',
  final_terminal: 'finale-terminal',
  'finale-terminal': 'finale-terminal',
};

function getGmScriptSceneIdForStoryBeat(id?: string | null): string {
  if (!id) return '';
  return gmScriptSceneAliases[id] ?? id;
}

function getGmScriptSceneIndex(script: MissionGmScriptScene[], id?: string | null): number {
  const normalizedId = getGmScriptSceneIdForStoryBeat(id);
  const index = script.findIndex((scene) => scene.id === normalizedId);
  return index >= 0 ? index : 0;
}

function getGmScriptSceneById(script: MissionGmScriptScene[], id?: string | null): MissionGmScriptScene {
  return script[getGmScriptSceneIndex(script, id)] ?? script[0];
}

function SceneList({ title, items, tone = 'normal' }: SceneListProps) {
  const toneClass =
    tone === 'red'
      ? 'border-red-900/50 bg-red-950/10 text-red-100'
      : tone === 'amber'
        ? 'border-orange-900/50 bg-orange-950/10 text-orange-100'
        : 'border-stone-800/80 bg-stone-950/45 text-stone-200';

  return (
    <section className={`rounded border p-3 ${toneClass}`}>
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
        {title}
      </h4>
      <ul className="space-y-1.5 text-[12px] leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function GmReaderPanel({ activeSceneId, onSelectScene, className = '' }: GmReaderPanelProps) {
  const [secretsOpen, setSecretsOpen] = useState(false);
  const { currentMission } = useMission();
  const gmScript = currentMission.gmScript ?? [];

  if (gmScript.length === 0) {
    return (
      <aside
        className={`rounded-xl border border-stone-800/90 bg-stone-950/92 text-stone-100 shadow-2xl shadow-black/35 ${className}`}
      >
        <div className="border-b border-stone-800/90 bg-stone-900/70 px-4 py-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-orange-400">
            LECTEUR MJ
          </div>
          <h3 className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-stone-50">
            Aucun script MJ disponible pour cette mission.
          </h3>
        </div>
      </aside>
    );
  }

  const scene = getGmScriptSceneById(gmScript, activeSceneId);
  const sceneIndex = getGmScriptSceneIndex(gmScript, activeSceneId);
  const previousScene = sceneIndex > 0 ? gmScript[sceneIndex - 1] : null;
  const nextScene = sceneIndex < gmScript.length - 1 ? gmScript[sceneIndex + 1] : null;

  return (
    <aside
      className={`rounded-xl border border-stone-800/90 bg-stone-950/92 text-stone-100 shadow-2xl shadow-black/35 ${className}`}
    >
      <div className="border-b border-stone-800/90 bg-stone-900/70 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-orange-400">
              LECTEUR MJ // M01
            </div>
            <h3 className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-stone-50">
              {scene.title}
            </h3>
          </div>
          <div className="shrink-0 rounded border border-emerald-700/50 bg-emerald-950/20 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300">
            SCÈNE {sceneIndex + 1} / {gmScript.length}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled={!previousScene}
            onClick={() => previousScene && onSelectScene?.(previousScene.id)}
            className="rounded border border-stone-700 bg-stone-950 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-stone-300 transition hover:border-orange-500 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Précédente
          </button>
          <button
            type="button"
            disabled={!nextScene}
            onClick={() => nextScene && onSelectScene?.(nextScene.id)}
            className="rounded border border-stone-700 bg-stone-950 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-stone-300 transition hover:border-orange-500 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Suivante
          </button>
          <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-stone-500">
            {scene.duration}
          </span>
        </div>
      </div>

      <div className="max-h-[72vh] overflow-y-auto px-4 py-4 [scrollbar-color:#57534e_#0c0a09]">
        <div className="space-y-3">
          <section className="rounded border border-orange-900/50 bg-orange-950/10 p-3">
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
              Fonction de scène
            </h4>
            <p className="text-[12px] leading-relaxed text-stone-200">
              {scene.sceneFunction}
            </p>
          </section>

          <SceneList title="À lire / paraphraser" items={scene.readAloud ?? []} />
          <SceneList title="Objectif MJ" items={scene.gmObjective ?? []} />
          <SceneList title="Infos visibles" items={scene.visibleInfo ?? []} />
          <SceneList title="Complications possibles" items={scene.possibleComplications ?? []} tone="amber" />
          <SceneList title="Suggestions Control" items={scene.controlSuggestions ?? []} />

          <section className="rounded border border-emerald-900/50 bg-emerald-950/10 p-3">
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              Rappel
            </h4>
            <p className="text-[12px] leading-relaxed text-stone-200">
              {scene.reminder}
            </p>
          </section>

          <section className="rounded border border-red-950/60 bg-red-950/10 p-3">
            <button
              type="button"
              onClick={() => setSecretsOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-red-300"
            >
              <span>MJ SECRET {secretsOpen ? 'FERMER' : 'OUVRIR'}</span>
              <span className="text-red-500">{secretsOpen ? '-' : '+'}</span>
            </button>
            {secretsOpen && (
              <ul className="mt-3 space-y-1.5 border-t border-red-950/60 pt-3 text-[12px] leading-relaxed text-red-100">
                {(scene.secretNotes ?? []).map((note) => (
                  <li key={note} className="flex gap-2">
                    <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-red-400/70" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </aside>
  );
}
