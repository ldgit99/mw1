import { GAME_CONFIG } from "./config/constants.js";
import { Input } from "./core/Input.js";
import { World } from "./core/World.js";
import { Game } from "./core/Game.js";
import { AudioManager } from "./core/Audio.js";
import { createPlayer } from "./entities/Player.js";
import { ShootingSystem } from "./systems/ShootingSystem.js";
import { ZombieAISystem } from "./systems/ZombieAISystem.js";
import { MovementSystem } from "./systems/MovementSystem.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";
import { RenderSystem } from "./systems/RenderSystem.js";

const canvas = document.getElementById("game");
canvas.width = GAME_CONFIG.width;
canvas.height = GAME_CONFIG.height;
const ctx = canvas.getContext("2d");

const input = new Input(canvas);
const world = new World();
world.state.canvas = canvas;
world.state.ctx = ctx;
world.state.input = input;
world.state.audio = new AudioManager();

function clampStageIndex(stageIndex) {
  const max = GAME_CONFIG.mission.stages.length - 1;
  return Math.max(0, Math.min(max, stageIndex));
}

function resetToStage(stageIndex) {
  const idx = clampStageIndex(stageIndex);

  world.entities.clear();
  world.toAdd.length = 0;
  world.toRemove.clear();

  world.state.time = 0;
  world.state.kills = 0;
  world.state.gameOver = false;
  world.state.playerId = null;

  world.state.mission = {
    stageIndex: idx,
    stageKills: 0,
    stageSpawned: 0,
    stages: [...GAME_CONFIG.mission.stages],
    maxConcurrentZombies: GAME_CONFIG.mission.baseConcurrentZombies,
    stageClearDelaySec: GAME_CONFIG.mission.stageClearDelaySec,
    transitionTimer: 0,
    noticeText: `STAGE ${idx + 1} 시작`,
    explosions: [],
    bombsLeft: GAME_CONFIG.bomb.usesPerStage,
    missilesLeft: GAME_CONFIG.missile.usesPerStage,
    shieldActive: false,
    shieldTimeLeft: 0,
    applesSpawned: 0,
    appleSpawnTimer: 0,
    bossSpawned: false,
    bossDefeated: false,
    gameWon: false,
  };

  const stageHpBonus = idx * 10;
  const player = createPlayer(
    GAME_CONFIG.width / 2,
    GAME_CONFIG.height / 2,
    {
      ...GAME_CONFIG.player,
      maxHealth: GAME_CONFIG.player.maxHealth + stageHpBonus,
    }
  );

  world.spawn(player);
  world.flushEntityQueues();
  world.state.playerId = player.id;
}

function bindUiControls() {
  const retryBtn = document.getElementById("retry-btn");
  retryBtn.addEventListener("click", () => {
    const current = world.state.mission?.stageIndex ?? 0;
    resetToStage(current);
  });

  const stageButtonsWrap = document.getElementById("stage-buttons");
  stageButtonsWrap.innerHTML = "";
  for (let i = 0; i < GAME_CONFIG.mission.stages.length; i += 1) {
    const btn = document.createElement("button");
    btn.className = "ctrl-btn";
    btn.type = "button";
    btn.textContent = `스테이지 ${i + 1}`;
    btn.addEventListener("click", () => resetToStage(i));
    stageButtonsWrap.appendChild(btn);
  }
}

world
  .addSystem(new ShootingSystem())
  .addSystem(new ZombieAISystem())
  .addSystem(new MovementSystem())
  .addSystem(new CollisionSystem())
  .addSystem(new RenderSystem());

bindUiControls();
resetToStage(0);

const game = new Game(world, GAME_CONFIG);
game.start();
