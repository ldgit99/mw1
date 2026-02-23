import { Entity } from "../core/Entity.js";
import { GAME_CONFIG } from "../config/constants.js";

export function createBullet(x, y, vx, vy, radius, damage) {
  return new Entity("bullet")
    .add("position", { x, y })
    .add("velocity", { x: vx, y: vy })
    .add("collider", { radius })
    .add("damage", { amount: damage })
    .add("lifetime", { left: GAME_CONFIG.bullet.ttl })
    .add("render", { color: "#facc15" });
}
