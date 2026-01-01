import { useState, useEffect } from 'react';
import { Player, CalculatedStats } from '../types/game';
import { getLeonAppearanceForLevel, getLeonTierName, calculateExpRequired } from '../utils/calculations';
import { supabase } from '../lib/supabase';

interface EventLog {
  id: string;
  event_type: string;
  message: string;
  created_at: string;
}

interface MainTapScreenProps {
  player: Player;
  stats: CalculatedStats;
  healthRegenTime: number;
  staminaRegenTime: number;
  onPatrol: (expGained: number) => void;
  onEncounter: () => void;
  onHapticFeedback: () => void;
  onLogout?: () => void;
}

const PATROL_STAMINA_COST = 1;
const PATROL_EXP_REWARD = 1;
const ENCOUNTER_CHANCE = 0.15;

export function MainTapScreen({ player, stats, healthRegenTime, staminaRegenTime, onPatrol, onEncounter, onHapticFeedback, onLogout }: MainTapScreenProps) {
  const [tapAnimations, setTapAnimations] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);

  const leonImage = getLeonAppearanceForLevel(player.level);
  const tierName = getLeonTierName(player.level);
  const expRequired = calculateExpRequired(player.level);
  const expProgress = (player.current_exp / expRequired) * 100;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  useEffect(() => {
    loadEventLogs();
  }, [player.id]);

  const loadEventLogs = async () => {
    const { data } = await supabase
      .from('event_logs')
      .select('*')
      .eq('player_id', player.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setEventLogs(data);
    }
  };

  const addEventLog = async (eventType: string, message: string) => {
    await supabase.from('event_logs').insert({
      player_id: player.id,
      event_type: eventType,
      message: message
    });
    await loadEventLogs();
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stats.stamina.current < PATROL_STAMINA_COST) {
      return;
    }

    onHapticFeedback();

    const encounterRoll = Math.random();
    if (encounterRoll < ENCOUNTER_CHANCE && player.has_allocated_points) {
      addEventLog('encounter', 'Encountered a monster while patrolling!');
      onEncounter();
      return;
    }

    onPatrol(PATROL_EXP_REWARD);
    addEventLog('patrol', `Uneventful patrol. Gained ${PATROL_EXP_REWARD} EXP.`);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const animationId = Date.now() + Math.random();
    setTapAnimations((prev) => [...prev, { id: animationId, x, y }]);

    setTimeout(() => {
      setTapAnimations((prev) => prev.filter((anim) => anim.id !== animationId));
    }, 1000);
  };

  const canPatrol = stats.stamina.current >= PATROL_STAMINA_COST;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pb-20">
      <div className="flex flex-col items-center px-4 py-6 space-y-4">
        <div className="text-center relative w-full">
          <h1 className="text-3xl font-bold text-amber-400">Leon & the Black Lion Club</h1>
          <p className="text-lg text-gray-300 mt-1">Yojimbo</p>
          {onLogout && (
            <button
              onClick={onLogout}
              className="absolute top-0 right-0 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          )}
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
          className={`relative cursor-pointer active:scale-95 transition-transform select-none ${!canPatrol ? 'opacity-50' : ''}`}
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
              +{PATROL_EXP_REWARD}
            </div>
          ))}
        </div>

        <p className="text-gray-400 text-sm mt-4 text-center">
          {canPatrol ? 'Tap Leon to Patrol' : 'Not enough stamina to patrol'}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Costs {PATROL_STAMINA_COST} Stamina • Gain {PATROL_EXP_REWARD} EXP
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
            {stats.health.current < stats.health.max && (
              <div className="text-xs text-gray-500 mt-1">
                +1 in {formatTime(healthRegenTime)}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-3 border border-green-900">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-green-400">💪</span>
              <span className="text-gray-400">Stamina</span>
            </div>
            <div className="text-white font-bold">
              {Math.floor(stats.stamina.current)} / {stats.stamina.max}
            </div>
            {stats.stamina.current < stats.stamina.max && (
              <div className="text-xs text-gray-500 mt-1">
                +1 in {formatTime(staminaRegenTime)}
              </div>
            )}
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

        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <h3 className="text-gray-300 font-semibold mb-2 text-sm">Event Log</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {eventLogs.length === 0 ? (
              <p className="text-gray-500 text-xs">No events yet. Start patrolling!</p>
            ) : (
              eventLogs.map((log) => (
                <div key={log.id} className="text-xs text-gray-400 border-b border-gray-700 pb-1">
                  {log.message}
                </div>
              ))
            )}
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
