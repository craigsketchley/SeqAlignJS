/**
 * Defines a Hamming Distance Scoring Schema.
 */
var HammingDistanceScoringSchema = function() { }

HammingDistanceScoringSchema.prototype.getScore = function(v, w) {
	return (v === w) ? 0 : 1;
}

module.exports = HammingDistanceScoringSchema;