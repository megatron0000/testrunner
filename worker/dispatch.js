const { inspect } = require("./inspect.js");

function dispatch(err) {
  if (!err) {
    return { name: "UnknownError", message: "[error was falsy]" };
  }

  return {
    name: err.name || "UnknownError",
    message: err.message || "[no message]",
    ...(err.stack && { stack: err.stack }),
    ...("actual" in err && {
      payload: {
        actual: inspect(err.actual),
        expected: inspect(err.expected),
      },
    }),
  };
}

module.exports = dispatch;
