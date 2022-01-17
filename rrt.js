const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var obstacles = defineObstacles();
var lines = [];

const NODE_WIDTH = 5;
const stepSize = 20;

const WIDTH = 600;
const HEIGHT = 600;

// number of boxes per row, for nearest neighbor search
const NUM_BOXES = 20;

var boxes = initBoxes(NUM_BOXES);

var startPos = [50, 100];
var endPos = [500, 500];

var algo = "RRT";

var rrtStatus;

ctx.fillStyle = 'gray';
drawSim();

var stopped = true;


function init(algoString){
  document.getElementById("message").innerHTML = "Running " + algoString;
  algo = algoString;
  stopped = false;
  lines = [];
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
  boxes = initBoxes(NUM_BOXES);

  drawSim();
}

function reset(){
  stopped = true;
  console.log(rrtStatus);
  if(rrtStatus === "CONVERGED"){
    resetSim();
  }
  document.getElementById("message").innerHTML = "";
}

function drawObstacles(obs){
  ctx.fillStyle = 'gray';
  for(var i = 0; i < obs.length; i++){
    ctx.fillRect(obs[i].x, obs[i].y, obs[i].w, obs[i].h);
  }
}

function resetObstacles(){
  obstacles = defineObstacles();
  resetSim();
}

function defineObstacles(){
  var obs = [];

  obs[0] = {x: 0, y: 0, w: 600, h: 20};
  obs[1] = {x: 580, y: 0, w: 20, h: 600};
  obs[2] = {x: 20, y: 580, w: 600, h: 20};
  obs[3] = {x: 0, y: 0, w: 20, h: 600};
  
  obs[4] = {x: 150, y: 0, w: 20, h: 200};
  obs[5] = {x: 400, y: 400, w: 20, h: 300};
  obs[6] = {x: 200, y: 350, w: 20, h: 300};

  return obs;
}

function initBoxes(numBoxes){
  var boxes = [];
  for(var i = 0; i < numBoxes; i++){
    boxes[i] = Array.from({length:NUM_BOXES}, () => []);
  }
  return boxes;
}

function animate(){
  rrtStatus = iterateRRT();
  console.log(stopped);
  if(rrtStatus === "ITERATING" && !stopped){
    requestAnimationFrame(animate);
  }
  else if(stopped && rrtStatus != "CONVERGED"){
    resetSim();
  }
  else if(rrtStatus == "CONVERGED"){
    document.getElementById("message").innerHTML = "Success!";
  }
}

function addNode(node, tree, color = "blue"){
  tree.nodes.push(node);
  drawSquare(node.x, node.y, color);
}

function drawSquare(x, y, color = "blue"){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(x, y, NODE_WIDTH, NODE_WIDTH);
  ctx.stroke();
  ctx.fill();
}

function addEdge(node1, node2){
  ctx.fillStyle = 'blue';
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

  addNode({x: startPos[0], y: startPos[1], neighbors: [], cost: 0}, tree, "orange");

  tree.endNode = {x: endPos[0], y: endPos[1], neighbors: [], cost: 0};

  return tree;
}

function iterateRRT(){
  qrand = randomNode();
  if(nodeIsColliding(qrand)) return "ITERATING";
  var qnear = nearestNode(qrand, rrtTree.nodes);
  var qnew = newNode(qnear, qrand);

  if(!nodeIsColliding(qnew)){
    if(algo == "RRT"){
      if(edgeIsColliding(qnew, qnear)) return "ITERATING";
      addEdge(qnew, qnear);
    }
    else if(algo == "RRT*"){
      var nearNodes = nearNeighbors(qnear, boxes);
      var qmin;
      if(nearNodes.length == 0){
        qmin = nearestNode(qnew, rrtTree.nodes);
      } 
      else{
        qmin = minCostNode(qnew, nearNodes);
      }

      if(edgeIsColliding(qnew, qmin)) return "ITERATING";

      addEdge(qnew, qmin);

      rewire(qnew);
    }
    
    addNode(qnew, rrtTree);

    if(distance(qnew, rrtTree.endNode) < stepSize){
      addEdge(qnew, rrtTree.endNode);
      addNode(rrtTree.endNode, rrtTree, "orange");

      return "CONVERGED";
    }
    
  }

  return "ITERATING";
}

function rewire(node){
  var nearNbr = nearNeighbors(node, boxes);

  for(var i = 0; i < nearNbr.length; i++){
    var nbr = nearNbr[i];
    var newCost = distance(nbr, node) + node.cost;

    if(newCost < nbr.cost){
      addEdge(node, nbr);
      nbr.cost = newCost;
    }
  }
}

function nearestNode(node, otherNodes){
  var nearest = otherNodes[0];
  var nearestDistance = Number.MAX_VALUE;

  for(var i = 0; i < otherNodes.length; i++){
    if(distance(otherNodes[i], node) < nearestDistance){
      
      nearest = otherNodes[i];
      nearestDistance = distance(otherNodes[i], node);
    }
  }
  return nearest;
}

function minCostNode(node, otherNodes){
  var minCostNode = otherNodes[0];
  var minCost = Number.MAX_VALUE;

  for(var i = 0; i < otherNodes.length; i++){
    var newCost = otherNodes[i] + distance(otherNodes, node);
    if(newCost < minCost){
      minCostNode = otherNodes[i];
      minCost = newCost;
    }
  }
  console.log("minCostNode", minCostNode);
  console.log("otherNodes", otherNodes);
  return minCostNode;
}

function findBoxNumber(node){
  var boxX = Math.trunc((node.x / WIDTH) * NUM_BOXES);
  var boxY = Math.trunc((node.y / HEIGHT) * NUM_BOXES);
  console.log("x", node.x);
  console.log("boxX", boxX);
  return [boxX, boxY];
}

function nearNeighbors(node, boxes){
  boxNumber = findBoxNumber(node);
  neighbors = [];

  const dirn = [[0, 0], [0, 1], [1, 1], [1, 0], [1, -1], 
  [0, -1], [-1, -1], [-1, 0], [-1, 1]];

  for(var i = 0; i < dirn.length; i++){
    var boxX = clamp(boxNumber[0] + dirn[i][0], 0, NUM_BOXES - 1);
    var boxY = clamp(boxNumber[1] + dirn[i][1], 0, NUM_BOXES - 1);
    var box = boxes[boxX][boxY];

    for(var j = 0; j < box.length; j++){
      neighbors.push(box[j]);
    }
  }

  boxes[boxNumber[0]][boxNumber[1]].push(node);

  return neighbors;
}

function clamp(num, min, max){
  return Math.min(Math.max(num, min), max);
}

function newNode(qnear, qrand){
  var xDirn = qrand.x - qnear.x;
  var yDirn = qrand.y - qnear.y;

  var norm = distance(qnear, qrand);

  var newX = qnear.x + (xDirn / norm) * Math.min(stepSize, norm);
  var newY = qnear.y + (yDirn / norm) * Math.min(stepSize, norm);

  var qnew = {x: newX, y: newY, neighbors: [], cost: -1}

  qnew.cost = qnear.cost + distance(qnear, qnew);

  return qnew;
}

function distance(p1, p2){
  let x = p2.x - p1.x;
  let y = p2.y - p1.y;
  
  return Math.sqrt(x * x + y * y);
}
