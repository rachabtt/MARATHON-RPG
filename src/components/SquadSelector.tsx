import React from 'react';
import PLAYER_CHARACTERS from '../utils/playerCharacters';
import CharacterPortraitCrop from './CharacterPortraitCrop';
import type { MissionControlState } from '../utils/syncState';

interface Props {
  squad: MissionControlState['squad'];
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  onValidate: () => void;
  onReset: () => void;
  onModify: () => void;
}

export default function SquadSelector({ squad, onSelect, onDeselect, onValidate, onReset, onModify }: Props) {
  const selectedSet = new Set(squad.selectedIds || []);

  return (
    <div className="mb-4 bg-stone-900 border border-stone-850 rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[12px] font-mono uppercase tracking-widest text-stone-400">CHOIX ESCOUADE M01</div>
          <div className="text-[10px] text-stone-300">Cliquez sur la vignette pour sélectionner 3 personnages</div>
        </div>
        <div className="text-[12px] font-bold text-emerald-300">{(squad.selectedIds||[]).length}/3</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {PLAYER_CHARACTERS.map((pc) => {
          const isSelected = selectedSet.has(pc.id);
          const disabled = !isSelected && (selectedSet.size >= 3);
          return (
            <button
              key={pc.id}
              onClick={() => (isSelected ? onDeselect(pc.id) : onSelect(pc.id))}
              disabled={disabled}
              className={`relative overflow-hidden rounded-lg border p-2 transition-all text-left ${isSelected ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-stone-800'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1">
                  {(pc.portrait || pc.cardImage) ? (
                    <CharacterPortraitCrop src={pc.portrait ?? pc.cardImage} alt={pc.name} size="small" cropSettings={pc.portrait ? { x: 0, y: 0, width: 100, height: 100 } : pc.portraitCrop} />
                  ) : (
                    <div className="w-16 h-16 bg-stone-800 flex items-center justify-center text-stone-400">?</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-white truncate">{pc.name}</div>
                  <div className="text-[10px] text-stone-400 truncate">{pc.role}</div>
                </div>
                <div className="absolute left-1 top-1 px-1 py-0.5 text-[10px] font-semibold rounded ${isSelected ? 'bg-emerald-600 text-black' : 'bg-black/40 text-white'}">{isSelected ? '✓' : ''}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onValidate}
          disabled={(squad.selectedIds||[]).length !== 3}
          className={`px-3 py-2 rounded font-bold uppercase text-[12px] ${((squad.selectedIds||[]).length === 3) ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'}`}
        >
          VALIDER ESCOUADE
        </button>
        <button
          onClick={onReset}
          className="px-3 py-2 rounded bg-stone-800 text-stone-300 text-[12px]"
        >
          RÉINITIALISER SÉLECTION
        </button>
        {squad.locked && (
          <button onClick={onModify} className="ml-auto px-3 py-2 rounded bg-amber-700 text-white text-[12px]">RECHOISIR ESCOUADE</button>
        )}
      </div>
    </div>
  );
}
