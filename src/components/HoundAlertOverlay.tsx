import { useEffect, useState } from "react";
import houndsPortrait from "../assets/interventions/hounds.png";
import type { HoundAlertState } from "../utils/syncState";
import TransmissionCard from "./TransmissionCard";

interface HoundAlertOverlayProps {
  alert?: HoundAlertState | null;
  showCard?: boolean;
}

export default function HoundAlertOverlay({ alert, showCard = true }: HoundAlertOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!alert) {
      setVisible(false);
      return;
    }

    const elapsed = Date.now() - alert.createdAt;
    const remaining = alert.durationMs - elapsed;
    if (remaining <= 0) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), remaining);
    return () => window.clearTimeout(timeout);
  }, [alert?.id, alert?.createdAt, alert?.durationMs]);

  if (!alert || !visible) return null;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-npc-card flex items-center justify-center">
        <div className="relative w-[min(82vw,760px)] overflow-hidden border border-red-400/55 bg-[#050202]/86 font-mono text-red-100 shadow-[0_0_38px_rgba(127,29,29,0.24)] backdrop-blur-[1.5px] animate-[fadeIn_160ms_ease-out]">
          <div className="absolute inset-0 opacity-[0.13] bg-[linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:100%_6px,34px_100%]" />
          <div className="absolute left-0 top-0 h-px w-24 bg-red-300/80" />
          <div className="absolute bottom-0 right-0 h-px w-28 bg-red-300/80" />
          <div className="relative grid min-h-[220px] grid-cols-[minmax(210px,38%)_1fr] items-center uppercase">
            <div className="relative h-full min-h-[220px] overflow-hidden border-r border-red-400/35 bg-black/35">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_58%,rgba(239,68,68,0.18),transparent_52%)]" />
              <img
                src={houndsPortrait}
                alt="Hound telemetry profile"
                className="absolute inset-0 h-full w-full object-contain object-center p-3 opacity-90 grayscale contrast-125"
              />
              <div className="absolute bottom-3 left-3 border border-red-400/40 bg-black/65 px-2 py-1 text-[8px] font-bold tracking-[0.22em] text-red-300">
                BIOMETRIC PROFILE // UNCONFIRMED
              </div>
            </div>
            <div className="px-8 py-6 text-left">
              <div className="text-[10px] tracking-[0.28em] text-red-500/80">UESC // THREAT ALERT // SENSOR NET</div>
              <div className="mt-3 text-3xl font-bold tracking-[0.18em] text-red-100">CONTACT HOUND</div>
              <div className="mt-3 text-sm font-semibold tracking-[0.16em] text-red-300">{alert.message}</div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-[9px] tracking-[0.18em] text-stone-400">
                <span className="border border-red-950/70 bg-black/35 px-2 py-1">VISUAL: PARTIAL</span>
                <span className="border border-red-950/70 bg-black/35 px-2 py-1">CHANNEL: SENSOR NET</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCard && (
        <TransmissionCard
          visible
          profileId="hounds"
          message={alert.message}
          variant="alert"
          durationMs={alert.durationMs}
          showPortrait
          showText
          showAudio={false}
        />
      )}
    </>
  );
}
