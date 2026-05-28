import type { TransmissionType } from "../types";
import type { SciFiAudioEngine } from "./audioEngine";

export function playInterventionAudio(
  audioEngine: SciFiAudioEngine | null,
  enabled: boolean,
  audioSrc: string | undefined,
  speaker: TransmissionType
) {
  if (!enabled || !audioEngine) return;

  if (audioSrc) {
    try {
      const audio = new Audio(audioSrc);
      audio.volume = 0.86;
      audio.play().catch(() => {
        audioEngine.triggerInterventionFallback(speaker);
      });
      audio.addEventListener("error", () => {
        audioEngine.triggerInterventionFallback(speaker);
      }, { once: true });
      return;
    } catch {
      audioEngine.triggerInterventionFallback(speaker);
      return;
    }
  }

  audioEngine.triggerInterventionFallback(speaker);
}
