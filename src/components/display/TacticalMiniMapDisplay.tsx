import plateauMap from '../../assets/maps/PLATEAU.png';
import type { MissionTelemetryState } from '../../utils/syncState';
import type { TacticalMapToken } from '../../types/tacticalMap';

interface TacticalMiniMapDisplayProps {
  tokens: TacticalMapToken[];
  selectedSquadIds: string[];
  signalLabel: string;
  visibilityLabel: string;
  emLabel: string;
  emActive?: boolean;
  getTelemetryTextClass: (label: MissionTelemetryState[keyof MissionTelemetryState] | string) => string;
}

function getTokenClassName(token: TacticalMapToken, roverOccupied = false): string {
  if (token.type === 'pj') {
    return 'h-3 w-3 rounded-full border border-emerald-100/90 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]';
  }

  if (token.type === 'rover') {
    if (token.id === 'rover-uesc' && roverOccupied) {
      return 'h-2.5 w-4 rounded-[2px] border border-emerald-100/90 bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.85)]';
    }
    return 'h-2.5 w-4 rounded-[2px] border border-stone-100/80 bg-stone-300 shadow-[0_0_7px_rgba(214,211,209,0.65)]';
  }

  if (token.type === 'pnj') {
    return 'h-2.5 w-2.5 rounded-full border border-orange-100/70 bg-orange-400 shadow-[0_0_7px_rgba(251,146,60,0.65)]';
  }

  return 'h-2.5 w-2.5 rotate-45 border border-red-100/70 bg-red-500 shadow-[0_0_7px_rgba(248,113,113,0.7)]';
}

export default function TacticalMiniMapDisplay({
  tokens,
  selectedSquadIds,
  signalLabel,
  visibilityLabel,
  emLabel,
  emActive = false,
  getTelemetryTextClass
}: TacticalMiniMapDisplayProps) {
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
    <div className="display-tactical-minimap absolute pointer-events-none z-hud w-[clamp(170px,17vw,245px)] text-[8px] 2xl:text-[9px] font-mono uppercase tracking-[0.16em] text-stone-400">
      <div className="relative overflow-hidden rounded-md border border-emerald-500/50 bg-black/72 p-2 shadow-[0_0_20px_rgba(16,185,129,0.12),0_12px_28px_rgba(0,0,0,0.65)] backdrop-blur-[1px]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.08)_50%,rgba(0,0,0,0)_50%)] bg-[size:100%_4px] opacity-25" />
        <div className="relative mb-1.5 flex items-center justify-between gap-2 text-emerald-300">
          <span className="font-bold">UESC TAC-MAP</span>
          <span className="text-stone-500">{visibleTokens.length.toString().padStart(2, '0')} SIG</span>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-sm border border-emerald-500/25 bg-stone-950/90">
          <img
            src={plateauMap}
            alt="Carte tactique Mission 01"
            className="h-full w-full object-contain opacity-80 contrast-125 saturate-75"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),rgba(0,0,0,0.20)_70%)]" />

          {visibleTokens.map((token) => (
            <div
              key={token.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: `${token.x}%`, top: `${token.y}%` }}
              aria-label={token.label}
            >
              <span className={getTokenClassName(token, roverOccupied)} />
              {token.type === 'pj' && (
                <span className="ml-1 rounded-[2px] border border-black/70 bg-black/70 px-1 py-0.5 text-[7px] font-bold leading-none text-emerald-100">
                  {token.shortLabel}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="relative mt-2 space-y-1 border-t border-emerald-500/20 pt-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-500">SIGNAL RADIO :</span>
            <span className={`font-semibold ${getTelemetryTextClass(signalLabel)}`}>{signalLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-500">VISIBILITÉ :</span>
            <span className={`font-semibold ${getTelemetryTextClass(visibilityLabel)}`}>{visibilityLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-500">ACTIVITÉ EM :</span>
            <span className={`font-bold ${getTelemetryTextClass(emLabel)} ${emActive ? 'animate-pulse' : ''}`}>{emLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
