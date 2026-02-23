import { System } from "../core/System.js";
import { createZombie } from "../entities/Zombie.js";
import { createBoss } from "../entities/Boss.js";
import { createApple } from "../entities/Apple.js";
import { GAME_CONFIG } from "../config/constants.js";

const STORAGE_KEY = "mw1_profile_v1";
const GHOST_ARCHETYPES = [
  { kind: "ghost", name: "떠돌이 귀신", form: 0, health: 1, speedBonus: 0 },
  { kind: "jiangshi", name: "강시", form: 1, health: 2, speedBonus: -6 },
  { kind: "dracula", name: "드라큘라", form: 2, health: 3, speedBonus: 8 },
  { kind: "wraith", name: "원혼", form: 3, health: 2, speedBonus: 12 },
  { kind: "banshee", name: "밴시", form: 4, health: 4, speedBonus: 5 },
  { kind: "phantom", name: "팬텀", form: 5, health: 3, speedBonus: 15 },
  { kind: "reaper", name: "사신 유령", form: 6, health: 5, speedBonus: 7 },
  { kind: "poltergeist", name: "폴터가이스트", form: 7, health: 4, speedBonus: 13 },
  { kind: "specter", name: "스펙터", form: 8, health: 5, speedBonus: 10 },
  { kind: "elder", name: "고대령", form: 9, health: 5, speedBonus: 14 },
];

function persistProgress(mission) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = {
      bestStage: Math.max(Number(parsed.bestStage) || 1, mission.bestStageReached || 1),
      totalKills: Math.max(Number(parsed.totalKills) || 0, mission.totalKillsAllTime || 0),
      audioEnabled: parsed.audioEnabled !== false,
      audioVolume: Math.max(0, Math.min(1, Number(parsed.audioVolume) || 0.18)),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore persistence errors
  }
}

function addKills(mission, count) {
  mission.totalKillsAllTime = Math.max(0, (mission.totalKillsAllTime || 0) + count);
  persistProgress(mission);
}

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

function getStagePrimaryGhost(stageIndex) {
  return GHOST_ARCHETYPES[Math.min(stageIndex, GHOST_ARCHETYPES.length - 1)];
}

function pickGhostForSpawn(stageIndex) {
  const unlocked = GHOST_ARCHETYPES.slice(0, Math.min(stageIndex + 1, GHOST_ARCHETYPES.length));
  if (unlocked.length <= 1) return unlocked[0];

  // Mostly spawn the current stage ghost, but mix prior ghosts for variety.
  if (Math.random() < 0.65) return unlocked[unlocked.length - 1];
  return unlocked[Math.floor(Math.random() * unlocked.length)];
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
  const ghost = pickGhostForSpawn(stageIndex);

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
      speed: GAME_CONFIG.zombie.speed + stageIndex * GAME_CONFIG.zombie.speedPerStage + ghost.speedBonus,
      health: ghost.health,
      form: ghost.form,
      kind: ghost.kind,
      name: ghost.name,
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
    if (typeof mission.shieldActive !== "boolean") mission.shieldActive = false;
    if (typeof mission.shieldTimeLeft !== "number") mission.shieldTimeLeft = 0;
    if (typeof mission.totalKillsAllTime !== "number") mission.totalKillsAllTime = 0;
    if (typeof mission.bestStageReached !== "number") mission.bestStageReached = mission.stageIndex + 1;

    if (!mission.started || mission.paused) return;

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
          addKills(mission, 1);
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
          addKills(mission, 10);
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
          addKills(mission, 10);
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
        mission.bestStageReached = Math.max(mission.bestStageReached, mission.stageIndex + 1);
        persistProgress(mission);

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
      const stageGhost = getStagePrimaryGhost(mission.stageIndex);
      mission.noticeText = `STAGE ${mission.stageIndex + 1} 진행중 - ${stageGhost.name} 출현`;
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
        mission.bestStageReached = Math.max(mission.bestStageReached, mission.stages.length);
        persistProgress(mission);
        mission.noticeText = "모든 스테이지 클리어 완료";
        return;
      }

      mission.transitionTimer = mission.stageClearDelaySec;
      mission.noticeText = `STAGE ${stageNo} 클리어! ${mission.transitionTimer.toFixed(1)}초 후 다음 스테이지`;
    }
  }
}
