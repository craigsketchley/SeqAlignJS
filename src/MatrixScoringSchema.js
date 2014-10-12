/**
 * Defines a Matrix Scoring Schema.
 */
var MatrixScoringSchema = function() { }

MatrixScoringSchema.prototype.getScore = function(v, w) {
	return (v === w) ? 0 : 1;
}

module.exports = MatrixScoringSchema;