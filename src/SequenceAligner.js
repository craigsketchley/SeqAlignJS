"use strict";

var defined = require("./util/defined.js");
var defaultVal = require("./util/defaultVal.js");
var SimpleScoringSchema = require("./scoringSchema/SimpleScoringSchema.js");

// CONSTANTS

var GAP = "-";

// JavaScript pseudo-Enum.
var AlignmentType = {
    GLOBAL : "GLOBAL",
    LOCAL  : "LOCAL"
};

/**
 * Creates a sequence aligner given a scoring schema.
 *
 * options - the following values indicate all the defaults:
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
        throw new Error("A valid alignment type must be defined.");
    }
};

SequenceAligner.AlignmentType = AlignmentType; // Static property

/**
 * Aligns the 2 given sequences and returns the result.
 *
 * It can complete global and local pairwise sequence alignment with affine
 * gap cost.
 *
 * Here is the assumed dynamic programming table orientation with sequence 1
 * aligned along the top edge:
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
 * @param  {String} seq1    the first sequence in the pairwise alignment
 * @param  {String} seq2    the second sequence in the pairwise alignment
 * @return {String}
 */
SequenceAligner.prototype.align = function(seq1, seq2) {
    if (!defined(seq1) || typeof seq1 !== "string" || seq1.length === 0) {
        throw new Error("Sequence 1 must be a defined string.");
    }

    if (!defined(seq2) || typeof seq2 !== "string" || seq2.length === 0) {
        throw new Error("Sequence 2 must be a defined string.");
    }

    if (!defined(this.alignmentType) || AlignmentType[this.alignmentType] === null) {
        throw new Error("A valid alignment type must be defined.");
    }

    // Is this local alignment?
    var local = this.alignmentType === AlignmentType.LOCAL;

    var i, j; // indices

    var seq1len = seq1.length;
    var seq2len = seq2.length;

    var matchScore, insertScore, deleteScore, freerideScore, continueGap, startGap; // TODO: use!

    // Main level
    var matchTable = new Array(seq1len + 1);
    var matchPtrTable = new Array(seq1len + 1);

    // Upper level
    var insertTable = new Array(seq1len + 1);
    var insertPtrTable = new Array(seq1len + 1);

    // Lower level
    var deleteTable = new Array(seq1len + 1);
    var deletePtrTable = new Array(seq1len + 1);

    // Used for local alignment extended recurrence relation.
    freerideScore = this.scoringSchema.getInitialScore();

    // Run the DP algorithm. Create and complete the matchTable...
    for (i = 0; i < seq1len + 1; i++) {
        matchTable[i]     = new Array(seq2len + 1);
        matchPtrTable[i]  = new Array(seq2len + 1);
        insertTable[i]    = new Array(seq2len + 1);
        insertPtrTable[i] = new Array(seq2len + 1);
        deleteTable[i]    = new Array(seq2len + 1);
        deletePtrTable[i] = new Array(seq2len + 1);

        for (j = 0; j < seq2len + 1; j++) {
            if (i === 0 && j === 0) {
                // in the top left corner, initial values...
                matchTable[i][j] = this.scoringSchema.getInitialScore();
                matchPtrTable[i][j] = null;

                insertTable[i][j] = this.scoringSchema.getWorstScore();
                insertPtrTable[i][j] = null;

                deleteTable[i][j] = this.scoringSchema.getWorstScore();
                deletePtrTable[i][j] = null;

            } else if (i === 0) {
                // Along the left edge...
                // They could have only come from insertions...
                matchTable[i][j] = this.scoringSchema.getGapOpenCost() + j * this.scoringSchema.getGapContinueCost();
                matchPtrTable[i][j] = insertPtrTable;

                deleteTable[i][j] = this.scoringSchema.getWorstScore();
                deletePtrTable[i][j] = matchPtrTable;

                // Insertion could have been from continue
                // Get the score for continuing the gap...
                continueGap = insertTable[i][j-1] + this.scoringSchema.getGapContinueCost();
                // Get the score for starting a new gap from the match table...
                startGap = matchTable[i][j-1] + this.scoringSchema.getGapOpenCost() + this.scoringSchema.getGapContinueCost();
                // Pick the best and assign it in the insert table.
                insertTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? continueGap : startGap;
                // Set the pointer so we know where we've come from.
                insertPtrTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? insertPtrTable : matchPtrTable;

            } else if (j === 0) {
                // Along the top edge...
                // They could've only come from a deletion...
                matchTable[i][j] = this.scoringSchema.getGapOpenCost() + i * this.scoringSchema.getGapContinueCost();
                matchPtrTable[i][j] = deletePtrTable;

                insertTable[i][j] = this.scoringSchema.getWorstScore();
                insertPtrTable[i][j] = matchPtrTable;

                // Get the score for continuing the gap...
                continueGap = deleteTable[i-1][j] + this.scoringSchema.getGapContinueCost();
                // Get the score for starting a new gap from the match table...
                startGap    = matchTable[i-1][j] + this.scoringSchema.getGapOpenCost() + this.scoringSchema.getGapContinueCost();
                // Pick the best and assign it in the delete table.
                deleteTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? continueGap : startGap;
                // Set the pointer so we know where we've come from.
                deletePtrTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? deletePtrTable : matchPtrTable;

            } else {
                // Within the body of the DP table, the main recurrence relation in 3 parts...

                // Insertion (top) level
                // Get the score for continuing the gap...
                continueGap = insertTable[i][j-1] + this.scoringSchema.getGapContinueCost();
                // Get the score for starting a new gap from the match table...
                startGap    = matchTable[i][j-1] + this.scoringSchema.getGapOpenCost() + this.scoringSchema.getGapContinueCost();
                // Pick the best and assign it in the insert table.
                insertTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? continueGap : startGap;
                // Set the pointer so we know where we've come from.
                insertPtrTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? insertPtrTable : matchPtrTable;

                // Deletion (bottom) level
                // Get the score for continuing the gap...
                continueGap = deleteTable[i-1][j] + this.scoringSchema.getGapContinueCost();
                // Get the score for starting a new gap from the match table...
                startGap    = matchTable[i-1][j] + this.scoringSchema.getGapOpenCost() + this.scoringSchema.getGapContinueCost();
                // Pick the best and assign it in the delete table.
                deleteTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? continueGap : startGap;
                // Set the pointer so we know where we've come from.
                deletePtrTable[i][j] = this.scoringSchema.compare(continueGap, startGap) > 0 ? deletePtrTable : matchPtrTable;

                // Match (middle) level
                matchScore = matchTable[i-1][j-1] + this.scoringSchema.getScore(seq1[i-1], seq2[j-1]);
                if (this.scoringSchema.compare(matchScore, insertTable[i][j]) >= 0 &&
                    this.scoringSchema.compare(matchScore, deleteTable[i][j]) >= 0) {
                    // The match score is the best alignment.
                    matchTable[i][j] = matchScore;
                    matchPtrTable[i][j] = matchPtrTable;
                } else if (this.scoringSchema.compare(insertTable[i][j], deleteTable[i][j]) >= 0) {
                    // An insertion is the best alignment.
                    matchTable[i][j] = insertTable[i][j];
                    matchPtrTable[i][j] = insertPtrTable;
                } else {
                    // A deletion is the best alignment.
                    matchTable[i][j] = deleteTable[i][j];
                    matchPtrTable[i][j] = deletePtrTable;
                }

            }

            // Extended recurrence relation for local alignment...
            if (local && this.scoringSchema.compare(matchTable[i][j], freerideScore) < 0) {
                // Free ride score the best option...
                matchTable[i][j] = freerideScore;
                matchPtrTable[i][j] = null;
            }
        }
    }

    if (this.DEBUG) {
        // Output useful info.
        process.stdout.write("INSERTION TABLE: |\n");
        process.stdout.write(tableStringifier(insertTable, seq1, seq2));
        process.stdout.write("\n");
        process.stdout.write("MATCH TABLE:\n");
        process.stdout.write(tableStringifier(matchTable, seq1, seq2));
        process.stdout.write("\n");
        process.stdout.write("DELETION TABLE: -\n");
        process.stdout.write(tableStringifier(deleteTable, seq1, seq2));
        process.stdout.write("\n");
    }

    var startI = seq1len;
    var startJ = seq2len;

    var max = matchTable[startI][startJ];

    // Find the highest scoring position in the DP table for local alignment
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
    var output = backtrack(insertPtrTable, matchPtrTable, deletePtrTable, seq1, seq2, startI, startJ);
    output.score = max;

    if (this.DEBUG) {
        // Output useful info.
        process.stdout.write("Final Score = " + output.score + "\n");
        process.stdout.write(output.seq1);
        process.stdout.write("\n");
        process.stdout.write(output.seq2);
        process.stdout.write("\n");
    }

    return output;
};



