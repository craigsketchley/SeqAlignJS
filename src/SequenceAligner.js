var TableNode = require('./TableNode.js');


var GAP = '-';


/**
 * Creates a sequence aligner given a scoring schema.
 *
 * options - the following indicate all the default values:
 *
 *  var options = {
 *      scoringSchema : new SimpleScoringSchema,
 *      mismatches    : true,
 *      indels        : true,
 *      offset    : true,
 *      debug         : false
 *  }
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

    // Default values assigned if not supplied
    this.MISMATCH  = defaultVal(options.mismatch,   true);
    this.INDELS    = defaultVal(options.indels,     true);
    this.SPAN      = defaultVal(options.span,      false);
    this.FREERIDES = defaultVal(options.freerides, false);
    this.DEBUG     = defaultVal(options.debug,     false);
};

/**
 * Aligns the 2 given sequences and returns the result.
 *
 *  Table dimensions:
 *  
 *     (0,0)  i ->
 *         +-+-+-+-+-+
 *         | | | | | |
 *         +-+-+-+-+-+
 *       j | | | | | |
 *         +-+-+-+-+-+
 *       | | | | | | |
 *       v +-+-+-+-+-+
 *         | | | | | |
 *         +-+-+-+-+-+
 * 
 * @param  {String} seq1
 * @param  {String} seq2
 * @return {String}
 */
