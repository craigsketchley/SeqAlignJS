#!/usr/bin/env node

var cli = require('cli').enable('help', 'version');
var fs = require('fs');

cli.setApp('SeqAlign.js', '0.0.1');

var options = cli.parse({
  'debug'       : ['D', 'Enable debug mode']
}, {
  'global'      : ['Global sequence alignment'],
  'local'       : ['Local sequence alignment'],
  'lcs'         : ['TODO: Longest Common Subsequence']
});

var scoringMatrixParser = require('./util/scoringMatrixParser.js');
var MatrixScoringSchema = require('./scoringSchema/MatrixScoringSchema.js');
var SimpleScoringSchema = require('./scoringSchema/SimpleScoringSchema.js');
var SequenceAligner = require('./SequenceAligner.js');
var GlobalSequenceAligner = require('./GlobalSequenceAligner.js');
var LocalSequenceAligner = require('./LocalSequenceAligner.js');

if (options.debug === null) {
  cli.spinner('Aligning...');
}

var scores = {
  matchScore : 5,
  mismatchScore : -4,
  gapOpenCost : -11,
  gapContCost : -1
};

fs.readFile('./src/scoringMatrices/DNAfull', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  
  var matrixSchema = new MatrixScoringSchema({
    matrix : scoringMatrixParser(data),
    gapOpenCost : -11,
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
      var SeqAlign;
      var debug = options.debug !== null;

      switch (cli.command) {
      case 'global':
        SeqAlign = new SequenceAligner({
          debug : debug,
          scoringSchema : matrixSchema,
          alignmentType : SequenceAligner.AlignmentType.GLOBAL
        });
        break;
      case 'local':
        SeqAlign = new SequenceAligner({
          debug : debug,
          scoringSchema : matrixSchema,
          alignmentType : SequenceAligner.AlignmentType.LOCAL
        });
        break;
      default:
        // default behaviour == Global sequence alignment
        SeqAlign = new SequenceAligner({
          debug : debug,
          scoringSchema : new SimpleScoringSchema(scores),
          alignmentType : SequenceAligner.AlignmentType.GLOBAL
        });
      }

      SeqAlign.align(data1, data2);
      cli.spinner('Aligning... done!\n', true); //End the spinner
    });
  });
});