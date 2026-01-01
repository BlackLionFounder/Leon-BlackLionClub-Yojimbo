import { supabase } from '../lib/supabase';
import { addCard, CardType } from './effectsManager';

export interface Quest {
  id: string;
  title: string;
  description: string;
  requirements: QuestRequirement;
  rewards: QuestReward;
  order_index: number;
  is_active: boolean;
}

export interface QuestRequirement {
  type: 'reach_level' | 'total_taps' | 'combat_wins' | 'coins_earned';
  value: number;
}

export interface QuestReward {
  coins?: number;
  cards?: Array<{ type: CardType; quantity: number }>;
}

export interface PlayerQuest {
  id: string;
  player_id: string;
  quest_id: string;
  progress: number;
  completed_at: string | null;
  claimed_at: string | null;
  quest?: Quest;
}

export const getActiveQuests = async (): Promise<Quest[]> => {
  const { data: quests, error } = await supabase
    .from('quests')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    return [];
  }

  return quests || [];
};

export const getPlayerQuests = async (playerId: string): Promise<PlayerQuest[]> => {
  const { data: playerQuests, error } = await supabase
    .from('player_quests')
    .select(`
      *,
      quest:quests(*)
    `)
    .eq('player_id', playerId);

  if (error) {
    return [];
  }

  return playerQuests || [];
};

export const updateQuestProgress = async (
  playerId: string,
  questType: QuestRequirement['type'],
  currentValue: number
): Promise<void> => {
  const quests = await getActiveQuests();
  const relevantQuests = quests.filter((q) => q.requirements.type === questType);

  for (const quest of relevantQuests) {
    const { data: playerQuest, error: fetchError } = await supabase
      .from('player_quests')
      .select('*')
      .eq('player_id', playerId)
      .eq('quest_id', quest.id)
      .maybeSingle();

    if (fetchError) continue;

    const progress = Math.min(currentValue, quest.requirements.value);
    const isCompleted = progress >= quest.requirements.value;

    if (!playerQuest) {
      await supabase.from('player_quests').insert({
        player_id: playerId,
        quest_id: quest.id,
        progress,
        completed_at: isCompleted ? new Date().toISOString() : null,
      });
    } else if (!playerQuest.completed_at && isCompleted) {
      await supabase
        .from('player_quests')
        .update({
          progress,
          completed_at: new Date().toISOString(),
        })
        .eq('id', playerQuest.id);
    } else if (!playerQuest.completed_at) {
      await supabase
        .from('player_quests')
        .update({ progress })
        .eq('id', playerQuest.id);
    }
  }
};

export const claimQuestReward = async (
  playerId: string,
  questId: string
): Promise<{ success: boolean; error?: string; rewards?: QuestReward }> => {
  const { data: playerQuest, error: fetchError } = await supabase
    .from('player_quests')
    .select(`
      *,
      quest:quests(*)
    `)
    .eq('player_id', playerId)
    .eq('quest_id', questId)
    .maybeSingle();

  if (fetchError || !playerQuest) {
    return { success: false, error: 'Quest not found' };
  }

  if (!playerQuest.completed_at) {
    return { success: false, error: 'Quest not completed' };
  }

  if (playerQuest.claimed_at) {
    return { success: false, error: 'Rewards already claimed' };
  }

  const quest = playerQuest.quest as unknown as Quest;
  const rewards = quest.rewards;

  if (rewards.coins) {
    const { data: player } = await supabase
      .from('players')
      .select('coins')
      .eq('id', playerId)
      .single();

    if (player) {
      await supabase
        .from('players')
        .update({ coins: player.coins + rewards.coins })
        .eq('id', playerId);
    }
  }

  if (rewards.cards) {
    for (const card of rewards.cards) {
      await addCard(playerId, card.type, card.quantity);
    }
  }

  const { error: updateError } = await supabase
    .from('player_quests')
    .update({ claimed_at: new Date().toISOString() })
    .eq('id', playerQuest.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, rewards };
};
