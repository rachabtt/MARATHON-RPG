import plateauMap from '../../assets/maps/PLATEAU.png';
import type { TacticalMapToken } from '../../types/tacticalMap';

interface TacticalLargeMapDisplayProps {
  tokens: TacticalMapToken[];
  selectedSquadIds: string[];
}

function getTokenClassName(token: TacticalMapToken, roverOccupied = false): string {
  if (token.type === 'pj') {
    return 'h-5 w-5 rounded-full border-2 border-emerald-100 bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]';
  }

  if (token.type === 'rover') {
    if (token.id === 'rover-uesc' && roverOccupied) {
      return 'h-4 w-7 rounded-[2px] border border-emerald-100 bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]';
    }
    return 'h-4 w-7 rounded-[2px] border border-stone-100 bg-stone-300 shadow-[0_0_14px_rgba(214,211,209,0.72)]';
  }

  if (token.type === 'pnj') {
    return 'h-4 w-4 rounded-full border border-orange-100 bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.72)]';
  }

  return 'h-4 w-4 rotate-45 border border-red-100 bg-red-500 shadow-[0_0_14px_rgba(248,113,113,0.78)]';
}

export default function TacticalLargeMapDisplay({ tokens, selectedSquadIds }: TacticalLargeMapDisplayProps) {
  const selectedSquadSet = new Set(selectedSquadIds);
  const roverOccupied = tokens.some((token) => (
    token.type === 'pj' &&
    token.inVehicle &&
    selectedSquadSet.has(token.id)
  ));
  const visibleTokens = tokens.filter((token) => {
    if (!token.visibleToPlayers) return false;
    if (token.type === 'pj') return selectedSquadSet.has(token.id) && !token.inVehicle;
    return true;
  });

  return (
    <div className="absolute inset-0 z-player-map pointer-events-none flex items-center justify-center bg-black/68 px-[4%] py-[4%] font-mono backdrop-blur-[3px]">
      <div className="relative flex h-full max-h-[88%] w-full max-w-[min(92%,1120px)] flex-col overflow-hidden rounded-md border border-emerald-400/55 bg-black/86 p-3 text-emerald-100 shadow-[0_0_42px_rgba(16,185,129,0.22),0_24px_64px_rgba(0,0,0,0.82),inset_0_0_36px_rgba(16,185,129,0.06)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.07)_50%,rgba(0,0,0,0)_50%)] bg-[size:100%_4px] opacity-25" />
        <div className="pointer-events-none absolute inset-0 border border-emerald-200/10" />

        <header className="relative flex items-center justify-between gap-4 border-b border-emerald-400/25 px-2 pb-2">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-emerald-300">
              UESC TACTICAL MAP // MISSION 01
            </div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.22em] text-stone-500">
              PLAYER BRIEFING DISPLAY // FILTERED SIGNALS ONLY
            </div>
          </div>
          <div className="text-right text-[9px] uppercase tracking-[0.18em] text-stone-500">
            <div>{visibleTokens.length.toString().padStart(2, '0')} VISIBLE TOKENS</div>
            <div className="text-emerald-400/80">SYNC LINK ACTIVE</div>
          </div>
        </header>

        <div className="relative mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-sm border border-emerald-500/25 bg-stone-950/90">
          <div className="relative aspect-square h-full max-h-full max-w-full overflow-hidden">
            <img
              src={plateauMap}
              alt="Carte tactique Mission 01"
              className="h-full w-full object-contain opacity-90 contrast-125 saturate-75"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03),rgba(0,0,0,0.22)_72%)]" />

            {visibleTokens.map((token) => (
              <div
                key={token.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: `${token.x}%`, top: `${token.y}%` }}
                aria-label={token.label}
              >
                <span className={getTokenClassName(token, roverOccupied)} />
                <span className="ml-2 rounded-[2px] border border-black/80 bg-black/82 px-1.5 py-1 text-[9px] font-bold leading-none tracking-[0.12em] text-emerald-100 shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                  {token.shortLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
