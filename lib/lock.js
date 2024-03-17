export class Lock {
  _promise = Promise.resolve();
  async lock() {
    const currentPromise = this._promise;

    let resolve;
    this._promise = new Promise((res) => {
      resolve = res;
    })

    await currentPromise;

    return resolve;
  }
}