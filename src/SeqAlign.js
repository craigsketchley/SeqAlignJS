var ScoringSchema = require('./ScoringSchema.js');
var HammingDistanceScoringSchema = require('./HammingDistanceScoringSchema.js');
var SequenceAligner = require('./SequenceAligner.js');

var SeqAlign = new SequenceAligner({
	scoringSchema : HammingDistanceScoringSchema,
	debug : true
});

SeqAlign.align("ATCGTAC", "TTTTTTT");
