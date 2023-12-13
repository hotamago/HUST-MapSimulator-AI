// Common function
function getDistance(pos1, pos2) {
  return Math.sqrt(
    Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)
  );
}

function defaultfuncCondition(path) {
  return true;
}

class PathFP {
  constructor(node, data = null) {
    this.node = node;
    this.data = data;
  }
}
class NodeFP {
  constructor(paths, data = null) {
    // check if paths is an array
    if (!Array.isArray(paths)) {
      throw new Error("Path must be array");
    }
    // Check if each path is PathFP
    for (let i = 0; i < paths.length; i++) {
      if (!(paths[i] instanceof PathFP)) {
        throw new Error("Path must be PathFP");
      }
    }
    // path is list of index node
    this.paths = paths;
    this.data = data;
  }
}
class HistoryFP {
  constructor(curNode, nextNode) {
    this.curNode = curNode;
    this.nextNode = nextNode;
  }
}

class FindPathMeathod {
  constructor(nodes, funcCondition = null, name = "Unknow") {
    this.nodes = nodes;
    // Check vaild nodes
    for (let i = 0; i < nodes.length; i++) {
      this.checkVaildNode(nodes[i]);
    }
    if (funcCondition == null) {
      this.funcCondition = defaultfuncCondition;
    } else {
      this.funcCondition = funcCondition;
    }
    this.name = name;
  }
  checkVaildNode(node) {
    // Check node is NodeFP
    if (!(node instanceof NodeFP)) {
      throw new Error("Node must be NodeFP");
    }
  }
  findPath(start, end) {
    throw new Error("Method not implemented.");
  }
}

class CustomFindPathMeathod extends FindPathMeathod {
  constructor(
    nodes,
    funcCondition = null,
    funcCalPriority = null,
    name = "CustomFindPathMeathod"
  ) {
    super(nodes, funcCondition, name);
    this.funcCalPriority = funcCalPriority;
  }
  findPath(st, ed) {
    // Check st and ed is int
    if (typeof st != "number" || typeof ed != "number") {
      throw new Error("Start and end must be int");
    }

    // Init
    let historyNode = [];
    let pq = new PriorityQueue();
    let dp = [];
    let prev = [];
    for (let i = 0; i < this.nodes.length; i++) {
      dp.push(Infinity);
      prev.push(null);
    }

    dp[st] = 0;
    pq.add(new QElement({ val: st, dp: 0 }, 0));
    while (!pq.isEmpty()) {
      let uRaw = pq.poll();
      let u = uRaw.element.val;
      let du = uRaw.element.dp;

      if (u == ed) {
        break;
      }
      if (du > dp[u]) {
        continue;
      }
      for (let i = 0; i < this.nodes[u].paths.length; i++) {
        if (!this.funcCondition(this.nodes[u].paths[i].data)) {
          continue;
        }
        let v = this.nodes[u].paths[i].node;
        let alt =
          calRealDistance(this.nodes[u].data.pos, this.nodes[v].data.pos) +
          dp[u];
        if (dp[v] > alt) {
          dp[v] = alt;
          prev[v] = u;
          pq.add(
            new QElement(
              { val: v, dp: dp[v] },
              this.funcCalPriority(
                this.nodes[u],
                this.nodes[v],
                this.nodes[st],
                this.nodes[ed],
                dp[u]
              )
            )
          );

          historyNode.push(new HistoryFP(u, v));
        }
      }
    }

    // Make path
    let paths = [];
    let cur = ed;
    while (cur != null) {
      paths.push(cur);
      cur = prev[cur];
    }
    paths.reverse();
    return [paths, historyNode];
  }
}

class Dijkstra extends CustomFindPathMeathod {
  constructor(nodes, funcCondition = null) {
    super(
      nodes,
      funcCondition,
      function (u, v, st, ed, dp) {
        return calRealDistance(u.data.pos, v.data.pos) + dp;
      },
      "Dijkstra"
    );
  }
}

class AStar extends CustomFindPathMeathod {
  constructor(nodes, funcCondition = null) {
    super(
      nodes,
      funcCondition,
      function (u, v, st, ed, dp) {
        return (
          calRealDistance(v.data.pos, ed.data.pos) +
          calRealDistance(u.data.pos, v.data.pos) +
          dp
        );
      },
      "AStar"
    );
  }
}

class Stupid extends CustomFindPathMeathod {
  constructor(nodes, funcCondition = null) {
    super(
      nodes,
      funcCondition,
      function (u, v, st, ed, dp) {
        return Math.random();
      },
      "Stupid"
    );
  }
}

class Greedy extends CustomFindPathMeathod {
  constructor(nodes, funcCondition = null) {
    super(
      nodes,
      funcCondition,
      function (u, v, st, ed, dp) {
        return calRealDistance(v.data.pos, ed.data.pos);
      },
      "Greedy"
    );
  }
}

class AStarHota extends CustomFindPathMeathod {
  constructor(nodes, funcCondition = null) {
    super(
      nodes,
      funcCondition,
      function (u, v, st, ed, dp) {
        let temp = calRealDistance(v.data.pos, ed.data.pos);
        return temp > calRealDistance(st.data.pos, ed.data.pos) * 0.3
          ? (temp + calRealDistance(u.data.pos, v.data.pos) + dp) * 1.0
          : temp + (calRealDistance(u.data.pos, v.data.pos) + dp) * 0.65;
      },
      "AStarHota"
    );
  }
}
