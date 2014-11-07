var MatrixScoringSchema = require("../src/scoringSchema/MatrixScoringSchema.js");


describe("MatrixScoringSchema", function() {

  beforeEach(function() {
    this.schema = new MatrixScoringSchema({
      matrix :      "A   T   G   C\n" + 
                "A   5  -4  -4  -4\n" +
                "T  -4   5  -4  -4\n" +
                "G  -4  -4   5  -4\n" +
                "C  -4  -4  -4   5\n",
      gapOpenCost : -5,
      gapContCost : -1
    });
  });

  it("should return 0 for the initial score", function() {
    expect(this.schema.getInitialScore()).toBe(0);
  });

  it("should return -Infinity for the worst score", function() {
    expect(this.schema.getWorstScore()).toBe(-Infinity);
  });

  it("should return -5 for the gap opening cost (linear gap cost)", function() {
    expect(this.schema.getGapOpenCost()).toBe(-5);
  });

  it("should return -1 for the gap continuing cost", function() {
    expect(this.schema.getGapContinueCost()).toBe(-1);
  });

  it("should return -1 when comparing a smaller score with a larger score", function() {
    expect(this.schema.compare(2, 5)).toBe(-1);
  });

  it("should return 0 when comparing scores that are equal", function() {
    expect(this.schema.compare(7, 7)).toBe(0);
  });

  it("should return 1 when comparing a larger score with a smaller score", function() {
    expect(this.schema.compare(5, 2)).toBe(1);
  });

  it("should give a score of -4 for 2 different strings regardless of case", function() {
    expect(this.schema.getScore('A', 'g')).toBe(-4);
    expect(this.schema.getScore('c', 'A')).toBe(-4);
    expect(this.schema.getScore('T', 'C')).toBe(-4);
    expect(this.schema.getScore('t', 'g')).toBe(-4);
  });

  it("should return a score of 5 if the two strings match regardless of case", function() {
    expect(this.schema.getScore('A', 'A')).toBe(5);
    expect(this.schema.getScore('c', 'c')).toBe(5);
    expect(this.schema.getScore('g', 'G')).toBe(5);
    expect(this.schema.getScore('T', 't')).toBe(5);
  });

  it("should return a score of -Infinity if either of the two strings do not exist in the scoring matrix", function() {
    expect(this.schema.getScore('A', 'p')).toBe(-Infinity);
    expect(this.schema.getScore('q', 'c')).toBe(-Infinity);
    expect(this.schema.getScore('g', 'R')).toBe(-Infinity);
    expect(this.schema.getScore('W', 'k')).toBe(-Infinity);
  });

});
