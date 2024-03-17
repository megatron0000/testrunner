const { format } = require("./inspect.js");

class ConsoleCollector {
  wrap(console) {
    this._mockedLogs = [];

    const mocks = this._getMocks();
    Object.keys(console).forEach((key) => {
      const original = console[key];
      console[key] = (...values) => {
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

  _log(...values) {
    this._mockedLogs.push({ args: values });
  }
}

module.exports = ConsoleCollector;
