export interface Player {
  id: string;
  telegram_id: string;
  username: string;
  level: number;
  current_exp: number;
  total_exp: number;
  coins: number;
  unspent_ability_points: number;
  total_ability_points_earned: number;
  referral_bonus_points: number;
  referral_count: number;
  rejuvenation_potions: number;
  referred_by: string | null;
  has_allocated_points: boolean;
  combat_wins: number;
  total_taps: number;
  last_health_regen: string;
  last_stamina_regen: string;
  last_energy_regen: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerStats {
  player_id: string;
  health_base: number;
  health_invested: number;
  health_current: number;
  stamina_base: number;
  stamina_invested: number;
  stamina_current: number;
  energy_base: number;
  energy_invested: number;
  energy_current: number;
  strength_invested: number;
  speed_invested: number;
  luck_invested: number;
}

export interface CalculatedStats {
  health: {
    current: number;
    max: number;
    regenRate: number;
  };
  stamina: {
    current: number;
    max: number;
    regenRate: number;
  };
  energy: {
    current: number;
    max: number;
    regenRate: number;
  };
  strength: {
    value: number;
    minDamage: number;
    maxDamage: number;
  };
  speed: {
    value: number;
    attacksPerSecond: number;
  };
  luck: {
    value: number;
    critChance: number;
    encounterChance: number;
  };
}

export interface Monster {
  id: string;
  name: string;
  type: string;
  level: number;
  health: number;
  maxHealth: number;
  strength: number;
  speed: number;
  expReward: number;
  coinReward: number;
  imagePath: string;
  dropTable: ItemDrop[];
}

export interface ItemDrop {
  itemType: string;
  dropChance: number;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  player_id: string;
  item_type: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CombatEncounter {
  id: string;
  player_id: string;
  monster_type: string;
  monster_level: number;
  outcome: 'victory' | 'defeat' | 'fled';
  exp_gained: number;
  coins_gained: number;
  items_gained: Array<{ itemType: string; quantity: number }>;
  duration_seconds: number;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  bonus_granted: boolean;
  created_at: string;
}

export interface CombatAction {
  type: 'attack' | 'magic' | 'item' | 'flee';
  damage?: number;
  isCritical?: boolean;
  success?: boolean;
  message: string;
}

export interface CombatState {
  player: {
    health: number;
    stamina: number;
    energy: number;
    maxHealth: number;
    maxStamina: number;
    maxEnergy: number;
  };
  monster: Monster;
  turn: 'player' | 'monster';
  isActive: boolean;
  log: string[];
}

export type GameTab = 'main' | 'abilities' | 'earn' | 'friends';

export interface LeonAppearance {
  level: number;
  imagePath: string;
  tier: string;
  description: string;
}
