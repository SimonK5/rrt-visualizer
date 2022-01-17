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
  if(stopped){
    currentEdit = name;
    showEditMessage(name);
  }
}

function showEditMessage(name){
  if(name == 'START'){
    document.getElementById("message").innerHTML = "Click to change start position";
  }
  else if(name == 'END'){
    document.getElementById("message").innerHTML = "Click to change end position";
  }
  else if(name == 'INIT_DRAW' || name == 'DRAWING'){
    document.getElementById("message").innerHTML = "Drag to create obstacle";
  }
  else{
    document.getElementById("message").innerHTML = "";
  }
}


canvas.addEventListener('mousedown', function(e) {
  console.log(currentEdit)
  if(currentEdit == 'START'){
    var pos = getCursorPosition(canvas, e);
    if(!nodeIsColliding({x: pos[0], y: pos[1], neighbors: []})){
      startPos = pos;
    }
    
    toggleEdit('NONE');
    resetSim();
  }
  else if(currentEdit == 'END'){
    var pos = getCursorPosition(canvas, e);
    if(!nodeIsColliding({x: pos[0], y: pos[1], neighbors: []})){
      endPos = pos;
    }
    toggleEdit('NONE');
    resetSim();
  }
  else if(currentEdit == 'INIT_DRAW'){
    startRect = getCursorPosition(canvas, e);
    toggleEdit('DRAWING');
  }
  
})

canvas.addEventListener('mousemove', function(e) {
  if(currentEdit == 'DRAWING'){
    rect = getCursorPosition(canvas, e);
    resetSim();

    ctx.fillStyle = 'gray';
    ctx.fillRect(startRect[0], startRect[1], rect[0] - startRect[0], rect[1] - startRect[1]);
  }
})

canvas.addEventListener('mouseup', function(e){
  console.log(currentEdit)
  if(currentEdit == 'DRAWING'){
    var endRect = getCursorPosition(canvas, e);

    var width = endRect[0] - startRect[0];
    var height = endRect[1] - startRect[1];

    if(width < 0){
      startRect[0] += width;
      width *= -1;
    }

    if(height < 0){
      startRect[1] += height;
      height *= -1;
    }

    obstacles.push({x: startRect[0], y: startRect[1], 
      w: width, h: height});
    
    drawObstacles(obstacles);
    toggleEdit('INIT_DRAW');
  }
})