import { execFileSync, spawn } from "node:child_process";
import {
  mkdtempSync,
  writeFileSync,
  cpSync,
  rmSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";

// A tarball installed outside the repository cannot resolve source aliases or workspace links.
const root = resolve(import.meta.dirname, "..");
const scratch = mkdtempSync(join(tmpdir(), "mizu-consumer-"));
const run = (cmd, args, cwd = scratch) =>
  execFileSync(cmd, args, { cwd, stdio: "pipe", encoding: "utf8" });
try {
  const pack = JSON.parse(
    run(
      "npm",
      ["pack", "./packages/mizu", "--pack-destination", scratch, "--json"],
      root,
    ),
  )[0];
  assert(pack.files.some((f) => f.path === "LICENSE"));
  assert(
    !pack.files.some(
      (f) =>
        f.path.startsWith("node_modules/") || f.path.startsWith("src/app/"),
    ),
  );
  cpSync(join(root, "examples/consumer"), scratch, {
    recursive: true,
    filter: (p) => !/(node_modules|dist)(\/|$)/.test(p),
  });
  const manifest = JSON.parse(
    readFileSync(join(scratch, "package.json"), "utf8"),
  );
  if (process.argv.includes("--react18")) {
    manifest.dependencies.react = "18.3.1";
    manifest.dependencies["react-dom"] = "18.3.1";
    manifest.devDependencies["@types/react"] = "^18";
    manifest.devDependencies["@types/react-dom"] = "^18";
  }
  manifest.dependencies["mizu-ui"] = `file:./${pack.filename}`;
  writeFileSync(
    join(scratch, "package.json"),
    JSON.stringify(manifest, null, 2),
  );
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"]);
  run("npm", ["run", "build"]);
  run("npm", ["ls", "react", "react-dom", "motion", "--json"]);
  const reactVersion = JSON.parse(
    readFileSync(join(scratch, "node_modules/react/package.json"), "utf8"),
  ).version;
  const motionVersion = JSON.parse(
    readFileSync(join(scratch, "node_modules/motion/package.json"), "utf8"),
  ).version;
  console.log(
    `Resolved peers: React ${reactVersion}; Motion ${motionVersion}.`,
  );
  const packedManifest = JSON.parse(
    readFileSync(join(scratch, "node_modules/mizu-ui/package.json"), "utf8"),
  );
  const entrypoints = Object.keys(packedManifest.exports).filter(
    (p) =>
      p !== "." &&
      !p.includes("*") &&
      !p.endsWith(".css") &&
      !p.endsWith(".json"),
  );
  writeFileSync(
    join(scratch, "ssr.mjs"),
    `import React from 'react';
import { renderToString } from 'react-dom/server';
import { Button, Badge, Tabs, TabsList, TabsTrigger, TabsPanel, DataTable, TextField, Sparkline, InlineEdit, Marquee } from 'mizu-ui';
for (const path of ${JSON.stringify(entrypoints)}) assert(Object.keys(await import('mizu-ui' + path.slice(1))).length > 0, path);
import assert from 'node:assert/strict';
const html = renderToString(React.createElement(Button, null, 'Installed'));
assert(html.includes('Installed'));
assert(renderToString(React.createElement(Badge, null, 'Live')).includes('Live'));
const tabs = React.createElement(Tabs, { defaultValue: 'a' }, React.createElement(TabsList, { label: 'Settings' }, React.createElement(TabsTrigger, { value: 'a' }, 'A')), React.createElement(TabsPanel, { value: 'a' }, 'Panel'));
assert(renderToString(tabs).includes('tabpanel'));
assert(renderToString(React.createElement(TextField, {label:'Installed field'})).includes('Installed field'));
assert(renderToString(React.createElement(Sparkline, {label:'Trend',values:[1,2]})).includes('Trend: 1, 2'));
assert(renderToString(React.createElement(DataTable, {label:'Rows',rows:[],getRowId:r=>r.id,columns:[]})).includes('Rows'));
assert(renderToString(React.createElement(InlineEdit, {label:'Name',value:'Draft',onValueChange:()=>{}})).includes('Draft'));
assert(renderToString(React.createElement(Marquee, null, 'Loop')).includes('inert=""'));
const installed = await import('mizu-ui');
assert(Object.keys(installed).length >= 110);
`,
  );
  run("node", ["ssr.mjs"]);
  const index = readFileSync(join(scratch, "index.html"), "utf8");
  const sizes = [];
  for (const entry of ["mizu-ui", "mizu-ui/ui"]) {
    writeFileSync(
      join(scratch, "src/small.tsx"),
      `import React from 'react';import {createRoot} from 'react-dom/client';import {Button} from '${entry}';import 'mizu-ui/styles.css';createRoot(document.getElementById('root')!).render(<Button>Installed</Button>);`,
    );
    writeFileSync(
      join(scratch, "index.html"),
      '<div id="root"></div><script type="module" src="/src/small.tsx"></script>',
    );
    run("npx", ["--no-install", "vite", "build", "--outDir", "small-dist"]);
    const js = readdirSync(join(scratch, "small-dist/assets"))
      .filter((f) => f.endsWith(".js"))
      .map((f) => readFileSync(join(scratch, "small-dist/assets", f), "utf8"))
      .join("");
    assert(
      !/mizu-(command-list|reorder-entry|data-inspector|signal)/.test(js),
      `Unused systems survived tree shaking via ${entry}`,
    );
    assert(
      js.length < 250000,
      `${entry}: Button consumer exceeds 250 kB JS budget`,
    );
    assert(
      !readdirSync(join(scratch, "small-dist/assets")).some((f) =>
        /\.woff2?$/.test(f),
      ),
      "Optional fonts leaked into the styles-only build",
    );
    const css = readdirSync(join(scratch, "small-dist/assets"))
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(join(scratch, "small-dist/assets", f), "utf8"))
      .join("");
    assert(
      css.includes("--mizu-ink") && css.includes(".mizu-btn--solid"),
      "styles.css did not resolve its imported stylesheets",
    );
    sizes.push(
      `${entry}: ${(Buffer.byteLength(js) / 1024).toFixed(1)} KiB JS / ${(gzipSync(js).length / 1024).toFixed(1)} KiB gzip including React`,
    );
  }
  writeFileSync(join(scratch, "index.html"), index);
  console.log(`Tree shaking passed — ${sizes.join("; ")}.`);
  console.log(
    `Packed consumer passed: ${pack.filename}; ${(pack.size / 1024).toFixed(1)} KiB compressed; declarations, all 14 family exports, Node ESM SSR, fonts/CSS and Vite production build.`,
  );
  if (process.argv.includes("--serve")) {
    console.log("Packed workshop preview: http://localhost:3102");
    await new Promise((resolve) => {
      const server = spawn(
        "npx",
        [
          "--no-install",
          "vite",
          "preview",
          "--host",
          "127.0.0.1",
          "--port",
          "3102",
          "--strictPort",
        ],
        { cwd: scratch, stdio: "inherit" },
      );
      server.once("exit", resolve);
      process.once("SIGINT", () => server.kill("SIGTERM"));
      process.once("SIGTERM", () => server.kill("SIGTERM"));
    });
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
