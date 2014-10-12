var HammingDistanceScoringSchema = require("../src/HammingDistanceScoringSchema.js");


describe("SequenceAligner", function() {

  beforeEach(function() {
    this.ham = new HammingDistanceScoringSchema();
  });

  it("should give a score of one for 2 different characters", function() {
    expect(this.ham.getScore('a', 'b')).toBe(1);
    expect(this.ham.getScore('c', 'b')).toBe(1);
    expect(this.ham.getScore('4', 'e')).toBe(1);
    expect(this.ham.getScore('pp', 'p')).toBe(1);
    expect(this.ham.getScore('qw', 'q')).toBe(1);
    expect(this.ham.getScore('R', 'Q')).toBe(1);
    expect(this.ham.getScore('1', 'Y')).toBe(1);
    expect(this.ham.getScore('E', 'R')).toBe(1);
  });

  it("should give a score of zero for 2 identical characters", function() {
    expect(this.ham.getScore('a', 'a')).toBe(0);
    expect(this.ham.getScore('c', 'c')).toBe(0);
    expect(this.ham.getScore('4', '4')).toBe(0);
    expect(this.ham.getScore('pp', 'pp')).toBe(0);
    expect(this.ham.getScore('W', 'W')).toBe(0);
    expect(this.ham.getScore('R', 'R')).toBe(0);
    expect(this.ham.getScore('0', '0')).toBe(0);
    expect(this.ham.getScore('Eq', 'Eq')).toBe(0);
  });

});
