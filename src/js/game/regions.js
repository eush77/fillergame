'use strict';

var DisjointSetForest = require('algorithms/data_structure/disjoint_set_forest');


/**
 * Compute cell regions (a.k.a. connected components) for 2D-array.
 * Uses 4-connectivity.
 *
 * @arg {*[][]} cells
 * @return {[{i: number, j: number}][][]} 2D-array of arrays of cell coordinates.
 */
module.exports = function (cells) {
  return secondPass(firstPass(cells));
};


/**
 * Assign "region codes" to matrix cells.
 *
 * However, different codes may still correspond to the same
 * region, hence the equivalence forest is also returned.
 *
 * @arg {*[][]} cells
 * @return {regionCodes: number[][], codeEquivalence: DisjointSetForest}
 */
var firstPass = function (cells) {
  var regionCodes = [];
  var nextCode = 0;
  var equivalence = new DisjointSetForest;

  cells.forEach(function (row, i) {
    regionCodes[i] = [];

    row.forEach(function (cell, j) {
      if (i && cells[i - 1][j] === cell) {
        var region = regionCodes[i - 1][j];

        if (cells[i][j - 1] === cell) {
          equivalence.merge(region, regionCodes[i][j - 1]);
        }
      }
      else if (cells[i][j - 1] === cell) {
        var region = regionCodes[i][j - 1];
      }
      else {
        var region = nextCode++;
      }

      regionCodes[i][j] = region;
    });
  });

  return {
    regionCodes: regionCodes,
    codeEquivalence: equivalence
  };
};


/**
 * For each cell, compute the list of cells in the same region.
 *
 * @arg {object} options
 * @property {number[][]} regionCodes
 * @property {DisjointSetForest} codeEquivalence
 * @return {[{i: number, j: number}][][]} 2D-array of arrays of cell coordinates.
 */
var secondPass = function (options) {
  var regions = options.regionCodes;
  var codeEquivalence = options.codeEquivalence;

  // canonical region code -> list of coords
  var regionIndex = {};

  regions.forEach(function (row, i) {
    row.forEach(function (cell, j) {
      // Get the canonical region code.
      cell = codeEquivalence.root(cell);

      if (regionIndex[cell] == null) {
        // Add new region.
        regionIndex[cell] = [];
      }

      var region = regionIndex[cell];

      // Add cell to the region it belongs to.
      region.push({ i: i, j: j });

      row[j] = region;
    });
  });

  return regions;
};
