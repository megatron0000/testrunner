const filterStackLines = (
  /** @type {string} */ stack,
  /** @type {number} */ maxLineNumber
) => {
  const lines = stack.split("\n");
  return [
    lines[0],
    ...lines
      .filter((line) => line.includes("<sandbox>:"))
      .filter(
        (line) =>
          Number(line.match(/<sandbox>:(\d+):(\d+)/)?.[1]) <= maxLineNumber
      ),
  ].join("\n");
};

const getFirstStackLine = (/** @type {string | undefined}  */ stack) =>
  Number(stack?.match(/<sandbox>:(\d+):(\d+)/)?.[1]);

const convertStack = (
  /** @type {string} */ stack,
  /** @type {number | undefined} */ slice
) => {
  const lines = stack.split("\n");
  return [
    lines[0],
    ...lines
      .filter((line) => line.includes("(eval at scopedEval"))
      .map((line) => {
        const splitted = line.split("(eval at scopedEval (");
        const [, mixedPosition] = line.split("<anonymous>");
        const [, lineNumber, charNumber] = mixedPosition
          .slice(0, -1)
          .split(":");
        return `${splitted[0]}(<sandbox>:${
          Number(lineNumber) - 3
        }:${charNumber})`;
      }),
  ]
    .slice(0, slice)
    .join("\n");
};

/**
 *
 * @param {unknown} err
 * @returns {err is unknown & {stack: string}}
 */
const hasStack = (err) =>
  !!err &&
  typeof err === "object" &&
  "stack" in err &&
  typeof err.stack === "string";

module.exports = {
  filterStackLines,
  getFirstStackLine,
  convertStack,
  hasStack,
};
