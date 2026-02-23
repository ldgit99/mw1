import { System } from "../core/System.js";

export class MovementSystem extends System {
  update(world, dt) {
    const missiles = world.findByTag("missile");
    for (const missile of missiles) {
      const homing = missile.get("homing");
      const vel = missile.get("velocity");
      const pos = missile.get("position");
      const boss = world.getById(homing.targetId);

      if (!boss) {
        continue;
      }

      const bPos = boss.get("position");
      const dx = bPos.x - pos.x;
      const dy = bPos.y - pos.y;
      const len = Math.hypot(dx, dy) || 1;
      vel.x = (dx / len) * homing.speed;
      vel.y = (dy / len) * homing.speed;
    }

    const entities = world.findByComponents("position", "velocity");
    const { width, height } = world.state.canvas;

    for (const entity of entities) {
      const pos = entity.get("position");
      const vel = entity.get("velocity");
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;

      const collider = entity.get("collider");
      const radius = collider ? collider.radius : 0;
      pos.x = Math.max(radius, Math.min(width - radius, pos.x));
      pos.y = Math.max(radius, Math.min(height - radius, pos.y));
    }

    const bullets = world.findByComponents("lifetime");
    for (const bullet of bullets) {
      const lifetime = bullet.get("lifetime");
      lifetime.left -= dt;
      if (lifetime.left <= 0) {
        world.remove(bullet.id);
      }
    }
  }
}
