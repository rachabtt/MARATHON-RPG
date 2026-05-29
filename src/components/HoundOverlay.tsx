import type { LocationId } from "../utils/locations";
import type { HoundVariant } from "../types";

interface HoundOverlayProps {
  effect?: {
    active: boolean;
    variant: HoundVariant;
    startedAt: number;
    durationMs: number;
    opacity?: number;
    blurPx?: number;
    scale?: number;
  };
  locationId: LocationId;
}

export default function HoundOverlay({ effect, locationId }: HoundOverlayProps) {
  if (!effect?.active) return null;

  const elapsed = Date.now() - effect.startedAt;
  if (elapsed > effect.durationMs) return null;

  const fade = 1 - Math.min(1, elapsed / effect.durationMs);
  const baseOpacity = effect.opacity ?? 0.5;
  const blurPx = effect.blurPx ?? 10;
  const scale = effect.scale ?? 0.8;

  const variantClasses = {
    distant_silhouette: "left-[6%] bottom-[18%] w-[62%] h-28",
    low_shadow: "left-[14%] bottom-[12%] w-[48%] h-32",
    equipment_reflection: "right-[8%] bottom-[20%] w-[38%] h-28"
  };

  const shape = variantClasses[effect.variant] || variantClasses.distant_silhouette;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <div
        className={`absolute ${shape} rounded-3xl bg-black/0`} 
        style={{ opacity: baseOpacity * fade, filter: `blur(${blurPx}px)`, transform: `scale(${scale})` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),rgba(0,0,0,0.06))] opacity-80" />
        <div className="absolute bottom-0 left-1/2 h-[60%] w-3 -translate-x-1/2 rounded-full bg-gradient-to-t from-black/95 to-transparent opacity-90" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.1),rgba(255,255,255,0.03),rgba(0,0,0,0.1))] bg-[size:100%_18px] opacity-40" />
      </div>

      {locationId === 'new_carthage' ? (
        <div className="absolute left-5 top-6 rounded border border-red-500/25 bg-black/75 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-red-300 font-bold shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          CONTACT NON CONFIRMÉ
        </div>
      ) : (
        <div className="absolute right-5 top-5 rounded border border-orange-500/20 bg-black/65 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-orange-300 font-semibold backdrop-blur-sm">
          HOUND SIGNAUX // {locationId === 'red_plains' ? 'DISTANT' : locationId === 'black_arches' ? 'OMBRE' : 'PROCHE'}
        </div>
      )}
    </div>
  );
}
