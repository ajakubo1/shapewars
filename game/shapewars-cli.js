
(function (window) {
  var config = [[0,1,0],[1,1,1],[0,1,0],[1,1,0]],
    foreground = document.getElementById('foreground'),
    background = document.getElementById('background'),
    foreground_ctx = foreground.getContext('2d'),
    background_ctx = background.getContext('2d'),
    width = 680,
    height = 480,
    width_unit,
    height_unit,
    scale,
    tickLength = 16.666666666666,
    windowPerformance = window.performance,
    frameEngine = window.requestAnimationFrame,
    updateTime,
    mathFloor = Math.floor,

    //Background settings
    back_suqare_height = 150,
    back_square_width = 150,
    back_suqare_space = 5,
    back_square,
    //Foreground settings
    fore_minion,
    fore_minion_size = 32,

    s_width = 'width',
    s_height = 'height',
    s_canvas = 'canvas',
    s_style = 'style';

  function run() {
    foreground[s_width] = width;
    foreground[s_height] = height;
    background[s_width] = width;
    background[s_height] = height;
    width_unit = config.length;
    height_unit = config[0].length;
    scaleToFit();
    window.addEventListener('resize', scaleToFit);
    generate();
    drawBackground();
    drawMinion(20, 20, 1, 1);

    updateTime = windowPerformance.now()
    //frameEngine(frame);
  }

  function update(count) {
        while(count) {
            updateTime += tickLength;
            //Update logic
            count--;
        }
    }

  function render() {
      //Redraw everything
  }

  function frame(frameTime){
      frameEngine(frame);
      var tickCount = mathFloor((frameTime - updateTime)/tickLength);
      if(tickCount > 0) {
          update(tickCount);
          render();
      }
      console.info(updateTime);
  }

  function generate() {
    generateBackgroundSquare();
    generateMinion();
  }

  function drawBackground() {
    for(var i = 0 ; i < width_unit ; i++) {
      for(var j = 0 ; j < height_unit ; j++) {
        if(config[i][j] === 1) {
          drawBackgroundSquare(i, j);
        }
      }
    }
  }

  function drawBackgroundSquare(x,y) {
    background_ctx.drawImage(back_square, x * back_square_width, y * back_suqare_height);
  }

  function drawMinion(x, y, sqx, sqy) {
    background_ctx.drawImage(fore_minion, x + sqx * back_square_width, y + sqy * back_suqare_height);
  }

  function drawRect(context, x, y, width, height, stroke, fill, shadow) {
    context.beginPath();
    context.rect(x, y, width, height);
    context.closePath();
    context.lineWidth = 2;
    context.strokeStyle = stroke;
    context.stroke();
    context.fillStyle = fill;
    return context;
  }

  function generateBackgroundSquare() {
      back_square = document.createElement(s_canvas);
      back_square[s_width] = back_square_width;
      back_square[s_height] = back_suqare_height;
      var context = back_square.getContext('2d');
      context = drawRect(context, 2, 2, back_square_width - 4, back_suqare_height - 4, "Orange", "Gold");
      context.fill();
  }

  function generateMinion() {
    fore_minion = document.createElement(s_canvas);
    fore_minion[s_width] = fore_minion_size;
    fore_minion[s_height] = fore_minion_size;
    var context = fore_minion.getContext('2d');
    context = drawRect(context, fore_minion_size / 4, fore_minion_size / 4, fore_minion_size / 2, fore_minion_size / 2, "blue", "blue");
    context.shadowBlur = 5;
    context.shadowColor = "blue";
    context.globalAlpha = 0.2;
    context.fill();
  }

  function scaleToFit() {
        var windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            scaleX = windowWidth / width,
            scaleY = windowHeight / height,
            left, top;
        scale = Math.min(scaleX, scaleY);
        if(scale === scaleX) {
            left = "0px";
            top = ((windowHeight - height * scale) / 2) + "px";
        } else {
            left = ((windowWidth - width * scale) / 2) + "px";
            top = "0px";
        }
        background[s_style].transformOrigin = "0 0"; //scale from top left
        background[s_style].transform = "scale(" + scale + ")";
        foreground[s_style].transformOrigin = "0 0"; //scale from top left
        foreground[s_style].transform = "scale(" + scale + ")";

        background[s_style].top = top;
        foreground[s_style].top = top;
        background[s_style].left = left;
        foreground[s_style].left = left;
    }

  run();
})(window);