SequenceAligner.prototype.align = function(seq1, seq2) {
    if (!defined(seq1) || typeof seq1 !== "string" || seq1.length === 0) {
        throw new Error('Sequence 1 must be a defined String');
    }

    if (!defined(seq2) || typeof seq2 !== "string" || seq2.length === 0) {
        throw new Error('Sequence 2 must be a defined String');
    }

    var i, j;

    var seq1len = seq1.length;
    var seq2len = seq2.length;

    var matchScore, insertScore, deleteScore, freerideScore, finalScore; // TODO: use!

    var table = new Array(seq1len + 1);


    freerideScore = this.scoringSchema.getInitialScore();

    // Run the DP algorithm. Create and complete the table...
    for (i = 0; i < seq1len + 1; i++) {
        table[i] = new Array(seq2len + 1);
        for (j = 0; j < seq2len + 1; j++) {
            if (i === 0 && j == 0) {
                // in the top left corner, starting score
                table[i][j] = new TableNode(i, j, this.scoringSchema.getInitialScore());
            } else if (i === 0) {
                // along left side edge, can only have been an insertion
                insertScore = this.scoringSchema.getScore(GAP, seq2[j-1]);

                if (this.SPAN) {
                    // If forcing spanning, first chars must be matched.
                    insertScore = this.scoringSchema.getWorstScore();
                }

                if (this.FREERIDES) {
                    // If we have free rides...
                    insertScore  = freerideScore > insertScore ?
                        freerideScore :
                        insertScore;
                }

                table[i][j] = new TableNode(i, j, table[i][j-1].val + insertScore);
                table[i][j].tracebackI = i;
                table[i][j].tracebackJ = j-1;
            } else if (j === 0) {
                // along left side edge, can only have been an insertion
                deleteScore = this.scoringSchema.getScore(seq1[i-1], GAP);

                if (this.SPAN) {
                    // If forcing spanning, first chars must be matched.
                    deleteScore = this.scoringSchema.getWorstScore();
                }

                if (this.FREERIDES) {
                    // If we have free rides...
                    deleteScore  = freerideScore > deleteScore ?
                        freerideScore :
                        deleteScore;
                }

                // along top edge, can only have been a deletion
                table[i][j] = new TableNode(i, j, table[i-1][j].val + deleteScore);
                table[i][j].tracebackI = i-1;
                table[i][j].tracebackJ = j;
            } else {
                // in the body of the table
                matchScore = this.scoringSchema.getWorstScore();
                
                insertScore = table[i][j-1].val +
                            this.scoringSchema.getScore(GAP, seq2[j-1]);                
                
                deleteScore = table[i-1][j].val +
                            this.scoringSchema.getScore(seq1[i-1], GAP);
                
                // Calculate the mismatch score...
                if ((!this.MISMATCH && seq1[i-1] === seq2[j-1]) ||
                    (this.MISMATCH)) {
                    // If no mismatches allowed and the characters match...
                    // OR, mismatches are allowed...
                    matchScore = table[i-1][j-1].val +
                            this.scoringSchema.getScore(seq1[i-1], seq2[j-1]);
                }

                // Calculate the indel scores...
                if (!this.INDELS && (i !== seq1len || j !== seq2len)) {
                    insertScore = this.scoringSchema.getWorstScore();
                    deleteScore = this.scoringSchema.getWorstScore();
                }

                // Adjust scores if not allowing offsets...
                if (this.SPAN &&
                    ((i === seq1len && j !== seq2len) ||
                     (i !== seq1len && j === seq2len))) {
                    matchScore = this.scoringSchema.getWorstScore();
                    insertScore = this.scoringSchema.getWorstScore();
                    deleteScore = this.scoringSchema.getWorstScore();
                }

                if (this.DEBUG) {
                    console.log("(" + i + ", " + j + ")");
                    console.log("matchScore: " + matchScore);
                    console.log("insertScore: " + insertScore);
                    console.log("deleteScore: " + deleteScore);
                }

                // If the any scores are equal, they will take this order of
                // precedence:
                //      1. Diagonal - match
                //      2. up       - insertion
                //      3. Left     - deletion
                
                // TODO: Clean up....
                table[i][j] = new TableNode(i, j, 0);
                if (this.FREERIDES) {
                    if (this.scoringSchema.compare(deleteScore, matchScore) > 0 && 
                        this.scoringSchema.compare(deleteScore, insertScore) > 0 &&
                        this.scoringSchema.compare(deleteScore, freerideScore) > 0) {
                        // Left is best
                        table[i][j].val = deleteScore;
                        table[i][j].tracebackI = i-1;
                        table[i][j].tracebackJ = j;
                    } else if (this.scoringSchema.compare(insertScore, matchScore) > 0 &&
                               this.scoringSchema.compare(insertScore, freerideScore) > 0) {
                        // Up is best
                        table[i][j].val = insertScore;
                        table[i][j].tracebackI = i;
                        table[i][j].tracebackJ = j-1;
                    } else if (this.scoringSchema.compare(matchScore, freerideScore) > 0) {
                        // Diagonal is best
                        table[i][j].val = matchScore;
                        table[i][j].tracebackI = i-1;
                        table[i][j].tracebackJ = j-1;
                    } else {
                        table[i][j].val = freerideScore;
                    }
                } else {
                    if (this.scoringSchema.compare(deleteScore, matchScore) > 0 && 
                        this.scoringSchema.compare(deleteScore, insertScore) > 0) {
                        // Left is best
                        table[i][j].val = deleteScore;
                        table[i][j].tracebackI = i-1;
                        table[i][j].tracebackJ = j;
                    } else if (this.scoringSchema.compare(insertScore, matchScore) > 0) {
                        // Up is best
                        table[i][j].val = insertScore;
                        table[i][j].tracebackI = i;
                        table[i][j].tracebackJ = j-1;
                    } else {
                        // Diagonal is best
                        table[i][j].val = matchScore;
                        table[i][j].tracebackI = i-1;
                        table[i][j].tracebackJ = j-1;
                    }
                }
            }

        }
    }

    // Backtrack to get the sequence...
    var output = {};

    var outputSequences = this.FREERIDES ? backtrackLocal(table, seq1, seq2) : backtrackGlobal(table, seq1, seq2);

    if (this.DEBUG) {
        console.log(tableStringifier(table, seq1, seq2));
        console.log("Final Score = " + outputSequences.score);
        console.log(outputSequences.seq1);
        console.log(outputSequences.seq2);
    }

    return outputSequences;
};



/******************************************************************************
 * HELPER FUNCTIONS
 *****************************************************************************/

/**
 * Given a complete DP table, outputs the sequences created for the alignment.
 * 
 * @param  {Array}  table  the DP table
 * @param  {String} seq1   the original input sequence 1
 * @param  {String} seq2   the original input sequence 2
 * @return {Object}        contains both output Strings containing appropriate indels
 */
