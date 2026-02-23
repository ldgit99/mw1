import { Entity } from "../core/Entity.js";

export function createApple(x, y, cfg) {
  return new Entity("apple")
    .add("position", { x, y })
    .add("collider", { radius: cfg.radius });
}
