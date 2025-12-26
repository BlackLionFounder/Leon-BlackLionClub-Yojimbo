import { Monster } from '../types/game';

export const MONSTER_TEMPLATES: Omit<Monster, 'id' | 'level' | 'health' | 'maxHealth' | 'strength' | 'speed' | 'expReward' | 'coinReward'>[] = [
  {
    name: 'Feral Wolf',
    type: 'feral_wolf',
    imagePath: '/images/monsters/feral-wolf.png',
    dropTable: [
      { itemType: 'health_potion', dropChance: 0.3, quantity: 1 },
      { itemType: 'coin_boost', dropChance: 0.1, quantity: 1 }
    ]
  },
  {
    name: 'Mountain Bandit',
    type: 'mountain_bandit',
    imagePath: '/images/monsters/mountain-bandit.png',
    dropTable: [
      { itemType: 'stamina_potion', dropChance: 0.3, quantity: 1 },
      { itemType: 'exp_boost', dropChance: 0.15, quantity: 1 }
    ]
  },
  {
    name: 'Demon Ronin',
    type: 'demon_ronin',
    imagePath: '/images/monsters/demon-ronin.png',
    dropTable: [
      { itemType: 'energy_potion', dropChance: 0.25, quantity: 1 },
      { itemType: 'health_potion', dropChance: 0.25, quantity: 2 },
      { itemType: 'exp_boost', dropChance: 0.2, quantity: 1 }
    ]
  },
  {
    name: 'Shadow Assassin',
    type: 'shadow_assassin',
    imagePath: '/images/monsters/shadow-assassin.png',
    dropTable: [
      { itemType: 'stamina_potion', dropChance: 0.35, quantity: 1 },
      { itemType: 'coin_boost', dropChance: 0.15, quantity: 1 }
    ]
  },
  {
    name: 'Cursed Samurai',
    type: 'cursed_samurai',
    imagePath: '/images/monsters/cursed-samurai.png',
    dropTable: [
      { itemType: 'health_potion', dropChance: 0.4, quantity: 2 },
      { itemType: 'energy_potion', dropChance: 0.3, quantity: 1 },
      { itemType: 'exp_boost', dropChance: 0.25, quantity: 1 }
    ]
  },
  {
    name: 'Oni Warlord',
    type: 'oni_warlord',
    imagePath: '/images/monsters/oni-warlord.png',
    dropTable: [
      { itemType: 'rejuvenation_potion', dropChance: 0.05, quantity: 1 },
      { itemType: 'health_potion', dropChance: 0.5, quantity: 3 },
      { itemType: 'exp_boost', dropChance: 0.3, quantity: 2 }
    ]
  }
];

export function generateMonster(playerLevel: number): Monster {
  const template = MONSTER_TEMPLATES[Math.floor(Math.random() * MONSTER_TEMPLATES.length)];

  const monsterLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1);

  const baseHealth = 20 + (monsterLevel * 5);
  const baseStrength = 8 + Math.floor(monsterLevel * 1.2);
  const baseSpeed = 8 + Math.floor(monsterLevel * 0.8);
  const expReward = Math.floor(5 + (monsterLevel * 2.5));
  const coinReward = Math.floor(10 + (monsterLevel * 3));

  return {
    id: `${template.type}_${Date.now()}_${Math.random()}`,
    name: template.name,
    type: template.type,
    level: monsterLevel,
    health: baseHealth,
    maxHealth: baseHealth,
    strength: baseStrength,
    speed: baseSpeed,
    expReward,
    coinReward,
    imagePath: template.imagePath,
    dropTable: template.dropTable
  };
}
