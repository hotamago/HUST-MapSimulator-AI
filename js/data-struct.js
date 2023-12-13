class NodeKDTree {
  constructor(point, left, right, data = null) {
    this.point = point;
    this.left = left;
    this.right = right;
    this.data = data;
  }
}
class NodeKDTreeInput {
  constructor(pos, data = null) {
    this.pos = pos;
    this.data = data;
  }
}
class KDTree {
  constructor(points, distance, numdim = 2) {
    this.points = points;
    // Check if points is array and element is NodeKDTreeInput
    if (!Array.isArray(points)) {
      throw new Error("Points must be array");
    }
    for (let i = 0; i < points.length; i++) {
      if (!(points[i] instanceof NodeKDTreeInput)) {
        throw new Error("Points must be NodeKDTreeInput");
      }
    }
    this.root = this.buildKdTree(points);
    this.distance = distance;
    this.numdim = numdim;
  }

  buildKdTree(points, depth = 0) {
    if (points.length === 0) {
      return null;
    }

    const axis = depth % this.numdim; // Assuming 2D space

    points.sort((a, b) => a.pos[axis] - b.pos[axis]);

    const medianIndex = Math.floor(points.length / 2);
    const median = points[medianIndex];

    const left = this.buildKdTree(points.slice(0, medianIndex), depth + 1);
    const right = this.buildKdTree(points.slice(medianIndex + 1), depth + 1);

    return new NodeKDTree(median.pos, left, right, median.data);
  }

  shouldCheckOppositeBranch(target, currentBest, potentialBest) {
    if (potentialBest === null) {
      return false;
    }

    const dist = this.distance(target, currentBest.point);
    const radius = this.distance(target, potentialBest.point);

    return radius < dist;
  }

  closerPoint(target, p1, p2) {
    if (p1 === null) {
      return p2;
    }

    if (p2 === null) {
      return p1;
    }

    const dist1 = this.distance(target, p1.point);
    const dist2 = this.distance(target, p2.point);

    return dist1 < dist2 ? p1 : p2;
  }

  nearestNeighborSearch(root, target, depth = 0, best = null) {
    if (root === null) {
      return best;
    }

    const axis = depth % this.numdim; // Assuming 2D space

    let nextBranch = null;
    let oppositeBranch = null;

    if (target[axis] < root.point[axis]) {
      nextBranch = root.left;
      oppositeBranch = root.right;
    } else {
      nextBranch = root.right;
      oppositeBranch = root.left;
    }

    best = this.closerPoint(
      target,
      this.nearestNeighborSearch(nextBranch, target, depth + 1, best),
      root
    );

    if (this.shouldCheckOppositeBranch(target, root, best)) {
      best = this.closerPoint(
        target,
        this.nearestNeighborSearch(oppositeBranch, target, depth + 1, best),
        root
      );
    }

    return best;
  }

  nns(target) {
    return this.nearestNeighborSearch(this.root, target);
  }
}

// PrioryQueue get in time O(1) for get min value, add in O(log(n))
class QElement {
  constructor(element, priority) {
    this.element = element;
    this.priority = priority;
  }
}
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Common function
  isEmpty() {
    return this.heap.length === 0;
  }
  size() {
    return this.heap.length;
  }

  // Helper Methods
  getLeftChildIndex(parentIndex) {
    return 2 * parentIndex + 1;
  }

  getRightChildIndex(parentIndex) {
    return 2 * parentIndex + 2;
  }

  getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }

  hasLeftChild(index) {
    return this.getLeftChildIndex(index) < this.heap.length;
  }

  hasRightChild(index) {
    return this.getRightChildIndex(index) < this.heap.length;
  }

  hasParent(index) {
    return this.getParentIndex(index) >= 0;
  }

  leftChild(index) {
    return this.heap[this.getLeftChildIndex(index)];
  }

  rightChild(index) {
    return this.heap[this.getRightChildIndex(index)];
  }

  parent(index) {
    return this.heap[this.getParentIndex(index)];
  }

  swap(indexOne, indexTwo) {
    const temp = this.heap[indexOne];
    this.heap[indexOne] = this.heap[indexTwo];
    this.heap[indexTwo] = temp;
  }

  peek() {
    if (this.heap.length === 0) {
      return null;
    }
    return this.heap[0];
  }

  // Removing an element will remove the
  // top element with highest priority then
  // heapifyDown will be called
  remove() {
    if (this.heap.length === 0) {
      return null;
    }
    const item = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.heapifyDown();
    return item;
  }

  add(item) {
    // Vetify item is QElement
    if (!(item instanceof QElement)) {
      throw new Error("Item must be QElement");
    }
    this.heap.push(item);
    this.heapifyUp();
  }

  // Compare function
  compare(a, b) {
    if (a.priority < b.priority) {
      return -1;
    }
    if (a.priority > b.priority) {
      return 1;
    }
    return 0;
  }

  heapifyUp() {
    let index = this.heap.length - 1;
    while (
      this.hasParent(index) &&
      this.compare(this.parent(index), this.heap[index]) > 0
    ) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }

  heapifyDown() {
    let index = 0;
    while (this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      if (
        this.hasRightChild(index) &&
        this.compare(this.rightChild(index), this.leftChild(index)) < 0
      ) {
        smallerChildIndex = this.getRightChildIndex(index);
      }
      if (this.compare(this.heap[index], this.heap[smallerChildIndex]) < 0) {
        break;
      } else {
        this.swap(index, smallerChildIndex);
      }
      index = smallerChildIndex;
    }
  }

  poll() {
    let item = this.peek();
    this.remove();
    return item;
  }
}

class AutoMapID {
  constructor() {
    this.map = new Map();
    this.mapReverse = new Map();
  }
  add(id1, id2) {
    this.map.set(id1, id2);
    this.mapReverse.set(id2, id1);
  }
  vaildMapExistElement(map, id) {
    if (!map.has(id)) {
      throw new Error(`ID ( ${id} ) not exist`);
    }
  }
  encodeID(id) {
    this.vaildMapExistElement(this.map, id);
    return this.map.get(id);
  }
  decodeID(id) {
    this.vaildMapExistElement(this.mapReverse, id);
    return this.mapReverse.get(id);
  }
  encodeIDs(ids) {
    return ids.map((id) => this.encodeID(id));
  }
  decodeIDs(ids) {
    return ids.map((id) => this.decodeID(id));
  }
}

class Pointer {
  constructor(val) {
    this.val = val;
  }
  set(value) {
    this.val = value;
  }
}

function mkptr(val) {
  return new Pointer(val);
}

class AutoInterval {
  constructor(fn = null, data = null, time = 0) {
    this.fn = fn;
    this.time = time;
    this.data = data;
    this.interval = null;
  }
  start() {
    if (this.interval !== null) {
      return;
    }
    this.fn(this.data);
    this.interval = setInterval(this.fn, this.time, this.data);
  }
  stop() {
    if (this.interval === null) {
      return;
    }
    clearInterval(this.interval);
    this.interval = null;
  }
  restart() {
    this.stop();
    this.start();
  }
  // Update options
  updateFn(fn) {
    this.fn = fn;
    if (this.interval !== null) this.restart();
  }
  updateData(data) {
    this.data = data;
    if (this.interval !== null) this.restart();
  }
  updateTime(time) {
    this.time = time;
    if (this.interval !== null) this.restart();
  }
}
