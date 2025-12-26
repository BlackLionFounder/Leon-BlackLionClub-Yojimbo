import { useState, useEffect } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { useGameState } from './hooks/useGameState';
import { GameTab, Monster } from './types/game';
import { generateMonster } from './data/monsters';
import { MainTapScreen } from './components/MainTapScreen';
import { AbilitiesScreen } from './components/AbilitiesScreen';
import { PatrolScreen } from './components/PatrolScreen';
import { CombatScreen } from './components/CombatScreen';
import { FriendsScreen } from './components/FriendsScreen';
import { EarnScreen } from './components/EarnScreen';
import { Navigation } from './components/Navigation';
import { SpiralTransition } from './components/SpiralTransition';

function App() {
  const { user, hapticFeedback } = useTelegram();
  const telegramId = user?.id?.toString() || null;

  const {
    player,
    stats,
    calculatedStats,
    loading,
    error,
    addExp,
    addCoins,
    investAbilityPoint,
    updateCurrentStat
  } = useGameState(telegramId);

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

    const staminaInterval = setInterval(() => {
      if (calculatedStats && stats && calculatedStats.stamina.current < calculatedStats.stamina.max) {
        const newStamina = Math.min(
          calculatedStats.stamina.current + calculatedStats.stamina.regenRate,
          calculatedStats.stamina.max
        );
        updateCurrentStat('stamina_current', newStamina);
      }
    }, 60000);

    const healthInterval = setInterval(() => {
      if (calculatedStats && stats && calculatedStats.health.current < calculatedStats.health.max) {
        const newHealth = Math.min(
          calculatedStats.health.current + calculatedStats.health.regenRate,
          calculatedStats.health.max
        );
        updateCurrentStat('health_current', newHealth);
      }
    }, 3600000);

    return () => {
      clearInterval(energyInterval);
      clearInterval(staminaInterval);
      clearInterval(healthInterval);
    };
  }, [calculatedStats, stats, updateCurrentStat]);

  const handleTap = async (expGained: number, energyConsumed: number) => {
    if (!calculatedStats) return;

    await addExp(expGained);
    const newEnergy = Math.max(0, calculatedStats.energy.current - energyConsumed);
    await updateCurrentStat('energy_current', newEnergy);
  };

  const handleInvestPoint = async (statName: any) => {
    await investAbilityPoint(statName);
  };

  const handleStartPatrol = () => {
    if (!player || !calculatedStats) return;

    const newStamina = Math.max(0, calculatedStats.stamina.current - 5);
    updateCurrentStat('stamina_current', newStamina);

    const monster = generateMonster(player.level);
    setCurrentMonster(monster);
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    setIsInCombat(true);
  };

  const handleCombatEnd = async (
    outcome: 'victory' | 'defeat' | 'fled',
    expGained: number,
    coinsGained: number,
    _itemsGained: Array<{ itemType: string; quantity: number }>
  ) => {
    if (outcome === 'victory') {
      await addExp(expGained);
      await addCoins(coinsGained);
    } else if (outcome === 'defeat') {
      await addExp(expGained);
      const newHealth = Math.max(1, calculatedStats!.health.current);
      await updateCurrentStat('health_current', newHealth);
    }

    setIsInCombat(false);
    setCurrentMonster(null);
    setActiveTab('main');
  };

  const handleTabChange = (tab: GameTab) => {
    if (tab === 'patrol' && player && !player.has_allocated_points) {
      return;
    }
    hapticFeedback.selection();
    setActiveTab(tab);
  };

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
        monster={currentMonster}
        onCombatEnd={handleCombatEnd}
        onHapticFeedback={hapticFeedback.medium}
      />
    );
  }

  return (
    <div className="h-screen bg-gray-900 overflow-hidden">
      {activeTab === 'main' && (
        <MainTapScreen
          player={player}
          stats={calculatedStats}
          onTap={handleTap}
          onHapticFeedback={hapticFeedback.light}
        />
      )}

      {activeTab === 'patrol' && (
        <PatrolScreen
          player={player}
          stats={calculatedStats}
          isLocked={!player.has_allocated_points}
          onStartPatrol={handleStartPatrol}
          onHapticFeedback={hapticFeedback.medium}
        />
      )}

      {activeTab === 'abilities' && (
        <AbilitiesScreen
          player={player}
          stats={stats}
          calculatedStats={calculatedStats}
          onInvest={handleInvestPoint}
          onHapticFeedback={hapticFeedback.light}
        />
      )}

      {activeTab === 'earn' && <EarnScreen />}

      {activeTab === 'friends' && <FriendsScreen player={player} />}

      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isPatrolLocked={!player.has_allocated_points}
      />
    </div>
  );
}

export default App;