function backtrackGlobal(table, seq1, seq2) {
    var outputSeq1 = [];
    var outputSeq2 = [];

    var i = table.length - 1;
    var j = table[0].length - 1;

    var count = 0;

    while (i !== 0 || j !== 0) {
        if (table[i][j].tracebackI === i-1 && table[i][j].tracebackJ === j-1) {
            // Diagonal
            outputSeq1[count] = seq1[i-1];
            outputSeq2[count] = seq2[j-1];
        } else if (table[i][j].tracebackI === i-1 && table[i][j].tracebackJ === j) {
            // Up
            outputSeq1[count] = seq1[i-1];
            outputSeq2[count] = GAP;
        } else if (table[i][j].tracebackI === i && table[i][j].tracebackJ === j-1) {
            // Left
            outputSeq1[count] = GAP;
            outputSeq2[count] = seq2[j-1];
        } else {
            throw new Error('Something went wrong in the scoring table.');
        }
        count++;
        var tmpI = table[i][j].tracebackI;
        j = table[i][j].tracebackJ;
        i = tmpI;
    }

    var output = {};
    output.seq1 = outputSeq1.reverse().join('');
    output.seq2 = outputSeq2.reverse().join('');
    output.score = table[table.length - 1][table[0].length - 1].val;

    return output;
}

/**
 * Given a complete DP table, outputs the sequences created for the alignment.
 * 
 * @param  {Array}  table  the DP table
 * @param  {String} seq1   the original input sequence 1
 * @param  {String} seq2   the original input sequence 2
 * @return {Object}        contains both output Strings containing appropriate indels
 */
function backtrackLocal(table, seq1, seq2) {
    var i, j;

    var outputI = table.length - 1;
    var outputJ = table[0].length - 1;
    var max = table[outputI][outputJ].val;    

    // Go through entire table looking for the best score...
    // TODO: should probably use the scoring schema here
    for (i = 0; i < table.length - 1; i++) {
        for (var j = 0; j < table[i].length; j++) {
            if (max < table[i][j].val) {
                max = table[i][j].val;
                outputI = i;
                outputJ = j;
            }
        }
    }

    var outputSeq1 = [];
    var outputSeq2 = [];

    i = outputI;
    j = outputJ;

    var count = 0;

    done = false;

    while (i !== 0 && j !== 0) {
        if (table[i][j].tracebackI === i-1 && table[i][j].tracebackJ === j-1) {
            // Diagonal
            outputSeq1[count] = seq1[i-1];
            outputSeq2[count] = seq2[j-1];
        } else if (table[i][j].tracebackI === i-1 && table[i][j].tracebackJ === j) {
            // Up
            outputSeq1[count] = seq1[i-1];
            outputSeq2[count] = GAP;
        } else if (table[i][j].tracebackI === i && table[i][j].tracebackJ === j-1) {
            // Left
            outputSeq1[count] = GAP;
            outputSeq2[count] = seq2[j-1];
        } else {
            throw new Error('Something went wrong in the scoring table.');
        }
        count++;
        var tmpI = table[i][j].tracebackI;
        j = table[i][j].tracebackJ;
        i = tmpI;
    }

    var output = {};
    output.seq1 = outputSeq1.reverse().join('');
    output.seq2 = outputSeq2.reverse().join('');
    output.score = max;

    return output;
}

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
var defaultVal = function(param, fallback) {
    return defined(param) ? param : fallback;
};

/**
 * Helper function used for printing the contents of the DP table.
 */
function tableStringifier(table, seq1, seq2) {
    var output = ("\t0\t" + seq1.split('').join('\t') + "\n\n0\t");

    for (var j = 0; j < table[0].length; j++) {
        for (var i = 0; i < table.length; i++) {
            output += table[i][j].toString() + "\t";
        }
        output += '\n\n';
        if (j < table[0].length - 1) {
            output += seq2[j] + '\t';
        }
    }

    return output;
}


module.exports = SequenceAligner;
