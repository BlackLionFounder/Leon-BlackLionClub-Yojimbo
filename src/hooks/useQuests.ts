import { useState, useEffect } from 'react';
import {
  getActiveQuests,
  getPlayerQuests,
  claimQuestReward,
  Quest,
  PlayerQuest,
} from '../utils/questsManager';

export const useQuests = (playerId: string | null) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [playerQuests, setPlayerQuests] = useState<PlayerQuest[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshQuests = async () => {
    if (!playerId) return;

    const [allQuests, playerProgress] = await Promise.all([
      getActiveQuests(),
      getPlayerQuests(playerId),
    ]);

    setQuests(allQuests);
    setPlayerQuests(playerProgress);
  };

  const claimReward = async (questId: string) => {
    if (!playerId) return { success: false, error: 'No player ID' };

    setLoading(true);
    const result = await claimQuestReward(playerId, questId);

    if (result.success) {
      await refreshQuests();
    }

    setLoading(false);
    return result;
  };

  const getQuestProgress = (questId: string): PlayerQuest | undefined => {
    return playerQuests.find((pq) => pq.quest_id === questId);
  };

  useEffect(() => {
    if (!playerId) return;

    refreshQuests();

    const interval = setInterval(() => {
      refreshQuests();
    }, 60000);

    return () => clearInterval(interval);
  }, [playerId]);

  return {
    quests,
    playerQuests,
    loading,
    claimReward,
    getQuestProgress,
    refreshQuests,
  };
};
