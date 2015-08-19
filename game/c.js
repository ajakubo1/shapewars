(function (document, window) {
    "use strict";

    //Map-related variables for 1d to 2d mapping
    var map, map_width, map_height,
        //Player-related variables
        player_id, player_name, player_color, player_type, player_busy,
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
        square_width = 160,
        square_height = 150,
        //Map moving/navigation
        offset_x, offset_y,
        limit_right, limit_left, limit_bottom, limit_top,
        current_x, current_y,
        visible_limit_right, visible_limit_bottom;


    function guardBorders() {
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

    /*********************************************************************
     *
     *
     *  SECTION: MAIN LOOP
     *
     *
     *********************************************************************/

    function render() {

    }

    function logic(count) {
        while (count) {
            updateTime += tickLength;
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
     *  SECTION: GENERATORS
     *
     *
     *********************************************************************/

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
            input_players = [
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
            i, j;

        //TODO: dunno how normal init would look like

        //Initialize map
        map_height = input_map.length;
        map_width = input_map[0].length;
        map = new Int8Array(input_map.length * input_map[0].length);
        for (i = 0; i < input_map.length; i += 1) {
            for (j = 0; j < input_map[0].length; j += 1) {
                map[i * input_map[0].length + j] = input_map[i][j];
            }
        }
        //Initialize player-related variables
        player_id = new Int8Array(input_players.length);
        player_name = new Int8Array(input_players.length);
        player_color = new Int8Array(input_players.length);
        player_type = new Int8Array(input_players.length);
        player_busy = new Int8Array(input_players.length);
        //Fill player-related variables
        for (i = 0; i < input_players.length; i += 1) {
            player_id[i] = i;
            player_name[i] = input_players[i].name;
            player_color[i] = input_players[i].color;
            player_type[i] = input_players[i].type;
            if (player_type[i] === 0) {
                current_player = i;
            }
            player_busy[i] = 0;
        }
    }

    function recountGlobals() {
        offset_x = (width - screen_width * square_width) / 2;
        offset_y = (height - screen_height * square_height) / 2;
        limit_right = (map_width - screen_width + 1) * square_width;
        limit_bottom = (map_height - screen_height + 1) * square_height;
        limit_left = -1 * square_width;
        visible_limit_right = screen_width * square_width + offset_x;
        limit_top = -1 * square_height;
        visible_limit_bottom = screen_height * square_height + offset_y;
        generate();
        guardBorders();
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

        //Start the main loop
        updateTime = window.performance.now();
        window.requestAnimationFrame(frame);
    }
    start();
}(document, window));
