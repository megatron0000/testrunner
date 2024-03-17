const deepEqual = require("./vendor/deep-is@0.1.4.js");
const { AssertionError } = require("./error.js");

/**
 * @param {any} actual
 * @param {any} expected
 */
function expectEquals(actual, expected) {
  if (!deepEqual(actual, expected)) {
    throw new AssertionError(actual, expected);
  }
}

/**
 * @param {any} actual
 */
function expect(actual) {
  return {
    to: {
      eql: (/** @type {any} */ expected) => expectEquals(actual, expected),
      deep: {
        equal: (/** @type {any} */ expected) => expectEquals(actual, expected),
      },
    },
  };
}

module.exports = expect;
