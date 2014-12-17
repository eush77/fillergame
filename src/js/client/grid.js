'use strict';

var CanvasGrid = require('canvas-grid')
  , extend = require('extend');

var EventEmitter = require('events').EventEmitter;


var protoGrid = extend(new EventEmitter, {
  fill: function (i, j, color) {
    this.board.colors[i][j] = color;
    this.canvasGrid.fillCell(j, i, this.palette[color].hexString());
    return this;
  },
  on: function (type, listener) {
    this.canvas.addEventListener(type, function (event) {
      this.emit(type, event.gridInfo.y, event.gridInfo.x);
    }.bind(this));

    EventEmitter.prototype.on.call(this, type, listener);
  }
});


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

  return Object.create(protoGrid, {
    board: { value: board },
    canvas: { value: canvas },
    palette: { value: palette },
    canvasGrid: { value: canvasGrid }
  });
};
