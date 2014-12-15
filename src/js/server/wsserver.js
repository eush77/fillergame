'use strict';

var GameHost = require('./gamehost');

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

  return wsServer.on('connection', function (alice) {
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
