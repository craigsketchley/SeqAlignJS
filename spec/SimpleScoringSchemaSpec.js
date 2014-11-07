var SimpleScoringSchema = require("../src/scoringSchema/SimpleScoringSchema.js");


describe("SimpleScoringSchema", function() {

  describe("using default values", function() {

    beforeEach(function() {
      this.schema = new SimpleScoringSchema();
    });

    it("should return 0 for the initial score", function() {
      expect(this.schema.getInitialScore()).toBe(0);
    });

    it("should return -Infinity for the worst score", function() {
      expect(this.schema.getWorstScore()).toBe(-Infinity);
    });

    it("should return 0 for the gap opening cost (linear gap cost)", function() {
      expect(this.schema.getGapOpenCost()).toBe(0);
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

    it("should give a score of -1 for 2 different strings", function() {
      expect(this.schema.getScore('a', 'b')).toBe(-1);
      expect(this.schema.getScore('c', 'b')).toBe(-1);
      expect(this.schema.getScore('4', 'e')).toBe(-1);
      expect(this.schema.getScore('pp', 'p')).toBe(-1);
      expect(this.schema.getScore('qw', 'q')).toBe(-1);
      expect(this.schema.getScore('R', 'Q')).toBe(-1);
      expect(this.schema.getScore('1', 'Y')).toBe(-1);
      expect(this.schema.getScore('E', 'R')).toBe(-1);
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

  describe("using custom values", function() {

    beforeEach(function() {
      this.schema = new SimpleScoringSchema({
        matchScore : 5,
        mismatchScore : -4,
        gapOpenCost : -11,
        gapContCost : -1
      });
    });

    it("should return 0 for the initial score", function() {
      expect(this.schema.getInitialScore()).toBe(0);
    });

    it("should return -Infinity for the worst score", function() {
      expect(this.schema.getWorstScore()).toBe(-Infinity);
    });

    it("should return -11 for the gap opening cost (affine gap cost)", function() {
      expect(this.schema.getGapOpenCost()).toBe(-11);
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

    it("should give a score of -14for 2 different strings", function() {
      expect(this.schema.getScore('a', 'b')).toBe(-4);
      expect(this.schema.getScore('c', 'b')).toBe(-4);
      expect(this.schema.getScore('4', 'e')).toBe(-4);
      expect(this.schema.getScore('pp', 'p')).toBe(-4);
      expect(this.schema.getScore('qw', 'q')).toBe(-4);
      expect(this.schema.getScore('R', 'Q')).toBe(-4);
      expect(this.schema.getScore('1', 'Y')).toBe(-4);
      expect(this.schema.getScore('E', 'R')).toBe(-4);
    });

    it("should return a score of 5 if the two strings match", function() {
      expect(this.schema.getScore('a', 'a')).toBe(5);
      expect(this.schema.getScore('c', 'c')).toBe(5);
      expect(this.schema.getScore('4', '4')).toBe(5);
      expect(this.schema.getScore('pp', 'pp')).toBe(5);
      expect(this.schema.getScore('W', 'W')).toBe(5);
      expect(this.schema.getScore('R', 'R')).toBe(5);
      expect(this.schema.getScore('5', '5')).toBe(5);
      expect(this.schema.getScore('Eq', 'Eq')).toBe(5);
    });
    
  });

});
