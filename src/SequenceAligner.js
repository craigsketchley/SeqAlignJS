
var ScoringSchema = require('./ScoringSchema.js');
var HammingDistanceScoringSchema = require('./HammingDistanceScoringSchema.js');


/**
 * Node for the dynamic programming grid.
 */
var Node = function() {
	this.value;
	this.traceBackI; // TODO: Change
	this.traceBackJ; // TODO: Change
};


/**
 * Creates a sequence aligner given a scoring schema.
 * 
 * @param {ScoringSchema} scoringSchema
 */
var SequenceAligner = function(scoringSchema) {
	if (defined(scoringSchema) || seq1.length === 0) {
		throw new Error('Sequence 1 must be defined');
	}

	this.scoringSchema = scoringSchema;
};

/**
 * Aligns the 2 given sequences and returns the result.
 * 
 * @param  {String} seq1
 * @param  {String} seq2
 * @return {String}
 */
SequenceAligner.prototype.align = function(seq1, seq2) {
	if (defined(seq1) || seq1.length === 0) {
		throw new Error('Sequence 1 must be defined');
	}

	if (defined(seq2) || seq2.length === 0) {
		throw new Error('Sequence 2 must be defined');
	}

	var seq1len = seq1.length;
	var seq2len = seq2.length;

	var s = new Array(seq1len);

	// Initialise the sequence grid.
	for (var i = seq1len - 1; i >= 0; i--) {
		s[i] = new Array(seq2len);
		for (var j = seq2len - 1; j >= 0; j--) {
			s[i][j] = new Node();
		}
	}


	s[0][0].value = 0;



};


/**
 * Helper function: defined
 * 
 * @param  elem
 * @return {Boolean}
 */
var defined = function(elem) {
	return elem !== undefined;
};

module.exports = SequenceAligner;