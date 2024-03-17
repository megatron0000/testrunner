const ConsoleCollector = require("./console-collector.js");
const dispatch = require("./dispatch.js");
const { UserError } = require("./error.js");
const {
  getFirstStackLine,
  convertStack,
  filterStackLines,
} = require("./stack.js");

function test(message, testFunction, userCodeLines) {
  try {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.wrap(console);
    testFunction();
    return { message, err: null };
  } catch (err) {
    // 1 - If it is a user error, consider this as a result (an error result)

    const convertedStack =
      typeof err?.stack === "string" ? convertStack(err.stack) : undefined;

    const errorHappenedInsideUserCode =
      getFirstStackLine(convertedStack) <= userCodeLines;

    const isUserError = err instanceof UserError || errorHappenedInsideUserCode;

    if (isUserError) {
      if (convertedStack) {
        err.stack = filterStackLines(convertedStack, userCodeLines);
      }
      return { message, err: dispatch(err) };
    }

    // 2 - else (internal error) throw it

    throw dispatch(err);
  }
}

module.exports = test;
