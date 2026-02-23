import { System } from "../core/System.js";

const ZOMBIE_FORM_STYLES = [
  { body: "#dff6ff", edge: "#9fd0e4", eye: "#1e3441", mark: "none" },
  { body: "#cff9f1", edge: "#7dc8b8", eye: "#163531", mark: "stripe" },
  { body: "#efe7ff", edge: "#b39adf", eye: "#2e2248", mark: "horn" },
  { body: "#ffe6f1", edge: "#ce9fb8", eye: "#4e2037", mark: "dot" },
  { body: "#e5f1d3", edge: "#9eb87a", eye: "#2d3b19", mark: "stripe" },
  { body: "#ffe8cf", edge: "#c9a37b", eye: "#4a2d17", mark: "horn" },
  { body: "#d8e8ff", edge: "#90a8cd", eye: "#1f2f4b", mark: "dot" },
  { body: "#f7dfd5", edge: "#bd9885", eye: "#4a2a1f", mark: "stripe" },
  { body: "#e4ffd9", edge: "#8fb18f", eye: "#244224", mark: "horn" },
  { body: "#ffe4ec", edge: "#ba91a0", eye: "#472332", mark: "dot" },
];

function drawBlock(ctx, x, y, size, main, edge) {
  const half = size / 2;
  ctx.fillStyle = main;
  ctx.fillRect(x - half, y - half, size, size);
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - half, y - half, size, size);
}

function drawCutePlayer(ctx, x, y, size, lookLeft) {
  const head = Math.max(12, Math.floor(size * 0.62));
  const bodyW = Math.max(10, Math.floor(size * 0.5));
  const bodyH = Math.max(10, Math.floor(size * 0.52));
  const halfHead = Math.floor(head / 2);

  const headY = y - 4;
  const bodyY = headY + halfHead + 4;

  ctx.fillStyle = "#5b3a24";
  ctx.fillRect(x - halfHead, headY - halfHead - 2, head, 4);

  ctx.fillStyle = "#f5c79f";
  ctx.fillRect(x - halfHead, headY - halfHead, head, head);
  ctx.strokeStyle = "#ad7f59";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - halfHead, headY - halfHead, head, head);

  const eyeY = headY - 2;
  const lx = x - 4;
  const rx = x + 2;
  const leftEyeX = lookLeft ? lx - 1 : lx;
  const rightEyeX = lookLeft ? rx - 1 : rx;
  ctx.fillStyle = "#24201c";
  ctx.fillRect(leftEyeX, eyeY, 2, 2);
  ctx.fillRect(rightEyeX, eyeY, 2, 2);
  ctx.fillStyle = "#ff9dad";
  ctx.fillRect(x - 7, eyeY + 3, 2, 2);
  ctx.fillRect(x + 5, eyeY + 3, 2, 2);

  ctx.fillStyle = "#4fa8ff";
  ctx.fillRect(x - Math.floor(bodyW / 2), bodyY, bodyW, bodyH);
  ctx.strokeStyle = "#2062a1";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - Math.floor(bodyW / 2), bodyY, bodyW, bodyH);

  ctx.fillStyle = "#3d3d45";
  ctx.fillRect(x - 5, bodyY + bodyH, 4, 6);
  ctx.fillRect(x + 1, bodyY + bodyH, 4, 6);
}

