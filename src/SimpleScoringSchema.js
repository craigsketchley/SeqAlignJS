var ScoringSchema = require('./ScoringSchema.js');

/**
 * Defines a Simple Scoring Schema.
 */
var SimpleScoringSchema = Object.create(ScoringSchema);

SimpleScoringSchema.prototype.getScore = function(v, w) {
	return (v === w) ? 1 : 0;
};

SimpleScoringSchema.prototype.compare = function(v, w) {
	if (v > w) {
		return -1;
	} else if (v < w) {
		return 1;
	}
	return 0;
}

module.exports = SimpleScoringSchema;