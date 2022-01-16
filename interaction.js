var currentEdit = 'NONE';
var startRect = [0, 0];

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  console.log("x: " + x + " y: " + y)
  return [x, y];
}

function toggleEdit(name){
  if(currentEdit == 'NONE' && stopped){
    currentEdit = name;
  }
}  

canvas.addEventListener('mousedown', function(e) {
  console.log(currentEdit)
  if(currentEdit == 'START'){
    var pos = getCursorPosition(canvas, e);
    if(!nodeIsColliding({x: pos[0], y: pos[1], neighbors: []})){
      startPos = pos;
    }
    
    currentEdit = 'NONE';
    resetSim();
  }
  else if(currentEdit == 'END'){
    var pos = getCursorPosition(canvas, e);
    if(!nodeIsColliding({x: pos[0], y: pos[1], neighbors: []})){
      endPos = pos;
    }
    currentEdit = 'NONE';
    resetSim();
  }
  else if(currentEdit == 'INIT_DRAW'){
    startRect = getCursorPosition(canvas, e);
    currentEdit = 'DRAWING'
  }
})

canvas.addEventListener('mouseup', function(e){
  console.log(currentEdit)
  if(currentEdit == 'DRAWING'){
    var endRect = getCursorPosition(canvas, e);

    var width = endRect[0] - startRect[0];
    var height = endRect[1] - startRect[1];

    if(width < 0){
      // var temp = startRect[0];
      // startRect[0] = endRect[0];
      // startRect[0] = temp;
      startRect[0] += width;
      width *= -1;
    }

    if(height < 0){
      // startRect[1];
      startRect[1] += height;
      height *= -1;
    }

    obstacles.push({x: startRect[0], y: startRect[1], 
      w: width, h: height});
    
    drawObstacles(obstacles);
    currentEdit = 'NONE';
  }
})