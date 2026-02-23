import { System } from "../core/System.js";
import { createZombie } from "../entities/Zombie.js";
import { createBoss } from "../entities/Boss.js";
import { createApple } from "../entities/Apple.js";
import { GAME_CONFIG } from "../config/constants.js";

function circlesOverlap(aPos, aR, bPos, bR) {
  const dx = aPos.x - bPos.x;
  const dy = aPos.y - bPos.y;
  const r = aR + bR;
  return dx * dx + dy * dy <= r * r;
}

function applyPlayerKnockback(playerPos, playerVel, playerRadius, enemyPos, enemyRadius, pushPower) {
  const dx = playerPos.x - enemyPos.x;
  const dy = playerPos.y - enemyPos.y;
  const dist = Math.hypot(dx, dy) || 1;
  const minDist = playerRadius + enemyRadius;
  if (dist >= minDist) return false;

  const nx = dx / dist;
  const ny = dy / dist;
  const penetration = minDist - dist;

  playerPos.x += nx * penetration * 0.8;
  playerPos.y += ny * penetration * 0.8;

  playerVel.x += nx * pushPower;
  playerVel.y += ny * pushPower;
  return true;
}

function stageZombieHealth(stageIndex) {
  return Math.min(5, 1 + Math.floor(stageIndex / 2));
}

function stageZombieSpeed(stageIndex) {
  return GAME_CONFIG.zombie.speed + stageIndex * GAME_CONFIG.zombie.speedPerStage;
}

function stageConcurrentLimit(stageIndex) {
  return Math.min(
    GAME_CONFIG.mission.maxConcurrentZombies,
    GAME_CONFIG.mission.baseConcurrentZombies + Math.floor(stageIndex / 2)
  );
}

function spawnZombieAtEdge(world, stageIndex) {
  const { width, height } = world.state.canvas;
  const side = Math.floor(Math.random() * 4);
  const padding = 26;

  let x = 0;
  let y = 0;

  if (side === 0) {
    x = Math.random() * width;
    y = -padding;
  } else if (side === 1) {
    x = width + padding;
    y = Math.random() * height;
  } else if (side === 2) {
    x = Math.random() * width;
    y = height + padding;
  } else {
    x = -padding;
    y = Math.random() * height;
  }

  world.spawn(
    createZombie(x, y, {
      ...GAME_CONFIG.zombie,
      speed: stageZombieSpeed(stageIndex),
      health: stageZombieHealth(stageIndex),
      form: stageIndex,
    })
  );
}

function spawnBoss(world, stageIndex) {
  const { width } = world.state.canvas;
  const x = width * (0.25 + Math.random() * 0.5);
  const y = 36;
  const speedBoost = stageIndex * 4;

  world.spawn(
    createBoss(x, y, {
      ...GAME_CONFIG.boss,
      speed: GAME_CONFIG.boss.speed + speedBoost,
      hitPoints: GAME_CONFIG.boss.hitPoints + stageIndex * 10,
    })
  );
}

function spawnApple(world) {
  const { width, height } = world.state.canvas;
  const margin = 42;
  const x = margin + Math.random() * (width - margin * 2);
  const y = margin + Math.random() * (height - margin * 2);
  world.spawn(createApple(x, y, GAME_CONFIG.apple));
}

