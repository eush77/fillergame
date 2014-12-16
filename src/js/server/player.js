'use strict';


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
 * @arg {number} id
 * @arg {function(message)} [onmessage]
 * @return {Player}
 */
module.exports = function (socket, id, onmessage) {
  onmessage = onmessage || function () {};

  var player = Object.create(protoPlayer, {
    socket: {
      value: socket
    },
    id: {
      enumerable: true,
      value: id
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
