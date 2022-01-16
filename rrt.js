const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const obstacles = defineObstacles();

const NODE_WIDTH = 5;
const stepSize = 10;

ctx.fillStyle = 'gray';
drawSim();


function init(startPos, endPos){
  rrtTree = initRRT([50, 100], [200, 200]);
  animate();
}

function drawSim(){

  ctx.fillStyle = 'gray';
  
  drawObstacles(obstacles);
}

function drawObstacles(obs){
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

  return obs;
}

function animate(){
  iterateRRT();

  requestAnimationFrame(animate);
}

function addNode(node, tree){
  tree.nodes.push(node);
  ctx.fillRect(node.x, node.y, NODE_WIDTH, NODE_WIDTH);
}

function addEdge(node1, node2){
  node1.neighbors.push(node2);
  node2.neighbors.push(node1);
  
  ctx.moveTo(node1.x, node1.y);
  ctx.lineTo(node2.x, node2.y);
  ctx.stroke();
}

function initRRT(startPos, endPos){
  var tree = {
    nodes: []
  }

  addNode({x: startPos[0], y: startPos[1], neighbors: []}, tree);
  // tree.nodes.push({x: endPos[0], y: endPos[1], neighbors: []});

  return tree;
}

function iterateRRT(){
  qrand = randomNode();
  if(!nodeIsColliding(qrand)){
    var qnear = nearestNode(qrand, rrtTree);
    var qnew = newNode(qnear, qrand);
    if(!nodeIsColliding(qnew)){
      addNode(qnew, rrtTree);
      addEdge(qnew, qnear);
    }
  }
}

function randomNode(){
  return {x: Math.random() * 600, y: Math.random() * 600, neighbors: []};
}

function nearestNode(node, tree){
  console.log(tree.nodes.length)
  console.log("RA");
  var nearest = tree.nodes[0];
  var nearestDistance = Number.MAX_VALUE;

  for(var i = 0; i < tree.nodes.length; i++){
    console.log("DISTANCE " + distance(tree.nodes[i], node));
    if(distance(tree.nodes[i], node) < nearestDistance){
      
      nearest = tree.nodes[i];
      nearestDistance = distance(tree.nodes[i], node);
      console.log("NEW NEAREST " + tree.nodes[i].x);
      console.log("NEW NEAREST DIST " + nearestDistance);
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

function nodeIsColliding(node){
  const robot = {x: node.x, y: node.y, w: NODE_WIDTH, h: NODE_WIDTH};
  for(var i = 0; i < obstacles.length; i++){
    if(robot.x < obstacles[i].x + obstacles[i].w &&
      robot.x + robot.w > obstacles[i].x &&
      robot.y < obstacles[i].y + obstacles[i].h &&
      robot.h + robot.y > obstacles[i].y){
        return true;
      }
  }
  return false;
}


