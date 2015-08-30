enum_movement = {
    "left": 1,
    "top": 2,
    "right": 3,
    "bottom": 4
},

enum_subsquare = {
    "free": 0,
    "conquered": 1,
    "in_progress": 2,
    "healing": 3,
    "to_heal": 4
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
    "order": 8,
    "health": 9,
    "x_speed": 10,
    "y_speed": 11,
    "current": 12,
    "current_local": 13,
    "size": 14
},

    
    enum_order = {
        "none": 0,
        "attack": 1,
        "defend": 2,
        "moving": 3
    },