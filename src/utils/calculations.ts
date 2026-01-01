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
  if (level >= 100) return 'https://placehold.co/512x512/9333ea/ffffff?text=Cherub+Lv100';
  if (level >= 90) return 'https://placehold.co/512x512/a855f7/ffffff?text=Angel+Lv90';
  if (level >= 80) return 'https://placehold.co/512x512/c084fc/ffffff?text=Sengoku+Lv80';
  if (level >= 70) return 'https://placehold.co/512x512/d8b4fe/000000?text=Legendary+Lv70';
  if (level >= 60) return 'https://placehold.co/512x512/e9d5ff/000000?text=Master+Lv60';
  if (level >= 50) return 'https://placehold.co/512x512/3b82f6/ffffff?text=Elite+Lv50';
  if (level >= 40) return 'https://placehold.co/512x512/60a5fa/000000?text=Heavy+Lv40';
  if (level >= 30) return 'https://placehold.co/512x512/93c5fd/000000?text=Medium+Lv30';
  if (level >= 20) return 'https://placehold.co/512x512/22c55e/ffffff?text=Light+Lv20';
  if (level >= 10) return 'https://placehold.co/512x512/4ade80/000000?text=Kosode+Lv10';
  return 'https://placehold.co/512x512/86efac/000000?text=Leon+Lv1';
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
