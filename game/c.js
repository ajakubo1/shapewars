
(function (document, window) {
    "use strict";
    var config = [
        [8, 9, 8, 8, 1],
        [9, 0, 9, 9, 9],
        [8, 9, 8, 8, 9],
        [9, 9, 9, 9, 8],
        [9, 8, 9, 9, 9],
        [9, 8, 9, 9, 9]],
        /*
            types:
                0 - current Player
                1 - enemy Human
                2 - enemy AI
        */
        players = [
            {
                "name": "claim",
                "color": "blue",
                "type": 0
            },
            {
                "name": "pc",
                "color": "green",
                "type": 2
            }
        ],

        foreground = document.getElementById('f'),
        background = document.getElementById('b'),
        foreground_ctx = foreground.getContext('2d'),
        background_ctx = background.getContext('2d'),
        current,
        width = 680,
        height = 480,
        x_max,
        x_limit,
        current_x = 0,
        size_x = 4,
        y_max,
        y_limit,
        current_y = 0,
        size_y = 3,
        step_x = 32,
        step_y = 30,
        scale,

        tickLength = 16.666666666666,
        updateTime,

        //Background settings
        back_square_height = 150,
        back_square_width = 160,
        zoom = 0,
        zoom_limit_in = 0,
        zoom_limit_out = 1,
        offset_x,
        offset_y,
        limit_x_left,
        limit_x_right,
        limit_y_top,
        limit_y_bottom,
        back_square = [],
        //Foreground settings
        fore_minion,
        fore_minion_height = 30,
        fore_minion_width = 40,

        s_canvas = 'canvas';

    function update(count) {
        while (count) {
            updateTime += tickLength;
            //Update logic
            count -= 1;
        }
    }

    function render() {
        //Redraw everything
    }

    function frame(frameTime) {
        window.requestAnimationFrame(frame);
        var tickCount = Math.floor((frameTime - updateTime) / tickLength);
        if (tickCount > 0) {
            update(tickCount);
            render();
        }
    }

    function drawBackgroundSquare(x, y, type) {
        var whole_x = x * back_square_width + offset_x - current_x,
            whole_y = y * back_square_height + offset_y - current_y;

        if (whole_x >= limit_x_left && whole_x <= limit_x_right && whole_y >= limit_y_top  && whole_y <= limit_y_bottom) {
            background_ctx.drawImage(back_square[type], whole_x, whole_y);
        }
    }

    function drawBackground() {
        var i, j;
        for (i = 0; i < x_max; i += 1) {
            for (j = 0; j < y_max; j += 1) {
                if (config[i][j] !== 8) {
                    drawBackgroundSquare(i, j, config[i][j]);
                }
            }
        }
    }

    function redrawBackground() {
        background_ctx.clearRect(0, 0, width, height);
        drawBackground();
    }

    function drawMinion(x, y, sqx, sqy) {
        foreground_ctx.drawImage(fore_minion, x + sqx * back_square_width + offset_x, y + sqy * back_square_height + offset_y);
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

    //Generation functions
    function generateBackgroundSquare(fill, border) {
        var square = document.createElement(s_canvas),
            context;
        square.width = back_square_width;
        square.height = back_square_height;
        context = square.getContext('2d');
        //context = drawRect(context, 2, 2, back_square_width - 4, back_square_height - 4, border, fill);
        context.beginPath();
        context.rect(2, 2, width, height);
        for(var i = 0 ; i < 4 ; i++) {
            for(var j = 0 ; j < 5 ; j++) {
                context.rect(i * fore_minion_width, j * fore_minion_width, fore_minion_width, fore_minion_height);
            }
        }

        context.closePath();
        context.lineWidth = 2;
        context.strokeStyle = border;
        context.stroke();
        context.fillStyle = fill;
        context.fill();
        return square;
    }

    function generateMinion() {
        fore_minion = document.createElement(s_canvas);
        fore_minion.width = fore_minion_width;
        fore_minion.height = fore_minion_height;
        var context = fore_minion.getContext('2d');
        context = drawRect(context, fore_minion_width / 4, fore_minion_height / 4, fore_minion_width / 2, fore_minion_height / 2, "white", "blue");
        context.shadowBlur = 10;
        context.shadowColor = "white";
        context.globalAlpha = 1;
        context.fill();
    }

    function generate() {
        var i;
        back_square = [];
        back_square[9] = generateBackgroundSquare("Orange", "Gold");
        for (i = 0; i < players.length; i += 1) {
            back_square[i] = generateBackgroundSquare(players[i].color, "Gold");
        }
        generateMinion();
    }

    //Event listeners
    function scaleToFit() {
        var windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            scaleX = windowWidth / width - 0.02,
            scaleY = windowHeight / height - 0.02,
            left,
            top;
        scale = Math.min(scaleX, scaleY);
        if (scale === scaleX) {
            left = "0px";
            top = ((windowHeight - height * scale) / 2) + "px";
        } else {
            left = ((windowWidth - width * scale) / 2) + "px";
            top = "0px";
        }
        background.style.transformOrigin = "0 0"; //scale from top left
        background.style.transform = "scale(" + scale + ")";
        foreground.style.transformOrigin = "0 0"; //scale from top left
        foreground.style.transform = "scale(" + scale + ")";

        background.style.top = top;
        foreground.style.top = top;
        background.style.left = left;
        foreground.style.left = left;
    }

    function recountLimits() {
        offset_x = (width - size_x * back_square_width) / 2;
        offset_y = (height - size_y * back_square_height) / 2;
        x_limit = (x_max - size_x + 1) * back_square_width;
        y_limit = (y_max - size_y + 1) * back_square_height;
        limit_x_left = -1 * back_square_width;
        limit_x_right = size_x * back_square_width + offset_x;
        limit_y_top = -1 * back_square_height;
        limit_y_bottom = size_y * back_square_height + offset_y;
        generate();
        if (current_x > x_limit) {
            current_x = x_limit;
        } else if (current_x < limit_x_left) {
            current_x = limit_x_left;
        }
        if (current_y < limit_y_top) {
            current_y = limit_y_top;
        } else if (current_y > y_limit) {
            current_y = y_limit;
        }
    }

    function checkKey(e) {
        e = e || window.event;
        var code = e.keyCode;

        if (code === 38 || code === 87) {
            current_y -= step_y;
            if (current_y < limit_y_top) {
                current_y = limit_y_top;
            }
            redrawBackground();
        } else if (code === 40 || code === 83) {
            current_y += step_y;
            if (current_y > y_limit) {
                current_y = y_limit;
            }
            redrawBackground();
        } else if (code === 37 || code === 65) {
            current_x -= step_x;
            if (current_x < limit_x_left) {
                current_x = limit_x_left;
            }
            redrawBackground();
        } else if (code === 39 || code === 68) {
            current_x += step_x;
            if (current_x > x_limit) {
                current_x = x_limit;
            }
            redrawBackground();
        } else if (code === 107) {
            if (zoom > zoom_limit_in) {
                zoom -= 1;
                back_square_width *= 2;
                back_square_height *= 2;
                size_x /= 2;
                size_y /= 2;
                current_x *= 2;
                current_y *= 2;
                recountLimits();
                redrawBackground();
            }
        } else if (code === 109) {
            if (zoom < zoom_limit_out) {
                zoom += 1;
                back_square_width /= 2;
                back_square_height /= 2;
                size_x *= 2;
                size_y *= 2;
                current_x /= 2;
                current_y /= 2;
                recountLimits();
                redrawBackground();
            }
        }
    }

    function clickListener(e) {
        //console.info(e.clientX, e.clientY, "|", e.pageX, e.pageY, "|", e.layerX, e.layerY, "|", e.offsetX, e.offsetY, "|", e.x, e.y);
        var x = e.offsetX + current_x - offset_x,
            y = e.offsetY + current_y - offset_y;

        if(x > 0 && y > 0 && x <= back_square_width * x_max && y <= back_square_height * y_max) {
            x = Math.floor(x / back_square_width);
            y = Math.floor(y / back_square_height);
            if(config[x][y] !== 8) {
                //TODO: change this to give an order to squares
                config[x][y] = current;
                redrawBackground();
            }
        }
    }

    function startGame() {
        var i;
        foreground.width = width;
        foreground.height = height;
        background.width = width;
        background.height = height;
        x_max = config.length;
        y_max = config[0].length;

        for (i = 0; i < players.length; i += 1) {
            if(players[i].type === 0) {
                current = i;
                break;
            }
        }

        recountLimits();
        scaleToFit();
        window.addEventListener('resize', scaleToFit);
        window.addEventListener('keydown', checkKey);
        foreground.addEventListener('click', clickListener);
        drawBackground();
        drawMinion(0, 0, 1, 1);
        drawMinion(40, 0, 1, 1);
        drawMinion(80, 0, 1, 1);
        drawMinion(120, 0, 1, 1);

        drawMinion(0, 30, 1, 1);
        drawMinion(40, 30, 1, 1);
        drawMinion(80, 30, 1, 1);
        drawMinion(120, 30, 1, 1);

        drawMinion(0, 60, 1, 1);
        drawMinion(40, 60, 1, 1);
        drawMinion(80, 60, 1, 1);
        drawMinion(120, 60, 1, 1);

        drawMinion(0, 90, 1, 1);
        drawMinion(40, 90, 1, 1);
        drawMinion(80, 90, 1, 1);
        drawMinion(120, 90, 1, 1);

        drawMinion(0, 120, 1, 1);
        drawMinion(40, 120, 1, 1);
        drawMinion(80, 120, 1, 1);
        drawMinion(120, 120, 1, 1);

        updateTime = window.performance.now();

        //window.requestAnimationFrame(frame);
    }

    startGame();
}(document, window));
