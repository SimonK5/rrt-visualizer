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

function distance(p1, p2){
  let x = p2.x - p1.x;
  let y = p2.y - p1.y;
  
  return Math.sqrt(x * x + y * y);
}

function randomNode(){
  return {x: Math.random() * 600, y: Math.random() * 600, neighbors: []};
}