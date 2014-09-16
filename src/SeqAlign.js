

var defined = function(elem) {
	return elem !== undefined;
}


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

	var 


};






/**
 * Scoring Schema Interface
 */
var ScoringSchema = function() {
	throw new Error('ScoringSchema defines an interface and should not be instantiated.')
}

ScoringSchema.prototype.getScore = function(v, w) {
  throw new Error('ScoringSchema.getScore needs to be implemented.')
};


var HammingDistanceScoringSchema = function() {
	
}

HammingDistanceScoringSchema.prototype.getScore = function(v, w) {
	return (v === w) ? 0 : 1;
}