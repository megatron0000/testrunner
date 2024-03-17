import { Observable } from "./observable.js";

export class ConsoleMock {
  /**
   * @type {Array<import("./types").ConsoleMessage>}
   */
  _messages = [];

  /**
   * @type {Observable<import("./types").ConsoleMessage>}
   */
  _observable = new Observable();

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

  getObservable() {
    return this._observable;
  }

  /**
   * @param  {...any} messages
   */
  _log(...messages) {
    const message = messages.map((message) => String(message)).join(" ");

    const data = {
      /**
       * fix `this._messages.push(data)` complains that "data.type" is "string"
       * @type {"log"}
       */
      type: "log",
      message,
    };

    this._messages.push(data);
    this._observable.notify(data);
  }
}
