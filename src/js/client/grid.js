'use strict';

var CanvasGrid = require('canvas-grid')
  , extend = require('extend');

var EventEmitter = require('events').EventEmitter;


var protoGrid = extend(new EventEmitter, {
  /**
   * Fill cell with color.
   *
   * @arg {number} i
   * @arg {number} j
   * @arg {number} color - According to the specified palette.
   * @return {Grid}
   */
  fill: function (i, j, color) {
    this.board.colors[i][j] = color;
    this.canvasGrid.fillCell(j, i, this.palette[color].hexString());
    return this;
  },

  /**
   * Temporarily disable grid listeners.
   *
   * @return {Grid}
   */
  disable: function () {
    this.disabled = true;
  },

  /**
   * Re-enable grid listeners.
   *
   * @return {Grid}
   */
  enable: function () {
    this.disabled = false;
  },

  // Auto-subscribe to canvas events.
  on: function (type, listener) {
    this.canvas.addEventListener(type, function (event) {
      if (!this.disabled) {
        this.emit(type, event.gridInfo.y, event.gridInfo.x);
      }
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
