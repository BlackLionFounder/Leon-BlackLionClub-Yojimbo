import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Player, PlayerStats, CalculatedStats } from '../types/game';
import { calculateStats, calculateExpRequired, canLevelUp } from '../utils/calculations';
import { ABILITY_POINTS_PER_LEVEL, REFERRAL_BONUS_AP, MAX_REFERRAL_BONUSES } from '../data/constants';

export function useGameState(userId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [calculatedStats, setCalculatedStats] = useState<CalculatedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthRegenTime, setHealthRegenTime] = useState<number>(0);
  const [staminaRegenTime, setStaminaRegenTime] = useState<number>(0);

  const loadPlayerData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (playerError) throw playerError;

      if (!playerData) {
        const newPlayer = await createNewPlayer(userId);
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
  }, [userId]);

  useEffect(() => {
    loadPlayerData();
  }, [loadPlayerData]);

  useEffect(() => {
    if (player && stats) {
      setCalculatedStats(calculateStats(stats));
    }
  }, [player, stats]);

  useEffect(() => {
    if (!player || !stats || !calculatedStats) return;

    const checkRegeneration = async () => {
      const now = Date.now();
      const lastHealthRegen = new Date(player.last_health_regen).getTime();
      const lastStaminaRegen = new Date(player.last_stamina_regen).getTime();

      const healthTimeSince = now - lastHealthRegen;
      const staminaTimeSince = now - lastStaminaRegen;

      const healthRegenInterval = (60 * 60 * 1000) / calculatedStats.health.regenRate;
      const staminaRegenInterval = (60 * 1000) / calculatedStats.stamina.regenRate;

      const healthTimeUntilNext = Math.max(0, healthRegenInterval - (healthTimeSince % healthRegenInterval));
      const staminaTimeUntilNext = Math.max(0, staminaRegenInterval - (staminaTimeSince % staminaRegenInterval));

      setHealthRegenTime(healthTimeUntilNext);
      setStaminaRegenTime(staminaTimeUntilNext);

      const healthPointsToRegen = Math.floor(healthTimeSince / healthRegenInterval);
      const staminaPointsToRegen = Math.floor(staminaTimeSince / staminaRegenInterval);

      if (healthPointsToRegen > 0 || staminaPointsToRegen > 0) {
        const updates: Partial<PlayerStats> = {};
        const playerUpdates: Partial<Player> = {};

        if (healthPointsToRegen > 0 && stats.health_current < calculatedStats.health.max) {
          const newHealth = Math.min(stats.health_current + healthPointsToRegen, calculatedStats.health.max);
          updates.health_current = newHealth;
          playerUpdates.last_health_regen = new Date(lastHealthRegen + (healthPointsToRegen * healthRegenInterval)).toISOString();
        }

        if (staminaPointsToRegen > 0 && stats.stamina_current < calculatedStats.stamina.max) {
          const newStamina = Math.min(stats.stamina_current + staminaPointsToRegen, calculatedStats.stamina.max);
          updates.stamina_current = newStamina;
          playerUpdates.last_stamina_regen = new Date(lastStaminaRegen + (staminaPointsToRegen * staminaRegenInterval)).toISOString();
        }

        if (Object.keys(updates).length > 0) {
          await supabase.from('player_stats').update(updates).eq('player_id', player.id);
          setStats(prevStats => prevStats ? { ...prevStats, ...updates } : prevStats);
        }

        if (Object.keys(playerUpdates).length > 0) {
          await supabase.from('players').update(playerUpdates).eq('id', player.id);
          setPlayer({ ...player, ...playerUpdates });
        }
      }
    };

    checkRegeneration();
    const interval = setInterval(checkRegeneration, 1000);

    return () => clearInterval(interval);
  }, [player, stats, calculatedStats]);

  const createNewPlayer = async (uid: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const displayName = userData?.user?.user_metadata?.display_name || `Player_${uid.slice(-6)}`;

    const { data: newPlayerData, error: createError } = await supabase
      .from('players')
      .insert({
        user_id: uid,
        telegram_id: null,
        username: displayName,
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

    if (createError) {
      if (createError.code === '23505') {
        const { data: existingPlayer } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', uid)
          .single();

        if (existingPlayer) {
          const { data: existingStats } = await supabase
            .from('player_stats')
            .select('*')
            .eq('player_id', existingPlayer.id)
            .single();

          return { player: existingPlayer, stats: existingStats };
        }
      }
      throw createError;
    }

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

    await supabase.from('player_inventory').insert([
      {
        player_id: newPlayerData.id,
        item_type: 'health_potion',
        quantity: 5
      },
      {
        player_id: newPlayerData.id,
        item_type: 'stamina_potion',
        quantity: 5
      }
    ]);

    return { player: newPlayerData, stats: newStatsData };
  };

  const addExp = useCallback(async (amount: number) => {
    if (!player || !stats) return;

    let newExp = player.current_exp + amount;
    let newLevel = player.level;
    let newUnspentAP = player.unspent_ability_points;
    let newTotalAPEarned = player.total_ability_points_earned;
    let levelsGained = 0;

    const apPerLevel = ABILITY_POINTS_PER_LEVEL + (player.referral_bonus_points >= MAX_REFERRAL_BONUSES * REFERRAL_BONUS_AP ? REFERRAL_BONUS_AP : 0);

    while (canLevelUp(newLevel, newExp)) {
      const expRequired = calculateExpRequired(newLevel);
      newExp -= expRequired;
      newLevel += 1;
      newUnspentAP += apPerLevel;
      newTotalAPEarned += apPerLevel;
      levelsGained += 1;
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

      if (levelsGained > 0) {
        await supabase.from('event_logs').insert({
          player_id: player.id,
          event_type: 'level_up',
          message: `Level Up! Reached level ${newLevel}. Gained ${apPerLevel * levelsGained} AP!`
        });
      }
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
    if (!player || !stats || !calculatedStats || player.unspent_ability_points <= 0) return;

    const newStats = { ...stats, [statName]: stats[statName] + 1 };
    const wasFirstAllocation = !player.has_allocated_points;

    if (statName === 'health_invested') {
      newStats.health_current = stats.health_current + 1;
    } else if (statName === 'stamina_invested') {
      newStats.stamina_current = stats.stamina_current + 1;
    } else if (statName === 'energy_invested') {
      newStats.energy_current = stats.energy_current + 1;
    }

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
      setPlayer(prevPlayer => prevPlayer ? {
        ...prevPlayer,
        unspent_ability_points: prevPlayer.unspent_ability_points - 1,
        has_allocated_points: wasFirstAllocation ? true : prevPlayer.has_allocated_points
      } : prevPlayer);
    }
  }, [player, stats, calculatedStats]);

  const updateCurrentStat = useCallback(async (statName: 'health_current' | 'stamina_current' | 'energy_current', newValue: number) => {
    if (!stats || !player) return;

    const { error } = await supabase
      .from('player_stats')
      .update({ [statName]: newValue })
      .eq('player_id', player.id);

    if (!error) {
      setStats(prevStats => prevStats ? { ...prevStats, [statName]: newValue } : prevStats);
    }
  }, [stats, player]);

  return {
    player,
    stats,
    calculatedStats,
    loading,
    error,
    healthRegenTime,
    staminaRegenTime,
    addExp,
    addCoins,
    investAbilityPoint,
    updateCurrentStat,
    refreshData: loadPlayerData
  };
}
