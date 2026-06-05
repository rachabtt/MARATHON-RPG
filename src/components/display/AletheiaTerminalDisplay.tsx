import { useEffect, useState } from 'react';
import aletheiaAvatar from '../../assets/interventions/aletheia.png';
import type { AletheiaTerminalState } from '../../utils/syncState';

type AletheiaTerminalDisplayProps = {
  terminal: AletheiaTerminalState;
};

const ALETHEIA_AVATAR_SRC = aletheiaAvatar;
const ALETHEIA_AUTO_HIDE_MS = 30_000;

export default function AletheiaTerminalDisplay({ terminal }: AletheiaTerminalDisplayProps) {
  const [now, setNow] = useState(() => Date.now());
  const [animatedMessageId, setAnimatedMessageId] = useState<string | null>(null);
  const [visibleCharCount, setVisibleCharCount] = useState(0);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const visibleMessages = terminal.messages.slice(-5);
  const latestMessage = visibleMessages[visibleMessages.length - 1];
  const isGlitching = Boolean(terminal.glitchUntil && now < terminal.glitchUntil);

  useEffect(() => {
    const shouldShow = terminal.active || terminal.messages.length > 0 || terminal.noSignal;
    if (!shouldShow) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timeout = window.setTimeout(() => setIsVisible(false), ALETHEIA_AUTO_HIDE_MS);
    return () => window.clearTimeout(timeout);
  }, [latestMessage?.id, terminal.active, terminal.noSignal, terminal.glitchUntil]);

  useEffect(() => {
    if (!terminal.glitchUntil) return;
    const interval = window.setInterval(() => setNow(Date.now()), 120);
    return () => window.clearInterval(interval);
  }, [terminal.glitchUntil]);

  useEffect(() => {
    if (!latestMessage || terminal.noSignal) {
      setAnimatedMessageId(null);
      setVisibleCharCount(0);
      return;
    }

    setAnimatedMessageId(latestMessage.id);
    setVisibleCharCount(0);

    const interval = window.setInterval(() => {
      setVisibleCharCount((count) => {
        if (count >= latestMessage.text.length) {
          window.clearInterval(interval);
          return count;
        }
        return count + 1;
      });
    }, 22);

    return () => window.clearInterval(interval);
  }, [latestMessage?.id, terminal.noSignal]);

  if ((!terminal.active && terminal.messages.length === 0 && !terminal.noSignal) || !isVisible) {
    return null;
  }

  const avatarPanel = (
    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded border border-[#66ff66]/35 bg-black/70 shadow-[0_0_18px_rgba(102,255,102,0.22)] sm:h-32 sm:w-24 md:h-36 md:w-28">
      {!avatarLoadFailed ? (
        <img
          src={ALETHEIA_AVATAR_SRC}
          alt="Aletheia"
          onError={() => setAvatarLoadFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        // Fallback if the bundled Aletheia portrait fails to load.
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle,rgba(102,255,102,0.20),rgba(2,8,5,0.92)_62%)] text-[10px] font-bold tracking-[0.24em] text-[#66ff66]">
          AI
        </div>
      )}
      <div className="absolute inset-x-2 bottom-1 h-px bg-[#66ff66]/55 shadow-[0_0_8px_rgba(102,255,102,0.75)]" />
    </div>
  );

  return (
    <aside
      className={`pointer-events-none absolute bottom-12 right-8 z-aletheia-terminal w-[min(94vw,840px)] md:w-[clamp(580px,44vw,840px)] max-h-[44vh] overflow-hidden rounded border border-[#66ff66]/35 bg-[rgba(2,8,5,0.86)] px-8 py-4 pb-6 font-mono text-[#66ff66] shadow-[0_0_42px_rgba(0,0,0,0.72),inset_0_0_28px_rgba(102,255,102,0.045)] backdrop-blur-[2px] transition-opacity duration-300 ${
        isGlitching ? 'aletheia-terminal-glitch border-[rgba(255,160,64,0.55)]' : ''
      }`}
    >
      <div className="absolute inset-0 opacity-[0.11] bg-[linear-gradient(rgba(102,255,102,0)_50%,rgba(102,255,102,0.45)_50%)] bg-[size:100%_5px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(102,255,102,0.10),transparent_52%)] opacity-60" />
      <div className="relative flex items-stretch gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="border-b border-[#66ff66]/25 pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] md:text-sm uppercase tracking-[0.18em] text-[#b8d8b0]">
                    ALETHEIA // COLONIAL ASSISTANCE NODE
                  </div>
                  <div className="mt-1 text-[10px] md:text-xs uppercase tracking-[0.22em] text-[rgba(255,160,64,0.72)]">
                    NEW CARTHAGE OPERATIONS
                  </div>
                </div>
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${terminal.noSignal ? 'bg-red-500' : 'bg-[#66ff66]'}`} />
              </div>
          </div>

          {terminal.noSignal ? (
            <div className="py-5">
              <div className="text-xl md:text-2xl uppercase tracking-[0.18em] text-[#ff8f6b]">NO SIGNAL</div>
              <div className="mt-2 text-xs md:text-sm uppercase tracking-[0.2em] text-[#b8d8b0]">
                COMMUNICATION DEGRADED
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {isGlitching && (
                <div className="rounded border border-[rgba(255,160,64,0.45)] bg-[rgba(86,34,8,0.28)] px-2.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[#ffb36b] shadow-[0_0_14px_rgba(255,128,64,0.12)]">
                  SIGNAL GLITCH // INTERFERENCE ACTIVE
                </div>
              )}
              {visibleMessages.length === 0 ? (
                <div className="py-4 text-sm uppercase tracking-[0.18em] text-stone-400">
                  ALETHEIA NODE AVAILABLE
                </div>
              ) : (
                visibleMessages.map((message, index) => {
                  const latest = index === visibleMessages.length - 1;
                  const shouldAnimate = latest && animatedMessageId === message.id;
                  const text = shouldAnimate
                    ? message.text.slice(0, Math.min(visibleCharCount, message.text.length))
                    : message.text;
                  const animationComplete = shouldAnimate && visibleCharCount >= message.text.length;

                  return (
                    <div
                      key={message.id}
                      className={`${latest ? 'text-[#7CFF6B] drop-shadow-[0_0_6px_rgba(102,255,102,0.35)]' : 'text-[#66ff66]/68'} text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap`}
                    >
                      <span className="mr-2 text-[rgba(255,160,64,0.62)]">{latest ? '>' : '-'}</span>
                      {text}
                      {latest && (
                        <span className={`ml-1 inline-block h-4 w-2 align-[-2px] bg-[#66ff66] ${animationComplete ? 'opacity-45' : 'animate-pulse'}`} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#66ff66]/70">
            <span>UESC-LINK ACTIVE</span>
            <span className="inline-block h-3 w-2 animate-pulse bg-[#66ff66]/80" />
          </div>
        </div>

        {avatarPanel}
      </div>
    </aside>
  );
}
