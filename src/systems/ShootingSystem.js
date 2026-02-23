import { System } from "../core/System.js";
import { createBullet } from "../entities/Bullet.js";
import { createMissile } from "../entities/Missile.js";
import { GAME_CONFIG } from "../config/constants.js";

const STORAGE_KEY = "mw1_profile_v1";

function addKills(mission, count) {
  mission.totalKillsAllTime = Math.max(0, (mission.totalKillsAllTime || 0) + count);
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

function bombDamageAroundPlayer(world, playerPos) {
  const r = GAME_CONFIG.bomb.radius;
  const rSq = r * r;

  for (const zombie of world.findByTag("zombie")) {
    const zPos = zombie.get("position");
    const dx = zPos.x - playerPos.x;
    const dy = zPos.y - playerPos.y;
    if (dx * dx + dy * dy > rSq) continue;

    const hp = zombie.get("health");
    hp.current -= GAME_CONFIG.bomb.damage;
    if (hp.current <= 0) {
      world.remove(zombie.id);
      world.state.kills += 1;
      world.state.mission.stageKills += 1;
      addKills(world.state.mission, 1);
    }
  }

  for (const boss of world.findByTag("boss")) {
    const bPos = boss.get("position");
    const dx = bPos.x - playerPos.x;
    const dy = bPos.y - playerPos.y;
    if (dx * dx + dy * dy > rSq) continue;

    const hp = boss.get("health");
    hp.current -= GAME_CONFIG.bomb.damage;
    if (hp.current <= 0) {
      world.remove(boss.id);
      world.state.mission.bossDefeated = true;
      world.state.kills += 10;
      world.state.mission.stageKills += 10;
      addKills(world.state.mission, 10);
      world.state.mission.noticeText = `STAGE ${world.state.mission.stageIndex + 1} 대왕 유령 처치 완료 (SKILL +10)`;
    }
  }
}

export class ShootingSystem extends System {
  update(world, dt) {
    const mission = world.state.mission;
    if (world.state.gameOver || mission?.gameWon || !mission?.started || mission?.paused) return;

    const player = world.getById(world.state.playerId);
    if (!player) return;

    const input = world.state.input;
    const axis = input.getAxis();

    const vel = player.get("velocity");
    const move = player.get("movement");
    vel.x = axis.x * move.speed;
    vel.y = axis.y * move.speed;

    if (mission.shieldActive) {
      mission.shieldTimeLeft = Math.max(0, mission.shieldTimeLeft - dt);
      if (mission.shieldTimeLeft <= 0) {
        mission.shieldActive = false;
      }
    }

    const throwBomb = input.consumePress("Digit1") || input.consumePress("Numpad1");
    if (throwBomb && mission.bombsLeft > 0) {
      mission.bombsLeft -= 1;
      const playerPos = player.get("position");
      bombDamageAroundPlayer(world, playerPos);
      mission.explosions ??= [];
      mission.explosions.push({
        x: playerPos.x,
        y: playerPos.y,
        t: 0,
        duration: 0.33,
        radius: GAME_CONFIG.bomb.radius,
      });
      world.state.audio?.bomb();
      mission.noticeText = `폭탄 사용! 남은 폭탄 ${mission.bombsLeft}`;
    }

    const fireMissile = input.consumePress("Digit2") || input.consumePress("Numpad2");
    if (fireMissile && mission.missilesLeft > 0) {
      const boss = world.findByTag("boss")[0] ?? null;
      if (boss) {
        const pos = player.get("position");
        world.spawn(createMissile(pos.x, pos.y, GAME_CONFIG.missile, boss.id));
        mission.missilesLeft -= 1;
        world.state.audio?.missileLaunch();
        mission.noticeText = `미사일 발사! 남은 미사일 ${mission.missilesLeft}`;
      } else {
        mission.noticeText = "대왕 유령이 없어서 미사일을 발사할 수 없음";
      }
    }

    const useShield = input.consumePress("Digit3") || input.consumePress("Numpad3");
    if (useShield && !mission.shieldActive) {
      mission.shieldActive = true;
      mission.shieldTimeLeft = GAME_CONFIG.shield.durationSec;
      mission.noticeText = `방어막 활성! ${GAME_CONFIG.shield.durationSec}초`;
    }

    const weapon = player.get("weapon");
    weapon.cooldownLeft = Math.max(0, weapon.cooldownLeft - dt);

    if (weapon.cooldownLeft > 0) return;

    const pos = player.get("position");
    let dx = input.mouse.x - pos.x;
    let dy = input.mouse.y - pos.y;

    const autoAim = input.keys.has("Space");
    if (autoAim) {
      const targets = [...world.findByTag("zombie"), ...world.findByTag("boss")];
      if (targets.length === 0) return;

      let nearest = null;
      let bestDistSq = Number.POSITIVE_INFINITY;
      for (const target of targets) {
        const tPos = target.get("position");
        const tx = tPos.x - pos.x;
        const ty = tPos.y - pos.y;
        const distSq = tx * tx + ty * ty;
        if (distSq < bestDistSq) {
          bestDistSq = distSq;
          nearest = tPos;
        }
      }

      if (!nearest) return;
      dx = nearest.x - pos.x;
      dy = nearest.y - pos.y;
    } else if (!input.mouse.leftDown) {
      return;
    }

    const len = Math.hypot(dx, dy);
    if (len < 1) return;

    const dirX = dx / len;
    const dirY = dy / len;
    const muzzle = player.get("collider").radius + weapon.bulletRadius + 2;

    world.spawn(
      createBullet(
        pos.x + dirX * muzzle,
        pos.y + dirY * muzzle,
        dirX * weapon.bulletSpeed,
        dirY * weapon.bulletSpeed,
        weapon.bulletRadius,
        weapon.bulletDamage
      )
    );
    world.state.audio?.shoot();

    weapon.cooldownLeft = weapon.cooldown;
  }
}
