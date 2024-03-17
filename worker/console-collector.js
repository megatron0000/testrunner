const { format } = require("./inspect.js");

class ConsoleCollector {
  /**
   * @type {Array<{args: any[]}>}
   */
  _mockedLogs = [];

  /**
   * @param {any} console
   */
  wrap(console) {
    const mocks = this._getMocks();
    Object.keys(console).forEach((key) => {
      const original = console[key];
      console[key] = (/** @type {any[]} */ ...values) => {
        // @ts-expect-error: mocks[key] does not recognize that key is subset of keyof mocks
        mocks[key](...values);
        original(format(...values));
      };
    });
  }

  getLogs() {
    return this._mockedLogs;
  }

  _getMocks() {
    return {
      log: this._log.bind(this),
      warn: this._log.bind(this),
      error: this._log.bind(this),
      info: this._log.bind(this),
      debug: this._log.bind(this),
    };
  }

  /**
   * @param {any[]} values
   */
  _log(...values) {
    this._mockedLogs.push({ args: values });
  }
}

module.exports = ConsoleCollector;
