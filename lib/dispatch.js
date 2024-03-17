export function dispatch(err) {
  if (!err) {
    return { name: "UnknownError", message: "[error was falsy]" };
  }

  return {
    name: err.name || "UnknownError",
    message: err.message || "[no message]",
    ...(err.stack && { stack: err.stack }),
  };
}
