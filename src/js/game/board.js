'use strict';

var computeRegions = require('./regions');

var flatmap = require('flatmap')
  , uniq = require('uniq')
  , cmpby = require('cmpby');


var protoBoard = {
  /**
   * Get list of the (i,j)'s region's neighbors of the given color.
   *
   * @arg {number} i
   * @arg {number} j
   * @arg {number} color
   * @return {[{i: number, j: number}]}
   */
  neighborsOfColor: function (i, j, color) {
    var matches = function (i, j) {
      return this.colors[i] && this.colors[i][j] === color;
    }.bind(this);

    var neighbors = flatmap(this.regions[i][j], function (cell) {
      return flatmap([[-1, 0], [1, 0], [0, -1], [0, 1]], function (delta) {
        var i = cell.i + delta[0];
        var j = cell.j + delta[1];

        return matches(i, j) ? [{ i: i, j: j }] : [];
      });
    });

    // `neighbors` can contain duplicates at this point.
    return uniq(neighbors, cmpby(JSON.stringify));
  }
};


/**
 * Make board from 2D-array of cell colors.
 *
 * @arg {number[][]} colors
 * @return {Board}
 */
module.exports = function (colors) {
  return Object.create(protoBoard, {
    height: {
      enumerable: true,
      value: colors.length
    },
    width: {
      enumerable: true,
      value: colors[0].length
    },
    colors: {
      writable: true,
      enumerable: true,
      value: colors
    },
    regions: {
      writable: true,
      enumerable: true,
      value: computeRegions(colors)
    }
  });
};
