function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

class RenderObject {
  constructor(map, type, layerObjects = []) {
    this.id = "ObjectRender-" + makeid(12);
    this.type = type;
    this.map = map;
    this.rendered = false;
    this.layerObjects = layerObjects;
  }
  _setLayerObject(layerObjects) {
    this._remove();
    this.layerObjects = layerObjects;
  }
  _add() {
    for (let i = 0; i < this.layerObjects.length; i++) {
      this.map.addLayer(this.layerObjects[i]);
    }
  }
  _remove() {
    for (let i = 0; i < this.layerObjects.length; i++) {
      this.map.removeLayer(this.layerObjects[i]);
    }
  }
  add() {
    if (this.rendered) return;
    this.rendered = true;
    this._add();
  }
  remove() {
    if (!this.rendered) return;
    this.rendered = false;
    this._remove();
  }
}

class PolygonGround extends RenderObject {
  constructor(map, listNode) {
    super(map, "PolygonGround");
    this.listNode = listNode;
    this._setLayerObject([
      L.polygon(listNode, {
        color: "red",
        fill: true,
        weight: 0.5,
        opacity: 0.1,
      }),
    ]);
  }
}

class LimitPolygonQuanThanh extends PolygonGround {
  constructor(map) {
    super(map, [
      [21.04238891600005, 105.84432983400006],
      [21.040599823000036, 105.84552002000004],
      [21.039987954000026, 105.84756442500009],
      [21.03993984600004, 105.84739686100005],
      [21.039363861000027, 105.84461212200006],
      [21.035034180000025, 105.84410858200005],
      [21.035678864000033, 105.84111022900004],
      [21.035047531000032, 105.84101104700005],
      [21.035186768000074, 105.83959960900006],
      [21.036159515000065, 105.83967590300006],
      [21.03655433700004, 105.83659362800006],
      [21.038862228000028, 105.83706665000005],
      [21.039076785000077, 105.83569650200008],
      [21.04165458700004, 105.83628845200008],
      [21.044038773000068, 105.83628082300004],
      [21.04238891600005, 105.84432983400006],
    ]);
  }
}

class RouterNode extends RenderObject {
  constructor(map, listNode, color = "blue", weight = 3, opacity = 0.5) {
    super(map, "RouterNode");
    this.listNode = listNode;
    this.color = color;
    this.weight = weight;
    this.opacity = opacity;
    this._setLayerObject([
      L.polyline(listNode, {
        color: color,
        weight: weight,
        opacity: opacity,
      }),
    ]);
  }
}

class PointNode extends RenderObject {
  constructor(map, pos) {
    super(map, "PointNode");
    this.pos = pos;
    this._setLayerObject([L.circle(pos, { radius: 3 })]);
  }
}

function EasyIcon(iconUrl, iconSize) {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
    popupAnchor: [0, -iconSize],
  });
}

class MarkerNode extends RenderObject {
  constructor(map, pos, text, icon = null) {
    super(map, "MarkerNode");
    this.pos = pos;
    this.text = text;
    this.icon = icon;
    this._setLayerObject([
      L.marker(pos, {
        title: text,
        icon: icon,
      }),
    ]);
  }
}
