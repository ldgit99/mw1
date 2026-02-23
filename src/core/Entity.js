export class Entity {
  static nextId = 1;

  constructor(tag) {
    this.id = Entity.nextId++;
    this.tag = tag;
    this.alive = true;
    this.components = new Map();
  }

  add(name, value) {
    this.components.set(name, value);
    return this;
  }

  get(name) {
    return this.components.get(name);
  }

  has(name) {
    return this.components.has(name);
  }
}
