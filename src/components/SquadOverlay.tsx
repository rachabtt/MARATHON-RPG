import PlayerCard from './PlayerCard';
import type { SquadOverlayState } from '../types';

interface SquadOverlayProps {
  overlay: SquadOverlayState;
}

export default function SquadOverlay({ overlay }: SquadOverlayProps) {
  if (!overlay.visible) return null;

  const visibleMembers = overlay.members.filter((member) => member.visible).slice(0, 3);
  if (!visibleMembers.length) return null;

  return (
    <div className="squad-overlay absolute z-30 pointer-events-none">
      <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-stone-400 font-mono">ESCOUADE PJ</div>
      <div className="flex flex-col gap-2 w-[clamp(260px,22vw,360px)] max-h-[72vh] overflow-auto" style={{ paddingRight: 8 }}>
        {visibleMembers.map((member) => (
          <div key={member.id} className="min-w-0">
            <PlayerCard member={member} mode={overlay.mode} />
          </div>
        ))}
      </div>
    </div>
  );
}
