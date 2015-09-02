var SHAPEWARS = function (document, window) {
    "use strict";

    //Map-related variables for 1d to 2d mapping
    var map, map_width, map_height,
        map_conquest, map_conquestHealth, map_conquestProgress, map_conquestPlayer, map_minion, map_minion_progress, map_type,
        //Player-related variables
        player_id, player_name, player_color, player_type, player_conquered, player_availableMinions, player_minions,
        //What is the player that plays the game
        current_player,

        //Main loop parameters
        updateTime, tickLength = 16.666666666666,

        //Canvas-related variables
        foreground = document.getElementById('f'),
        middleground = document.getElementById('m'),
        background = document.getElementById('b'),
        foreground_ctx = foreground.getContext('2d'),
        background_ctx = background.getContext('2d'),
        middleground_ctx = background.getContext('2d'),

        //how many background fields fits into screen width/height
        screen_width = 4,
        screen_height = 3,
        //Background square properties
        background_square_width = 160,
        background_square_height = 150,
        background_square,
        //Map moving/navigation
        offset_x, offset_y,
        limit_right, limit_left, limit_bottom, limit_top,
        current_x, current_y,
        visible_limit_right, visible_limit_bottom,
        scale,
        step_x = 32,
        step_y = 30,
        zoom = 0,
        zoom_limit_in = 0,
        zoom_limit_out = 1,

        //Listeners
        screen_moved = false,
        moved_x = 0,
        moved_y = 0,

        //Minions
        minion_width = 40,
        minion_height = 30,
        minion_square, progress_square,

        square_middle_x = background_square_width / 2 - minion_width / 2,
        square_middle_y = background_square_height / 2 - minion_height / 2,
        square_minion_width = Math.floor(background_square_width / minion_width),
        square_minion_height = Math.floor(background_square_height / minion_height),
        
        attack_indicator;


    /*********************************************************************
     *
     *
     *  SECTION: HELPER FUNCTIONS
     *
     *
     *********************************************************************/

    function helper_guardBorders() {
        if (current_y < limit_top) {
            current_y = limit_top;
        } else if (current_y > limit_bottom) {
            current_y = limit_bottom;
        }
        if (current_x < limit_left) {
            current_x = limit_left;
        } else if (current_x > limit_right) {
            current_x = limit_right;
        }
    }

    function helper_mapX(i, width) {
        return i % width;
    }

    function helper_mapY(i, width) {
        return Math.floor(i / width);
    }

    function helper_remapPoint(i, j, width) {
        return j * width + i;
    }

    function helper_createDefaultMinion(x, y) {
        var minion = new Float32Array(ENUM_MINION.size);
        minion[ENUM_MINION.current_x] = x;
        minion[ENUM_MINION.current_y] = y;
        minion[ENUM_MINION.current_local_x] = Math.random() * (background_square_width - minion_width);
        minion[ENUM_MINION.current_local_y] = Math.random() * (background_square_height - minion_height);
        minion[ENUM_MINION.destination_x] = -1;
        minion[ENUM_MINION.destination_y] = -1;
        minion[ENUM_MINION.destination_local_x] = -1;
        minion[ENUM_MINION.destination_local_y] = -1;
        minion[ENUM_MINION.order] = ENUM_ORDER.none;
        minion[ENUM_MINION.health] = 250;
        minion[ENUM_MINION.x_speed] = -1;
        minion[ENUM_MINION.y_speed] = -1;
        minion[ENUM_MINION.current] = helper_remapPoint(x, y, map_width);
        minion[ENUM_MINION.current_local] = -1;
        return minion;
    }

    function helper_recountMinionDestination(minion, dest_x, dest_y) {
        var x, y, y1;
        minion[ENUM_MINION.destination_local_x] = dest_x;
        minion[ENUM_MINION.destination_local_y] = dest_y;
        x = dest_x - minion[ENUM_MINION.current_local_x];
        y = dest_y - minion[ENUM_MINION.current_local_y];

        if (x === 0.0) {
            minion[ENUM_MINION.x_speed] = 0;
            if (y > 0) {
                minion[ENUM_MINION.y_speed] = ENUM_MINION.speed;
            } else {
                minion[ENUM_MINION.y_speed] = -ENUM_MINION.speed;
            }

        } else if (y === 0.0) {
            if (x > 0) {
                minion[ENUM_MINION.x_speed] = ENUM_MINION.speed;
            } else {
                minion[ENUM_MINION.x_speed] = -ENUM_MINION.speed;
            }

            minion[ENUM_MINION.y_speed] = 0;
        } else if (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) > ENUM_MINION.speed) {
            y1 = Math.sqrt(Math.pow(ENUM_MINION.speed, 2) * Math.pow(y, 2) / (Math.pow(x, 2) + Math.pow(y, 2)));

            if (y > 0) {
                minion[ENUM_MINION.y_speed] = y1;
            } else {
                minion[ENUM_MINION.y_speed] = -y1;
                y = -y;
            }

            minion[ENUM_MINION.x_speed] = x / y * y1;
        }
    }

    function helper_moveMinion(minion) {
        var x, y;
        //Move
        x = minion[ENUM_MINION.destination_local_x] - minion[ENUM_MINION.current_local_x];
        y = minion[ENUM_MINION.destination_local_y] - minion[ENUM_MINION.current_local_y];
        if (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) <= ENUM_MINION.speed) {
            minion[ENUM_MINION.current_local_x] += x;
            minion[ENUM_MINION.current_local_y] += y;
            minion[ENUM_MINION.destination_local_x] = -1;
            minion[ENUM_MINION.destination_local_y] = -1;
            minion[ENUM_MINION.y_speed] = -1;
            minion[ENUM_MINION.x_speed] = -1;
        } else {
            minion[ENUM_MINION.current_local_y] += minion[ENUM_MINION.y_speed];
            minion[ENUM_MINION.current_local_x] += minion[ENUM_MINION.x_speed];
        }
    }
    
    function redrawBackground() {
        background_ctx.clearRect(0, 0, ENUM_GLOBAL.width, ENUM_GLOBAL.height);
        render_background();
    }

    /*********************************************************************
     *
     *
     *  SECTION: LOGIC
     *
     *
     *********************************************************************/

    function logic_generateMinions() {
        var i;

        for (i = 0; i < map.length; i += 1) {
            if (map[i] < 8 && map_minion[i] < map_type[i]) {
                if(map_conquest[i] === 0) {
                    map_minion_progress[i] += 1;
                    if (map_minion_progress[i] >= ENUM_MINION.generation_barier) {
                        map_minion_progress[i] = 0;
                        player_availableMinions[map[i]] += 1;
                        player_minions[i][map_minion[i]] = helper_createDefaultMinion(helper_mapX(i, map_width), helper_mapY(i, map_width));
                        map_minion[i] += 1;
                    }
                }
            }
        }
    }

    function logic_updateMinionMovement() {
        var i, j, minion;

        for (i = 0; i < map.length; i += 1) {
            if (map[i] === current_player) {
                for (j = 0; j < map_minion[i]; j += 1) {
                    minion = player_minions[i][j];
                    if (minion[ENUM_MINION.destination_x] === -1) {
                        if (minion[ENUM_MINION.destination_local_x] === -1) {
                            if (minion[ENUM_MINION.order] === ENUM_ORDER.none) {
                                helper_recountMinionDestination(minion, Math.random() * (background_square_width - minion_width), Math.random() * (background_square_height - minion_height));
                            }
                        } else {
                            helper_moveMinion(minion);
                        }

                    } else {
                        if (minion[ENUM_MINION.destination_local_x] === -1) {
                            if (minion[ENUM_MINION.current_local_x] !== square_middle_x && minion[ENUM_MINION.current_local_y] !== square_middle_y) {
                                helper_recountMinionDestination(minion, square_middle_x, square_middle_y);
                            } else { //TODO: Add here check if neighbour
                                minion[ENUM_MINION.current_x] = minion[ENUM_MINION.destination_x];
                                minion[ENUM_MINION.current_y] = minion[ENUM_MINION.destination_y];
                                minion[ENUM_MINION.current] = helper_remapPoint(minion[ENUM_MINION.current_x], minion[ENUM_MINION.current_y], map_width);

                                minion[ENUM_MINION.destination_x] = -1;
                                minion[ENUM_MINION.destination_y] = -1;
                                if (map[i] === map[minion[ENUM_MINION.current]]) {
                                    if (i === minion[ENUM_MINION.current]) {
                                        //Minion returned to base
                                        minion[ENUM_MINION.order] = ENUM_ORDER.none;
                                    } else {
                                        //Minion went to defend
                                        minion[ENUM_MINION.order] = ENUM_ORDER.attack;
                                    }
                                } else {
                                    //Minion went to attack
                                    minion[ENUM_MINION.order] = ENUM_ORDER.attack;
                                }
                            }
                        } else {
                            helper_moveMinion(minion);
                        }
                    }
                }
            }
        }
    }

    function getFreeSubsquare(player, square) {
        //TODO a co jeśli jeden player drugiemu zabiera tile?
        var i;
        for (i = 0; i < map_conquestProgress[square].length; i += 1) {
            if (map_conquestProgress[square][i] === ENUM_SUBSQUARE.free) {
                map_conquestProgress[square][i] = ENUM_SUBSQUARE.in_progress;
                return i;
            }
        }

        for (i = 0; i < map_conquestProgress[square].length; i += 1) {
            if (map_conquestProgress[square][i] === ENUM_SUBSQUARE.to_heal && map_conquestPlayer[square][i] === player && map_conquestHealth[square][i] < ENUM_SUBSQUARE.base_health) {
                map_conquestProgress[square][i] = ENUM_SUBSQUARE.healing;
                return i;
            }
        }

        for (i = 0; i < map_conquestProgress[square].length; i += 1) {
            if (map_conquestProgress[square][i] === ENUM_SUBSQUARE.to_heal && map_conquestPlayer[square][i] !== player && map_conquestHealth[square][i] < ENUM_SUBSQUARE.base_health) {
                map_conquestProgress[square][i] = ENUM_SUBSQUARE.in_progress;
                return i;
            }
        }

        for (i = 0; i < map_conquestProgress[square].length; i += 1) {
            if (map_conquestProgress[square][i] === ENUM_SUBSQUARE.conquered && map_conquestPlayer[square][i] !== player && map_conquestHealth[square][i] < ENUM_SUBSQUARE.base_health) {
                map_conquestProgress[square][i] = ENUM_SUBSQUARE.in_progress;
                return i;
            }
        }

        return undefined;
    }

    function logic_nextAttackStep(square, minion) {
        var square_x, square_y;
        square_x = getFreeSubsquare(map[square], minion[ENUM_MINION.current]);
        if (square_x !== undefined) {
            minion[ENUM_MINION.current_local] = square_x;
            square_y = helper_mapY(square_x, square_minion_width);
            square_x = helper_mapX(square_x, square_minion_width);
            helper_recountMinionDestination(minion, square_x * minion_width, square_y * minion_height);
        } else {
            player_availableMinions[map[square]] += 1;
            minion[ENUM_MINION.destination_x] = helper_mapX(square, map_width);
            minion[ENUM_MINION.destination_y] = helper_mapY(square, map_width);
            minion[ENUM_MINION.order] = ENUM_ORDER.moving;
            helper_recountMinionDestination(minion, square_middle_x, square_middle_y);
        }
    }

    function logic_order() {
        var i, j, minion, to_delete;

        for (i = 0; i < map.length; i += 1) {
            if (map[i] === current_player) {
                to_delete = [];
                for (j = 0; j < map_minion[i]; j += 1) {
                    minion = player_minions[i][j];
                    if (minion[ENUM_MINION.order] === ENUM_ORDER.attack) {
                        if (minion[ENUM_MINION.current_local_x] === square_middle_x && minion[ENUM_MINION.current_local_y] === square_middle_y && minion[ENUM_MINION.destination_local_x] === -1) {
                            logic_nextAttackStep(i, minion);
                        } else if (minion[ENUM_MINION.destination_local_x] === -1) {
                            if (map_conquestProgress[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] === ENUM_SUBSQUARE.in_progress) {
                                minion[ENUM_MINION.health] -= 1;
                                map_conquestHealth[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] -= 1;
                                map_conquest[ENUM_MINION.current] = 1;
                                redrawBackground();

                                if (minion[ENUM_MINION.health] === 0) {
                                    to_delete.push(j);
                                    if (map[minion[ENUM_MINION.current]] === 9) {
                                        map_conquestProgress[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] = ENUM_SUBSQUARE.free;
                                    } else {
                                        map_conquestProgress[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] = ENUM_SUBSQUARE.to_heal;
                                    }
                                }

                                if (map_conquestHealth[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] === 0) {
                                    map_conquestPlayer[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] = map[i];
                                    if (minion[ENUM_MINION.health] === 0) {
                                        map_conquestProgress[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] = ENUM_SUBSQUARE.to_heal;
                                    } else {
                                        map_conquestProgress[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] = ENUM_SUBSQUARE.healing;
                                    }

                                }
                            } else if (map_conquestProgress[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] === ENUM_SUBSQUARE.healing) {
                                map_conquest[ENUM_MINION.current] = 1;
                                redrawBackground();
                                
                                minion[ENUM_MINION.health] -= 1;
                                map_conquestHealth[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] += 1;

                                if (minion[ENUM_MINION.health] === 0) {
                                    to_delete.push(j);
                                    map_conquestProgress[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] = ENUM_SUBSQUARE.to_heal;
                                }

                                if (map_conquestHealth[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] === ENUM_SUBSQUARE.base_health) {
                                    map_conquestProgress[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] = ENUM_SUBSQUARE.conquered;
                                }

                            } else if (map_conquestProgress[minion[ENUM_MINION.current]][minion[ENUM_MINION.current_local]] === ENUM_SUBSQUARE.conquered) {
                                logic_nextAttackStep(i, minion);
                            }
                        }
                    }
                }
                if (to_delete.length > 0) {
                    for (j = map_minion[i]; j >= 0; j -= 1) {
                        for (minion = 0; minion < to_delete.length; minion += 1) {
                            if (j === to_delete[minion]) {
                                map_minion[i] -= 1;
                                player_minions[i].splice(j, 1);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    function logic_recountConquest(player) {
        var i, j, conquered;

        for (i = 0; i < map_conquest.length; i += 1) {

            if (map_conquest[i] > 0 && map[i] !== player) {
                conquered = true;
                for (j = 0; j < map_conquestPlayer[i].length; j += 1) {
                    if (map_conquestPlayer[i][j] !== player) {
                        conquered = false;
                        break;
                    }
                }

                if (conquered) {
                    //Square conquered
                    map[i] = player;
                    redrawBackground();
                    map_conquest[i] = 0;
                }
                //TODO serving AI
            } else if(map_conquest[i] > 0 && map[i] === player) {
                map_conquest[i] += 1;
                
                if (map_conquest[i] > 600) {
                    map_conquest[i] = 0;
                }
            }
        }
    }

    /*********************************************************************
     *
     *
     *  SECTION: RENDER
     *
     *
     *********************************************************************/


    function render_image(x, y, image, ctx) {
        x += offset_x - current_x;
        y += offset_y - current_y;
        if (x >= limit_left && x <= visible_limit_right && y >= limit_top && y <= visible_limit_bottom) {
            ctx.drawImage(image, x, y);
        }
    }

    function render_background() {
        var i, x, y;
        for (i = 0; i < map.length; i += 1) {
            if (map[i] !== 8) {
                if(map_conquest[i] > 0) {
                    render_image(helper_mapX(i, map_width) * background_square_width - 5,
                        helper_mapY(i, map_width) * background_square_height - 5,
                        attack_indicator, background_ctx);
                }
                render_image(helper_mapX(i, map_width) * background_square_width,
                    helper_mapY(i, map_width) * background_square_height,
                    background_square[map[i]], background_ctx);
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

    function render_minions() {
        var i, j, minion, x, y;
        for (i = 0; i < map.length; i += 1) {
            if (map[i] < 8) {
                for (j = 0; j < map_minion[i]; j += 1) {
                    minion = player_minions[i][j];
                    render_image(minion[ENUM_MINION.current_x] * background_square_width + minion[ENUM_MINION.current_local_x],
                        minion[ENUM_MINION.current_y] * background_square_height + minion[ENUM_MINION.current_local_y],
                        minion_square[map[i]], foreground_ctx);
                }
            }
        }
    }

    function render_progress() {
        var i, j;

        for (i = 0; i < map_conquest.length; i += 1) {
            if (map_conquest[i] !== 0) {
                for (j = 0; j < map_conquestPlayer[i].length; j += 1) {
                    if(map_conquestPlayer[i][j] !== 9) {
                        render_image(helper_mapX(i, map_width) * background_square_width + helper_mapX(j, square_minion_width) * minion_width,
                            helper_mapY(i, map_width) * background_square_height + helper_mapY(j, square_minion_width) * minion_height,
                            progress_square[map_conquestPlayer[i][j]], background_ctx);
                    }
                }
            }
        }
    }

    /*********************************************************************
     *
     *
     *  SECTION: THE GAME LOOP
     *
     *
     *********************************************************************/

    function render() {
        foreground_ctx.clearRect(0, 0, ENUM_GLOBAL.width, ENUM_GLOBAL.width);

        render_progress();
        render_minions();
    }

    function logic(count) {
        while (count) {
            updateTime += tickLength;
            logic_generateMinions();
            logic_updateMinionMovement();
            logic_order();
            logic_recountConquest(current_player);
            count -= 1;
        }
    }

    function frame(frameTime) {
        window.requestAnimationFrame(frame);
        var tickCount = Math.floor((frameTime - updateTime) / tickLength);
        if (tickCount > 0) {
            logic(tickCount);
            render();
        }
    }

    /*********************************************************************
     *
     *
     *  SECTION: ORDERS
     *
     *
     *********************************************************************/

    function inRange(player, x, y) {
        if (map[helper_remapPoint(x - 1, y, map_width)] === player) {
            return ENUM_MOVEMENT.left;
        } else if (map[helper_remapPoint(x, y - 1, map_width)] === player) {
            return ENUM_MOVEMENT.top;
        } else if (map[helper_remapPoint(x + 1, y, map_width)] === player) {
            return ENUM_MOVEMENT.right;
        } else if (map[helper_remapPoint(x, y + 1, map_width)] === player) {
            return ENUM_MOVEMENT.bottom;
        }

        return 0;
    }

    function order_attack(player, x, y, range) {
        var square, i;
        if (range === ENUM_MOVEMENT.left) {
            square = helper_remapPoint(x - 1, y, map_width);
        } else if (range === ENUM_MOVEMENT.right) {
            square = helper_remapPoint(x + 1, y, map_width);
        } else if (range === ENUM_MOVEMENT.top) {
            square = helper_remapPoint(x, y - 1, map_width);
        } else if (range === ENUM_MOVEMENT.bottom) {
            square = helper_remapPoint(x, y + 1, map_width);
        }

        //TODO: if not found minions, go to another
        map_conquest[helper_remapPoint(x, y, map_width)] = 1;
        redrawBackground()

        for (i = 0; i < map_minion[square]; i += 1) {
            if (player_minions[square][i][ENUM_MINION.order] === ENUM_ORDER.none) {
                player_minions[square][i][ENUM_MINION.destination_x] = x;
                player_minions[square][i][ENUM_MINION.destination_y] = y;
                player_minions[square][i][ENUM_MINION.order] = ENUM_ORDER.moving;
                player_availableMinions[player] -= 1;
            }
        }
    }

    function order_defence(player, x, y, range) {
        var i, square = helper_remapPoint(x, y, map_width);
        for (i = 0; i < map_conquestProgress[square].length; i += 1) {
            if((map_conquestPlayer[square][i] === player && map_conquestHealth[square][i] < ENUM_SUBSQUARE.base_health) ||
                map_conquestPlayer[square][i] !== player) {
                order_attack(player, x, y, range);
                map_conquest[square] = 0;
                redrawBackground();
                break;
            }
        }
    }

    function order_decision(player, x, y) {
        if (player_availableMinions[player] > 0) {
            var range;
            if (map[helper_remapPoint(x, y, map_width)] !== 8 && map[helper_remapPoint(x, y, map_width)] !== player) {
                range = inRange(player, x, y);
                if (range !== 0) {
                    order_attack(player, x, y, range);
                }
            } else if (map[helper_remapPoint(x, y, map_width)] === player) {
                range = inRange(player, x, y);
                if (range !== 0) {
                    order_defence(player, x, y, range);
                }
            }
        }
        //TODO: send message that no minions are available
    }

    /*********************************************************************
     *
     *
     *  SECTION: GENERATORS
     *
     *
     *********************************************************************/

    function generate_backgroundSquare(fill, border) {
        var square = document.createElement('canvas'),
            context;
        square.width = background_square_width;
        square.height = background_square_height;
        context = square.getContext('2d');
        context = render_rect(context, 2, 2, background_square_width - 4, background_square_height - 4, border, fill);
        context.fill();
        return square;
    }

    function generate_minionSquare(color) {
        var square = document.createElement('canvas'),
            context;
        square.width = minion_width;
        square.height = minion_height;
        context = square.getContext('2d');
        context = render_rect(context, minion_width / 4 - 2, minion_height / 4 - 2, minion_width / 2, minion_height / 2, "white", color);
        context.shadowBlur = 10;
        context.shadowColor = "white";
        context.globalAlpha = 1;
        context.fill();
        return square;
    }

    function generate_progressSquare(fill) {
        var square = document.createElement('canvas'),
            context;
        square.width = minion_width;
        square.height = minion_height;
        context = square.getContext('2d');
        context = render_rect(context, 2, 2, minion_width - 4, minion_height - 4, fill, fill);
        context.fill();
        return square;
    }

    function generate() {
        var i;
        background_square = new Array(10);
        minion_square = new Array(player_id.length);
        progress_square = new Array(player_id.length);
        attack_indicator = generate_backgroundSquare("red", "red");
        attack_indicator.width = background_square_width + 10;
        attack_indicator.height = background_square_height + 10;
        for (i = 0; i < 10; i += 1) {
            background_square[i] = undefined;
        }
        background_square[9] = generate_backgroundSquare("Orange", "Gold");
        for (i = 0; i < player_id.length; i += 1) {
            background_square[i] = generate_backgroundSquare(player_color[i], "Gold");
            minion_square[i] = generate_minionSquare(player_color[i]);
            progress_square[i] = generate_progressSquare(player_color[i]);
            //fore_minion[i] = generate_minion(player_color[i]);
        }
    }

    /*********************************************************************
     *
     *
     *  SECTION: LIESTENERS
     *
     *
     *********************************************************************/

    function recountGlobals() {
        offset_x = (ENUM_GLOBAL.width - screen_width * background_square_width) / 2;
        offset_y = (ENUM_GLOBAL.height - screen_height * background_square_height) / 2;
        limit_right = (map_width - screen_width + 1) * background_square_width;
        limit_bottom = (map_height - screen_height + 1) * background_square_height;
        limit_left = -1 * background_square_width;
        visible_limit_right = screen_width * background_square_width + 2 * offset_x;
        limit_top = -1 * background_square_height;
        visible_limit_bottom = screen_height * background_square_height + 2 * offset_y;
        generate();
        helper_guardBorders();
    }

    function moveScreen(x, y) {
        if (!screen_moved) {
            screen_moved = true;
            moved_x = x;
            moved_y = y;
        }
        current_x -= x - moved_x;
        current_y -= y - moved_y;
        moved_x = x;
        moved_y = y;
        helper_guardBorders();
        redrawBackground();
    }

    function listener_resize() {
        var windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            scaleX = windowWidth / ENUM_GLOBAL.width - 0.02,
            scaleY = windowHeight / ENUM_GLOBAL.height - 0.02,
            left,
            top;
        scale = Math.min(scaleX, scaleY);
        if (scale === scaleX) {
            left = "0px";
            top = ((windowHeight - ENUM_GLOBAL.height * scale) / 2) + "px";
        } else {
            left = ((windowWidth - ENUM_GLOBAL.width * scale) / 2) + "px";
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
                background_square_width *= 2;
                background_square_height *= 2;
                screen_width /= 2;
                screen_height /= 2;
                current_x *= 2;
                current_y *= 2;
                recountGlobals();
                redrawBackground();
            }
        } else if (code === 109) {
            if (zoom < zoom_limit_out) {
                zoom += 1;
                background_square_width /= 2;
                background_square_height /= 2;
                screen_width *= 2;
                screen_height *= 2;
                current_x /= 2;
                current_y /= 2;
                recountGlobals();
                redrawBackground();
            }
        }

        if (moved) {
            helper_guardBorders();
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
        if (screen_moved === false) {
            var x = e.offsetX + current_x - offset_x,
                y = e.offsetY + current_y - offset_y,
                range;
            if (x > 0 && y > 0 && x <= background_square_width * map_width && y <= background_square_height * map_height) {
                order_decision(current_player, Math.floor(x / background_square_width), Math.floor(y / background_square_height));
            }
        } else {
            screen_moved = false;
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
        screen_moved = false;
    }

    /*********************************************************************
     *
     *
     *  SECTION: MAIN
     *
     *
     *********************************************************************/

    function init() {
        //Truly initial variables
        var input_map = [
            [8, 9, 8, 8, 1],
            [9, 0, 9, 9, 9],
            [8, 9, 8, 8, 9],
            [9, 9, 9, 9, 8],
            [9, 8, 9, 9, 9],
            [9, 8, 9, 9, 9]
        ],
            type_map = [
            [0, 1, 0, 0, 5],
            [1, 5, 1, 1, 1],
            [0, 1, 0, 0, 1],
            [1, 1, 1, 1, 0],
            [1, 0, 1, 1, 1],
            [1, 0, 1, 1, 1]
        ],
            input_players = [
                {
                    "name": "claim",
                    "color": "blue",
                    "type": 0
            }, {
                    "name": "pc",
                    "color": "green",
                    "type": 2
            }
        ],
            i, j, k;

        //TODO: dunno how normal init would look like

        //Initialize player-related variables
        player_id = new Int8Array(input_players.length);
        player_name = new Array(input_players.length);
        player_color = new Array(input_players.length);
        player_type = new Int8Array(input_players.length);
        player_conquered = new Int8Array(input_players.length);
        player_availableMinions = new Int8Array(input_players.length);
        map_conquest = new Int8Array(input_map.length * input_map[0].length);

        //Fill player-related variables
        for (i = 0; i < input_players.length; i += 1) {
            player_id[i] = i;
            player_name[i] = input_players[i].name;
            player_color[i] = input_players[i].color;
            player_type[i] = input_players[i].type;
            if (player_type[i] === 0) {
                current_player = i;
            }
            player_conquered[i] = 1;
            player_availableMinions[i] = 3;
        }

        //Initialize map
        map_height = input_map.length;
        map_width = input_map[0].length;
        map = new Int8Array(input_map.length * input_map[0].length);
        map_type = new Int8Array(input_map.length * input_map[0].length);
        map_minion = new Int8Array(input_map.length * input_map[0].length);
        map_minion_progress = new Int16Array(input_map.length * input_map[0].length);
        map_conquestHealth = new Array(input_map.length * input_map[0].length);
        map_conquestProgress = new Array(input_map.length * input_map[0].length);
        map_conquestPlayer = new Array(input_map.length * input_map[0].length);
        player_minions = new Array(input_map.length * input_map[0].length);
        for (i = 0; i < input_map.length; i += 1) {
            for (j = 0; j < input_map[0].length; j += 1) {
                map[i * input_map[0].length + j] = input_map[i][j];
                map_type[i * input_map[0].length + j] = type_map[i][j];
                map_minion[i * input_map[0].length + j] = 0;
                map_minion_progress[i * input_map[0].length + j] = 0;
                if (input_map[i][j] !== 8) {
                    map_conquestHealth[i * input_map[0].length + j] = new Int8Array(square_minion_width * square_minion_height);
                    map_conquestProgress[i * input_map[0].length + j] = new Int8Array(square_minion_width * square_minion_height);
                    map_conquestPlayer[i * input_map[0].length + j] = new Int8Array(square_minion_width * square_minion_height);
                } else {
                    map_conquestHealth[i * input_map[0].length + j] = new Int8Array(1);
                    map_conquestProgress[i * input_map[0].length + j] = new Int8Array(1);
                }

                player_minions[i * input_map[0].length + j] = new Array(type_map[i][j]);

                if (input_map[i][j] < 8) {
                    map_minion[i * input_map[0].length + j] = 3;
                    player_minions[i * input_map[0].length + j][0] = helper_createDefaultMinion(j, i);
                    player_minions[i * input_map[0].length + j][1] = helper_createDefaultMinion(j, i);
                    player_minions[i * input_map[0].length + j][2] = helper_createDefaultMinion(j, i);
                }

                for (k = 0; k < map_conquestHealth[i * input_map[0].length + j].length; k += 1) {
                    if (input_map[i][j] !== 8) {
                        if (input_map[i][j] === 9) {
                            map_conquestHealth[i * input_map[0].length + j][k] = ENUM_SUBSQUARE.base_health;
                            map_conquestProgress[i * input_map[0].length + j][k] = ENUM_SUBSQUARE.free;
                        } else {
                            map_conquestHealth[i * input_map[0].length + j][k] = ENUM_SUBSQUARE.base_health + 5;
                            map_conquestProgress[i * input_map[0].length + j][k] = ENUM_SUBSQUARE.conquered;
                        }
                        map_conquestPlayer[i * input_map[0].length + j][k] = input_map[i][j];
                    }

                }
            }
        }

        //TODO: recound current_x and current_y
        current_x = 0;
        current_y = 0;
    }

    function mobileCheck() {
        if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
            return true;
        }
        return false;
    }

    function start() {
        init();
        //Setting up width/height of canvas elements
        foreground.width = ENUM_GLOBAL.width;
        foreground.height = ENUM_GLOBAL.height;
        middleground.width = ENUM_GLOBAL.width;
        middleground.height = ENUM_GLOBAL.height;
        background.width = ENUM_GLOBAL.width;
        background.height = ENUM_GLOBAL.height;

        recountGlobals();
        listener_resize();
        //Listeners
        window.addEventListener('resize', listener_resize);
        foreground.addEventListener('mouseup', listener_mouseup);

        if (mobileCheck()) {
            foreground.addEventListener('touchstart', listener_touchstart);
            foreground.addEventListener('touchend', listener_touchend);
        } else {
            window.addEventListener('keydown', listener_keydown);
            foreground.addEventListener('mousedown', listener_mousedown);
        }

        //Draw background
        render_background();

        //Start the main loop
        updateTime = window.performance.now();
        window.requestAnimationFrame(frame);
    }
    start();
};

SHAPEWARS(document, window);
