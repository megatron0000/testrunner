export class ConsoleMock {
  _messages = [];

  createMocks() {
    return {
      log: this._log.bind(this),
      warn: this._log.bind(this),
      error: this._log.bind(this),
      info: this._log.bind(this),
      debug: this._log.bind(this),
    };
  }

  getMessages() {
    return this._messages;
  }

  _log(...messages) {
    this._messages.push({
      type: "log",
      message: messages.map((message) => message.toString()).join(" "),
    });
  }
}
