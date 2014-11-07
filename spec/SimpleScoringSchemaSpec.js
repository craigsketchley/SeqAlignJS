var SimpleScoringSchema = require("../src/scoringSchema/SimpleScoringSchema.js");


describe("SimpleScoringSchema", function() {

  beforeEach(function() {
    this.schema = new SimpleScoringSchema();
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
