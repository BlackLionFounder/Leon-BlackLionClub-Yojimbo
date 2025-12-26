import { Player, PlayerStats, CalculatedStats } from '../types/game';

interface AbilitiesScreenProps {
  player: Player;
  stats: PlayerStats;
  calculatedStats: CalculatedStats;
  onInvest: (stat: keyof Omit<PlayerStats, 'player_id' | 'health_base' | 'stamina_base' | 'energy_base' | 'health_current' | 'stamina_current' | 'energy_current'>) => void;
  onHapticFeedback: () => void;
}

interface StatRowProps {
  icon: string;
  name: string;
  description: string;
  invested: number;
  effectValue: string;
  onInvest: () => void;
  canInvest: boolean;
  color: string;
}

function StatRow({ icon, name, description, invested, effectValue, onInvest, canInvest, color }: StatRowProps) {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 border-2 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-bold text-white text-lg">{name}</h3>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        <button
          onClick={onInvest}
          disabled={!canInvest}
          className={`w-10 h-10 rounded-full text-xl font-bold ${
            canInvest
              ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          } transition-all`}
        >
          +
        </button>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Invested: <span className="text-white font-semibold">{invested}</span></span>
        <span className="text-amber-400 font-semibold">{effectValue}</span>
      </div>
    </div>
  );
}

export function AbilitiesScreen({ player, stats, calculatedStats, onInvest, onHapticFeedback }: AbilitiesScreenProps) {
  const canInvest = player.unspent_ability_points > 0;

  const handleInvest = (stat: keyof Omit<PlayerStats, 'player_id' | 'health_base' | 'stamina_base' | 'energy_base' | 'health_current' | 'stamina_current' | 'energy_current'>) => {
    if (canInvest) {
      onHapticFeedback();
      onInvest(stat);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pb-20 overflow-y-auto">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 z-10 px-4 py-6">
        <h1 className="text-3xl font-bold text-amber-400 text-center mb-2">Abilities</h1>
        <p className="text-center text-gray-300 mb-4">Allocate your ability points to strengthen Leon</p>

        <div className="bg-gray-800 rounded-lg p-4 border-2 border-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Unspent Ability Points</span>
            <span className="text-3xl font-bold text-amber-400">{player.unspent_ability_points}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <StatRow
          icon="❤️"
          name="Health"
          description="Max HP & regen rate"
          invested={stats.health_invested}
          effectValue={`Max: ${calculatedStats.health.max} | Regen: +${calculatedStats.health.regenRate}/hr`}
          onInvest={() => handleInvest('health_invested')}
          canInvest={canInvest}
          color="border-red-900"
        />

        <StatRow
          icon="💪"
          name="Stamina"
          description="Sustain actions longer"
          invested={stats.stamina_invested}
          effectValue={`Max: ${calculatedStats.stamina.max} | Regen: +${calculatedStats.stamina.regenRate}/min`}
          onInvest={() => handleInvest('stamina_invested')}
          canInvest={canInvest}
          color="border-green-900"
        />

        <StatRow
          icon="⚡"
          name="Energy"
          description="Power for taps & patrols"
          invested={stats.energy_invested}
          effectValue={`Max: ${calculatedStats.energy.max} | Regen: +${calculatedStats.energy.regenRate}/sec`}
          onInvest={() => handleInvest('energy_invested')}
          canInvest={canInvest}
          color="border-blue-900"
        />

        <StatRow
          icon="⚔️"
          name="Strength"
          description="Attack damage power"
          invested={stats.strength_invested}
          effectValue={`Damage: ${calculatedStats.strength.minDamage}-${calculatedStats.strength.maxDamage}`}
          onInvest={() => handleInvest('strength_invested')}
          canInvest={canInvest}
          color="border-orange-900"
        />

        <StatRow
          icon="💨"
          name="Speed"
          description="Attack frequency & initiative"
          invested={stats.speed_invested}
          effectValue={`${calculatedStats.speed.attacksPerSecond.toFixed(1)} attacks/sec`}
          onInvest={() => handleInvest('speed_invested')}
          canInvest={canInvest}
          color="border-cyan-900"
        />

        <StatRow
          icon="🍀"
          name="Luck"
          description="Crits, drops & encounters"
          invested={stats.luck_invested}
          effectValue={`Crit: ${(calculatedStats.luck.critChance * 100).toFixed(1)}% | Encounter: ${(calculatedStats.luck.encounterChance * 100).toFixed(1)}%`}
          onInvest={() => handleInvest('luck_invested')}
          canInvest={canInvest}
          color="border-purple-900"
        />

        {!player.has_allocated_points && (
          <div className="bg-amber-900 bg-opacity-30 border-2 border-amber-600 rounded-lg p-4 text-center">
            <p className="text-amber-300 font-semibold">
              ⚠️ Allocate at least 1 ability point to unlock the Patrol tab!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
