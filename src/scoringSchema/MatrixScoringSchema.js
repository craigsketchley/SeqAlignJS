"use strict";

var defined = require('../util/defined.js');
var defaultVal = require('../util/defaultVal.js');

var scoringMatrixParser = require('../util/scoringMatrixParser.js');

/**
 * Defines a Matrix Scoring Schema. Takes an options Object which can define
 * values for the various scores returned.
 *
 * The options can have the follow properties (with all default values shown):
 * 		var options = {
 * 			matrix : scoringMatrix, // string, must be defined.
 * 			gapOpenCost : 0,
 * 			gapContCost : 0
 * 		};
 */
var MatrixScoringSchema = function(options) {
	if (!defined(options) || !defined(options.matrix)) {
		throw new Error('The scoring matrix must be defined.');
	}

	this.matrix = scoringMatrixParser(options.matrix);

	this.gapOpenCost = defaultVal(options.gapOpenCost, 0);
	this.gapContCost = defaultVal(options.gapContCost, 0);

	this.initialScore = 0;
	this.worstScore = -Infinity;
}

MatrixScoringSchema.prototype.getScore = function(v, w) {
	if (this.matrix[v.toUpperCase() + w.toUpperCase()] === null) {
		// If the characters don't exist in the matrix...
		// ...assume the worst!
		console.log('the worst');
		return this.getWorstScore();
	}
	return this.matrix[v.toUpperCase() + w.toUpperCase()];
}

MatrixScoringSchema.prototype.getGapOpenCost = function() {
	return this.gapOpenCost;
}

MatrixScoringSchema.prototype.getGapContinueCost = function() {
	return this.gapContCost;
}

MatrixScoringSchema.prototype.getInitialScore = function() {
	return this.initialScore;
}

MatrixScoringSchema.prototype.getWorstScore = function() {
	return this.worstScore;
}

MatrixScoringSchema.prototype.compare = function(x, y) {
	// The higher the score the better
	if (x < y) {
		return -1;
	} else if (x > y) {
		return 1;
	}
	return 0;
}

module.exports = MatrixScoringSchema;