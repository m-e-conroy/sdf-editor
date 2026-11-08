/**
 * Robust Tiny ECS
 * Supports entity disposal, cleanup, and group selection.
 */

export class ECS {
  constructor() {
    this.entities = new Set();
    this.components = new Map(); // Name -> Map(EntityId -> Data)
    this.nextId = 0;
  }

  createEntity() {
    const id = this.nextId++;
    this.entities.add(id);
    return id;
  }

  destroyEntity(id) {
    this.entities.delete(id);
    for (const store of this.components.values()) {
      store.delete(id);
    }
  }

  set(id, name, data) {
    if (!this.components.has(name)) this.components.set(name, new Map());
    this.components.get(name).set(id, data);
    return this;
  }

  get(id, name) {
    return this.components.get(name)?.get(id);
  }

  /**
   * Returns entities having ALL specified components
   */
  query(...names) {
    const result = [];
    for (const id of this.entities) {
      if (names.every(name => this.components.get(name)?.has(id))) {
        result.push(id);
      }
    }
    return result;
  }

  // Helper for system logic
  each(names, callback) {
    const ents = this.query(...names);
    for (const id of ents) {
      const data = names.map(n => this.get(id, n));
      callback(id, ...data);
    }
  }
}
