'use strict';

var Board = require('../game/newboard');

var fzip = require('fzip')
  , extend = require('extend')
  , thus = require('thus');


var protoGameHost = {
  onmessage: function (alice, message) {
    this.games[alice.id].send(message);
  },

  startGame: function (alice, bob) {
    this.games[alice.id] = bob;
    this.games[bob.id] = alice;

    var board = Board({
      width: 10,
      height: 10,
      startColor: 1,
      numColors: 3
    });

    var pAlice = { i: board.height - 1, j: 0 };
    var pBob = { i: 0, j: board.width - 1 };

    board.colorAt(pAlice, 0);
    board.colorAt(pBob, board.numColors + 1);
    board.numColors += 2;

    var message = {
      code: 'start',
      numColors: board.numColors,
      board: board.colors
    };

    fzip.each([alice, bob], [[pAlice, pBob], [pBob, pAlice]], function (player, pos) {
      player.send(extend({}, message, {
        player: pos[0],
        opponent: pos[1]
      }));
    });
  }
};


/**
 * Create game host controller.
 */
module.exports = function () {
  return thus(Object.create(protoGameHost), function () {
    this.games = {};
    return this;
  });
};
