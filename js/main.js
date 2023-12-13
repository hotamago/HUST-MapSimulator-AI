// Common function
function nodeToLngLat(node) {
  if (node.lat == undefined || node.lon == undefined) {
    console.log(node);
    throw new Error("Node must have lat and lon");
  }
  return [node.lat, node.lon];
}
function mousePointToLngLat(point) {
  if (point.lat == undefined || point.lng == undefined) {
    console.log(point);
    throw new Error("Point must have lat and lng");
  }
  return [point.lat, point.lng];
}

function addObjectsFun(anyFun) {
  renderObjects.forEach(function (obj) {
    if (anyFun(obj)) {
      obj.add();
    }
  });
}
function removeObjectsFun(anyFun) {
  renderObjects.forEach(function (obj) {
    if (anyFun(obj)) {
      obj.remove();
    }
  });
}
function eachObjectsFun(anyFun) {
  renderObjects.forEach(anyFun(obj));
}

function autoReRender(obj, layer) {
  if (obj instanceof Pointer) {
    if (obj.val != null) {
      if (obj.val instanceof RenderObject) {
        obj.val.remove();
      } else {
        throw new Error("obj must be RenderObject");
      }
    }
    obj.set(layer);
    if (layer instanceof RenderObject) obj.val.add();
  } else if (obj instanceof RenderObject) {
    if (obj != null) {
      if (obj instanceof RenderObject) {
        obj.remove();
      } else {
        throw new Error("obj must be RenderObject");
      }
    }
    obj = layer;
    if (layer instanceof RenderObject) obj.add();
  } else if (obj == null) {
    obj = layer;
    if (layer instanceof RenderObject) obj.add();
  } else {
    throw new Error("Not support type");
  }
}

// Meathod path condition
let meathodPathCondition = {
  motorcar: function (path) {
    if (path.motorcar == "no") {
      return false;
    }
    return true;
  },
  motorcycle: function (path) {
    if (path.motorcycle == "no") {
      return false;
    }
    return true;
  },
  walk: function (path) {
    return true;
  },
  aerodyne: function (path) {
    return true;
  },
};

// Global variables
let renderObjects = [];
let docEle = {
  map: null,
  info: null,
  "btn-start": null,
  "btn-end": null,
  "btn-find": null,
  "btn-toggle-show-path": null,
  "btn-toggle-show-node": null,
  "select-meathod-find-path": null,
  "display-number-of-nodes-in-path": null,
  "display-number-of-nodes-searched": null,
  "select-vehicle": null,
  "display-total-length-of-path": null,
  "btn-toggle-show-history-path": null,
  "select-delay-replay-history-path": null,
};
let map = null;
let mapEnum = {
  stnode: 0,
  endnode: 1,
};
let mapState = {
  curVehicle: "motorcar",
  nodeFiltered: [],
  wayFiltered: [],
  modeSetNode: mapEnum.stnode,
  listNodeID: [],
  listNodeRoute: [],
  stnode: {
    orgNode: null,
    fixNode: null,
    shortRoute: mkptr(null),
  },
  endnode: {
    orgNode: null,
    fixNode: null,
    shortRoute: mkptr(null),
  },
  routePath: mkptr(null),
  findPathMethod: {
    Dijkstra: null,
    AStar: null,
    Stupid: null,
    Greedy: null,
    AStarHota: null,
  },
  curNameMeathodFindPath: "Dijkstra",
  curShowHistoryPath: false,
  curDelayReplayHistoryPath: 0,
  autoInterval: new AutoInterval(),
  pastHistoryPath: [],
  historyRoute: [],
};
let mapIDNode = new Map();

let autoIDMapper = new AutoMapID();

let kdTree = null;

