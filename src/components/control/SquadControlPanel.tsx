import type { ReactNode } from 'react';
import CharacterPortraitCrop from '../CharacterPortraitCrop';
import SquadSelector from '../SquadSelector';
import CharacterEquipmentControl from './CharacterEquipmentControl';
import { Plus, Waves, Zap } from 'lucide-react';
import type { CharacterEquipmentState, PlayerCharacterId, SquadMember, SquadOverlayState } from '../../types';
import type { MissionControlState } from '../../utils/syncState';
import { getAllPlayerCharacters } from '../../data/playerCharacters';

type SquadControlPanelProps = {
  squad: MissionControlState['squad'];
  squadOverlay: SquadOverlayState;
  playerEquipmentState: Record<PlayerCharacterId, CharacterEquipmentState>;
  onSelectSquadCharacter: (id: string) => void;
  onDeselectSquadCharacter: (id: string) => void;
  onValidateSquad: () => void;
  onResetSquad: () => void;
  onModifySquad: () => void;
  onToggleSquadOverlay: () => void;
  onUpdateSquadTracker: (memberId: string, trackerKey: 'stress' | 'bruit' | 'blessures', delta: number) => void;
  onToggleCharacterEquipmentVisible: (characterId: PlayerCharacterId, equipmentId: string) => void;
  onToggleCharacterEquipmentUsed: (characterId: PlayerCharacterId, equipmentId: string) => void;
};

function TrackerControl({
  label,
  value,
  max,
  icon,
  onDecrease,
  onIncrease
}: {
  label: string;
  value: number;
  max: number;
  icon: ReactNode;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex min-w-[96px] flex-col items-center rounded-md border border-stone-800 bg-black/35 px-2 py-2 text-xs text-stone-300">
      {icon}
      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-stone-400">{label}</div>
      <div className="mt-1 flex items-center gap-1">
        <button onClick={onDecrease} className="h-7 w-7 rounded border border-stone-700 bg-stone-950 text-stone-300 hover:border-orange-500 hover:text-orange-200">-</button>
        <div className="min-w-10 text-center text-sm font-bold text-white">{value}/{max}</div>
        <button onClick={onIncrease} className="h-7 w-7 rounded border border-stone-700 bg-stone-950 text-stone-300 hover:border-emerald-500 hover:text-emerald-200">+</button>
      </div>
    </div>
  );
}

function SquadMemberControl({
  member,
  onUpdateSquadTracker
}: {
  member: SquadMember;
  onUpdateSquadTracker: SquadControlPanelProps['onUpdateSquadTracker'];
}) {
  const trackers = member.trackers ?? { stress: 0, bruit: 0, blessures: 0 };

  return (
    <div className="rounded-lg border border-stone-800 bg-stone-900/65 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded border border-stone-800 bg-stone-950">
            <CharacterPortraitCrop src={member.portrait} alt={member.name} size={56} cropSettings={member.portraitCrop} />
          </div>
          <div className="min-w-0">
            <div className="break-words text-sm font-semibold uppercase tracking-[0.12em] text-white">{member.name}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-stone-500">{member.role}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <TrackerControl
            label="Stress"
            value={trackers.stress}
            max={5}
            icon={<Zap className="h-4 w-4 text-amber-400" />}
            onDecrease={() => onUpdateSquadTracker(member.id, 'stress', -1)}
            onIncrease={() => onUpdateSquadTracker(member.id, 'stress', 1)}
          />
          <TrackerControl
            label="Bruit"
            value={trackers.bruit}
            max={5}
            icon={<Waves className="h-4 w-4 text-sky-400" />}
            onDecrease={() => onUpdateSquadTracker(member.id, 'bruit', -1)}
            onIncrease={() => onUpdateSquadTracker(member.id, 'bruit', 1)}
          />
          <TrackerControl
            label="Blessures"
            value={trackers.blessures}
            max={3}
            icon={<Plus className="h-4 w-4 text-orange-400" />}
            onDecrease={() => onUpdateSquadTracker(member.id, 'blessures', -1)}
            onIncrease={() => onUpdateSquadTracker(member.id, 'blessures', 1)}
          />
        </div>
      </div>
    </div>
  );
}

export default function SquadControlPanel({
  squad,
  squadOverlay,
  playerEquipmentState,
  onSelectSquadCharacter,
  onDeselectSquadCharacter,
  onValidateSquad,
  onResetSquad,
  onModifySquad,
  onToggleSquadOverlay,
  onUpdateSquadTracker,
  onToggleCharacterEquipmentVisible,
  onToggleCharacterEquipmentUsed
}: SquadControlPanelProps) {
  const characters = getAllPlayerCharacters();

  return (
    <section className="h-full min-h-0 w-full overflow-y-auto text-stone-200">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
        <div className="rounded-xl border border-stone-800/90 bg-stone-950/92 p-4 shadow-2xl shadow-black/35">
          <div className="mb-4 flex flex-col gap-3 border-b border-stone-850 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-orange-400">
                ESCOUADE PJ
              </div>
              <div className="mt-1 text-xs text-stone-500">
                Sélection, affichage TV et jauges individuelles.
              </div>
            </div>
            <button
              onClick={onToggleSquadOverlay}
              className={`rounded border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition ${
                squadOverlay.visible
                  ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                  : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-emerald-700 hover:text-white'
              }`}
            >
              {squadOverlay.visible ? 'Masquer overlay TV' : 'Afficher overlay TV'}
            </button>
          </div>

          {!squad.locked && (
            <SquadSelector
              squad={squad}
              onSelect={onSelectSquadCharacter}
              onDeselect={onDeselectSquadCharacter}
              onValidate={onValidateSquad}
              onReset={onResetSquad}
              onModify={onModifySquad}
            />
          )}

          {squad.locked && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-stone-800 bg-stone-900/55 px-3 py-2">
              <div className="text-xs uppercase tracking-[0.16em] text-stone-400">
                Escouade verrouillée : <span className="text-emerald-300">{squadOverlay.members.length}/3 PJ</span>
              </div>
              <button onClick={onModifySquad} className="rounded border border-amber-700 bg-amber-950/30 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200 hover:bg-amber-900/40">
                Rechoisir escouade
              </button>
            </div>
          )}

          {squadOverlay.members.length > 0 ? (
            <div className="grid gap-3">
              {squadOverlay.members.slice(0, 3).map((member) => (
                <div key={member.id}>
                  <SquadMemberControl
                    member={member}
                    onUpdateSquadTracker={onUpdateSquadTracker}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-stone-800 bg-black/35 p-4 text-sm text-stone-500">
              Aucune escouade validée pour le moment.
            </div>
          )}
        </div>

        <div className="min-w-0">
          <CharacterEquipmentControl
            characters={characters}
            equipmentState={playerEquipmentState}
            selectedSquadIds={squad.selectedIds}
            onToggleVisible={onToggleCharacterEquipmentVisible}
            onToggleUsed={onToggleCharacterEquipmentUsed}
          />
        </div>
      </div>
    </section>
  );
}
