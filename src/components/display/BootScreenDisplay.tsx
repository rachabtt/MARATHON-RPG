import { useEffect, useRef, useState } from 'react';
import type { MissionBootPhase } from '../../utils/syncState';

type BootScreenDisplayProps = {
  phase: MissionBootPhase;
  launchedAt?: number | null;
  onReadyForIntro?: () => void;
};

const TERMINAL_LINES = [
  'INITIALIZING DISPLAY NODE...',
  'LOADING COLONIAL TELEMETRY...',
  'SYNCING CONTROL CHANNEL...',
  'WAITING FOR GM AUTHORIZATION...'
];

export default function BootScreenDisplay({
  phase,
  launchedAt,
  onReadyForIntro
}: BootScreenDisplayProps) {
  const [progress, setProgress] = useState(0);
  const readySentRef = useRef(false);

  useEffect(() => {
    if (phase === 'boot_idle') {
      readySentRef.current = false;
      setProgress(0);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'boot_idle') {
      const interval = window.setInterval(() => {
        setProgress((current) => Math.min(52, current + 0.55));
      }, 120);

      return () => window.clearInterval(interval);
    }

    if (phase === 'boot_launching') {
      const interval = window.setInterval(() => {
        setProgress((current) => {
          const nextProgress = Math.min(100, current + 4.8);
          if (nextProgress >= 100 && !readySentRef.current) {
            readySentRef.current = true;
            window.setTimeout(() => onReadyForIntro?.(), 260);
          }
          return nextProgress;
        });
      }, 90);

      return () => window.clearInterval(interval);
    }

    return undefined;
  }, [phase, launchedAt, onReadyForIntro]);

  const roundedProgress = Math.round(progress);
  const isLaunching = phase === 'boot_launching';

  return (
    <main className="min-h-screen overflow-hidden bg-black font-mono text-emerald-100 selection:bg-orange-500/20 selection:text-orange-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%),linear-gradient(90deg,rgba(16,185,129,0.035),rgba(251,146,60,0.025),rgba(0,0,0,0))] bg-[size:100%_4px,8px_100%] opacity-55" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_48%_0%,rgba(16,185,129,0.13),rgba(0,0,0,0)_42%),radial-gradient(circle_at_70%_26%,rgba(234,88,12,0.10),rgba(0,0,0,0)_32%)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-4xl border border-emerald-900/70 bg-stone-950/82 p-5 shadow-[0_0_80px_rgba(0,0,0,0.95)]">
          <header className="border-b border-emerald-900/60 pb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-400">
                  UESC COLONIAL DISPLAY BOOT
                </div>
                <h1 className="mt-3 text-2xl font-bold uppercase tracking-[0.22em] text-white sm:text-4xl">
                  MISSION 01 // SOL ROUGE
                </h1>
                <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                  TAU CETI IV / NEW CARTHAGE OPERATIONS
                </div>
              </div>

              <div className="w-fit border border-stone-800 bg-black/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                DISPLAY NODE // PASSIVE
              </div>
            </div>
          </header>

          <div className="grid gap-5 py-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-3">
              {TERMINAL_LINES.map((line, index) => (
                <div
                  key={line}
                  className="flex items-center gap-3 border border-stone-900 bg-black/45 px-3 py-2 text-xs uppercase tracking-[0.16em] text-stone-300"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <span className="h-2 w-2 bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
                  <span className={index === TERMINAL_LINES.length - 1 && !isLaunching ? 'animate-pulse text-orange-300' : ''}>
                    {line}
                  </span>
                </div>
              ))}
            </div>

            <aside className="border border-stone-800 bg-black/35 p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">System status</div>
              <div className="mt-3 space-y-2 text-[11px] uppercase tracking-[0.16em]">
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Control sync</span>
                  <span className="text-emerald-300">Linked</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Display auth</span>
                  <span className={isLaunching ? 'text-emerald-300' : 'text-orange-300'}>
                    {isLaunching ? 'Granted' : 'Hold'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Mission feed</span>
                  <span className={isLaunching ? 'text-emerald-300' : 'text-stone-400'}>
                    {isLaunching ? 'Arming' : 'Standby'}
                  </span>
                </div>
              </div>
            </aside>
          </div>

          <footer className="border-t border-emerald-900/60 pt-5">
            <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
              <span>{isLaunching ? 'Launch authorization received' : 'Load hold // control auth required'}</span>
              <span className={isLaunching ? 'text-emerald-300' : 'text-orange-300'}>{roundedProgress}%</span>
            </div>
            <div className="mt-3 h-4 border border-stone-800 bg-black p-1">
              <div
                className={`h-full transition-[width] duration-150 ${isLaunching ? 'bg-emerald-400' : 'bg-orange-500'}`}
                style={{ width: `${roundedProgress}%` }}
              />
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
