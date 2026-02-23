import { Entity } from "../core/Entity.js";

export function createPlayer(x, y, cfg) {
  return new Entity("player")
    .add("position", { x, y })
    .add("velocity", { x: 0, y: 0 })
    .add("movement", { speed: cfg.speed })
    .add("health", { current: cfg.maxHealth, max: cfg.maxHealth })
    .add("collider", { radius: cfg.radius })
    .add("weapon", {
      cooldown: cfg.fireCooldown,
      cooldownLeft: 0,
      bulletSpeed: cfg.bulletSpeed,
      bulletDamage: cfg.bulletDamage,
      bulletRadius: cfg.bulletRadius,
    })
    .add("render", { color: "#6ee7b7" });
}
