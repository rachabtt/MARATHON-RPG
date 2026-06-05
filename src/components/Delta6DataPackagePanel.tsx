import {
  getDelta6DataPackageState,
  type Delta6DataStatus,
  type Delta6DataTone
} from '../data/delta6DataPackage';

interface Delta6DataPackagePanelProps {
  status: Delta6DataStatus;
  visible?: boolean;
  compact?: boolean;
}

const toneClasses: Record<Delta6DataTone, { text: string; border: string; fill: string; glow: string }> = {
  amber: {
    text: 'text-orange-300',
    border: 'border-orange-400/55',
    fill: 'bg-orange-400',
    glow: 'shadow-[0_0_28px_rgba(251,146,60,0.18)]'
  },
  green: {
    text: 'text-emerald-300',
    border: 'border-emerald-400/55',
    fill: 'bg-emerald-400',
    glow: 'shadow-[0_0_28px_rgba(52,211,153,0.18)]'
  },
  red: {
    text: 'text-red-400',
    border: 'border-red-400/60',
    fill: 'bg-red-500',
    glow: 'shadow-[0_0_28px_rgba(248,113,113,0.18)]'
  }
};

const waveformPoints: Record<Delta6DataStatus, string> = {
  non_secure: '0,34 8,26 16,40 24,22 32,38 40,30 48,32 56,24 64,42 72,28 80,34 88,30 100,32',
  transfer: '0,38 8,18 16,46 24,14 32,48 40,16 48,46 56,18 64,44 72,22 80,38 88,24 100,30',
  partial: '0,36 10,24 20,42 30,22 40,34 50,30 60,32 70,24 80,44 90,30 100,36',
  corrupted: '0,42 7,16 14,50 21,10 28,52 35,18 42,46 49,22 56,52 63,14 70,48 78,24 86,44 100,20',
  secured: '0,31 10,28 20,33 30,27 40,32 50,28 60,31 70,28 80,33 90,27 100,30',
  lost: '0,39 14,39 28,38 42,39 56,39 70,38 84,39 100,39'
};

