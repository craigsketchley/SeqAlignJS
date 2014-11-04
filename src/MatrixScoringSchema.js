var ScoringSchema = require('./ScoringSchema.js');

/**
 * Defines a Matrix Scoring Schema.
 */
var MatrixScoringSchema = ScoringSchema;

var matrix = {
	'A' : {
		'A' : 5,
		'C' : -1,
		'G' : -2,
		'T' : -1,
		'-' : -3
	},
	'C' : {
		'A' : -1,
		'C' : 5,
		'G' : -3,
		'T' : -2,
		'-' : -4
	},
	'G' : {
		'A' : -2,
		'C' : -3,
		'G' : 5,
		'T' : -2,
		'-' : -2
	},
	'T' : {
		'A' : -1,
		'C' : -2,
		'G' : -2,
		'T' : 5,
		'-' : -1
	},
	'-' : {
		'A' : -3,
		'C' : -4,
		'G' : -2,
		'T' : -1,
		'-' : -Infinity
	}
}

// TODO: Check if exists in the scoring schema?
MatrixScoringSchema.prototype.getScore = function(v, w) {
	return matrix[v.toUpperCase()][w.toUpperCase()];
}

MatrixScoringSchema.prototype.getInitialScore = function() {
	return 0;
}

MatrixScoringSchema.prototype.getWorstScore = function() {
	return -Infinity;
}

// The higher the score the better
MatrixScoringSchema.prototype.compare = function(x, y) {
	if (x < y) {
		return -1;
	} else if (x > y) {
		return 1;
	}
	return 0;
}

module.exports = MatrixScoringSchema;