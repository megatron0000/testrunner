const dispatch = require("./dispatch.js")
const { UserError, getFirstStackLine, convertStack, filterStackLines } = require("./error.js")

function test(message, callback, userCodeLines) {
  try {
    callback();
    return { message, err: null };
  }
  catch (err) {
    const convertedStack = typeof err?.stack === "string"
      ? convertStack(err.stack)
      : undefined;

    const isUserError =
      err &&
      (err instanceof UserError ||
        getFirstStackLine(convertedStack) <= userCodeLines);

    if (isUserError) {
      if (convertedStack) {
        err.stack = filterStackLines(convertedStack, userCodeLines);
      }
      return { message, err: dispatch(err) }
    }

    throw dispatch(err)
  }
}

module.exports = test;