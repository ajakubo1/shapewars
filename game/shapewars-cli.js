
(function () {
  var config = [[0,1,0],[1,1,1],[0,1,0]],
    foreground = document.getElementById('foreground'),
    background = document.getElementById('background'),
    foreground_ctx = foreground.getContext('2d'),
    background_ctx = background.getContext('2d'),
    width = 680,
    height = 480,
    //Background settings
    back_suqare_height = 150,
    back_square_width = 200,
    back_suqare_space = 5,
    back_square,
    //Foreground settings
    fore_minion,
    fore_minion_size = 32;

  function run() {
    foreground.width=width;
    foreground.height=height;
    background.width=width;
    background.height=height;
    generate();
    drawBackground();
    drawMinion(20, 20, 1, 1);
  }

  function generate() {
    generateBackgroundSquare();
    generateMinion();
  }

  function drawBackground() {
    for(var i = 0 ; i < config.length ; i++) {
      for(var j = 0 ; j < config[0].length ; j++) {
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

  function generateBackgroundSquare() {
      back_square = document.createElement('canvas');
      back_square.width = back_square_width;
      back_square.height = back_suqare_height;
      var context = back_square.getContext('2d');

      var border = 2;

      context.beginPath();
      context.lineTo(border, border);
      context.lineTo(back_square_width - 2 * border, border);
      context.lineTo(back_square_width - 2 * border, back_suqare_height - 2 * border);
      context.lineTo(border, back_suqare_height - 2 * border);
      context.closePath();
      context.strokeStyle = "Orange";
      context.lineWidth = border;
      context.stroke();
      context.fillStyle = "Gold";
      context.fill();
  }

  function generateMinion() {
    fore_minion = document.createElement('canvas');
    fore_minion.width = fore_minion_size;
    fore_minion.height = fore_minion_size;
    var context = fore_minion.getContext('2d');

    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = "blue";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 5;
    context.shadowColor = "blue";
    context.rect(fore_minion_size / 4, fore_minion_size / 4, fore_minion_size / 2, fore_minion_size / 2);
    context.closePath();
    context.stroke();
    context.globalAlpha = 0.2;
    context.fillStyle = "blue";
    context.fill();
  }

  run();
})();
