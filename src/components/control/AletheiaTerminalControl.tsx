import { useEffect, useRef, useState } from 'react';
import { Radio, Trash2, Zap, SignalZero } from 'lucide-react';
import { useMission } from '../../context/MissionProvider';
import { aletheiaSceneCategoryMap } from '../../data/aletheiaSceneMap';
import { getMissionSceneById } from '../../data/missionScenes';
import type { MissionAletheiaCategory, MissionAletheiaTone } from '../../types/missionSchema';
import type { AletheiaTerminalMessageSource, AletheiaTerminalState } from '../../utils/syncState';

type AletheiaTerminalControlProps = {
  terminal: AletheiaTerminalState;
  activeSceneId?: string | null;
  onSendMessage: (text: string, source?: AletheiaTerminalMessageSource) => void;
  onClearTerminal: () => void;
  onGlitchSignal: () => void;
  onToggleNoSignal: () => void;
};

const FALLBACK_CONTEXTUAL_CATEGORY_IDS = ['departure', 'refusal_evasion'];

const toneClassName: Record<MissionAletheiaTone, string> = {
  neutral: 'text-stone-400 border-stone-800',
  reassuring: 'text-emerald-200 border-emerald-900/70',
  warning: 'text-orange-200 border-orange-900/70',
  procedural: 'text-sky-200 border-sky-950/80',
  glitch: 'text-red-200 border-red-900/70',
  uneasy: 'text-orange-200 border-orange-900/70',
  urgent: 'text-red-200 border-red-900/70',
  hostile: 'text-red-200 border-red-900/70',
  calm: 'text-emerald-200 border-emerald-900/70'
};

function formatAletheiaMessage(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';

  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  const hasFinalPunctuation = /[.!?…]$/.test(capitalized);
  return hasFinalPunctuation ? capitalized : `${capitalized}.`;
}

function getContextualCategoryIds(
  sceneId: string | null | undefined,
  sceneMap: Record<string, string[]>,
  fallbackCategoryIds: string[]
): string[] {
  const canonicalSceneId = getMissionSceneById(sceneId)?.id;
  if (!canonicalSceneId) return fallbackCategoryIds;
  return sceneMap[canonicalSceneId] ?? fallbackCategoryIds;
}

function getCategoriesByIds(
  categories: MissionAletheiaCategory[],
  categoryIds: string[]
): MissionAletheiaCategory[] {
  const wantedIds = new Set(categoryIds);
  return categories.filter((category) => wantedIds.has(category.id));
}

