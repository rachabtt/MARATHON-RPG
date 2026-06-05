export default function HollowFinalTerminal() {
  return (
    <div className="absolute inset-0 z-final-overlay bg-[#020403] overflow-hidden font-mono text-stone-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,rgba(34,197,94,0.08),transparent_36%),linear-gradient(180deg,rgba(2,6,5,0.35),rgba(0,0,0,0.96))]" />
      <div className="absolute inset-0 opacity-[0.13] bg-[linear-gradient(rgba(255,255,255,0.07)_50%,rgba(0,0,0,0.18)_50%)] bg-[size:100%_4px]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent,rgba(34,197,94,0.12),transparent)] animate-pulse" />

      <header className="absolute top-[7%] left-[6%] right-[6%] flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-stone-600">
        <span>TERMINAL DE MAINTENANCE UESC</span>
        <span className="text-orange-700/80">ÉVÉNEMENT NON ENREGISTRÉ</span>
      </header>

      <main className="absolute inset-x-[8%] top-[39%] flex flex-col items-center text-center">
        <div className="mb-5 h-px w-[min(520px,68vw)] bg-emerald-500/20" />
        <div className="text-[clamp(28px,4.6vw,68px)] leading-none tracking-[0.2em] font-bold text-emerald-100 drop-shadow-[0_0_18px_rgba(34,197,94,0.28)]">
          SIGNAL HOLLOW DÉTECTÉ
        </div>
        <div className="mt-9 text-[clamp(16px,2.1vw,32px)] leading-tight tracking-[0.28em] text-stone-400">
          SOURCE:
        </div>
        <div className="mt-2 text-[clamp(24px,3.4vw,50px)] leading-none tracking-[0.24em] font-semibold text-stone-100">
          SOUS LA SURFACE
        </div>
        <div className="mt-6 h-px w-[min(420px,58vw)] bg-orange-500/15" />
      </main>

      <footer className="absolute bottom-[8%] left-[6%] right-[6%] flex items-end justify-between gap-4 text-[9px] uppercase tracking-[0.28em] text-stone-700">
        <span>MISSION 01 // SOL ROUGE</span>
        <span className="text-stone-600">ERREUR D'HORODATAGE</span>
      </footer>
    </div>
  );
}
