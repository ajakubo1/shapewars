
(function (window) {
    "use strict";
    var config = [[0, 1, 0, 0, 1], [1, 1, 1, 1, 1], [0, 1, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 1, 1, 1], [1, 0, 1, 1, 1]],
        foreground = document.getElementById('foreground'),
        background = document.getElementById('background'),
        foreground_ctx = foreground.getContext('2d'),
        background_ctx = background.getContext('2d'),
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
        windowPerformance = window.performance,
        frameEngine = window.requestAnimationFrame,
        updateTime,
        mathFloor = Math.floor,

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
        back_square,
        //Foreground settings
        fore_minion,
        fore_minion_size = 32,

        s_width = 'width',
        s_height = 'height',
        s_canvas = 'canvas',
        s_style = 'style';

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
        frameEngine(frame);
        var tickCount = mathFloor((frameTime - updateTime) / tickLength);
        if (tickCount > 0) {
            update(tickCount);
            render();
        }
    }

    function drawBackgroundSquare(x, y) {
        var whole_x = x * back_square_width + offset_x - current_x,
            whole_y = y * back_square_height + offset_y - current_y;

        if (whole_x >= limit_x_left && whole_x <= limit_x_right && whole_y >= limit_y_top  && whole_y <= limit_y_bottom) {
            background_ctx.drawImage(back_square, whole_x, whole_y);
        }
    }

    function drawBackground() {
        var i, j;
        for (i = 0; i < x_max; i += 1) {
            for (j = 0; j < y_max; j += 1) {
                if (config[i][j] === 1) {
                    drawBackgroundSquare(i, j);
                }
            }
        }
    }

    function redrawBackground() {
        background_ctx.clearRect(0, 0, width, height);
        drawBackground();
    }

    function drawMinion(x, y, sqx, sqy) {
        background_ctx.drawImage(fore_minion, x + sqx * back_square_width, y + sqy * back_square_height);
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
    function generateBackgroundSquare() {
        back_square = document.createElement(s_canvas);
        back_square[s_width] = back_square_width;
        back_square[s_height] = back_square_height;
        var context = back_square.getContext('2d');
        context = drawRect(context, 2, 2, back_square_width - 4, back_square_height - 4, "Orange", "Gold");
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

    function generate() {
        generateBackgroundSquare();
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
        background[s_style].transformOrigin = "0 0"; //scale from top left
        background[s_style].transform = "scale(" + scale + ")";
        foreground[s_style].transformOrigin = "0 0"; //scale from top left
        foreground[s_style].transform = "scale(" + scale + ")";

        background[s_style].top = top;
        foreground[s_style].top = top;
        background[s_style].left = left;
        foreground[s_style].left = left;
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

    function startGame() {
        foreground[s_width] = width;
        foreground[s_height] = height;
        background[s_width] = width;
        background[s_height] = height;
        x_max = config.length;
        y_max = config[0].length;

        recountLimits();
        scaleToFit();
        window.addEventListener('resize', scaleToFit);
        window.addEventListener('keydown', checkKey);
        drawBackground();
        drawMinion(20, 20, 1, 1);

        updateTime = windowPerformance.now();

        //frameEngine(frame);
    }

    startGame();
}(window));
