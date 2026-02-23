import { Entity } from "../core/Entity.js";

export function createBoss(x, y, cfg) {
  return new Entity("boss")
    .add("position", { x, y })
    .add("velocity", { x: 0, y: 0 })
    .add("movement", { speed: cfg.speed })
    .add("health", { current: cfg.hitPoints, max: cfg.hitPoints })
    .add("collider", { radius: cfg.radius })
    .add("render", { color: "#e9f7ff" });
}
