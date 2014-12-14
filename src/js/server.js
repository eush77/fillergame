'use strict';

var makeBoard = require('./game/newboard');

var WebSocketServer = require('ws').Server
  , guid = require('guid').raw
  , fzip = require('fzip')
  , extend = require('extend')
  , StaticServer = require('node-static').Server;

var http = require('http');


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


var createWsServer = function (port) {
  var wsServer = new WebSocketServer({ port: port });
  var clientQueue = [];
  var games = {};

  wsServer.on('connection', function (alice) {
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
};


var createHttpServer = function (port) {
  var fileServer = new StaticServer('dist');

  http.createServer(function (request, response) {
    console.log(request.method, request.url);
    fileServer.serve(request, response);
  }).listen(port);
};


/**
 * Start the game server.
 *
 * @arg {number} port - Front-end HTTP server port.
 * @arg {number} wsport - Back-end WebSocket server port.
 */
var start = function (port, wsport) {
  createWsServer(wsport);
  createHttpServer(port);

  console.log('Server started at localhost:' + port);
};

start(5001, 2020);
