var ENUM_MOVEMENT = {
    "left": 1,
    "top": 2,
    "right": 3,
    "bottom": 4
};


var ENUM_SUBSQUARE = {
    "free": 0,
    "conquered": 1,
    "in_progress": 2,
    "healing": 3,
    "to_heal": 4,

    "base_health": 30
};

var ENUM_MINION = {
    "current_x": 0,
    "current_y": 1,
    "current_local_x": 2,
    "current_local_y": 3,
    "destination_x": 4,
    "destination_y": 5,
    "destination_local_x": 6,
    "destination_local_y": 7,
    "order": 8,
    "health": 9,
    "x_speed": 10,
    "y_speed": 11,
    "current": 12,
    "current_local": 13,
    "timer": 14,
    "size": 15,

    "generation_barier": 600,
    "speed": 1
};

var ENUM_ORDER = {
    "none": 0,
    "attack": 1,
    "defend": 2,
    "moving": 3
};

var ENUM_OBJECTIVES = {
    "CONQUER_ALL": 0,
    "CONQUER_PLAYER": 1,
    "FREE_FOR_ALL": 2,
    //"CONQUER_TILE": 3
}

var ENUM_RESTRICTIONS = {
    "NONE": 0,
    "NEUTRAL": 1,
    "PLAYERS": 2,
    "PEACE": 3,
    "ONE_PLAYER": 4
}

var ENUM_GLOBAL = {
    width: 680,
    height: 480
};
