import createWorkerBox from 'https://cdn.jsdelivr.net/npm/workerboxjs@6.1.1/+esm'
import { Bundler } from './bundler.js';
import { dispatch } from './dispatch.js';


const bundler = new Bundler();


let running = false;

export async function runTest(userCode, testMessage, testCallback) {
  if (running) {
    throw { result: null, err: "A test is already running" }
  }
  running = true

  const userCodeLines = userCode.split('\n').length;

  const testBundle = await bundler.bundle(`
      const test = require("/worker/test.js");
      module.exports = test(
        ${testMessage}, 
        () => {
          const expect = require("/worker/expect.js");
          return (${testCallback})();
        }, 
        ${userCodeLines}
      );`
  );


  const { run, destroy } = await createWorkerBox(); // never rejects

  try {
    const result = await Promise.race([
      // fix: user code starting at line 1 because workerbox counts lines
      // from zero (when converting error stack traces)
      run(`
${userCode};
return ${testBundle}`
      ),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), 10000)),
    ])

    return { result, err: null };
  } catch (err) {
    return { result: null, err: dispatch(err) };
  } finally {
    destroy();
    running = false
  }
}

