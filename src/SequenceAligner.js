"use strict";

var defined = require('./util/defined.js');
var defaultVal = require('./util/defaultVal.js');
var SimpleScoringSchema = require('./scoringSchema/SimpleScoringSchema.js');

// CONSTANTS

var GAP = '-';

// JavaScript pseudo-Enum.
var AlignmentType = {
    GLOBAL : "GLOBAL",
    LOCAL  : "LOCAL"
};

/**
 * Creates a sequence aligner given a scoring schema.
 *
 * options - the following indicate all the default values:
 *
 *  var options = {
 *      scoringSchema : new SimpleScoringSchema(),
 *      alignmentType : SequenceAligner.AlignmentType.GLOBAL,
 *      debug         : false
 *  }
 * 
 * @param {ScoringSchema} scoringSchema
 */
var SequenceAligner = function(options) {
    // Default values assigned if not supplied
    this.scoringSchema = defaultVal(options.scoringSchema, new SimpleScoringSchema());
    this.alignmentType = defaultVal(options.alignmentType, AlignmentType.GLOBAL);
    this.DEBUG         = defaultVal(options.debug, false);

    // Set the align method based on the alignment type.
    if (AlignmentType[this.alignmentType] === null) {
        throw new Error('A valid alignment type must be defined.');
    }
};

