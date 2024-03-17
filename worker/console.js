const { format } = require("./inspect.js");

class Console {

  mock(console) {
    if (this._backup) {
      throw new Error("already mocked")
    }
    this._backup = {}

    const mocks = this._getMocks()
    Object.keys(console).forEach(key => {
      this._backup[key] = console[key]
      console[key] = mocks[key]
    })
  }

  restore(console) {
    if (!this._backup) {
      throw new Error("not mocked")
    }

    Object.keys(this._backup).forEach(key => {
      console[key] = this._backup[key]
    })

    this._backup = null
  }

  getMessages() {
    return this._messages
  }

  getMockedLogs() {
    return this._mockedLogs
  }

  _backup = null;

  _messages = [];
  _mockedLogs = [];

  _log(...values) {
    this._messages.push({
      type: "stdout",
      message: format(...values)
    })

    this._mockedLogs.push({ args: values })
  }

  _getMocks() {
    return {
      log: this._log.bind(this),
      warn: this._log.bind(this),
      error: this._log.bind(this),
      info: this._log.bind(this),
      debug: this._log.bind(this),
    }
  }
}

module.exports = Console