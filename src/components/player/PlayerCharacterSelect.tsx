import type { PlayerCharacterId, PlayerCharacterProfile } from '../../types';

type PlayerCharacterSelectProps = {
  characters: PlayerCharacterProfile[];
  onSelect: (id: PlayerCharacterId) => void;
};

const STAT_LABELS = [
  ['physique', 'PHY'],
  ['technique', 'TEC'],
  ['mental', 'MEN'],
  ['presence', 'PRE']
] as const;

export default function PlayerCharacterSelect({ characters, onSelect }: PlayerCharacterSelectProps) {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 text-stone-200">
      <header className="mb-5 border-b border-stone-800 pb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-orange-400">
          UESC // M01 SOL ROUGE
        </div>
        <h1 className="mt-2 text-xl font-bold uppercase tracking-[0.18em] text-white">
          Choix personnage
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-stone-400">
          Sélection locale du terminal joueur. Cette liaison n’envoie aucune commande à la console MJ.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {characters.map((character) => (
          <button
            key={character.id}
            type="button"
            onClick={() => onSelect(character.id)}
            className="group overflow-hidden rounded-lg border border-stone-800 bg-stone-950/80 text-left shadow-[0_0_0_1px_rgba(0,0,0,0.35)] transition hover:border-emerald-500/60 hover:bg-stone-900/80 active:border-orange-400/80"
          >
            <div className="relative h-40 border-b border-stone-800 bg-black">
              <img
                src={character.portraitSrc}
                alt={`Portrait de ${character.name}`}
                className="absolute inset-0 h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 min-w-0">
                <div className="truncate text-sm font-bold uppercase tracking-[0.14em] text-white drop-shadow">
                  {character.name}
                </div>
                <div className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-orange-300 drop-shadow">
                  {character.role}
                </div>
              </div>
              <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.65)]" />
            </div>

            <div className="p-3">
              <p className="line-clamp-3 text-xs leading-relaxed text-stone-400">
                {character.concept}
              </p>

              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {STAT_LABELS.map(([key, label]) => (
                  <div key={key} className="rounded border border-stone-800 bg-black/40 px-1.5 py-1 text-center">
                    <div className="text-[8px] uppercase tracking-[0.12em] text-stone-500">{label}</div>
                    <div className="text-sm font-bold text-emerald-300">{character.stats[key]}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-t border-stone-800 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 group-hover:text-emerald-300">
                Ouvrir fiche
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
