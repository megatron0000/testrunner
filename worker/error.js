/**
 * Known errors thrown on purpose by the test framework
 */
class UserError {}

class AssertionError extends UserError {
  /**
   * @param {any} actual
   * @param {any} expected
   */
  constructor(actual, expected) {
    super();
    this.name = "AssertionError";
    this.message = `expected ${actual} to equal ${expected}`;
    this.actual = actual;
    this.expected = expected;
  }
}

module.exports = {
  UserError,
  AssertionError,
};
