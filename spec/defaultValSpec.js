var defaultVal = require("../src/util/defaultVal.js");


describe("defaultVal", function() {

  it("should return a defined variable over the fallback", function() {
    var test = 3;
    var fallback = 13;
    expect(defaultVal(test, fallback)).toBe(test);
  });

  it("should return the fallback over a null variable", function() {
    var test = null;
    var fallback = 13;
    expect(defaultVal(test, fallback)).toBe(fallback);
  });

  it("should return the fallback over an undefined variable", function() {
    var test = undefined;
    var fallback = 13;
    expect(defaultVal(test, fallback)).toBe(fallback);
  });

  it("should return the fallback over an uninitialised variable", function() {
    var test;
    var fallback = 13;
    expect(defaultVal(test, fallback)).toBe(fallback);
  });

});
