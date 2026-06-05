import type {
  CharacterEquipmentState,
  PlayerCharacterEquipment,
  PlayerCharacterId,
  PlayerCharacterProfile
} from '../../types';

type CharacterEquipmentControlProps = {
  characters: PlayerCharacterProfile[];
  equipmentState: Record<PlayerCharacterId, CharacterEquipmentState>;
  selectedSquadIds: string[];
  onToggleVisible: (characterId: PlayerCharacterId, equipmentId: string) => void;
  onToggleUsed: (characterId: PlayerCharacterId, equipmentId: string) => void;
};

function toLegacySquadId(characterId: PlayerCharacterId): string {
  return characterId.replaceAll('_', '-');
}

function getRuntimeState(
  characterId: PlayerCharacterId,
  equipment: PlayerCharacterEquipment,
  equipmentState: CharacterEquipmentControlProps['equipmentState']
) {
  return equipmentState[characterId]?.equipment[equipment.id] ?? {
    visible: equipment.visibleToPlayerDefault,
    used: false
  };
}

export default function CharacterEquipmentControl({
  characters,
  equipmentState,
  selectedSquadIds,
  onToggleVisible,
  onToggleUsed
}: CharacterEquipmentControlProps) {
  const selectedSet = new Set(selectedSquadIds);

  return (
    <section className="rounded-xl border border-stone-800/90 bg-stone-950/92 p-4 text-stone-200 shadow-2xl shadow-black/35">
      <div className="mb-4 border-b border-stone-850 pb-4">
        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-orange-400">
          ÉQUIPEMENTS
        </div>
        <div className="mt-1 text-xs text-stone-500">
          Visibilité et usage transmis aux fiches `/player`.
        </div>
      </div>

      <div className="space-y-3">
        {characters.map((character) => {
          const isSelected = selectedSet.has(character.id) || selectedSet.has(toLegacySquadId(character.id));

          return (
            <details
              key={character.id}
              defaultOpen={isSelected}
              className="rounded-lg border border-stone-800 bg-stone-900/55"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold uppercase tracking-[0.14em] text-white">{character.name}</div>
                  <div className="mt-0.5 truncate text-[10px] uppercase tracking-[0.18em] text-stone-500">{character.role}</div>
                </div>
                <span className={`shrink-0 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${
                  isSelected
                    ? 'border-emerald-500/50 text-emerald-300'
                    : 'border-stone-700 text-stone-500'
                }`}>
                  {isSelected ? 'Escouade' : 'Réserve'}
                </span>
              </summary>

              <div className="border-t border-stone-800 px-3 py-3">
                <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">
                  Spécialisé
                </div>
                <div className="space-y-1.5">
                  {character.specializedEquipment.map((item) => {
                    const runtimeState = getRuntimeState(character.id, item, equipmentState);

                    return (
                      <div
                        key={item.id}
                        className={`rounded border px-2 py-2 ${
                          runtimeState.visible
                            ? 'border-stone-800 bg-black/35'
                            : 'border-stone-900 bg-black/20 opacity-55'
                        }`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className={`text-xs leading-snug text-stone-200 ${runtimeState.used ? 'line-through decoration-orange-400/80 decoration-2' : ''}`}>
                              {item.label}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {!runtimeState.visible && (
                                <span className="rounded border border-stone-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-stone-400">
                                  Masqué
                                </span>
                              )}
                              {runtimeState.used && (
                                <span className="rounded border border-orange-500/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-orange-300">
                                  Utilisé
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-1">
                            <label className="flex cursor-pointer items-center gap-1.5 rounded border border-stone-700 bg-stone-950 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-stone-300 hover:border-emerald-600">
                              <input
                                type="checkbox"
                                checked={runtimeState.visible}
                                onChange={() => onToggleVisible(character.id, item.id)}
                                className="h-3 w-3 accent-emerald-500"
                              />
                              Visible
                            </label>
                            <label className="flex cursor-pointer items-center gap-1.5 rounded border border-stone-700 bg-stone-950 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-stone-300 hover:border-orange-600">
                              <input
                                type="checkbox"
                                checked={runtimeState.used}
                                onChange={() => onToggleUsed(character.id, item.id)}
                                className="h-3 w-3 accent-orange-500"
                              />
                              Utilisé
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
