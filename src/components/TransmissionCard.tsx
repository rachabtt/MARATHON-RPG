import { useState } from "react";
import { getTransmissionProfile, type TransmissionTone } from "../data/transmissionProfiles";
import ArchiveLogIcon from "./icons/ArchiveLogIcon";
import RadioSignalIcon from "./icons/RadioSignalIcon";
import SystemNodeIcon from "./icons/SystemNodeIcon";

export type TransmissionCardVariant = "portrait" | "log" | "alert" | "system" | "full" | "compact";

type TransmissionCardProps = {
  visible: boolean;
  profileId: string;
  message: string;
  variant?: TransmissionCardVariant;
  durationMs?: number;
  showPortrait?: boolean;
  showText?: boolean;
  showAudio?: boolean;
  onStop?: () => void;
};

const toneClasses: Record<TransmissionTone, {
  border: string;
  text: string;
  dim: string;
  bg: string;
  bar: string;
  glow: string;
}> = {
  cyan: {
    border: "border-cyan-400/45",
    text: "text-cyan-200",
    dim: "text-cyan-500/70",
    bg: "bg-cyan-400/70",
    bar: "bg-cyan-300/80",
    glow: "shadow-[0_0_16px_rgba(34,211,238,0.10)]",
  },
  amber: {
    border: "border-amber-400/45",
    text: "text-amber-200",
    dim: "text-amber-500/70",
    bg: "bg-amber-400/75",
    bar: "bg-amber-300/80",
    glow: "shadow-[0_0_16px_rgba(245,158,11,0.10)]",
  },
  green: {
    border: "border-emerald-400/40",
    text: "text-emerald-200",
    dim: "text-emerald-500/70",
    bg: "bg-emerald-400/70",
    bar: "bg-emerald-300/80",
    glow: "shadow-[0_0_16px_rgba(52,211,153,0.10)]",
  },
  red: {
    border: "border-red-400/50",
    text: "text-red-200",
    dim: "text-red-500/75",
    bg: "bg-red-400/80",
    bar: "bg-red-300/85",
    glow: "shadow-[0_0_18px_rgba(239,68,68,0.14)]",
  },
  white: {
    border: "border-stone-300/40",
    text: "text-stone-100",
    dim: "text-stone-400",
    bg: "bg-stone-200/75",
    bar: "bg-stone-200/80",
    glow: "shadow-[0_0_24px_rgba(214,211,209,0.12)]",
  },
  violet: {
    border: "border-violet-400/45",
    text: "text-violet-200",
    dim: "text-violet-500/70",
    bg: "bg-violet-400/70",
    bar: "bg-violet-300/80",
    glow: "shadow-[0_0_26px_rgba(167,139,250,0.14)]",
  },
  gray: {
    border: "border-stone-500/40",
    text: "text-stone-200",
    dim: "text-stone-500",
    bg: "bg-stone-400/70",
    bar: "bg-stone-300/75",
    glow: "shadow-[0_0_24px_rgba(120,113,108,0.12)]",
  },
};

const waveformByVariant: Record<TransmissionCardVariant, number[]> = {
  portrait: [6, 14, 18, 11, 20, 15, 10, 17, 9, 16, 12, 19],
  system: [5, 12, 8, 15, 10, 13, 7, 14, 9, 16],
  alert: [24, 8, 28, 10, 22, 7, 30, 9],
  log: [6, 20, 9, 28, 8, 18, 31, 10, 24, 7, 16, 26, 9, 18],
  full: [6, 14, 18, 11, 20, 15, 10, 17, 9, 16, 12, 19],
  compact: [5, 12, 8, 15, 10, 13, 7, 14, 9, 16],
};

function getVariantClasses(variant: TransmissionCardVariant) {
  const normalizedVariant = variant === "full" ? "portrait" : variant === "compact" ? "system" : variant;

  if (normalizedVariant === "portrait") {
    return {
      frame: "left-4 bottom-8 sm:left-[clamp(18px,2vw,36px)] sm:bottom-[clamp(28px,6vh,72px)] w-[min(90vw,680px)] lg:w-[clamp(520px,34vw,720px)]",
      panel: "grid min-h-[300px] max-h-[42vh] grid-cols-[38%_1fr]",
      source: "min-h-[300px] overflow-visible",
      content: "min-h-0 gap-2 p-4 pl-4",
      name: "text-[clamp(16px,1.35vw,22px)]",
      waveform: "h-5",
    };
  }
  if (normalizedVariant === "alert") {
    return {
      frame: "left-4 bottom-8 sm:left-[clamp(18px,2vw,36px)] sm:bottom-[clamp(28px,6vh,72px)] w-[min(88vw,560px)] lg:w-[clamp(420px,28vw,580px)]",
      panel: "grid min-h-[148px] max-h-[30vh] grid-cols-[88px_1fr]",
      source: "min-h-[148px]",
      content: "min-h-0 gap-1.5 p-3",
      name: "text-sm lg:text-base",
      waveform: "h-4",
    };
  }
  if (normalizedVariant === "log") {
    return {
      frame: "left-4 bottom-8 sm:left-[clamp(18px,2vw,36px)] sm:bottom-[clamp(28px,6vh,72px)] w-[min(88vw,580px)] lg:w-[clamp(430px,29vw,600px)]",
      panel: "grid min-h-[160px] max-h-[32vh] grid-cols-[92px_1fr]",
      source: "min-h-[160px]",
      content: "min-h-0 gap-1.5 p-3",
      name: "text-sm lg:text-base",
      waveform: "h-4",
    };
  }
  return {
    frame: "left-4 bottom-8 sm:left-[clamp(18px,2vw,36px)] sm:bottom-[clamp(28px,6vh,72px)] w-[min(88vw,560px)] lg:w-[clamp(420px,28vw,580px)]",
    panel: "grid min-h-[150px] max-h-[30vh] grid-cols-[88px_1fr]",
    source: "min-h-[150px]",
    content: "min-h-0 gap-1.5 p-3",
    name: "text-sm lg:text-base",
    waveform: "h-4",
  };
}

