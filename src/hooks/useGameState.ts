import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Player, PlayerStats, CalculatedStats } from '../types/game';
import { calculateStats, calculateExpRequired, canLevelUp } from '../utils/calculations';
import { ABILITY_POINTS_PER_LEVEL, REFERRAL_BONUS_AP, MAX_REFERRAL_BONUSES } from '../data/constants';

export function useGameState(telegramId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [calculatedStats, setCalculatedStats] = useState<CalculatedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlayerData = useCallback(async () => {
    if (!telegramId) {
      const demoId = 'demo_' + Date.now();
      try {
        setLoading(true);
        setError(null);

        const newPlayer = await createNewPlayer(demoId);
        setPlayer(newPlayer.player);
        setStats(newPlayer.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create demo player');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (playerError) throw playerError;

      if (!playerData) {
        const newPlayer = await createNewPlayer(telegramId);
        setPlayer(newPlayer.player);
        setStats(newPlayer.stats);
      } else {
        setPlayer(playerData);

        const { data: statsData, error: statsError } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', playerData.id)
          .maybeSingle();

        if (statsError) throw statsError;
        setStats(statsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load player data');
    } finally {
      setLoading(false);
    }
  }, [telegramId]);

  useEffect(() => {
    loadPlayerData();
  }, [loadPlayerData]);

  useEffect(() => {
    if (player && stats) {
      setCalculatedStats(calculateStats(stats));
    }
  }, [player, stats]);

  const createNewPlayer = async (tgId: string) => {
    const { data: newPlayerData, error: createError } = await supabase
      .from('players')
      .insert({
        telegram_id: tgId,
        username: `Player_${tgId.slice(-6)}`,
        level: 1,
        current_exp: 0,
        total_exp: 0,
        coins: 0,
        unspent_ability_points: 0,
        total_ability_points_earned: 0,
        referral_bonus_points: 0,
        referral_count: 0,
        rejuvenation_potions: 0,
        has_allocated_points: false
      })
      .select()
      .single();

    if (createError) throw createError;

    const { data: newStatsData, error: statsError } = await supabase
      .from('player_stats')
      .insert({
        player_id: newPlayerData.id,
        health_base: 10,
        health_invested: 0,
        health_current: 10,
        stamina_base: 10,
        stamina_invested: 0,
        stamina_current: 10,
        energy_base: 10,
        energy_invested: 0,
        energy_current: 10,
        strength_invested: 0,
        speed_invested: 0,
        luck_invested: 0
      })
      .select()
      .single();

    if (statsError) throw statsError;

    return { player: newPlayerData, stats: newStatsData };
  };

  const addExp = useCallback(async (amount: number) => {
    if (!player || !stats) return;

    let newExp = player.current_exp + amount;
    let newLevel = player.level;
    let newUnspentAP = player.unspent_ability_points;
    let newTotalAPEarned = player.total_ability_points_earned;

    const apPerLevel = ABILITY_POINTS_PER_LEVEL + (player.referral_bonus_points >= MAX_REFERRAL_BONUSES * REFERRAL_BONUS_AP ? REFERRAL_BONUS_AP : 0);

    while (canLevelUp(newLevel, newExp)) {
      const expRequired = calculateExpRequired(newLevel);
      newExp -= expRequired;
      newLevel += 1;
      newUnspentAP += apPerLevel;
      newTotalAPEarned += apPerLevel;
    }

    const { error } = await supabase
      .from('players')
      .update({
        level: newLevel,
        current_exp: newExp,
        total_exp: player.total_exp + amount,
        unspent_ability_points: newUnspentAP,
        total_ability_points_earned: newTotalAPEarned,
        updated_at: new Date().toISOString()
      })
      .eq('id', player.id);

    if (!error) {
      setPlayer({
        ...player,
        level: newLevel,
        current_exp: newExp,
        total_exp: player.total_exp + amount,
        unspent_ability_points: newUnspentAP,
        total_ability_points_earned: newTotalAPEarned
      });
    }
  }, [player, stats]);

  const addCoins = useCallback(async (amount: number) => {
    if (!player) return;

    const { error } = await supabase
      .from('players')
      .update({
        coins: player.coins + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', player.id);

    if (!error) {
      setPlayer({ ...player, coins: player.coins + amount });
    }
  }, [player]);

  const investAbilityPoint = useCallback(async (statName: keyof Omit<PlayerStats, 'player_id' | 'health_base' | 'stamina_base' | 'energy_base' | 'health_current' | 'stamina_current' | 'energy_current'>) => {
    if (!player || !stats || player.unspent_ability_points <= 0) return;

    const newStats = { ...stats, [statName]: stats[statName] + 1 };
    const wasFirstAllocation = !player.has_allocated_points;

    const { error: statsError } = await supabase
      .from('player_stats')
      .update(newStats)
      .eq('player_id', player.id);

    if (statsError) return;

    const updates: Partial<Player> = {
      unspent_ability_points: player.unspent_ability_points - 1,
      updated_at: new Date().toISOString()
    };

    if (wasFirstAllocation) {
      updates.has_allocated_points = true;
    }

    const { error: playerError } = await supabase
      .from('players')
      .update(updates)
      .eq('id', player.id);

    if (!playerError) {
      setStats(newStats);
      setPlayer({
        ...player,
        unspent_ability_points: player.unspent_ability_points - 1,
        has_allocated_points: wasFirstAllocation ? true : player.has_allocated_points
      });
    }
  }, [player, stats]);

  const updateCurrentStat = useCallback(async (statName: 'health_current' | 'stamina_current' | 'energy_current', newValue: number) => {
    if (!stats || !player) return;

    const { error } = await supabase
      .from('player_stats')
      .update({ [statName]: newValue })
      .eq('player_id', player.id);

    if (!error) {
      setStats({ ...stats, [statName]: newValue });
    }
  }, [stats, player]);

  return {
    player,
    stats,
    calculatedStats,
    loading,
    error,
    addExp,
    addCoins,
    investAbilityPoint,
    updateCurrentStat,
    refreshData: loadPlayerData
  };
}
