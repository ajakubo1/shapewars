var io = require('sandbox-io');

var room_id = 1;
var player_id = 1;

var lobby2 = [];
var lobby4 = [];

var rooms = {};
var players = {};

io.on('connection', function (socket) {
    // See the generated log in the server console:
    log.debug('New connection', socket.id);
    socket.on('register', registration.bind(socket));
});

function registration(data) {
    if(data.mode === 0) {
        //Single player, let the party started :)
        //Generate the map and move on.
    } else {
        var i, id;
        //Multiplayer
        data.socket = this;
        if (data.players === 2) {
            lobby2.push(data);
            if(lobby2.length === 2) {
                //All in, let the party started :)
                //Generate the map and move on
                id = 'room' + room_id;
                room_id += 1;
                rooms[id] = {
                    'status': 0,
                    'players': []
                }

                for (i = 0; i < 2; i += 1) {
                    log.debug('sending request to: ' + lobby2[i].name);
                    lobby2[i].socket.emit('start');
                }

                lobby2 = [];
            }
        } else if (data.players === 4) {
            lobby4.push(data);
            if(lobby2.length === 4) {
                //All in, let the party started :)
                //Generate the map and move on
                for (i = 0; i < 4; i += 1) {
                    log.debug('sending request to: ' + lobby2[i].name);
                    lobby4[i].socket.emit('start');
                }

                lobby4 = [];
            }
        }
    }
}

function start(data) {

}

function receiveClientMessage(data) {
  if (data == 'Hello') {
    this.emit('srv-msg', { hello: 'Wold!' });
  } else {
    this.emit('srv-msg', {
      data: data,
      msg: 'This data is a ' +
       data.constructor.toString().replace(/^function ([^(]+).*/, '$1')
      }
    );
  }
}
