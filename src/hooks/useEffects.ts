import { useState, useEffect } from 'react';
import {
  getActiveEffects,
  getPlayerCards,
  getCurrentMultiplier,
  activateCard,
  cleanupExpiredEffects,
  ActiveEffect,
  PlayerCard,
  CardType,
  EffectType,
} from '../utils/effectsManager';

export const useEffects = (playerId: string | null) => {
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [playerCards, setPlayerCards] = useState<PlayerCard[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);

  const refreshEffects = async () => {
    if (!playerId) return;

    await cleanupExpiredEffects(playerId);
    const effects = await getActiveEffects(playerId);
    const multiplier = await getCurrentMultiplier(playerId);

    setActiveEffects(effects);
    setCurrentMultiplier(multiplier);
  };

  const refreshCards = async () => {
    if (!playerId) return;

    const cards = await getPlayerCards(playerId);
    setPlayerCards(cards);
  };

  const useCard = async (cardType: CardType, effectType: EffectType = 'xp_multiplier') => {
    if (!playerId) return { success: false, error: 'No player ID' };

    setLoading(true);
    const result = await activateCard(playerId, cardType, effectType);

    if (result.success) {
      await refreshEffects();
      await refreshCards();
    }

    setLoading(false);
    return result;
  };

  useEffect(() => {
    if (!playerId) return;

    refreshEffects();
    refreshCards();

    const interval = setInterval(() => {
      refreshEffects();
    }, 30000);

    return () => clearInterval(interval);
  }, [playerId]);

  return {
    activeEffects,
    playerCards,
    currentMultiplier,
    loading,
    useCard,
    refreshEffects,
    refreshCards,
  };
};
