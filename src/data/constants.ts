import { LeonAppearance } from '../types/game';

export const BASE_STAT_VALUE = 10;

export const BASE_EXP_REQUIREMENT = 10;

export const EXP_MULTIPLIER = 1.5;

export const ABILITY_POINTS_PER_LEVEL = 10;

export const REFERRAL_BONUS_AP = 10;

export const MAX_REFERRAL_BONUSES = 5;

export const MAX_REFERRAL_BONUS_AP = 50;

export const HEALTH_REGEN_INTERVAL_MS = 60 * 60 * 1000;

export const STAMINA_REGEN_INTERVAL_MS = 60 * 1000;

export const ENERGY_REGEN_INTERVAL_MS = 1000;

export const TAP_ENERGY_COST = 1;

export const TAP_EXP_REWARD = 0.5;

export const BASE_ENCOUNTER_CHANCE = 0.1;

export const LUCK_ENCOUNTER_BONUS = 0.01;

export const DEFEAT_EXP_PENALTY = 0.1;

export const LEON_APPEARANCES: LeonAppearance[] = [
  {
    level: 1,
    imagePath: '/images/leon-level-1.png',
    tier: 'Fundoshi',
    description: 'Leon in traditional fundoshi, raw and fierce'
  },
  {
    level: 10,
    imagePath: '/images/leon-level-10.png',
    tier: 'Kosode & Hakama',
    description: 'Leon begins his journey with basic samurai attire'
  },
  {
    level: 20,
    imagePath: '/images/leon-level-20.png',
    tier: 'Light Armor',
    description: 'Leon dons lightweight protective gear'
  },
  {
    level: 30,
    imagePath: '/images/leon-level-30.png',
    tier: 'Medium Armor',
    description: 'Leon wears reinforced samurai armor'
  },
  {
    level: 40,
    imagePath: '/images/leon-level-40.png',
    tier: 'Heavy Armor',
    description: 'Leon fortifies with battle-tested armor'
  },
  {
    level: 50,
    imagePath: '/images/leon-level-50.png',
    tier: 'Elite Armor',
    description: 'Leon achieves veteran samurai status'
  },
  {
    level: 60,
    imagePath: '/images/leon-level-60.png',
    tier: 'Master Armor',
    description: 'Leon masters the art of the blade'
  },
  {
    level: 70,
    imagePath: '/images/leon-level-70.png',
    tier: 'Legendary Armor',
    description: 'Leon becomes a legendary warrior'
  },
  {
    level: 80,
    imagePath: '/images/leon-sengoku.png',
    tier: 'Sengoku Tosei-Gusoku',
    description: 'Leon wields the full Sengoku-era armor with menpo and yari'
  },
  {
    level: 90,
    imagePath: '/images/leon-angel.png',
    tier: 'Angel Tier',
    description: 'Leon ascends with majestic angel wings'
  },
  {
    level: 100,
    imagePath: '/images/leon-cherub.png',
    tier: 'Cherub Tier',
    description: 'Leon transcends with four divine faces: lion, eagle, ox, and human'
  }
];

export const ITEM_TYPES = {
  HEALTH_POTION: 'health_potion',
  STAMINA_POTION: 'stamina_potion',
  ENERGY_POTION: 'energy_potion',
  REJUVENATION_POTION: 'rejuvenation_potion',
  EXP_BOOST: 'exp_boost',
  COIN_BOOST: 'coin_boost'
} as const;

export const COMBAT_ACTIONS = {
  ATTACK: 'attack',
  MAGIC: 'magic',
  ITEM: 'item',
  FLEE: 'flee'
} as const;
