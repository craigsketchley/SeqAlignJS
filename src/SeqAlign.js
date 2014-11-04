#!/usr/bin/env node

var cli = require('cli').enable('help', 'version');
var fs = require('fs');

cli.setApp('SeqAlign.js', '0.0.1');

var options = cli.parse({
  'debug'       : ['D', 'Enable debug mode']
}, {
  'global'      : ['Global sequence alignment'],
  'local'       : ['TODO: Local sequence alignment'],
  'overlap'     : ['Overlap sequence alignment'],
  'semi-global' : ['TODO: Semi-global sequence alignment'],
  'spanning'    : ['Spanning sequence alignment'],
  'lcs'         : ['TODO: Longest Common Subsequence']
});


var ScoringSchema = require('./ScoringSchema.js');
var HammingDistanceScoringSchema = require('./HammingDistanceScoringSchema.js');
var MatrixScoringSchema = require('./MatrixScoringSchema.js');
var SequenceAligner = require('./SequenceAligner.js');

if (options.debug === null) {
  cli.spinner('Aligning...');
}

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
      SeqAlign = GlobalSequenceAligner(debug);
      break;
    case 'local':
      SeqAlign = LocalSequenceAligner(debug);
      break;
    case 'overlap':
      SeqAlign = OverlapSequenceAligner(debug);
      break;
    case 'semi-global':
      SeqAlign = SemiGlobalSequenceAligner(debug);
      break;
    case 'spanning':
      SeqAlign = SpanningSequenceAligner(debug);
      break;
    case 'lcs':
      SeqAlign = LongestCommonSubsequence(debug);
      break;
    default:
      // default behaviour == Global sequence alignment
      SeqAlign = GlobalSequenceAligner(debug);
    }

    SeqAlign.align(data1, data2);
    cli.spinner('Aligning... done!\n', true); //End the spinner
  });
});

// Done.
var GlobalSequenceAligner = function(d) {
  return new SequenceAligner({
    scoringSchema : new MatrixScoringSchema(),
    span : false,
    indels : true,
    mismatch : true,
    freerides : false,
    debug : d
  });
};

// TODO:
var LocalSequenceAligner = function(d) {
  return new SequenceAligner({
    scoringSchema : new MatrixScoringSchema(),
    span : false,
    indels : true,
    mismatch : true,
    freerides : true,
    debug : d
  });
};

// Done.
var OverlapSequenceAligner = function(d) {
  return new SequenceAligner({
    scoringSchema : new MatrixScoringSchema(),
    span : false,
    indels : false,
    mismatch : true,
    freerides : false,
    debug : d
  });
};

// TODO:
var SemiGlobalSequenceAligner = function(d) {
  return new SequenceAligner({
    scoringSchema : new MatrixScoringSchema(),
    span : false,
    indels : false,
    mismatch : true,
    freerides : false,
    debug : d
  });
};

// Done.
var SpanningSequenceAligner = function(d) {
  return new SequenceAligner({
    scoringSchema : new MatrixScoringSchema(),
    span : true,
    indels : true,
    mismatch : true,
    freerides : false,
    debug : d
  });
};

// TODO:
var LongestCommonSubsequence = function(d) {
  return new SequenceAligner({
    scoringSchema : new MatrixScoringSchema(),
    span : false,
    indels : false,
    mismatch : true,
    freerides : false,
    debug : d
  });
}