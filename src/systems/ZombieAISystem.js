import { System } from "../core/System.js";

export class ZombieAISystem extends System {
  update(world, _dt) {
    if (
      world.state.gameOver ||
      world.state.mission?.gameWon ||
      !world.state.mission?.started ||
      world.state.mission?.paused
    ) {
      return;
    }

    const player = world.getById(world.state.playerId);
    if (!player) return;

    const playerPos = player.get("position");
    const enemies = [...world.findByTag("zombie"), ...world.findByTag("boss")];

    for (const enemy of enemies) {
      const pos = enemy.get("position");
      const vel = enemy.get("velocity");
      const move = enemy.get("movement");

      const dx = playerPos.x - pos.x;
      const dy = playerPos.y - pos.y;
      const len = Math.hypot(dx, dy) || 1;
      vel.x = (dx / len) * move.speed;
      vel.y = (dy / len) * move.speed;
    }
  }
}
