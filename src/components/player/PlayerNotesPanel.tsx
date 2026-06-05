import { useEffect, useState } from 'react';

type PlayerNotesPanelProps = {
  characterId: string;
};

function getStorageKey(characterId: string) {
  return `marathon-player-notes-${characterId}`;
}

function getInitialNotes(characterId: string): string {
  try {
    return localStorage.getItem(getStorageKey(characterId)) ?? '';
  } catch {
    return '';
  }
}

export default function PlayerNotesPanel({ characterId }: PlayerNotesPanelProps) {
  const [notes, setNotes] = useState(() => getInitialNotes(characterId));
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setNotes(getInitialNotes(characterId));
    setLastSavedAt(null);
  }, [characterId]);

  const handleChangeNotes = (nextNotes: string) => {
    setNotes(nextNotes);

    try {
      localStorage.setItem(getStorageKey(characterId), nextNotes);
      setLastSavedAt(Date.now());
    } catch {
      setLastSavedAt(null);
    }
  };

  const handleClearNotes = () => {
    const confirmed = window.confirm('Effacer les notes de ce personnage ?');
    if (!confirmed) return;

    setNotes('');
    try {
      localStorage.removeItem(getStorageKey(characterId));
      setLastSavedAt(Date.now());
    } catch {
      setLastSavedAt(null);
    }
  };

  return (
    <section className="rounded-lg border border-emerald-900/70 bg-stone-950/85 p-3 shadow-[0_0_24px_rgba(0,0,0,0.28)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
            Notes
          </h2>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500">
            Local player log
          </div>
        </div>
        <button
          type="button"
          onClick={handleClearNotes}
          disabled={notes.length === 0}
          className={`rounded border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] transition ${
            notes.length === 0
              ? 'cursor-not-allowed border-stone-800 text-stone-700'
              : 'border-orange-900/70 bg-orange-950/20 text-orange-300 hover:border-orange-500/80 hover:text-orange-200'
          }`}
        >
          Effacer notes
        </button>
      </div>

      <textarea
        value={notes}
        onChange={(event) => handleChangeNotes(event.target.value)}
        placeholder="Notes personnelles, indices, soupçons..."
        spellCheck={false}
        className="mt-3 min-h-[180px] w-full resize-y rounded border border-stone-800 bg-black/55 px-3 py-2 font-mono text-sm leading-relaxed text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/25"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[9px] uppercase tracking-[0.14em] text-stone-600">
        <span>Sauvegarde locale automatique</span>
        <span>
          {notes.length} car.
          {lastSavedAt && (
            <span className="text-emerald-500/80">
              {' '}// {new Date(lastSavedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </span>
      </div>
    </section>
  );
}
