'use strict';

var GameHost = require('./gamehost');

var WebSocketServer = require('ws').Server
  , guid = require('guid').raw;


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

  return wsServer.on('connection', function (alice) {
    alice.id = guid();
    alice.onmessage = function (msg) {
      game.onmessage(alice, msg.data);
    };

    // Find an opponent.
    while (clientQueue.length) {
      var bob = clientQueue.shift();
      if (bob.readyState != bob.OPEN) {
        // Gone.
        continue;
      }

      return game.startGame(alice, bob);
    }

    game.send(alice, 'wait');
    clientQueue.push(alice);
  });
};
