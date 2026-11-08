/**
 * Simple Quadtree for 2D Spatial Partitioning
 */

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
  }

  contains(point) {
    return (point.x >= this.x - this.w &&
            point.x <= this.x + this.w &&
            point.y >= this.y - this.h &&
            point.y <= this.y + this.h);
  }

  intersects(range) {
    return !(range.x - range.w > this.x + this.w ||
             range.x + range.w < this.x - this.w ||
             range.y - range.h > this.y + this.h ||
             range.y + range.h < this.y - this.h);
  }
}

class QuadTree {
  constructor(boundary, n) {
    this.boundary = boundary; // Rectangle
    this.capacity = n;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w / 2;
    let h = this.boundary.h / 2;

    this.northeast = new QuadTree(new Rectangle(x + w, y - h, w, h), this.capacity);
    this.northwest = new QuadTree(new Rectangle(x - w, y - h, w, h), this.capacity);
    this.southeast = new QuadTree(new Rectangle(x + w, y + h, w, h), this.capacity);
    this.southwest = new QuadTree(new Rectangle(x - w, y + h, w, h), this.capacity);

    this.divided = true;
  }

  insert(point) {
    if (!this.boundary.contains(point)) return false;

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    } else {
      if (!this.divided) this.subdivide();
      return (this.northeast.insert(point) || this.northwest.insert(point) ||
              this.southeast.insert(point) || this.southwest.insert(point));
    }
  }

  query(range, found = []) {
    if (!this.boundary.intersects(range)) return found;

    for (let p of this.points) {
      if (range.contains(p)) found.push(p);
    }

    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }
}

export { QuadTree, Rectangle };
