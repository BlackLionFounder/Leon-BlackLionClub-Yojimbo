import { useState } from 'react';
import { Player, CalculatedStats } from '../types/game';
import { getLeonAppearanceForLevel, getLeonTierName, calculateExpRequired } from '../utils/calculations';
import { TAP_ENERGY_COST, TAP_EXP_REWARD } from '../data/constants';

interface MainTapScreenProps {
  player: Player;
  stats: CalculatedStats;
  onTap: (expGained: number, energyConsumed: number) => void;
  onHapticFeedback: () => void;
}

export function MainTapScreen({ player, stats, onTap, onHapticFeedback }: MainTapScreenProps) {
  const [tapAnimations, setTapAnimations] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const leonImage = getLeonAppearanceForLevel(player.level);
  const tierName = getLeonTierName(player.level);
  const expRequired = calculateExpRequired(player.level);
  const expProgress = (player.current_exp / expRequired) * 100;

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stats.energy.current < TAP_ENERGY_COST) {
      return;
    }

    onHapticFeedback();
    onTap(TAP_EXP_REWARD, TAP_ENERGY_COST);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const animationId = Date.now() + Math.random();
    setTapAnimations((prev) => [...prev, { id: animationId, x, y }]);

    setTimeout(() => {
      setTapAnimations((prev) => prev.filter((anim) => anim.id !== animationId));
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pb-20">
      <div className="flex flex-col items-center px-4 py-6 space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-400">Leon & the Black Lion Club</h1>
          <p className="text-lg text-gray-300 mt-1">Yojimbo</p>
        </div>

        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Level {player.level}</span>
            <span className="text-amber-400 font-semibold">{tierName}</span>
            <span className="text-gray-400">
              {player.current_exp.toFixed(1)} / {expRequired} EXP
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-300"
              style={{ width: `${Math.min(100, expProgress)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="font-bold text-yellow-400">{Math.floor(player.coins)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="font-bold text-blue-400">{player.unspent_ability_points} AP</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div
          onClick={handleTap}
          className="relative cursor-pointer active:scale-95 transition-transform select-none"
          style={{ touchAction: 'manipulation' }}
        >
          <img
            src={leonImage}
            alt="Leon"
            className="w-64 h-64 object-contain drop-shadow-2xl"
            draggable={false}
          />

          {tapAnimations.map((anim) => (
            <div
              key={anim.id}
              className="absolute pointer-events-none text-amber-400 font-bold text-xl animate-float-up"
              style={{ left: anim.x, top: anim.y }}
            >
              +{TAP_EXP_REWARD}
            </div>
          ))}
        </div>

        <p className="text-gray-400 text-sm mt-4 text-center">
          Tap Leon to train and gain experience
        </p>
      </div>

      <div className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-gray-800 rounded-lg p-3 border border-red-900">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-red-400">❤️</span>
              <span className="text-gray-400">Health</span>
            </div>
            <div className="text-white font-bold">
              {Math.floor(stats.health.current)} / {stats.health.max}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 border border-green-900">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-green-400">💪</span>
              <span className="text-gray-400">Stamina</span>
            </div>
            <div className="text-white font-bold">
              {Math.floor(stats.stamina.current)} / {stats.stamina.max}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 border border-blue-900">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-blue-400">⚡</span>
              <span className="text-gray-400">Energy</span>
            </div>
            <div className="text-white font-bold">
              {Math.floor(stats.energy.current)} / {stats.energy.max}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
        .animate-float-up {
          animation: float-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
