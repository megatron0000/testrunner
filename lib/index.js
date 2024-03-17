import * as acorn from "https://cdn.jsdelivr.net/npm/acorn@8.11.3/+esm";

import { runTest } from "./runner.js";

main();

async function main() {
  const rawUserCode = await fetch(
    window.location.origin + "/exercicio.js"
  ).then((x) => x.text());

  const userAST = acorn.parse(rawUserCode, {
    ecmaVersion: "latest",
    sourceType: "script",
    locations: true,
  });

  console.log(userAST);

  // keep only function declarations and variable declarations
  userAST.body = userAST.body.filter(
    (node) =>
      node.type === "FunctionDeclaration" || node.type === "VariableDeclaration"
  );

  const filteredUserCode = filterCodeString(rawUserCode, userAST);

  const rawTestCode = await fetch(window.location.origin + "/testes.js").then(
    (x) => x.text()
  );

  const testAST = acorn.parse(rawTestCode, {
    ecmaVersion: "latest",
    sourceType: "script",
    locations: true,
  });

  testAST.body = testAST.body.filter(
    (node) =>
      node.type === "ExpressionStatement" &&
      node.expression.type === "CallExpression" &&
      node.expression.callee.name === "it" &&
      node.expression.arguments.length === 2 &&
      node.expression.arguments[0].type === "Literal" &&
      node.expression.arguments[1].type === "ArrowFunctionExpression"
  );

  for (const node of testAST.body) {
    const testMessage = rawTestCode.slice(
      node.expression.arguments[0].start,
      node.expression.arguments[0].end
    );
    const testCallback = rawTestCode.slice(
      node.expression.arguments[1].start,
      node.expression.arguments[1].end
    );
    const result = await runTest(filteredUserCode, testMessage, testCallback);
    console.log(result);
    document.body.innerHTML +=
      "\n<pre>" + JSON.stringify(result, null, 2) + "</pre>";
  }
}

function filterCodeString(codeString, filteredAST) {
  let line = 1;
  let column = 0;

  let filteredCode = "";

  filteredAST.body.forEach((node) => {
    while (line < node.loc.start.line) {
      filteredCode += "\n";
      line++;
    }

    while (column < node.loc.start.column) {
      filteredCode += " ";
      column++;
    }

    filteredCode += codeString.slice(node.start, node.end);

    line = node.loc.end.line;
    column = node.loc.end.column;
  });

  return filteredCode;
}
