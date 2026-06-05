import { useState, useRef, useEffect } from 'react';
import type { TacticalMapToken } from '../../types/tacticalMap';

interface Props {
  tokens?: TacticalMapToken[];
  mapImageSrc: string;
  onUpdateTokenPosition?: (tokenId: string, x: number, y: number) => void;
}

export default function TacticalMapPanel({ tokens = [], mapImageSrc, onUpdateTokenPosition }: Props) {
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const roverOccupied = tokens.some((token) => token.type === 'pj' && token.inVehicle);
  const mapTokens = tokens.filter((token) => !(token.type === 'pj' && token.inVehicle));

  useEffect(() => {
    if (!draggingTokenId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!mapContainerRef.current) return;

      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Clamp to map bounds
      const clampedX = Math.max(0, Math.min(x, rect.width));
      const clampedY = Math.max(0, Math.min(y, rect.height));

      // Convert to percentage
      const percentX = (clampedX / rect.width) * 100;
      const percentY = (clampedY / rect.height) * 100;

      onUpdateTokenPosition?.(draggingTokenId, percentX, percentY);
    };

    const handleMouseUp = () => {
      setDraggingTokenId(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingTokenId, onUpdateTokenPosition]);

  const handleTokenMouseDown = (tokenId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingTokenId(tokenId);
  };
  return (
    <aside className="rounded-b-xl border-t border-stone-800/80 bg-stone-950/92 text-stone-100 flex flex-col h-full min-h-0">
      <div className="border-b border-stone-800/90 bg-stone-900/70 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-orange-400">
              CARTE TACTIQUE // MISSION 01
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-stone-400">
              Plateau tactique simple — image d’état
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
            DRAG & DROP ENABLED
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4 flex items-center justify-center">
        <div className="rounded-2xl border border-stone-800/90 bg-black/70 p-3 shadow-inner shadow-black/20 w-full h-full flex items-center justify-center max-h-full max-w-full">
          {!mapImageSrc ? (
            <div className="rounded-xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-center font-mono text-xs uppercase tracking-wider text-stone-500">
              Aucune carte disponible
            </div>
          ) : (
            <>
              {/* Wrapper carré: limitée par la hauteur dispo ET la largeur dispo */}
              <div 
                ref={mapContainerRef}
                className="relative overflow-hidden rounded-xl border border-stone-700/80 bg-stone-950/80 aspect-square h-full max-w-full max-h-full flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <img
                  src={mapImageSrc}
                  alt="Carte tactique"
                  className="w-full h-full object-contain z-10 pointer-events-none"
                />

            {/* Tokens overlay (positioned by percent) */}
            {mapTokens.filter(t => t.visibleInControl).map((t) => (
              <div
                key={t.id}
                title={`${t.label} (${t.type})`}
                style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
                className={`absolute flex items-center justify-center select-none z-20 ${draggingTokenId === t.id ? 'opacity-75' : 'opacity-100'} transition-opacity cursor-grab active:cursor-grabbing`}
                onMouseDown={(e) => handleTokenMouseDown(t.id, e)}
              >
                {t.type === 'pj' && (
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500 text-[10px] font-bold text-black border-2 border-white/10 shadow-lg">{t.shortLabel}</div>
                )}
                {t.type === 'pnj' && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-200 text-[9px] font-bold text-stone-900 border border-stone-700 shadow-lg">{t.shortLabel}</div>
                )}
                {t.type === 'hound' && (
                  <div className="w-8 h-8 transform rotate-45 bg-orange-500 text-[9px] font-bold text-black flex items-center justify-center border-2 border-black/30 shadow-lg">{t.shortLabel}</div>
                )}
                {t.type === 'rover' && (
                  <div className={`flex items-center justify-center w-10 h-6 text-[9px] font-bold rounded-sm border shadow-lg ${
                    t.id === 'rover-uesc' && roverOccupied
                      ? 'border-emerald-100/80 bg-emerald-400 text-black shadow-[0_0_16px_rgba(52,211,153,0.75)]'
                      : 'border-stone-700 bg-stone-300 text-stone-900'
                  }`}>{t.shortLabel}</div>
                )}
              </div>
            ))}

            {/* Debug badge: visible tokens count (hidden on prod) */}
            {tokens.length > 0 && (
              <div className="absolute left-2 top-2 z-30 bg-black/60 text-stone-200 text-[11px] px-2 py-1 rounded">
                Tokens: {mapTokens.filter(t => t.visibleInControl).length}
              </div>
            )}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
