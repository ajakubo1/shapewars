var SHAPEWARS = function (document, window) {
    "use strict";

    //Map-related variables for 1d to 2d mapping
    var map, map_width, map_height,
        map_conquest, map_conquestProgress, map_minion, map_minion_progress, map_type,
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
        //Game width/height
        width = 680,
        height = 480,
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
        minion_square,
        
        enum_movement = {
            "left": 1,
            "top": 2,
            "right": 3,
            "bottom" : 4
        },
        
        enum_subsquare = {
            "conquered": 1,
            "free": 0
        },
        
        enum_subsquare_baseHealth = 30,
        enum_minion_generationBarier = 600,
        
        enum_minion = {
            "current_x": 0,
            "current_y": 1,
            "current_local_x": 2,
            "current_local_y": 3,
            "destination_x": 4,
            "destination_y": 5,
            "destination_local_x": 6,
            "destination_local_y": 7,
            "order": 8
        },
        
        enum_order = {
            "none": 0,
            "attack": 1,
            "defend": 2,
            "moving": 3
        };


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
            if (map[i] < 8 && (map_minion[i] < map_type[i])) {
                map_minion_progress[i] += 1;
                if(map_minion_progress[i] >= enum_minion_generationBarier) {
                    map_minion_progress[i] = 0;
                    map_minion[i] += 1;
                    player_availableMinions[map[i]] += 1;
                    console.info(player_name[map[i]], map_minion[i]);
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

    function render_background() {
        var i, x, y;

        for (i = 0; i < map.length; i += 1) {
            if (map[i] !== 8) {
                x = helper_mapX(i, map_width) * background_square_width + offset_x - current_x;
                y = helper_mapY(i, map_width) * background_square_height + offset_y - current_y;
                if (x >= limit_left && x <= visible_limit_right && y >= limit_top && y <= visible_limit_bottom) {
                    background_ctx.drawImage(background_square[map[i]], x, y);
                }
            }
        }
    }

    function redrawBackground() {
        background_ctx.clearRect(0, 0, width, height);
        render_background();
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
     *  SECTION: THE GAME LOOP
     *
     *
     *********************************************************************/

    function render() {
        
    }

    function logic(count) {
        while (count) {
            updateTime += tickLength;
            logic_generateMinions();
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
            return enum_movement.left;
        } else if (map[helper_remapPoint(x, y - 1, map_width)] === player) {
            return enum_movement.top;
        } else if (map[helper_remapPoint(x + 1, y, map_width)] === player) {
            return enum_movement.right;
        } else if (map[helper_remapPoint(x, y + 1, map_width)] === player) {
            return enum_movement.bottom;
        }
        
        return 0;
    }
    
    function order_attack(player, x, y, range) {
        
    }
    
    function order_defence(player, x, y, range) {
        
    }

    function order_decision(player, x, y) {
        if (player_availableMinions[player] > 0) {
            var range;
            if (map[helper_remapPoint(x, y, map_width)] !== 8 && map[helper_remapPoint(x, y, map_width)] !== player) {
                range = inRange(player, x, y);
                order_attack(player, x, y, range);
            } else if (map[helper_remapPoint(x, y, map_width)] === player) {
                range = inRange(player, x, y);
                order_defence(player, x, y, range);
            }
        }
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

    function generate() {
        var i;
        background_square = new Array(10);
        for (i = 0; i < 10; i += 1) {
            background_square[i] = undefined;
        }
        background_square[9] = generate_backgroundSquare("Orange", "Gold");
        for (i = 0; i < player_id.length; i += 1) {
            background_square[i] = generate_backgroundSquare(player_color[i], "Gold");
            //takeover_square[i] = generate_takeoverSquare(player_color[i], "Gold");
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
        offset_x = (width - screen_width * background_square_width) / 2;
        offset_y = (height - screen_height * background_square_height) / 2;
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
        ], type_map = [
            [0, 1, 0, 0, 5],
            [1, 5, 1, 1, 1],
            [0, 1, 0, 0, 1],
            [1, 1, 1, 1, 0],
            [1, 0, 1, 1, 1],
            [1, 0, 1, 1, 1]
        ], input_players = [
            {
                "name": "claim",
                "color": "blue",
                "type": 0
            }, {
                "name": "pc",
                "color": "green",
                "type": 2
            }
        ], i, j, k;

        //TODO: dunno how normal init would look like

        //Initialize player-related variables
        player_id = new Int8Array(input_players.length);
        player_name = new Array(input_players.length);
        player_color = new Array(input_players.length);
        player_type = new Int8Array(input_players.length);
        player_conquered = new Int8Array(input_players.length);
        player_availableMinions = new Int8Array(input_players.length);
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
        map_conquest = new Array(input_map.length * input_map[0].length);
        map_conquestProgress = new Array(input_map.length * input_map[0].length);
        for (i = 0; i < input_map.length; i += 1) {
            for (j = 0; j < input_map[0].length; j += 1) {
                map[i * input_map[0].length + j] = input_map[i][j];
                map_type[i * input_map[0].length + j] = type_map[i][j];
                map_minion[i * input_map[0].length + j] = 0;
                map_minion_progress[i * input_map[0].length + j] = 0;
                if (input_map[i][j] !== 8) {
                    map_conquest[i * input_map[0].length + j] = new Int8Array(background_square_width / minion_width * background_square_height / minion_height);
                    map_conquestProgress[i * input_map[0].length + j] = new Int8Array(background_square_width / minion_width * background_square_height / minion_height);
                } else {
                    map_conquest[i * input_map[0].length + j] = new Int8Array(1);
                    map_conquestProgress[i * input_map[0].length + j] = new Int8Array(1);
                }
                
                if (input_map[i][j] < 8) {
                    map_minion[i * input_map[0].length + j] = 3;
                }
                
                for (k = 0; k < map_conquest[i * input_map[0].length + j].length; k += 1) {
                    if (input_map[i][j] !== 8) {
                        if (input_map[i][j] === 9) {
                            map_conquest[i * input_map[0].length + j][k] = enum_subsquare_baseHealth;
                            map_conquestProgress[i * input_map[0].length + j][k] = enum_subsquare.free;
                        } else {
                            map_conquest[i * input_map[0].length + j][k] = enum_subsquare_baseHealth + 5;
                            map_conquestProgress[i * input_map[0].length + j][k] = enum_subsquare.conquered;
                        }
                    }
                    
                }
            }
        }

        //TODO: recound current_x and current_y
        current_x = 0;
        current_y = 0;
    }

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

    function start() {
        init();
        //Setting up width/height of canvas elements
        foreground.width = width;
        foreground.height = height;
        middleground.width = width;
        middleground.height = height;
        background.width = width;
        background.height = height;

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