/******************************************************************************
 * HELPER FUNCTIONS
 *****************************************************************************/

/**
 * The backtracking of the DP tables. Requires all 3 DP pointer tables to trace
 * the sequence.
 * 
 * @param  {Array} insertPtrTable   holds the backtracking info for the insert table
 * @param  {Array} matchPtrTable    holds the backtracking info for the match table
 * @param  {Array} deletePtrTable   holds the backtracking info for the delete table
 * @param  {String} seq1            the original input sequence 1
 * @param  {String} seq2            the original input sequence 2
 * @param  {Integer} startI         the starting i index
 * @param  {Integer} startJ         the starting j index
 * @return {Object}        both output strings containing appropriate indels
 */
function backtrack(insertPtrTable, matchPtrTable, deletePtrTable, seq1, seq2, startI, startJ) {
    var outputSeq1 = [];
    var outputSeq2 = [];

    var i = startI;
    var j = startJ;

    var count = 0;

    var currentTable = matchPtrTable[i][j];

    while (currentTable !== null && currentTable[i][j] !== null) {
        if (currentTable === matchPtrTable) {
            // In match table...
            if (matchPtrTable[i][j] === insertPtrTable) {
                // Move to insert table
                currentTable = insertPtrTable;
                continue;
            } else if (matchPtrTable[i][j] === deletePtrTable) {
                // Move to the delete table
                currentTable = deletePtrTable;
                continue;
            }
            // output a (mis)match.
            outputSeq1[count] = seq1[i-1];
            outputSeq2[count] = seq2[j-1];
            i--;
            j--;
        } else if (currentTable === insertPtrTable) {
            // In insert table...
            // output an insert in seq1...
            outputSeq1[count] = GAP;
            outputSeq2[count] = seq2[j-1];

            currentTable = insertPtrTable[i][j]; // next table...
            j--;
        } else {
            // In delete table...
            // output a deletion in seq1...
            outputSeq1[count] = seq1[i-1];
            outputSeq2[count] = GAP;

            currentTable = deletePtrTable[i][j]; // next table...
            i--;
        }
        count++;
    }

    var output = {};
    output.seq1 = outputSeq1.reverse().join("");
    output.seq2 = outputSeq2.reverse().join("");

    return output;
}

/**
 * Helper function used for printing the contents of the DP table in debug mode.
 * 
 * @param  {Array} table  the DP table
 * @param  {string} seq1  the first sequence in the pairwise alignment
 * @param  {string} seq2  the second sequence in the pairwise alignment
 * @return {string}       a string representation of the given input table
 */
function tableStringifier(table, seq1, seq2) {
    var output = ("\t0\t" + seq1.split("").join("\t") + "\n0\t");

    for (var j = 0; j < table[0].length; j++) {
        for (var i = 0; i < table.length; i++) {
            if (table[i][j] === -Infinity || table[i][j] === Infinity) {
                output += "#\t";
            } else {
                output += table[i][j] + "\t";
            }
        }
        output += "\n";
        if (j < table[0].length - 1) {
            output += seq2[j] + "\t";
        }
    }

    return output;
}


module.exports = SequenceAligner;
