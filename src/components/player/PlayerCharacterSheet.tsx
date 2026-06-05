import type {
  CharacterEquipmentState,
  CharacterStatKey,
  PlayerCharacterEquipment,
  PlayerCharacterProfile
} from '../../types';
import type { PlayerIntelDelivery } from '../../utils/syncState';
import PlayerNotesPanel from './PlayerNotesPanel';

type PlayerTrackers = {
  stress: number;
  bruit: number;
  blessures: number;
};

type PlayerCharacterSheetProps = {
  character: PlayerCharacterProfile;
  equipmentState?: CharacterEquipmentState;
  trackers?: PlayerTrackers;
  playerIntelDeliveries?: PlayerIntelDelivery[];
  onChangeCharacter: () => void;
};

const STAT_LABELS: Array<[CharacterStatKey, string]> = [
  ['physique', 'PHYSIQUE'],
  ['technique', 'TECHNIQUE'],
  ['mental', 'MENTAL'],
  ['presence', 'PRÉSENCE']
];

const PLAYER_INTEL_TYPE_LABELS: Record<PlayerIntelDelivery['type'], string> = {
  cryo_dream: 'RÊVE CRYO',
  sensation: 'SENSATION',
  objective: 'OBJECTIF',
  uesc_notice: 'NOTE UESC',
  personal_prompt: 'PROMPT PJ',
  environment: 'ENVIRONNEMENT'
};

const PLAYER_INTEL_TONE_CLASSES: Record<PlayerIntelDelivery['tone'], string> = {
  neutral: 'border-emerald-900/45 bg-black/35',
  uneasy: 'border-orange-900/55 bg-orange-950/10',
  procedural: 'border-emerald-900/45 bg-emerald-950/10',
  urgent: 'border-red-900/60 bg-red-950/15'
};

function getEquipmentRuntimeState(
  item: PlayerCharacterEquipment,
  equipmentState?: CharacterEquipmentState
) {
  return equipmentState?.equipment[item.id] ?? {
    visible: item.visibleToPlayerDefault,
    used: false
  };
}

