var SequenceAligner = require("../src/SequenceAligner.js");
var HammingDistanceScoringSchema = require("../src/HammingDistanceScoringSchema.js");


describe("SequenceAligner", function() {

  beforeEach(function() {
    this.seqAlign = new SequenceAligner({ scoringSchema : HammingDistanceScoringSchema });
  });

  it("should be able to align 2 sequences", function() {
    var output = this.seqAlign.align("ATAT", "TATA");

    expect(output.score).toBe(3);
    expect(output.seq1).toBe("ATAT-");
    expect(output.seq2).toBe("-TATA");

    output = this.seqAlign.align("ATCGTAC", "ATGTTAT");

    expect(output.score).toBe(5);
    expect(output.seq1).toBe("ATCG-TAC-");
    expect(output.seq2).toBe("AT-GTTA-T");

    output = this.seqAlign.align("AAAAAAA", "TTTTTTT");

    expect(output.score).toBe(0);
    expect(output.seq1).toBe("AAAAAAA-------");
    expect(output.seq2).toBe("-------TTTTTTT");
  });

});
