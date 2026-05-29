import { useEffect, useState } from 'react';
import type { ActiveTransmission } from '../types';
import { TRANSMISSION_SPEAKERS } from '../utils/transmissions';
import { getTransmissionProfile } from '../utils/transmissionProfiles';

interface TransmissionOverlayProps {
  transmission: ActiveTransmission | null;
  showPortrait: boolean;
  showText: boolean;
  showAudio: boolean;
  onStop: () => void;
}

const waveformSets = {
  stable: [4, 10, 14, 12, 8, 10, 6, 9, 11],
  glitch: [3, 14, 5, 16, 6, 13, 7, 10, 4],
  spectrogram: [12, 9, 18, 6, 14, 8, 16, 7, 10],
  minimal: [8, 4, 10, 5, 9, 3, 11, 4, 8],
  alert: [18, 6, 16, 5, 14, 7, 17, 4, 13]
} as const;

export default function TransmissionOverlay({ transmission, showPortrait, showText, showAudio, onStop }: TransmissionOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!transmission) {
      setVisible(true);
      return;
    }
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), transmission.durationMs + 100);
    return () => window.clearTimeout(timeout);
  }, [transmission]);

  if (!transmission || !visible) return null;

  const elapsed = Date.now() - transmission.startedAt;
  if (elapsed > transmission.durationMs) return null;

  const profile = getTransmissionProfile(transmission.type);
  const speaker = TRANSMISSION_SPEAKERS[transmission.type];
  const portraitUrl = profile.portraitAsset ?? speaker.portraitPath;
  const waveform = waveformSets[profile.waveformVariant] ?? waveformSets.stable;

  const qualityClass = transmission.signalQuality === 'clair'
    ? 'text-emerald-400 border-emerald-500/30'
    : transmission.signalQuality === 'dégradé'
    ? 'text-amber-400 border-amber-500/30'
    : 'text-red-400 border-red-500/35';

  const accentClass = profile.accentColor === 'cyan'
    ? 'text-cyan-400 bg-cyan-400/70'
    : profile.accentColor === 'red'
    ? 'text-red-400 bg-red-400/70'
    : profile.accentColor === 'amber'
    ? 'text-amber-400 bg-amber-400/70'
    : 'text-orange-400 bg-orange-400/70';

  return (
    <div className="absolute right-[4%] bottom-[10%] z-40 w-[min(480px,88vw)] pointer-events-none">
      <div className={`rounded-2xl overflow-hidden border shadow-2xl backdrop-blur-sm font-mono text-stone-300 ${profile.panelClasses} animate-[fadeIn_180ms_ease-out]`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b ${profile.headerClasses}`}>
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-[0.25em] text-stone-400">UESC TRANSMISSION</div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-[0.16em] text-white truncate max-w-[220px]">{speaker.label}</span>
              <span className="text-[8.5px] uppercase tracking-[0.22em] text-stone-500">{speaker.role}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-[8px] tracking-[0.22em] uppercase ${showAudio ? 'text-emerald-300' : 'text-stone-500'}`}>
              AUDIO {showAudio ? 'ON' : 'OFF'}
            </div>
            <button
              type="button"
              onClick={onStop}
              className="pointer-events-auto text-[8px] uppercase tracking-[0.22em] font-bold px-2 py-1 rounded border border-stone-700 bg-stone-900/90 text-stone-200 hover:bg-red-950 hover:border-red-600"
            >
              STOP
            </button>
            <div className={`text-[9px] tracking-[0.22em] uppercase ${qualityClass.split(' ')[0]}`}>
              SIGNAL {transmission.signalQuality}
            </div>
          </div>
        </div>

        <div className={`grid ${showPortrait ? 'grid-cols-[96px_1fr]' : 'grid-cols-1'} gap-4 p-4`}>
          {showPortrait && (
            <div className="relative h-24 rounded-2xl overflow-hidden border border-stone-800 bg-stone-950/80">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/45" />
              {portraitUrl ? (
                <img src={portraitUrl} alt={speaker.label} className="h-full w-full object-cover" />
              ) : profile.fallbackType === 'symbol' ? (
                <div className="absolute inset-0 flex items-center justify-center text-center text-stone-400 text-[13px] uppercase tracking-[0.24em] px-3">
                  {transmission.type === 'hound' ? 'ALERTE FAUNE' : 'SOURCE INCONNUE'}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-900/70">
                  <div className="h-12 w-12 rounded-full border border-stone-600 bg-stone-800/70" />
                </div>
              )}
              <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[8px] uppercase tracking-[0.22em] text-stone-300">
                {transmission.type === 'hound' ? 'ALERTE' : speaker.sourceType.toUpperCase()}
              </div>
            </div>
          )}

          <div className="flex flex-col justify-between gap-3 min-w-0">
            <div>
              {showText ? (
                <div className="text-[12px] leading-snug text-stone-200">“{transmission.message}”</div>
              ) : (
                <div className="text-[11px] text-stone-400">Texte désactivé</div>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl border border-stone-800 bg-black/50 p-3">
              <div className="flex items-center justify-between text-[8.5px] uppercase tracking-[0.24em] text-stone-500 mb-2">
                <span>Waveform</span>
                <span>{profile.waveformVariant.toUpperCase()}</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {waveform.map((height, index) => (
                  <div
                    key={index}
                    className={`rounded-full ${profile.accentColor === 'cyan' ? 'bg-cyan-400/70' : profile.accentColor === 'red' ? 'bg-red-400/80' : profile.accentColor === 'amber' ? 'bg-amber-400/80' : 'bg-orange-400/80'}`}
                    style={{ width: `${100 / waveform.length}%`, height: `${height}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
