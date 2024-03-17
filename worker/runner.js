const ConsoleCollector = require("./console-collector.js");
const dispatch = require("./dispatch.js");
const { UserError } = require("./error.js");
const { inspect } = require("./inspect.js");
const {
  getFirstStackLine,
  convertStack,
  filterStackLines,
  hasStack,
} = require("./stack.js");

/**
 *
 * @param {() => any} testFunction
 * @param {number} userCodeLines
 * @returns  {import("../lib/runner.js").CodeResult}
 */
function runTest(testFunction, userCodeLines) {
  try {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.wrap(console);
    const value = testFunction();
    return { value: inspect(value), err: null };
  } catch (err) {
    // 1 - If it is a user error, consider this as a result (an error result)

    const errorHasStack = hasStack(err);
    const convertedStack = errorHasStack ? convertStack(err.stack) : undefined;

    const errorHappenedInsideUserCode =
      getFirstStackLine(convertedStack) <= userCodeLines;

    const isUserError = err instanceof UserError || errorHappenedInsideUserCode;

    if (isUserError) {
      if (errorHasStack) {
        err.stack = filterStackLines(convertedStack || "", userCodeLines);
      }
      return { value: null, err: dispatch(err) };
    }

    // 2 - else (internal error) throw it

    throw dispatch(err);
  }
}

module.exports = {
  runTest,
};
