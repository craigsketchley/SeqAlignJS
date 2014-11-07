#!/usr/bin/env node

/******************************************************************************
 * SeqAlign.js script
 *****************************************************************************/

// Import util objects
var cli = require('cli').enable('help', 'version');
var fs = require('fs');
var Fasta = require('biojs-io-fasta').parse;
var defined = require('./src/util/defined.js');

// Import scoring schemas
var MatrixScoringSchema = require('./src/scoringSchema/MatrixScoringSchema.js');
var SimpleScoringSchema = require('./src/scoringSchema/SimpleScoringSchema.js');
var LCSScoringSchema = require('./src/scoringSchema/LCSScoringSchema.js');

// Import sequence aligner
var SequenceAligner = require('./src/SequenceAligner.js');


// Setup cli properties
cli.setApp('SeqAlign.js', '0.0.1');
var options = cli.parse({
  'debug'       : ['D', 'Enable debug mode'],
  'time'        : ['t', 'Enable timing mode and specify the number of repeats', 'number'],
  'gapopen'     : ['O', 'Set the gap opening cost for the alignment.', 'number', -12],
  'gapcont'     : ['C', 'Set the gap continuing cost for the alignment', 'number', -2],
  'matrix'      : ['m', 'Pass in the file containing the score matrix', 'path'],
  'output'      : ['o', 'Set the output file for the alignment, default stdout', 'path']
}, {
  'global'      : ['Global sequence alignment'],
  'local'       : ['Local sequence alignment'],
  'lcs'         : ['Longest Common Subsequence']
});

if (cli.args.length < 2) {
  process.stdout.write("Please supply 2 files containing FASTA format sequences.\n");
  process.exit(-1);
}

// Setup the scoring schema, using a matrix if the option was defined.
if (defined(options.matrix)) {
  importMatrixThenAlign(cli.args.shift(), cli.args.shift(), options.matrix, options.gapopen, options.gapcont);
} else {
  align(cli.args.shift(), cli.args.shift(), new SimpleScoringSchema({
    gapOpenCost : options.gapopen,
    gapContCost : options.gapcont,
  }));
}

var debug = options.debug !== null;

/**
 * Imports a matrix, then runs the alignment using it as a scoring schema.
 * @param  {string} filepath1 [description]
 * @param  {string} filepath2 [description]
 * @param  {string} matrixPath [description]
 * @param  {[type]} gapopen    [description]
 * @param  {[type]} gapcont    [description]
 * @return {[type]}            [description]
 */
function importMatrixThenAlign(filepath1, filepath2, matrixPath) {
  fs.readFile(matrixPath, 'utf8', function (err, matrixString) {
    if (err) {
      throw err;
    }

    align(filepath1, filepath2, new MatrixScoringSchema({
      matrix : matrixString,
      gapOpenCost : options.gapopen,
      gapContCost : options.gapcont
    }));
  });
}

var seq1, seq2, parsedFasta, result, output, aligner;

function align(filepath1, filepath2, scoringSchema) {
  fs.readFile(filepath1, 'utf8', function (err1,data1) {
    if (err1) {
      throw err1;
    }

    try {
      seq1 = (Fasta.parse(data1))[0];
    } catch (e) {
      process.stdout.write("The file " + filepath1 + " is not in FASTA format:\n---\n" + data1 + "\n");
      process.exit(-1);
    }

    fs.readFile(filepath2, 'utf8', function (err2,data2) {
      if (err2) {
        throw err2;
      }

      try {
        seq2 = (Fasta.parse(data2))[0];
      } catch (e) {
        process.stdout.write("The file " + filepath2 + " is not in FASTA format:\n---\n" + data2 + "\n");
        process.exit(-1);
      }

      switch (cli.command) {
        case 'global':
          aligner = new SequenceAligner({
            debug : debug,
            scoringSchema : scoringSchema,
            alignmentType : SequenceAligner.AlignmentType.GLOBAL
          });
          break;
        case 'local':
          aligner = new SequenceAligner({
            debug : debug,
            scoringSchema : scoringSchema,
            alignmentType : SequenceAligner.AlignmentType.LOCAL
          });
          break;
        case 'lcs':
          aligner = new SequenceAligner({
            debug : debug,
            scoringSchema : new LCSScoringSchema(),
            alignmentType : SequenceAligner.AlignmentType.GLOBAL
          });
          break;
      }

      if (options.time) {
        // Repeat alignment N times then take the average
        var tag = 'timed for ' + options.time + ' iterations.';
        console.time(tag);
        for (var i = 0; i < options.time; i++) {
          result = aligner.align(seq1.seq, seq2.seq);
        }
        console.timeEnd(tag);
      } else {
        result = aligner.align(seq1.seq, seq2.seq);
      }
      output = result.score + "\n>" + seq1.name + "\n" + result.seq1 + "\n>" + seq2.name + "\n" + result.seq2 + "\n";

      if (defined(options.output)) {
        // Write to the specified file...
        fs.writeFile(options.output, output, 'utf8', function (err3) {
          if (err3) {
            throw err3;
          }
        });
      } else if (!debug) {
        // Print to standard out...
        process.stdout.write(output);
      }
    });
  });
}