function drawGhost(ctx, x, y, size, options) {
  const scale = options.boss ? 1.45 : 1;
  const w = Math.max(14, Math.floor(size * 0.72 * scale));
  const h = Math.max(18, Math.floor(size * 0.92 * scale));
  const left = x - Math.floor(w / 2);
  const top = y - Math.floor(h / 2);

  ctx.save();
  ctx.globalAlpha = options.boss ? 0.9 : 0.8;

  ctx.fillStyle = options.body;
  ctx.beginPath();
  ctx.moveTo(left, top + 7);
  ctx.quadraticCurveTo(x, top - 8, left + w, top + 7);
  ctx.lineTo(left + w, top + h - 7);
  ctx.lineTo(left + w - 6, top + h);
  ctx.lineTo(left + w - 12, top + h - 7);
  ctx.lineTo(left + w - 18, top + h);
  ctx.lineTo(left + w - 24, top + h - 7);
  ctx.lineTo(left + 8, top + h);
  ctx.lineTo(left, top + h - 7);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = options.edge;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = options.eye;
  ctx.fillRect(x - 5, top + 8, 3, 4);
  ctx.fillRect(x + 2, top + 8, 3, 4);
  ctx.fillRect(x - 2, top + 15, 4, 2);

  if (options.mark === "stripe") {
    ctx.fillRect(x - 8, top + 20, 16, 2);
  } else if (options.mark === "dot") {
    ctx.fillRect(x - 1, top + 20, 2, 2);
    ctx.fillRect(x + 5, top + 24, 2, 2);
  } else if (options.mark === "horn") {
    ctx.fillRect(x - 9, top + 1, 3, 4);
    ctx.fillRect(x + 6, top + 1, 3, 4);
  }

  if (options.boss) {
    ctx.fillStyle = "#ffd64d";
    ctx.fillRect(x - 10, top - 7, 20, 4);
    ctx.fillRect(x - 8, top - 12, 3, 5);
    ctx.fillRect(x - 1, top - 14, 3, 7);
    ctx.fillRect(x + 6, top - 12, 3, 5);
  }

  ctx.restore();
}

function drawApple(ctx, x, y, size) {
  const r = Math.max(12, Math.floor(size * 0.62));
  ctx.fillStyle = "#ff1f2d";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7a0d14";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#ffd7db";
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.35, Math.max(3, r * 0.22), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2f7f2f";
  ctx.fillRect(x + 2, y - r - 5, 8, 4);
  ctx.fillStyle = "#5a3b1e";
  ctx.fillRect(x - 1, y - r - 8, 3, 7);
}

function drawExplosion(ctx, x, y, progress, maxRadius) {
  const radius = Math.max(8, maxRadius * progress);
  const alpha = Math.max(0, 1 - progress);

  ctx.save();

  ctx.globalAlpha = 0.42 * alpha;
  ctx.fillStyle = "#ff8a00";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.55 * alpha;
  ctx.fillStyle = "#ffcc3d";
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.66, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.75 * alpha;
  const sparkR = radius * 0.78;
  const offsets = [
    [sparkR, 0],
    [-sparkR, 0],
    [0, sparkR],
    [0, -sparkR],
    [sparkR * 0.7, sparkR * 0.7],
    [-sparkR * 0.7, sparkR * 0.7],
    [sparkR * 0.7, -sparkR * 0.7],
    [-sparkR * 0.7, -sparkR * 0.7],
  ];
  ctx.fillStyle = "#fff2a8";
  for (const [ox, oy] of offsets) {
    ctx.fillRect(x + ox - 5, y + oy - 5, 10, 10);
  }

  ctx.restore();
}

function drawShieldAura(ctx, x, y, playerRadius, timeLeft) {
  const pulse = 0.85 + Math.sin(performance.now() * 0.012) * 0.15;
  const r = playerRadius + 24 + pulse * 8;
  const alpha = 0.35 + Math.min(1, timeLeft / 10) * 0.3;

  ctx.save();

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#7bd9ff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = alpha * 0.7;
  ctx.strokeStyle = "#d1f3ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r - 8, 0, Math.PI * 2);
  ctx.stroke();

  const marks = 8;
  ctx.globalAlpha = alpha * 0.9;
  ctx.fillStyle = "#c9f0ff";
  for (let i = 0; i < marks; i += 1) {
    const a = (Math.PI * 2 * i) / marks + performance.now() * 0.0014;
    const mx = x + Math.cos(a) * (r - 2);
    const my = y + Math.sin(a) * (r - 2);
    ctx.fillRect(mx - 3, my - 3, 6, 6);
  }

  ctx.restore();
}

