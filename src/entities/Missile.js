import { Entity } from "../core/Entity.js";

export function createMissile(x, y, cfg, targetId) {
  return new Entity("missile")
    .add("position", { x, y })
    .add("velocity", { x: 0, y: 0 })
    .add("collider", { radius: cfg.radius })
    .add("damage", { amount: cfg.damage })
    .add("lifetime", { left: cfg.ttl })
    .add("homing", { speed: cfg.speed, targetId });
}
