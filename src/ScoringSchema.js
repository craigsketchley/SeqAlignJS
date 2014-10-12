/**
 * Scoring Schema Interface
 */
var ScoringSchema = function() {
	throw new Error('ScoringSchema defines an interface and should not be instantiated.')
}

ScoringSchema.prototype.getScore = function(v, w) {
  throw new Error('ScoringSchema.getScore needs to be implemented.')
};


module.exports = ScoringSchema;