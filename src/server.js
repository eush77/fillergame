'use strict';

var makeBoard = require('./game/newboard');

var WebSocketServer = require('ws').Server
  , guid = require('guid').raw
  , fzip = require('fzip')
  , extend = require('extend');


var port = 2020;
var server = new WebSocketServer({ port: port });
var clientQueue = [];
var games = {};


var newClient = function (client) {
  client.id = guid();
  client.onmessage = function (msg) {
    games[client.id].send(msg.data);
  };
};


var startGame = function (alice, bob) {
  var board = makeBoard({
    width: 5,
    height: 5,
    numColors: 3
  });

  var message = {
    code: 'start',
    board: board.colors
  };

  fzip.each([alice, bob], [[board.height - 1, 0], [0, board.width - 1]], function (player, pos) {
    player.send(JSON.stringify(extend({}, message, {
      position: { i: pos[0], j: pos[1] }
    })));
  });
};


server.on('connection', function (alice) {
  newClient(alice);

  // Find an opponent.
  while (clientQueue.length) {
    var bob = clientQueue.shift();
    if (bob.readyState != bob.OPEN) {
      // Gone.
      continue;
    }

    games[alice.id] = bob;
    games[bob.id] = alice;

    return startGame(alice, bob);
  }

  alice.send(JSON.stringify({ code: 'wait' }));
  clientQueue.push(alice);
});


console.log('Server started at localhost:' + port);
