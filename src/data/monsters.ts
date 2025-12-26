import { Monster } from '../types/game';
import { supabase } from '../lib/supabase';

interface MonsterTemplate {
  id: string;
  name: string;
  type: string;
  image_path: string;
  base_health: number;
  base_strength: number;
  base_speed: number;
  exp_reward: number;
  coin_reward: number;
  spawn_rate: number;
  min_player_level: number;
  max_player_level: number | null;
  drop_table: Array<{ itemType: string; dropChance: number; quantity: number }>;
}

export async function generateMonster(playerLevel: number): Promise<Monster> {
  const { data: availableMonsters } = await supabase
    .from('monsters')
    .select('*')
    .lte('min_player_level', playerLevel)
    .or(`max_player_level.is.null,max_player_level.gte.${playerLevel}`)
    .order('spawn_rate', { ascending: false });

  if (!availableMonsters || availableMonsters.length === 0) {
    throw new Error('No monsters available for this level');
  }

  const totalSpawnRate = availableMonsters.reduce((sum: number, m: MonsterTemplate) => sum + m.spawn_rate, 0);
  let random = Math.random() * totalSpawnRate;

  let selectedMonster = availableMonsters[0] as MonsterTemplate;
  for (const monster of availableMonsters as MonsterTemplate[]) {
    random -= monster.spawn_rate;
    if (random <= 0) {
      selectedMonster = monster;
      break;
    }
  }

  const monsterLevel = playerLevel;

  return {
    id: `${selectedMonster.type}_${Date.now()}_${Math.random()}`,
    name: selectedMonster.name,
    type: selectedMonster.type,
    level: monsterLevel,
    health: selectedMonster.base_health,
    maxHealth: selectedMonster.base_health,
    strength: selectedMonster.base_strength,
    speed: selectedMonster.base_speed,
    expReward: selectedMonster.exp_reward,
    coinReward: selectedMonster.coin_reward,
    imagePath: selectedMonster.image_path,
    dropTable: selectedMonster.drop_table
  };
}
