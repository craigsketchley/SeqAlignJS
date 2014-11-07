#!/usr/bin/env node

var cli = require('cli').enable('help', 'version');
var fs = require('fs');

cli.setApp('SeqAlign.js', '0.0.1');

var options = cli.parse({
  'debug'       : ['D', 'Enable debug mode']
}, {
  'global'      : ['Global sequence alignment'],
  'local'       : ['Local sequence alignment'],
  'lcs'         : ['Longest Common Subsequence']
});

var scoringMatrixParser = require('./util/scoringMatrixParser.js');

var MatrixScoringSchema = require('./scoringSchema/MatrixScoringSchema.js');
var SimpleScoringSchema = require('./scoringSchema/SimpleScoringSchema.js');
var LCSScoringSchema = require('./scoringSchema/LCSScoringSchema.js');

var SequenceAligner = require('./SequenceAligner.js');

if (options.debug === null) {
  cli.spinner('Aligning...');
}

fs.readFile('./src/scoringMatrices/DNAsimple', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }

  var matrixSchema = new MatrixScoringSchema({
    matrix : data,
    gapOpenCost : -5,
    gapContCost : -1
  });

  fs.readFile('./' + cli.args.shift(), 'utf8', function (err1,data1) {
    if (err1) {
      return console.log(err1);
    }
    fs.readFile('./' + cli.args.shift(), 'utf8', function (err2,data2) {
      if (err2) {
        return console.log(err2); 
      }
      var aligner;
      var debug = options.debug !== null;

      switch (cli.command) {
        case 'global':
          aligner = new SequenceAligner({
            debug : debug,
            scoringSchema : matrixSchema,
            alignmentType : SequenceAligner.AlignmentType.GLOBAL
          });
          break;
        case 'local':
          aligner = new SequenceAligner({
            debug : debug,
            scoringSchema : matrixSchema,
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
        default:
          // default behaviour == Global sequence alignment
          aligner = new SequenceAligner({
            debug : debug,
            scoringSchema : matrixSchema,
            alignmentType : SequenceAligner.AlignmentType.GLOBAL
          });
      }

      aligner.align(data1, data2);
      cli.spinner('Aligning... done!\n', true); //End the spinner
    });
  });
});