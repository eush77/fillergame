'use strict';

var Board = require('./game/board')
  , Grid = require('./client/grid')
  , wsconfig = require('../wsconfig.json')
  , stat = require('./game/stat');

var Socket = require('simple-websocket')
  , rainbow = require('color-rainbow')
  , thus = require('thus')
  , colorNamer = require('color-namer')
  , declared = require('declared')
  , humane = require('humane-js').create({ timeout: 500 })
  , uniq = require('uniq');

var EventEmitter = require('events').EventEmitter;


var showMyColor = function (color) {
  document.getElementById('mycolor').style.display = 'block';

  thus(document.getElementById('mycolor-icon'), function () {
    var hex = color.hexString();
    this.textContent = color.keyword() || colorNamer(hex, 'html')[0].name;
    this.style.color = hex;
  });
};


var win = function () {
  humane.log('You win!', { timeout: 0 });
};

var lose = function () {
  humane.log('You lost.', { timeout: 0 });
};


var Game = function (server) {
  return new EventEmitter().
    on('wait', function () {
      humane.log('Waiting for the opponent&hellip;', { timeout: 0 });
    }).

    on('start', function (message) {
      var game = this;
      game.player = message.player;
      game.opponent = message.opponent;

      game.board = Board(message.numColors, message.board);
      game.playerColor = game.board.colorAt(game.player);
      game.opponentColor = game.board.colorAt(game.opponent);

      var canvas = document.getElementById('grid');
      var palette = rainbow.create(game.board.numColors);
      game.grid = Grid(game.board, canvas, palette);

      var validateMove = function (region) {
        var instantWin = region == game.board.regionAt(game.opponent);

        var unreachable = !game.board.border(game.player).some(function (pos) {
          return game.board.regionAt(pos) == region;
        });

        var invalidMove = instantWin || unreachable;

        if (invalidMove) {
          humane.log('Invalid move!');
        }

        return !invalidMove;
      };

      var checkResult = function () {
        var overlord = stat.overlord(game.board);
        if (overlord.size * 2 < game.board.size) {
          return;
        }

        if (overlord.color == game.playerColor) {
          win();
        }
        else if (overlord.color == game.opponentColor) {
          lose();
        }
      };

      this.grid.on('click', function (i, j, owner) {
        owner = declared(owner, game.player);
        var ownerColor = game.board.colorAt(owner);
        var targetRegion = game.board.regions[i][j];
        var targetColor = game.board.colors[i][j];

        if (owner == game.player) {
          if (!validateMove(targetRegion)) {
            return;
          }

          server.send(JSON.stringify({
            code: 'move',
            i: i,
            j: j
          }));
        }

        // Select regions adjacent to the owner's region.
        var regions = uniq(game.board.border(owner).filter(function (cell) {
          return game.board.colorAt(cell) == targetColor;
        }).map(game.board.regionAt.bind(game.board)));

        regions.forEach(function (region) {
          region.forEach(function (pos) {
            this.fill(pos.i, pos.j, ownerColor);
          }, this);
        }, this);

        game.board.recomputeRegions();
        checkResult();
      });

      showMyColor(palette[game.playerColor]);

      humane.remove();
      humane.log('Let the carnage begin!', { timeout: 1500 });
    }).

    on('move', function (message) {
      // Opponent clicked some cell.
      this.grid.emit('click', message.i, message.j, this.opponent);
    });
};


/**
 * Start the game client.
 *
 * @arg {string} wshost - Back-end WebSocket server host.
 * @arg {number} wsport - Back-end WebSocket server port.
 */
var start = function (wshost, wsport) {
  var server = new Socket('ws://' + wshost + ':' + wsport);
  var game = Game(server);

  server.on('message', function (message) {
    game.emit(message.code, message);
  });
};

start(wsconfig.host, wsconfig.port);
