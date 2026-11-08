/**
 * Lightweight Behavior Tree Runner
 */

export const BT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  RUNNING: 'RUNNING'
};

export class Node {
  constructor(name = 'Node') {
    this.name = name;
  }
  tick(context) { return BT_STATUS.SUCCESS; }
}

export class Sequence extends Node {
  constructor(children) {
    super('Sequence');
    this.children = children;
  }

  tick(context) {
    for (const child of this.children) {
      const status = child.tick(context);
      if (status !== BT_STATUS.SUCCESS) return status;
    }
    return BT_STATUS.SUCCESS;
  }
}

export class Selector extends Node {
  constructor(children) {
    super('Selector');
    this.children = children;
  }

  tick(context) {
    for (const child of this.children) {
      const status = child.tick(context);
      if (status !== BT_STATUS.FAILURE) return status;
    }
    return BT_STATUS.FAILURE;
  }
}

export class Task extends Node {
  constructor(name, action) {
    super(name);
    this.action = action;
  }

  tick(context) {
    return this.action(context);
  }
}

// Example:
/*
const tree = new Sequence([
  new Task('HasHealth', ctx => ctx.hp > 0 ? BT_STATUS.SUCCESS : BT_STATUS.FAILURE),
  new Selector([
    new Task('Attack', ctx => ctx.inRange ? BT_STATUS.SUCCESS : BT_STATUS.FAILURE),
    new Task('MoveToPlayer', ctx => { console.log('Moving...'); return BT_STATUS.SUCCESS; })
  ])
]);
*/
