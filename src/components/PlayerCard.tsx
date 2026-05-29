import type { SquadMember, SquadOverlayMode } from '../types';
import CharacterPortraitCrop from './CharacterPortraitCrop';
import { Zap, Waves } from 'lucide-react';

const STATUS_BADGES: Record<string, string> = {
  OK: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
  BLESSÉ: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  ISOLÉ: 'border-stone-500/30 bg-stone-700/10 text-stone-300',
  ÉPUISÉ: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  'RADIO COUPÉE': 'border-red-500/30 bg-red-500/10 text-red-300',
  INCONSCIENT: 'border-red-600/30 bg-red-600/10 text-red-300',
  KO: 'border-red-700/30 bg-red-700/10 text-red-300'
};

interface PlayerCardProps {
  member: SquadMember;
  mode: SquadOverlayMode;
}

export default function PlayerCard({ member, mode }: PlayerCardProps) {
  const statsEntries = ['physique','technique','mental','presence'].map((k) => [k, (member.stats as any)[k]] as [string, any]);
  return (
    <div className="w-full max-w-full overflow-hidden rounded-lg border border-stone-800/80 bg-black/60 p-2">
      <div className="flex items-start gap-2">
        <div className="relative h-14 w-14 min-w-[3.5rem] rounded-xl border border-stone-700 bg-stone-950 overflow-hidden flex items-center justify-center text-stone-500">
          <CharacterPortraitCrop src={member.portrait} alt={member.name} size={56} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white truncate">{member.name}</div>
              <div className="text-[8.5px] uppercase tracking-[0.18em] text-stone-400 truncate">{member.role}</div>
            </div>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${STATUS_BADGES[member.status] ?? 'border-stone-700/30 bg-stone-800/20 text-stone-300'}`}>
              {member.status}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1 text-[9px] uppercase tracking-[0.12em] text-stone-300">
            {statsEntries.map(([key, value]) => (
              <div key={key} className="rounded-md border border-stone-800/70 bg-stone-950/60 p-1 overflow-hidden text-center">
                <div className="text-stone-500 text-[7px] leading-tight">{key.toUpperCase()}</div>
                <div className="mt-0.5 font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1">
        <div className="rounded-md border border-stone-800/70 bg-stone-950/60 px-2 py-1 text-[10px] font-medium text-stone-100 text-center flex flex-col items-center">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <div className="text-stone-400 text-[9px] uppercase">STRESS</div>
          <div className="mt-1 font-bold text-white">{((member as any).trackers && (member as any).trackers['stress']) ?? 0}/5</div>
        </div>
        <div className="rounded-md border border-stone-800/70 bg-stone-950/60 px-2 py-1 text-[10px] font-medium text-stone-100 text-center flex flex-col items-center">
          <Waves className="w-3.5 h-3.5 text-sky-400" />
          <div className="text-stone-400 text-[9px] uppercase">BRUIT</div>
          <div className="mt-1 font-bold text-white">{((member as any).trackers && (member as any).trackers['bruit']) ?? 0}/5</div>
        </div>
        <div className="rounded-md border border-stone-800/70 bg-stone-950/60 px-2 py-1 text-[10px] font-medium text-stone-100 text-center flex flex-col items-center">
          <div className="text-orange-400">✚</div>
          <div className="text-stone-400 text-[9px] uppercase">BLESSURES</div>
          <div className="mt-1 font-bold text-white">{((member as any).trackers && (member as any).trackers['blessures']) ?? 0}/3</div>
        </div>
      </div>
    </div>
  );
}
