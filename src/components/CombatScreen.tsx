import { useState, useEffect } from 'react';
import { Monster, CalculatedStats, Player } from '../types/game';
import { CombatManager } from '../utils/combatManager';
import { getLeonAppearanceForLevel } from '../utils/calculations';

interface CombatScreenProps {
  player: Player;
  stats: CalculatedStats;
  monster: Monster;
  onCombatEnd: (outcome: 'victory' | 'defeat' | 'fled', expGained: number, coinsGained: number, itemsGained: Array<{ itemType: string; quantity: number }>, healthAfter: number, energyAfter: number) => void;
  onHapticFeedback: () => void;
}

export function CombatScreen({ player, stats, monster, onCombatEnd, onHapticFeedback }: CombatScreenProps) {
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [playerHealth, setPlayerHealth] = useState(stats.health.current);
  const [playerEnergy, setPlayerEnergy] = useState(stats.energy.current);
  const [monsterHealth, setMonsterHealth] = useState(monster.health);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [combatManager] = useState(() => {
    const statsCopy = JSON.parse(JSON.stringify(stats));
    statsCopy.health.current = stats.health.current;
    statsCopy.energy.current = stats.energy.current;
    return new CombatManager(statsCopy, monster, setPlayerHealth, setMonsterHealth, setPlayerEnergy);
  });

  const leonImage = getLeonAppearanceForLevel(player.level);

  useEffect(() => {
    const firstAttacker = combatManager.determineFirstAttacker();
    setIsPlayerTurn(firstAttacker === 'player');

    addLog(`A wild ${monster.name} appears!`);
    addLog(`${firstAttacker === 'player' ? 'Leon' : monster.name} strikes first!`);
  }, []);

  useEffect(() => {
    if (monsterHealth <= 0) {
      handleVictory();
    } else if (playerHealth <= 0) {
      handleDefeat();
    } else if (!isPlayerTurn) {
      setTimeout(executeMonsterTurn, 1000);
    }
  }, [playerHealth, monsterHealth, isPlayerTurn]);

  const addLog = (message: string) => {
    setCombatLog((prev) => [...prev, message].slice(-6));
  };

  const executeMonsterTurn = () => {
    const action = combatManager.monsterAttack();
    addLog(action.message);
    onHapticFeedback();
    setIsPlayerTurn(true);
  };

  const handleAttack = () => {
    if (!isPlayerTurn) return;

    const action = combatManager.playerAttack();
    addLog(action.message);
    onHapticFeedback();
    setIsPlayerTurn(false);
  };

  const handleMagic = () => {
    if (!isPlayerTurn) return;

    const action = combatManager.playerMagic();
    addLog(action.message);
    onHapticFeedback();

    if (action.success) {
      setIsPlayerTurn(false);
    }
  };

  const handleItem = () => {
    if (!isPlayerTurn) return;
    addLog('No items available!');
    onHapticFeedback();
  };

  const handleFlee = () => {
    if (!isPlayerTurn) return;

    const action = combatManager.playerFlee();
    addLog(action.message);
    onHapticFeedback();

    if (action.success) {
      setTimeout(() => {
        onCombatEnd('fled', 0, 0, [], playerHealth, playerEnergy);
      }, 1500);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const handleVictory = () => {
    const items = combatManager.rollForItemDrops();
    addLog(`Victory! Leon defeated ${monster.name}!`);
    addLog(`Gained ${monster.expReward} EXP and ${monster.coinReward} coins!`);

    setTimeout(() => {
      onCombatEnd('victory', monster.expReward, monster.coinReward, items, playerHealth, playerEnergy);
    }, 2000);
  };

  const handleDefeat = () => {
    const expLoss = Math.floor(player.total_exp * 0.1);
    addLog('Leon has been defeated!');
    addLog(`Lost ${expLoss} EXP...`);

    setTimeout(() => {
      onCombatEnd('defeat', -expLoss, 0, [], playerHealth, playerEnergy);
    }, 2000);
  };

  const playerHealthPercent = (playerHealth / stats.health.max) * 100;
  const monsterHealthPercent = (monsterHealth / monster.maxHealth) * 100;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-red-950 to-gray-900 pb-20">
      <div className="px-4 py-4 bg-gray-900 border-b border-red-900">
        <h2 className="text-2xl font-bold text-center text-red-400">⚔️ Combat ⚔️</h2>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="flex flex-col items-center">
            <div className="text-sm text-amber-400 font-bold mb-2">Leon (Lv.{player.level})</div>
            <img
              src={leonImage}
              alt="Leon"
              className="w-32 h-32 object-contain mb-2"
            />
            <div className="w-full space-y-2">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>HP</span>
                  <span>{Math.floor(playerHealth)} / {stats.health.max}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                    style={{ width: `${Math.max(0, playerHealthPercent)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Energy</span>
                  <span>{Math.floor(playerEnergy)} / {stats.energy.max}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                    style={{ width: `${Math.max(0, (playerEnergy / stats.energy.max) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-sm text-red-400 font-bold mb-2">{monster.name} (Lv.{monster.level})</div>
            <img
              src={monster.imagePath}
              alt={monster.name}
              className="w-32 h-32 object-contain mb-2 transform scale-x-[-1]"
            />
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>HP</span>
                <span>{Math.floor(monsterHealth)} / {monster.maxHealth}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all"
                  style={{ width: `${Math.max(0, monsterHealthPercent)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 flex-1 min-h-0">
          <div className="bg-gray-800 rounded-lg p-3 h-32 overflow-y-auto border border-gray-700">
            {combatLog.map((log, index) => (
              <div key={index} className="text-sm text-gray-300 mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAttack}
              disabled={!isPlayerTurn}
              className={`py-4 rounded-lg font-bold text-lg transition-all ${
                isPlayerTurn
                  ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              ⚔️ Attack
            </button>

            <button
              onClick={handleMagic}
              disabled={!isPlayerTurn}
              className={`py-4 rounded-lg font-bold text-lg transition-all ${
                isPlayerTurn
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              ✨ Magic
            </button>

            <button
              onClick={handleItem}
              disabled={!isPlayerTurn}
              className={`py-4 rounded-lg font-bold text-lg transition-all ${
                isPlayerTurn
                  ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              🎒 Item
            </button>

            <button
              onClick={handleFlee}
              disabled={!isPlayerTurn}
              className={`py-4 rounded-lg font-bold text-lg transition-all ${
                isPlayerTurn
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700 active:scale-95'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              🏃 Flee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
