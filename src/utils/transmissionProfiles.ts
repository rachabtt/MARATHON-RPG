import { getCharacterProfile } from './characters';
import type { TransmissionType } from '../types';

export interface TransmissionProfile {
  id: TransmissionType;
  accentColor: string;
  panelClasses: string;
  headerClasses: string;
  waveformVariant: 'stable' | 'glitch' | 'spectrogram' | 'minimal' | 'alert';
  fallbackType: 'portrait' | 'text' | 'symbol';
  portraitAsset?: string;
}

export const TRANSMISSION_PROFILES: Record<TransmissionType, TransmissionProfile> = {
  rowe: {
    id: 'rowe',
    accentColor: 'orange',
    panelClasses: 'border-orange-500/40 bg-black/92 shadow-[0_0_20px_rgba(245,158,11,0.12)]',
    headerClasses: 'bg-[#11100f]/90 border-orange-500/40 text-orange-300',
    waveformVariant: 'stable',
    fallbackType: 'portrait',
    portraitAsset: getCharacterProfile('rowe').portrait,
  },
  aletheia: {
    id: 'aletheia',
    accentColor: 'cyan',
    panelClasses: 'border-cyan-400/40 bg-slate-950/92 shadow-[0_0_18px_rgba(34,211,238,0.12)]',
    headerClasses: 'bg-[#091716]/90 border-cyan-400/40 text-cyan-300',
    waveformVariant: 'stable',
    fallbackType: 'portrait',
    portraitAsset: getCharacterProfile('aletheia').portrait,
  },
  velen: {
    id: 'velen',
    accentColor: 'amber',
    panelClasses: 'border-amber-500/35 bg-stone-950/92 shadow-[0_0_18px_rgba(245,158,11,0.1)]',
    headerClasses: 'bg-[#16100d]/90 border-amber-500/30 text-amber-300',
    waveformVariant: 'glitch',
    fallbackType: 'portrait',
    portraitAsset: getCharacterProfile('velen').portrait,
  },
  delta6_log: {
    id: 'delta6_log',
    accentColor: 'cyan',
    panelClasses: 'border-cyan-500/30 bg-black/88 shadow-[0_0_18px_rgba(56,189,248,0.12)]',
    headerClasses: 'bg-[#0b1214]/90 border-cyan-500/30 text-cyan-300',
    waveformVariant: 'spectrogram',
    fallbackType: 'text',
  },
  unknown_radio: {
    id: 'unknown_radio',
    accentColor: 'red',
    panelClasses: 'border-red-500/30 bg-black/92 shadow-[0_0_16px_rgba(244,63,94,0.16)]',
    headerClasses: 'bg-[#09080a]/90 border-red-500/30 text-red-300',
    waveformVariant: 'minimal',
    fallbackType: 'symbol',
  },
  hound: {
    id: 'hound',
    accentColor: 'red',
    panelClasses: 'border-red-500/40 bg-black/94 shadow-[0_0_22px_rgba(239,68,68,0.15)]',
    headerClasses: 'bg-[#130f0e]/90 border-red-500/40 text-red-300',
    waveformVariant: 'alert',
    fallbackType: 'symbol',
    portraitAsset: getCharacterProfile('hound').portrait,
  }
};

export function getTransmissionProfile(type: TransmissionType): TransmissionProfile {
  return TRANSMISSION_PROFILES[type];
}
