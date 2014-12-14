'use strict';

var computeRegions = require('_game/regions');

var test = require('tape')
  , thus = require('thus')
  , cmpby = require('cmpby');


var sortRegion = function (region) {
  return region.sort(cmpby(JSON.stringify));
};

var sortRegions = function (regionMatrix) {
  regionMatrix.forEach(function (row) {
    row.forEach(sortRegion);
  });

  return regionMatrix;
};


test('regions', function (t) {
  var regions;

  // Test 1.

  regions = sortRegions(computeRegions([[0, 1, 0],
                                            [0, 0, 0]]));

  thus(sortRegion([{ i: 0, j: 0 }, { i: 0, j: 2 }, { i: 1, j: 0 },
                   { i: 1, j: 1 }, { i: 1, j: 2 }]),
       function () {
         t.deepEqual(regions, [[this, [{ i: 0, j: 1 }], this],
                               [this, this, this]]);
       });

  // Test 2.

  regions = sortRegions(computeRegions([[0, 1],
                                        [1, 1],
                                        [1, 0]]));

  thus(sortRegion([{ i: 0, j: 1 }, { i: 1, j: 0 },
                   { i: 1, j: 1 }, { i: 2, j: 0 }]),
       function () {
         t.deepEqual(regions, [[[{ i: 0, j: 0 }], this],
                               [this, this],
                               [this, [{ i: 2, j: 1 }]]]);
       });

  t.end();
});
