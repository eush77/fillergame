'use strict';

var guid = require('guid').raw;


var protoPlayer = {
  /**
   * Send an object.
   *
   * @arg {*} data
   * @return {Player}
   */
  send: function (data) {
    this.socket.send(JSON.stringify(data));
    return this;
  },

  /**
   * Check if the player is still connected.
   *
   * @return {boolean}
   */
  connected: function () {
    return this.socket.readyState == this.socket.OPEN;
  }
};


/**
 * Create player object.
 * One socket can be associated with no more than a single player.
 *
 * @arg {ws.WebSocket} socket
 * @arg {function(message)} [onmessage]
 * @return {Player}
 */
module.exports = function (socket, onmessage) {
  onmessage = onmessage || function () {};

  var player = Object.create(protoPlayer, {
    socket: {
      value: socket
    },
    id: {
      enumerable: true,
      value: guid()
    },
    onmessage: {
      writable: true,
      enumerable: true,
      value: onmessage
    }
  });

  socket.onmessage = function (msg) {
    player.onmessage(JSON.parse(msg.data));
  };

  return player;
};
