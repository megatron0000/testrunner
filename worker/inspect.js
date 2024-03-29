const vendorInspect = require("./vendor/browser-util-inspect@0.2.0.js");

const inspect = (/** @type {any} */ value) => vendorInspect(value, {});

const format = (/** @type {any[]} */ ...values) =>
  values
    .map((val) => {
      let formatted = inspect(val);
      if (typeof val === "string") {
        formatted = formatted.slice(1, -1); // remove ''
      }
      return formatted;
    })
    .join(" ");

module.exports = {
  inspect,
  format,
};
