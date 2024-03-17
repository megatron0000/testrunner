import { Lock } from "./lock.js";

export class Bundler {
  _id = 0;

  _lock = new Lock();

  /**
   * @returns A function expression which calls
   * `codeString` as a module and returns its `module.exports`
   */
  async bundle(codeString) {
    const release = await this._lock.lock();

    try {
      const url = new URL(import.meta.url).origin;

      // map URL => code
      this.deps = {};
      // map id => URL
      this.ids = { 0: url };

      await this._collectDeps(codeString, url);

      return this._generateCode();
    } finally {
      release();
    }
  }

  /**
   * Look for all occurrences of require("...") in the code string,
   * download the module code and replace with require(id) in the caller
   */
  async _collectDeps(codeString, url) {
    this.deps[url] = "loading";

    let match;

    while (
      (match = codeString.match(/require\(\s*(?:'|")([^)'"]+?)(?:'|")\s*\)/))
    ) {
      const [fullMatch, depName] = match;
      const newId = ++this._id;
      codeString =
        codeString.slice(0, match.index) +
        "require(" +
        newId +
        ")" +
        codeString.slice(match.index + fullMatch.length);

      const depUrl = depName.match(/^https?:\/\//g)
        ? depName
        : new URL(depName, url).href;

      this.ids[newId] = depUrl;

      if (this.deps[depUrl]) {
        // already loaded or is being loaded
        continue;
      }

      const depCode = await fetch(depUrl).then((x) => {
        if (!x.ok) {
          throw new Error("Failed to load " + depUrl + ": " + x.statusText);
        }

        return x.text();
      });

      await this._collectDeps(depCode, depUrl);
    }

    this.deps[url] = codeString;
  }

  _generateCode() {
    return `function() {
  const require = (function(modules, moduleIds) {
    const moduleCache = {};
    const require = (id) => {
      const url = moduleIds[id];
      if (!(url in moduleCache)) {
        moduleCache[url] = modules[url]();
      }
      return moduleCache[url];
    };
    return require;
  })({
      ${Object.keys(this.deps)
        .map((dep) => `"${dep}": ${this._wrapAsModule(this.deps[dep])}`)
        .join(",\n")}
  }, {
      ${Object.keys(this.ids)
        .map((id) => `"${id}": "${this.ids[id]}"`)
        .join(",\n")}
  });
  return require(0);
}`;
  }

  _wrapAsModule(codeString) {
    return `function() {
  const module = {exports: {}};
  const exports = module.exports;
  (function() {
    ${codeString}
  })();
  return module.exports;
}`;
  }
}
