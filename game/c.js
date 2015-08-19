
(function (document, window) {
    "use strict";
    var map = [
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

        //x, y, minions, generation counter,  order, order_x, order_y
        owned = [[[1, 1, 1, 0, 0, -1, -1]], [[0, 4, 0, 0, 0, -1, -1]]],
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
            "position": [1, 1],
            "x": 10,
            "y": 10
        }], []],

        foreground = document.getElementById('f'),
        //TODO: Add middleground serving
        middleground = document.getElementById('m'),
        background = document.getElementById('b'),
        foreground_ctx = foreground.getContext('2d'),
        background_ctx = background.getContext('2d'),
        middleground_ctx = background.getContext('2d'),
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
        fore_minion = [],
        fore_minion_height = 30,
        fore_minion_width = 40,

        progress_width = Math.floor(back_square_width / fore_minion_width),
        progress_height = Math.floor(back_square_height / fore_minion_height),

        moved = false,
        moved_x = 0,
        moved_y = 0,

        s_canvas = 'canvas',

        takeover_progress = 0;


    /*********************************************************************
     *
     *
     *  SECTION: RENDER FUNCTIONS
     *
     *
     *********************************************************************/

    function render_backgroundSquare(x, y, type) {
        var whole_x = x * back_square_width + offset_x - current_x,
            whole_y = y * back_square_height + offset_y - current_y;

        if (whole_x >= limit_x_left && whole_x <= limit_x_right && whole_y >= limit_y_top  && whole_y <= limit_y_bottom) {
            background_ctx.drawImage(back_square[type], whole_x, whole_y);
        }
    }

    function render_background() {
        var i, j;
        for (i = 0; i < x_max; i += 1) {
            for (j = 0; j < y_max; j += 1) {
                if (map[i][j] !== 8) {
                    render_backgroundSquare(i, j, map[i][j]);
                }
            }
        }
    }

    function render_attackArrows() {
        var i, j, square;

        for (i = 0; i < owned.length; i += 1) {
            foreground_ctx.beginPath();
            for (j = 0; j < owned[i].length; j += 1) {
                square = owned[i][j];
                if (square[4] === 1) {
                    foreground_ctx.moveTo(square[0] * back_square_width + back_square_width / 2 + offset_x - current_x,
                                          square[1] * back_square_height + back_square_height / 2 + offset_y - current_y);
                    foreground_ctx.lineTo(square[5] * back_square_width + back_square_width / 2 + offset_x - current_x,
                                          square[6] * back_square_height + back_square_height / 2 + offset_y - current_y);
                }
            }
            foreground_ctx.lineWidth = 5;
            foreground_ctx.strokeStyle = "red";
            foreground_ctx.stroke();
        }

    }

    function render_takeover(player, x, y, sqx, sqy) {
        middleground_ctx.drawImage(takeover_square[player], x + sqx * back_square_width + offset_x - current_x,
                                 y + sqy * back_square_height + offset_y - current_y);
    }

    function render_takeoverProgress(progress) {
        var i, j;
        for (i = 0; i < progress_width; i += 1) {
            for (j = 0; j < progress_height; j += 1) {
                if (takeoverStatus[progress.id][i][j] !== 8) {
                    render_takeover(takeoverStatus[progress.id][i][j], i * fore_minion_width, j * fore_minion_height, progress.x, progress.y);
                }
            }
        }
    }

    function render_minion(player, minion) {
        var whole_x = minion.position[0] * back_square_width + offset_x - current_x,
            whole_y = minion.position[1] * back_square_height + offset_y - current_y;

        if (whole_x >= limit_x_left && whole_x <= limit_x_right && whole_y >= limit_y_top  && whole_y <= limit_y_bottom) {
            foreground_ctx.drawImage(fore_minion[player], minion.x + whole_x, minion.y + whole_y);
        }
    }

    function render_minions() {
        var i, j;

        for (i = 0; i < minions.length; i += 1) {
            for (j = 0; j < minions[i].length; j += 1) {
                render_minion(i, minions[i][j]);
            }
        }
    }

    function render_rect(context, x, y, width, height, stroke, fill, shadow) {
        context.beginPath();
        context.rect(x, y, width, height);
        context.closePath();
        context.lineWidth = 2;
        context.strokeStyle = stroke;
        context.stroke();
        context.fillStyle = fill;
        return context;
    }

    /*********************************************************************
     *
     *
     *  SECTION: UPDATE FUNCTIONS
     *
     *
     *********************************************************************/


    function redrawBackground() {
        background_ctx.clearRect(0, 0, width, height);
        render_background();
    }

    function conquer(player, x, y) {
        map[x][y] = player;
        owned[player].push([x, y, 0, 0, 0, -1, -1]);
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

    function takeTakeoverSquare(square, player, init_i, limit_i, adjustment_i, init_j, limit_j, adjustmet_j, swap) {
        var i, j, took = true, takeover;

        for (i = init_i; i < limit_i; i += 1) {
            for (j = init_j; j < limit_j; j += 1) {
                if (swap && square[j * adjustmet_j][i * adjustment_i] === 8) {
                    square[j * adjustmet_j][i * adjustment_i] = player;
                    took = false;
                    break;
                } else if (!swap && square[i * adjustment_i][j * adjustmet_j] === 8) {
                    square[i * adjustment_i][j * adjustmet_j] = player;
                    took = false;
                    break;
                }
            }

            if (!took) {
                break;
            }
        }
        return took;
    }

    function checkIfMinionsFree(player, x, y) {
        var i;

        for (i = 0; i < minions[player].length; i += 1) {
            if (minions[player][i].origin[0] === x && minions[player][i].origin[1] === y && minions[player][i].order !== 0) {
                return false;
            }
        }

        return true;
    }

    function removeSquareOrder(player, x, y) {
        var i;
        for (i = 0; i < owned[player].length; i += 1) {
            if (owned[player][i][5] === x && owned[player][i][6] === y) {
                owned[player][i][4] = 0;
                owned[player][i][5] = -1;
                owned[player][i][6] = -1;
            }
        }
    }

    function appendMinionToProgress(player, minion, x, y) {
        var i;
        for (i = 0; i < progressing[player].length; i += 1) {
            if (progressing[player][i].x === x && progressing[player][i].y === y) {
                progressing[player][i].m.push(minion);
                break;
            }
        }
    }

    function takeoverStep() {
        var i, j, process, working, minion, k, took, deleted;
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
                        //TODO: How conflicts are resolved? :>
                        if (process.f === 1) {
                            took = takeTakeoverSquare(takeoverStatus[process.id], i, 0, progress_width, 1, 0, progress_height, 1, false);
                        } else if (process.f === 0) {
                            took = takeTakeoverSquare(takeoverStatus[process.id], i, -(progress_width - 1), 1, -1, -(progress_height - 1), 1, -1, false);
                        } else if (process.f === 2) {
                            took = takeTakeoverSquare(takeoverStatus[process.id], i, -(progress_height - 1), 1, -1, -(progress_width - 1), 1, -1, true);
                        } else if (process.f === 3) {
                            took = takeTakeoverSquare(takeoverStatus[process.id], i, 0, progress_height, 1, 0, progress_width, 1, true);
                        }

                        if (took) {
                            minion.order = 0;
                            minion.position = minion.origin;

                            //Minion does not work anymore
                            //TODO check if the whole square is ready

                            if (checkIfMinionsFree(i, minion.origin[0], minion.origin[1])) {
                                busy[i] -= 1;
                            }
                        }

                    }
                }

                if (took) {
                    delete takeoverStatus[process.id];
                    conquer(i, process.x, process.y);
                    //minions can work now :)

                    /*for(k = 0; k < minions[i].length; k += 1) {
                        if()
                    }*/

                    for (k = 0; k < minions[i].length; k += 1) {
                        minion = minions[i][k];
                        if (minion.position[0] === process.x && minion.position[1] === process.y && minion.order === 1) {
                            minion.order = 0;
                            minion.position = minion.origin;
                            if (checkIfMinionsFree(i, minion.origin[0], minion.origin[1])) {
                                busy[i] -= 1;
                            }
                        }
                    }

                    removeSquareOrder(i, process.x, process.y);

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
                            "position": [land[0], land[1]],
                            "x": Math.random() * (back_square_width - fore_minion_width),
                            "y": Math.random() * (back_square_height - fore_minion_height)
                        };

                        if (land[4] === 1) {
                            minion.order = 1;
                            minion.position = [land[5], land[6]];
                            appendMinionToProgress(i, minions.length - 1, land[5], land[6]);
                        }

                        minions[i].push(minion);
                    }
                }
            }
        }
    }

    function iteration2d(table, fun) {
        var i, j;

        for (i = 0; i < table.length; i += 1) {
            for (j = 0; j < table[i].length; j += 1) {
                fun(table[i][j]);
            }
        }
    }

    function moveMinion(minion) {
        if (minion.order === 0) {
            minion.x += Math.random() * 2 - 1;
            minion.y += Math.random() * 2 - 1;

            if (minion.x < 0) {
                minion.x = 0;
            } else if (minion.x > back_square_width - fore_minion_width) {
                minion.x = back_square_width - fore_minion_width;
            }

            if (minion.y < 0) {
                minion.y = 0;
            } else if (minion.y > back_square_height - fore_minion_height) {
                minion.y = back_square_height - fore_minion_height;
            }
        } else {
            //TODO figure it out - they don't just stand around :)
        }
    }

    function moveMinions() {
        iteration2d(minions, moveMinion);
    }

    /*********************************************************************
     *
     *
     *  SECTION: THE GAME LOOP
     *
     *
     *********************************************************************/

    function render() {
        var i, j, progress;
        //clean frontend
        foreground_ctx.clearRect(0, 0, width, height);
        //Redraw progress

        iteration2d(progressing, render_takeoverProgress);

        //redraw orders
        render_attackArrows();

        //Redraw minions
        render_minions();
    }

    function update(count) {
        while (count) {
            updateTime += tickLength;
            takeoverStep();
            createMinions();
            moveMinions();
            count -= 1;
        }
    }

    function frame(frameTime) {
        window.requestAnimationFrame(frame);
        var tickCount = Math.floor((frameTime - updateTime) / tickLength);
        if (tickCount > 0) {
            update(tickCount);
            render();
        }
    }


    /*********************************************************************
     *
     *
     *  SECTION: GENERATE FUNCTIONS
     *
     *
     *********************************************************************/

    function generate_backgroundSquare(fill, border) {
        var square = document.createElement(s_canvas),
            context;
        square.width = back_square_width;
        square.height = back_square_height;
        context = square.getContext('2d');
        context = render_rect(context, 2, 2, back_square_width - 4, back_square_height - 4, border, fill);
        context.fill();
        return square;
    }

    function generate_takeoverSquare(fill, border) {
        var square = document.createElement(s_canvas),
            context;
        square.width = fore_minion_width;
        square.height = fore_minion_height;
        context = square.getContext('2d');
        context = render_rect(context, 0, 0, fore_minion_width, fore_minion_height, border, fill);
        context.fill();
        return square;
    }

    function generate_minion(color) {
        var square = document.createElement(s_canvas), context;
        square.width = fore_minion_width;
        square.height = fore_minion_height;
        context = square.getContext('2d');
        context = render_rect(context, fore_minion_width / 4, fore_minion_height / 4, fore_minion_width / 2, fore_minion_height / 2, "white", color);
        context.shadowBlur = 10;
        context.shadowColor = "white";
        context.globalAlpha = 1;
        context.fill();
        return square;
    }


    function generate() {
        var i;
        back_square = [];
        back_square[9] = generate_backgroundSquare("Orange", "Gold");
        for (i = 0; i < players.length; i += 1) {
            back_square[i] = generate_backgroundSquare(players[i].color, "Gold");
            takeover_square[i] = generate_takeoverSquare(players[i].color, "Gold");
            fore_minion[i] = generate_minion(players[i].color);
        }
    }

    function generate_globals() {
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

    //For order -> attack
    function generate_takeoverField() {
        var i, j, toReturn = [];
        for (i = 0; i < progress_width; i += 1) {
            toReturn.push([]);
            for (j = 0; j < progress_height; j += 1) {
                toReturn[i].push(8);
            }
        }
        return toReturn;
    }

    /*********************************************************************
     *
     *
     *  SECTION: ORDERS
     *
     *
     *********************************************************************/

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

    function getSquare(player, x, y) {
        var i;
        for (i = 0; i < owned[player].length; i += 1) {
            if (owned[player][i][0] === x && owned[player][i][1] === y) {
                return owned[player][i];
            }
        }
        return null;
    }

    function countDistance(from, to) {
        return Math.sqrt(Math.pow(from[0] - to[0], 2) + Math.pow(from[1] - to[1], 2));
    }

    function findNeighbourSquare(player, square, done) {
        var search, searchlist = [], i, toAdd;

        //left square
        search = getSquare(player, square[0] - 1, square[1]);
        if (search !== null && search[4] === 0) {
            return search;
        } else if (search !== null) {
            searchlist.push(search);
            toAdd = true;
            for (i = 0; i < done.length; i += 1) {
                if (done[i][0] === search[0] && done[i][1] === search[1]) {
                    toAdd = false;
                    break;
                }
            }

            if (toAdd) {
                done.push(search);
                searchlist.push(search);
            }
        }

        //top square
        search = getSquare(player, square[0], square[1] - 1);
        if (search !== null && search[4] === 0) {
            return search;
        } else if (search !== null) {
            searchlist.push(search);
            toAdd = true;
            for (i = 0; i < done.length; i += 1) {
                if (done[i][0] === search[0] && done[i][1] === search[1]) {
                    toAdd = false;
                    break;
                }
            }

            if (toAdd) {
                done.push(search);
                searchlist.push(search);
            }
        }

        //right square
        search = getSquare(player, square[0] + 1, square[1]);
        if (search !== null && search[4] === 0) {
            return search;
        } else if (search !== null) {
            searchlist.push(search);
            toAdd = true;
            for (i = 0; i < done.length; i += 1) {
                if (done[i][0] === search[0] && done[i][1] === search[1]) {
                    toAdd = false;
                    break;
                }
            }

            if (toAdd) {
                done.push(search);
                searchlist.push(search);
            }
        }

        //bottom square
        search = getSquare(player, square[0], square[1] + 1);
        if (search !== null && search[4] === 0) {
            return search;
        } else if (search !== null) {
            searchlist.push(search);
            toAdd = true;
            for (i = 0; i < done.length; i += 1) {
                if (done[i][0] === search[0] && done[i][1] === search[1]) {
                    toAdd = false;
                    break;
                }
            }

            if (toAdd) {
                done.push(search);
                searchlist.push(search);
            }
        }

        //run for every searchlist, compare distances and take with the least distance

        search = null;
        for (i = 0; i < searchlist.length; i += 1) {
            toAdd = findNeighbourSquare(player, searchlist[i], done);
            if (toAdd !== null && search === null) {
                search = toAdd;
            } else if (toAdd !== null) {
                if (countDistance(square, search) > countDistance(square, toAdd)) {
                    search = toAdd;
                }
            }
        }

        return search;
    }

    function order_attack(player, x, y, range) {
        var n_x, n_y, ordered_minions = [], i, owned_square, owned_id;
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

        if (owned_square[4] !== 0) {
            owned_square = findNeighbourSquare(player, owned_square, [owned_square ]);
        }

        owned_square[4] = 1;
        owned_square[5] = x;
        owned_square[6] = y;

        for (i = 0; i < minions[player].length; i += 1) {
            if (ordered_minions.length === owned_square[2]) {
                break;
            }
            if (minions[player][i].origin[0] === owned_square[0] && minions[player][i].origin[1] === owned_square[1]) {
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

        takeoverStatus[x + "," + y] = generate_takeoverField();
    }

    function order_defend(player, x, y) {
        //TODO defence operations
    }

    function order_decision(player, x, y) {
        if (busy[player] < owned[player].length) {
            var range = inRange(player, x, y);
            if (range !== false && (map[x][y] === 9 || (map[x][y] !== player && map[x][y] !== 8))) {
                order_attack(player, x, y, range);
            } else if (map[x][y] === player) {
                order_defend(player, x, y);
            }
        }
    }


    /*********************************************************************
     *
     *
     *  SECTION: LISTENERS
     *
     *
     *********************************************************************/


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


    function listener_resize() {
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
        middleground.style.transformOrigin = "0 0"; //scale from top left
        middleground.style.transform = "scale(" + scale + ")";
        foreground.style.transformOrigin = "0 0"; //scale from top left
        foreground.style.transform = "scale(" + scale + ")";

        background.style.top = top;
        middleground.style.top = top;
        foreground.style.top = top;
        background.style.left = left;
        middleground.style.left = left;
        foreground.style.left = left;
    }

    function listener_keydown(e) {
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
                generate_globals();
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
                generate_globals();
                redrawBackground();
            }
        }

        if (moved) {
            guardBorders();
            redrawBackground();
        }
    }

    function listener_mousemove(e) {
        moveScreen(e.offsetX, e.offsetY);
    }

    function listener_mouseout(e) {
        foreground.removeEventListener('mousemove', listener_mousemove);
        foreground.removeEventListener('mouseout', listener_mouseout);
    }

    function listener_mousedown(e) {
        //console.info(e.pageX, e.pageY, "|", e.offsetX, e.offsetY, "|", e.screenX, e.screenY, "|", e.clientX, e.clientY);
        foreground.addEventListener('mousemove', listener_mousemove);
        foreground.addEventListener('mouseout', listener_mouseout);
    }

    function listener_mouseup(e) {
        foreground.removeEventListener('mousemove', listener_mousemove);
        foreground.removeEventListener('mouseout', listener_mouseout);
        if (moved === false) {
            var x = e.offsetX + current_x - offset_x,
                y = e.offsetY + current_y - offset_y,
                range;
            if (x > 0 && y > 0 && x <= back_square_width * x_max && y <= back_square_height * y_max) {
                order_decision(current, Math.floor(x / back_square_width), Math.floor(y / back_square_height));
            }
        } else {
            moved = false;
        }
    }

    function listener_touchmove(e) {
        e.preventDefault();
        var touch = e.touches[0];
        moveScreen(touch.screenX, touch.screenY);
    }

    function listener_touchstart(e) {
        foreground.addEventListener('touchmove', listener_touchmove);
    }

    function listener_touchend(e) {
        foreground.removeEventListener('touchmove', listener_touchmove);
        moved = false;
    }

    /*********************************************************************
     *
     *
     *  SECTION: MAIN
     *
     *
     *********************************************************************/

    function mobileCheck() {
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
        var i;
        foreground.width = width;
        foreground.height = height;
        middleground.width = width;
        middleground.height = height;
        background.width = width;
        background.height = height;
        x_max = map.length;
        y_max = map[0].length;

        for (i = 0; i < players.length; i += 1) {
            if (players[i].type === 0) {
                current = i;
                break;
            }
        }

        generate_globals();
        listener_resize();
        window.addEventListener('resize', listener_resize);
        foreground.addEventListener('mouseup', listener_mouseup);

        if (mobileCheck()) {
            foreground.addEventListener('touchstart', listener_touchstart);
            foreground.addEventListener('touchend', listener_touchend);
        } else {
            window.addEventListener('keydown', listener_keydown);
            foreground.addEventListener('mousedown', listener_mousedown);
        }
        render_background();

        updateTime = window.performance.now();

        window.requestAnimationFrame(frame);
    }

    startGame();
}(document, window));
