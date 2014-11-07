"use strict";

var defined = require('./defined.js');

/**
 * Given a scoring matrix as a string, this will output a scoring matrix Map,
 * where the match score of two characters can be retrieved by using the
 * concatenation of the two characters as the key for the map.
 * @param  {string} matrix the string version of the matrix
 * @return {Map}           the scoring matrix as a map
 */
var scoringMatrixParser = function(matrixString) {
	if (!defined(matrixString) || typeof matrixString !== "string" || matrixString.length === 0) {
		throw new Error('Matrix must be a defined string.');
	}

	var outputMatrix = {};

	// Split matrix string into lines...
	matrixString = matrixString.split(/\n/);

	var columns = matrixString[0].trim().split(/\s+/);
	var cells;
	for (var i = 1; i < matrixString.length; i++) { // i = 1, ignore col headers
		cells = matrixString[i].trim().split(/\s+/);
		for (var j = 1; j < columns.length + 1; j++) { // j = 1, ignore row headers
			// The key for a score is the concat of the 2 match characters
			outputMatrix[cells[0].toUpperCase() + columns[j-1].toUpperCase()] = parseInt(cells[j]);
		}
	}

	return outputMatrix;
};


module.exports = scoringMatrixParser;