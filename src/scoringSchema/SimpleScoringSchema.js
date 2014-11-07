"use strict";

var ScoringSchema = require('./ScoringSchema.js');
var defined = require('../util/defined.js');
var defaultVal = require('../util/defaultVal.js');

/**
 * Defines a Standard Scoring Schema. Takes an options Object which can define
 * values for the various scores returned.
 *
 * The options can have the follow properties (with all default values shown):
 * 		var options = {
 * 			matchScore : 1,
 * 			mismatchScore : -1,
 * 			gapOpenCost : 0,
 * 			gapContCost : 0
 * 		}; // options can be null.
 */
var SimpleScoringSchema = function(options) {
	if (!defined(options)) {
		options = {};
	}
	this.gapOpenCost = defaultVal(options.gapOpenCost, 0);
	this.gapContCost = defaultVal(options.gapContCost, -1);
	this.matchScore = defaultVal(options.matchScore, 1);
	this.mismatchScore = defaultVal(options.mismatchScore, -1);

	this.initialScore = 0;
	this.worstScore = -Infinity;
}

SimpleScoringSchema.prototype.getScore = function(v, w) {
	return (v === w) ? this.matchScore : this.mismatchScore;
}

SimpleScoringSchema.prototype.getGapOpenCost = function() {
	return this.gapOpenCost;
}

SimpleScoringSchema.prototype.getGapContinueCost = function() {
	return this.gapContCost;
}

SimpleScoringSchema.prototype.getInitialScore = function() {
	return this.initialScore;
}

SimpleScoringSchema.prototype.getWorstScore = function() {
	return this.worstScore;
}

// The higher the score the better
SimpleScoringSchema.prototype.compare = function(x, y) {
	if (x < y) {
		return -1;
	} else if (x > y) {
		return 1;
	}
	return 0;
}

module.exports = SimpleScoringSchema;