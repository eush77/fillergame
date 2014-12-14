'use strict';

var makeBoard = require('./game/newboard');

var WebSocketServer = require('ws').Server
  , guid = require('guid').raw
  , fzip = require('fzip')
  , extend = require('extend')
  , StaticServer = require('node-static').Server;

var http = require('http');


var protoGameHost = {
  newClient: function (client) {
    client.id = guid();
    client.onmessage = function (msg) {
      this.games[client.id].send(msg.data);
    }.bind(this);
  },

  startGame: function (alice, bob) {
    this.games[alice.id] = bob;
    this.games[bob.id] = alice;

    var board = makeBoard({
      width: 10,
      height: 10,
      numColors: 3
    });

    var message = {
      code: 'start',
      numColors: board.numColors,
      board: board.colors
    };

    var pAlice = { i: board.height - 1, j: 0 };
    var pBob = { i: 0, j: board.width - 1 };

    board.colorAt(pAlice, 0);
    board.colorAt(pBob, 1);

    fzip.each([alice, bob], [[pAlice, pBob], [pBob, pAlice]], function (player, pos) {
      player.send(JSON.stringify(extend({}, message, {
        myPosition: pos[0],
        hisPosition: pos[1]
      })));
    });
  }
};


var createGameHost = function () {
  var host = Object.create(protoGameHost);

  host.clientQueue = [];
  host.games = {};

  return host;
};


var createWsServer = function (port) {
  var wsServer = new WebSocketServer({ port: port });
  var game = createGameHost();

  wsServer.on('connection', function (alice) {
    game.newClient(alice);

    // Find an opponent.
    while (game.clientQueue.length) {
      var bob = game.clientQueue.shift();
      if (bob.readyState != bob.OPEN) {
        // Gone.
        continue;
      }

      return game.startGame(alice, bob);
    }

    alice.send(JSON.stringify({ code: 'wait' }));
    game.clientQueue.push(alice);
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