function getMessageClass(variant: TransmissionCardVariant) {
  if (variant === "full" || variant === "portrait") return "transmission-message-text transmission-message-text--full";
  if (variant === "alert") return "transmission-message-text transmission-message-text--alert";
  return "transmission-message-text transmission-message-text--compact";
}

function getSourceIcon(profileId: string, kind: string, className: string) {
  if (profileId === "radio_signal") return <RadioSignalIcon className={className} />;
  if (profileId === "archive_log" || profileId === "delta6_log" || kind === "log") return <ArchiveLogIcon className={className} />;
  return <SystemNodeIcon className={className} />;
}

export default function TransmissionCard({
  visible,
  profileId,
  message,
  variant = "portrait",
  showPortrait = true,
  showText = true,
  showAudio = true,
  onStop,
}: TransmissionCardProps) {
  const [portraitFailed, setPortraitFailed] = useState(false);
  const profile = getTransmissionProfile(profileId);
  const tone = toneClasses[profile.accent] ?? toneClasses.gray;
  const classes = getVariantClasses(variant);
  const normalizedVariant = variant === "full" ? "portrait" : variant === "compact" ? "system" : variant;
  const messageClass = getMessageClass(variant);
  const waveform = waveformByVariant[normalizedVariant] ?? waveformByVariant.system;
  const maxWaveformBarHeight = normalizedVariant === "portrait" ? 18 : 13;
  const shouldRenderPortrait = profile.showPortrait && showPortrait && profile.portraitSrc && !portraitFailed;
  const layerClass = normalizedVariant === "portrait" || normalizedVariant === "alert" ? "z-npc-card" : "z-uesc-log";

  if (!visible) return null;

  return (
    <div className={`pointer-events-none absolute ${layerClass} ${classes.frame}`}>
      <div className={`relative overflow-visible border ${tone.border} ${tone.glow} bg-[#020605]/82 font-mono text-stone-200 backdrop-blur-[1.5px] animate-[fadeIn_220ms_ease-out]`}>
        <div className="absolute inset-0 overflow-hidden opacity-[0.10] bg-[linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:100%_6px,34px_100%]" />
        <div className={`absolute left-0 top-0 h-px w-16 ${tone.bg}`} />
        <div className={`absolute bottom-0 right-0 h-px w-20 ${tone.bg}`} />
        <div className={`relative ${classes.panel}`}>
          <div className={`relative border-r ${tone.border} bg-black/30 ${classes.source}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_72%,rgba(255,255,255,0.08),transparent_46%)]" />
            {shouldRenderPortrait ? (
              <img
                src={profile.portraitSrc}
                alt={profile.speakerName}
                onError={() => setPortraitFailed(true)}
                className="absolute inset-0 h-full w-full object-contain object-center p-2"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center">
                <div className={`flex h-14 w-14 items-center justify-center ${tone.text}`}>
                  {getSourceIcon(profile.id, profile.kind, "h-14 w-14")}
                </div>
                <div className={`text-[8px] uppercase tracking-[0.22em] ${tone.dim}`}>{profile.kind}</div>
              </div>
            )}
            <div className={`absolute left-3 top-3 h-1.5 w-1.5 ${tone.bg}`} />
          </div>

          <div className={`relative flex min-w-0 flex-col justify-between ${classes.content}`}>
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-700/35 pb-2">
              <div className="min-w-0">
                <div className={`text-[9px] uppercase tracking-[0.22em] ${tone.dim}`}>UESC // {profile.transmissionLabel} // {profile.signalLabel}</div>
                <div className={`mt-1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap ${classes.name} font-bold uppercase leading-tight tracking-[0.12em] text-stone-100`}>
                  {profile.speakerName}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-stone-500">{profile.speakerRole}</div>
              </div>
              <div className="hidden shrink-0 text-right text-[8px] uppercase tracking-[0.18em] text-stone-500 sm:block">
                <div className={tone.text}>{profile.channelLabel}</div>
                <div className={`mt-1 ${showAudio ? "text-emerald-400" : "text-stone-600"}`}>AUDIO {showAudio ? "ON" : "OFF"}</div>
              </div>
            </header>

            <main className="min-h-0 flex-1 overflow-visible">
              <div className={`${messageClass} font-semibold tracking-[0.02em] ${tone.text}`}>
                {showText ? message : "TEXTE MASQUÉ"}
              </div>
            </main>

            <footer className="grid shrink-0 grid-cols-[1fr_auto] items-end gap-3">
              <div className={`overflow-hidden border ${tone.border} bg-black/35 p-1.5`}>
                <div className="mb-1 flex items-center justify-between text-[8px] uppercase tracking-[0.20em] text-stone-500">
                  <span>Signal trace</span>
                  <span>{profile.kind}</span>
                </div>
                <div className={`flex items-end gap-0.5 ${classes.waveform}`}>
                  {waveform.map((height, index) => (
                    <div
                      key={`${profile.id}-${variant}-${index}`}
                      className={`${tone.bar}`}
                      style={{ width: `${100 / waveform.length}%`, height: `${Math.min(height, maxWaveformBarHeight)}px`, opacity: 0.55 + (index % 3) * 0.14 }}
                    />
                  ))}
                </div>
              </div>
              {onStop && (
                <button
                  type="button"
                  onClick={onStop}
                  className="pointer-events-auto border border-stone-700 bg-black/70 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-300 hover:border-red-500 hover:text-red-200"
                >
                  Stop
                </button>
              )}
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
