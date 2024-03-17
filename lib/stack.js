export const getFirstStackLine = (/** @type {string | undefined } */ stack) =>
  Number(stack?.match(/<sandbox>:(\d+):(\d+)/)?.[1]);
