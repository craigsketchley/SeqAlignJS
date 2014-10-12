var colors = require('colors'); // Console colours.

/**
 * Helper function: defined
 * 
 * @param  elem
 * @return {Boolean}
 */
var defined = function(elem) {
	return elem !== undefined;
};

/**
 * Returns the parameter if defined, else uses the fallback.
 * 
 * @param  {[type]} param    [description]
 * @param  {[type]} fallback [description]
 * @return {[type]}          [description]
 */
var defaultval = function(param, fallback) {
	return defined(param) ? param : fallback;
};

/**
 * MatrixNode for the dynamic programming grid.
 */
var MatrixNode = function(i, j) {
	this.val = 0;
	this.i = i;
	this.j = j;
	this.tracebackI = Infinity;
	this.tracebackJ = Infinity;
};

/**
 * Returns the current state of the MatrixNode as a string.
 * 
 * @return {String} The string representation of this MatrixNode.
 */
MatrixNode.prototype.toString = function() {
	var traceback = "$".magenta;
	if (this.tracebackI < this.i && this.tracebackJ < this.j) {
		traceback = "\\".red;
	} else if (this.tracebackI < this.i) {
		traceback = "-".blue;
	} else if (this.tracebackJ < this.j) {
		traceback = "|".green;
	}
	return "(" + this.val + ", " + traceback + ")";
};

/**
 * Creates a sequence aligner given a scoring schema.
 * 
 * @param {ScoringSchema} scoringSchema
 */
var SequenceAligner = function(options) {
	if (!defined(options)) {
		throw new Error('Options must be defined');
	}

	if (!defined(options.scoringSchema)) {
		throw new Error('There must be a scoring schema');
	}

	this.scoringSchema = options.scoringSchema;

	this.MISMATCHES = defaultval(options.mismatches, true);
	this.INDELS = defaultval(options.indels, true);
	this.DEBUG = defaultval(options.debug, false);
};


function matrixStringifier(matrix, seq1, seq2) {
	var output = ("\t0\t" + seq1.split('').join('\t') + "\n\n0\t").cyan;

	for (var j = 0; j < matrix[0].length; j++) {
		for (var i = 0; i < matrix.length; i++) {
			output += matrix[i][j].toString() + "\t";
		};
		output += '\n\n';
		if (j < matrix[0].length - 1) {
			output += (seq2[j] + "").cyan + '\t';
		}
	};

	return output;
}


/**
 * Aligns the 2 given sequences and returns the result.
 * 
 * @param  {String} seq1
 * @param  {String} seq2
 * @return {String}
 */
SequenceAligner.prototype.align = function(seq1, seq2) {
	if (!defined(seq1) || seq1.length === 0) {
		throw new Error('Sequence 1 must be defined');
	}

	if (!defined(seq2) || seq2.length === 0) {
		throw new Error('Sequence 2 must be defined');
	}

	var seq1len = seq1.length;
	var seq2len = seq2.length;

	var s = new Array(seq1len + 1);

	// Initialise the sequence grid and set the 1st row and column to zero.
	for (var i = seq1len; i >= 0; i--) {
		s[i] = new Array(seq2len + 1);
		for (var j = seq2len; j >= 0; j--) {
			s[i][j] = new MatrixNode(i, j);
			if (i === 0 && j !== 0) {
				s[0][j].tracebackJ = j-1;
			}
		}
		if (i !== 0) {
			s[i][0].tracebackI = i-1;
		}
	}


	// Run the DP algorithm.

	for (var i = 1; i <= seq1len; i++) {
		for (var j = 1; j <= seq2len; j++) {
			var diag = (seq1[i-1] === seq2[j-1]) ? s[i-1][j-1].val + 1 : -Infinity;
			var up = s[i][j-1].val;
			var left = s[i-1][j].val;

			// If the any scores are equal, they will take this order of precedence:
			// 		1. Diagonal
			// 		2. Up
			// 		3. Left
			
			if (left > diag && left > up) {
				// Left greatest
				s[i][j].val = left;
				s[i][j].tracebackI = i-1;
				s[i][j].tracebackJ = j;
			} else if (up > diag) {
				// Up greatest
				s[i][j].val = up;
				s[i][j].tracebackI = i;
				s[i][j].tracebackJ = j-1;
			} else {
				// Diagonal is greatest
				s[i][j].val = diag;
				s[i][j].tracebackI = i-1;
				s[i][j].tracebackJ = j-1;
			}

		}
	}

	var output = {};
	var outputSequences = createOutputSequences(s, seq1, seq2);

	output.score = s[seq1len][seq2len].val;
	output.seq1 = outputSequences.seq1;
	output.seq2 = outputSequences.seq2;

	if (this.DEBUG) {
		console.log(matrixStringifier(s, seq1, seq2));
		console.log("Final Score = " + output.score);
		console.log(output.seq1);
		console.log(output.seq2);
	}

	return output;
};

function createOutputSequences(matrix, seq1, seq2) {
	var outputSeq1 = [];
	var outputSeq2 = [];

	var i = matrix.length - 1;
	var j = matrix[0].length - 1;

	var count = 0;

	var space = '-';

	while (i !== 0 && j !== 0) {
		debugger;
		if (matrix[i][j].tracebackI === i-1 && matrix[i][j].tracebackJ === j-1) {
			// Diagonal
			outputSeq1[count] = seq1[i-1];
			outputSeq2[count] = seq2[j-1];
		} else if (matrix[i][j].tracebackI === i-1 && matrix[i][j].tracebackJ === j) {
			// Up
			outputSeq1[count] = seq1[i-1];
			outputSeq2[count] = space;
		} else if (matrix[i][j].tracebackI === i && matrix[i][j].tracebackJ === j-1) {
			// Left
			outputSeq1[count] = space;
			outputSeq2[count] = seq2[j-1];
		} else {
			throw new Error('Something went wrong in the scoring matrix.');
		}
		count++;
		var tmpI = matrix[i][j].tracebackI;
		j = matrix[i][j].tracebackJ;
		i = tmpI;
	}

	// Add the remainder of seq2 to the output with gaps.
	while (j > 0) {
		outputSeq1[count] = space;
		outputSeq2[count] = seq2[--j];
		count++;
	}

	while (i > 0) {
		outputSeq1[count] = seq1[--i];
		outputSeq2[count] = space;
		count++;
	}

	var output = {};
	output.seq1 = outputSeq1.reverse().join('');
	output.seq2 = outputSeq2.reverse().join('');

	return output;
}

module.exports = SequenceAligner;
