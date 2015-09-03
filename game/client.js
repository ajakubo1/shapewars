
//send('Hello');


var COMMUNICATION = (function () {
    var socket = io(document.location.href),
        log = document.getElementById('log'),
        registration = document.getElementById('registration'),
        register_button = document.getElementById('register'),
        name_field = document.getElementById('username'),
        player_field = document.getElementById('players'),
        mode_field = document.getElementById('mode'),
        mode, players, name,
        color_carousel = [
            "Blue",
            "Crimson",
            "DarkGreen",
            "DarkOrange",
            "DarkSlateBlue",
            "DarkTurquoise",
            "HotPink",
            "Indigo"
        ],

        input_players;

    function log(type, subtype, msg) {
        if(type === 1) {
            type = "Received";
        } else {
            type = "Sending"
        }
        log.innerHTML += '<li>' + Date.now() + ' | ' + type + ' | ' + subtype + ' | ' + msg + '</li>';
    }

    function registered(data) {
        input_players = data;
        registration.style.display = "none";
    }

    socket.on('registered', function(data) {
        log(1, 'registered', JSON.stringify(data));
        registered(data);
    });

    socket.on('start', function (data) {
        log(1, 'start', JSON.stringify(data));
    });

    function send(type, data) {
        log(0, type, JSON.stringify(data));
        socket.emit(type, data);
    }

    function register() {
        name = name_field.value;
        players = parseInt(player_field.options[player_field.selectedIndex].value);
        mode = parseInt(mode_field.options[mode_field.selectedIndex].value); //Single player

        if(mode === 1) {
            send('register', {
                "name": name,
                "players": players,
                "mode": mode
            });
        } else {
            var i, reg_data = [];

            reg_data.push({
                "name": name,
                "color": color_carousel[0],
                "type": 0
            })

            for (i = 1; i < players; i += 1) {
                reg_data.push({
                    "name": "pc-" + i,
                    "color": color_carousel[i],
                    "type": 2
                })
            }

            registered(reg_data);
        }
    }

    register_button.addEventListener('click', register);
})();
