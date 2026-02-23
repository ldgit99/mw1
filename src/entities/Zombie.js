import { Entity } from "../core/Entity.js";

export function createZombie(x, y, cfg) {
  return new Entity("zombie")
    .add("position", { x, y })
    .add("velocity", { x: 0, y: 0 })
    .add("movement", { speed: cfg.speed })
    .add("health", { current: cfg.health, max: cfg.health })
    .add("collider", { radius: cfg.radius })
    .add("zombieType", {
      form: cfg.form ?? 0,
      kind: cfg.kind ?? "ghost",
      name: cfg.name ?? "유령",
    })
    .add("zombieAI", {})
    .add("render", { color: "#84cc16" });
}
