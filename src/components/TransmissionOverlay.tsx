import type { ActiveTransmission } from "../types";
import { TRANSMISSION_SPEAKERS } from "../utils/transmissions";

interface TransmissionOverlayProps {
  transmission: ActiveTransmission | null;
}

export default function TransmissionOverlay({ transmission }: TransmissionOverlayProps) {
  if (!transmission) return null;

  const elapsed = Date.now() - transmission.startedAt;
  if (elapsed > transmission.durationMs) return null;

  const qualityClass = transmission.signalQuality === "clair"
    ? "text-emerald-400 border-emerald-500/30"
    : transmission.signalQuality === "dégradé"
    ? "text-amber-400 border-amber-500/30"
    : "text-red-400 border-red-500/35";
  const speaker = TRANSMISSION_SPEAKERS[transmission.type];
  const accentClass = speaker.accentColor === "emerald"
    ? "text-emerald-400 bg-emerald-400/70"
    : speaker.accentColor === "cyan"
    ? "text-cyan-400 bg-cyan-400/70"
    : speaker.accentColor === "red"
    ? "text-red-400 bg-red-400/70"
    : speaker.accentColor === "amber"
    ? "text-amber-400 bg-amber-400/70"
    : "text-orange-400 bg-orange-400/70";

  const portraitTone = speaker.sourceType === "ai"
    ? "from-emerald-500/18 via-stone-950 to-emerald-950/30"
    : speaker.sourceType === "field"
    ? "from-amber-500/16 via-stone-950 to-red-950/26"
    : speaker.sourceType === "unknown"
    ? "from-red-500/18 via-black to-stone-950"
    : "from-orange-500/16 via-stone-950 to-stone-900";

  return (
    <div className="absolute right-[4%] bottom-[10%] z-40 w-[min(460px,88vw)] pointer-events-none">
      <div className={`bg-black/84 border ${qualityClass} shadow-2xl backdrop-blur-sm font-mono text-stone-300 rounded-md overflow-hidden animate-[fadeIn_180ms_ease-out]`}>
        <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-stone-800/80 bg-stone-950/78">
          <div className="text-[9px] tracking-[0.18em] uppercase text-stone-500">
            UESC TRANSMISSION
          </div>
          <div className={`text-[9px] tracking-widest uppercase ${qualityClass.split(" ")[0]}`}>
            SIGNAL {transmission.signalQuality}
          </div>
        </div>

        <div className="grid grid-cols-[82px_1fr] gap-3 p-3">
          <div className={`relative h-24 rounded border border-stone-800 bg-gradient-to-b ${portraitTone} overflow-hidden`}>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.32)_50%)] bg-[size:100%_4px] opacity-60" />
            {speaker.portraitPath ? (
              <img src={speaker.portraitPath} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale" />
            ) : (
              <>
                <div className="absolute left-1/2 top-[42%] w-8 h-10 -translate-x-1/2 -translate-y-1/2 rounded-t-full bg-stone-500/40 border border-stone-400/10" />
                <div className="absolute left-1/2 bottom-3 w-12 h-8 -translate-x-1/2 rounded-t-2xl bg-stone-600/28 border border-stone-500/10" />
                {speaker.sourceType === "ai" && (
                  <div className="absolute inset-x-3 top-5 h-12 border border-emerald-400/18 rounded-full" />
                )}
                {(speaker.sourceType === "log" || speaker.sourceType === "unknown") && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <span key={index} className={`w-1 ${accentClass.split(" ")[1]}`} style={{ height: `${10 + ((index * 9) % 32)}px`, opacity: 0.35 + index * 0.06 }} />
                    ))}
                  </div>
                )}
              </>
            )}
            <div className={`absolute left-3 right-3 bottom-3 h-1 ${accentClass.split(" ")[1]}`} />
          </div>

          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-widest uppercase text-white truncate">
              {transmission.speaker}
            </div>
            <div className={`mt-0.5 text-[8.5px] tracking-[0.18em] uppercase ${accentClass.split(" ")[0]}`}>
              {transmission.sourceRole}
            </div>
            <div className="mt-1.5 text-[12px] leading-snug text-stone-300">
              “{transmission.message}”
            </div>
            <div className="mt-2 flex items-end gap-1 h-5 opacity-70">
              {Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={index}
                  className={`w-1 ${accentClass.split(" ")[1]}`}
                  style={{
                    height: `${6 + ((index * 7 + transmission.id.length) % 15)}px`,
                    opacity: index % 4 === 0 ? 0.35 : 0.8,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
