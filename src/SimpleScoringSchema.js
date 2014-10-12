/**
 * Defines a Simple Scoring Schema.
 */
var SimpleScoringSchema = function() { }

SimpleScoringSchema.prototype.getScore = function(v, w) {
	return (v === w) ? 0 : 1;
}

module.exports = SimpleScoringSchema;