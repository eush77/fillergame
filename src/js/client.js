'use strict';

var makeBoard = require('./game/board');

var Socket = require('simple-websocket')
  , CanvasGrid = require('canvas-grid')
  , rainbow = require('color-rainbow');

var EventEmitter = require('events').EventEmitter;


var server = new Socket('ws://localhost:2020');
var game = new EventEmitter;
var grid;


/**
 * Create canvas grid object.
 *
 * @arg {Board} board
 * @return {fill: function, on: function}
 */
var createGrid = function (board) {
  var canvas = document.getElementById('grid');

  grid = new CanvasGrid(canvas);
  grid.drawMatrix({
    x: board.width,
    y: board.height
  });

  var palette = rainbow.create(board.numColors);

  board.colors.forEach(function (row, i) {
    row.forEach(function (c, j) {
      grid.fillCell(i, j, palette[c].hexString());
    });
  });

  return {
    fill: function (i, j, color) {
      board.regions[i][j].forEach(function (pos) {
        grid.fillCell(pos.i, pos.j, palette[color].hexString());
      });
      board.recomputeRegions();
      return this;
    },
    on: function (event, cb) {
      canvas.addEventListener(event, cb.bind(this));
      return this;
    }
  };
};


server.on('message', function (message) {
  game.emit(message.code, message);
});

game
  .on('wait', function () {
    console.log('Waiting for the opponent.');
  })
  .on('start', function (message) {
    console.log('Let the carnage begin!');

    var board = makeBoard(message.numColors, message.board);
    var myColor = board.colorAt(message.myPosition);
    game.hisColor = board.colorAt(message.hisPosition);

    game.grid = createGrid(board);

    game.grid.on('click', function (event) {
      server.send(JSON.stringify({
        code: 'click',
        i: event.gridInfo.x,
        j: event.gridInfo.y
      }));

      this.fill(event.gridInfo.x, event.gridInfo.y, myColor);
    });
  })
  .on('click', function (message) {
    // Opponent clicked some cell.
    game.grid.fill(message.i, message.j, game.hisColor);
  });
