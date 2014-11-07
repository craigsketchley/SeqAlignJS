var SequenceAligner = require("../src/SequenceAligner.js");
var MatrixScoringSchema = require("../src/scoringSchema/MatrixScoringSchema.js");
var LCSScoringSchema = require("../src/scoringSchema/LCSScoringSchema.js");


describe("SequenceAligner", function() {
  var matrixSchemaAffine = new MatrixScoringSchema({
    matrix :      "A   T   G   C\n" + 
              "A   5  -4  -4  -4\n" +
              "T  -4   5  -4  -4\n" +
              "G  -4  -4   5  -4\n" +
              "C  -4  -4  -4   5\n",
    gapOpenCost : -5,
    gapContCost : -1
  });

  var matrixSchemaLinear = new MatrixScoringSchema({
    matrix :      "A   T   G   C\n" + 
              "A   5  -4  -4  -4\n" +
              "T  -4   5  -4  -4\n" +
              "G  -4  -4   5  -4\n" +
              "C  -4  -4  -4   5\n",
    gapOpenCost : 0,
    gapContCost : -3
  });

  var LCSschema = new LCSScoringSchema();

  describe("Global Alignment", function() {

    describe("with affine gap cost", function() {

      beforeEach(function() {
        this.seqAlign = new SequenceAligner({
          scoringSchema : matrixSchemaAffine,
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
        expect(output.seq1).toBe("ATCG-TAC");
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
        output = this.seqAlign.align("CCC", "GGG");

        expect(output.score).toBe(-12);
        expect(output.seq1).toBe("CCC");
        expect(output.seq2).toBe("GGG");
      });

    });

    describe("with linear gap cost", function() {

      beforeEach(function() {
        this.seqAlign = new SequenceAligner({
          scoringSchema : matrixSchemaLinear,
          alignmentType : SequenceAligner.AlignmentType.GLOBAL
        });
      });

      it("should be setup for global alignment", function() {
        expect(this.seqAlign.alignmentType).toBe(SequenceAligner.AlignmentType.GLOBAL);
      });

      it("should be able globally align 2 random sequences", function() {
        var output = this.seqAlign.align("ACGTACGTACGT", "AGCTAGCTAGCT");

        expect(output.score).toBe(27);
        expect(output.seq1).toBe("ACG-TACG-TACG-T");
        expect(output.seq2).toBe("A-GCTA-GCTA-GCT");
      });

      it("should be able globally align 2 shorter random sequences", function() {
        output = this.seqAlign.align("ATCGTAC", "ATGTTAT");

        expect(output.score).toBe(15);
        expect(output.seq1).toBe("ATCG-TAC");
        expect(output.seq2).toBe("AT-GTTAT");
      });

      it("should be able globally align 2 slightly offset sequences", function() {
        var output = this.seqAlign.align("ATAT", "TATA");

        expect(output.score).toBe(9);
        expect(output.seq1).toBe("ATAT-");
        expect(output.seq2).toBe("-TATA");
      });

      it("should be able globally align 2 completely different sequences", function() {
        output = this.seqAlign.align("AAAAAAA", "TTTTTTT");

        expect(output.score).toBe(-28);
        expect(output.seq1).toBe("AAAAAAA");
        expect(output.seq2).toBe("TTTTTTT");
      });

      it("should be able globally align 2 shorter completely different sequences", function() {
        output = this.seqAlign.align("CCCC", "GGGG");

        expect(output.score).toBe(-16);
        expect(output.seq1).toBe("CCCC");
        expect(output.seq2).toBe("GGGG");
      });

    });

    describe("with LCS schema", function() {

      beforeEach(function() {
        this.seqAlign = new SequenceAligner({
          scoringSchema : LCSschema,
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

        expect(output.score).toBe(5);
        expect(output.seq1).toBe("ATCG-TAC-");
        expect(output.seq2).toBe("AT-GTTA-T");
      });

      it("should be able globally align 2 slightly offset sequences", function() {
        var output = this.seqAlign.align("ATAT", "TATA");

        expect(output.score).toBe(3);
        expect(output.seq1).toBe("ATAT-");
        expect(output.seq2).toBe("-TATA");
      });

      it("should be able globally align 2 completely different sequences", function() {
        output = this.seqAlign.align("AAAAAAA", "TTTTTTT");

        expect(output.score).toBe(0);
        expect(output.seq1).toBe("AAAAAAA-------");
        expect(output.seq2).toBe("-------TTTTTTT");
      });

      it("should be able globally align 2 shorter completely different sequences", function() {
        output = this.seqAlign.align("CCCC", "GGGG");

        expect(output.score).toBe(0);
        expect(output.seq1).toBe("CCCC----");
        expect(output.seq2).toBe("----GGGG");
      });

    });

  });

  describe("Local Alignment", function() {
    
    describe("with affine gap cost", function() {
    
      beforeEach(function() {
        this.seqAlign = new SequenceAligner({
          scoringSchema : matrixSchemaAffine,
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

      it("should be able locally align a perfect subsequence at the ends of both sequences", function() {
        output = this.seqAlign.align("AAAAAATTTT", "GGGGGGTTTT");

        expect(output.score).toBe(20);
        expect(output.seq1).toBe("TTTT");
        expect(output.seq2).toBe("TTTT");
      });

      it("should be able locally align a perfect subsequence at the beginning of both sequences", function() {
        output = this.seqAlign.align("TTTTAAAAAAA", "TTTTGGGGGG");

        expect(output.score).toBe(20);
        expect(output.seq1).toBe("TTTT");
        expect(output.seq2).toBe("TTTT");
      });

      it("should be able locally align a perfect subsequence in the middle of both sequences", function() {
        output = this.seqAlign.align("AAAAATTTTAAAAAAA", "GGGGGTTTTGGGGGG");

        expect(output.score).toBe(20);
        expect(output.seq1).toBe("TTTT");
        expect(output.seq2).toBe("TTTT");
      });

      it("should be able locally align a perfect subsequence at mixed positions", function() {
        output = this.seqAlign.align("AAATTTTAAAAA", "GGGGGGTTTT");

        expect(output.score).toBe(20);
        expect(output.seq1).toBe("TTTT");
        expect(output.seq2).toBe("TTTT");
      });

      it("should be able locally align a perfect single character subsequence at the ends of both sequences", function() {
        output = this.seqAlign.align("AAAAAAT", "GGGGGGT");

        expect(output.score).toBe(5);
        expect(output.seq1).toBe("T");
        expect(output.seq2).toBe("T");
      });

      it("should be able locally align a perfect single character subsequence at the beginning of both sequences", function() {
        output = this.seqAlign.align("TAAAAAAA", "TGGGGGG");

        expect(output.score).toBe(5);
        expect(output.seq1).toBe("T");
        expect(output.seq2).toBe("T");
      });

      it("should be able locally align a perfect single character subsequence in the middle of both sequences", function() {
        output = this.seqAlign.align("AAAAATAAAAAAA", "GGGGGTGGGGGG");

        expect(output.score).toBe(5);
        expect(output.seq1).toBe("T");
        expect(output.seq2).toBe("T");
      });

      it("should be able locally align a perfect single character subsequence at mixed positions", function() {
        output = this.seqAlign.align("AAATAAAAA", "GGGGGGT");

        expect(output.score).toBe(5);
        expect(output.seq1).toBe("T");
        expect(output.seq2).toBe("T");
      });

    });

    describe("with linear gap cost", function() {
    
      beforeEach(function() {
        this.seqAlign = new SequenceAligner({
          scoringSchema : matrixSchemaLinear,
          alignmentType : SequenceAligner.AlignmentType.LOCAL
        });
      });

      it("should be setup for local alignment", function() {
        expect(this.seqAlign.alignmentType).toBe(SequenceAligner.AlignmentType.LOCAL);
      });

      it("should be able locally align 2 random sequences", function() {
        var output = this.seqAlign.align("ACGTACGTACGT", "AGCTAGCTAGCT");

        expect(output.score).toBe(27);
        expect(output.seq1).toBe("ACG-TACG-TACG-T");
        expect(output.seq2).toBe("A-GCTA-GCTA-GCT");
      });

      it("should be able locally align 2 shorter random sequences", function() {
        output = this.seqAlign.align("ATCGTAC", "ATGTTAT");

        expect(output.score).toBe(19);
        expect(output.seq1).toBe("ATCG-TA");
        expect(output.seq2).toBe("AT-GTTA");
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

      it("should be able locally align a perfect subsequence", function() {
        output = this.seqAlign.align("AAACGTCGTAAAAA", "GGGGGGCGTCGT");

        expect(output.score).toBe(30);
        expect(output.seq1).toBe("CGTCGT");
        expect(output.seq2).toBe("CGTCGT");
      });

    });

  });

});
