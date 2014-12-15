'use strict';

var Board = require('./game/board')
  , Grid = require('./client/grid');

var Socket = require('simple-websocket')
  , rainbow = require('color-rainbow')
  , thus = require('thus')
  , colorNamer = require('color-namer')
  , declared = require('declared');

var EventEmitter = require('events').EventEmitter;


var server = new Socket('ws://localhost:2020');
var game = new EventEmitter;
var grid;



var showMyColor = function (color) {
  document.getElementById('mycolor').style.display = 'block';

  thus(document.getElementById('mycolor-icon'), function () {
    var hex = color.hexString();
    this.textContent = color.keyword() || colorNamer(hex, 'html')[0].name;
    this.style.color = hex;
  });
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

    var board = Board(message.numColors, message.board);
    var player = message.player;
    var opponent = message.opponent;
    var playerColor = board.colorAt(player);
    game.opponentColor = board.colorAt(opponent);

    var canvas = document.getElementById('grid');
    var palette = rainbow.create(board.numColors);

    game.grid = Grid(board, canvas, palette);
    game.grid.on('click', function (i, j, color) {
      color = declared(color, playerColor);

      board.regions[i][j].forEach(function (pos) {
        this.fill(pos.i, pos.j, color);
      }, this);
      board.recomputeRegions();

      if (color == playerColor) {
        server.send(JSON.stringify({
          code: 'click',
          i: i,
          j: j
        }));
      }
    });

    showMyColor(palette[playerColor]);
  })
  .on('click', function (message) {
    // Opponent clicked some cell.
    game.grid.emit('click', message.i, message.j, game.opponentColor);
  });
