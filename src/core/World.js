export class World {
  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.toAdd = [];
    this.toRemove = new Set();
    this.state = {
      time: 0,
      kills: 0,
      gameOver: false,
      input: null,
      audio: null,
      canvas: null,
      ctx: null,
      playerId: null,
      mission: null,
    };
  }

  addSystem(system) {
    this.systems.push(system);
    return this;
  }

  spawn(entity) {
    this.toAdd.push(entity);
    return entity;
  }

  remove(entityId) {
    this.toRemove.add(entityId);
  }

  flushEntityQueues() {
    for (const entity of this.toAdd) {
      this.entities.set(entity.id, entity);
    }
    this.toAdd.length = 0;

    for (const entityId of this.toRemove) {
      this.entities.delete(entityId);
    }
    this.toRemove.clear();
  }

  update(dt) {
    this.state.time += dt;
    this.flushEntityQueues();

    for (const system of this.systems) {
      system.update(this, dt);
      this.flushEntityQueues();
    }
  }

  getById(id) {
    return this.entities.get(id) ?? null;
  }

  findByTag(tag) {
    const result = [];
    for (const entity of this.entities.values()) {
      if (entity.tag === tag) result.push(entity);
    }
    return result;
  }

  findByComponents(...names) {
    const result = [];
    for (const entity of this.entities.values()) {
      if (names.every((name) => entity.has(name))) {
        result.push(entity);
      }
    }
    return result;
  }
}
