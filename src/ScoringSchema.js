/**
 * Scoring Schema Interface.
 *
 * This is not supposed to be instantiated directly, but used as an interface
 * when designing new scoring schema.
 */
var ScoringSchema = function() {};

/**
 * Given 2 characters in the alphabet, returns the matching score of those 2
 * characters according to the implemented scoring schema.
 * 
 * @param  {String} v the first character
 * @param  {String} w the second character
 * @return {Number}   the matching score
 */
ScoringSchema.prototype.getScore = function(v, w) {
  throw {
  	name : 'Unimplemented Method',
  	message : 'ScoringSchema.getScore needs to be implemented.'
  };
}

/**
 * Returns the initial score for the beginning of the DP Table.
 * @return {Number} the initial score before running the DP algorithm.
 */
ScoringSchema.prototype.getInitialScore = function() {
  throw {
    name : 'Unimplemented Method',
    message : 'ScoringSchema.getInitialScore needs to be implemented.'
  };
}

/**
 * Returns the worst possible score for this scoring schema. It should be used
 * to assign a score to things that shouldn't happen, like insertions if no
 * insertions are allowed.
 * @return {Number} the lowest possible score for this schema
 */
ScoringSchema.prototype.getWorstScore = function() {
  throw {
  	name : 'Unimplemented Method',
  	message : 'ScoringSchema.getWorstScore needs to be implemented.'
  };
}

/**
 * Given 2 scores, returns an indication which is the more favourable according
 * to this scoring schema. Returns -1 if the first score is favourable, +1 if
 * the second score is favourable, and 0 if they are equal.
 *
 * This can be used to modify the condition for the most favourable score when
 * aligning sequences. For example, maximising the matching score or minimising
 * it.
 * 
 * @param  {Number} x the first score
 * @param  {Number} y the second score
 * @return {Number}   number indicating the most favourable score.
 */
ScoringSchema.prototype.compare = function(x, y) {
	throw {
		name : 'Unimplemented Method',
		message : 'ScoringSchema.compare needs to be implemented.'
	};
}

module.exports = ScoringSchema;