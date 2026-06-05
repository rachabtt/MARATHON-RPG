import { useMemo, useState } from 'react';
import { getMissionSceneById } from '../../data/missionScenes';
import {
  getPlayerIntelForScene,
  type PlayerIntelTarget,
  type ScenePlayerIntel
} from '../../data/scenePlayerIntel';
import {
  getAllPlayerCharacters,
} from '../../data/playerCharacters';
import type { PlayerCharacterId } from '../../types';
import type { PlayerIntelDelivery, PlayerIntelRecipient } from '../../utils/syncState';

type PlayerIntelControlPanelProps = {
  activeSceneId?: string | null;
  selectedSquadIds: string[];
  sentIntelDeliveries: PlayerIntelDelivery[];
  onSendIntel: (intel: ScenePlayerIntel, recipients: PlayerIntelRecipient[]) => void;
  onClearSentIntel: () => void;
};

const TARGET_LABELS: Record<PlayerIntelTarget, string> = {
  all: 'Tous',
  selected_player: 'PJ choisi',
  role_security: 'Sécurité',
  role_engineer: 'Ingénieur',
  role_medical: 'Médical',
  role_pilot: 'Pilote',
  role_science: 'Science',
  role_command: 'Commandement',
  role_drone: 'Drone',
  role_logistics: 'Logistique'
};

const TYPE_LABELS: Record<ScenePlayerIntel['type'], string> = {
  cryo_dream: 'Rêve cryo',
  sensation: 'Sensation',
  objective: 'Objectif',
  uesc_notice: 'Note UESC',
  personal_prompt: 'Prompt PJ',
  environment: 'Environnement'
};

function toCanonicalPlayerId(id: string): PlayerCharacterId {
  return id.replaceAll('-', '_') as PlayerCharacterId;
}

function getRoleTarget(characterRole: string): PlayerIntelTarget | null {
  const normalizedRole = characterRole.toLowerCase();
  if (normalizedRole.includes('sécurité')) return 'role_security';
  if (normalizedRole.includes('ingénieur')) return 'role_engineer';
  if (normalizedRole.includes('médecin')) return 'role_medical';
  if (normalizedRole.includes('pilote')) return 'role_pilot';
  if (normalizedRole.includes('scientifique')) return 'role_science';
  if (normalizedRole.includes('agent')) return 'role_command';
  if (normalizedRole.includes('drone')) return 'role_drone';
  if (normalizedRole.includes('logisticien')) return 'role_logistics';
  return null;
}

function getRecipientsForIntel(
  intel: ScenePlayerIntel,
  selectedCharacterId: PlayerCharacterId | '',
  selectedSquadIds: string[]
): PlayerIntelRecipient[] {
  if (intel.target === 'all') return ['all'];
  if (intel.target === 'selected_player') return selectedCharacterId ? [selectedCharacterId] : [];

  const selectedSet = new Set(selectedSquadIds.map(toCanonicalPlayerId));
  return getAllPlayerCharacters()
    .filter((character) => selectedSet.has(character.id))
    .filter((character) => getRoleTarget(character.role) === intel.target)
    .map((character) => character.id);
}

export default function PlayerIntelControlPanel({
  activeSceneId,
  selectedSquadIds,
  sentIntelDeliveries,
  onSendIntel,
  onClearSentIntel
}: PlayerIntelControlPanelProps) {
  const [selectedPlayerByIntelId, setSelectedPlayerByIntelId] = useState<Record<string, PlayerCharacterId | ''>>({});
  const activeScene = getMissionSceneById(activeSceneId);
  const resolvedSceneId = activeScene?.id ?? activeSceneId ?? '';
  const sceneIntel = useMemo(() => getPlayerIntelForScene(resolvedSceneId), [resolvedSceneId]);
  const characters = getAllPlayerCharacters();
  const sentIntelById = useMemo(() => {
    return sentIntelDeliveries.reduce<Record<string, PlayerIntelDelivery[]>>((sentById, delivery) => {
      return {
        ...sentById,
        [delivery.intelId]: [...(sentById[delivery.intelId] ?? []), delivery]
      };
    }, {});
  }, [sentIntelDeliveries]);

  return (
    <section className="mb-4 space-y-2 rounded border border-stone-850 bg-stone-950/70 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-stone-500">Infos joueurs</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-stone-400">
            Scène active: <span className="text-orange-300">{activeScene?.shortLabel ?? (resolvedSceneId || 'Aucune')}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="rounded border border-stone-800 px-2 py-1 text-[10px] uppercase tracking-widest text-stone-500">
            Envoi manuel
          </div>
          <button
            type="button"
            disabled={sentIntelDeliveries.length === 0}
            onClick={onClearSentIntel}
            className={`rounded border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${
              sentIntelDeliveries.length === 0
                ? 'cursor-not-allowed border-stone-850 text-stone-700'
                : 'border-orange-900/70 bg-orange-950/20 text-orange-300 hover:border-orange-500'
            }`}
          >
            Reset infos joueur
          </button>
        </div>
      </div>

      {sceneIntel.length === 0 ? (
        <div className="rounded border border-stone-850 bg-black/25 px-3 py-2 text-[11px] uppercase tracking-wider text-stone-600">
          Aucune info joueur liée à cette scène.
        </div>
      ) : (
        <div className="space-y-2">
          {sceneIntel.map((intel) => {
            const selectedPlayerId = selectedPlayerByIntelId[intel.id] ?? '';
            const recipients = getRecipientsForIntel(intel, selectedPlayerId, selectedSquadIds);
            const sendDisabled = recipients.length === 0;
            const sentDeliveries = sentIntelById[intel.id] ?? [];
            const lastSentAt = sentDeliveries.reduce<number | null>((latest, delivery) => (
              latest === null || delivery.sentAt > latest ? delivery.sentAt : latest
            ), null);

            return (
              <article key={intel.id} className={`rounded border p-2 ${lastSentAt ? 'border-emerald-900/60 bg-emerald-950/10' : 'border-stone-800 bg-black/25'}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-100">{intel.title}</span>
                      <span className="rounded border border-stone-700 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-stone-400">
                        {TYPE_LABELS[intel.type]}
                      </span>
                      <span className="rounded border border-orange-900/70 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-orange-300">
                        {TARGET_LABELS[intel.target]}
                      </span>
                      {lastSentAt && (
                        <span className="rounded border border-emerald-700/55 bg-emerald-950/35 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-emerald-300">
                          Envoyée {new Date(lastSentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] leading-snug text-stone-300">{intel.text}</p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-1.5 sm:w-44">
                    {intel.target === 'selected_player' && (
                      <select
                        value={selectedPlayerId}
                        onChange={(event) => {
                          setSelectedPlayerByIntelId((current) => ({
                            ...current,
                            [intel.id]: event.target.value as PlayerCharacterId | ''
                          }));
                        }}
                        className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-[11px] text-stone-200"
                      >
                        <option value="">Choisir PJ</option>
                        {characters.map((character) => (
                          <option key={character.id} value={character.id}>{character.name}</option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      disabled={sendDisabled}
                      onClick={() => onSendIntel(intel, recipients)}
                      className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                        sendDisabled
                          ? 'cursor-not-allowed border-stone-800 text-stone-600'
                          : 'border-emerald-700 bg-emerald-950/30 text-emerald-200 hover:border-emerald-400'
                      }`}
                    >
                      Envoyer
                    </button>
                    {intel.target !== 'all' && (
                      <div className="text-[9px] uppercase tracking-[0.12em] text-stone-600">
                        {sendDisabled ? 'Aucun destinataire' : `${recipients.length} destinataire(s)`}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
