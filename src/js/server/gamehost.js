'use strict';

var Board = require('../game/newboard');

var fzip = require('fzip')
  , extend = require('extend')
  , thus = require('thus')
  , dent = require('dent')
  , block = require('block-scope');


var protoGameHost = {
  onmessage: function (alice, message) {
    this.games[alice.id].send(message);
  },

  startGame: function (alice, bob) {
    this.games[alice.id] = bob;
    this.games[bob.id] = alice;

    var board = Board({
      width: this.width,
      height: this.height,
      startColor: 1,
      numColors: this.numColors
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
 * Parse board size configuration string.
 *
 * @arg {string} size
 * @return {height: number, width: number}
 */
var parseBoardSize = function (size) {
  dent(size.toLowerCase().split('x'));

  return {
    height: dent.o[0],
    width: dent.o[1]
  };
};


/**
 * Create game host controller.
 *
 * @arg {object} [options]
 * @property {string} [size="10x10"] - Board size.
 * @property {number} [numColors=3] - Number of spare colors.
 * @return {GameHost}
 */
module.exports = function (options) {
  options = options || {};
  options.size = options.size || '10x10';
  options.numColors = options.numColors || 3;

  return block(parseBoardSize(options.size), function (boardSize) {
    return thus(Object.create(protoGameHost), function () {
      this.games = {};
      this.height = boardSize.height;
      this.width = boardSize.width;
      this.numColors = options.numColors;
      return this;
    });
  });
};
