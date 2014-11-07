var SequenceAligner = require("../src/SequenceAligner.js");
var MatrixScoringSchema = require("../src/scoringSchema/MatrixScoringSchema.js");


describe("SequenceAligner", function() {
  var matrixSchema = new MatrixScoringSchema({
    matrix :      "A   T   G   C\n" + 
              "A   5  -4  -4  -4\n" +
              "T  -4   5  -4  -4\n" +
              "G  -4  -4   5  -4\n" +
              "C  -4  -4  -4   5\n",
    gapOpenCost : -5,
    gapContCost : -1
  });

  describe("Global Alignment", function() {
    beforeEach(function() {
      this.seqAlign = new SequenceAligner({
        scoringSchema : matrixSchema,
        alignmentType : SequenceAligner.AlignmentType.GLOBAL
      });
    });

    it("should be setup for global alignment", function() {
      expect(this.seqAlign.alignmentType).toBe(SequenceAligner.AlignmentType.GLOBAL);
    });

    it("should be able globally align 2 random sequences", function() {
      var output = this.seqAlign.align("ACGTACGTACGT", "AGCTAGCTAGCT");

      expect(output.score).toBe(9);
      expect(output.seq1).toBe("ACG-TACG-TACG-T");
      expect(output.seq2).toBe("A-GCTA-GCTA-GCT");
    });

    it("should be able globally align 2 shorter random sequences", function() {
      output = this.seqAlign.align("ATCGTAC", "ATGTTAT");

      expect(output.score).toBe(9);
      expect(output.seq1).toBe("ATCGT-AC");
      expect(output.seq2).toBe("AT-GTTAT");
    });

    it("should be able globally align 2 slightly offset sequences", function() {
      var output = this.seqAlign.align("ATAT", "TATA");

      expect(output.score).toBe(3);
      expect(output.seq1).toBe("ATAT-");
      expect(output.seq2).toBe("-TATA");
    });

    it("should be able globally align 2 completely different sequences", function() {
      output = this.seqAlign.align("AAAAAAA", "TTTTTTT");

      expect(output.score).toBe(-24);
      expect(output.seq1).toBe("AAAAAAA-------");
      expect(output.seq2).toBe("-------TTTTTTT");
    });

    it("should be able globally align 2 shorter completely different sequences", function() {
      output = this.seqAlign.align("CCCC", "GGGG");

      expect(output.score).toBe(-16);
      expect(output.seq1).toBe("CCCC");
      expect(output.seq2).toBe("GGGG");
    });

  });

  describe("Local Alignment", function() {
    beforeEach(function() {
      this.seqAlign = new SequenceAligner({
        scoringSchema : matrixSchema,
        alignmentType : SequenceAligner.AlignmentType.LOCAL
      });
    });

    it("should be setup for local alignment", function() {
      expect(this.seqAlign.alignmentType).toBe(SequenceAligner.AlignmentType.LOCAL);
    });

    it("should be able locally align 2 random sequences", function() {
      var output = this.seqAlign.align("ACGTACGTACGT", "AGCTAGCTAGCT");

      expect(output.score).toBe(13);
      expect(output.seq1).toBe("TACG-TA");
      expect(output.seq2).toBe("TA-GCTA");
    });

    it("should be able locally align 2 shorter random sequences", function() {
      output = this.seqAlign.align("ATCGTAC", "ATGTTAT");

      expect(output.score).toBe(14);
      expect(output.seq1).toBe("ATCGT");
      expect(output.seq2).toBe("AT-GT");
    });

    it("should be able locally align 2 slightly offset sequences", function() {
      var output = this.seqAlign.align("ATAT", "TATA");

      expect(output.score).toBe(15);
      expect(output.seq1).toBe("ATA");
      expect(output.seq2).toBe("ATA");
    });

    it("should be able locally align 2 completely different sequences", function() {
      output = this.seqAlign.align("AAAAAAA", "TTTTTTT");

      expect(output.score).toBe(0);
      expect(output.seq1).toBe("");
      expect(output.seq2).toBe("");
    });

  });

});
