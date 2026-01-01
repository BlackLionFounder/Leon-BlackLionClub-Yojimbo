import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Player } from '../types/game';

interface DemoControlsProps {
  player: Player;
  onAddExp: (amount: number) => void;
  onSpawnBattle: () => void;
  onRefresh: () => void;
}

export function DemoControls({ player, onAddExp, onSpawnBattle, onRefresh }: DemoControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetToLevel1 = async () => {
    if (!confirm('Reset all progress to Level 1? This cannot be undone!')) {
      return;
    }

    setIsResetting(true);

    try {
      await supabase.from('players').update({
        level: 1,
        current_exp: 0,
        total_exp: 0,
        coins: 0,
        unspent_ability_points: 0,
        total_ability_points_earned: 0,
        has_allocated_points: false,
        updated_at: new Date().toISOString()
      }).eq('id', player.id);

      await supabase.from('player_stats').update({
        health_invested: 0,
        stamina_invested: 0,
        energy_invested: 0,
        strength_invested: 0,
        speed_invested: 0,
        luck_invested: 0,
        health_current: 10,
        stamina_current: 10,
        energy_current: 10
      }).eq('player_id', player.id);

      await supabase.from('event_logs').insert({
        player_id: player.id,
        event_type: 'admin',
        message: 'Game reset to Level 1 by demo controls.'
      });

      onRefresh();
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Reset failed. Check console for details.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm mb-2 w-full"
      >
        {isExpanded ? 'Hide Demo' : 'Demo Controls'}
      </button>

      {isExpanded && (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-4 border-2 border-orange-600 space-y-2 w-48">
          <h3 className="text-white font-bold text-sm mb-3 text-center border-b border-gray-700 pb-2">
            Demo Panel
          </h3>

          <button
            onClick={handleResetToLevel1}
            disabled={isResetting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
          >
            {isResetting ? 'Resetting...' : 'Reset to Lv1'}
          </button>

          <button
            onClick={() => onAddExp(100)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
          >
            +100 EXP
          </button>

          <button
            onClick={() => onAddExp(1000)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
          >
            +1000 EXP
          </button>

          <button
            onClick={onSpawnBattle}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
          >
            Spawn Battle
          </button>
        </div>
      )}
    </div>
  );
}
