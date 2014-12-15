'use strict';

var CanvasGrid = require('canvas-grid')
  , extend = require('extend');

var EventEmitter = require('events').EventEmitter;


/**
 * Create canvas grid object.
 *
 * @arg {HTMLCanvasElement} canvas
 * @arg {Board} board
 * @arg {Color[]} palette
 * @return {Grid}
 */
module.exports = function (board, canvas, palette) {
  // Set up the grid.
  var canvasGrid = new CanvasGrid(canvas);
  canvasGrid.drawMatrix({
    x: board.width,
    y: board.height
  });

  // Fill cells according to `board` and `palette`.
  board.colors.forEach(function (row, i) {
    row.forEach(function (c, j) {
      canvasGrid.fillCell(j, i, palette[c].hexString());
    });
  });

  // Create grid wrapper.
  var grid = extend(new EventEmitter, {
    fill: function (i, j, color) {
      board.colors[i][j] = color;
      canvasGrid.fillCell(j, i, palette[color].hexString());
      return this;
    }
  });

  grid.on = function (type, listener) {
    canvas.addEventListener(type, function (event) {
      grid.emit(type, event.gridInfo.y, event.gridInfo.x);
    });

    EventEmitter.prototype.on.call(grid, type, listener);
  };

  return grid;
};
