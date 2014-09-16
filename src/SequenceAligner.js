


/**
 * Creates a sequence aligner given a scoring schema.
 * 
 * @param {ScoringSchema} scoringSchema
 */
var SequenceAligner = function(scoringSchema) {
	if (defined(scoringSchema) || seq1.length === 0) {
		throw new Error('Sequence 1 must be defined');
	}

	this.scoringSchema = scoreSchema;
}

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


};


/**
 * Helper function: defined
 * 
 * @param  elem
 * @return {Boolean}
 */
var defined = function(elem) {
	return elem !== undefined;
}