export class RenderSystem extends System {
  update(world, dt) {
    const { ctx, canvas } = world.state;
    const { width, height } = canvas;
    const mission = world.state.mission;

    ctx.clearRect(0, 0, width, height);

    const tile = 30;
    for (let y = 0; y < height; y += tile) {
      for (let x = 0; x < width; x += tile) {
        const isGrass = y < height * 0.72;
        ctx.fillStyle = isGrass
          ? (x / tile + y / tile) % 2 === 0
            ? "#5f9a3c"
            : "#558d36"
          : (x / tile + y / tile) % 2 === 0
            ? "#7a543b"
            : "#6f4b34";
        ctx.fillRect(x, y, tile, tile);
      }
    }

    for (const entity of world.entities.values()) {
      const pos = entity.get("position");
      const collider = entity.get("collider");
      if (!pos || !collider) continue;

      const size = collider.radius * 2;

      if (entity.tag === "player") {
        const lookLeft = world.state.input.mouse.x < pos.x;
        drawCutePlayer(ctx, pos.x, pos.y, size, lookLeft);

        if (mission.shieldActive && mission.shieldTimeLeft > 0) {
          drawShieldAura(ctx, pos.x, pos.y, collider.radius, mission.shieldTimeLeft);
        }
      } else if (entity.tag === "zombie") {
        const form = entity.get("zombieType")?.form ?? mission.stageIndex;
        const style = ZOMBIE_FORM_STYLES[form % ZOMBIE_FORM_STYLES.length];
        drawGhost(ctx, pos.x, pos.y, size, { ...style, boss: false });
      } else if (entity.tag === "boss") {
        drawGhost(ctx, pos.x, pos.y, size, {
          body: "#e5f6ff",
          edge: "#6fb2d5",
          eye: "#1e3441",
          mark: "horn",
          boss: true,
        });
      } else if (entity.tag === "apple") {
        drawApple(ctx, pos.x, pos.y, size);
      } else if (entity.tag === "missile") {
        drawBlock(ctx, pos.x, pos.y, Math.max(10, size), "#ff7f32", "#7d3208");
      } else if (entity.tag === "bullet") {
        drawBlock(ctx, pos.x, pos.y, Math.max(4, size), "#f6d32c", "#8b6f12");
      }
    }

    const explosions = mission.explosions ?? [];
    for (const fx of explosions) {
      fx.t += dt;
      const p = Math.min(1, fx.t / fx.duration);
      drawExplosion(ctx, fx.x, fx.y, p, fx.radius);
    }
    mission.explosions = explosions.filter((fx) => fx.t < fx.duration);

    if (mission.transitionTimer > 0 && !world.state.gameOver && !mission.gameWon) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#ffe58f";
      ctx.font = "bold 34px Courier New";
      ctx.textAlign = "center";
      ctx.fillText(`STAGE ${mission.stageIndex + 1} CLEAR`, width / 2, height / 2);
    }

    if (world.state.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#ff7a7a";
      ctx.font = "bold 44px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("MISSION FAILED", width / 2, height / 2);
      ctx.fillStyle = "#f0e4c8";
      ctx.font = "18px Courier New";
      ctx.fillText("새로고침해서 재시작", width / 2, height / 2 + 32);
    }

    if (mission.gameWon) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#8df58a";
      ctx.font = "bold 44px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("MISSION COMPLETE", width / 2, height / 2);
      ctx.fillStyle = "#f0e4c8";
      ctx.font = "18px Courier New";
      ctx.fillText("10 스테이지 + 대왕 유령 클리어", width / 2, height / 2 + 32);
    }

    const player = world.getById(world.state.playerId);
    const boss = world.findByTag("boss")[0] ?? null;

    const hp = player ? Math.ceil(player.get("health").current) : 0;
    const stageNo = Math.min(mission.stageIndex + 1, mission.stages.length);
    const target = mission.stages[mission.stageIndex] ?? mission.stages[mission.stages.length - 1];
    const bossHpMaxByStage = 10 + mission.stageIndex * 10;
    const bossHp = boss ? boss.get("health").current : mission.bossDefeated ? 0 : bossHpMaxByStage;
    const shieldText = mission.shieldActive ? `${mission.shieldTimeLeft.toFixed(1)}s` : "OFF";

    document.getElementById("hp").textContent = String(hp);
    document.getElementById("kills").textContent = String(world.state.kills);
    document.getElementById("stage").textContent = `${stageNo}/${mission.stages.length}`;
    document.getElementById("stage-kills").textContent = `${Math.min(mission.stageKills, target)}/${target}`;
    document.getElementById("boss-hp").textContent = String(Math.max(0, bossHp));
    document.getElementById("bombs").textContent = String(mission.bombsLeft ?? 0);
    document.getElementById("missiles").textContent = String(mission.missilesLeft ?? 0);
    document.getElementById("shield").textContent = shieldText;
    document.getElementById("status").textContent = mission.noticeText;
  }
}
