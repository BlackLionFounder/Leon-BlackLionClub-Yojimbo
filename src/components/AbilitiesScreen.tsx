import { Player, PlayerStats, CalculatedStats } from '../types/game';
import { useEffects } from '../hooks/useEffects';
import { CardType } from '../utils/effectsManager';

interface AbilitiesScreenProps {
  player: Player;
  stats: PlayerStats;
  calculatedStats: CalculatedStats;
  onInvest: (stat: keyof Omit<PlayerStats, 'player_id' | 'health_base' | 'stamina_base' | 'energy_base' | 'health_current' | 'stamina_current' | 'energy_current'>) => void;
  onReset: () => void;
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

export function AbilitiesScreen({ player, stats, calculatedStats, onInvest, onReset, onHapticFeedback }: AbilitiesScreenProps) {
  const canInvest = player.unspent_ability_points > 0;
  const totalInvested = stats.health_invested + stats.stamina_invested + stats.energy_invested + stats.strength_invested + stats.speed_invested + stats.luck_invested;
  const canReset = totalInvested > 0;

  const { playerCards, activeEffects, useCard, loading } = useEffects(player.id);

  const handleInvest = (stat: keyof Omit<PlayerStats, 'player_id' | 'health_base' | 'stamina_base' | 'energy_base' | 'health_current' | 'stamina_current' | 'energy_current'>) => {
    if (canInvest) {
      onHapticFeedback();
      onInvest(stat);
    }
  };

  const handleReset = () => {
    if (canReset) {
      onHapticFeedback();
      onReset();
    }
  };

  const handleUseCard = async (cardType: CardType) => {
    onHapticFeedback();
    await useCard(cardType);
  };

  const getCardMultiplier = (cardType: CardType): number => {
    const multipliers: Record<CardType, number> = {
      single: 1,
      double: 2,
      triple: 3,
      quadruple: 4,
      quintuple: 5,
      lucky_draw: 1,
    };
    return multipliers[cardType];
  };

  const getCardIcon = (cardType: CardType): string => {
    const icons: Record<CardType, string> = {
      single: '1️⃣',
      double: '2️⃣',
      triple: '3️⃣',
      quadruple: '4️⃣',
      quintuple: '5️⃣',
      lucky_draw: '🍀',
    };
    return icons[cardType];
  };

  const getCardName = (cardType: CardType): string => {
    const names: Record<CardType, string> = {
      single: 'Single',
      double: 'Double',
      triple: 'Triple',
      quadruple: 'Quadruple',
      quintuple: 'Quintuple',
      lucky_draw: 'Lucky Draw',
    };
    return names[cardType];
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;

    if (diff <= 0) return '0m';

    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pb-20 overflow-y-auto">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 z-10 px-4 py-6">
        <h1 className="text-3xl font-bold text-amber-400 text-center mb-2">Abilities</h1>
        <p className="text-center text-gray-300 mb-4">Allocate your ability points to strengthen Leon</p>

        <div className="bg-gray-800 rounded-lg p-4 border-2 border-amber-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300">Unspent Ability Points</span>
            <span className="text-3xl font-bold text-amber-400">{player.unspent_ability_points}</span>
          </div>
          <button
            onClick={handleReset}
            disabled={!canReset}
            className={`w-full py-2 rounded-lg font-bold transition-all ${
              canReset
                ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Reset All Points
          </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-yellow-600">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">Boost Cards</h2>

          {activeEffects.length > 0 && (
            <div className="mb-4 p-3 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg">
              <p className="text-green-300 font-semibold mb-2">Active Effects:</p>
              {activeEffects.map((effect) => (
                <div key={effect.id} className="text-sm text-green-200">
                  {effect.effect_type === 'loot_multiplier'
                    ? `${effect.multiplier}x Loot Quality`
                    : `${effect.multiplier}x XP Multiplier`
                  } - Expires in {formatTimeRemaining(effect.expires_at)}
                </div>
              ))}
            </div>
          )}

          {playerCards.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-3">
              No cards available. Complete quests to earn cards!
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {playerCards.filter(card => card.card_type !== 'lucky_draw').map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleUseCard(card.card_type)}
                    disabled={card.quantity === 0 || loading}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      card.quantity > 0
                        ? 'bg-gray-700 border-yellow-500 hover:bg-gray-600 active:scale-95'
                        : 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-3xl mb-1">{getCardIcon(card.card_type)}</div>
                    <div className="text-white font-bold text-sm">{getCardName(card.card_type)}</div>
                    <div className="text-yellow-400 text-xs">{getCardMultiplier(card.card_type)}x XP</div>
                    <div className="text-gray-400 text-xs mt-1">
                      {card.quantity > 0 ? `x${card.quantity}` : 'None'}
                    </div>
                  </button>
                ))}
              </div>
              {playerCards.some(card => card.card_type !== 'lucky_draw') && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Using a card adds +1 hour to the XP multiplier effect
                </p>
              )}
            </>
          )}
        </div>

        {playerCards.some(card => card.card_type === 'lucky_draw') && (
          <div className="bg-gray-800 rounded-lg p-4 border-2 border-green-600">
            <h2 className="text-xl font-bold text-green-400 mb-3">Lucky Draw Cards</h2>
            <p className="text-sm text-gray-400 mb-3">Increases loot quality and quantity from combat</p>

            <div className="grid grid-cols-2 gap-3">
              {playerCards.filter(card => card.card_type === 'lucky_draw').map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleUseCard(card.card_type)}
                  disabled={card.quantity === 0 || loading}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    card.quantity > 0
                      ? 'bg-gray-700 border-green-500 hover:bg-gray-600 active:scale-95'
                      : 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-3xl mb-1">{getCardIcon(card.card_type)}</div>
                  <div className="text-white font-bold text-sm">{getCardName(card.card_type)}</div>
                  <div className="text-green-400 text-xs">+Loot</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {card.quantity > 0 ? `x${card.quantity}` : 'None'}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Using a card adds +1 hour to the loot boost effect
            </p>
          </div>
        )}

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
          effectValue={`${calculatedStats.speed.value} speed (${Math.floor(calculatedStats.speed.value / 10)} attacks/turn)`}
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
