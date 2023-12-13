class Vector2 {
  constructor(x, y = null) {
    if (y == null) {
      this.x = x.x;
      this.y = x.y;
      return;
    } else {
      this.x = x;
      this.y = y;
    }
  }
  // Overload operators
  add(vector) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }
  sub(vector) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }
  mul(vector) {
    return new Vector2(this.x * vector.x, this.y * vector.y);
  }
  div(vector) {
    return new Vector2(this.x / vector.x, this.y / vector.y);
  }
  // Scalar operations
  addScalar(scalar) {
    return new Vector2(this.x + scalar, this.y + scalar);
  }
  subScalar(scalar) {
    return new Vector2(this.x - scalar, this.y - scalar);
  }
  mulScalar(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }
  divScalar(scalar) {
    return new Vector2(this.x / scalar, this.y / scalar);
  }
  // Other operations
  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  }
  cross(vector) {
    return this.x * vector.y - this.y * vector.x;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalize() {
    return this.divScalar(this.length());
  }
  // Static methods
  static add(vector1, vector2) {
    return new Vector2(vector1.x + vector2.x, vector1.y + vector2.y);
  }
  static sub(vector1, vector2) {
    return new Vector2(vector1.x - vector2.x, vector1.y - vector2.y);
  }
  static mul(vector1, vector2) {
    return new Vector2(vector1.x * vector2.x, vector1.y * vector2.y);
  }
  static div(vector1, vector2) {
    return new Vector2(vector1.x / vector2.x, vector1.y / vector2.y);
  }
  static addScalar(vector, scalar) {
    return new Vector2(vector.x + scalar, vector.y + scalar);
  }
  static subScalar(vector, scalar) {
    return new Vector2(vector.x - scalar, vector.y - scalar);
  }
  static mulScalar(vector, scalar) {
    return new Vector2(vector.x * scalar, vector.y * scalar);
  }
  static divScalar(vector, scalar) {
    return new Vector2(vector.x / scalar, vector.y / scalar);
  }
  static dot(vector1, vector2) {
    return vector1.x * vector2.x + vector1.y * vector2.y;
  }
  static cross(vector1, vector2) {
    return vector1.x * vector2.y - vector1.y * vector2.x;
  }
  static length(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }
  static normalize(vector) {
    return vector.divScalar(vector.length());
  }
  // Caculate agnle between two vectors
  static angleBetween(vector1, vector2) {
    let dot = Vector2.dot(vector1, vector2);
    let length1 = Vector2.length(vector1);
    let length2 = Vector2.length(vector2);
    return Math.acos(dot / (length1 * length2));
  }
}

function pointInPolygon(point, polygon) {
  const x = point[0];
  const y = point[1];

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}
