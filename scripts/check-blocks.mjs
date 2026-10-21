import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const origin = new URL(process.argv[2] ?? "http://localhost:3000").origin;
const scratch = mkdtempSync(join(tmpdir(), "mizu-blocks-"));
const run = (command, args) =>
  execFileSync(command, args, {
    cwd: scratch,
    encoding: "utf8",
    stdio: "pipe",
  });
try {
  writeFileSync(
    join(scratch, "package.json"),
    JSON.stringify({
      name: "mizu-block-consumer",
      private: true,
      type: "module",
      dependencies: { react: "^19", "react-dom": "^19", motion: "^13" },
      devDependencies: {
        typescript: "^5",
        "@types/react": "^19",
        "@types/react-dom": "^19",
      },
    }),
  );
  writeFileSync(
    join(scratch, "components.json"),
    JSON.stringify({
      $schema: "https://ui.shadcn.com/schema.json",
      style: "new-york",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "",
        css: "src/styles.css",
        baseColor: "stone",
        cssVariables: true,
      },
      aliases: {
        components: "@/components",
        ui: "@/components/ui",
        utils: "@/lib/utils",
        lib: "@/lib",
        hooks: "@/hooks",
      },
    }),
  );
  writeFileSync(
    join(scratch, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        lib: ["ES2020", "DOM"],
        jsx: "react-jsx",
        module: "ESNext",
        moduleResolution: "Bundler",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        paths: { "@/*": ["./src/*"] },
      },
      include: ["src"],
    }),
  );
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"]);
  const ids = ["settings-block", "file-browser-block", "analytics-block"];
  run("npx", [
    "--yes",
    "shadcn@latest",
    "add",
    "--yes",
    ...ids.map((id) => `${origin}/r/${id}.json`),
  ]);
  for (const name of ["SettingsBlock", "FileBrowserBlock", "AnalyticsBlock"]) {
    const source = readFileSync(
      join(scratch, "src/components/ui/mizu/blocks", `${name}.tsx`),
      "utf8",
    );
    assert(source.includes(`export function ${name}`));
    assert(!source.includes("@/mizu"));
  }
  writeFileSync(
    join(scratch, "src/consumer.tsx"),
    'import {SettingsBlock} from "./components/ui/mizu/blocks/SettingsBlock";\nimport {FileBrowserBlock} from "./components/ui/mizu/blocks/FileBrowserBlock";\nimport {AnalyticsBlock} from "./components/ui/mizu/blocks/AnalyticsBlock";\nexport function Consumer(){return <><SettingsBlock/><FileBrowserBlock/><AnalyticsBlock/></>;}\n',
  );
  run("npx", ["--no-install", "tsc"]);
  assert(
    readFileSync(
      join(scratch, "src/components/ui/mizu/source/forms/DateRangeField.css"),
      "utf8",
    ).includes("mizu-date-range"),
  );
  console.log(
    "Installed all three blocks with the shadcn CLI and type-checked their copied React source, dependency closure and styles.",
  );
} catch (error) {
  console.error(
    error.stderr?.toString() || error.stdout?.toString() || error.message,
  );
  process.exitCode = 1;
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