function Gauge({ label, value, max }: { label: string; value: number; max: number }) {
  const normalizedValue = Math.max(0, Math.min(max, value));

  return (
    <div className="rounded-md border border-stone-800 bg-black/40 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">{label}</span>
        <span className="text-xs font-bold text-white">{normalizedValue}/{max}</span>
      </div>
      <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))` }}>
        {Array.from({ length: max }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-sm border ${
              index < normalizedValue
                ? label === 'Blessures'
                  ? 'border-red-500 bg-red-500/75'
                  : label === 'Bruit'
                    ? 'border-orange-400 bg-orange-400/75'
                    : 'border-emerald-400 bg-emerald-400/75'
                : 'border-stone-800 bg-stone-950'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function EquipmentList({
  title,
  items,
  equipmentState
}: {
  title: string;
  items: PlayerCharacterEquipment[];
  equipmentState?: CharacterEquipmentState;
}) {
  const visibleItems = items.filter((item) => getEquipmentRuntimeState(item, equipmentState).visible);

  return (
    <section className="rounded-lg border border-stone-800 bg-stone-950/80 p-3">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">{title}</h2>
      {visibleItems.length === 0 && (
        <div className="mt-3 rounded border border-stone-800 bg-black/35 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
          Aucun équipement affiché par le MJ
        </div>
      )}
      {visibleItems.length > 0 && (
        <ul className="mt-3 space-y-2">
          {visibleItems.map((item) => {
            const runtimeState = getEquipmentRuntimeState(item, equipmentState);

            return (
              <li
                key={item.id}
                className={`flex items-start justify-between gap-3 rounded border px-3 py-2 text-xs ${
                  runtimeState.used
                    ? 'border-stone-800 bg-black/30 text-stone-500'
                    : 'border-stone-800 bg-black/45 text-stone-200'
                }`}
              >
                <span className={`min-w-0 break-words leading-relaxed ${runtimeState.used ? 'line-through decoration-orange-400/80 decoration-2' : ''}`}>
                  {item.label}
                </span>
                {runtimeState.used && (
                  <span className="shrink-0 rounded border border-orange-500/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-orange-300">
                    Utilisé
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function PlayerCharacterSheet({
  character,
  equipmentState,
  trackers,
  playerIntelDeliveries = [],
  onChangeCharacter
}: PlayerCharacterSheetProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-3 pb-5 pt-4 text-stone-200 sm:px-4 sm:py-5">
      <header className="overflow-hidden rounded-lg border border-stone-800 bg-stone-950/85 shadow-[0_0_32px_rgba(0,0,0,0.45)]">
        <div className="grid gap-0 sm:grid-cols-[minmax(0,240px)_1fr]">
          <div className="relative min-h-[260px] border-b border-stone-800 bg-black sm:border-b-0 sm:border-r">
            <img
              src={character.portraitSrc}
              alt={`Portrait de ${character.name}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
            <div className="absolute left-3 top-3 rounded border border-emerald-500/45 bg-black/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              UESC ID
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <div className="h-px w-full bg-emerald-400/45" />
              <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-stone-300">
                Dossier personnel
              </div>
            </div>
          </div>

          <div className="min-w-0 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-orange-400">
                  M01 SOL ROUGE
                </div>
                <h1 className="mt-2 break-words text-2xl font-bold uppercase tracking-[0.16em] text-white">
                  {character.name}
                </h1>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                  {character.role}
                </div>
              </div>

              <button
                type="button"
                onClick={onChangeCharacter}
                className="w-fit rounded border border-stone-800 bg-black/40 px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-stone-400 transition hover:border-orange-500/70 hover:text-orange-200"
              >
                Changer de personnage
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STAT_LABELS.map(([key, label]) => (
                <div key={key} className="rounded border border-stone-800 bg-black/45 px-3 py-2">
                  <div className="text-[9px] uppercase tracking-[0.16em] text-stone-500">{label}</div>
                  <div className="mt-1 text-xl font-bold text-emerald-300">{character.stats[key]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {trackers && (
        <section className="mt-3 grid gap-2 sm:grid-cols-3">
          <Gauge label="Stress" value={trackers.stress} max={5} />
          <Gauge label="Bruit" value={trackers.bruit} max={5} />
          <Gauge label="Blessures" value={trackers.blessures} max={3} />
        </section>
      )}

      <section className="mt-3 grid gap-3">
        <div className="rounded-lg border border-stone-800 bg-stone-950/80 p-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">Concept</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-200">{character.concept}</p>
        </div>

        <div className="rounded-lg border border-stone-800 bg-stone-950/80 p-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">Style de jeu</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-200">{character.playstyle}</p>
        </div>

        <div className="rounded-lg border border-emerald-900/70 bg-emerald-950/15 p-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
            Talent // {character.talent.name}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-200">{character.talent.description}</p>
        </div>

        <div className="rounded-lg border border-stone-800 bg-stone-950/80 p-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">Accroche personnelle</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-200">{character.personalHook}</p>
        </div>

        <div className="rounded-lg border border-orange-900/70 bg-orange-950/10 p-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">Question joueur</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-100">{character.playerQuestion}</p>
        </div>

        {playerIntelDeliveries.length > 0 && (
          <section className="rounded-lg border border-emerald-900/70 bg-emerald-950/15 p-3">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
              Infos joueurs reçues
            </h2>
            <div className="mt-3 space-y-2">
              {playerIntelDeliveries.map((intel) => (
                <article key={intel.id} className={`rounded border px-3 py-2 ${PLAYER_INTEL_TONE_CLASSES[intel.tone]}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-100">
                      {intel.title}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.16em] text-stone-500">
                      {new Date(intel.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded border border-emerald-700/55 bg-emerald-950/35 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                      {PLAYER_INTEL_TYPE_LABELS[intel.type]}
                    </span>
                    <span className="min-w-0 truncate text-[9px] uppercase tracking-[0.14em] text-stone-600">
                      {intel.sceneId}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-stone-200">{intel.text}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <EquipmentList
          title="Équipement visible"
          items={character.specializedEquipment}
          equipmentState={equipmentState}
        />

        <PlayerNotesPanel characterId={character.id} />
      </section>
    </main>
  );
}
