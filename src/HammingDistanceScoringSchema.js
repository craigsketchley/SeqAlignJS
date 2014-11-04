/**
 * Defines a Hamming Distance Scoring Schema.
 */
var HammingDistanceScoringSchema = function() { };

// Scores 1 if they do not match
HammingDistanceScoringSchema.prototype.getScore = function(v, w) {
	return (v === w) ? 0 : 1;
};

// Minimises the scores.
HammingDistanceScoringSchema.prototype.compare = function(v, w) {
	if (v < w) {
		return -1;
	} else if (v > w) {
		return 1;
	}
	return 0;
}

module.exports = HammingDistanceScoringSchema;