/**
 * High-Performance Minimalist ECS Boilerplate
 * Optimized for CPU cache locality and speed.
 */

class World {
  constructor() {
    this.entities = [];
    this.components = new Map(); // ComponentName -> Array of data
    this.systems = [];
    this.nextEntityId = 0;
  }

  createEntity() {
    const id = this.nextEntityId++;
    this.entities.push(id);
    return id;
  }

  addComponent(entityId, componentName, data) {
    if (!this.components.has(componentName)) {
      this.components.set(componentName, []);
    }
    this.components.get(componentName)[entityId] = data;
  }

  getComponent(entityId, componentName) {
    return this.components.get(componentName)[entityId];
  }

  query(...componentNames) {
    return this.entities.filter(id => 
      componentNames.every(name => this.components.has(name) && this.components.get(name)[id] !== undefined)
    );
  }

  addSystem(updateFn) {
    this.systems.push(updateFn);
  }

  update(dt) {
    for (const system of this.systems) {
      system(this, dt);
    }
  }
}

// Example Usage:
/*
const world = new World();
const player = world.createEntity();
world.addComponent(player, 'position', { x: 0, y: 0 });
world.addComponent(player, 'velocity', { x: 5, y: 5 });

world.addSystem((w, dt) => {
  const ents = w.query('position', 'velocity');
  for (const id of ents) {
    const pos = w.getComponent(id, 'position');
    const vel = w.getComponent(id, 'velocity');
    pos.x += vel.x * dt;
    pos.y += vel.y * dt;
  }
});
*/

export { World };
