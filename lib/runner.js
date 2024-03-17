// @ts-expect-error : cannot find declarations
import createWorkerBox from "https://cdn.jsdelivr.net/npm/workerboxjs@6.1.1/+esm";
import { Bundler } from "./bundler.js";
import { dispatch } from "./dispatch.js";
import { ConsoleMock } from "./console-mock.js";
import { getFirstStackLine } from "./stack.js";
import { Observable } from "./observable.js";
import { isCodeResult } from "./validation.js";

const bundler = new Bundler();

/**
 * never throws
 * @param {string} userCode
 * @param {string} testMessage
 * @param {string} testCallback
 * @returns {Promise<import("./types").ExecutionOutput>}
 */
export async function runTest(userCode, testMessage, testCallback) {
  const userCodeLines = userCode.split("\n").length;

  let testBundle;

  try {
    testBundle = await bundler.bundle(`
const { runTest } = require("/worker/runner.js");
module.exports = runTest(
  () => {
    const expect = require("/worker/expect.js");
    const logs = (() => {
      const ConsoleCollector = require("/worker/console-collector.js");
      const collector = new ConsoleCollector();
      collector.wrap(console);
      return collector.getLogs();
    })();
    return (${testCallback})();
  }, 
  ${userCodeLines}
);`);
  } catch (err) {
    return {
      message: testMessage,
      result: null,
      console: [],
      err: dispatch(err),
    };
  }

  // fix: user code starting at line 1 because workerbox counts lines
  // from zero (when converting error stack traces)
  const sandboxCode = `
${userCode};
return (${testBundle})();
`;

  const observable = _baseRunCode(testMessage, (run) =>
    Promise.race([
      // revalidate result
      run(sandboxCode).then((result) => {
        if (!isCodeResult(result)) {
          throw {
            name: "InternalError",
            message: "sandbox code returned invalid test result",
          };
        }

        return result;
      }),
      /**
       * @type {Promise<import("./types").CodeResult>}
       */
      (
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                value: null,
                err: {
                  name: "TimeoutError",
                  message: "code execution timed out",
                },
              }),
            4000
          )
        )
      ),
    ])
  );

  return new Promise((resolve) => {
    observable.subscribe((event) => {
      if (event.type === "output") {
        resolve(event.data);
      }
    });
  });
}

/**
 * never throws
 * @param {string} userCode
 * @param {Promise<any>} stopPromise
 */
export function runCode(userCode, stopPromise) {
  const userCodeLines = userCode.split("\n").length;

  // fix: user code starting at line 1 because workerbox counts lines
  // from zero (when converting error stack traces)
  const sandboxCode = `
  ${userCode};
  `;

  return _baseRunCode("user code run", (run) =>
    Promise.race([
      run(sandboxCode).then(
        (value) => {
          if (typeof value !== "string") {
            throw {
              name: "InternalError",
              message: "sandbox code did not return a string",
            };
          }

          return { value, err: null };
        },
        (err) => {
          // 1 - If it is a user error, consider this as a result (an error result)
          const errorHappenedInsideUserCode =
            getFirstStackLine(err?.stack) <= userCodeLines;

          const isUserError = errorHappenedInsideUserCode;

          if (isUserError) {
            return { value: null, err: dispatch(err) };
          }

          // 2 - else (internal error) throw it
          throw dispatch(err);
        }
      ),
      stopPromise.then(() => ({
        value: null,
        err: { name: "InterruptError", message: "code execution interrupted" },
      })),
    ])
  );
}

let running = false;

/**
 * never throws
 * @param {string} message
 * @param {(run: (code: string) => Promise<unknown>) => Promise<import("./types").CodeResult>} initializerCallback
 * @returns
 */
function _baseRunCode(message, initializerCallback) {
  /**
   * @type {Observable<
   *  {type: "output", data: import("./types").ExecutionOutput}
   *  | {type: "console", data: import("./types").ConsoleMessage}
   * >}
   */
  const observable = new Observable();

  if (running) {
    // asynchronously notify, so listeners have a chance to subscribe first
    setTimeout(() => {
      observable.notify({
        type: "output",
        data: {
          message,
          result: null,
          console: [],
          err: {
            name: "AlreadyRunningError",
            message: "code is already running",
          },
        },
      });
    }, 0);
    return observable;
  }
  running = true;

  const mockConsole = new ConsoleMock();

  const scope = {
    console: mockConsole.createMocks(),
  };

  mockConsole.getObservable().subscribe((data) =>
    observable.notify({
      type: "console",
      data,
    })
  );

  // never throws
  const start = async () => {
    const { run, destroy } = await createWorkerBox(); // never throws

    try {
      const start = performance.now();

      const result = await initializerCallback((code) => run(code, scope));

      return {
        message,
        result,
        console: mockConsole.getMessages(),
        performance: performance.now() - start,
        err: null,
      };
    } catch (err) {
      return {
        message,
        result: null,
        console: mockConsole.getMessages(),
        err: dispatch(err),
      };
    } finally {
      destroy();
      running = false;
    }
  };

  start().then((output) =>
    observable.notify({
      type: "output",
      data: output,
    })
  );

  return observable;
}