export default function Delta6DataPackagePanel({ status, visible = true, compact = false }: Delta6DataPackagePanelProps) {
  if (!visible) return null;

  const state = getDelta6DataPackageState(status);
  const tone = toneClasses[state.tone];
  const wrapperStyle = compact
    ? {
        zIndex: 65,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(92vw, clamp(520px, 42vw, 820px))',
        maxHeight: '38vh'
      }
    : {
        zIndex: 65,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(92vw, 860px)'
      };

  return (
    <div className={`absolute pointer-events-none z-uesc-log font-mono ${tone.glow}`} style={wrapperStyle}>
      <div className={`relative overflow-hidden border ${tone.border} bg-black/68 backdrop-blur-[2px] text-stone-100 ${compact ? 'px-8 py-5 pb-7' : 'px-9 py-6 pb-8'}`}>
        <div className="absolute inset-0 opacity-18 bg-[linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:100%_7px]" />
        <div className={`${compact ? 'h-6 w-6 border-l-2 border-t-2' : 'h-8 w-8 border-l-4 border-t-4'} absolute left-0 top-0 border-stone-300/35`} />
        <div className={`${compact ? 'h-6 w-6 border-r-2 border-t-2' : 'h-8 w-8 border-r-4 border-t-4'} absolute right-0 top-0 border-stone-300/35`} />
        <div className={`${compact ? 'h-6 w-6 border-b-2 border-l-2' : 'h-8 w-8 border-b-4 border-l-4'} absolute bottom-0 left-0 border-stone-300/25`} />
        <div className={`${compact ? 'h-6 w-6 border-b-2 border-r-2' : 'h-8 w-8 border-b-4 border-r-4'} absolute bottom-0 right-0 border-stone-300/25`} />

        <div className={`relative grid ${compact ? 'gap-3' : 'gap-5'}`}>
          <header className={`flex items-start justify-between border-b border-stone-700/60 ${compact ? 'gap-5 pb-3' : 'gap-6 pb-4'}`}>
            <div>
              <div className={`${compact ? 'text-[11px] tracking-[0.18em]' : 'text-[12px] tracking-[0.24em]'} uppercase text-stone-400`}>UESC // DATA RECOVERY</div>
              <div className={`${compact ? 'mt-1.5 text-[clamp(24px,1.75vw,34px)] tracking-[0.055em]' : 'mt-2 text-[clamp(24px,2.15vw,38px)] tracking-[0.08em]'} leading-none uppercase text-stone-100`}>
                {state.title}
              </div>
            </div>
            <div className={`${compact ? 'text-[10px] tracking-[0.14em] leading-snug' : 'text-[11px] tracking-[0.18em] leading-relaxed'} text-right uppercase text-stone-500`}>
              <div>ARCHIVE NODE</div>
              <div>TAU CETI IV</div>
              <div>CHANNEL: D6</div>
            </div>
          </header>

          <section>
            <div
              className={`relative inline-block ${compact ? 'text-[clamp(18px,1.25vw,25px)] tracking-[0.06em]' : 'text-[clamp(18px,1.55vw,28px)] tracking-[0.08em]'} uppercase ${tone.text}`}
            >
              {state.statusLabel}
            </div>
          </section>

          <section className={`grid grid-cols-[1.05fr_0.95fr] ${compact ? 'gap-3' : 'gap-5'}`}>
            <div className={`border border-stone-700/60 bg-stone-950/58 ${compact ? 'p-3' : 'p-4'}`}>
              <div className={`${compact ? 'mb-2 text-[10px] tracking-[0.15em]' : 'mb-3 text-[12px] tracking-[0.2em]'} flex items-center justify-between uppercase text-stone-400`}>
                <span>Package Integrity</span>
                <span className={tone.text}>{state.integrity}%</span>
              </div>
              <div className={`${compact ? 'h-4' : 'h-5'} border border-stone-600/70 bg-black/60 p-1`}>
                <div className={`h-full ${tone.fill}`} style={{ width: `${state.integrity}%` }} />
              </div>
            </div>

            <div className={`border border-stone-700/60 bg-stone-950/58 ${compact ? 'p-3' : 'p-4'}`}>
              <div className={`${compact ? 'mb-1 text-[10px] tracking-[0.15em]' : 'mb-2 text-[12px] tracking-[0.2em]'} uppercase text-stone-400`}>Signal Trace</div>
              <svg viewBox="0 0 100 60" className={`${compact ? 'h-[44px]' : 'h-[72px]'} w-full overflow-visible`} aria-hidden="true">
                <path d="M0 39H100" stroke="rgba(120,132,126,0.55)" strokeWidth="1.2" />
                <polyline points={waveformPoints[status]} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" className={tone.text} />
              </svg>
            </div>
          </section>

          <section className={`grid grid-cols-3 ${compact ? 'gap-2' : 'gap-3'}`}>
            <div className={`border border-stone-700/60 bg-black/45 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
              <div className={`${compact ? 'text-[9px] tracking-[0.14em]' : 'text-[11px] tracking-[0.18em]'} uppercase text-stone-500`}>Integrity</div>
              <div className={`${compact ? 'text-[12px]' : 'mt-1 text-[14px]'} uppercase tracking-[0.12em] ${tone.text}`}>{state.integrity}%</div>
            </div>
            <div className={`border border-stone-700/60 bg-black/45 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
              <div className={`${compact ? 'text-[9px] tracking-[0.14em]' : 'text-[11px] tracking-[0.18em]'} uppercase text-stone-500`}>Recovery</div>
              <div className={`${compact ? 'text-[12px]' : 'mt-1 text-[14px]'} uppercase tracking-[0.12em] text-stone-200`}>{state.meta[0].replace(/^.*?: /, '')}</div>
            </div>
            <div className={`border border-stone-700/60 bg-black/45 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
              <div className={`${compact ? 'text-[9px] tracking-[0.14em]' : 'text-[11px] tracking-[0.18em]'} uppercase text-stone-500`}>Signal Trace</div>
              <div className={`${compact ? 'text-[12px]' : 'mt-1 text-[14px]'} uppercase tracking-[0.12em] ${tone.text}`}>{state.signalTrace}</div>
            </div>
          </section>

          <footer className={`flex flex-wrap ${compact ? 'gap-x-4 gap-y-0.5 text-[9px] tracking-[0.12em]' : 'gap-x-6 gap-y-1 text-[11px] tracking-[0.16em]'} uppercase text-stone-500`}>
            {state.meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </footer>
        </div>
      </div>
    </div>
  );
}
