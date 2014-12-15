'use strict';

var Board = require('./game/board')
  , Grid = require('./client/grid');

var Socket = require('simple-websocket')
  , rainbow = require('color-rainbow')
  , thus = require('thus')
  , colorNamer = require('color-namer')
  , declared = require('declared')
  , humane = require('humane-js').create({ timeout: 500 });

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
    humane.log('Waiting for the opponent&hellip;', { timeout: 0 });
  })
  .on('start', function (message) {
    humane.remove();
    humane.log('Let the carnage begin!', { timeout: 1500 });

    var board = Board(message.numColors, message.board);
    var player = message.player;
    game.opponent = message.opponent;

    var canvas = document.getElementById('grid');
    var palette = rainbow.create(board.numColors);

    game.grid = Grid(board, canvas, palette);

    game.grid.on('click', function (i, j, owner) {
      owner = declared(owner, player);
      var ownerColor = board.colorAt(owner);
      var targetRegion = board.regions[i][j];

      var canProceed = board.border(owner).some(function (pos) {
        return board.regionAt(pos) == targetRegion;
      });

      if (!canProceed) {
        humane.log('Invalid move!');
        return;
      }

      targetRegion.forEach(function (pos) {
        this.fill(pos.i, pos.j, ownerColor);
      }, this);
      board.recomputeRegions();

      if (owner == player) {
        server.send(JSON.stringify({
          code: 'click',
          i: i,
          j: j
        }));
      }
    });

    showMyColor(palette[board.colorAt(player)]);
  })
  .on('click', function (message) {
    // Opponent clicked some cell.
    game.grid.emit('click', message.i, message.j, game.opponent);
  });
