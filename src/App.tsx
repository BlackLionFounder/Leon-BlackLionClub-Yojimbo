import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useTelegram } from './hooks/useTelegram';
import { useGameState } from './hooks/useGameState';
import { GameTab, Monster } from './types/game';
import { generateMonster } from './data/monsters';
import { MainTapScreen } from './components/MainTapScreen';
import { AbilitiesScreen } from './components/AbilitiesScreen';
import { CombatScreen } from './components/CombatScreen';
import { FriendsScreen } from './components/FriendsScreen';
import { EarnScreen } from './components/EarnScreen';
import { Navigation } from './components/Navigation';
import { SpiralTransition } from './components/SpiralTransition';
import { AuthScreen } from './components/AuthScreen';

function App() {
  const { hapticFeedback } = useTelegram();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUserId(session?.user?.id || null);
        setAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUserId(session?.user?.id || null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const {
    player,
    stats,
    calculatedStats,
    inventory,
    loading,
    error,
    healthRegenTime,
    staminaRegenTime,
    addExp,
    addCoins,
    investAbilityPoint,
    updateCurrentStat,
    usePotion,
    resetAbilityPoints
  } = useGameState(userId);

  const [activeTab, setActiveTab] = useState<GameTab>('main');
  const [isInCombat, setIsInCombat] = useState(false);
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    const energyInterval = setInterval(() => {
      if (calculatedStats && stats && calculatedStats.energy.current < calculatedStats.energy.max) {
        const newEnergy = Math.min(
          calculatedStats.energy.current + calculatedStats.energy.regenRate,
          calculatedStats.energy.max
        );
        updateCurrentStat('energy_current', newEnergy);
      }
    }, 1000);

    return () => {
      clearInterval(energyInterval);
    };
  }, [calculatedStats, stats, updateCurrentStat]);

  const handlePatrol = async (expGained: number) => {
    if (!calculatedStats) return;

    await addExp(expGained);
    const newStamina = Math.max(0, calculatedStats.stamina.current - 1);
    await updateCurrentStat('stamina_current', newStamina);
  };

  const handleEncounter = async () => {
    if (!player || !calculatedStats) return;

    if (calculatedStats.health.current <= 0) {
      const restoredHealth = Math.floor(calculatedStats.health.max * 0.25);
      await updateCurrentStat('health_current', restoredHealth);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const monster = await generateMonster(player.level);
    setCurrentMonster(monster);
    setShowTransition(true);
  };

  const handleInvestPoint = async (statName: any) => {
    await investAbilityPoint(statName);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    setIsInCombat(true);
  };

  const handleCombatEnd = async (
    outcome: 'victory' | 'defeat' | 'fled',
    expGained: number,
    coinsGained: number,
    _itemsGained: Array<{ itemType: string; quantity: number }>,
    healthAfter: number,
    energyAfter: number
  ) => {
    if (outcome === 'defeat' && healthAfter <= 0 && calculatedStats) {
      const restoredHealth = Math.max(1, Math.floor(calculatedStats.health.max * 0.25));
      await updateCurrentStat('health_current', restoredHealth);
    } else {
      await updateCurrentStat('health_current', Math.max(0, Math.floor(healthAfter)));
    }

    await updateCurrentStat('energy_current', Math.max(0, Math.floor(energyAfter)));

    if (outcome === 'victory') {
      await addExp(expGained);
      await addCoins(coinsGained);

      if (player && currentMonster) {
        await supabase.from('event_logs').insert({
          player_id: player.id,
          event_type: 'combat_victory',
          message: `Victory! Defeated ${currentMonster.name} (Lv.${currentMonster.level}). Gained ${expGained} EXP and ${coinsGained} coins!`
        });
      }
    } else if (outcome === 'defeat') {
      await addExp(expGained);

      if (player && currentMonster) {
        await supabase.from('event_logs').insert({
          player_id: player.id,
          event_type: 'combat_defeat',
          message: `Defeated by ${currentMonster.name} (Lv.${currentMonster.level}). Lost ${Math.abs(expGained)} EXP. Health restored to 25%.`
        });
      }
    } else if (outcome === 'fled') {
      if (player && currentMonster) {
        await supabase.from('event_logs').insert({
          player_id: player.id,
          event_type: 'combat_fled',
          message: `Fled from ${currentMonster.name} (Lv.${currentMonster.level}).`
        });
      }
    }

    setIsInCombat(false);
    setCurrentMonster(null);
    setActiveTab('main');
  };

  const handleTabChange = (tab: GameTab) => {
    hapticFeedback.selection();
    setActiveTab(tab);
  };

  const handleAuthSuccess = () => {
    setAuthLoading(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🦁</div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🦁</div>
          <p className="text-xl">Loading Leon...</p>
        </div>
      </div>
    );
  }

  if (error || !player || !stats || !calculatedStats) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white px-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl mb-2">Error loading game</p>
          <p className="text-sm text-gray-400">{error || 'Failed to load player data'}</p>
        </div>
      </div>
    );
  }

  if (showTransition) {
    return <SpiralTransition onComplete={handleTransitionComplete} />;
  }

  if (isInCombat && currentMonster) {
    return (
      <CombatScreen
        player={player}
        stats={calculatedStats}
        inventory={inventory}
        monster={currentMonster}
        onCombatEnd={handleCombatEnd}
        onHapticFeedback={hapticFeedback.medium}
        onUsePotion={usePotion}
      />
    );
  }

  return (
    <div className="h-screen bg-gray-900 overflow-hidden">
      {activeTab === 'main' && (
        <MainTapScreen
          player={player}
          stats={calculatedStats}
          healthRegenTime={healthRegenTime}
          staminaRegenTime={staminaRegenTime}
          onPatrol={handlePatrol}
          onEncounter={handleEncounter}
          onHapticFeedback={hapticFeedback.light}
        />
      )}

      {activeTab === 'abilities' && (
        <AbilitiesScreen
          player={player}
          stats={stats}
          calculatedStats={calculatedStats}
          onInvest={handleInvestPoint}
          onReset={resetAbilityPoints}
          onHapticFeedback={hapticFeedback.light}
        />
      )}

      {activeTab === 'earn' && <EarnScreen />}

      {activeTab === 'friends' && <FriendsScreen player={player} />}

      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        unspentPoints={player.unspent_ability_points}
      />
    </div>
  );
}

export default App;
