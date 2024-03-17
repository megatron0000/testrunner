/**
 * @template T
 */
export class Observable {
  constructor() {
    /**
     * @type {Array<(data: T) => any>}
     */
    this._observers = [];
  }

  /**
   *
   * @param {(event: T) => any} observer
   */
  subscribe(observer) {
    this._observers.push(observer);
  }

  /**
   *
   * @param {(event: T) => any} observer
   */
  unsubscribe(observer) {
    this._observers = this._observers.filter((obs) => obs !== observer);
  }

  /**
   *
   * @param {T} event
   */
  notify(event) {
    this._observers.forEach((observer) => observer(event));
  }
}
