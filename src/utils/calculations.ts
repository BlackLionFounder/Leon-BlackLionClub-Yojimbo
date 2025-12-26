import { PlayerStats, CalculatedStats } from '../types/game';
import {
  BASE_STAT_VALUE,
  BASE_EXP_REQUIREMENT,
  EXP_MULTIPLIER,
  BASE_ENCOUNTER_CHANCE,
  LUCK_ENCOUNTER_BONUS
} from '../data/constants';

export function calculateStats(stats: PlayerStats): CalculatedStats {
  const healthMax = stats.health_base + stats.health_invested;
  const healthRegen = BASE_STAT_VALUE + stats.health_invested;

  const staminaMax = stats.stamina_base + stats.stamina_invested;
  const staminaRegen = BASE_STAT_VALUE + stats.stamina_invested;

  const energyMax = stats.energy_base + stats.energy_invested;
  const energyRegen = BASE_STAT_VALUE + stats.energy_invested;

  const strengthValue = BASE_STAT_VALUE + stats.strength_invested;
  const minDamage = Math.max(1, strengthValue - 5);
  const maxDamage = strengthValue;

  const speedValue = BASE_STAT_VALUE + stats.speed_invested;
  const attacksPerSecond = speedValue / 10;

  const luckValue = BASE_STAT_VALUE + stats.luck_invested;
  const critChance = (luckValue / 1000) + 0.1;
  const encounterChance = BASE_ENCOUNTER_CHANCE + (stats.luck_invested * LUCK_ENCOUNTER_BONUS);

  return {
    health: {
      current: stats.health_current,
      max: healthMax,
      regenRate: healthRegen
    },
    stamina: {
      current: stats.stamina_current,
      max: staminaMax,
      regenRate: staminaRegen
    },
    energy: {
      current: stats.energy_current,
      max: energyMax,
      regenRate: energyRegen
    },
    strength: {
      value: strengthValue,
      minDamage,
      maxDamage
    },
    speed: {
      value: speedValue,
      attacksPerSecond
    },
    luck: {
      value: luckValue,
      critChance,
      encounterChance
    }
  };
}

export function calculateExpRequired(currentLevel: number): number {
  return Math.floor(BASE_EXP_REQUIREMENT * Math.pow(EXP_MULTIPLIER, currentLevel - 1));
}

export function canLevelUp(currentLevel: number, currentExp: number): boolean {
  const expRequired = calculateExpRequired(currentLevel);
  return currentExp >= expRequired;
}

export function calculateDamage(strength: number, isCritical: boolean = false): number {
  const minDamage = Math.max(1, strength - 5);
  const maxDamage = strength;
  const baseDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

  return isCritical ? maxDamage * 2 : baseDamage;
}

export function rollCritical(luckValue: number): boolean {
  const critChance = (luckValue / 1000) + 0.1;
  return Math.random() < critChance;
}

export function checkEncounter(luckInvested: number): boolean {
  const encounterChance = BASE_ENCOUNTER_CHANCE + (luckInvested * LUCK_ENCOUNTER_BONUS);
  return Math.random() < encounterChance;
}

export function calculateFleeChance(playerSpeed: number, monsterSpeed: number): number {
  const baseChance = 0.5;
  const speedDifference = (playerSpeed - monsterSpeed) * 0.05;
  return Math.max(0.1, Math.min(0.9, baseChance + speedDifference));
}

export function getLeonAppearanceForLevel(level: number): string {
  if (level >= 100) return '/images/leon-cherub.png';
  if (level >= 90) return '/images/leon-angel.png';
  if (level >= 80) return '/images/leon-sengoku.png';
  if (level >= 70) return '/images/leon-level-70.png';
  if (level >= 60) return '/images/leon-level-60.png';
  if (level >= 50) return '/images/leon-level-50.png';
  if (level >= 40) return '/images/leon-level-40.png';
  if (level >= 30) return '/images/leon-level-30.png';
  if (level >= 20) return '/images/leon-level-20.png';
  if (level >= 10) return '/images/leon-level-10.png';
  return '/images/leon-level-1.png';
}

export function getLeonTierName(level: number): string {
  if (level >= 100) return 'Cherub Tier';
  if (level >= 90) return 'Angel Tier';
  if (level >= 80) return 'Sengoku Tosei-Gusoku';
  if (level >= 70) return 'Legendary Armor';
  if (level >= 60) return 'Master Armor';
  if (level >= 50) return 'Elite Armor';
  if (level >= 40) return 'Heavy Armor';
  if (level >= 30) return 'Medium Armor';
  if (level >= 20) return 'Light Armor';
  if (level >= 10) return 'Kosode & Hakama';
  return 'Fundoshi';
}
