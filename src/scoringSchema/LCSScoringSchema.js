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
 * 			matchScore : 5,
 * 			mismatchScore : -4,
 * 			gapOpenCost : 0,
 * 			gapContCost : 0
 * 		}; // options can be null.
 */
var LCSScoringSchema = function() {
	this.gapOpenCost = 0;
	this.gapContCost = 0;
	this.matchScore = 1;
	this.mismatchScore = -Infinity;
	this.initialScore = 0;
	this.worstScore = 0;
};

LCSScoringSchema.prototype.getScore = function(v, w) {
	return (v === w) ? this.matchScore : this.mismatchScore;
};

LCSScoringSchema.prototype.getGapOpenCost = function() {
	return this.gapOpenCost;
};

LCSScoringSchema.prototype.getGapContinueCost = function() {
	return this.gapContCost;
};

LCSScoringSchema.prototype.getInitialScore = function() {
	return this.initialScore;
};

LCSScoringSchema.prototype.getWorstScore = function() {
	return this.worstScore;
};

// The higher the score the better
LCSScoringSchema.prototype.compare = function(x, y) {
	if (x < y) {
		return -1;
	} else if (x > y) {
		return 1;
	}
	return 0;
};

module.exports = LCSScoringSchema;