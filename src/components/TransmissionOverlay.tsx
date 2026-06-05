import { useEffect, useState } from "react";
import type { ActiveTransmission } from "../types";
import TransmissionCard, { type TransmissionCardVariant } from "./TransmissionCard";

interface TransmissionOverlayProps {
  transmission: ActiveTransmission | null;
  showPortrait: boolean;
  showText: boolean;
  showAudio: boolean;
  onStop: () => void;
}

function getVariant(transmission: ActiveTransmission): TransmissionCardVariant {
  if (transmission.variant === "full") return "full";
  if (transmission.variant === "compact") return "system";
  if (transmission.variant) return transmission.variant;
  switch (transmission.profileId ?? transmission.type) {
    case "delta6_log":
      return "log";
    case "hound":
    case "hound_contact":
    case "rover_system":
    case "em_storm":
      return "alert";
    case "scanner_delta6":
    case "terminal":
    case "system":
    case "unknown_radio":
      return "system";
    default:
      return "portrait";
  }
}

export default function TransmissionOverlay({
  transmission,
  showPortrait,
  showText,
  showAudio,
  onStop,
}: TransmissionOverlayProps) {
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

  const shouldForceScenePortrait =
    transmission.sourceRole === "SCENE POPUP" &&
    ["aletheia", "rowe", "velen", "hounds", "hound", "hound_contact"].includes(transmission.profileId ?? transmission.type);

  return (
    <TransmissionCard
      visible
      profileId={transmission.profileId ?? transmission.type}
      message={transmission.message}
      variant={getVariant(transmission)}
      durationMs={transmission.durationMs}
      showPortrait={showPortrait || shouldForceScenePortrait}
      showText={showText}
      showAudio={showAudio}
      onStop={onStop}
    />
  );
}
