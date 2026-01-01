import { Monster, CalculatedStats, CombatAction } from '../types/game';
import { calculateDamage, rollCritical, calculateFleeChance } from './calculations';

export class CombatManager {
  private playerStats: CalculatedStats;
  private monster: Monster;
  private onPlayerDamage: (newHealth: number) => void;
  private onMonsterDamage: (newHealth: number) => void;
  private onEnergyChange: (newEnergy: number) => void;
  private playerSpeedAccumulator: number = 0;
  private monsterSpeedAccumulator: number = 0;

  constructor(
    playerStats: CalculatedStats,
    monster: Monster,
    onPlayerDamage: (newHealth: number) => void,
    onMonsterDamage: (newHealth: number) => void,
    onEnergyChange: (newEnergy: number) => void
  ) {
    this.playerStats = playerStats;
    this.monster = monster;
    this.onPlayerDamage = onPlayerDamage;
    this.onMonsterDamage = onMonsterDamage;
    this.onEnergyChange = onEnergyChange;
  }

  playerAttack(): CombatAction {
    const isCritical = rollCritical(this.playerStats.luck.value);
    const damage = calculateDamage(this.playerStats.strength.value, isCritical);

    const newMonsterHealth = Math.max(0, this.monster.health - damage);
    this.monster.health = newMonsterHealth;
    this.onMonsterDamage(newMonsterHealth);

    return {
      type: 'attack',
      damage,
      isCritical,
      message: isCritical
        ? `Leon delivers a CRITICAL STRIKE for ${damage} damage!`
        : `Leon attacks for ${damage} damage!`
    };
  }

  playerMagic(): CombatAction {
    if (this.playerStats.energy.current < 5) {
      return {
        type: 'magic',
        success: false,
        message: 'Not enough energy to cast magic! Need 5 energy.'
      };
    }

    const newEnergy = Math.max(0, this.playerStats.energy.current - 5);
    this.playerStats.energy.current = newEnergy;
    this.onEnergyChange(newEnergy);

    const baseDamage = Math.floor(this.playerStats.strength.value * 1.5);
    const isCritical = rollCritical(this.playerStats.luck.value);
    const damage = isCritical ? baseDamage * 2 : baseDamage;

    const newMonsterHealth = Math.max(0, this.monster.health - damage);
    this.monster.health = newMonsterHealth;
    this.onMonsterDamage(newMonsterHealth);

    return {
      type: 'magic',
      damage,
      isCritical,
      success: true,
      message: `Leon unleashes magic for ${damage} damage! (-5 Energy)`
    };
  }

  playerFlee(): CombatAction {
    const fleeChance = calculateFleeChance(
      this.playerStats.speed.value,
      this.monster.speed
    );

    const success = Math.random() < fleeChance;

    return {
      type: 'flee',
      success,
      message: success
        ? 'Leon successfully escaped from battle!'
        : 'Failed to escape! The enemy blocks your path!'
    };
  }

  monsterAttack(): CombatAction {
    const minDamage = Math.max(1, this.monster.strength - 3);
    const maxDamage = this.monster.strength;
    const damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

    const newPlayerHealth = Math.max(0, this.playerStats.health.current - damage);
    this.playerStats.health.current = newPlayerHealth;
    this.onPlayerDamage(newPlayerHealth);

    return {
      type: 'attack',
      damage,
      message: `${this.monster.name} attacks for ${damage} damage!`
    };
  }

  determineFirstAttacker(): 'player' | 'monster' {
    return this.playerStats.speed.value >= this.monster.speed ? 'player' : 'monster';
  }

  rollForItemDrops(lootMultiplier: number = 1): Array<{ itemType: string; quantity: number }> {
    const drops: Array<{ itemType: string; quantity: number }> = [];

    for (const drop of this.monster.dropTable) {
      const effectiveDropChance = Math.min(1, drop.dropChance * lootMultiplier);

      if (Math.random() < effectiveDropChance) {
        const effectiveQuantity = Math.max(1, Math.floor(drop.quantity * lootMultiplier));
        drops.push({
          itemType: drop.itemType,
          quantity: effectiveQuantity
        });
      }
    }

    return drops;
  }

  isPlayerDefeated(): boolean {
    return this.playerStats.health.current <= 0;
  }

  isMonsterDefeated(): boolean {
    return this.monster.health <= 0;
  }

  calculateAttacksThisTurn(speed: number, accumulator: number): { attacks: number; newAccumulator: number } {
    const totalSpeed = speed + accumulator;
    const attacks = Math.floor(totalSpeed / 10);
    const newAccumulator = totalSpeed % 10;
    return { attacks, newAccumulator };
  }

  getPlayerAttacksThisTurn(): number {
    const result = this.calculateAttacksThisTurn(this.playerStats.speed.value, this.playerSpeedAccumulator);
    this.playerSpeedAccumulator = result.newAccumulator;
    return result.attacks;
  }

  getMonsterAttacksThisTurn(): number {
    const result = this.calculateAttacksThisTurn(this.monster.speed, this.monsterSpeedAccumulator);
    this.monsterSpeedAccumulator = result.newAccumulator;
    return result.attacks;
  }
}
