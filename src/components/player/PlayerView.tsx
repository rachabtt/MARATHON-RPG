import { useEffect, useState } from 'react';
import type { PlayerCharacterId, SquadMember } from '../../types';
import type { MissionControlState, PlayerIntelDelivery } from '../../utils/syncState';
import {
  getAllPlayerCharacters,
  getPlayerCharacterById
} from '../../data/playerCharacters';
import PlayerCharacterSelect from './PlayerCharacterSelect';
import PlayerCharacterSheet from './PlayerCharacterSheet';

const PLAYER_CHARACTER_STORAGE_KEY = 'marathon-player-character-id';
const PLAYER_SELECTION_RESET_ACK_KEY = 'marathon-player-selection-reset-at';

function isPlayerCharacterId(value: string | null): value is PlayerCharacterId {
  return Boolean(getPlayerCharacterById(value));
}

function getInitialSelectedCharacterId(): PlayerCharacterId | null {
  try {
    const stored = localStorage.getItem(PLAYER_CHARACTER_STORAGE_KEY);
    return isPlayerCharacterId(stored) ? stored : null;
  } catch {
    return null;
  }
}

function toLegacySquadId(characterId: PlayerCharacterId): string {
  return characterId.replaceAll('_', '-');
}

function getTrackersForCharacter(state: MissionControlState, characterId: PlayerCharacterId) {
  const legacyId = toLegacySquadId(characterId);
  const member = state.squadOverlay.members.find((candidate: SquadMember) => (
    candidate.id === characterId || candidate.id === legacyId
  ));

  if (!member?.trackers) return undefined;

  return {
    stress: member.trackers.stress ?? 0,
    bruit: member.trackers.bruit ?? 0,
    blessures: member.trackers.blessures ?? 0
  };
}

function getIntelForCharacter(state: MissionControlState, characterId: PlayerCharacterId): PlayerIntelDelivery[] {
  return (state.playerIntelDeliveries ?? [])
    .filter((delivery) => (
      delivery.recipients.includes('all') ||
      delivery.recipients.includes(characterId)
    ))
    .sort((left, right) => right.sentAt - left.sentAt);
}

type PlayerViewProps = {
  state: MissionControlState;
};

export default function PlayerView({ state }: PlayerViewProps) {
  const [selectedCharacterId, setSelectedCharacterId] = useState<PlayerCharacterId | null>(getInitialSelectedCharacterId);
  const characters = getAllPlayerCharacters();
  const selectedCharacter = getPlayerCharacterById(selectedCharacterId);
  const playerSelectionResetAt = state.playerSelectionResetAt ?? 0;

  useEffect(() => {
    if (!selectedCharacterId) return;
    if (getPlayerCharacterById(selectedCharacterId)) return;
    setSelectedCharacterId(null);
  }, [selectedCharacterId]);

  useEffect(() => {
    if (!playerSelectionResetAt) return;

    try {
      const acknowledgedResetAt = Number(localStorage.getItem(PLAYER_SELECTION_RESET_ACK_KEY) ?? '0');
      if (acknowledgedResetAt >= playerSelectionResetAt) return;

      localStorage.removeItem(PLAYER_CHARACTER_STORAGE_KEY);
      localStorage.setItem(PLAYER_SELECTION_RESET_ACK_KEY, String(playerSelectionResetAt));
    } catch {
      // If storage is unavailable, still reset the in-memory selection for this view.
    }

    setSelectedCharacterId(null);
  }, [playerSelectionResetAt]);

  const handleSelectCharacter = (id: PlayerCharacterId) => {
    setSelectedCharacterId(id);
    try {
      localStorage.setItem(PLAYER_CHARACTER_STORAGE_KEY, id);
      localStorage.setItem(PLAYER_SELECTION_RESET_ACK_KEY, String(playerSelectionResetAt));
    } catch {
      // Local selection can still work in memory if storage is unavailable.
    }
  };

  const handleChangeCharacter = () => {
    setSelectedCharacterId(null);
    try {
      localStorage.removeItem(PLAYER_CHARACTER_STORAGE_KEY);
    } catch {
      // Ignore local storage failures.
    }
  };

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050606] font-mono text-stone-200 selection:bg-orange-500/25 selection:text-orange-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.28)_50%),linear-gradient(90deg,rgba(16,185,129,0.03),rgba(251,146,60,0.02),rgba(0,0,0,0))] bg-[size:100%_4px,7px_100%] opacity-45" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.10),rgba(0,0,0,0)_38%),radial-gradient(circle_at_80%_20%,rgba(194,65,12,0.10),rgba(0,0,0,0)_34%)]" />
      <div className="relative z-10 pb-[env(safe-area-inset-bottom)]">
        {!selectedCharacter ? (
          <PlayerCharacterSelect
            characters={characters}
            onSelect={handleSelectCharacter}
          />
        ) : (
          <PlayerCharacterSheet
            character={selectedCharacter}
            equipmentState={state.playerEquipmentState?.[selectedCharacter.id]}
            trackers={getTrackersForCharacter(state, selectedCharacter.id)}
            playerIntelDeliveries={getIntelForCharacter(state, selectedCharacter.id)}
            onChangeCharacter={handleChangeCharacter}
          />
        )}
      </div>
    </div>
  );
}
