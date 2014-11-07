var defined = require("../src/util/defined.js");


describe("defined", function() {

  it("should return true for an empty object that is defined", function() {
    var test = {};
    expect(defined(test)).toBe(true);
  });

  it("should return true for an object that is defined", function() {
    var test = { test : "test" };
    expect(defined(test)).toBe(true);
  });

  it("should return true for an integer that is defined", function() {
    var test = 1;
    expect(defined(test)).toBe(true);
  });

  it("should return true for an float that is defined", function() {
    var test = 1.5;
    expect(defined(test)).toBe(true);
  });

  it("should return true for an empty array that is defined", function() {
    var test = [];
    expect(defined(test)).toBe(true);
  });

  it("should return true for an array that is defined", function() {
    var test = [2, 4, 'hello', 'world'];
    expect(defined(test)).toBe(true);
  });

  it("should return true for an boolean that is defined", function() {
    var test = false;
    expect(defined(test)).toBe(true);
  });

  it("should return false for an uninitialised variable that is defined", function() {
    var test;
    expect(defined(test)).toBe(false);
  });

  it("should return false for a null variable that is defined", function() {
    var test = null;
    expect(defined(test)).toBe(false);
  });

  it("should return false for a 'undefined' variable that is defined", function() {
    var test = undefined;
    expect(defined(test)).toBe(false);
  });

});
