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
  if(node2 == rrtTree.nodes[0]) ctx.fillStyle = 'red';
  ctx.fill();
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

function lineLineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
  // calculate the distance to intersection point
  var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

  // if uA and uB are between 0-1, lines are colliding
  return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
}

function edgeIsColliding(n1, n2){
  for(var i = 0; i < obstacles.length; i++){
    var ob = obstacles[i];
    var sides = [[[ob.x, ob.y], [ob.x + ob.w, ob.y]], // top
              [[ob.x, ob.y], [ob.x, ob.y + ob.h]], // left
              [[ob.x + ob.w, ob.y + ob.h], [ob.x + ob.w, ob.y]], // right
              [[ob.x + ob.w, ob.y + ob.h], [ob.x, ob.y + ob.h]] // bottom
            ];
    for(var j = 0; j < sides.length; j++){
      if(lineLineCollision(n1.x, n1.y, n2.x, n2.y, (sides[j][0])[0], 
        (sides[j][0])[1], (sides[j][1])[0], (sides[j][1])[1])){
        return true;
      }
    }
  }

  return false;
}

function distance(p1, p2){
  let x = p2.x - p1.x;
  let y = p2.y - p1.y;
  
  return Math.sqrt(x * x + y * y);
}

function randomNode(){
  return {x: Math.random() * 600, y: Math.random() * 600, neighbors: []};
}