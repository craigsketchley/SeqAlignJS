var LCSScoringSchema = require("../src/scoringSchema/LCSScoringSchema.js");


describe("LCSScoringSchema", function() {

  beforeEach(function() {
    this.schema = new LCSScoringSchema();
  });

  it("should return 0 for the initial score", function() {
    expect(this.schema.getInitialScore()).toBe(0);
  });

  it("should return 0 for the worst score", function() {
    expect(this.schema.getWorstScore()).toBe(0);
  });

  it("should return 0 for the gap opening cost (linear gap cost)", function() {
    expect(this.schema.getGapOpenCost()).toBe(0);
  });

  it("should return 0 for the gap continuing cost", function() {
    expect(this.schema.getGapContinueCost()).toBe(0);
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

  it("should give a score of -Infinity for 2 different strings", function() {
    expect(this.schema.getScore('a', 'b')).toBe(-Infinity);
    expect(this.schema.getScore('c', 'b')).toBe(-Infinity);
    expect(this.schema.getScore('4', 'e')).toBe(-Infinity);
    expect(this.schema.getScore('pp', 'p')).toBe(-Infinity);
    expect(this.schema.getScore('qw', 'q')).toBe(-Infinity);
    expect(this.schema.getScore('R', 'Q')).toBe(-Infinity);
    expect(this.schema.getScore('1', 'Y')).toBe(-Infinity);
    expect(this.schema.getScore('E', 'R')).toBe(-Infinity);
  });

  it("should return a score of 1 if the two strings match", function() {
    expect(this.schema.getScore('a', 'a')).toBe(1);
    expect(this.schema.getScore('c', 'c')).toBe(1);
    expect(this.schema.getScore('4', '4')).toBe(1);
    expect(this.schema.getScore('pp', 'pp')).toBe(1);
    expect(this.schema.getScore('W', 'W')).toBe(1);
    expect(this.schema.getScore('R', 'R')).toBe(1);
    expect(this.schema.getScore('1', '1')).toBe(1);
    expect(this.schema.getScore('Eq', 'Eq')).toBe(1);
  });

});
