import { Player, CalculatedStats } from '../types/game';
import { checkEncounter } from '../utils/calculations';

interface PatrolScreenProps {
  player: Player;
  stats: CalculatedStats;
  isLocked: boolean;
  onStartPatrol: () => void;
  onHapticFeedback: () => void;
}

export function PatrolScreen({ stats, isLocked, onStartPatrol, onHapticFeedback }: PatrolScreenProps) {
  const handlePatrol = () => {
    if (stats.stamina.current < 5) {
      return;
    }

    onHapticFeedback();

    const hasEncounter = checkEncounter(stats.luck.value - 10);

    if (hasEncounter) {
      onStartPatrol();
    }
  };

  if (isLocked) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pb-20 items-center justify-center px-8">
        <div className="text-center space-y-6">
          <div className="text-8xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold text-amber-400">Patrol Locked</h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Allocate Ability Points first to awaken Leon's strength and unlock the Patrol feature.
          </p>
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-amber-900">
            <p className="text-gray-400">
              Visit the <span className="text-amber-400 font-bold">Abilities</span> tab and invest at least 1 point to unlock this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const canPatrol = stats.stamina.current >= 5;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pb-20">
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-amber-400 text-center mb-2">Patrol</h1>
        <p className="text-center text-gray-300">
          Venture into the wilderness to find enemies and gain rewards
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-900">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">💪</span>
              <div>
                <h3 className="text-lg font-bold text-white">Stamina</h3>
                <p className="text-sm text-gray-400">Required for patrolling</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.floor(stats.stamina.current)} / {stats.stamina.max}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(stats.stamina.current / stats.stamina.max) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-900">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">🍀</span>
              <div>
                <h3 className="text-lg font-bold text-white">Encounter Chance</h3>
                <p className="text-sm text-gray-400">Chance to find enemies</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {(stats.luck.encounterChance * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <button
          onClick={handlePatrol}
          disabled={!canPatrol}
          className={`w-full max-w-md py-5 rounded-xl text-xl font-bold transition-all ${
            canPatrol
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 active:scale-95'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canPatrol ? '⚔️ Start Patrol' : '❌ Insufficient Stamina'}
        </button>

        <div className="text-center space-y-2">
          <p className="text-gray-400 text-sm">
            Cost: <span className="text-green-400 font-semibold">5 Stamina</span>
          </p>
          <p className="text-gray-400 text-sm">
            Higher Luck = Better encounter chances!
          </p>
        </div>
      </div>
    </div>
  );
}
