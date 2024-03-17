import createWorkerBox from "https://cdn.jsdelivr.net/npm/workerboxjs@6.1.1/+esm";
import { Bundler } from "./bundler.js";
import { dispatch } from "./dispatch.js";
import { ConsoleMock } from "./console-mock.js";

const bundler = new Bundler();

let running = false;

export async function runTest(userCode, testMessage, testCallback) {
  if (running) {
    throw { result: null, err: "A test is already running" };
  }
  running = true;

  const userCodeLines = userCode.split("\n").length;

  const mockConsole = new ConsoleMock();

  const scope = {
    console: mockConsole.createMocks(),
  };

  const testBundle = await bundler.bundle(`
      const test = require("/worker/test.js");
      module.exports = test(
        ${testMessage}, 
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

  // fix: user code starting at line 1 because workerbox counts lines
  // from zero (when converting error stack traces)
  const sandboxCode = `
${userCode};
return (${testBundle})();
`;

  const { run, destroy } = await createWorkerBox(); // never rejects

  const start = performance.now();

  try {
    const result = await Promise.race([
      run(sandboxCode, scope),
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              message: testMessage,
              err: {
                name: "TimeoutError",
                message: "code execution timed out",
              },
            }),
          4000
        )
      ),
    ]);

    return {
      result,
      console: mockConsole.getMessages(),
      performance: performance.now() - start,
      err: null,
    };
  } catch (err) {
    return {
      result: null,
      console: mockConsole.getMessages(),
      performance: performance.now() - start,
      err: dispatch(err),
    };
  } finally {
    destroy();
    running = false;
  }
}
