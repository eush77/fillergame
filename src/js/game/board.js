'use strict';

var computeRegions = require('./regions');

var flatmap = require('flatmap')
  , uniq = require('uniq')
  , cmpby = require('cmpby');


var protoBoard = {
  /**
   * Recompute regions from cell colors.
   */
  recomputeRegions: function () {
    this.regions = computeRegions(this.colors);
  },

  /**
   * Get list of the (i,j)'s region's neighbors of another color.
   *
   * @arg {i: number, j: number} position
   * @return {[{i: number, j: number}]}
   */
  border: function (position) {
    var i = position.i;
    var j = position.j;
    var baseColor = this.colors[i][j];

    var matches = function (i, j) {
      return this.colors[i] && this.colors[i][j] !== baseColor;
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
  },

  /**
   * Access cell's color by position object.
   *
   * @arg {i: number, j: number} position
   * @arg {number} [value]
   * @return {number}
   */
  colorAt: function (position, value) {
    if (value == null) {
      return this.colors[position.i][position.j];
    }
    else {
      return this.colors[position.i][position.j] = value;
    }
  },

  /**
   * Access cell's region by position object.
   *
   * @arg {i: number, j: number} position
   * @return {[{i: number, j: number}]}
   */
  regionAt: function (position) {
    return this.regions[position.i][position.j];
  }
};


/**
 * Make board from 2D-array of cell colors.
 *
 * @arg {number} numColors - Number of different cell colors.
 * @arg {number[][]} colors - Each color is in [0..numColors-1] range.
 * @return {Board}
 */
module.exports = function (numColors, colors) {
  return Object.create(protoBoard, {
    height: {
      enumerable: true,
      value: colors.length
    },
    width: {
      enumerable: true,
      value: colors[0].length
    },
    numColors: {
      enumerable: true,
      writable: true,
      value: numColors
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
