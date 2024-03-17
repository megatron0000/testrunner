const deepEqual = require("./vendor/deep-is@0.1.4.js");
const { AssertionError } = require("./error.js");

function expectEquals(actual, expected) {
  if (!deepEqual(actual, expected)) {
    throw new AssertionError(actual, expected);
  }
}

function expect(actual) {
  return {
    to: {
      eql: (expected) => expectEquals(actual, expected),
      deep: {
        equal: (expected) => expectEquals(actual, expected),
      },
    },
  };
}

module.exports = expect;
