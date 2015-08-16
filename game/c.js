
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

        owned = [[[1, 1, 1, 0, 0]], [[1, 5, 0, 0, 0]]],
        busy = [0, 0],

        /*
        Progress has to have:
            x, y of tiles to conquer
            from which side conquer goes
            list of minions who are conquering
            id of takeover status
        */
        progressing = [[], []],
        takeoverStatus = {},

        /*
        Minion orders:
            0 - staying at their home square, adding their numbers to the amount of created minions
            1 - attacking a square
            2 - going somewhere
        */

        minions = [[{
            "step": 0,
            "order": 0,
            "origin": [1, 1],
            "position": [1, 1]
        }], []],

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
        takeover_square = [],
        //Foreground settings
        fore_minion,
        fore_minion_height = 30,
        fore_minion_width = 40,

        progress_width = Math.floor(back_square_width / fore_minion_width),
        progress_height = Math.floor(back_square_height / fore_minion_height),

        moved = false,
        moved_x = 0,
        moved_y = 0,

        s_canvas = 'canvas',

        takeover_progress = 0;

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

    function conquer(player, x, y) {
        config[x][y] = current;
        owned[player].push([x, y, 0, 0, 0]);
    }

    function removeDeleted(player) {
        var i, len;
        len = progressing[player].length;
        for (i = 0; i < len; i += 1) {
            if (progressing[player][i].deleted !== undefined) {
                progressing[player].splice(i, 1);
                break;
            }
        }
        if (len !== progressing[player].length) {
            removeDeleted(player);
        }
    }

    function takeoverStep() {
        var i, j, process, working, minion, k, took, l, m, deleted;
        for (i = 0; i < progressing.length; i += 1) {
            deleted = false;
            for (j = 0; j < progressing[i].length; j += 1) {
                took = false;
                process = progressing[i][j];
                working = process.m;
                for (k = 0; k < working.length; k += 1) {
                    minion = minions[i][working[k]];
                    minion.step += 1;
                    if (minion.step > 20) {
                        minion.step = 0;
                        took = true;
                        //TODO: Depends on the place form where there was attack
                        //TODO: How conflicts are resolved? :>
                        if (process.f === 1) {
                            for (l = 0; l < progress_width; l += 1) {
                                for (m = 0; m < progress_height; m += 1) {
                                    if (takeoverStatus[process.id][l][m] === 8) {
                                        takeoverStatus[process.id][l][m] = i;
                                        took = false;
                                        break;
                                    }
                                }
                                if (!took) {
                                    break;
                                }
                            }
                        } else if (process.f === 0) {
                            for (l = progress_width - 1; l >= 0; l -= 1) {
                                for (m = progress_height - 1; m >= 0; m -= 1) {
                                    if (takeoverStatus[process.id][l][m] === 8) {
                                        takeoverStatus[process.id][l][m] = i;
                                        took = false;
                                        break;
                                    }
                                }
                                if (!took) {
                                    break;
                                }
                            }
                        } else if (process.f === 2) {
                            for (l = progress_height - 1; l >= 0; l -= 1) {
                                for (m = progress_width - 1; m >= 0; m -= 1) {
                                    if (takeoverStatus[process.id][m][l] === 8) {
                                        takeoverStatus[process.id][m][l] = i;
                                        took = false;
                                        break;
                                    }
                                }
                                if (!took) {
                                    break;
                                }
                            }
                        } else if (process.f === 3) {
                            for (l = 0; l < progress_height; l += 1) {
                                for (m = 0; m < progress_width; m += 1) {
                                    if (takeoverStatus[process.id][m][l] === 8) {
                                        takeoverStatus[process.id][m][l] = i;
                                        took = false;
                                        break;
                                    }
                                }
                                if (!took) {
                                    break;
                                }
                            }
                        }
                        
                    }
                }

                if (took) {
                    delete takeoverStatus[process.id];
                    conquer(i, process.x, process.y);
                    //minions can work now :)
                    process.deleted = true;
                    deleted = true;
                    redrawBackground();
                }
            }

            if (deleted) {
                removeDeleted(i);
            }
        }
    }

    function createMinions() {
        var i, j, land, minion;
        for (i = 0; i < owned.length; i += 1) {
            for (j = 0; j < owned[i].length; j += 1) {
                land = owned[i][j];
                if (land[2] < 3) {
                    land[3] += 1;
                    //TODO: add bonus from every non-wokring minion which is in the vacinity
                    if (land[3] > 600) {
                        land[3] = 0;
                        land[2] += 1;
                        minion = {
                            "order": 0,
                            "step": 0,
                            "origin": [land[0], land[1]],
                            "position": [land[0], land[1]]
                        };
                        minions[i].push(minion);

                        console.info("created minion nbr: " + land[2] + " at: " + land[0] + "," + land[1] + ". Total amount of minions: " + minions[i].length);
                    }
                }
            }
        }
    }

    function update(count) {
        while (count) {
            updateTime += tickLength;
            //recount progress
            takeoverStep();
            //create minions?
            createMinions();
            count -= 1;
        }
    }

    function drawTakeover(player, x, y, sqx, sqy) {
        background_ctx.drawImage(takeover_square[player], x + sqx * back_square_width + offset_x - current_x,
                                 y + sqy * back_square_height + offset_y - current_y);
    }

    function drawProgress(x, y, progress) {
        var i, j;
        for (i = 0; i < progress_width; i += 1) {
            for (j = 0; j < progress_height; j += 1) {
                if (progress[i][j] !== 8) {
                    drawTakeover(progress[i][j], i * fore_minion_width, j * fore_minion_height, x, y);
                }
            }
        }
    }

    function render() {
        var i, j, progress;
        //clean frontend
        foreground_ctx.clearRect(0, 0, width, height);
        //Redraw progress

        for (i = 0; i < progressing.length; i += 1) {
            for (j = 0; j < progressing[i].length; j += 1) {
                progress = progressing[i][j];
                drawProgress(progress.x, progress.y, takeoverStatus[progress.id]);
            }
        }
        //Redraw minions
    }

    function inRange(player, x, y) {
        var i, sqr;
        for (i = 0; i < owned[player].length; i += 1) {
            sqr = owned[player][i];
            if (x === sqr[0] - 1 && y === sqr[1]) {
                //from left
                return 0;
            } else if (x === sqr[0] + 1 && y === sqr[1]) {
                //from right
                return 1;
            } else if (x === sqr[0] && y === sqr[1] - 1) {
                //from up
                return 2;
            } else if (x === sqr[0] && y === sqr[1] + 1) {
                //from down
                return 3;
            }
        }
        return false;
    }

    function frame(frameTime) {
        window.requestAnimationFrame(frame);
        var tickCount = Math.floor((frameTime - updateTime) / tickLength);
        if (tickCount > 0) {
            update(tickCount);
            render();
        }
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
        context = drawRect(context, 2, 2, back_square_width - 4, back_square_height - 4, border, fill);
        context.fill();
        return square;
    }

    function generateTakeoverSquare(fill, border) {
        var square = document.createElement(s_canvas),
            context;
        square.width = fore_minion_width;
        square.height = fore_minion_height;
        context = square.getContext('2d');
        context = drawRect(context, 0, 0, fore_minion_width, fore_minion_height, border, fill);
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
            takeover_square[i] = generateTakeoverSquare(players[i].color, "Gold");
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

    function guardBorders() {
        if (current_y < limit_y_top) {
            current_y = limit_y_top;
        } else if (current_y > y_limit) {
            current_y = y_limit;
        }
        if (current_x < limit_x_left) {
            current_x = limit_x_left;
        } else if (current_x > x_limit) {
            current_x = x_limit;
        }
    }

    function checkKey(e) {
        e = e || window.event;
        var code = e.keyCode,
            moved = false;

        if (code === 38 || code === 87) {
            current_y -= step_y;
            moved = true;
        } else if (code === 40 || code === 83) {
            current_y += step_y;
            moved = true;
        } else if (code === 37 || code === 65) {
            current_x -= step_x;
            moved = true;
        } else if (code === 39 || code === 68) {
            current_x += step_x;
            moved = true;
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

        if (moved) {
            guardBorders();
            redrawBackground();
        }
    }

    function moveScreen(x, y) {
        if (!moved) {
            moved = true;
            moved_x = x;
            moved_y = y;
        }
        current_x -= x - moved_x;
        current_y -= y - moved_y;
        moved_x = x;
        moved_y = y;
        guardBorders();
        redrawBackground();
    }

    function mousemoveListener(e) {
        moveScreen(e.offsetX, e.offsetY);
    }

    function mouseoutListener(e) {
        foreground.removeEventListener('mousemove', mousemoveListener);
        foreground.removeEventListener('mouseout', mouseoutListener);
    }

    function mousedownListener(e) {
        //console.info(e.pageX, e.pageY, "|", e.offsetX, e.offsetY, "|", e.screenX, e.screenY, "|", e.clientX, e.clientY);
        foreground.addEventListener('mousemove', mousemoveListener);
        foreground.addEventListener('mouseout', mouseoutListener);
    }

    function progressTable() {
        var i, j, toReturn = [];
        for (i = 0; i < progress_width; i += 1) {
            toReturn.push([]);
            for (j = 0; j < progress_height; j += 1) {
                toReturn[i].push(8);
            }
        }
        return toReturn;
    }
    
    function getSquare(player, x, y) {
        var i;
        for (i = 0; i < owned[player].length; i += 1) {
            if (owned[player][i][0] === x && owned[player][i][1] === y) {
                return owned[player][i];
            }
        }
    }
    
    function orderAttack(player, x, y, range) {
        var n_x, n_y, ordered_minions = [], i, owned_square;
        if (range === 0) {
            n_y = y;
            n_x = x + 1;
        } else if (range === 1) {
            n_y = y;
            n_x = x - 1;
        } else if (range === 2) {
            n_y = y + 1;
            n_x = x;
        } else if (range === 3) {
            n_y = y - 1;
            n_x = x;
        }
        
        owned_square = getSquare(player, n_x, n_y);
        
        //if (owned_square[4] !== 0) {
            //TODO search for next closest square without order
        //}
        
        for (i = 0; i < minions[player].length; i += 1) {
            if (ordered_minions.length === owned_square[2]) {
                break;
            }
            if (minions[player][i].origin[0] === n_x && minions[player][i].origin[1] === n_y) {
                ordered_minions.push(i);
                minions[player][i].order = 1;
                //TODO replace with real movement:
                minions[player][i].position = [x, y];
            }
        }
        
        busy[player] += 1;
        progressing[player].push({
            "x": x,
            "y": y,
            "m": ordered_minions,
            "id": x + "," + y,
            "f": range
        });
        takeoverStatus[x + "," + y] = progressTable();
    }
    
    function orderDefend(player, x, y) {
        //TODO defence operations
    }
    
    function orderMinions(player, x, y) {
        if (busy[player] < owned[player].length) {
            var range = inRange(player, x, y);
            if (range !== false && (config[x][y] === 9 || (config[x][y] !== player && config[x][y] !== 8))) {
                orderAttack(player, x, y, range);
            } else if (config[x][y] === player) {
                orderDefend(player, x, y);
            }
        }
    }

    function mouseupListener(e) {
        foreground.removeEventListener('mousemove', mousemoveListener);
        foreground.removeEventListener('mouseout', mouseoutListener);
        if (moved === false) {
            var x = e.offsetX + current_x - offset_x,
                y = e.offsetY + current_y - offset_y,
                range;
            if (x > 0 && y > 0 && x <= back_square_width * x_max && y <= back_square_height * y_max) {
                orderMinions(current, Math.floor(x / back_square_width), Math.floor(y / back_square_height));
            }
        } else {
            moved = false;
        }
    }

    function touchmoveListener(e) {
        e.preventDefault();
        var touch = e.touches[0];
        moveScreen(touch.screenX, touch.screenY);
    }

    function touchstartListener(e) {
        foreground.addEventListener('touchmove', touchmoveListener);
    }

    function touchendListener(e) {
        foreground.removeEventListener('touchmove', touchmoveListener);
        moved = false;
    }

    function mobileAndTabletcheck() {
        if (navigator.userAgent.match(/Android/i)
                || navigator.userAgent.match(/webOS/i)
                || navigator.userAgent.match(/iPhone/i)
                || navigator.userAgent.match(/iPad/i)
                || navigator.userAgent.match(/iPod/i)
                || navigator.userAgent.match(/BlackBerry/i)
                || navigator.userAgent.match(/Windows Phone/i)) {
            return true;
        }
        return false;
    }

    function startGame() {
        var i, minion;
        foreground.width = width;
        foreground.height = height;
        background.width = width;
        background.height = height;
        x_max = config.length;
        y_max = config[0].length;

        for (i = 0; i < players.length; i += 1) {
            if (players[i].type === 0) {
                current = i;
                break;
            }
        }

        recountLimits();
        scaleToFit();
        window.addEventListener('resize', scaleToFit);

        if (mobileAndTabletcheck()) {
            foreground.addEventListener('touchstart', touchstartListener);
            foreground.addEventListener('touchend', touchendListener);
            foreground.addEventListener('mouseup', mouseupListener);
        } else {
            window.addEventListener('keydown', checkKey);
            foreground.addEventListener('mousedown', mousedownListener);
            foreground.addEventListener('mouseup', mouseupListener);
        }
        drawBackground();

        updateTime = window.performance.now();

        window.requestAnimationFrame(frame);
    }

    startGame();
}(document, window));
