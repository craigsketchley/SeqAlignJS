"use strict";

var defined = require('./util/defined.js');
var defaultVal = require('./util/defaultVal.js');

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
var LocalSequenceAligner = function(options) {
    if (!defined(options)) {
        throw new Error('Options must be defined');
    }

    if (!defined(options.scoringSchema)) {
        throw new Error('There must be a scoring schema');
    }

    this.scoringSchema = options.scoringSchema;

    // Default values assigned if not supplied
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
LocalSequenceAligner.prototype.align = function(seq1, seq2) {
    if (!defined(seq1) || typeof seq1 !== "string" || seq1.length === 0) {
        throw new Error('Sequence 1 must be a defined string');
    }

    if (!defined(seq2) || typeof seq2 !== "string" || seq2.length === 0) {
        throw new Error('Sequence 2 must be a defined string');
    }

    var i, j;

    var seq1len = seq1.length;
    var seq2len = seq2.length;

    var matchScore, insertScore, deleteScore, freerideScore, finalScore, continueGap, startGap; // TODO: use!

    var insertTable = new Array(seq1len + 1); // Upper level
    var matchTable = new Array(seq1len + 1);  // Main level
    var deleteTable = new Array(seq1len + 1); // Lower level

    freerideScore = this.scoringSchema.getInitialScore();

    // Run the DP algorithm. Create and complete the matchTable...
    for (i = 0; i < seq1len + 1; i++) {
        matchTable[i]  = new Array(seq2len + 1);
        insertTable[i] = new Array(seq2len + 1);
        deleteTable[i] = new Array(seq2len + 1);

        for (j = 0; j < seq2len + 1; j++) {
            if (i === 0 && j == 0) {
                // in the top left corner, starting score
                matchTable[i][j] = this.scoringSchema.getInitialScore();
                insertTable[i][j] = this.scoringSchema.getInitialScore();
                deleteTable[i][j] = this.scoringSchema.getInitialScore();

            } else if (i === 0) {
                // Along the left edge...
                // They could have only come from insertions...
                // Set the insertion table first, then other tables relative to that.
                insertTable[i][j] = insertTable[i][j-1] + this.scoringSchema.getGapContinueCost();
                deleteTable[i][j] = insertTable[i][j] + this.scoringSchema.getGapOpenCost();
                matchTable[i][j] = insertTable[i][j];

            } else if (j === 0) {
                // Along the top edge...
                // They could've only come from a deletion...
                // Set the deletion table first, then other tables relative to that.
                deleteTable[i][j] = deleteTable[i-1][j] + this.scoringSchema.getGapContinueCost();
                insertTable[i][j] = deleteTable[i][j] + this.scoringSchema.getGapOpenCost();
                matchTable[i][j] = deleteTable[i][j];

            } else {
                // At i, j: I either came from:
                // - a match      == (i-1, j-1)
                // - an insertion == (i  , j-1)
                // - an deletion  == (i-1, j  )

                // Insertion (top) level
                // Get the score for continuing the gap...
                continueGap = insertTable[i][j-1] + this.scoringSchema.getGapContinueCost();
                // Get the score for starting a new gap from the match table...
                startGap    = matchTable[i][j-1] + this.scoringSchema.getGapOpenCost() + this.scoringSchema.getGapContinueCost();
                // Pick the best and assign it in the insert table.
                insertTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? continueGap : startGap;

                // Deletion (bottom) level
                // Get the score for continuing the gap...
                continueGap = deleteTable[i-1][j] + this.scoringSchema.getGapContinueCost();
                // Get the score for starting a new gap from the match table...
                startGap    = matchTable[i-1][j] + this.scoringSchema.getGapOpenCost() + this.scoringSchema.getGapContinueCost();
                // Pick the best and assign it in the delete table.
                deleteTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? continueGap : startGap;

                // Match (middle) level
                matchScore = matchTable[i-1][j-1] + this.scoringSchema.getScore(seq1[i-1], seq2[j-1]);
                if (this.scoringSchema.compare(matchScore, insertTable[i][j]) > 0 &&
                    this.scoringSchema.compare(matchScore, deleteTable[i][j]) > 0 &&
                    this.scoringSchema.compare(matchScore, freerideScore) > 0) {
                    // Match score is the best...
                    matchTable[i][j] = matchScore;
                } else if (this.scoringSchema.compare(insertTable[i][j], deleteTable[i][j]) > 0 &&
                           this.scoringSchema.compare(insertTable[i][j], freerideScore) > 0) {
                    // insertion score is the best...
                    matchTable[i][j] = insertTable[i][j];
                } else if (this.scoringSchema.compare(deleteTable[i][j], freerideScore) > 0) {
                    // deletion score is the best...
                    matchTable[i][j] = deleteTable[i][j];
                } else {
                    // Free ride score the best option...
                    matchTable[i][j] = freerideScore;
                }
            }

        }
    }

    // Backtrack to get the sequence...
    // var outputSequences = this.FREERIDES ? backtrackLocal(matchTable, seq1, seq2) : backtrackGlobal(matchTable, seq1, seq2);
    var outputSequences = backtrack(insertTable, matchTable, deleteTable, seq1, seq2);

    if (this.DEBUG) {
        console.log("INSERTION TABLE:");
        console.log(tableStringifier(insertTable, seq1, seq2));
        console.log("MATCH TABLE:");
        console.log(tableStringifier(matchTable, seq1, seq2));
        console.log("DELETION TABLE:");
        console.log(tableStringifier(deleteTable, seq1, seq2));
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
function backtrack(insertTable, matchTable, deleteTable, seq1, seq2) {
    var outputI = matchTable.length - 1;
    var outputJ = matchTable[0].length - 1;
    var max = matchTable[outputI][outputJ];    

    // Go through entire table looking for the best score...
    // TODO: should probably use the scoring schema here
    for (var i = 0; i < matchTable.length - 1; i++) {
        for (var j = 0; j < matchTable[i].length; j++) {
            if (max < matchTable[i][j]) {
                max = matchTable[i][j];
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

    var currentTable = matchTable; // match table. 0 = insert table, 2 = delete table.

    while (i !== 0 || j !== 0) {
        if (currentTable === 1) {
            // In match table...
            if (matchTable[i][j] === 0) {
                // TODO: is zero alright here?
                break;
            }

            if (matchTable[i][j] === insertTable[i][j]) {
                // Move to insert table
                currentTable = 0;
                continue;
            } else if (matchTable[i][j] === deleteTable[i][j]) {
                currentTable = 2;
                continue;
            }
            // output a (mis)match.
            outputSeq1[count] = seq1[i-1];
            outputSeq2[count] = seq2[j-1];
            i--;
            j--;
        } else if (currentTable === 0) {
            // In insert table...
            if (insertTable[i][j] !== matchTable[i][j]) {
                // Move to insert table
                currentTable = 1;
                continue;
            }
            // output an insert in seq1...
            outputSeq1[count] = GAP;
            outputSeq2[count] = seq2[j-1];
            j--;
        } else {
            // In delete table...
            if (deleteTable[i][j] !== matchTable[i][j]) {
                // Move to insert table
                currentTable = 1;
                continue;
            }
            // output a deletion in seq1...
            outputSeq1[count] = seq1[i-1];
            outputSeq2[count] = GAP;
            i--;
        }
        count++;
    }

    var output = {};
    output.seq1 = outputSeq1.reverse().join('');
    output.seq2 = outputSeq2.reverse().join('');
    output.score = max;

    return output;
}

/**
 * Helper function used for printing the contents of the DP table.
 */
function tableStringifier(table, seq1, seq2) {
    var output = ("\t0\t" + seq1.split('').join('\t') + "\n\n0\t");

    for (var j = 0; j < table[0].length; j++) {
        for (var i = 0; i < table.length; i++) {
            output += (table[i][j] === -Infinity ? '#' : table[i][j]) + "\t";
        }
        output += '\n\n';
        if (j < table[0].length - 1) {
            output += seq2[j] + '\t';
        }
    }

    return output;
}


module.exports = LocalSequenceAligner;
