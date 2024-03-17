/**
 *
 * @param {unknown} err
 * @returns {err is import("./types").CodeError}
 */
export function isCodeError(err) {
  if (typeof err !== "object" || err === null) {
    return false;
  }

  const hasName = "name" in err && typeof err.name === "string";
  const hasMessage = "message" in err && typeof err.message === "string";

  return hasName && hasMessage;
}

/**
 *
 * @param {unknown} result
 * @returns {result is import("./types").CodeResult}
 */
export function isCodeResult(result) {
  if (typeof result !== "object" || result === null) {
    return false;
  }

  const hasErr = "err" in result && isCodeError(result.err);
  const hasValue = "value" in result && typeof result.value === "string";

  return (hasErr && !hasValue) || (hasValue && !hasErr);
}
