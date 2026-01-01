import { supabase } from '../lib/supabase';

export type CardType = 'single' | 'double' | 'triple' | 'quadruple' | 'quintuple';
export type EffectType = 'xp_multiplier' | 'coin_multiplier';

const CARD_MULTIPLIERS: Record<CardType, number> = {
  single: 1,
  double: 2,
  triple: 3,
  quadruple: 4,
  quintuple: 5,
};

const EFFECT_DURATION_HOURS = 1;

export interface ActiveEffect {
  id: string;
  player_id: string;
  effect_type: EffectType;
  multiplier: number;
  activated_at: string;
  expires_at: string;
}

export interface PlayerCard {
  id: string;
  player_id: string;
  card_type: CardType;
  quantity: number;
}

export const activateCard = async (
  playerId: string,
  cardType: CardType,
  effectType: EffectType = 'xp_multiplier'
): Promise<{ success: boolean; error?: string }> => {
  const multiplier = CARD_MULTIPLIERS[cardType];
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + EFFECT_DURATION_HOURS);

  const { data: card, error: cardError } = await supabase
    .from('player_cards')
    .select('*')
    .eq('player_id', playerId)
    .eq('card_type', cardType)
    .maybeSingle();

  if (cardError) {
    return { success: false, error: cardError.message };
  }

  if (!card || card.quantity < 1) {
    return { success: false, error: 'Insufficient cards' };
  }

  const { data: existingEffect, error: effectError } = await supabase
    .from('active_effects')
    .select('*')
    .eq('player_id', playerId)
    .eq('effect_type', effectType)
    .eq('multiplier', multiplier)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (effectError) {
    return { success: false, error: effectError.message };
  }

  if (existingEffect) {
    const newExpiresAt = new Date(existingEffect.expires_at);
    newExpiresAt.setHours(newExpiresAt.getHours() + EFFECT_DURATION_HOURS);

    const { error: updateError } = await supabase
      .from('active_effects')
      .update({ expires_at: newExpiresAt.toISOString() })
      .eq('id', existingEffect.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
  } else {
    const { error: insertError } = await supabase
      .from('active_effects')
      .insert({
        player_id: playerId,
        effect_type: effectType,
        multiplier,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  const { error: updateCardError } = await supabase
    .from('player_cards')
    .update({ quantity: card.quantity - 1 })
    .eq('id', card.id);

  if (updateCardError) {
    return { success: false, error: updateCardError.message };
  }

  return { success: true };
};

export const getCurrentMultiplier = async (
  playerId: string,
  effectType: EffectType = 'xp_multiplier'
): Promise<number> => {
  const now = new Date().toISOString();

  const { data: effects, error } = await supabase
    .from('active_effects')
    .select('*')
    .eq('player_id', playerId)
    .eq('effect_type', effectType)
    .gt('expires_at', now)
    .order('multiplier', { ascending: false })
    .order('expires_at', { ascending: true })
    .limit(1);

  if (error || !effects || effects.length === 0) {
    return 1;
  }

  return effects[0].multiplier;
};

export const getActiveEffects = async (
  playerId: string
): Promise<ActiveEffect[]> => {
  const now = new Date().toISOString();

  const { data: effects, error } = await supabase
    .from('active_effects')
    .select('*')
    .eq('player_id', playerId)
    .gt('expires_at', now)
    .order('multiplier', { ascending: false });

  if (error) {
    return [];
  }

  return effects || [];
};

export const cleanupExpiredEffects = async (playerId: string): Promise<void> => {
  const now = new Date().toISOString();

  await supabase
    .from('active_effects')
    .delete()
    .eq('player_id', playerId)
    .lt('expires_at', now);
};

export const getPlayerCards = async (playerId: string): Promise<PlayerCard[]> => {
  const { data: cards, error } = await supabase
    .from('player_cards')
    .select('*')
    .eq('player_id', playerId)
    .order('card_type', { ascending: true });

  if (error) {
    return [];
  }

  return cards || [];
};

export const addCard = async (
  playerId: string,
  cardType: CardType,
  quantity: number = 1
): Promise<{ success: boolean; error?: string }> => {
  const { data: existingCard, error: fetchError } = await supabase
    .from('player_cards')
    .select('*')
    .eq('player_id', playerId)
    .eq('card_type', cardType)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (existingCard) {
    const { error: updateError } = await supabase
      .from('player_cards')
      .update({ quantity: existingCard.quantity + quantity })
      .eq('id', existingCard.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
  } else {
    const { error: insertError } = await supabase
      .from('player_cards')
      .insert({
        player_id: playerId,
        card_type: cardType,
        quantity,
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  return { success: true };
};
