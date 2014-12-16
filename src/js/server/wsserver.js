'use strict';

var GameHost = require('./gamehost')
  , Player = require('./player');

var WebSocketServer = require('ws').Server;


/**
 * Create WebSocket game server.
 *
 * @arg {number} port
 * @return {ws.Server}
 */
module.exports = function (port) {
  var wsServer = new WebSocketServer({ port: port });
  var game = GameHost();
  var clientQueue = [];

  return wsServer.on('connection', function (socket) {
    var alice = Player(socket, function (message) {
      game.onmessage(this, message);
    });
    console.log(alice.id, 'connected');

    // Find an opponent.
    while (clientQueue.length) {
      var bob = clientQueue.shift();
      if (!bob.connected()) {
        // Gone.
        continue;
      }

      return game.startGame(alice, bob);
    }

    alice.send({ code: 'wait' });
    clientQueue.push(alice);
  });
};
