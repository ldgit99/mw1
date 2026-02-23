export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  maxDeltaTime: 0.033,
  mission: {
    stages: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
    maxConcurrentZombies: 18,
    baseConcurrentZombies: 10,
    stageClearDelaySec: 2.4,
  },
  player: {
    speed: 260,
    radius: 14,
    maxHealth: 100,
    fireCooldown: 0.14,
    bulletSpeed: 640,
    bulletRadius: 7,
    bulletDamage: 1,
  },
  zombie: {
    speed: 92,
    speedPerStage: 3,
    radius: 15,
    health: 1,
    touchDamagePerSec: 26,
  },
  boss: {
    speed: 72,
    radius: 24,
    hitPoints: 10,
    touchDamagePerSec: 40,
  },
  bullet: {
    ttl: 1.2,
  },
  bomb: {
    damage: 20,
    radius: 160,
    usesPerStage: 3,
  },
  missile: {
    damage: 50,
    speed: 520,
    radius: 8,
    ttl: 2.2,
    usesPerStage: 2,
  },
  shield: {
    durationSec: 10,
  },
  apple: {
    radius: 16,
    healAmount: 20,
    maxPerStage: 3,
  },
};