export default function AletheiaTerminalControl({
  terminal,
  activeSceneId,
  onSendMessage,
  onClearTerminal,
  onGlitchSignal,
  onToggleNoSignal
}: AletheiaTerminalControlProps) {
  const { currentMission } = useMission();
  const [customMessage, setCustomMessage] = useState('');
  const [showOtherResponses, setShowOtherResponses] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const previousSceneIdRef = useRef<string | null | undefined>(activeSceneId);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const activeScene = getMissionSceneById(activeSceneId);
  const missionAletheia = currentMission.aletheia;
  const aletheiaCategories = missionAletheia?.categories ?? currentMission.aletheiaCategories ?? [];
  const sceneCategoryMap = missionAletheia?.sceneMap ?? aletheiaSceneCategoryMap;
  const fallbackCategoryIds = missionAletheia?.fallbackCategoryIds ?? FALLBACK_CONTEXTUAL_CATEGORY_IDS;
  const contextualCategoryIds = getContextualCategoryIds(activeSceneId, sceneCategoryMap, fallbackCategoryIds);
  const contextualCategories = getCategoriesByIds(aletheiaCategories, contextualCategoryIds);
  const contextualIdSet = new Set(contextualCategoryIds);
  const otherCategories = aletheiaCategories.filter((category) => !contextualIdSet.has(category.id));
  const glitchActive = Boolean(terminal.glitchUntil && terminal.glitchUntil > Date.now());

  useEffect(() => {
    setShowOtherResponses(false);
    if (previousSceneIdRef.current !== activeSceneId) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      previousSceneIdRef.current = activeSceneId;
    }
  }, [activeSceneId]);

  const sendCustomMessage = () => {
    const formatted = formatAletheiaMessage(customMessage);
    if (!formatted) return;
    onSendMessage(formatted, 'custom');
    setCustomMessage('');
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const renderCategoryGroup = (group: MissionAletheiaCategory) => (
    <div key={group.id} className="rounded border border-stone-900 bg-stone-950/60 p-2">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-orange-300">{group.label}</div>
      <div className="mb-2 text-[10px] leading-snug text-stone-600">{group.description}</div>
      <div className="grid gap-1.5">
        {(group.messages ?? []).map((message) => (
          <button
            key={message.id}
            onClick={() => onSendMessage(message.text, 'preset')}
            className={`rounded border bg-black/20 px-2 py-1.5 text-left text-[11px] leading-snug hover:border-emerald-800 hover:text-emerald-100 ${toneClassName[message.tone ?? 'neutral']}`}
          >
            <span className="block text-[10px] uppercase tracking-wider text-stone-500">{message.label}</span>
            {message.text}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section ref={panelRef} className="space-y-3 mb-4 border border-emerald-950/70 bg-black/45 rounded p-3 shadow-[inset_0_0_24px_rgba(16,185,129,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300">
            <Radio className="w-4 h-4" />
            <span>Aletheia Terminal</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-stone-500 mt-1">
            Manual GM uplink // No autonomous generation
          </div>
        </div>
        <div className={`h-2 w-2 rounded-full ${terminal.noSignal ? 'bg-red-500' : terminal.active ? 'bg-emerald-400' : 'bg-stone-700'}`} />
      </div>

      <textarea
        ref={textareaRef}
        value={customMessage}
        onChange={(event) => setCustomMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendCustomMessage();
          }
        }}
        placeholder="Message Aletheia..."
        rows={3}
        className="w-full resize-y min-h-18 max-h-32 rounded border border-stone-800 bg-stone-950/90 px-3 py-2 text-xs text-emerald-100 placeholder:text-stone-600 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-900/80"
      />
      <div className="text-[10px] uppercase tracking-wider text-stone-600">
        Enter pour envoyer · Shift+Enter pour retour ligne
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          onClick={onClearTerminal}
          className="flex items-center justify-center gap-2 px-3 py-2 border border-stone-800 rounded text-xs uppercase tracking-wide text-stone-300 hover:border-stone-600"
        >
          <Trash2 className="w-4 h-4" />
          Effacer terminal
        </button>
        <button
          onClick={onGlitchSignal}
          className={`flex items-center justify-center gap-2 px-3 py-2 border rounded text-xs uppercase tracking-wide ${
            glitchActive
              ? 'border-orange-400 bg-orange-950/45 text-orange-100 shadow-[0_0_14px_rgba(251,146,60,0.22)]'
              : 'border-orange-800/70 text-orange-200 hover:border-orange-500'
          }`}
        >
          <Zap className="w-4 h-4" />
          {glitchActive ? 'Glitch active' : 'Glitch signal'}
        </button>
        <button
          onClick={onToggleNoSignal}
          className={`flex items-center justify-center gap-2 px-3 py-2 border rounded text-xs uppercase tracking-wide ${
            terminal.noSignal
              ? 'border-red-500 bg-red-950/50 text-red-100'
              : 'border-stone-800 text-stone-300 hover:border-red-800'
          }`}
        >
          <SignalZero className="w-4 h-4" />
          {terminal.noSignal ? 'No signal actif' : 'Silence / No signal'}
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Réponses contextuelles</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-emerald-300">
            {activeScene?.label ?? 'Scène active inconnue'}
          </div>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
          {contextualCategories.map(renderCategoryGroup)}
        </div>

        <div className="rounded border border-stone-900 bg-stone-950/45">
          <button
            type="button"
            onClick={() => setShowOtherResponses((value) => !value)}
            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[10px] uppercase tracking-widest text-stone-400 hover:text-emerald-200"
          >
            <span>Autres réponses Aletheia</span>
            <span className="text-emerald-400">{showOtherResponses ? 'FERMER' : 'OUVRIR'}</span>
          </button>
          {showOtherResponses && (
            <div className="max-h-80 space-y-2 overflow-y-auto border-t border-stone-900 p-2 scrollbar-thin">
              {otherCategories.map(renderCategoryGroup)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