window.addEventListener("load", function () {
  // Set document element
  for (let key in docEle) {
    docEle[key] = document.getElementById(key);
  }

  // Init map
  map = L.map("map", {
    attributionControl: false,
    center: [21.0395, 105.84106],
    zoom: 17,
  });

  // add tile để map có thể hoạt động, xài free từ OSM
  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // L.circle([21.0395, 105.84106], { id: "test-point", radius: 10 }).addTo(map);

  // Add polygon limit line
  let polygonLimitLine = new LimitPolygonQuanThanh(map);
  polygonLimitLine.add();
  renderObjects.push(polygonLimitLine);

  // Filter route
  let tempNodeMap = new Map();
  for (let i = 0; i < mapData.elements.length; i++) {
    if (mapData.elements[i].type == "node") {
      tempNodeMap.set(mapData.elements[i].id, mapData.elements[i]);
    }
  }
  for (let i = 0; i < mapData.elements.length; i++) {
    if (mapData.elements[i].type == "way") {
      // Only get way have tag highway
      if (
        mapData.elements[i].tags == undefined ||
        mapData.elements[i].tags.highway == undefined
      )
        continue;

      let ok = true;
      let listPosNode = [];
      for (let j = 0; j < mapData.elements[i].nodes.length; j++) {
        let node = tempNodeMap.get(mapData.elements[i].nodes[j]);
        listPosNode.push(nodeToLngLat(node));
        mapIDNode.set(node.id, node);
      }
      if (ok) {
        mapState.wayFiltered.push(mapData.elements[i]);
      }
    }
  }

  // Fillter node
  for (let i = 0; i < mapData.elements.length; i++) {
    if (mapData.elements[i].type == "node") {
      if (!mapIDNode.has(mapData.elements[i].id)) continue;
      mapState.nodeFiltered.push(mapData.elements[i]);
    }
  }

  // Add all PointNode
  for (let i = 0; i < mapState.nodeFiltered.length; i++) {
    let ele = mapState.nodeFiltered[i];
    renderObjects.push(new PointNode(map, nodeToLngLat(ele)));
  }

  // Add all route
  for (let i = 0; i < mapState.wayFiltered.length; i++) {
    let ele = mapState.wayFiltered[i];
    let listPosNode = [];
    for (let j = 0; j < ele.nodes.length; j++) {
      let node = mapIDNode.get(ele.nodes[j]);
      listPosNode.push(nodeToLngLat(node));
    }
    renderObjects.push(new RouterNode(map, listPosNode));
  }

  // Convert node to KDTree node input
  let listNodeTemp = [];
  for (let i = 0; i < mapState.nodeFiltered.length; i++) {
    let ele = mapState.nodeFiltered[i];
    if (ele.type == "node") {
      mapState.listNodeID.push(ele.id);
      listNodeTemp.push(new NodeKDTreeInput(nodeToLngLat(ele), ele.id));
      autoIDMapper.add(ele.id, i);
    }
  }

  // Init stuct
  kdTree = new KDTree(listNodeTemp, function (node1, node2) {
    // console.log(node1, node2);
    return Math.sqrt(
      Math.pow(node1[0] - node2[0], 2) + Math.pow(node1[1] - node2[1], 2)
    );
  });

  // Convert way to node route
  for (let i = 0; i < mapState.nodeFiltered.length; i++) {
    let ele = mapState.nodeFiltered[i];
    if (mapState.listNodeRoute[autoIDMapper.encodeID(ele.id)] == undefined) {
      mapState.listNodeRoute[autoIDMapper.encodeID(ele.id)] = new NodeFP([], {
        pos: nodeToLngLat(ele),
      });
    }
  }
  for (let i = 0; i < mapState.wayFiltered.length; i++) {
    let ele = mapState.wayFiltered[i];
    for (let j = 1; j < ele.nodes.length; j++) {
      let elePreNode = ele.nodes[j - 1];
      let eleCurNode = ele.nodes[j];
      mapState.listNodeRoute[autoIDMapper.encodeID(elePreNode)].paths.push(
        new PathFP(autoIDMapper.encodeID(eleCurNode), {
          ...ele.tags,
        })
      );
      if (!(ele.tags != undefined && ele.tags.oneway == "yes")) {
        mapState.listNodeRoute[autoIDMapper.encodeID(eleCurNode)].paths.push(
          new PathFP(autoIDMapper.encodeID(elePreNode), {
            ...ele.tags,
          })
        );
      }
    }
  }

  // Init Find path method
  mapState.findPathMethod["Dijkstra"] = new Dijkstra(
    mapState.listNodeRoute,
    null
  );
  mapState.findPathMethod["AStar"] = new AStar(mapState.listNodeRoute, null);
  mapState.findPathMethod["Stupid"] = new Stupid(mapState.listNodeRoute, null);
  mapState.findPathMethod["Greedy"] = new Greedy(mapState.listNodeRoute, null);
  mapState.findPathMethod["AStarHota"] = new AStarHota(
    mapState.listNodeRoute,
    null
  );

  mapState.curVehicle = docEle["select-vehicle"].value;
  for (let key in mapState.findPathMethod) {
    mapState.findPathMethod[key].funcCondition =
      meathodPathCondition[mapState.curVehicle];
  }

  // Return the coordinates and longitude,latitude of the mouse pointer
  map.on("mousemove", function (e) {
    // console.log(e);
    document.getElementById("info").innerHTML =
      // e.point is the x, y coordinates of the mousemove event relative
      // to the top-left corner of the map
      JSON.stringify(e.containerPoint) +
      "<br />" +
      // e.lngLat is the longitude, latitude geographical position of the event
      JSON.stringify(e.latlng);
  });

  // Mouse click
  map.on("click", function (e) {
    if (mapState.modeSetNode == mapEnum.stnode) {
      if (mapState.stnode.orgNode != null) {
        mapState.stnode.orgNode.remove();
      }
      mapState.stnode.orgNode = new MarkerNode(
        map,
        mousePointToLngLat(e.latlng),
        "Start",
        EasyIcon("img/sticon.png", 24)
      );
      mapState.stnode.orgNode.add();
    } else if (mapState.modeSetNode == mapEnum.endnode) {
      if (mapState.endnode.orgNode != null) {
        mapState.endnode.orgNode.remove();
      }
      mapState.endnode.orgNode = new MarkerNode(
        map,
        mousePointToLngLat(e.latlng),
        "End",
        EasyIcon("img/edicon.png", 24)
      );
      mapState.endnode.orgNode.add();
    }

    // Check if have start and end node
    if (mapState.stnode.orgNode != null && mapState.endnode.orgNode != null) {
      findPathNow();
    }
  });

  // Funtion history path
  function displayHistoryPath(data) {
    let curIndex = data.curIndex;
    let history = data.history;
    if (curIndex >= history.length) {
      return;
    }
    if (curIndex == 0) {
      mapState.historyRoute.forEach((ele) => ele.remove());
      mapState.historyRoute = [];
    }
    let curNode = history[curIndex].curNode;
    let nextNode = history[curIndex].nextNode;
    let listPosNode = [
      nodeToLngLat(mapIDNode.get(curNode)),
      nodeToLngLat(mapIDNode.get(nextNode)),
    ];
    mapState.historyRoute.push(
      new RouterNode(map, listPosNode, "black", 4, 0.6)
    );
    let temp = mapState.historyRoute[mapState.historyRoute.length - 1];
    temp.add();
    data.curIndex++;
  }
  mapState.autoInterval.updateFn(displayHistoryPath);

  // Function find path
  function findPathNow() {
    if (mapState.stnode == null || mapState.endnode == null) {
      alert("Please set start node and end node");
      return;
    }

    // Ester egg
    if (mapState.curVehicle == "aerodyne") {
      autoReRender(mapState.stnode.shortRoute, null);
      autoReRender(mapState.endnode.shortRoute, null);
      autoReRender(
        mapState.routePath,
        new RouterNode(
          map,
          [mapState.stnode.orgNode.pos, mapState.endnode.orgNode.pos],
          "blue",
          3,
          0.8
        )
      );
      mapState.pastHistoryPath = [];
      mapState.autoInterval.updateData({
        history: mapState.pastHistoryPath,
        curIndex: 0,
      });

      // Show number of nodes in path
      docEle["display-number-of-nodes-in-path"].innerHTML = 2;
      // Show number of nodes searched
      docEle["display-number-of-nodes-searched"].innerHTML = 2;

      // Calculate length of path
      let totalLength = calRealDistance(
        mapState.stnode.orgNode.pos,
        mapState.endnode.orgNode.pos
      );
      docEle["display-total-length-of-path"].innerHTML = totalLength.toFixed(2);
      return;
    }

    // Find nearest node
    mapState.stnode.fixNode = kdTree.nns(mapState.stnode.orgNode.pos).data;
    mapState.endnode.fixNode = kdTree.nns(mapState.endnode.orgNode.pos).data;

    // Short name
    let st = mapState.stnode.fixNode;
    let ed = mapState.endnode.fixNode;

    // Add path from org to fix
    autoReRender(
      mapState.stnode.shortRoute,
      new RouterNode(
        map,
        [mapState.stnode.orgNode.pos, nodeToLngLat(mapIDNode.get(st))],
        "red",
        3,
        0.8
      )
    );
    autoReRender(
      mapState.endnode.shortRoute,
      new RouterNode(
        map,
        [mapState.endnode.orgNode.pos, nodeToLngLat(mapIDNode.get(ed))],
        "red",
        3,
        0.8
      )
    );

    // Find path
    let rawRes = mapState.findPathMethod[
      mapState.curNameMeathodFindPath
    ].findPath(autoIDMapper.encodeID(st), autoIDMapper.encodeID(ed));
    let path = autoIDMapper.decodeIDs(rawRes[0]);
    mapState.pastHistoryPath = rawRes[1].map(
      (ele) =>
        new HistoryFP(
          autoIDMapper.decodeID(ele.curNode),
          autoIDMapper.decodeID(ele.nextNode)
        )
    );
    mapState.autoInterval.updateData({
      history: mapState.pastHistoryPath,
      curIndex: 0,
    });

    // Add path
    let listPosNode = [];
    for (let i = 0; i < path.length; i++) {
      listPosNode.push(nodeToLngLat(mapIDNode.get(path[i])));
    }
    autoReRender(
      mapState.routePath,
      new RouterNode(map, listPosNode, "blue", 5, 0.8)
    );

    // Show number of nodes in path
    docEle["display-number-of-nodes-in-path"].innerHTML = path.length;

    // Show number of nodes searched
    docEle["display-number-of-nodes-searched"].innerHTML =
      mapState.pastHistoryPath.length;

    // Calculate length of path
    let totalLength =
      calRealDistance(
        mapState.stnode.orgNode.pos,
        nodeToLngLat(mapIDNode.get(st))
      ) +
      calRealDistance(
        nodeToLngLat(mapIDNode.get(ed)),
        mapState.endnode.orgNode.pos
      );
    for (let i = 1; i < path.length; i++) {
      totalLength += calRealDistance(
        nodeToLngLat(mapIDNode.get(path[i - 1])),
        nodeToLngLat(mapIDNode.get(path[i]))
      );
    }
    docEle["display-total-length-of-path"].innerHTML = totalLength.toFixed(2);
  }

  // Mode set node switch
  docEle["btn-start"].addEventListener("click", function () {
    mapState.modeSetNode = mapEnum.stnode;
  });
  docEle["btn-end"].addEventListener("click", function () {
    mapState.modeSetNode = mapEnum.endnode;
  });

  // Toggle show path
  docEle["btn-toggle-show-path"].addEventListener("change", function () {
    if (docEle["btn-toggle-show-path"].checked) {
      addObjectsFun((obj) => obj.type == "RouterNode");
    } else {
      removeObjectsFun((obj) => obj.type == "RouterNode");
    }
  });

  // Toggle show ground
  docEle["btn-toggle-show-node"].addEventListener("change", function () {
    if (docEle["btn-toggle-show-node"].checked) {
      addObjectsFun((obj) => obj.type == "PointNode");
    } else {
      removeObjectsFun((obj) => obj.type == "PointNode");
    }
  });

  // Select meathod find path
  docEle["select-meathod-find-path"].addEventListener("change", function () {
    mapState.curNameMeathodFindPath = docEle["select-meathod-find-path"].value;
    // Check if have start and end node
    if (mapState.stnode.orgNode != null && mapState.endnode.orgNode != null) {
      findPathNow();
    }
  });

  // Select vehicle
  docEle["select-vehicle"].addEventListener("change", function () {
    mapState.curVehicle = docEle["select-vehicle"].value;
    for (let key in mapState.findPathMethod) {
      mapState.findPathMethod[key].funcCondition =
        meathodPathCondition[mapState.curVehicle];
    }
    // Check if have start and end node
    if (mapState.stnode.orgNode != null && mapState.endnode.orgNode != null) {
      findPathNow();
    }
  });

  // Toggle show history path
  docEle["btn-toggle-show-history-path"].addEventListener(
    "change",
    function () {
      mapState.curShowHistoryPath =
        docEle["btn-toggle-show-history-path"].checked;
      if (mapState.curShowHistoryPath) {
        mapState.autoInterval.start();
      } else {
        mapState.autoInterval.stop();
        // Remove history path
        mapState.historyRoute.forEach((ele) => ele.remove());
        mapState.historyRoute = [];
      }
    }
  );

  // Select delay replay history path
  docEle["select-delay-replay-history-path"].addEventListener(
    "change",
    function () {
      mapState.curDelayReplayHistoryPath =
        docEle["select-delay-replay-history-path"].value;
      mapState.autoInterval.updateTime(
        parseInt(mapState.curDelayReplayHistoryPath)
      );
    }
  );
});
