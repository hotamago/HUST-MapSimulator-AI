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
  // Common
  toString() {
    return "(" + this.x + ", " + this.y + ")";
  }
  toArray() {
    return [this.x, this.y];
  }
}

arr2vector = (arr) => {
  return new Vector2(arr[0], arr[1]);
};

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

// Calculate distance between 2 coordinate
function calRealDistance(origin, destination) {
  // return distance in meters
  var lon1 = toRadian(origin[1]),
    lat1 = toRadian(origin[0]),
    lon2 = toRadian(destination[1]),
    lat2 = toRadian(destination[0]);

  var deltaLat = lat2 - lat1;
  var deltaLon = lon2 - lon1;

  var a =
    Math.pow(Math.sin(deltaLat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
  var c = 2 * Math.asin(Math.sqrt(a));
  var EARTH_RADIUS = 6371;
  return c * EARTH_RADIUS * 1000;
}

function toRadian(degree) {
  return (degree * Math.PI) / 180;
}

// Get nearest point in line to a point
function getNearestPoint2Point(p1, p2, vectorPos) {
  let vector1 = Vector2.sub(p1, vectorPos);
  let vector2 = Vector2.sub(p2, vectorPos);
  let vector3 = Vector2.sub(p1, p2);
  let agnle1 = Vector2.angleBetween(vector1, Vector2.sub(p1, p2));
  let agnle2 = Vector2.angleBetween(vector2, Vector2.sub(p2, p1));
  if (agnle1 <= Math.PI / 2 && agnle2 <= Math.PI / 2) {
    let p = (vector3.length() + vector1.length() + vector2.length()) / 2;
    let h =
      (2 / vector3.length()) *
      Math.sqrt(
        p *
          (p - vector3.length()) *
          (p - vector1.length()) *
          (p - vector2.length())
      );
    let vector4 = Vector2.sub(p1, p2);
    let vector5 = vector4.normalize().mulScalar(h);
    let vector6 = Vector2.add(vectorPos, vector5);
    return vector6;
  }
  if (vector1.length() < vector2.length()) {
    return p1;
  }
  return p2;
}
