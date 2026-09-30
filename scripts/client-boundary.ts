import ts from "typescript";

/**
 * Whether an example must run in the browser: it calls a hook, or hands a function
 * to JSX. Pasted into a Next.js page without "use client", the first fails to
 * compile and the second fails to render, because a Server Component can't pass
 * functions to Client Components. Functions the example only calls, a date helper
 * or a callback to `Array.from`, stay on the server.
 */
export function needsClient(code: string) {
  const file = ts.createSourceFile(
    "example.tsx",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const isFunction = (node: ts.Node | undefined) =>
    !!node && (ts.isArrowFunction(node) || ts.isFunctionExpression(node));
  const functions = new Set<string>();
  const collect = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node) && node.name)
      functions.add(node.name.text);
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      isFunction(node.initializer)
    )
      functions.add(node.name.text);
    ts.forEachChild(node, collect);
  };
  collect(file);
  // Whether this value is, or holds, a function. A call's arguments are its own:
  // only what it returns reaches JSX.
  const holdsFunction = (node: ts.Expression): boolean => {
    if (isFunction(node)) return true;
    if (ts.isIdentifier(node)) return functions.has(node.text);
    if (
      ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isNonNullExpression(node) ||
      ts.isSatisfiesExpression(node)
    )
      return holdsFunction(node.expression);
    if (ts.isConditionalExpression(node))
      return holdsFunction(node.whenTrue) || holdsFunction(node.whenFalse);
    if (ts.isBinaryExpression(node))
      return holdsFunction(node.left) || holdsFunction(node.right);
    if (ts.isArrayLiteralExpression(node))
      return node.elements.some(
        (e) => !ts.isOmittedExpression(e) && holdsFunction(e),
      );
    if (ts.isObjectLiteralExpression(node))
      return node.properties.some(
        (p) =>
          ts.isPropertyAssignment(p)
            ? holdsFunction(p.initializer)
            : ts.isShorthandPropertyAssignment(p)
              ? functions.has(p.name.text)
              : ts.isSpreadAssignment(p)
                ? holdsFunction(p.expression)
                : true, // methods and accessors are functions
      );
    return false;
  };
  let client = false;
  const visit = (node: ts.Node): void => {
    if (client) return;
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      /^use[A-Z]/.test(node.expression.text)
    )
      client = true;
    else if (
      ts.isJsxExpression(node) &&
      node.expression &&
      holdsFunction(node.expression)
    )
      client = true;
    // A spread of props can carry handlers too.
    else if (ts.isJsxSpreadAttribute(node) && holdsFunction(node.expression))
      client = true;
    else ts.forEachChild(node, visit);
  };
  visit(file);
  return client;
}