export class CollisionSystem extends System {
  update(world, dt) {
    const player = world.getById(world.state.playerId);
    if (!player) return;

    const mission = world.state.mission;
    if (typeof mission.applesSpawned !== "number") mission.applesSpawned = 0;
    if (typeof mission.appleSpawnTimer !== "number") mission.appleSpawnTimer = 0;
    if (typeof mission.missilesLeft !== "number") mission.missilesLeft = GAME_CONFIG.missile.usesPerStage;

    const playerPos = player.get("position");
    const playerVel = player.get("velocity");
    const playerCol = player.get("collider");
    const playerHp = player.get("health");

    const zombies = world.findByTag("zombie");
    const bosses = world.findByTag("boss");
    const apples = world.findByTag("apple");
    const bullets = world.findByTag("bullet");
    const missiles = world.findByTag("missile");

    for (const bullet of bullets) {
      const bPos = bullet.get("position");
      const bCol = bullet.get("collider");
      const dmg = bullet.get("damage");
      let hit = false;

      for (const zombie of zombies) {
        const zPos = zombie.get("position");
        const zCol = zombie.get("collider");
        if (!circlesOverlap(bPos, bCol.radius, zPos, zCol.radius)) continue;

        world.remove(bullet.id);
        world.state.audio?.hit();

        const zHp = zombie.get("health");
        zHp.current -= dmg.amount;
        if (zHp.current <= 0) {
          world.remove(zombie.id);
          world.state.kills += 1;
          mission.stageKills += 1;
        }

        hit = true;
        break;
      }

      if (hit) continue;

      for (const boss of bosses) {
        const bossPos = boss.get("position");
        const bossCol = boss.get("collider");
        if (!circlesOverlap(bPos, bCol.radius, bossPos, bossCol.radius)) continue;

        world.remove(bullet.id);
        world.state.audio?.hit();

        const hp = boss.get("health");
        hp.current -= 1;
        if (hp.current <= 0) {
          world.remove(boss.id);
          mission.bossDefeated = true;
          world.state.kills += 10;
          mission.stageKills += 10;
          mission.noticeText = `STAGE ${mission.stageIndex + 1} 대왕 유령 처치 완료 (SKILL +10)`;
        }
        break;
      }
    }

    for (const missile of missiles) {
      const mPos = missile.get("position");
      const mCol = missile.get("collider");
      const dmg = missile.get("damage");

      for (const boss of bosses) {
        const bPos = boss.get("position");
        const bCol = boss.get("collider");
        if (!circlesOverlap(mPos, mCol.radius, bPos, bCol.radius)) continue;

        world.remove(missile.id);
        world.state.audio?.missileHit();

        const hp = boss.get("health");
        hp.current -= dmg.amount;
        if (hp.current <= 0) {
          world.remove(boss.id);
          mission.bossDefeated = true;
          world.state.kills += 10;
          mission.stageKills += 10;
          mission.noticeText = `STAGE ${mission.stageIndex + 1} 대왕 유령 처치 완료 (SKILL +10)`;
        }
        break;
      }
    }

    if (!world.state.gameOver && !mission.gameWon) {
      const hpBeforeDamage = playerHp.current;
      const shieldOn = mission.shieldActive && mission.shieldTimeLeft > 0;

      for (const zombie of zombies) {
        const zPos = zombie.get("position");
        const zCol = zombie.get("collider");
        const touching = applyPlayerKnockback(
          playerPos,
          playerVel,
          playerCol.radius,
          zPos,
          zCol.radius,
          160
        );
        if (!touching) continue;
        if (!shieldOn) {
          playerHp.current -= GAME_CONFIG.zombie.touchDamagePerSec * dt;
        }
      }

      for (const boss of bosses) {
        const bPos = boss.get("position");
        const bCol = boss.get("collider");
        const touching = applyPlayerKnockback(
          playerPos,
          playerVel,
          playerCol.radius,
          bPos,
          bCol.radius,
          240
        );
        if (!touching) continue;
        if (!shieldOn) {
          playerHp.current -= GAME_CONFIG.boss.touchDamagePerSec * dt;
        }
      }

      if (playerHp.current < hpBeforeDamage) {
        world.state.audio?.hurt();
      }

      for (const apple of apples) {
        const aPos = apple.get("position");
        const aCol = apple.get("collider");
        if (!circlesOverlap(playerPos, playerCol.radius, aPos, aCol.radius)) continue;

        world.remove(apple.id);
        playerHp.current = Math.min(playerHp.max, playerHp.current + GAME_CONFIG.apple.healAmount);
        mission.noticeText = `사과 획득! HP +${GAME_CONFIG.apple.healAmount}`;
        world.state.audio?.apple();
      }

      if (playerHp.current <= 0) {
        playerHp.current = 0;
        world.state.gameOver = true;
      }
    }

    if (world.state.gameOver || mission.gameWon) return;

    if (mission.transitionTimer > 0) {
      mission.transitionTimer = Math.max(0, mission.transitionTimer - dt);
      mission.noticeText = `STAGE ${mission.stageIndex + 1} 클리어! ${mission.transitionTimer.toFixed(1)}초 후 다음 스테이지`;
      if (mission.transitionTimer === 0) {
        mission.stageIndex += 1;
        mission.stageKills = 0;
        mission.stageSpawned = 0;
        mission.explosions = [];
        mission.bombsLeft = GAME_CONFIG.bomb.usesPerStage;
        mission.missilesLeft = GAME_CONFIG.missile.usesPerStage;
        mission.shieldActive = false;
        mission.shieldTimeLeft = 0;
        mission.applesSpawned = 0;
        mission.appleSpawnTimer = 0;
        mission.bossSpawned = false;
        mission.bossDefeated = false;
        playerHp.max += 10;
        playerHp.current = Math.min(playerHp.max, playerHp.current + 10);
        mission.noticeText = `STAGE ${mission.stageIndex + 1} 시작`;
      }
      return;
    }

    if (!mission.bossSpawned) {
      spawnBoss(world, mission.stageIndex);
      mission.bossSpawned = true;
      mission.bossDefeated = false;
      while (mission.applesSpawned < GAME_CONFIG.apple.maxPerStage) {
        spawnApple(world);
        mission.applesSpawned += 1;
      }
      mission.noticeText = `STAGE ${mission.stageIndex + 1} 진행중 - 신규 유령 형태 출현`;
    }

    const stageTarget = mission.stages[mission.stageIndex];

    let livingZombies = world.findByTag("zombie").length;
    const concurrentLimit = stageConcurrentLimit(mission.stageIndex);
    while (mission.stageSpawned < stageTarget && livingZombies < concurrentLimit) {
      spawnZombieAtEdge(world, mission.stageIndex);
      mission.stageSpawned += 1;
      livingZombies += 1;
    }

    const livingBosses = world.findByTag("boss").length;
    if (
      mission.stageKills >= stageTarget &&
      mission.bossDefeated &&
      livingZombies === 0 &&
      livingBosses === 0
    ) {
      const stageNo = mission.stageIndex + 1;
      if (mission.stageIndex >= mission.stages.length - 1) {
        mission.gameWon = true;
        mission.noticeText = "모든 스테이지 클리어 완료";
        return;
      }

      mission.transitionTimer = mission.stageClearDelaySec;
      mission.noticeText = `STAGE ${stageNo} 클리어! ${mission.transitionTimer.toFixed(1)}초 후 다음 스테이지`;
    }
  }
}