SequenceAligner.AlignmentType = AlignmentType; // Static property

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
        throw new Error('Sequence 1 must be a defined string.');
    }

    if (!defined(seq2) || typeof seq2 !== "string" || seq2.length === 0) {
        throw new Error('Sequence 2 must be a defined string.');
    }

    if (!defined(this.alignmentType) || AlignmentType[this.alignmentType] === null) {
        throw new Error('A valid alignment type must be defined.');
    }

    // Is this local alignment?
    var local = this.alignmentType === AlignmentType.LOCAL;

    var i, j;

    var seq1len = seq1.length;
    var seq2len = seq2.length;

    var matchScore, insertScore, deleteScore, freerideScore, continueGap, startGap; // TODO: use!

    var matchTable = new Array(seq1len + 1);  // Main level
    var matchPointerTable = new Array(seq1len + 1);

    var insertTable = new Array(seq1len + 1); // Upper level
    var insertPointerTable = new Array(seq1len + 1);

    var deleteTable = new Array(seq1len + 1); // Lower level
    var deletePointerTable = new Array(seq1len + 1);

    freerideScore = this.scoringSchema.getInitialScore();

    // Run the DP algorithm. Create and complete the matchTable...
    for (i = 0; i < seq1len + 1; i++) {
        matchTable[i]  = new Array(seq2len + 1);
        matchPointerTable[i]  = new Array(seq2len + 1);
        insertTable[i] = new Array(seq2len + 1);
        insertPointerTable[i] = new Array(seq2len + 1);
        deleteTable[i] = new Array(seq2len + 1);
        deletePointerTable[i] = new Array(seq2len + 1);

        for (j = 0; j < seq2len + 1; j++) {
            if (i === 0 && j == 0) {
                // in the top left corner, starting score
                matchTable[i][j] = this.scoringSchema.getInitialScore();
                matchPointerTable[i][j] = null;

                insertTable[i][j] = this.scoringSchema.getWorstScore();
                insertPointerTable[i][j] = matchTable;

                deleteTable[i][j] = this.scoringSchema.getWorstScore();
                deletePointerTable[i][j] = matchTable;

            } else if (i === 0) {
                // Along the left edge...
                // They could have only come from insertions...
                // Set the insertion table first, then other tables relative to that.
                matchTable[i][j] = this.scoringSchema.getGapOpenCost() + j * this.scoringSchema.getGapContinueCost();
                matchPointerTable[i][j] = insertTable;

                deleteTable[i][j] = this.scoringSchema.getWorstScore();
                deletePointerTable[i][j] = matchTable;

                continueGap = insertTable[i][j-1] + this.scoringSchema.getGapContinueCost();
                startGap = matchTable[i][j-1] + this.scoringSchema.getGapOpenCost() + this.scoringSchema.getGapContinueCost();
                insertTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? continueGap : startGap;
                insertPointerTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? insertTable : matchTable;

            } else if (j === 0) {
                // Along the top edge...
                // They could've only come from a deletion...
                // Set the deletion table first, then other tables relative to that.
                matchTable[i][j] = this.scoringSchema.getGapOpenCost() + i * this.scoringSchema.getGapContinueCost();
                matchPointerTable[i][j] = deleteTable;

                insertTable[i][j] = this.scoringSchema.getWorstScore();
                insertPointerTable[i][j] = matchTable;

                continueGap = deleteTable[i-1][j] + this.scoringSchema.getGapContinueCost();
                startGap    = matchTable[i-1][j] + this.scoringSchema.getGapOpenCost() + this.scoringSchema.getGapContinueCost();
                deleteTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? continueGap : startGap;
                deletePointerTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? deleteTable : matchTable;

            } else {
                // Within the body of the DP table...
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
                insertPointerTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? insertTable : matchTable;

                // Deletion (bottom) level
                // Get the score for continuing the gap...
                continueGap = deleteTable[i-1][j] + this.scoringSchema.getGapContinueCost();
                // Get the score for starting a new gap from the match table...
                startGap    = matchTable[i-1][j] + this.scoringSchema.getGapOpenCost() + this.scoringSchema.getGapContinueCost();
                // Pick the best and assign it in the delete table.
                deleteTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? continueGap : startGap;
                deletePointerTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? deleteTable : matchTable;

                // Match (middle) level
                matchTable[i][j] = matchTable[i-1][j-1] + this.scoringSchema.getScore(seq1[i-1], seq2[j-1]);
                matchPointerTable[i][j] = matchTable;
                if (this.scoringSchema.compare(insertTable[i][j], matchTable[i][j]) > 0) {
                    // insertion score is the best...
                    matchTable[i][j] = insertTable[i][j];
                    matchPointerTable[i][j] = insertTable;
                }
                if (this.scoringSchema.compare(deleteTable[i][j], matchTable[i][j]) > 0) {
                    // deletion score is the best...
                    matchTable[i][j] = deleteTable[i][j];
                    matchPointerTable[i][j] = deleteTable;
                }
            }

            // Extended recurrence relation for local alignment...
            if (local && this.scoringSchema.compare(matchTable[i][j], freerideScore) < 0) {
                // Free ride score the best option...
                matchTable[i][j] = freerideScore;
                matchTable[i][j] = null;
            }
        }
    }

    if (this.DEBUG) {
        console.log("INSERTION TABLE: |");
        console.log(tableStringifier(insertTable, seq1, seq2));
        console.log("MATCH TABLE:");
        console.log(tableStringifier(matchTable, seq1, seq2));
        console.log("DELETION TABLE: --");
        console.log(tableStringifier(deleteTable, seq1, seq2));
    }

    var startI = seq1len;
    var startJ = seq2len;

    var max = matchTable[startI][startJ];

    if (local) {
        for (i = 0; i < matchTable.length; i++) {
            for (j = 0; j < matchTable[i].length; j++) {
                if (this.scoringSchema.compare(max, matchTable[i][j]) < 0) {
                    max = matchTable[i][j];
                    startI = i;
                    startJ = j;
                }
            }
        }
    }

    // Backtrack to get the sequence...
    var outputSequences = backtrack(insertTable, matchTable, deleteTable, seq1, seq2, this.scoringSchema, startI, startJ, local);

    if (this.DEBUG) {
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
function backtrack(insertTable, matchTable, deleteTable, seq1, seq2, scoringSchema, startI, startJ, affineGap) {
    var outputSeq1 = [];
    var outputSeq2 = [];

    var i = startI;
    var j = startJ;

    var count = 0;

    var currentTable = matchTable;

    while (i !== 0 || j !== 0) {
        if (affineGap && matchTable[i][j] === scoringSchema.getInitialScore()) {
            // Reached the end of the highest scoring local alignment
            break;
        }

        // console.log("(" + i + ", " + j + ")");
        // console.log(seq1[i-1]);
        // console.log(seq2[j-1]);
        if (currentTable === matchTable) {
            // In match table...
            // console.log(matchTable[i][j]);
            // console.log(insertTable[i][j]);
            // console.log(deleteTable[i][j]);

            if (matchTable[i][j] === insertTable[i][j]) {
                // Move to insert table
                currentTable = insertTable;
                continue;
            } else if (matchTable[i][j] === deleteTable[i][j]) {
                currentTable = deleteTable;
                continue;
            }
            // output a (mis)match.
            outputSeq1[count] = seq1[i-1];
            outputSeq2[count] = seq2[j-1];
            i--;
            j--;
        } else if (currentTable === insertTable) {
            // In insert table...
            if (insertTable[i][j] !== matchTable[i][j]) {
                // Move to insert table
                currentTable = matchTable;
                continue;
            }
            // output an insert in seq1...
            outputSeq1[count] = GAP;
            outputSeq2[count] = seq2[j-1];
            j--;
            if (j === 0) {
                currentTable = deleteTable;
            }
        } else {
            // In delete table...
            if (deleteTable[i][j] !== matchTable[i][j]) {
                // Move to insert table
                currentTable = matchTable;
                continue;
            }
            // output a deletion in seq1...
            outputSeq1[count] = seq1[i-1];
            outputSeq2[count] = GAP;
            i--;
            if (i === 0) {
                currentTable = insertTable;
            }
        }
        // console.log("(" + i + ", " + j + ")");
        count++;
    }

    var output = {};
    output.seq1 = outputSeq1.reverse().join('');
    output.seq2 = outputSeq2.reverse().join('');
    output.score = matchTable[startI][startJ];

    return output;
}

/**
 * Helper function used for printing the contents of the DP table.
 */
function tableStringifier(table, seq1, seq2) {
    var output = ("\t0\t" + seq1.split('').join('\t') + "\n0\t");

    for (var j = 0; j < table[0].length; j++) {
        for (var i = 0; i < table.length; i++) {
            output += (table[i][j] === -Infinity ? '#' : table[i][j]) + "\t";
        }
        output += '\n';
        if (j < table[0].length - 1) {
            output += seq2[j] + '\t';
        }
    }

    return output;
}


module.exports = SequenceAligner;
