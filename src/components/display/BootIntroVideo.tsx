import { useEffect, useRef, useState } from 'react';
import bootVideo from '../../assets/boot/BOOT.mp4';

type BootIntroVideoProps = {
  onIntroStarted: () => void;
  onIntroCompleted: () => void;
};

export default function BootIntroVideo({
  onIntroStarted,
  onIntroCompleted
}: BootIntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const completeIntro = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onIntroCompleted();
  };

  const requestPlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = false;
      await video.play();
      setAudioBlocked(false);
    } catch (error) {
      console.warn('BOOT intro autoplay was blocked by the browser', error);
      setAudioBlocked(true);
    }
  };

  useEffect(() => {
    void requestPlayback();

    return () => {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  const handleError = () => {
    console.warn('BOOT intro video failed to load; continuing to mission display.');
    fallbackTimerRef.current = window.setTimeout(completeIntro, 2000);
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-black font-mono text-white">
      <video
        ref={videoRef}
        src={bootVideo}
        className="h-full w-full object-cover"
        autoPlay
        playsInline
        controls={false}
        muted={false}
        preload="auto"
        onPlay={onIntroStarted}
        onEnded={completeIntro}
        onError={handleError}
      />

      {audioBlocked && (
        <button
          type="button"
          onClick={requestPlayback}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 border border-orange-500/60 bg-black/72 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-200 shadow-[0_0_24px_rgba(0,0,0,0.8)] transition hover:border-orange-300 hover:text-white"
        >
          Press display to enable boot audio
        </button>
      )}
    </main>
  );
}
