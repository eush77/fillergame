'use strict';

var range = require('array-range')
  , cmpby = require('cmpby');


/**
 * Return fractions of the board owned by involved parties,
 * sorted from the most expanded to the least.
 *
 * @arg {Board} board
 * @return {{color: number, size: number}[]}
 */
exports.scores = function (board) {
  var counters = range(board.numColors).map(function (color) {
    return {
      color: color,
      size: 0
    };
  });

  board.colors.forEach(function (row) {
    row.forEach(function (color) {
      counters[color].size += 1;
    });
  });

  return counters.sort(cmpby(function (counter) {
    return counter.size;
  }, { asc: false }));
};


/**
 * Return the most expanded party.
 *
 * @arg {Board} board
 * @return {color: number, count: number}
 */
exports.overlord = function (board) {
  return exports.scores(board)[0];
};
