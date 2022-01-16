const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const obstacles = defineObstacles();

const NODE_WIDTH = 5;
const stepSize = 20;

var startPos = [50, 100]
var endPos = [210, 210]

var rrtStatus;

ctx.fillStyle = 'gray';
drawSim();

var stopped = true;


function init(){
  stopped = false;
  resetSim();
  rrtTree = initRRT(startPos, endPos);
  animate();
}

function drawSim(){
  ctx.fillStyle = 'gray';
  
  drawObstacles(obstacles);

  drawSquare(startPos[0], startPos[1], color = "orange");
  drawSquare(endPos[0], endPos[1], color = "orange");
}

function resetSim(){
  ctx.beginPath();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawSim();
}

function reset(){
  stopped = true;
  console.log(rrtStatus);
  if(rrtStatus === "CONVERGED"){
    resetSim();
  }
}

function drawObstacles(obs){
  ctx.fillStyle = 'gray';
  for(var i = 0; i < obs.length; i++){
    ctx.fillRect(obs[i].x, obs[i].y, obs[i].w, obs[i].h);
  }
}

function defineObstacles(){
  var obs = [];

  obs[0] = {x: 0, y: 0, w: 600, h: 20};
  obs[1] = {x: 580, y: 0, w: 20, h: 600};
  obs[2] = {x: 20, y: 580, w: 600, h: 20};
  obs[3] = {x: 0, y: 0, w: 20, h: 600};
  
  obs[4] = {x: 100, y: 100, w: 100, h: 100};
  obs[5] = {x: 400, y: 400, w: 20, h: 300};
  obs[6] = {x: 250, y:  250, w: 40, h: 300};

  return obs;
}

function animate(){
  rrtStatus = iterateRRT();
  console.log(stopped);
  if(rrtStatus === "ITERATING" && !stopped){
    requestAnimationFrame(animate);
  }
  else if(rrtStatus != "CONVERGED"){
    resetSim();
  }
}

function addNode(node, tree, color = "gray"){
  tree.nodes.push(node);
  drawSquare(node.x, node.y, color);
}

function drawSquare(x, y, color = "gray"){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(x, y, NODE_WIDTH, NODE_WIDTH);
  ctx.stroke();
  ctx.fill();
}

function addEdge(node1, node2){
  node1.neighbors.push(node2);
  node2.neighbors.push(node1);
  
  ctx.moveTo(node1.x + NODE_WIDTH / 2, node1.y + NODE_WIDTH / 2);
  ctx.lineTo(node2.x + NODE_WIDTH / 2, node2.y + NODE_WIDTH / 2);
  ctx.stroke();

  // draw node1 again to avoid overlapping
  ctx.clearRect(node2.x, node2.y, NODE_WIDTH, NODE_WIDTH);
  ctx.beginPath();
  ctx.rect(node2.x, node2.y, NODE_WIDTH, NODE_WIDTH);
  ctx.stroke();
  if(node2 == rrtTree.nodes[0]) ctx.fillStyle = 'orange';
  ctx.fill();
}

function initRRT(startPos, endPos){
  var tree = {
    nodes: []
  }

  addNode({x: startPos[0], y: startPos[1], neighbors: []}, tree, "orange");

  tree.endNode = {x: endPos[0], y: endPos[1], neighbors: []};

  return tree;
}

function iterateRRT(){
  qrand = randomNode();
  if(!nodeIsColliding(qrand)){
    var qnear = nearestNode(qrand, rrtTree);
    var qnew = newNode(qnear, qrand);
    if(!nodeIsColliding(qnew)){
      addEdge(qnew, qnear);
      addNode(qnew, rrtTree);

      if(distance(qnew, rrtTree.endNode) < stepSize){
        addEdge(qnew, rrtTree.endNode);
        addNode(rrtTree.endNode, rrtTree, "orange");

        return "CONVERGED";
      }
    }
  }

  return "ITERATING";
}

function nearestNode(node, tree){
  var nearest = tree.nodes[0];
  var nearestDistance = Number.MAX_VALUE;

  for(var i = 0; i < tree.nodes.length; i++){
    if(distance(tree.nodes[i], node) < nearestDistance){
      
      nearest = tree.nodes[i];
      nearestDistance = distance(tree.nodes[i], node);
    }
  }
  return nearest;
}

function newNode(qnear, qrand){
  var x_dirn = qrand.x - qnear.x;
  var y_dirn = qrand.y - qnear.y;

  var norm = distance(qnear, qrand);

  var new_x = qnear.x + (x_dirn / norm) * Math.min(stepSize, norm);
  var new_y = qnear.y + (y_dirn / norm) * Math.min(stepSize, norm);

  return {x: new_x, y: new_y, neighbors: []};
}

function distance(p1, p2){
  let x = p2.x - p1.x;
  let y = p2.y - p1.y;
  
  return Math.sqrt(x * x + y * y);
}
