'use strict';

var board = require('./board');


/**
 * Generate new board.
 *
 * @arg {object} options
 * @property {number} width
 * @property {number} height
 * @property {number} numColors
 */
module.exports = function (options) {
  var colors = [];

  for (var i = 0; i < options.height; ++i) {
    colors[i] = [];
    for (var j = 0; j < options.width; ++j) {
      colors[i][j] = Math.floor(Math.random() * options.numColors);
    }
  }

  return board(options.numColors, colors);
};
