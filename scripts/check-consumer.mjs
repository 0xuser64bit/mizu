import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, cpSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";

// A tarball installed outside the repository cannot resolve source aliases or workspace links.
const root = resolve(import.meta.dirname, "..");
const scratch = mkdtempSync(join(tmpdir(), "mizu-consumer-"));
const run = (cmd, args, cwd = scratch) => execFileSync(cmd, args, { cwd, stdio: "pipe", encoding: "utf8" });
try {
  const pack = JSON.parse(run("npm", ["pack", "./packages/mizu", "--pack-destination", scratch, "--json"], root))[0];
  assert(pack.files.some((f) => f.path === "LICENSE"));
  assert(!pack.files.some((f) => f.path.startsWith("node_modules/") || f.path.startsWith("src/app/")));
  cpSync(join(root, "examples/consumer"), scratch, { recursive: true, filter: (p) => !/(node_modules|dist)(\/|$)/.test(p) });
  const manifest = JSON.parse(readFileSync(join(scratch, "package.json"), "utf8"));
  manifest.dependencies["mizu-ui"] = `file:./${pack.filename}`;
  writeFileSync(join(scratch, "package.json"), JSON.stringify(manifest, null, 2));
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"]);
  run("npm", ["run", "build"]);
  writeFileSync(join(scratch, "ssr.mjs"), `import React from 'react';
import { renderToString } from 'react-dom/server';
import { Button, Badge, Tabs, TabsList, TabsTrigger, TabsPanel } from 'mizu-ui';
import assert from 'node:assert/strict';
const html = renderToString(React.createElement(Button, null, 'Installed'));
assert(html.includes('Installed'));
assert(renderToString(React.createElement(Badge, null, 'Live')).includes('Live'));
const tabs = React.createElement(Tabs, { defaultValue: 'a' }, React.createElement(TabsList, { label: 'Settings' }, React.createElement(TabsTrigger, { value: 'a' }, 'A')), React.createElement(TabsPanel, { value: 'a' }, 'Panel'));
assert(renderToString(tabs).includes('tabpanel'));
`);
  run("node", ["ssr.mjs"]);
  console.log(`Packed consumer passed: ${pack.filename}; ${(pack.size / 1024).toFixed(1)} KiB compressed; declarations, Node ESM SSR, fonts/CSS and Vite production build.`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
