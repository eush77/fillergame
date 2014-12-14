'use strict';

var makeBoard = require('_game/board');

var test = require('tape')
  , cmpby = require('cmpby');


test('game', function (t) {
  var colors = [[0, 0, 1],
                [0, 1, 0],
                [2, 1, 2],
                [0, 2, 0]];
  var board = makeBoard(colors);

  t.test('size', function (t) {
    t.equal(board.width, 3);
    t.equal(board.height, 4);
    t.end();
  });

  t.test('neighborsOfColor', function (t) {
    var neighbors = board.neighborsOfColor(0, 0, 1);
    t.deepEqual(neighbors.sort(cmpby(JSON.stringify)), [
      { i: 0, j: 2 },
      { i: 1, j: 1 }
    ]);
    t.end();
  });

  t.end();
});
