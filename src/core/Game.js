export class Game {
  constructor(world, config) {
    this.world = world;
    this.config = config;
    this.lastTime = 0;
    this.running = false;
  }

  start() {
    this.running = true;
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(timestampMs) {
    if (!this.running) return;

    if (this.lastTime === 0) {
      this.lastTime = timestampMs;
    }

    const rawDt = (timestampMs - this.lastTime) / 1000;
    const dt = Math.min(rawDt, this.config.maxDeltaTime);
    this.lastTime = timestampMs;

    this.world.update(dt);

    requestAnimationFrame((t) => this.loop(t));
  }
}
